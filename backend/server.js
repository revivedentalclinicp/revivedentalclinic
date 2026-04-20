require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { admin, db } = require('./config/firebase');

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
// EMAIL NOTIFICATIONS (DISABLED)
// ==========================================

app.post('/api/email/notify-admin', (req, res) => {
  console.log('Email notification skipped (notify-admin)');
  res.json({ success: true, message: 'Admin notified placeholder' });
});

app.post('/api/email/notify-user', (req, res) => {
  console.log('Email notification skipped (notify-user)');
  res.json({ success: true, message: 'User notified placeholder' });
});

app.post('/api/email/welcome', (req, res) => {
  console.log('Email notification skipped (welcome)');
  res.json({ success: true });
});


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Backend Server running on http://localhost:${PORT}`);
});
