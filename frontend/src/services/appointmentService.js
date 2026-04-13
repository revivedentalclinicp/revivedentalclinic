/**
 * Appointment Service — Firestore Direct
 * Handles appointment CRUD + double-booking prevention
 */
import {
  collection, addDoc, getDocs, updateDoc, doc,
  query, where, orderBy, serverTimestamp,
} from 'firebase/firestore';
import { db } from '../firebase/config';

const COL = 'appointments';

/**
 * Check if a time slot is already booked (double-booking prevention).
 * Returns true if the slot is AVAILABLE, false if taken.
 */
export async function checkSlotAvailability(doctor, date, time) {
  const q = query(
    collection(db, COL),
    where('doctor', '==', doctor),
    where('date', '==', date),
    where('time', '==', time),
    where('status', 'in', ['pending', 'accepted', 'rescheduled'])
  );
  const snap = await getDocs(q);
  return snap.empty; // true = available, false = taken
}

/**
 * Get all booked time slots for a doctor on a given date.
 * Returns an array of booked time strings, e.g. ["09:00 AM", "11:00 AM"]
 */
export async function getBookedSlots(doctor, date) {
  const q = query(
    collection(db, COL),
    where('doctor', '==', doctor),
    where('date', '==', date),
    where('status', 'in', ['pending', 'accepted', 'rescheduled'])
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => d.data().time).filter(Boolean);
}

/**
 * Create a new appointment (patient-facing).
 * Stores: userId, name, email, phone, doctor, date, time, reason, status, createdAt
 */
export async function createAppointment(data) {
  // Double-check availability before creating
  const available = await checkSlotAvailability(data.doctor, data.date, data.time);
  if (!available) {
    throw new Error('This time slot has just been booked. Please select another slot.');
  }

  const payload = {
    userId:    data.userId    || '',
    name:      data.name      || '',
    email:     data.email     || '',
    phone:     data.phone     || '',
    doctor:    data.doctor    || '',
    date:      data.date,
    time:      data.time,
    reason:    data.reason    || '',
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
