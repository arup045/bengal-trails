const router = require('express').Router();
const crypto = require('crypto');
const pool = require('../db/pool');
const { authenticate } = require('../middleware/auth');

// Lazy load Razorpay
let razorpay = null;
function getRazorpay() {
  if (!razorpay) {
    if (!process.env.RAZORPAY_KEY_ID) return null;
    const Razorpay = require('razorpay');
    razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
  }
  return razorpay;
}

// ── POST /payments/create-order ────────────────────────────────────────────────
// Creates a Razorpay order — frontend uses returned order_id to open checkout
router.post('/create-order', authenticate, async (req, res) => {
  try {
    const { amount, bookingId, currency = 'INR' } = req.body;
    if (!amount) return res.status(400).json({ error: 'amount required' });

    const rzp = getRazorpay();
    if (!rzp) {
      // Dev mode — fake the order so frontend can still test the flow
      return res.json({
        order: {
          id: `order_dev_${Date.now()}`,
          amount: amount * 100,
          currency,
          status: 'created',
          dev_mode: true,
        },
        keyId: 'dev_mode_no_real_payment',
        warning: 'Razorpay not configured. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in .env',
      });
    }

    const order = await rzp.orders.create({
      amount: Math.round(amount * 100), // Razorpay wants paise
      currency,
      receipt: bookingId || `bkg_${Date.now()}`,
      notes: { userId: req.user.id, bookingId: bookingId || '' },
    });

    return res.json({ order, keyId: process.env.RAZORPAY_KEY_ID });
  } catch (err) {
    console.error('create-order error:', err);
    return res.status(500).json({ error: err.message || 'Server error' });
  }
});

// ── POST /payments/verify ──────────────────────────────────────────────────────
// Verify payment after user completes checkout
router.post('/verify', authenticate, async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, bookingId } = req.body;

    // Dev mode — accept anything
    if (!process.env.RAZORPAY_KEY_SECRET) {
      if (bookingId) {
        await pool.query(
          "UPDATE bookings SET status = 'confirmed' WHERE booking_id = $1 AND user_id = $2",
          [bookingId, req.user.id]
        );
      }
      return res.json({ success: true, dev_mode: true });
    }

    // Verify HMAC signature
    const body = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expected = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest('hex');

    if (expected !== razorpay_signature) {
      return res.status(400).json({ error: 'Invalid payment signature' });
    }

    // Mark booking as confirmed/paid
    if (bookingId) {
      await pool.query(
        `UPDATE bookings SET status = 'confirmed' WHERE booking_id = $1 AND user_id = $2`,
        [bookingId, req.user.id]
      );
    }

    return res.json({ success: true, paymentId: razorpay_payment_id });
  } catch (err) {
    console.error('verify error:', err);
    return res.status(500).json({ error: 'Verification failed' });
  }
});

// ── GET /payments/key ──────────────────────────────────────────────────────────
// Frontend fetches the public key (not the secret) to initialize Razorpay checkout
router.get('/key', (req, res) => {
  res.json({
    keyId: process.env.RAZORPAY_KEY_ID || 'dev_mode',
    devMode: !process.env.RAZORPAY_KEY_ID,
  });
});

module.exports = router;
