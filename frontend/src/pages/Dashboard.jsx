import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { subscribeAppointments, cancelAppointment } from '../services/appointmentService';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { FiCalendar, FiFileText, FiCreditCard, FiGrid, FiSearch, FiBell, FiDownload, FiPlus } from 'react-icons/fi';

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', Icon: FiGrid },
  { id: 'appointments', label: 'My Appointments', Icon: FiCalendar },
  { id: 'records', label: 'Records', Icon: FiFileText },
  { id: 'billing', label: 'Billing', Icon: FiCreditCard },
];

const STATUS_STYLE = {
  'completed':       { background: '#f0fdf4', color: '#16a34a', border: '#bbf7d0' },
  'accepted':        { background: '#f0fdf4', color: '#16a34a', border: '#bbf7d0' },
  'pending':         { background: '#fffbeb', color: '#d97706', border: '#fde68a' },
  'rescheduled':     { background: '#fffbeb', color: '#d97706', border: '#fde68a' },
  'rejected':        { background: '#fef2f2', color: '#dc2626', border: '#fecaca' },
  'cancelled':       { background: '#fef2f2', color: '#dc2626', border: '#fecaca' },
};

export default function Dashboard() {
  const { currentUser, logout } = useAuth();
  const [activeNav, setActiveNav] = useState('dashboard');
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (!currentUser) { navigate('/login'); return; }
    
    setLoading(true);
    const unsubscribe = subscribeAppointments(currentUser.uid, (data) => {
      setAppointments(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [currentUser, navigate]);

  async function handleCancel(id) {
    try {
      await cancelAppointment(id);
      toast.success('Appointment cancelled');
    } catch { toast.error('Failed to cancel'); }
  }

  const now = new Date();

  function parseDateTime(dateStr, timeStr) {
    if (!dateStr) return new Date(0);
    if (!timeStr) return new Date(`${dateStr}T00:00:00`);
    let [time, modifier] = timeStr.split(' ');
    if (!modifier) {
      if (timeStr.split(':').length === 2) timeStr += ':00';
      return new Date(`${dateStr}T${timeStr}`);
    }
    let [hours, minutes] = time.split(':');
    hours = parseInt(hours, 10);
    if (hours === 12) hours = modifier.toUpperCase() === 'AM' ? 0 : 12;
    else if (modifier.toUpperCase() === 'PM') hours += 12;
    const paddedHours = hours.toString().padStart(2, '0');
    return new Date(`${dateStr}T${paddedHours}:${minutes}:00`);
  }

  const upcomingAppointments = [];
  const historyAppointments = [];

  appointments.forEach(a => {
    const dateTime = parseDateTime(a.date, a.time);
    if (a.status === 'accepted') {
      if (dateTime > now) upcomingAppointments.push(a);
      else historyAppointments.push(a);
    } else {
      historyAppointments.push(a);
    }
  });

  upcomingAppointments.sort((a, b) => parseDateTime(a.date, a.time) - parseDateTime(b.date, b.time));
  historyAppointments.sort((a, b) => parseDateTime(b.date, b.time) - parseDateTime(a.date, a.time));

  const name = currentUser?.displayName || currentUser?.email?.split('@')[0] || 'Patient';

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f8fafc', paddingTop: 64 }}>

      {/* ── Sidebar ── */}
      <motion.aside initial={{ x: -40, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ duration: 0.4 }}
        style={{ width: 230, flexShrink: 0, background: '#fff', borderRight: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', position: 'sticky', top: 64, height: 'calc(100vh - 64px)', overflowY: 'auto' }}>

        {/* User info */}
        <div style={{ padding: '24px 20px 16px', borderBottom: '1px solid #f1f5f9' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'linear-gradient(135deg, #2E3192, #06b6d4)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: '1rem', flexShrink: 0 }}>
              {name[0].toUpperCase()}
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#0f172a', truncate: true }}>{name}</div>
              <div style={{ fontSize: '0.72rem', color: '#94a3b8', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{currentUser?.email}</div>
            </div>
          </div>
          <div style={{ marginTop: 10, fontSize: '0.7rem', color: '#94a3b8', fontWeight: 500 }}>Patient Portal</div>
        </div>

        {/* Nav */}
        <nav style={{ padding: '12px 12px', flex: 1 }}>
          {NAV_ITEMS.map(({ id, label, Icon }) => (
            <button key={id} onClick={() => setActiveNav(id)}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                padding: '10px 12px', borderRadius: 8, border: 'none', textAlign: 'left', marginBottom: 2,
                background: activeNav === id ? '#eff6ff' : 'transparent',
                color: activeNav === id ? '#2E3192' : '#64748b',
                fontWeight: activeNav === id ? 700 : 500, fontSize: '0.875rem', cursor: 'pointer', transition: 'all 0.18s',
              }}>
              <Icon size={17} />
              {label}
            </button>
          ))}
        </nav>

        {/* Bottom user card */}
        <div style={{ padding: '16px', borderTop: '1px solid #f1f5f9' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 34, height: 34, borderRadius: '50%', background: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#475569', fontWeight: 700, fontSize: '0.85rem' }}>
              {name[0].toUpperCase()}
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontWeight: 600, fontSize: '0.82rem', color: '#0f172a' }}>{name}</div>
              <div style={{ fontSize: '0.7rem', color: '#94a3b8', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{currentUser?.email}</div>
            </div>
          </div>
        </div>
      </motion.aside>

      {/* ── Main Content ── */}
      <main style={{ flex: 1, overflowY: 'auto' }}>

        {/* Top bar */}
        <div style={{ background: '#fff', borderBottom: '1px solid #e2e8f0', padding: '12px 28px', display: 'flex', alignItems: 'center', gap: 16, position: 'sticky', top: 0, zIndex: 10 }}>
          <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
            <span>Dashboard</span> <span style={{ margin: '0 4px' }}>/</span>
            <span style={{ color: '#0f172a', fontWeight: 600 }}>Overview</span>
          </div>
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 8, maxWidth: 280, marginLeft: 'auto' }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <FiSearch size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search records..." className="form-control"
                style={{ paddingLeft: 32, fontSize: '0.85rem', padding: '8px 12px 8px 32px' }} />
            </div>
          </div>
          <button style={{ width: 36, height: 36, borderRadius: 8, border: '1px solid #e2e8f0', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <FiBell size={16} color="#64748b" />
          </button>
          <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg, #2E3192, #06b6d4)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: '0.85rem', flexShrink: 0 }}>
            {name[0].toUpperCase()}
          </div>
          <span style={{ fontWeight: 600, fontSize: '0.875rem', color: '#0f172a', whiteSpace: 'nowrap' }}>Welcome back, {name.split(' ')[0]}</span>
        </div>

        <div style={{ padding: '24px 28px' }}>

          {/* ── Upcoming appointment + stat cards ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20, marginBottom: 24 }}>

            {upcomingAppointments.length > 0 ? (
              upcomingAppointments.map(upcoming => (
                <div key={upcoming.id} style={{ background: '#fff', borderRadius: 14, border: '1px solid #e2e8f0', padding: '24px 28px', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 28, flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                      <div style={{ width: 52, height: 52, borderRadius: 12, background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <FiCalendar size={24} color="#2E3192" />
                      </div>
                      <div>
                        <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#2E3192', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 4 }}>Upcoming Visit</div>
                        <div style={{ fontWeight: 800, fontSize: '1.05rem', color: '#0f172a' }}>{upcoming.reason || 'General Consultation'}</div>
                        <div style={{ color: '#64748b', fontSize: '0.82rem' }}>With {upcoming.doctor}</div>
                      </div>
                    </div>
                    {/* Date & Time */}
                    <div style={{ display: 'flex', gap: 24, marginLeft: 'auto' }}>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontWeight: 800, fontSize: '1.4rem', color: '#0f172a', lineHeight: 1 }}>{new Date(upcoming.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</div>
                        <div style={{ fontSize: '0.68rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 0.5, marginTop: 4 }}>Date</div>
                      </div>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontWeight: 800, fontSize: '1.4rem', color: '#0f172a', lineHeight: 1 }}>{upcoming.time}</div>
                        <div style={{ fontSize: '0.68rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 0.5, marginTop: 4 }}>Time</div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 10, marginLeft: 'auto' }}>
                      <span style={{ display: 'flex', alignItems: 'center', padding: '5px 12px', borderRadius: 50, background: (STATUS_STYLE[upcoming.status] || STATUS_STYLE['pending']).background, color: (STATUS_STYLE[upcoming.status] || STATUS_STYLE['pending']).color, border: `1px solid ${(STATUS_STYLE[upcoming.status] || STATUS_STYLE['pending']).border}`, fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase' }}>
                        {upcoming.status === 'accepted' ? 'CONFIRMED' : upcoming.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e2e8f0', padding: '24px 28px', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
                  <div style={{ width: 52, height: 52, borderRadius: 12, background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <FiCalendar size={24} color="#2E3192" />
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '1rem', color: '#0f172a', marginBottom: 4 }}>No upcoming appointments</div>
                    <div style={{ color: '#64748b', fontSize: '0.85rem' }}>Book your next visit to get started.</div>
                  </div>
                  <Link to="/book" className="btn-primary" style={{ marginLeft: 'auto' }}>
                    <FiPlus size={15} /> Book Now
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* ── Treatment History ── */}
          <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e2e8f0', padding: '24px 28px', marginBottom: 24, boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <h3 style={{ fontWeight: 800, fontSize: '1rem', color: '#0f172a' }}>Appointment History</h3>
              <button style={{ color: '#2E3192', fontSize: '0.85rem', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer' }}>
                View All Records
              </button>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    {['DATE', 'TIME', 'STATUS', 'ACTION'].map(h => (
                      <th key={h} style={{ textAlign: 'left', padding: '10px 14px', fontSize: '0.72rem', fontWeight: 700, color: '#94a3b8', letterSpacing: 0.5, borderBottom: '1px solid #f1f5f9' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {historyAppointments.length === 0 ? (
                    <tr>
                      <td colSpan="4" style={{ textAlign: 'center', padding: '24px', color: '#64748b', fontSize: '0.85rem' }}>
                        No history records found.
                      </td>
                    </tr>
                  ) : (
                    historyAppointments.map((a) => (
                      <tr key={a.id} style={{ borderBottom: '1px solid #f8fafc' }}>
                        <td style={{ padding: '14px', fontSize: '0.875rem', color: '#475569' }}>
                          <span style={{ fontWeight: 600, color: '#0f172a' }}>{new Date(a.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                        </td>
                        <td style={{ padding: '14px', fontSize: '0.875rem', fontWeight: 600, color: '#0f172a' }}>{a.time}</td>
                        <td style={{ padding: '14px' }}>
                          <span style={{ padding: '4px 10px', borderRadius: 50, fontSize: '0.75rem', fontWeight: 600, textTransform: 'capitalize', ...(STATUS_STYLE[a.status] || STATUS_STYLE['pending']) }}>
                            {a.status === 'accepted' ? 'completed' : a.status}
                          </span>
                        </td>
                        <td style={{ padding: '14px' }}>
                          {a.status === 'pending' && (
                            <button onClick={() => handleCancel(a.id)} style={{ color: '#dc2626', fontSize: '0.82rem', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer' }}>
                              Cancel
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* ── Quick Actions ── */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
            {[
              { label: 'Pay Bill', icon: '💳', color: '#2E3192' },
              { label: 'New Booking', icon: '➕', color: '#2E3192', href: '/book' },
              { label: 'Insurance', icon: '📋', color: '#2E3192' },
              { label: 'Care Guide', icon: '❓', color: '#2E3192' },
            ].map(({ label, icon, color, href }) => (
              <Link key={label} to={href || '#'}
                style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, padding: '20px 16px', textAlign: 'center', boxShadow: '0 1px 4px rgba(0,0,0,0.05)', transition: 'all 0.2s', display: 'block' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = '#2E3192'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(37,99,235,0.1)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.05)'; }}>
                <div style={{ fontSize: '1.4rem', marginBottom: 8 }}>{icon}</div>
                <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#0f172a' }}>{label}</div>
              </Link>
            ))}
          </div>
        </div>
      </main>


    </div>
  );
}
