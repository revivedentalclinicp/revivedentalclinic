import { useEffect, useState } from 'react';
import { getAllAppointments, updateAppointmentStatus, rescheduleAppointment } from '../../services/adminService';
import toast from 'react-hot-toast';
import { FiCheck, FiX, FiClock, FiSearch } from 'react-icons/fi';

const STATUS_COLORS = {
  pending:     { bg: '#fffbeb', color: '#d97706', border: '#fde68a' },
  accepted:    { bg: '#f0fdf4', color: '#16a34a', border: '#bbf7d0' },
  rejected:    { bg: '#fef2f2', color: '#dc2626', border: '#fecaca' },
  rescheduled: { bg: '#ECEDF8', color: '#3B3F97', border: '#B0B2DA' },
  cancelled:   { bg: '#f1f5f9', color: '#64748b', border: '#e2e8f0' },
};

export default function AdminAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [rescheduleModal, setRescheduleModal] = useState(null);
  const [newDate, setNewDate] = useState('');
  const [newTime, setNewTime] = useState('');

  useEffect(() => { fetchData(); }, []);

  async function fetchData() {
    try {
      const data = await getAllAppointments();
      setAppointments(data);
    } catch { toast.error('Failed to load appointments'); }
    setLoading(false);
  }

  async function handleStatusChange(id, status) {
    try {
      await updateAppointmentStatus(id, status);
      toast.success(`Appointment ${status}`);
      fetchData();
    } catch { toast.error('Failed to update'); }
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

  const filtered = appointments.filter(a =>
    (a.name || '').toLowerCase().includes(search.toLowerCase()) ||
    (a.phone || '').includes(search) ||
    (a.service || '').toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 300 }}>
        <span className="spinner" style={{ borderColor: '#e2e8f0', borderTopColor: '#3B3F97', width: 32, height: 32 }} />
      </div>
    );
  }

  return (
    <div>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: 20, flexWrap: 'wrap', gap: 12,
      }}>
        <h2 style={{ fontWeight: 800, fontSize: '1.2rem', color: '#0f172a' }}>
          Appointment Management
        </h2>
        <div style={{ position: 'relative' }}>
          <FiSearch size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search by name, phone, service..."
            className="form-control"
            style={{ paddingLeft: 32, width: 280, fontSize: '0.85rem' }}
          />
        </div>
      </div>

      <div style={{
        background: '#fff', borderRadius: 14, border: '1px solid #e2e8f0',
        boxShadow: '0 1px 4px rgba(0,0,0,0.05)', overflow: 'hidden',
      }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 700 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                {['Name', 'Phone', 'Service', 'Date', 'Time', 'Status', 'Actions'].map(h => (
                  <th key={h} style={{
                    textAlign: 'left', padding: '14px 16px', fontSize: '0.72rem',
                    fontWeight: 700, color: '#94a3b8', letterSpacing: 0.5,
                    textTransform: 'uppercase',
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '40px 16px', color: '#94a3b8' }}>
                    No appointments found
                  </td>
                </tr>
              ) : (
                filtered.map(a => {
                  const sc = STATUS_COLORS[a.status] || STATUS_COLORS.pending;
                  return (
                    <tr key={a.id} style={{ borderBottom: '1px solid #f8fafc' }}>
                      <td style={{ padding: '14px 16px', fontWeight: 600, fontSize: '0.88rem', color: '#0f172a' }}>
                        {a.name || '—'}
                      </td>
                      <td style={{ padding: '14px 16px', fontSize: '0.85rem', color: '#475569' }}>
                        {a.phone || '—'}
                      </td>
                      <td style={{ padding: '14px 16px', fontSize: '0.85rem', color: '#475569' }}>
                        {a.service || '—'}
                      </td>
                      <td style={{ padding: '14px 16px', fontSize: '0.85rem', color: '#475569' }}>
                        {a.date || '—'}
                      </td>
                      <td style={{ padding: '14px 16px', fontSize: '0.85rem', color: '#475569' }}>
                        {a.time || '—'}
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <span style={{
                          padding: '4px 10px', borderRadius: 50, fontSize: '0.75rem',
                          fontWeight: 700, background: sc.bg, color: sc.color,
                          border: `1px solid ${sc.border}`, textTransform: 'capitalize',
                        }}>
                          {a.status}
                        </span>
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ display: 'flex', gap: 6 }}>
                          {a.status === 'pending' && (
                            <>
                              <button
                                onClick={() => handleStatusChange(a.id, 'accepted')}
                                style={{
                                  padding: '5px 12px', borderRadius: 6,
                                  border: '1px solid #bbf7d0', background: '#f0fdf4',
                                  color: '#16a34a', fontWeight: 600, fontSize: '0.78rem',
                                  cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4,
                                }}
                              >
                                <FiCheck size={13} /> Accept
                              </button>
                              <button
                                onClick={() => handleStatusChange(a.id, 'rejected')}
                                style={{
                                  padding: '5px 12px', borderRadius: 6,
                                  border: '1px solid #fecaca', background: '#fef2f2',
                                  color: '#dc2626', fontWeight: 600, fontSize: '0.78rem',
                                  cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4,
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
              {rescheduleModal.name} — {rescheduleModal.service}
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
                {['09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM'].map(t => (
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
