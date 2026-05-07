/**
 * Inquiry Service — Firestore Direct
 * Handles the "Send Us a Message" form on the homepage
 */
import {
  collection, addDoc, getDocs, updateDoc, deleteDoc, doc,
  query, orderBy, serverTimestamp, onSnapshot,
} from 'firebase/firestore';
import { db } from '../firebase/config';

const COL = 'inquiries';

/**
 * Submit an inquiry from guest user (no auth required)
 */
export async function submitInquiry(data) {
  const payload = {
    name:      (data.name || '').trim(),
    email:     (data.email || '').trim(),
    phone:     (data.phone || '').trim(),
    location:  (data.location || '').trim(),
    message:   (data.message || '').trim(),
    status:    'new',
    source:    'website',
    createdAt: serverTimestamp(),
  };
  const ref = await addDoc(collection(db, COL), payload);
  return { id: ref.id, ...payload };
}

/**
 * Real-time listener for inquiries (admin use only)
 * Returns unsubscribe function — call it on component unmount
 */
export function subscribeInquiries(callback) {
  const q = query(collection(db, COL), orderBy('createdAt', 'desc'));
  return onSnapshot(q, (snap) => {
    const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    callback(data);
  });
}

/**
 * Get all inquiries (admin-only)
 */
export async function getAllInquiries() {
  const q = query(collection(db, COL), orderBy('createdAt', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

/**
 * Update inquiry status (admin-only)
 */
export async function updateInquiryStatus(id, status) {
  const ref = doc(db, COL, id);
  await updateDoc(ref, { status, updatedAt: serverTimestamp() });
  return { id, status };
}

/**
 * Delete an inquiry (admin-only)
 */
export async function deleteInquiry(id) {
  await deleteDoc(doc(db, COL, id));
  return { id };
}
