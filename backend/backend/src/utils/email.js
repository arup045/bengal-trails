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

module.exports = { sendPasswordResetEmail, sendWelcomeEmail, sendNewsletterEmail };
