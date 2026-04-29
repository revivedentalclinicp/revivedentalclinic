const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: 'smtp-relay.brevo.com',
  port: 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Verify connection configuration
transporter.verify(function (error, success) {
  if (error) {
    console.warn('⚠️ SMTP failed to verify on boot (Email functionalites skipped):', error.message);
  } else {
    console.log('✅ Brevo SMTP ready to send out messages');
  }
});

/**
 * Sends an email universally dropping failures safely rather than throwing exceptions.
 * @param {Object} options - Standard Nodemailer send options
 * @param {string} options.to - Target email address
 * @param {string} options.subject - Subject line
 * @param {string} options.html - HTML content payload
 * @returns {Promise<boolean>} True if successful, false if suppressed
 */
async function sendEmail({ to, subject, html }) {
  try {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.warn('Email sending aborted: Missing EMAIL_USER / EMAIL_PASS configurations.');
      return false;
    }

    await transporter.sendMail({
      from: `"Revive Dental System" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html
    });

    return true;
  } catch (error) {
    console.error('Email failed safely:', error.message);
    return false; // Safely suppress exceptions returning false
  }
}

module.exports = { sendEmail };
