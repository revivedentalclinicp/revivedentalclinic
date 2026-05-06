const nodemailer = require('nodemailer');

// ── Transporter (Brevo SMTP) ──────────────────────────────────────
const transporter = nodemailer.createTransport({
  host: 'smtp-relay.brevo.com',
  port: 587,
  secure: false,  // STARTTLS on 587
  auth: {
    user: process.env.EMAIL_USER,  // Brevo SMTP login  (e.g. a89e3e001@smtp-brevo.com)
    pass: process.env.EMAIL_PASS,  // Brevo SMTP key    (xsmtpsib-...)
  },
  tls: { rejectUnauthorized: false },
});

// ── Boot-time SMTP Verification ───────────────────────────────────
transporter.verify(function (error) {
  if (error) {
    console.error('❌ SMTP ERROR on boot:', error.message);
    console.error('   ➜ Check EMAIL_USER + EMAIL_PASS in backend/.env');
    console.error('   ➜ EMAIL_USER must be the Brevo SMTP login (app.brevo.com → SMTP & API)');
    console.error('   ➜ EMAIL_FROM must be verified at app.brevo.com → Senders & Domains');
  } else {
    const senderFrom = process.env.EMAIL_FROM || process.env.EMAIL_USER;
    console.log('✅ SMTP READY — Brevo connected successfully');
    console.log(`   ➜ SMTP Auth : ${process.env.EMAIL_USER}`);
    console.log(`   ➜ Sender    : ${senderFrom}`);
    if (!process.env.EMAIL_FROM) {
      console.warn('   ⚠️  TIP: Set EMAIL_FROM=yourverifiedemail@gmail.com in .env');
      console.warn('           Verified sender emails have better inbox delivery rates');
    }
  }
});

// ── sendEmail() ───────────────────────────────────────────────────
/**
 * Sends an HTML email via Brevo SMTP.
 * - Never throws — always returns true/false so callers never crash.
 * - EMAIL_FROM (verified sender) is used in the "from" field.
 * - Falls back to EMAIL_USER if EMAIL_FROM is not set.
 *
 * @param {string} to      - Recipient email address
 * @param {string} subject - Subject line
 * @param {string} html    - HTML body
 * @returns {Promise<boolean>}
 */
async function sendEmail({ to, subject, html }) {
  // ── Guard: credentials ───────────────────────────────────────────
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.warn('⚠️  EMAIL SKIPPED: EMAIL_USER or EMAIL_PASS missing in .env');
    return false;
  }

  // ── Guard: recipient ─────────────────────────────────────────────
  if (!to) {
    console.warn('⚠️  EMAIL SKIPPED: No recipient (to) provided');
    return false;
  }

  const senderAddress = process.env.EMAIL_FROM || process.env.EMAIL_USER;

  console.log(`📧 EMAIL TRIGGERED → To: ${to} | Subject: "${subject}"`);

  try {
    const info = await transporter.sendMail({
      from:    `"Revive Dental Clinic" <${senderAddress}>`,
      to,
      subject,
      html,
    });

    console.log(`✅ EMAIL SENT → MessageId: ${info.messageId} | To: ${to}`);
    return true;
  } catch (err) {
    console.error(`❌ EMAIL FAILED → To: ${to} | Subject: "${subject}"`);
    console.error(`   Error   : ${err.message}`);
    if (err.responseCode) {
      console.error(`   SMTP Code: ${err.responseCode}`);
      console.error(`   (535 = bad credentials | 550 = unverified sender | 421 = rate limit)`);
    }
    return false;
  }
}

module.exports = { sendEmail };
