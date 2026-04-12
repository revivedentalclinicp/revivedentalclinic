require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { admin, db } = require('./config/firebase');

const app = express();
app.use(cors());
app.use(express.json());

// Chatbot Knowledge Base
const KB = {
  toothache: 'Rinse with warm salt water and avoid very hot or cold foods. A toothache can indicate a cavity, abscess, or cracked tooth. Please book an appointment for a proper diagnosis.',
  sensitivity: 'Tooth sensitivity is often caused by enamel erosion or exposed dentin. Try sensitivity toothpaste and avoid acidic foods. Our dentists can recommend a long-term treatment plan.',
  gum: 'Gum health is the foundation of a healthy smile! Regular flossing and cleanings dramatically reduce the risk of gum disease.',
  default: "Thank you for your question! For personalised advice, I recommend booking a free consultation with one of our expert dentists."
};

// ==========================================
// AUTH & USERS
// ==========================================

// POST /api/auth/register (Create user profile in Firestore after Firebase Auth)
app.post('/api/auth/register', async (req, res) => {
  try {
    const { uid, name, email } = req.body;
    if (!uid) return res.status(400).json({ error: 'Missing UID' });

    const userDoc = {
      uid,
      name: name || '',
      email: email || '',
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
      status: 'upcoming',
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
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
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
// CHATBOT
// ==========================================

// POST /api/chatbot
app.post('/api/chatbot', (req, res) => {
  const { message } = req.body;
  if (!message) return res.status(400).json({ error: 'Message is required' });
  
  const lower = message.toLowerCase();
  let reply = KB.default;
  for (const [key, val] of Object.entries(KB)) {
    if (key !== 'default' && lower.includes(key)) {
      reply = val;
      break;
    }
  }
  res.json({ reply });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Backend Server running on http://localhost:${PORT}`);
});
