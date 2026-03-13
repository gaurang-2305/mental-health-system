const nodemailer = require('nodemailer');
const logger     = require('../utils/index');

// ─── Transporter — configured from .env ──────────────────────────────────────
function createTransporter() {
  if (process.env.EMAIL_HOST) {
    // SMTP (production)
    return nodemailer.createTransporter({
      host:   process.env.EMAIL_HOST,
      port:   Number(process.env.EMAIL_PORT) || 587,
      secure: process.env.EMAIL_SECURE === 'true',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }

  // Gmail shorthand
  if (process.env.GMAIL_USER) {
    return nodemailer.createTransporter({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS,
      },
    });
  }

  // Ethereal (dev fallback — logs preview URL to console)
  return null;
}

let transporter = createTransporter();

async function getTransporter() {
  if (transporter) return transporter;
  // Create a one-time ethereal test account for development
  const testAccount = await nodemailer.createTestAccount();
  transporter = nodemailer.createTransporter({
    host:   'smtp.ethereal.email',
    port:   587,
    secure: false,
    auth: { user: testAccount.user, pass: testAccount.pass },
  });
  logger.info(`Ethereal email account: ${testAccount.user}`);
  return transporter;
}

// ─── Core send function ───────────────────────────────────────────────────────
async function sendEmail({ to, subject, html, text }) {
  try {
    const t    = await getTransporter();
    const info = await t.sendMail({
      from:    process.env.EMAIL_FROM || '"MindCare" <noreply@mindcare.edu>',
      to,
      subject,
      html,
      text,
    });

    const previewUrl = nodemailer.getTestMessageUrl(info);
    if (previewUrl) logger.info(`Email preview: ${previewUrl}`);

    return { success: true, messageId: info.messageId };
  } catch (err) {
    logger.error(`sendEmail failed to ${to}: ${err.message}`);
    return { success: false, error: err.message };
  }
}

// ─── Email templates ──────────────────────────────────────────────────────────

async function sendWelcomeEmail(email, fullName) {
  return sendEmail({
    to:      email,
    subject: 'Welcome to MindCare 🌱',
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
        <h2 style="color:#4f8ef7;">Welcome to MindCare, ${fullName}!</h2>
        <p>We're glad you're here. MindCare is your safe space to track your mental wellness, connect with counselors, and access resources whenever you need them.</p>
        <p><strong>Getting started:</strong></p>
        <ul>
          <li>Complete your first mental health survey</li>
          <li>Log your mood daily</li>
          <li>Explore coping recommendations</li>
          <li>Book an appointment with a counselor if needed</li>
        </ul>
        <p>Remember: asking for help is a sign of strength.</p>
        <p style="color:#94a3b8;font-size:12px;">If you need immediate support, please contact a crisis helpline or emergency services.</p>
      </div>`,
    text: `Welcome to MindCare, ${fullName}! Log in to start tracking your mental wellness.`,
  });
}

async function sendCrisisAlertEmail(counselorEmail, counselorName, studentName, riskLevel, triggerReason) {
  return sendEmail({
    to:      counselorEmail,
    subject: `⚠ Crisis Alert — ${riskLevel.toUpperCase()} — ${studentName}`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;border-left:4px solid #ef4444;padding-left:16px;">
        <h2 style="color:#ef4444;">Crisis Alert — ${riskLevel.toUpperCase()}</h2>
        <p>Dear ${counselorName},</p>
        <p>A crisis alert has been raised for student <strong>${studentName}</strong>.</p>
        <p><strong>Risk level:</strong> ${riskLevel}</p>
        <p><strong>Trigger:</strong> ${triggerReason}</p>
        <p>Please log in to MindCare and review this student's profile immediately.</p>
        <p style="color:#94a3b8;font-size:12px;">This is an automated alert from the MindCare system.</p>
      </div>`,
    text: `Crisis Alert (${riskLevel}): Student ${studentName} needs immediate attention. Reason: ${triggerReason}`,
  });
}

async function sendAppointmentConfirmationEmail(email, name, counselorName, scheduledAt) {
  const dateStr = new Date(scheduledAt).toLocaleString('en-IN', { dateStyle: 'full', timeStyle: 'short' });
  return sendEmail({
    to:      email,
    subject: 'Appointment Confirmed — MindCare',
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
        <h2 style="color:#4f8ef7;">Appointment Confirmed</h2>
        <p>Hi ${name},</p>
        <p>Your appointment with <strong>${counselorName}</strong> has been confirmed.</p>
        <p><strong>Date & Time:</strong> ${dateStr}</p>
        <p>If you need to reschedule or cancel, please do so at least 24 hours in advance through the MindCare app.</p>
      </div>`,
    text: `Your appointment with ${counselorName} is confirmed for ${dateStr}.`,
  });
}

async function sendPasswordResetEmail(email, resetLink) {
  return sendEmail({
    to:      email,
    subject: 'Reset Your MindCare Password',
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
        <h2 style="color:#4f8ef7;">Password Reset Request</h2>
        <p>Click the button below to reset your password. This link expires in 1 hour.</p>
        <a href="${resetLink}" style="display:inline-block;background:#4f8ef7;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;margin:16px 0;">Reset Password</a>
        <p>If you didn't request this, you can safely ignore this email.</p>
      </div>`,
    text: `Reset your MindCare password: ${resetLink}`,
  });
}

module.exports = {
  sendEmail,
  sendWelcomeEmail,
  sendCrisisAlertEmail,
  sendAppointmentConfirmationEmail,
  sendPasswordResetEmail,
};