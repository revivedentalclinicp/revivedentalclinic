require('dotenv').config();
const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
const { admin, db } = require('./config/firebase');

const app = express();
app.use(cors());
app.use(express.json());

// ==========================================
// NODEMAILER — Gmail SMTP
// ==========================================
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

// Verify transporter on startup (logs warning if creds missing)
transporter.verify((err) => {
  if (err) {
    console.warn('⚠️  Email transporter not ready:', err.message);
  } else {
    console.log('✅ Email transporter ready');
  }
});

const ADMIN_EMAIL = 'revivedentalclinicp@gmail.com';

// ==========================================
// HEALTH CHECK
// ==========================================
app.get('/', (req, res) => {
  res.send('Revive Dental API is running perfectly!');
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
// EMAIL NOTIFICATIONS
// ==========================================

/**
 * POST /api/email/notify-admin
 * Called when a patient books a new appointment.
 * Sends an email to the clinic admin.
 */
app.post('/api/email/notify-admin', async (req, res) => {
  const { userName, userEmail, userPhone, doctor, date, time, reason } = req.body;

  if (!userName || !userEmail) {
    return res.status(400).json({ error: 'userName and userEmail are required' });
  }

  try {
    await transporter.sendMail({
      from: `"Revive Dental System" <${process.env.GMAIL_USER}>`,
      to: ADMIN_EMAIL,
      subject: '🦷 New Appointment Request — Revive Dental',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f8fafc; padding: 0; border-radius: 12px; overflow: hidden;">
          <div style="background: linear-gradient(135deg, #2E3192, #3B3F97); padding: 32px 40px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 22px; font-weight: 800; letter-spacing: 0.5px;">
              Revive Dental Speciality Clinic
            </h1>
            <p style="color: rgba(255,255,255,0.8); margin: 8px 0 0; font-size: 14px;">Admin Notification</p>
          </div>
          <div style="background: #ffffff; padding: 36px 40px;">
            <h2 style="color: #0f172a; font-size: 18px; margin: 0 0 8px;">New Appointment Request</h2>
            <p style="color: #64748b; font-size: 14px; margin: 0 0 28px; line-height: 1.6;">
              A new appointment request has been submitted by <strong style="color: #0f172a;">${userName}</strong>. Please review it in the admin panel.
            </p>
            <div style="background: #f8fafc; border-radius: 10px; padding: 20px 24px; border: 1px solid #e2e8f0; margin-bottom: 24px;">
              <table style="width: 100%; border-collapse: collapse;">
                <tr><td style="padding: 8px 0; color: #64748b; font-size: 13px; width: 40%;">Patient Name</td><td style="padding: 8px 0; color: #0f172a; font-size: 13px; font-weight: 600;">${userName}</td></tr>
                <tr><td style="padding: 8px 0; color: #64748b; font-size: 13px;">Email</td><td style="padding: 8px 0; color: #0f172a; font-size: 13px; font-weight: 600;">${userEmail}</td></tr>
                <tr><td style="padding: 8px 0; color: #64748b; font-size: 13px;">Phone</td><td style="padding: 8px 0; color: #0f172a; font-size: 13px; font-weight: 600;">${userPhone || '—'}</td></tr>
                <tr><td style="padding: 8px 0; color: #64748b; font-size: 13px;">Doctor</td><td style="padding: 8px 0; color: #0f172a; font-size: 13px; font-weight: 600;">${doctor || '—'}</td></tr>
                <tr><td style="padding: 8px 0; color: #64748b; font-size: 13px;">Date</td><td style="padding: 8px 0; color: #0f172a; font-size: 13px; font-weight: 600;">${date || '—'}</td></tr>
                <tr><td style="padding: 8px 0; color: #64748b; font-size: 13px;">Time</td><td style="padding: 8px 0; color: #0f172a; font-size: 13px; font-weight: 600;">${time || '—'}</td></tr>
                <tr><td style="padding: 8px 0; color: #64748b; font-size: 13px; vertical-align: top;">Reason</td><td style="padding: 8px 0; color: #0f172a; font-size: 13px; font-weight: 600;">${reason || 'Not specified'}</td></tr>
              </table>
            </div>
            <a href="https://revivedentalspeciality.onrender.com/admin/dashboard" style="display: inline-block; background: linear-gradient(135deg, #2E3192, #3B3F97); color: #ffffff; text-decoration: none; padding: 12px 28px; border-radius: 8px; font-weight: 700; font-size: 14px;">
              Open Admin Panel →
            </a>
          </div>
          <div style="background: #f8fafc; padding: 20px 40px; text-align: center; border-top: 1px solid #e2e8f0;">
            <p style="color: #94a3b8; font-size: 12px; margin: 0;">© 2025 Revive Dental Speciality Clinic · Wagholi, Pune</p>
          </div>
        </div>
      `,
    });

    res.json({ success: true, message: 'Admin notified' });
  } catch (error) {
    console.error('Email error (notify-admin):', error.message);
    // Don't fail the booking if email fails
    res.status(200).json({ success: false, message: error.message });
  }
});

/**
 * POST /api/email/notify-user
 * Called when admin approves or rejects an appointment.
 * Sends an email to the patient.
 */
app.post('/api/email/notify-user', async (req, res) => {
  const { userEmail, userName, status, date, time, doctor } = req.body;

  if (!userEmail || !status) {
    return res.status(400).json({ error: 'userEmail and status required' });
  }

  const isApproved = status === 'accepted';

  const subject = isApproved
    ? '✅ Appointment Confirmed — Revive Dental'
    : '❌ Appointment Update — Revive Dental';

  const bodyMessage = isApproved
    ? `Your appointment has been confirmed at <strong>Revive Dental Speciality Clinic</strong>.`
    : `Your appointment request was not approved. Please try another time slot.`;

  const statusColor = isApproved ? '#16a34a' : '#dc2626';
  const statusBg = isApproved ? '#f0fdf4' : '#fef2f2';
  const statusLabel = isApproved ? '✅ CONFIRMED' : '❌ NOT APPROVED';

  try {
    await transporter.sendMail({
      from: `"Revive Dental Clinic" <${process.env.GMAIL_USER}>`,
      to: userEmail,
      subject,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f8fafc; padding: 0; border-radius: 12px; overflow: hidden;">
          <div style="background: linear-gradient(135deg, #2E3192, #3B3F97); padding: 32px 40px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 22px; font-weight: 800; letter-spacing: 0.5px;">
              Revive Dental Speciality Clinic
            </h1>
            <p style="color: rgba(255,255,255,0.8); margin: 8px 0 0; font-size: 14px;">Appointment Update</p>
          </div>
          <div style="background: #ffffff; padding: 36px 40px;">
            <h2 style="color: #0f172a; font-size: 18px; margin: 0 0 8px;">Dear ${userName || 'Patient'},</h2>
            <p style="color: #64748b; font-size: 14px; margin: 0 0 24px; line-height: 1.6;">${bodyMessage}</p>
            <div style="background: ${statusBg}; border-radius: 10px; padding: 14px 20px; border: 1px solid ${statusColor}40; margin-bottom: 24px; text-align: center;">
              <span style="color: ${statusColor}; font-weight: 800; font-size: 15px;">${statusLabel}</span>
            </div>
            ${isApproved ? `
            <div style="background: #f8fafc; border-radius: 10px; padding: 20px 24px; border: 1px solid #e2e8f0; margin-bottom: 24px;">
              <table style="width: 100%; border-collapse: collapse;">
                <tr><td style="padding: 8px 0; color: #64748b; font-size: 13px; width: 40%;">Doctor</td><td style="padding: 8px 0; color: #0f172a; font-size: 13px; font-weight: 600;">${doctor || 'Dr. Ajay Giri (MDS)'}</td></tr>
                <tr><td style="padding: 8px 0; color: #64748b; font-size: 13px;">Date</td><td style="padding: 8px 0; color: #0f172a; font-size: 13px; font-weight: 600;">${date || '—'}</td></tr>
                <tr><td style="padding: 8px 0; color: #64748b; font-size: 13px;">Time</td><td style="padding: 8px 0; color: #0f172a; font-size: 13px; font-weight: 600;">${time || '—'}</td></tr>
                <tr><td style="padding: 8px 0; color: #64748b; font-size: 13px;">Clinic</td><td style="padding: 8px 0; color: #0f172a; font-size: 13px; font-weight: 600;">Revive Dental Speciality Clinic, Wagholi, Pune</td></tr>
              </table>
            </div>
            <p style="color: #64748b; font-size: 13px; margin: 0 0 24px;">Please arrive <strong>10 minutes early</strong> and bring any previous dental records if available.</p>
            ` : `
            <p style="color: #64748b; font-size: 13px; margin: 0 0 24px;">Please try booking a different time slot, or contact us at <strong>8669062290</strong> for assistance.</p>
            `}
            <a href="https://revivedentalspeciality.onrender.com/book" style="display: inline-block; background: linear-gradient(135deg, #2E3192, #3B3F97); color: #ffffff; text-decoration: none; padding: 12px 28px; border-radius: 8px; font-weight: 700; font-size: 14px;">
              ${isApproved ? 'View My Appointment →' : 'Book New Appointment →'}
            </a>
          </div>
          <div style="background: #f8fafc; padding: 20px 40px; text-align: center; border-top: 1px solid #e2e8f0;">
            <p style="color: #94a3b8; font-size: 12px; margin: 0 0 4px;">📞 8669062290 &nbsp;|&nbsp; 📧 revivedentalclinicp@gmail.com</p>
            <p style="color: #94a3b8; font-size: 12px; margin: 0;">© 2025 Revive Dental Speciality Clinic · Wagholi, Pune</p>
          </div>
        </div>
      `,
    });

    res.json({ success: true, message: 'User notified' });
  } catch (error) {
    console.error('Email error (notify-user):', error.message);
    res.status(200).json({ success: false, message: error.message });
  }
});

/**
 * POST /api/email/welcome
 * Called after Google sign-up for new users.
 */
app.post('/api/email/welcome', async (req, res) => {
  const { userEmail, userName } = req.body;
  if (!userEmail) return res.status(400).json({ error: 'userEmail required' });

  try {
    await transporter.sendMail({
      from: `"Revive Dental Clinic" <${process.env.GMAIL_USER}>`,
      to: userEmail,
      subject: '👋 Welcome to Revive Dental Speciality Clinic!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f8fafc; border-radius: 12px; overflow: hidden;">
          <div style="background: linear-gradient(135deg, #2E3192, #3B3F97); padding: 32px 40px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 22px; font-weight: 800;">Revive Dental Speciality Clinic</h1>
            <p style="color: rgba(255,255,255,0.8); margin: 8px 0 0; font-size: 14px;">Welcome Aboard! 🦷</p>
          </div>
          <div style="background: #ffffff; padding: 36px 40px;">
            <h2 style="color: #0f172a; font-size: 18px; margin: 0 0 16px;">Hello, ${userName || 'there'}!</h2>
            <p style="color: #64748b; font-size: 14px; line-height: 1.7; margin: 0 0 24px;">
              Welcome to <strong style="color: #0f172a;">Revive Dental Speciality Clinic</strong>! Your account has been successfully created. 
              We're committed to providing you with high-quality, patient-friendly dental care.
            </p>
            <div style="background: #ECEDF8; border-radius: 10px; padding: 20px 24px; margin-bottom: 24px;">
              <p style="color: #3B3F97; font-size: 13px; font-weight: 700; margin: 0 0 8px;">What you can do now:</p>
              <ul style="color: #475569; font-size: 13px; line-height: 1.8; margin: 0; padding-left: 20px;">
                <li>Book an appointment with Dr. Ajay Giri (MDS)</li>
                <li>Track your appointment status from your dashboard</li>
                <li>Receive updates on your bookings via email</li>
              </ul>
            </div>
            <a href="https://revivedentalspeciality.onrender.com/book" style="display: inline-block; background: linear-gradient(135deg, #2E3192, #3B3F97); color: #ffffff; text-decoration: none; padding: 12px 28px; border-radius: 8px; font-weight: 700; font-size: 14px;">
              Book Your First Appointment →
            </a>
          </div>
          <div style="background: #f8fafc; padding: 20px 40px; text-align: center; border-top: 1px solid #e2e8f0;">
            <p style="color: #94a3b8; font-size: 12px; margin: 0 0 4px;">📞 8669062290 &nbsp;|&nbsp; 📧 revivedentalclinicp@gmail.com</p>
            <p style="color: #94a3b8; font-size: 12px; margin: 0;">© 2025 Revive Dental Speciality Clinic · Wagholi, Pune</p>
          </div>
        </div>
      `,
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Email error (welcome):', error.message);
    res.status(200).json({ success: false, message: error.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Backend Server running on http://localhost:${PORT}`);
});
