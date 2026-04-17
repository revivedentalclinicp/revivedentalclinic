import { useEffect, useState } from 'react';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { FiUser, FiSearch, FiMail, FiPhone, FiCalendar } from 'react-icons/fi';

export default function AdminRecords() {
  const [users, setUsers] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // ── Real-time fetch: users ──────────────────────────────────────
  useEffect(() => {
    const q = query(collection(db, 'users'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, (snap) => {
      setUsers(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, []);

  // ── Real-time fetch: appointments ──────────────────────────────
  useEffect(() => {
    const q = query(collection(db, 'appointments'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, (snap) => {
      setAppointments(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });
    return () => unsub();
  }, []);

  // ── Build patient records by joining users + appointments ──────
  const records = users.map(user => {
    // Match appointments by userId OR by email (fallback)
    const userAppointments = appointments.filter(a =>
      (a.userId && a.userId === user.uid) ||
      (a.email && user.email && a.email.toLowerCase() === user.email.toLowerCase())
    );

    // Last visit: most recent appointment date that has passed
    const now = new Date();
    const pastAppointments = userAppointments.filter(a => {
      if (!a.date) return false;
      return new Date(a.date + 'T00:00:00') < now;
    });

    pastAppointments.sort((a, b) => {
      const da = new Date(a.date + 'T00:00:00');
      const db2 = new Date(b.date + 'T00:00:00');
      return db2 - da;
    });

    const lastVisit = pastAppointments[0]?.date || null;

    return {
      ...user,
      totalAppointments: userAppointments.length,
      lastVisit,
    };
  });

  // ── Filter by search ───────────────────────────────────────────
  const filtered = records.filter(r =>
    (r.name || r.displayName || '').toLowerCase().includes(search.toLowerCase()) ||
    (r.email || '').toLowerCase().includes(search.toLowerCase()) ||
    (r.phone || '').includes(search)
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
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2 style={{ fontWeight: 800, fontSize: '1.2rem', color: '#0f172a', marginBottom: 4 }}>
            Patient Records
          </h2>
          <p style={{ color: '#94a3b8', fontSize: '0.82rem' }}>
            Real-time data from Firestore — {records.length} patients registered
          </p>
        </div>
        <div style={{ position: 'relative' }}>
          <FiSearch size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name, email, phone..."
            className="form-control"
            style={{ paddingLeft: 32, width: 280, fontSize: '0.85rem' }}
          />
        </div>
      </div>

      {/* Summary badges */}
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 20 }}>
        {[
          { label: 'Total Patients', count: records.length, color: '#3B3F97', bg: '#ECEDF8' },
          { label: 'With Appointments', count: records.filter(r => r.totalAppointments > 0).length, color: '#16a34a', bg: '#f0fdf4' },
          { label: 'No Appointments', count: records.filter(r => r.totalAppointments === 0).length, color: '#d97706', bg: '#fffbeb' },
        ].map(({ label, count, color, bg }) => (
          <div key={label} style={{ background: bg, padding: '8px 16px', borderRadius: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600 }}>{label}</span>
            <span style={{ fontSize: '1rem', fontWeight: 800, color }}>{count}</span>
          </div>
        ))}
      </div>

      {/* Table */}
      <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e2e8f0', boxShadow: '0 1px 4px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
        <div className="table-responsive" style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 750 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                {['Patient', 'Email', 'Phone', 'Total Visits', 'Last Visit'].map(h => (
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
                  <td colSpan={5} style={{ textAlign: 'center', padding: '48px 16px', color: '#94a3b8' }}>
                    <div style={{ fontSize: '2rem', marginBottom: 8 }}>👤</div>
                    <div>{search ? 'No patients match your search.' : 'No patients registered yet.'}</div>
                  </td>
                </tr>
              ) : (
                filtered.map(r => (
                  <tr key={r.id} style={{ borderBottom: '1px solid #f8fafc' }}>
                    {/* Patient Name */}
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{
                          width: 36, height: 36, borderRadius: '50%',
                          background: 'linear-gradient(135deg, #2E3192, #06b6d4)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          color: '#fff', fontWeight: 800, fontSize: '0.85rem', flexShrink: 0,
                        }}>
                          {(r.name || r.displayName || r.email || '?')[0].toUpperCase()}
                        </div>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#0f172a' }}>
                            {r.name || r.displayName || '—'}
                          </div>
                          <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Patient</div>
                        </div>
                      </div>
                    </td>
                    {/* Email */}
                    <td style={{ padding: '14px 16px' }}>
                      {r.email ? (
                        <a href={`mailto:${r.email}`} style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#475569', fontSize: '0.85rem', textDecoration: 'none' }}>
                          <FiMail size={13} /> {r.email}
                        </a>
                      ) : <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>—</span>}
                    </td>
                    {/* Phone */}
                    <td style={{ padding: '14px 16px' }}>
                      {r.phone ? (
                        <a href={`tel:${r.phone}`} style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#475569', fontSize: '0.85rem', textDecoration: 'none' }}>
                          <FiPhone size={13} /> {r.phone}
                        </a>
                      ) : <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>—</span>}
                    </td>
                    {/* Total Appointments */}
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <FiCalendar size={14} color="#3B3F97" />
                        <span style={{
                          fontWeight: 700, fontSize: '0.95rem',
                          color: r.totalAppointments > 0 ? '#3B3F97' : '#94a3b8',
                        }}>
                          {r.totalAppointments}
                        </span>
                        <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
                          {r.totalAppointments === 1 ? 'visit' : 'visits'}
                        </span>
                      </div>
                    </td>
                    {/* Last Visit */}
                    <td style={{ padding: '14px 16px', fontSize: '0.85rem', color: '#475569' }}>
                      {r.lastVisit
                        ? new Date(r.lastVisit + 'T00:00:00').toLocaleDateString('en-IN', {
                            day: 'numeric', month: 'short', year: 'numeric',
                          })
                        : <span style={{ color: '#94a3b8' }}>No visits yet</span>
                      }
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
