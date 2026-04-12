/**
 * Appointment Service — Firestore Direct
 * Handles appointment CRUD for both patients and admin
 */
import {
  collection, addDoc, getDocs, updateDoc, doc,
  query, where, orderBy, serverTimestamp,
} from 'firebase/firestore';
import { db } from '../firebase/config';

const COL = 'appointments';

/**
 * Create a new appointment (patient-facing)
 */
export async function createAppointment(data) {
  const payload = {
    userId:    data.userId,
    name:      data.name      || '',
    phone:     data.phone     || '',
    service:   data.service   || '',
    date:      data.date,
    time:      data.time,
    notes:     data.notes     || '',
    status:    'pending',
    createdAt: serverTimestamp(),
  };
  const ref = await addDoc(collection(db, COL), payload);
  return { id: ref.id, ...payload };
}

/**
 * Get appointments for a specific user (patient dashboard)
 */
export async function getAppointments(userId) {
  const q = query(
    collection(db, COL),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc')
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

/**
 * Cancel an appointment (patient-facing)
 */
export async function cancelAppointment(id) {
  const ref = doc(db, COL, id);
  await updateDoc(ref, { status: 'cancelled', updatedAt: serverTimestamp() });
  return { id, status: 'cancelled' };
}
