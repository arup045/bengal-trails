const nodemailer = require('nodemailer');

// Create reusable transporter
function getTransporter() {
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER) {
    return null; // Not configured
  }

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_PORT === '465',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

// ── Send password reset email ─────────────────────────────────────────────────
async function sendPasswordResetEmail(email, token) {
  const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/#/reset-password?token=${token}`;

  const transporter = getTransporter();
  if (!transporter) {
    // Log to console in dev if SMTP not configured
    console.log(`\n📧 PASSWORD RESET (no SMTP configured)`);
    console.log(`   To: ${email}`);
    console.log(`   Reset URL: ${resetUrl}\n`);
    return { success: true, preview: resetUrl };
  }

  await transporter.sendMail({
    from: process.env.EMAIL_FROM || `"Bengal Trails Travel" <noreply@bengaltrails.com>`,
    to: email,
    subject: 'Reset your Bengal Trails password',
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px">
        <h2 style="color:#1a1a1a">Reset your password</h2>
        <p style="color:#555">Click the button below to reset your Bengal Trails password. This link expires in 1 hour.</p>
        <a href="${resetUrl}"
           style="display:inline-block;background:#e85d24;color:#fff;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:600;margin:16px 0">
          Reset Password
        </a>
        <p style="color:#999;font-size:13px">If you didn't request this, you can safely ignore this email.</p>
        <p style="color:#ccc;font-size:12px">Or copy this link: ${resetUrl}</p>
      </div>
    `,
  });

  return { success: true };
}

// ── Send welcome email ────────────────────────────────────────────────────────
async function sendWelcomeEmail(email, name) {
  const transporter = getTransporter();
  if (!transporter) {
    console.log(`📧 WELCOME EMAIL (no SMTP): To: ${email}, Name: ${name}`);
    return { success: true };
  }

  await transporter.sendMail({
    from: process.env.EMAIL_FROM || `"Bengal Trails Travel" <noreply@bengaltrails.com>`,
    to: email,
    subject: `Welcome to Bengal Trails, ${name}! 🌿`,
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px">
        <h2 style="color:#1a1a1a">Welcome to Bengal Trails, ${name}!</h2>
        <p style="color:#555">You're now part of West Bengal's premier travel community.</p>
        <p style="color:#555">Start exploring 197+ amazing destinations across the state.</p>
        <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/#/explore"
           style="display:inline-block;background:#e85d24;color:#fff;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:600;margin:16px 0">
          Explore Destinations
        </a>
      </div>
    `,
  });

  return { success: true };
}

// ── Send newsletter ───────────────────────────────────────────────────────────
async function sendNewsletterEmail(subscribers, subject, body) {
  const transporter = getTransporter();
  if (!transporter) {
    console.log(`📧 NEWSLETTER (no SMTP): Would send to ${subscribers.length} subscribers`);
    return { success: true, sent: subscribers.length };
  }

  let sent = 0;
  for (const email of subscribers) {
    try {
      await transporter.sendMail({
        from: process.env.EMAIL_FROM || `"Bengal Trails Travel" <noreply@bengaltrails.com>`,
        to: email,
        subject,
        html: `
          <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#f9f6f2;padding:0">
            <div style="background:linear-gradient(135deg,#7c3aed,#9333ea);padding:24px;text-align:center">
              <h1 style="color:#fff;margin:0;font-size:28px;letter-spacing:1px">Bengal Trails</h1>
              <p style="color:#e9d5ff;margin:6px 0 0;font-size:13px">Discover West Bengal</p>
            </div>
            <div style="background:#fff;padding:32px 28px;line-height:1.6;color:#1a1a1a">
              ${body}
            </div>
            <div style="padding:20px;text-align:center;color:#888;font-size:12px">
              <p>You received this because you subscribed to the Bengal Trails newsletter.</p>
              <p style="margin-top:6px"><a href="${process.env.FRONTEND_URL || '#'}" style="color:#7c3aed">Visit Bengal Trails</a></p>
            </div>
          </div>
        `,
      });
      sent++;
    } catch (err) {
      console.error(`Failed to send to ${email}:`, err.message);
    }
  }

  return { success: true, sent };
}

