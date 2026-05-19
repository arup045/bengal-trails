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

module.exports = { sendPasswordResetEmail, sendWelcomeEmail, sendNewsletterEmail, sendNewsletterConfirmEmail };
