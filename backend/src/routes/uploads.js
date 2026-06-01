const router = require('express').Router();
const multer = require('multer');
const { authenticate } = require('../middleware/auth');
const { limiters } = require('../middleware/rateLimit');

// Multer in-memory storage (no disk writes).
// SECURITY (P1-31): `file.mimetype` is client-supplied and not trustworthy.
// We accept it as a first-cut filter, then ALSO verify the file's magic
// bytes after upload (see verifyImageMagicBytes below). Cloudinary will
// independently reject non-images, but defense in depth.
const ALLOWED_IMAGE_MIMES = new Set([
  'image/jpeg', 'image/jpg', 'image/png', 'image/gif',
  'image/webp', 'image/avif',
]);
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
  fileFilter: (req, file, cb) => {
    if (ALLOWED_IMAGE_MIMES.has(file.mimetype)) cb(null, true);
    else cb(new Error('Only JPEG, PNG, GIF, WebP, or AVIF images allowed'));
  },
});

/**
 * Magic-byte check — verifies the file actually IS an image regardless of
 * what the client claimed its mimetype is. Returns true if signature matches
 * one of our allowed image formats.
 */
function verifyImageMagicBytes(buf) {
  if (!buf || buf.length < 12) return false;
  const b = buf;
  // JPEG: FF D8 FF
  if (b[0] === 0xFF && b[1] === 0xD8 && b[2] === 0xFF) return true;
  // PNG: 89 50 4E 47 0D 0A 1A 0A
  if (b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4E && b[3] === 0x47) return true;
  // GIF: 47 49 46 38 (37|39) 61
  if (b[0] === 0x47 && b[1] === 0x49 && b[2] === 0x46 && b[3] === 0x38) return true;
  // WebP: RIFF....WEBP
  if (b[0] === 0x52 && b[1] === 0x49 && b[2] === 0x46 && b[3] === 0x46
   && b[8] === 0x57 && b[9] === 0x45 && b[10] === 0x42 && b[11] === 0x50) return true;
  // AVIF: ftypavif at offset 4
  if (b[4] === 0x66 && b[5] === 0x74 && b[6] === 0x79 && b[7] === 0x70
   && b[8] === 0x61 && b[9] === 0x76 && b[10] === 0x69 && b[11] === 0x66) return true;
  return false;
}

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
function uploadToCloudinary(buffer, folder = 'bengal-trails') {
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

/**
 * Per-user folder path. Ignores any client-supplied `folder` value
 * (P1-25 — client could otherwise write to arbitrary Cloudinary folders).
 */
function userFolder(req) {
  return `bengal-trails/${req.user.id}`;
}

// ── POST /uploads/image ────────────────────────────────────────────────────────
// Single image upload — returns { url, publicId }
router.post('/image', authenticate, limiters.upload, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

    // SECURITY (P1-31): magic-byte check defeats client-spoofed mimetypes.
    if (!verifyImageMagicBytes(req.file.buffer)) {
      return res.status(400).json({ error: 'Uploaded file is not a valid image.' });
    }

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

    const result = await uploadToCloudinary(req.file.buffer, userFolder(req));

    return res.json({
      url: result.secure_url,
      publicId: result.public_id,
      width: result.width,
      height: result.height,
    });
  } catch (err) {
    console.error('upload error:', err);
    return res.status(500).json({ error: 'Upload failed' });
  }
});

// ── POST /uploads/multiple ────────────────────────────────────────────────────
router.post('/multiple', authenticate, limiters.upload, upload.array('images', 8), async (req, res) => {
  try {
    if (!req.files?.length) return res.status(400).json({ error: 'No files uploaded' });

    // Validate every file BEFORE uploading any of them — atomic-ish behavior.
    for (const file of req.files) {
      if (!verifyImageMagicBytes(file.buffer)) {
        return res.status(400).json({ error: 'One or more files is not a valid image.' });
      }
    }

    const cld = getCloudinary();
    const folder = userFolder(req);
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
    console.error('multiple upload error:', err);
    return res.status(500).json({ error: 'Upload failed' });
  }
});

// ── DELETE /uploads/:publicId ─────────────────────────────────────────────────
// SECURITY (P0-10): Without an ownership check, ANY authenticated user could
// delete any image on Cloudinary by guessing public IDs. We restrict deletes
// to either:
//   - admins (can delete anything), or
//   - the original uploader (publicId must live under bengal-trails/{userId}/)
// Upload routes prefix every public_id with `bengal-trails/${req.user.id}` so
// this scheme is enforceable from both ends.
router.delete('/:publicId', authenticate, async (req, res) => {
  try {
    const publicId = decodeURIComponent(req.params.publicId);

    const isAdmin = req.user?.role === 'admin';
    const ownerPrefix = `bengal-trails/${req.user.id}`;
    const isOwner = publicId === ownerPrefix
      || publicId.startsWith(`${ownerPrefix}/`);

    if (!isAdmin && !isOwner) {
      return res.status(403).json({ error: 'You can only delete your own uploads' });
    }

    const cld = getCloudinary();
    if (!cld) return res.json({ success: true, dev: true });
    await cld.uploader.destroy(publicId);
    return res.json({ success: true });
  } catch (err) {
    console.error('delete upload error:', err);
    return res.status(500).json({ error: 'Delete failed' });
  }
});

module.exports = router;