// P1-29: double opt-in confirmation for newsletter subscribers.
// Called by /newsletter/subscribe. Raw token goes in the email link; DB only
// stores its SHA-256 hash so a DB leak doesn't enable confirmation hijacking.
async function sendNewsletterConfirmEmail(email, rawToken, name) {
  const transporter = getTransporter();
  if (!transporter) {
    console.log(`[email] newsletter confirm for ${email}: ${rawToken} (no SMTP configured)`);
    return { success: true, dev: true };
  }
  const link = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/#/newsletter-confirm?token=${encodeURIComponent(rawToken)}`;
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM || `"Bengal Trails" <noreply@bengaltrails.com>`,
      to: email,
      subject: 'Confirm your Bengal Trails newsletter subscription',
      html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#f9f6f2;padding:0">
          <div style="background:linear-gradient(135deg,#7c3aed,#9333ea);padding:24px;text-align:center">
            <h1 style="color:#fff;margin:0;font-size:28px;letter-spacing:1px">Bengal Trails</h1>
            <p style="color:#e9d5ff;margin:6px 0 0;font-size:13px">Discover West Bengal</p>
          </div>
          <div style="background:#fff;padding:32px 28px;line-height:1.6;color:#1a1a1a">
            <p>Hi${name ? ' ' + name : ''},</p>
            <p>Click the button below to confirm your subscription to the Bengal Trails newsletter.</p>
            <p style="text-align:center;margin:24px 0">
              <a href="${link}" style="display:inline-block;background:#7c3aed;color:#fff;padding:12px 28px;border-radius:9999px;text-decoration:none;font-weight:600">
                Confirm subscription
              </a>
            </p>
            <p style="color:#666;font-size:13px">If you didn't request this, you can ignore this email — no subscription will be created.</p>
            <p style="color:#666;font-size:12px;word-break:break-all">Or paste this link in your browser: ${link}</p>
          </div>
        </div>
      `,
    });
    return { success: true };
  } catch (err) {
    console.error('newsletter confirm email failed:', err.message);
    return { success: false, error: err.message };
  }
}

// ── Send booking confirmation email ───────────────────────────────────────────
// `booking` = { bookingId, destinationName, checkIn, checkOut, total, guests }
async function sendBookingConfirmationEmail(email, name, booking) {
  const b = booking || {};
  const fmt = (d) => (d ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—');
  const amount = b.total != null ? `₹${Number(b.total).toLocaleString('en-IN')}` : '—';
  const bookingsUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/profile`;

  const transporter = getTransporter();
  if (!transporter) {
    console.log(`📧 BOOKING CONFIRMATION (no SMTP): To: ${email}, Booking: ${b.bookingId}, ${b.destinationName}, ${amount}`);
    return { success: true, dev: true };
  }

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM || `"Bengal Trails Travel" <noreply@bengaltrails.com>`,
      to: email,
      subject: `Booking confirmed — ${b.destinationName || 'your Bengal trip'} ✅`,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#f9f6f2">
          <div style="background:linear-gradient(135deg,#7c3aed,#9333ea);padding:24px;text-align:center">
            <h1 style="color:#fff;margin:0;font-size:26px;letter-spacing:1px">Bengal Trails</h1>
            <p style="color:#e9d5ff;margin:6px 0 0;font-size:13px">Booking Confirmed</p>
          </div>
          <div style="background:#fff;padding:32px 28px;line-height:1.6;color:#1a1a1a">
            <p>Hi${name ? ' ' + name : ''},</p>
            <p>Your booking is confirmed — we can't wait to welcome you to West Bengal! 🌿</p>
            <table style="width:100%;border-collapse:collapse;margin:20px 0;font-size:14px">
              <tr><td style="padding:8px 0;color:#888">Booking ID</td><td style="padding:8px 0;text-align:right;font-weight:600">${b.bookingId || '—'}</td></tr>
              <tr><td style="padding:8px 0;color:#888">Destination</td><td style="padding:8px 0;text-align:right;font-weight:600">${b.destinationName || '—'}</td></tr>
              <tr><td style="padding:8px 0;color:#888">Check-in</td><td style="padding:8px 0;text-align:right;font-weight:600">${fmt(b.checkIn)}</td></tr>
              <tr><td style="padding:8px 0;color:#888">Check-out</td><td style="padding:8px 0;text-align:right;font-weight:600">${fmt(b.checkOut)}</td></tr>
              ${b.guests ? `<tr><td style="padding:8px 0;color:#888">Guests</td><td style="padding:8px 0;text-align:right;font-weight:600">${b.guests}</td></tr>` : ''}
              <tr><td style="padding:12px 0 0;color:#888;border-top:1px solid #eee">Total paid</td><td style="padding:12px 0 0;text-align:right;font-weight:700;color:#7c3aed;border-top:1px solid #eee">${amount}</td></tr>
            </table>
            <p style="text-align:center;margin:24px 0">
              <a href="${bookingsUrl}" style="display:inline-block;background:#e85d24;color:#fff;padding:12px 28px;border-radius:9999px;text-decoration:none;font-weight:600">
                View my bookings
              </a>
            </p>
            <p style="color:#666;font-size:13px">Need to make changes? Just reply to this email and our team will help.</p>
          </div>
          <div style="padding:18px;text-align:center;color:#aaa;font-size:12px">© Bengal Trails — Discover West Bengal</div>
        </div>
      `,
    });
    return { success: true };
  } catch (err) {
    console.error('booking confirmation email failed:', err.message);
    return { success: false, error: err.message };
  }
}

// ── Send email-verification link ──────────────────────────────────────────────
async function sendVerificationEmail(email, rawToken, name) {
  const link = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/verify-email?token=${encodeURIComponent(rawToken)}`;
  const transporter = getTransporter();
  if (!transporter) {
    console.log(`\n📧 EMAIL VERIFICATION (no SMTP configured)\n   To: ${email}\n   Verify URL: ${link}\n`);
    return { success: true, dev: true, preview: link };
  }
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM || `"Bengal Trails Travel" <noreply@bengaltrails.com>`,
      to: email,
      subject: 'Verify your Bengal Trails email',
      html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#f9f6f2">
          <div style="background:linear-gradient(135deg,#7c3aed,#9333ea);padding:24px;text-align:center">
            <h1 style="color:#fff;margin:0;font-size:26px;letter-spacing:1px">Bengal Trails</h1>
            <p style="color:#e9d5ff;margin:6px 0 0;font-size:13px">Verify your email</p>
          </div>
          <div style="background:#fff;padding:32px 28px;line-height:1.6;color:#1a1a1a">
            <p>Hi${name ? ' ' + name : ''},</p>
            <p>Please confirm your email address to secure your Bengal Trails account.</p>
            <p style="text-align:center;margin:24px 0">
              <a href="${link}" style="display:inline-block;background:#7c3aed;color:#fff;padding:12px 28px;border-radius:9999px;text-decoration:none;font-weight:600">Verify email</a>
            </p>
            <p style="color:#666;font-size:13px">This link expires in 24 hours. If you didn't sign up, you can ignore this email.</p>
            <p style="color:#666;font-size:12px;word-break:break-all">Or paste this link: ${link}</p>
          </div>
        </div>
      `,
    });
    return { success: true };
  } catch (err) {
    console.error('verification email failed:', err.message);
    return { success: false, error: err.message };
  }
}

module.exports = { sendPasswordResetEmail, sendWelcomeEmail, sendNewsletterEmail, sendNewsletterConfirmEmail, sendBookingConfirmationEmail, sendVerificationEmail };
