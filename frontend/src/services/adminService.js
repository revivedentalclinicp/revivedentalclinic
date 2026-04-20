/**
 * Admin Service — Firestore Direct
 * All admin-panel operations: appointments, inquiries, FAQs, stats
 */
import {
  collection, addDoc, getDocs, updateDoc, deleteDoc, doc,
  query, orderBy, where, serverTimestamp, getCountFromServer, onSnapshot, deleteField
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { checkSlotAvailability } from './appointmentService';
import { addNotification } from './notificationService';

// ─── APPOINTMENTS ───────────────────────────
export async function getAllAppointments() {
  const q = query(collection(db, 'appointments'), orderBy('createdAt', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

function autoCompletePastAppointments(appointments) {
  const now = new Date();
  appointments.forEach(a => {
    if (a.status === 'accepted' || a.status === 'rescheduled') {
      if (a.date && a.time) {
        const timeParts = a.time.match(/(\d+):(\d+)\s(AM|PM)/i);
        if (timeParts) {
          let hours = parseInt(timeParts[1]);
          const mins = parseInt(timeParts[2]);
          const period = timeParts[3].toUpperCase();
          if (period === 'PM' && hours !== 12) hours += 12;
          if (period === 'AM' && hours === 12) hours = 0;
          const dt = new Date(`${a.date}T00:00:00`);
          dt.setHours(hours, mins, 0, 0);
          
          if (dt < now) {
            updateAppointmentStatus(a.id, 'completed').catch(console.warn);
          }
        }
      }
    }
  });
}

export function subscribeAllAppointments(callback) {
  const q = query(collection(db, 'appointments'), orderBy('createdAt', 'desc'));
  return onSnapshot(q, (snap) => {
    const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    autoCompletePastAppointments(data);
    callback(data);
  });
}

export async function updateAppointmentStatus(id, status, userId) {
  const ref = doc(db, 'appointments', id);
  await updateDoc(ref, { status, updatedAt: serverTimestamp() });
  if (userId) {
    let msg = `Your appointment status was updated to ${status}.`;
    if (status === 'accepted') msg = 'Your appointment has been approved!';
    if (status === 'rejected') msg = 'Your appointment has been cancelled by the clinic.';
    await addNotification(userId, msg, 'appointment');
  }
}

export async function rescheduleAppointment(id, date, time, userId) {
  const ref = doc(db, 'appointments', id);
  await updateDoc(ref, {
    date,
    time,
    status: 'rescheduled',
    updatedAt: serverTimestamp(),
  });
  if (userId) {
    await addNotification(userId, `Your appointment was rescheduled to ${date} at ${time}.`, 'appointment');
  }
}

export async function processRescheduleRequest(id, action, newDate, newTime, userId) {
  const ref = doc(db, 'appointments', id);
  if (action === 'approve') {
    await updateDoc(ref, {
      date: newDate,
      time: newTime,
      status: 'accepted',
      newRequestedDate: deleteField(),
      newRequestedTime: deleteField(),
      updatedAt: serverTimestamp()
    });
    if (userId) await addNotification(userId, `Your reschedule request for ${newDate} at ${newTime} was approved!`, 'appointment');
  } else {
    await updateDoc(ref, {
      status: 'accepted',
      newRequestedDate: deleteField(),
      newRequestedTime: deleteField(),
      updatedAt: serverTimestamp()
    });
    if (userId) await addNotification(userId, `Your reschedule request was declined. Your originally scheduled time is kept.`, 'appointment');
  }
}

export async function addManualAppointment(data) {
  const doctor = data.doctor || "Dr. Ajay Giri";

  // Prevent double booking!
  const available = await checkSlotAvailability(doctor, data.date, data.time);
  if (!available) {
    throw new Error('This time slot is already booked. Please choose another.');
  }

  const payload = {
    userId: data.adminId || "manual_entry",
    name: data.name,
    phone: data.phone,
    email: data.email || "",
    doctor: doctor,
    date: data.date,
    time: data.time,
    reason: data.reason || "",
    status: "accepted", // Automatically approved per requirements to ensure UI integration
    createdAt: serverTimestamp(),
    source: data.source || "manual", // e.g. "whatsapp", "call"
  };
  const ref = await addDoc(collection(db, 'appointments'), payload);
  return ref.id;
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
export function subscribeDashboardStats(callback) {
  let appointments = [];
  let inquiries = [];
  let totalPatients = 0;

  const checkEmit = () => {
    const today = new Date().toISOString().split('T')[0];
    const now = new Date();

    const todayAppointments = appointments.filter(a => a.date === today && (a.status === 'pending' || a.status === 'accepted' || a.status === 'rescheduled')).length;
    const pendingApprovals = appointments.filter(a => a.status === 'pending').length;
    const totalInquiries = inquiries.length;

    // Monthly chart
    const monthMap = {};
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

    // Upcoming appointments
    const upcoming = appointments
      .filter(a => {
        if (a.status !== 'accepted' && a.status !== 'rescheduled') return false;
        
        // Ensure accurate date-time combination
        const timeStr = a.time || '12:00 AM';
        const timeParts = timeStr.match(/(\d+):(\d+)\s(AM|PM)/i);
        let dt = new Date(`${a.date}T00:00:00`);
        if (timeParts) {
          let h = parseInt(timeParts[1]);
          if (timeParts[3].toUpperCase() === 'PM' && h !== 12) h += 12;
          if (timeParts[3].toUpperCase() === 'AM' && h === 12) h = 0;
          dt.setHours(h, parseInt(timeParts[2]), 0, 0);
        }
        return dt >= now;
      })
      .sort((a, b) => {
        if (a.date !== b.date) return a.date.localeCompare(b.date);
        
        const parseTime = (t) => {
          const p = (t || '12:00 AM').match(/(\d+):(\d+)\s(AM|PM)/i);
          if (!p) return 0;
          let h = parseInt(p[1]);
          if (p[3].toUpperCase() === 'PM' && h !== 12) h += 12;
          if (p[3].toUpperCase() === 'AM' && h === 12) h = 0;
          return h * 60 + parseInt(p[2]);
        };
        return parseTime(a.time) - parseTime(b.time);
      })
      .slice(0, 5);

    callback({
      totalPatients,
      todayAppointments,
      pendingApprovals,
      totalInquiries,
      monthlyData,
      upcoming,
    });
  };

  const unsubAppts = onSnapshot(query(collection(db, 'appointments')), (snap) => {
    appointments = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    autoCompletePastAppointments(appointments); // Trigger silent sweeping
    checkEmit();
  });

  const unsubInq = onSnapshot(query(collection(db, 'inquiries')), (snap) => {
    inquiries = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    checkEmit();
  });

  const unsubUsers = onSnapshot(query(collection(db, 'users')), (snap) => {
    totalPatients = snap.size;
    checkEmit();
  });

  return () => {
    unsubAppts();
    unsubInq();
    unsubUsers();
  };
}
