import { useEffect, useState } from 'react';
import { getAllAppointments, updateAppointmentStatus, rescheduleAppointment } from '../../services/adminService';
import toast from 'react-hot-toast';
import { FiCheck, FiX, FiClock, FiSearch, FiMail, FiPhone } from 'react-icons/fi';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'https://revivedentalbackend.onrender.com';

const STATUS_COLORS = {
  pending:     { bg: '#fffbeb', color: '#d97706', border: '#fde68a' },
  accepted:    { bg: '#f0fdf4', color: '#16a34a', border: '#bbf7d0' },
  rejected:    { bg: '#fef2f2', color: '#dc2626', border: '#fecaca' },
  rescheduled: { bg: '#ECEDF8', color: '#3B3F97', border: '#B0B2DA' },
  cancelled:   { bg: '#f1f5f9', color: '#64748b', border: '#e2e8f0' },
};

const TIMES = ['09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM'];

export default function AdminAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [rescheduleModal, setRescheduleModal] = useState(null);
  const [newDate, setNewDate] = useState('');
  const [newTime, setNewTime] = useState('');
  const [actionLoading, setActionLoading] = useState(null); // appointmentId

  useEffect(() => { fetchData(); }, []);

  async function fetchData() {
    setLoading(true);
    try {
      const data = await getAllAppointments();
      setAppointments(data);
    } catch { toast.error('Failed to load appointments'); }
    setLoading(false);
  }

  /**
   * Send email notification to patient
   */
  async function sendUserEmail(appointment, status) {
    if (!appointment.email) return;
    try {
      await fetch(`${BACKEND_URL}/api/email/notify-user`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userEmail: appointment.email,
          userName:  appointment.name || 'Patient',
          status,
          date:      appointment.date,
          time:      appointment.time,
          doctor:    appointment.doctor,
        }),
      });
    } catch (e) {
      console.warn('Email notification failed:', e.message);
    }
  }

  async function handleStatusChange(appointment, status) {
    setActionLoading(appointment.id);
    try {
      await updateAppointmentStatus(appointment.id, status);
      toast.success(`Appointment ${status === 'accepted' ? 'approved ✓' : 'rejected'}`);
      // Send email to patient
      await sendUserEmail(appointment, status);
      fetchData();
    } catch { toast.error('Failed to update'); }
    setActionLoading(null);
  }

  async function handleReschedule() {
    if (!newDate || !newTime) { toast.error('Pick date and time'); return; }
    try {
      await rescheduleAppointment(rescheduleModal.id, newDate, newTime);
      toast.success('Appointment rescheduled');
      setRescheduleModal(null);
      setNewDate('');
      setNewTime('');
      fetchData();
    } catch { toast.error('Failed to reschedule'); }
  }

  const filtered = appointments.filter(a => {
    const matchStatus = filterStatus === 'all' || a.status === filterStatus;
    const matchSearch =
      (a.name || '').toLowerCase().includes(search.toLowerCase()) ||
      (a.phone || '').includes(search) ||
      (a.email || '').toLowerCase().includes(search.toLowerCase()) ||
      (a.doctor || '').toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 300 }}>
        <span className="spinner" style={{ borderColor: '#e2e8f0', borderTopColor: '#3B3F97', width: 32, height: 32 }} />
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <h2 style={{ fontWeight: 800, fontSize: '1.2rem', color: '#0f172a' }}>
          Appointment Management
        </h2>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
          {/* Status filter */}
          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            className="form-control"
            style={{ width: 'auto', fontSize: '0.85rem', padding: '7px 12px' }}
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="accepted">Accepted</option>
            <option value="rejected">Rejected</option>
            <option value="rescheduled">Rescheduled</option>
            <option value="cancelled">Cancelled</option>
          </select>
          {/* Search */}
          <div style={{ position: 'relative' }}>
            <FiSearch size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            <input
              value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search by name, email, phone..."
              className="form-control"
              style={{ paddingLeft: 32, width: 260, fontSize: '0.85rem' }}
            />
          </div>
        </div>
      </div>

      {/* Summary badges */}
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 20 }}>
        {[
          { label: 'Total', count: appointments.length, color: '#64748b', bg: '#f1f5f9' },
          { label: 'Pending', count: appointments.filter(a => a.status === 'pending').length, color: '#d97706', bg: '#fffbeb' },
          { label: 'Accepted', count: appointments.filter(a => a.status === 'accepted').length, color: '#16a34a', bg: '#f0fdf4' },
          { label: 'Rejected', count: appointments.filter(a => a.status === 'rejected').length, color: '#dc2626', bg: '#fef2f2' },
        ].map(({ label, count, color, bg }) => (
          <div key={label} style={{
            background: bg, padding: '8px 16px', borderRadius: 8,
            display: 'flex', alignItems: 'center', gap: 8,
          }}>
            <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600 }}>{label}</span>
            <span style={{ fontSize: '1rem', fontWeight: 800, color }}>{count}</span>
          </div>
        ))}
      </div>

      {/* Table */}
      <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e2e8f0', boxShadow: '0 1px 4px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 900 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                {['Patient', 'Contact', 'Doctor', 'Date', 'Time', 'Reason', 'Status', 'Actions'].map(h => (
                  <th key={h} style={{
                    textAlign: 'left', padding: '14px 16px', fontSize: '0.72rem',
                    fontWeight: 700, color: '#94a3b8', letterSpacing: 0.5, textTransform: 'uppercase',
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '48px 16px', color: '#94a3b8' }}>
                    <div style={{ fontSize: '2rem', marginBottom: 8 }}>📋</div>
                    <div>No appointments found</div>
                  </td>
                </tr>
              ) : (
                filtered.map(a => {
                  const sc = STATUS_COLORS[a.status] || STATUS_COLORS.pending;
                  const isActing = actionLoading === a.id;
                  return (
                    <tr key={a.id} style={{ borderBottom: '1px solid #f8fafc' }}>
                      {/* Patient */}
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ fontWeight: 600, fontSize: '0.88rem', color: '#0f172a' }}>{a.name || '—'}</div>
                        {a.email && (
                          <a href={`mailto:${a.email}`} style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#64748b', fontSize: '0.76rem', textDecoration: 'none', marginTop: 2 }}>
                            <FiMail size={11} /> {a.email}
                          </a>
                        )}
                      </td>
                      {/* Contact */}
                      <td style={{ padding: '14px 16px', fontSize: '0.85rem', color: '#475569' }}>
                        {a.phone ? (
                          <a href={`tel:${a.phone}`} style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#475569', textDecoration: 'none' }}>
                            <FiPhone size={12} /> {a.phone}
                          </a>
                        ) : '—'}
                      </td>
                      {/* Doctor */}
                      <td style={{ padding: '14px 16px', fontSize: '0.85rem', color: '#0f172a', fontWeight: 500 }}>
                        {a.doctor || '—'}
                      </td>
                      {/* Date */}
                      <td style={{ padding: '14px 16px', fontSize: '0.85rem', color: '#475569' }}>
                        {a.date ? new Date(a.date + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                      </td>
                      {/* Time */}
                      <td style={{ padding: '14px 16px', fontSize: '0.85rem', color: '#475569' }}>
                        {a.time || '—'}
                      </td>
                      {/* Reason */}
                      <td style={{ padding: '14px 16px', fontSize: '0.82rem', color: '#64748b', maxWidth: 160 }}>
                        <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {a.reason || '—'}
                        </div>
                      </td>
                      {/* Status */}
                      <td style={{ padding: '14px 16px' }}>
                        <span style={{
                          padding: '4px 10px', borderRadius: 50, fontSize: '0.74rem',
                          fontWeight: 700, background: sc.bg, color: sc.color,
                          border: `1px solid ${sc.border}`, textTransform: 'capitalize',
                          whiteSpace: 'nowrap',
                        }}>
                          {a.status}
                        </span>
                      </td>
                      {/* Actions */}
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                          {a.status === 'pending' && (
                            <>
                              <button
                                onClick={() => handleStatusChange(a, 'accepted')}
                                disabled={isActing}
                                style={{
                                  padding: '5px 12px', borderRadius: 6,
                                  border: '1px solid #bbf7d0', background: '#f0fdf4',
                                  color: '#16a34a', fontWeight: 600, fontSize: '0.78rem',
                                  cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4,
                                  opacity: isActing ? 0.6 : 1,
                                }}
                              >
                                {isActing ? <span className="spinner" style={{ width: 12, height: 12, borderWidth: 2, borderColor: '#bbf7d0', borderTopColor: '#16a34a' }} /> : <FiCheck size={13} />}
                                Approve
                              </button>
                              <button
                                onClick={() => handleStatusChange(a, 'rejected')}
                                disabled={isActing}
                                style={{
                                  padding: '5px 12px', borderRadius: 6,
                                  border: '1px solid #fecaca', background: '#fef2f2',
                                  color: '#dc2626', fontWeight: 600, fontSize: '0.78rem',
                                  cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4,
                                  opacity: isActing ? 0.6 : 1,
                                }}
                              >
                                <FiX size={13} /> Reject
                              </button>
                              <button
                                onClick={() => { setRescheduleModal(a); setNewDate(a.date || ''); setNewTime(a.time || ''); }}
                                style={{
                                  padding: '5px 12px', borderRadius: 6,
                                  border: '1px solid #B0B2DA', background: '#ECEDF8',
                                  color: '#3B3F97', fontWeight: 600, fontSize: '0.78rem',
                                  cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4,
                                }}
                              >
                                <FiClock size={13} /> Reschedule
                              </button>
                            </>
                          )}
                          {(a.status === 'accepted' || a.status === 'rescheduled') && (
                            <button
                              onClick={() => { setRescheduleModal(a); setNewDate(a.date || ''); setNewTime(a.time || ''); }}
                              style={{
                                padding: '5px 12px', borderRadius: 6,
                                border: '1px solid #B0B2DA', background: '#ECEDF8',
                                color: '#3B3F97', fontWeight: 600, fontSize: '0.78rem',
                                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4,
                              }}
                            >
                              <FiClock size={13} /> Reschedule
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Reschedule Modal ── */}
      {rescheduleModal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000, padding: 24,
        }}>
          <div style={{
            background: '#fff', borderRadius: 16, padding: '32px',
            maxWidth: 420, width: '100%', boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
          }}>
            <h3 style={{ fontWeight: 800, fontSize: '1.1rem', color: '#0f172a', marginBottom: 4 }}>
              Reschedule Appointment
            </h3>
            <p style={{ color: '#64748b', fontSize: '0.85rem', marginBottom: 20 }}>
              {rescheduleModal.name} — {rescheduleModal.doctor}
            </p>
            <div className="form-group">
              <label>New Date</label>
              <input
                type="date" className="form-control"
                value={newDate} onChange={e => setNewDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
            <div className="form-group">
              <label>New Time</label>
              <select className="form-control" value={newTime} onChange={e => setNewTime(e.target.value)}>
                <option value="">Select time...</option>
                {TIMES.map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
            <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
              <button
                onClick={() => setRescheduleModal(null)}
                style={{
                  flex: 1, padding: '10px', borderRadius: 8,
                  border: '1px solid #e2e8f0', background: '#fff',
                  color: '#475569', fontWeight: 600, cursor: 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleReschedule}
                className="btn-primary"
                style={{ flex: 1, justifyContent: 'center', padding: '10px' }}
              >
                Confirm Reschedule
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
