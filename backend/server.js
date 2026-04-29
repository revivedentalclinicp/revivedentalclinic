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
 * Sends a pending confirmation to Patient.
 */
app.post('/api/email/notify-admin', async (req, res) => {
  const { userName, userEmail, date, time } = req.body;
  if (!userEmail) return res.status(400).json({ error: 'userEmail required' });

  const subject = 'Appointment Request Received';
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; padding: 20px;">
      <h2>Hello ${userName || 'Patient'},</h2>
      <p>We have successfully received your appointment request at Revive Dental Clinic.</p>
      <ul>
        <li><strong>Date:</strong> ${date}</li>
        <li><strong>Time:</strong> ${time}</li>
        <li><strong>Status:</strong> Pending Approval</li>
      </ul>
      <p>We will review your request and confirm your appointment shortly!</p>
    </div>
  `;

  // Safe wrapper (boolean returned, never throws)
  await sendEmail({ to: userEmail, subject, html });
  res.json({ success: true, message: 'Patient notified of booking receipt' });
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
    subject = 'Appointment Confirmed';
    bodyMessage = `
      <p>Your appointment has been confirmed!</p>
      <ul>
        <li><strong>Doctor:</strong> ${doctor || 'Dr. Ajay Giri'}</li>
        <li><strong>Date:</strong> ${date}</li>
        <li><strong>Time:</strong> ${time}</li>
        <li><strong>Contact:</strong> 8669062290</li>
      </ul>
    `;
  } else if (status === 'rescheduled') {
    subject = 'Appointment Rescheduled';
    bodyMessage = `
      <p>Your appointment has been successfully rescheduled.</p>
      <ul>
        <li><strong>New Date:</strong> ${date}</li>
        <li><strong>New Time:</strong> ${time}</li>
        <li><strong>Doctor:</strong> ${doctor || 'Dr. Ajay Giri'}</li>
      </ul>
      <p>Contact us at 8669062290 if you have any further questions.</p>
    `;
  } else if (status === 'rejected') {
    subject = 'Appointment Update';
    bodyMessage = `
      <p>Unfortunately, we cannot accommodate the appointment time you requested.</p>
      <p>Please log in to your dashboard to book a different time slot or call us directly at 8669062290 to arrange your visit.</p>
    `;
  }

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; padding: 20px;">
      <h2>Hello ${userName || 'Patient'},</h2>
      ${bodyMessage}
      <p>Best Regards,</p>
      <p>Revive Dental Speciality Clinic</p>
    </div>
  `;

  // Safe wrapper
  await sendEmail({ to: userEmail, subject, html });
  res.json({ success: true, message: 'Status email handled' });
});

/**
 * Welcome Email
 */
app.post('/api/email/welcome', async (req, res) => {
  const { userEmail, userName } = req.body;
  if (!userEmail) return res.status(400).json({ error: 'userEmail required' });

  const subject = 'Welcome to Revive Dental';
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; padding: 20px;">
      <h2>Welcome ${userName || 'Aboard'}! 🦷</h2>
      <p>Your account has been successfully created.</p>
      <p>You can now log in to book appointments and track your records.</p>
    </div>
  `;

  await sendEmail({ to: userEmail, subject, html });
  res.json({ success: true });
});


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Backend Server running on http://localhost:${PORT}`);
});
