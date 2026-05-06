require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { admin, db } = require('./config/firebase');
const { sendEmail } = require('./services/emailService');

const app = express();
app.use(cors());
app.use(express.json());

// ==========================================

// ==========================================
// HEALTH CHECK
// ==========================================
app.get('/', (req, res) => {
  res.send('Revive Dental API is running perfectly!');
});

// Debug: verify env vars loaded correctly (safe — never exposes secrets)
app.get('/debug-env', (req, res) => {
  res.json({
    EMAIL_USER_set: !!process.env.EMAIL_USER,
    EMAIL_USER_value: process.env.EMAIL_USER || 'NOT SET',
    EMAIL_PASS_set: !!process.env.EMAIL_PASS,
    EMAIL_FROM_set: !!process.env.EMAIL_FROM,
    EMAIL_FROM_value: process.env.EMAIL_FROM || 'NOT SET — will fallback to EMAIL_USER',
    effective_sender: process.env.EMAIL_FROM || process.env.EMAIL_USER || 'NONE',
  });
});


// ==========================================
// AUTH & USERS
// ==========================================

// POST /api/auth/register
app.post('/api/auth/register', async (req, res) => {
  try {
    const { uid, name, email, phone } = req.body;
    if (!uid) return res.status(400).json({ error: 'Missing UID' });

    const userDoc = {
      uid,
      name: name || '',
      email: email || '',
      phone: phone || '',
      role: 'patient',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    await db.collection('users').doc(uid).set(userDoc);
    res.status(201).json(userDoc);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/auth/profile/:uid
app.get('/api/auth/profile/:uid', async (req, res) => {
  try {
    const doc = await db.collection('users').doc(req.params.uid).get();
    if (!doc.exists) return res.status(404).json({ error: 'User not found' });
    res.json({ id: doc.id, ...doc.data() });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==========================================
// APPOINTMENTS
// ==========================================

// POST /api/appointments
app.post('/api/appointments', async (req, res) => {
  try {
    const payload = {
      ...req.body,
      status: 'pending',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    };
    const ref = await db.collection('appointments').add(payload);
    res.status(201).json({ id: ref.id, ...payload });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/appointments?userId=uid
app.get('/api/appointments', async (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId) return res.status(400).json({ error: 'userId required' });

    const snapshot = await db.collection('appointments')
      .where('userId', '==', userId)
      .orderBy('createdAt', 'desc')
      .get();

    let appointments = [];
    snapshot.forEach(doc => appointments.push({ id: doc.id, ...doc.data() }));
    res.json(appointments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/appointments/:id (Update / Cancel)
app.put('/api/appointments/:id', async (req, res) => {
  try {
    const docRef = db.collection('appointments').doc(req.params.id);
    await docRef.update({
      ...req.body,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    res.json({ id: req.params.id, ...req.body });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/appointments/:id
app.delete('/api/appointments/:id', async (req, res) => {
  try {
    await db.collection('appointments').doc(req.params.id).delete();
    res.json({ id: req.params.id, deleted: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==========================================
// EMAIL NOTIFICATIONS (BREVO SMTP)
// ==========================================

const ADMIN_EMAIL = 'revivedentalclinicp@gmail.com';

/**
 * Booking Received (Triggered by BookAppointment.jsx)
 * Sends a pending confirmation to Patient AND notifies Admin.
 */
app.post('/api/email/notify-admin', async (req, res) => {
  const { userName, userEmail, userPhone, doctor, date, time, reason } = req.body;
  if (!userEmail) return res.status(400).json({ error: 'userEmail required' });

  // 1️⃣ Confirmation email → Patient
  const patientSubject = 'Appointment Request Received — Revive Dental';
  const patientHtml = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px;">
      <div style="text-align:center; margin-bottom: 20px;">
        <h2 style="color: #2E3192; margin: 0;">🦷 Revive Dental Speciality Clinic</h2>
        <p style="color: #64748b; font-size: 0.9rem; margin-top: 4px;">Your appointment request has been received</p>
      </div>
      <p style="color: #0f172a;">Hello <strong>${userName || 'Patient'}</strong>,</p>
      <p style="color: #475569;">Thank you for booking with us! We have successfully received your appointment request.</p>
      <div style="background: #f8fafc; border-radius: 8px; padding: 16px; margin: 16px 0; border-left: 4px solid #2E3192;">
        <p style="margin: 0 0 8px;"><strong>📅 Date:</strong> ${date}</p>
        <p style="margin: 0 0 8px;"><strong>⏰ Time:</strong> ${time}</p>
        <p style="margin: 0 0 8px;"><strong>👨‍⚕️ Doctor:</strong> ${doctor || 'Dr. Ajay Giri'}</p>
        ${reason ? `<p style="margin: 0;"><strong>📋 Reason:</strong> ${reason}</p>` : ''}
        <p style="margin: 8px 0 0; color: #d97706; font-weight: bold;">🕐 Status: Pending Approval</p>
      </div>
      <p style="color: #475569;">Our team will review your request and send you a confirmation shortly. You can track your appointment status from your <strong>patient dashboard</strong>.</p>
      <p style="color: #64748b; font-size: 0.85rem;">📞 Need help? Call us at <strong>8669062290</strong></p>
      <hr style="border: none; border-top: 1px solid #f1f5f9; margin: 20px 0;"/>
      <p style="color: #94a3b8; font-size: 0.78rem; text-align: center;">Revive Dental Speciality Clinic</p>
    </div>
  `;
  await sendEmail({ to: userEmail, subject: patientSubject, html: patientHtml });

  // 2️⃣ New booking alert → Admin
  const adminSubject = `🆕 New Appointment Request — ${userName || 'Patient'}`;
  const adminHtml = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px;">
      <h2 style="color: #2E3192; margin-bottom: 4px;">🦷 New Appointment Request</h2>
      <p style="color: #64748b; margin-top: 0;">A new booking has been submitted via the website.</p>
      <div style="background: #f8fafc; border-radius: 8px; padding: 16px; margin: 16px 0; border-left: 4px solid #16a34a;">
        <p style="margin: 0 0 8px;"><strong>👤 Patient:</strong> ${userName || '—'}</p>
        <p style="margin: 0 0 8px;"><strong>📧 Email:</strong> ${userEmail}</p>
        <p style="margin: 0 0 8px;"><strong>📞 Phone:</strong> ${userPhone || '—'}</p>
        <p style="margin: 0 0 8px;"><strong>👨‍⚕️ Doctor:</strong> ${doctor || 'Dr. Ajay Giri'}</p>
        <p style="margin: 0 0 8px;"><strong>📅 Date:</strong> ${date}</p>
        <p style="margin: 0 0 8px;"><strong>⏰ Time:</strong> ${time}</p>
        ${reason ? `<p style="margin: 0;"><strong>📋 Reason:</strong> ${reason}</p>` : ''}
      </div>
      <p style="color: #475569;">Please log into the <strong>Admin Panel</strong> to approve or reject this request.</p>
    </div>
  `;
  await sendEmail({ to: ADMIN_EMAIL, subject: adminSubject, html: adminHtml });

  res.json({ success: true, message: 'Patient and admin notified of new booking' });
});

/**
 * Appointment Status Updated (Triggered by AdminAppointments.jsx)
 * Sends accepted/rejected/rescheduled alerts to Patient.
 */
app.post('/api/email/notify-user', async (req, res) => {
  const { userEmail, userName, status, date, time, doctor } = req.body;
  if (!userEmail || !status) return res.status(400).json({ error: 'userEmail and status required' });

  let subject = '';
  let bodyMessage = '';

  if (status === 'accepted') {
    subject = '✅ Appointment Confirmed — Revive Dental';
    bodyMessage = `
      <p style="color:#0f172a;">Great news! Your appointment has been <strong style="color:#16a34a;">confirmed</strong> by our team.</p>
      <div style="background:#f0fdf4; border-radius:8px; padding:16px; margin:16px 0; border-left:4px solid #16a34a;">
        <p style="margin:0 0 8px;"><strong>👨‍⚕️ Doctor:</strong> ${doctor || 'Dr. Ajay Giri'}</p>
        <p style="margin:0 0 8px;"><strong>📅 Date:</strong> ${date}</p>
        <p style="margin:0 0 8px;"><strong>⏰ Time:</strong> ${time}</p>
        <p style="margin:0;"><strong>📞 Contact:</strong> 8669062290</p>
      </div>
      <p style="color:#475569;">Please arrive 10 minutes early and bring any previous dental records. We look forward to seeing you!</p>
    `;
  } else if (status === 'rescheduled') {
    subject = '📅 Appointment Rescheduled — Revive Dental';
    bodyMessage = `
      <p style="color:#0f172a;">Your appointment has been <strong style="color:#2E3192;">rescheduled</strong> by our team.</p>
      <div style="background:#ECEDF8; border-radius:8px; padding:16px; margin:16px 0; border-left:4px solid #2E3192;">
        <p style="margin:0 0 8px;"><strong>📅 New Date:</strong> ${date}</p>
        <p style="margin:0 0 8px;"><strong>⏰ New Time:</strong> ${time}</p>
        <p style="margin:0;"><strong>👨‍⚕️ Doctor:</strong> ${doctor || 'Dr. Ajay Giri'}</p>
      </div>
      <p style="color:#475569;">If this new schedule doesn't work for you, please contact us at <strong>8669062290</strong>.</p>
    `;
  } else if (status === 'rejected') {
    subject = '❌ Appointment Request Update — Revive Dental';
    bodyMessage = `
      <p style="color:#0f172a;">We regret to inform you that we are unable to accommodate your appointment request for the selected date/time.</p>
      <div style="background:#fef2f2; border-radius:8px; padding:16px; margin:16px 0; border-left:4px solid #dc2626;">
        <p style="margin:0; color:#dc2626; font-weight:600;">Your appointment request has been declined.</p>
      </div>
      <p style="color:#475569;">Don't worry — you can easily <strong>reschedule your appointment</strong> by visiting your patient dashboard and selecting a new preferred date and time.</p>
      <p style="color:#475569;">Alternatively, call us directly at <strong>8669062290</strong> and we'll be happy to find a suitable time for you.</p>
      <div style="background:#f0fdf4; border-radius:8px; padding:12px 16px; margin:16px 0; border:1px solid #bbf7d0;">
        <p style="margin:0; color:#16a34a; font-weight:600;">💡 You can reschedule your appointment from your dashboard.</p>
      </div>
    `;
  }

  if (!subject) {
    return res.json({ success: true, message: 'No email template for this status' });
  }

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px;">
      <div style="text-align:center; margin-bottom:20px;">
        <h2 style="color:#2E3192; margin:0;">🦷 Revive Dental Speciality Clinic</h2>
      </div>
      <p>Hello <strong>${userName || 'Patient'}</strong>,</p>
      ${bodyMessage}
      <hr style="border:none; border-top:1px solid #f1f5f9; margin:20px 0;"/>
      <p style="color:#64748b; font-size:0.85rem;">Best Regards,<br/><strong>Revive Dental Speciality Clinic</strong><br/>📞 8669062290</p>
    </div>
  `;

  // Safe wrapper — never crashes the server
  await sendEmail({ to: userEmail, subject, html });
  res.json({ success: true, message: 'Status email handled' });
});

/**
 * Reschedule Request Processed by Admin (approve or reject)
 * Triggered by AdminAppointments.jsx when processRescheduleRequest runs.
 */
app.post('/api/email/notify-reschedule', async (req, res) => {
  const { userEmail, userName, action, newDate, newTime, doctor } = req.body;
  if (!userEmail || !action) return res.status(400).json({ error: 'userEmail and action required' });

  let subject = '';
  let bodyMessage = '';

  if (action === 'approve') {
    subject = '✅ Reschedule Request Approved — Revive Dental';
    bodyMessage = `
      <p style="color:#0f172a;">Your reschedule request has been <strong style="color:#16a34a;">approved</strong>!</p>
      <div style="background:#f0fdf4; border-radius:8px; padding:16px; margin:16px 0; border-left:4px solid #16a34a;">
        <p style="margin:0 0 8px;"><strong>📅 New Date:</strong> ${newDate}</p>
        <p style="margin:0 0 8px;"><strong>⏰ New Time:</strong> ${newTime}</p>
        <p style="margin:0;"><strong>👨‍⚕️ Doctor:</strong> ${doctor || 'Dr. Ajay Giri'}</p>
      </div>
      <p style="color:#475569;">Please arrive 10 minutes early. We look forward to seeing you!</p>
    `;
  } else if (action === 'reject') {
    subject = '❌ Reschedule Request Declined — Revive Dental';
    bodyMessage = `
      <p style="color:#0f172a;">Unfortunately, we are unable to approve your reschedule request for the new date/time.</p>
      <div style="background:#fef2f2; border-radius:8px; padding:16px; margin:16px 0; border-left:4px solid #dc2626;">
        <p style="margin:0; color:#dc2626; font-weight:600;">Your reschedule request has been declined.</p>
      </div>
      <p style="color:#475569;">You can submit another reschedule request from your <strong>patient dashboard</strong>, or call us at <strong>8669062290</strong> to arrange a suitable time.</p>
      <div style="background:#f0fdf4; border-radius:8px; padding:12px 16px; margin:16px 0; border:1px solid #bbf7d0;">
        <p style="margin:0; color:#16a34a; font-weight:600;">💡 You can reschedule your appointment again from your dashboard.</p>
      </div>
    `;
  }

  if (!subject) {
    return res.json({ success: true, message: 'No email template for this action' });
  }

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px;">
      <div style="text-align:center; margin-bottom:20px;">
        <h2 style="color:#2E3192; margin:0;">🦷 Revive Dental Speciality Clinic</h2>
      </div>
      <p>Hello <strong>${userName || 'Patient'}</strong>,</p>
      ${bodyMessage}
      <hr style="border:none; border-top:1px solid #f1f5f9; margin:20px 0;"/>
      <p style="color:#64748b; font-size:0.85rem;">Best Regards,<br/><strong>Revive Dental Speciality Clinic</strong><br/>📞 8669062290</p>
    </div>
  `;

  await sendEmail({ to: userEmail, subject, html });
  res.json({ success: true, message: `Reschedule ${action} email sent` });
});

/**
 * Welcome Email (Triggered by Signup.jsx after new user registration)
 */
app.post('/api/email/welcome', async (req, res) => {
  const { userEmail, userName } = req.body;
  if (!userEmail) return res.status(400).json({ error: 'userEmail required' });

  const subject = '🦷 Welcome to Revive Dental Speciality Clinic!';
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px;">
      <div style="text-align:center; margin-bottom:24px;">
        <h2 style="color:#2E3192; margin:0;">🦷 Revive Dental Speciality Clinic</h2>
        <p style="color:#64748b; font-size:0.9rem; margin-top:4px;">Your smile is our priority</p>
      </div>
      <h3 style="color:#0f172a;">Welcome, ${userName || 'there'}! 👋</h3>
      <p style="color:#475569;">Your account has been <strong>successfully created</strong>. You're now part of the Revive Dental family!</p>
      <div style="background:#ECEDF8; border-radius:8px; padding:16px; margin:16px 0;">
        <p style="color:#3B3F97; font-weight:700; margin:0 0 10px;">What you can do now:</p>
        <ul style="color:#475569; margin:0; padding-left:18px; line-height:2;">
          <li>📅 Book your first appointment online</li>
          <li>📋 Track your appointment status in real-time</li>
          <li>🔔 Receive email updates on every step</li>
          <li>👤 Manage your profile and records</li>
        </ul>
      </div>
      <p style="color:#475569;">Have questions? Call us at <strong>8669062290</strong> — we're happy to help!</p>
      <hr style="border:none; border-top:1px solid #f1f5f9; margin:20px 0;"/>
      <p style="color:#94a3b8; font-size:0.78rem; text-align:center;">Revive Dental Speciality Clinic — Caring for your smile every day</p>
    </div>
  `;

  await sendEmail({ to: userEmail, subject, html });
  res.json({ success: true });
});

// ==========================================
// TEST EMAIL ROUTE (Dev / Debug only)
// GET /test-email?to=youremail@example.com
// ==========================================
app.get('/test-email', async (req, res) => {
  const to = req.query.to || ADMIN_EMAIL;

  console.log(`🧪 TEST EMAIL triggered → sending to: ${to}`);

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 580px; margin: 0 auto;
                padding: 28px; border: 1px solid #e2e8f0; border-radius: 12px;">
      <h2 style="color: #2E3192; margin-bottom: 4px;">🦷 Revive Dental — Test Email</h2>
      <p style="color: #64748b; margin-top: 0;">SMTP connectivity test</p>
      <div style="background: #f0fdf4; border-radius: 8px; padding: 16px;
                  border-left: 4px solid #16a34a; margin: 16px 0;">
        <p style="margin: 0; color: #16a34a; font-weight: 700;">
          ✅ If you received this email, Brevo SMTP is working correctly!
        </p>
      </div>
      <p style="color: #475569;">
        Sent at: <strong>${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} IST</strong>
      </p>
      <hr style="border: none; border-top: 1px solid #f1f5f9; margin: 20px 0;"/>
      <p style="color: #94a3b8; font-size: 0.78rem; text-align: center;">
        Revive Dental Speciality Clinic — Backend Email Test
      </p>
    </div>
  `;

  const sent = await sendEmail({
    to,
    subject: '🧪 [TEST] Revive Dental SMTP Check',
    html,
  });

  if (sent) {
    console.log(`✅ Test email delivered to: ${to}`);
    res.json({
      success: true,
      message: `Test email sent to ${to}. Check your inbox (and spam folder).`,
    });
  } else {
    console.error(`❌ Test email FAILED to: ${to}`);
    res.status(500).json({
      success: false,
      message: 'Test email failed. Check server console for SMTP error details.',
    });
  }
});

// ==========================================
// SERVER START
// ==========================================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Backend Server running on http://localhost:${PORT}`);
  console.log(`🧪 Test email: http://localhost:${PORT}/test-email`);
  console.log(`🧪 Test to specific address: http://localhost:${PORT}/test-email?to=your@email.com`);
});
