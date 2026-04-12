/**
 * Admin Service — Firestore Direct
 * All admin-panel operations: appointments, inquiries, FAQs, stats
 */
import {
  collection, addDoc, getDocs, updateDoc, deleteDoc, doc,
  query, orderBy, where, serverTimestamp, getCountFromServer,
} from 'firebase/firestore';
import { db } from '../firebase/config';

// ─── APPOINTMENTS ───────────────────────────
export async function getAllAppointments() {
  const q = query(collection(db, 'appointments'), orderBy('createdAt', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function updateAppointmentStatus(id, status) {
  const ref = doc(db, 'appointments', id);
  await updateDoc(ref, { status, updatedAt: serverTimestamp() });
}

export async function rescheduleAppointment(id, date, time) {
  const ref = doc(db, 'appointments', id);
  await updateDoc(ref, {
    date,
    time,
    status: 'rescheduled',
    updatedAt: serverTimestamp(),
  });
}

// ─── INQUIRIES ──────────────────────────────
export async function getAllInquiries() {
  const q = query(collection(db, 'inquiries'), orderBy('createdAt', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function markInquiryContacted(id) {
  const ref = doc(db, 'inquiries', id);
  await updateDoc(ref, { status: 'contacted', updatedAt: serverTimestamp() });
}

export async function deleteInquiry(id) {
  await deleteDoc(doc(db, 'inquiries', id));
}

// ─── FAQs ───────────────────────────────────
export async function getAllFAQs() {
  const q = query(collection(db, 'faqs'), orderBy('createdAt', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function addFAQ(question, answer) {
  const ref = await addDoc(collection(db, 'faqs'), {
    question,
    answer,
    createdAt: serverTimestamp(),
  });
  return { id: ref.id, question, answer };
}

export async function updateFAQ(id, question, answer) {
  const ref = doc(db, 'faqs', id);
  await updateDoc(ref, { question, answer, updatedAt: serverTimestamp() });
}

export async function deleteFAQ(id) {
  await deleteDoc(doc(db, 'faqs', id));
}

// ─── DASHBOARD STATS ────────────────────────
export async function getDashboardStats() {
  const appointmentsSnap = await getDocs(collection(db, 'appointments'));
  const inquiriesSnap = await getDocs(collection(db, 'inquiries'));

  const appointments = appointmentsSnap.docs.map(d => ({ id: d.id, ...d.data() }));
  const inquiries = inquiriesSnap.docs.map(d => ({ id: d.id, ...d.data() }));

  // Today's date string (YYYY-MM-DD)
  const today = new Date().toISOString().split('T')[0];

  const totalPatients = appointments.length;
  const todayAppointments = appointments.filter(a => a.date === today).length;
  const pendingApprovals = appointments.filter(a => a.status === 'pending').length;
  const totalInquiries = inquiries.length;

  // Patients per month (last 12 months)
  const monthMap = {};
  const now = new Date();
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const label = d.toLocaleString('default', { month: 'short', year: '2-digit' });
    monthMap[key] = { month: label, count: 0 };
  }

  appointments.forEach(a => {
    if (a.createdAt) {
      const ts = a.createdAt.toDate ? a.createdAt.toDate() : new Date(a.createdAt);
      const key = `${ts.getFullYear()}-${String(ts.getMonth() + 1).padStart(2, '0')}`;
      if (monthMap[key]) monthMap[key].count++;
    }
  });

  const monthlyData = Object.values(monthMap);

  // Upcoming appointments (next 5 by date)
  const upcoming = appointments
    .filter(a => a.date >= today && a.status !== 'rejected' && a.status !== 'cancelled')
    .sort((a, b) => {
      if (a.date === b.date) return (a.time || '').localeCompare(b.time || '');
      return a.date.localeCompare(b.date);
    })
    .slice(0, 5);

  return {
    totalPatients,
    todayAppointments,
    pendingApprovals,
    totalInquiries,
    monthlyData,
    upcoming,
  };
}
