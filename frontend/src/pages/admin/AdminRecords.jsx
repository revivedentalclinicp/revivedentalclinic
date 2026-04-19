import { useEffect, useState } from 'react';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { FiSearch, FiMail, FiPhone, FiCalendar, FiX, FiCheckCircle, FiClock, FiPlusCircle } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

const STATUS_COLORS = {
  pending:     { bg: '#fffbeb', color: '#d97706', border: '#fde68a' },
  accepted:    { bg: '#f0fdf4', color: '#16a34a', border: '#bbf7d0' },
  rejected:    { bg: '#fef2f2', color: '#dc2626', border: '#fecaca' },
  rescheduled: { bg: '#ECEDF8', color: '#3B3F97', border: '#B0B2DA' },
  cancelled:   { bg: '#f1f5f9', color: '#64748b', border: '#e2e8f0' },
  completed:   { bg: '#f3e8ff', color: '#7e22ce', border: '#d8b4fe' },
};

export default function AdminRecords() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  const [selectedPatient, setSelectedPatient] = useState(null);
  const navigate = useNavigate();

  // ── Real-time fetch: appointments only ──────────────────────────────
  useEffect(() => {
    const q = query(collection(db, 'appointments'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, (snap) => {
      setAppointments(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });
    return () => unsub();
  }, []);

  // ── Build dynamic patient records entirely from appointments ──────
  const groupedPatients = [];
  const map = new Map();

  appointments.forEach(a => {
    // Unique identifier primarily by phone, fallback to email, then name
    const key = a.phone || a.email || a.name || 'Unknown';
    if (!map.has(key)) {
      map.set(key, {
        id: a.userId || key,
        name: a.name || 'Unknown',
        phone: a.phone || '',
        email: a.email || '',
        appointments: []
      });
    }
    map.get(key).appointments.push(a);
  });

  const now = new Date();
  map.forEach((patient) => {
    // Sort their history from newest to oldest
    patient.appointments.sort((a, b) => (b.date || '').localeCompare(a.date || ''));
    
    // Find last completed or past appointment
    const past = patient.appointments.filter(a => {
      if (a.status === 'completed') return true;
      if (!a.date) return false;
      const d = new Date(`${a.date}T00:00:00`);
      return d < now;
    });
    
    patient.totalAppointments = patient.appointments.length;
    patient.lastVisit = past.length > 0 ? past[0].date : null;
    groupedPatients.push(patient);
  });

  // ── Filter by search ───────────────────────────────────────────
  const filtered = groupedPatients.filter(r =>
    (r.name || '').toLowerCase().includes(search.toLowerCase()) ||
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
            Dynamically grouped from bookings — {groupedPatients.length} unique patients found
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
          { label: 'Total Unique Patients', count: groupedPatients.length, color: '#3B3F97', bg: '#ECEDF8' },
          { label: 'Single Visit', count: groupedPatients.filter(r => r.totalAppointments === 1).length, color: '#16a34a', bg: '#f0fdf4' },
          { label: 'Returning', count: groupedPatients.filter(r => r.totalAppointments > 1).length, color: '#F58220', bg: '#FEF3E4' },
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
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 780 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #f1f5f9', background: '#fafbfc' }}>
                {['Patient', 'Email', 'Phone', 'Total Visits', 'Last Visit'].map(h => (
                  <th key={h} style={{
                    textAlign: 'left', padding: '14px 16px', fontSize: '0.72rem',
                    fontWeight: 700, color: '#64748b', letterSpacing: 0.5, textTransform: 'uppercase',
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '48px 16px', color: '#94a3b8' }}>
                    <div style={{ fontSize: '2rem', marginBottom: 8 }}>👤</div>
                    <div>{search ? 'No patients match your search.' : 'No appointment data available.'}</div>
                  </td>
                </tr>
              ) : (
                filtered.map(r => (
                  <tr 
                    key={r.id} 
                    onClick={() => setSelectedPatient(r)}
                    style={{ borderBottom: '1px solid #f8fafc', cursor: 'pointer', transition: 'background 0.15s' }}
                    className="hover-row"
                    onMouseEnter={(e) => e.currentTarget.style.background = '#f8fafc'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    {/* Patient Name */}
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{
                          width: 36, height: 36, borderRadius: '50%',
                          background: 'linear-gradient(135deg, #2E3192, #06b6d4)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          color: '#fff', fontWeight: 800, fontSize: '0.85rem', flexShrink: 0,
                        }}>
                          {(r.name || '?')[0].toUpperCase()}
                        </div>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#0f172a' }}>
                            {r.name}
                          </div>
                        </div>
                      </div>
                    </td>
                    {/* Email */}
                    <td style={{ padding: '14px 16px' }}>
                      {r.email ? (
                        <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#475569', fontSize: '0.85rem' }}>
                          <FiMail size={12} color="#94a3b8" /> {r.email}
                        </span>
                      ) : <span style={{ color: '#cbd5e1', fontSize: '0.85rem' }}>—</span>}
                    </td>
                    {/* Phone */}
                    <td style={{ padding: '14px 16px' }}>
                      {r.phone ? (
                        <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#475569', fontSize: '0.85rem' }}>
                          <FiPhone size={12} color="#94a3b8" /> {r.phone}
                        </span>
                      ) : <span style={{ color: '#cbd5e1', fontSize: '0.85rem' }}>—</span>}
                    </td>
                    {/* Total Appointments */}
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <FiCalendar size={14} color={r.totalAppointments > 0 ? '#3B3F97' : '#94a3b8'} />
                        <span style={{
                          fontWeight: 700, fontSize: '0.95rem',
                          color: r.totalAppointments > 0 ? '#3B3F97' : '#94a3b8',
                        }}>
                          {r.totalAppointments}
                        </span>
                      </div>
                    </td>
                    {/* Last Visit */}
                    <td style={{ padding: '14px 16px', fontSize: '0.85rem', color: '#475569' }}>
                      {r.lastVisit
                        ? new Date(r.lastVisit + 'T00:00:00').toLocaleDateString('en-IN', {
                            day: 'numeric', month: 'short', year: 'numeric',
                          })
                        : <span style={{ color: '#cbd5e1' }}>No past visits</span>
                      }
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Patient Details Modal ── */}
      {selectedPatient && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000, padding: 24,
        }}
        onClick={() => setSelectedPatient(null)}
        >
          <div style={{
            background: '#fff', borderRadius: 16, padding: '32px',
            maxWidth: 600, width: '100%', boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
            maxHeight: '90vh', display: 'flex', flexDirection: 'column'
          }}
          onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
              <div>
                <h3 style={{ fontWeight: 800, fontSize: '1.4rem', color: '#0f172a', marginBottom: 4 }}>
                  {selectedPatient.name}
                </h3>
                <div style={{ display: 'flex', gap: 12, fontSize: '0.85rem', color: '#64748b' }}>
                  {selectedPatient.phone && <span>📞 {selectedPatient.phone}</span>}
                  {selectedPatient.email && <span>✉️ {selectedPatient.email}</span>}
                </div>
              </div>
              <button 
                onClick={() => setSelectedPatient(null)}
                style={{ background: '#f1f5f9', border: 'none', padding: 8, borderRadius: 50, cursor: 'pointer', color: '#64748b' }}
              >
                <FiX size={18} />
              </button>
            </div>

            {/* Quick Actions */}
            <div style={{ display: 'flex', gap: 10, paddingBottom: 24, borderBottom: '1px solid #f1f5f9' }}>
               {selectedPatient.phone && (
                  <a 
                    href={`tel:${selectedPatient.phone}`}
                    className="btn-primary"
                    style={{ textDecoration: 'none', padding: '8px 16px', display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.85rem' }}
                  >
                    <FiPhone size={14} /> Call Patient
                  </a>
               )}
               <button 
                 onClick={() => {
                   setSelectedPatient(null);
                   navigate('/admin/appointments'); 
                 }}
                 style={{ 
                   background: '#f8fafc', border: '1px solid #e2e8f0', padding: '8px 16px', 
                   display: 'flex', alignItems: 'center', gap: 6, borderRadius: 8, color: '#475569',
                   fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer' 
                 }}
               >
                 <FiPlusCircle size={14} /> Book Again
               </button>
            </div>

            {/* History List */}
            <div style={{ flex: 1, overflowY: 'auto', marginTop: 24 }}>
               <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0f172a', marginBottom: 16 }}>Full Appointment History</h4>
               <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                 {selectedPatient.appointments.map((a, i) => {
                    const sc = STATUS_COLORS[a.status] || STATUS_COLORS.pending;
                    return (
                      <div key={a.id || i} style={{ 
                        border: '1px solid #e2e8f0', padding: 16, borderRadius: 10,
                        background: '#fafbfc'
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                           <span style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.9rem' }}>
                             {a.date ? new Date(a.date + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Unknown'} 
                             {' '}&bull;{' '}
                             {a.time || 'Time TBD'}
                           </span>
                           <span style={{
                              padding: '4px 10px', borderRadius: 50, fontSize: '0.7rem',
                              fontWeight: 700, background: sc.bg, color: sc.color,
                              border: `1px solid ${sc.border}`, textTransform: 'capitalize'
                            }}>
                              {a.status}
                            </span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#64748b', fontSize: '0.82rem', marginBottom: 8 }}>
                          <FiCheckCircle size={12} color="#94a3b8"/> {a.service || 'General Session'} with {a.doctor || 'Clinic'}
                          <span style={{ marginLeft: 8, padding: '2px 6px', background: '#f1f5f9', borderRadius: 4, fontSize: '0.65rem' }}>
                            Source: {a.source || 'Website'}
                          </span>
                        </div>
                        {a.reason && (
                          <div style={{ background: '#fff', border: '1px solid #f1f5f9', padding: 10, borderRadius: 8, fontSize: '0.8rem', color: '#475569' }}>
                            <span style={{ fontWeight: 600, color: '#0f172a' }}>Reason / Notes: </span>{a.reason}
                          </div>
                        )}
                      </div>
                    )
                 })}
               </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
