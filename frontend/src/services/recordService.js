/**
 * Records Service
 * API-like Firestore operations for records (treatment history) collection
 * POST /api/records      → addRecord()
 * GET  /api/records      → getRecords()
 * PUT  /api/records/:id  → updateRecord()
 */

import {
  collection, addDoc, getDocs, updateDoc, doc,
  query, where, orderBy, serverTimestamp,
} from 'firebase/firestore';
import { db } from '../firebase/config';

const COL = 'records';

// POST /api/records
export async function addRecord(data) {
  const payload = {
    userId:    data.userId,
    treatment: data.treatment,
    dentist:   data.dentist   || '',
    date:      data.date,
    notes:     data.notes     || '',
    status:    data.status    || 'Completed',
    createdAt: serverTimestamp(),
  };
  const ref = await addDoc(collection(db, COL), payload);
  return { id: ref.id, ...payload };
}

// GET /api/records?userId=uid
export async function getRecords(userId) {
  const q = query(
    collection(db, COL),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc')
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

// PUT /api/records/:id
export async function updateRecord(id, updates) {
  const ref = doc(db, COL, id);
  await updateDoc(ref, { ...updates, updatedAt: serverTimestamp() });
  return { id, ...updates };
}
