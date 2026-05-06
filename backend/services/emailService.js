const nodemailer = require('nodemailer');

// ── Transporter (Brevo SMTP) ──────────────────────────────────────
// Added explicit timeouts to prevent hanging on hosted platforms (Render, Railway, etc.)
const transporter = nodemailer.createTransport({
  host: 'smtp-relay.brevo.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,  // Brevo SMTP login  (a89e3e001@smtp-brevo.com)
    pass: process.env.EMAIL_PASS,  // Brevo SMTP key    (xsmtpsib-...)
  },
  tls: { rejectUnauthorized: false },
  connectionTimeout: 10000,   // 10s — max time to establish TCP connection
  greetingTimeout:   10000,   // 10s — max time for SMTP greeting
  socketTimeout:     15000,   // 15s — max time for individual socket operations
});

// ── Boot Verification ─────────────────────────────────────────────
transporter.verify(function (error) {
  if (error) {
    console.error('❌ SMTP ERROR on boot:', error.message);
    console.error('   ➜ Check EMAIL_USER + EMAIL_PASS in .env / Render env vars');
  } else {
    const senderFrom = process.env.EMAIL_FROM || process.env.EMAIL_USER;
    console.log('✅ SMTP READY — Brevo connected');
    console.log(`   ➜ SMTP Auth : ${process.env.EMAIL_USER}`);
    console.log(`   ➜ Sender    : ${senderFrom}`);
  }
});

// ── Brevo HTTP API fallback (used if SMTP fails or times out) ─────
// Uses Brevo's transactional email REST API — more reliable on hosted platforms
async function sendViaBrevoAPI({ to, subject, html }) {
  const apiKey = process.env.BREVO_API_KEY || process.env.EMAIL_PASS;
  const senderEmail = process.env.EMAIL_FROM || process.env.EMAIL_USER;

  if (!apiKey) {
    console.warn('⚠️  Brevo API fallback skipped: no API key');
    return false;
  }

  // Handle multiple recipients
  let toArray = [];
  if (Array.isArray(to)) {
    toArray = to.map(email => ({ email: email.trim() }));
  } else if (typeof to === 'string') {
    toArray = to.split(',').map(email => ({ email: email.trim() }));
  } else {
    toArray = [{ email: to }];
  }

  try {
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'api-key': apiKey,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        sender:  { name: 'Revive Dental Clinic', email: senderEmail },
        to:      toArray,
        subject,
        htmlContent: html,
      }),
    });

    const data = await response.json();

    if (response.ok) {
      console.log(`✅ EMAIL SENT via Brevo API → MessageId: ${data.messageId} | To: ${to}`);
      return true;
    } else {
      console.error(`❌ Brevo API error: ${JSON.stringify(data)}`);
      return false;
    }
  } catch (err) {
    console.error(`❌ Brevo API fetch failed: ${err.message}`);
    return false;
  }
}

// ── sendEmail() — tries SMTP first, falls back to HTTP API ────────
/**
 * Sends an HTML email. Tries Brevo SMTP first; if it fails/times out,
 * falls back to Brevo HTTP API. Never throws — always returns boolean.
 *
 * @param {string} to      - Recipient email
 * @param {string} subject - Subject line
 * @param {string} html    - HTML body
 * @returns {Promise<boolean>}
 */
async function sendEmail({ to, subject, html }) {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.warn('⚠️  EMAIL SKIPPED: Missing EMAIL_USER or EMAIL_PASS');
    return false;
  }

  if (!to) {
    console.warn('⚠️  EMAIL SKIPPED: No recipient provided');
    return false;
  }

  const senderAddress = process.env.EMAIL_FROM || process.env.EMAIL_USER;
  
  // Format 'to' field for SMTP (array to comma-separated string)
  const toFormatted = Array.isArray(to) ? to.join(', ') : to;

  console.log(`📧 EMAIL TRIGGERED → To: ${toFormatted} | Subject: "${subject}"`);

  // ── Attempt 1: SMTP ─────────────────────────────────────────────
  try {
    const info = await transporter.sendMail({
      from:    `"Revive Dental Clinic" <${senderAddress}>`,
      to:      toFormatted,
      subject,
      html,
    });
    console.log(`✅ EMAIL SENT (SMTP) → MessageId: ${info.messageId} | To: ${to}`);
    return true;
  } catch (smtpErr) {
    console.warn(`⚠️  SMTP failed: ${smtpErr.message}`);
    if (smtpErr.responseCode) {
      console.warn(`   SMTP Code: ${smtpErr.responseCode} (535=bad creds | 550=sender issue | 421=rate limit)`);
    }
    console.log('   ➜ Falling back to Brevo HTTP API...');
  }

  // ── Attempt 2: Brevo HTTP API ────────────────────────────────────
  return await sendViaBrevoAPI({ to, subject, html });
}

module.exports = { sendEmail };
