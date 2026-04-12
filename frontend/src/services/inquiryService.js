/**
 * Inquiry Service — Firestore Direct
 * Handles the "Send Us a Message" form on the homepage
 */
import {
  collection, addDoc, getDocs, updateDoc, deleteDoc, doc,
  query, orderBy, serverTimestamp,
} from 'firebase/firestore';
import { db } from '../firebase/config';

const COL = 'inquiries';

/**
 * Submit an inquiry from guest user (no auth required)
 */
export async function submitInquiry(data) {
  const payload = {
    name:      data.name,
    email:     data.email,
    phone:     data.phone,
    location:  data.location,
    message:   data.message,
    status:    'new',
    createdAt: serverTimestamp(),
  };
  const ref = await addDoc(collection(db, COL), payload);
  return { id: ref.id, ...payload };
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
