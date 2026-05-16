const router = require('express').Router();
const multer = require('multer');
const { authenticate } = require('../middleware/auth');
const { limiters } = require('../middleware/rateLimit');

// Multer in-memory storage (no disk writes)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('Only image files allowed'));
  },
});

// Lazy load cloudinary to avoid crashing if not configured
let cloudinary = null;
function getCloudinary() {
  if (!cloudinary) {
    if (!process.env.CLOUDINARY_CLOUD_NAME) return null;
    cloudinary = require('cloudinary').v2;
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
  }
  return cloudinary;
}

// Upload to cloudinary
function uploadToCloudinary(buffer, folder = 'gobro') {
  return new Promise((resolve, reject) => {
    const cld = getCloudinary();
    if (!cld) return reject(new Error('Cloudinary not configured'));
    const stream = cld.uploader.upload_stream(
      { folder, resource_type: 'image', transformation: [{ quality: 'auto', fetch_format: 'auto' }] },
      (err, result) => err ? reject(err) : resolve(result)
    );
    stream.end(buffer);
  });
}

// ── POST /uploads/image ────────────────────────────────────────────────────────
// Single image upload — returns { url, publicId }
router.post('/image', authenticate, limiters.upload, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

    const cld = getCloudinary();
    if (!cld) {
      // Dev fallback — return base64 data URL (works but not for production)
      const b64 = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
      return res.json({
        url: b64,
        publicId: `dev_${Date.now()}`,
        warning: 'Cloudinary not configured. Configure CLOUDINARY_* env vars for real uploads.',
      });
    }

    const folder = req.body.folder || `gobro/${req.user.id}`;
    const result = await uploadToCloudinary(req.file.buffer, folder);

    return res.json({
      url: result.secure_url,
      publicId: result.public_id,
      width: result.width,
      height: result.height,
    });
  } catch (err) {
    console.error('upload error:', err);
    return res.status(500).json({ error: err.message || 'Upload failed' });
  }
});

// ── POST /uploads/multiple ────────────────────────────────────────────────────
router.post('/multiple', authenticate, limiters.upload, upload.array('images', 8), async (req, res) => {
  try {
    if (!req.files?.length) return res.status(400).json({ error: 'No files uploaded' });

    const cld = getCloudinary();
    const folder = req.body.folder || `gobro/${req.user.id}`;
    const urls = [];

    for (const file of req.files) {
      if (cld) {
        const result = await uploadToCloudinary(file.buffer, folder);
        urls.push({ url: result.secure_url, publicId: result.public_id });
      } else {
        // Dev fallback
        const b64 = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
        urls.push({ url: b64, publicId: `dev_${Date.now()}_${urls.length}` });
      }
    }

    return res.json({ uploads: urls });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// ── DELETE /uploads/:publicId ─────────────────────────────────────────────────
router.delete('/:publicId', authenticate, async (req, res) => {
  try {
    const cld = getCloudinary();
    if (!cld) return res.json({ success: true, dev: true });
    const publicId = decodeURIComponent(req.params.publicId);
    await cld.uploader.destroy(publicId);
    return res.json({ success: true });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

module.exports = router;
