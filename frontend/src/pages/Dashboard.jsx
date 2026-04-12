import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { getAppointments, cancelAppointment } from '../services/appointmentService';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { FiCalendar, FiFileText, FiCreditCard, FiGrid, FiSearch, FiBell, FiDownload, FiPlus } from 'react-icons/fi';

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', Icon: FiGrid },
  { id: 'appointments', label: 'My Appointments', Icon: FiCalendar },
  { id: 'records', label: 'Records', Icon: FiFileText },
  { id: 'billing', label: 'Billing', Icon: FiCreditCard },
];

const MOCK_HISTORY = [
  { date: 'May 12, 2024', procedure: 'Deep Cleaning (Scaling)', dentist: 'Dr. Sarah Miller', status: 'Completed', action: 'Download' },
  { date: 'Mar 05, 2024', procedure: 'Digital X-Ray (Full Mouth)', dentist: 'Dr. James Chen', status: 'Completed', action: 'Download' },
  { date: 'Jan 22, 2024', procedure: 'Cavity Filling (Composite)', dentist: 'Dr. Sarah Miller', status: 'Follow-up Needed', action: 'View Notes' },
];

const STATUS_STYLE = {
  'Completed':       { background: '#f0fdf4', color: '#16a34a', border: '#bbf7d0' },
  'Follow-up Needed':{ background: '#fffbeb', color: '#d97706', border: '#fde68a' },
  'upcoming':        { background: '#eff6ff', color: '#2E3192', border: '#bfdbfe' },
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
    fetchAppointments();
  }, [currentUser]);

  async function fetchAppointments() {
    setLoading(true);
    try {
      const data = await getAppointments(currentUser.uid);
      setAppointments(data);
    } catch { toast.error('Failed to load appointments'); }
    setLoading(false);
  }

  async function handleCancel(id) {
    try {
      await cancelAppointment(id);
      toast.success('Appointment cancelled');
      fetchAppointments();
    } catch { toast.error('Failed to cancel'); }
  }

  const upcoming = appointments.find(a => a.status === 'upcoming');
  const name = currentUser?.displayName || currentUser?.email?.split('@')[0] || 'Alex';

  // Countdown mock
  const countdownData = { days: '03', hrs: '14', min: '22' };

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
          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 20, marginBottom: 24 }}>

            {/* Upcoming card */}
            <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e2e8f0', padding: '24px 28px', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
              {upcoming ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 28, flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <div style={{ width: 52, height: 52, borderRadius: 12, background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <FiCalendar size={24} color="#2E3192" />
                    </div>
                    <div>
                      <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#2E3192', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 4 }}>Upcoming Visit</div>
                      <div style={{ fontWeight: 800, fontSize: '1.05rem', color: '#0f172a' }}>{upcoming.service}</div>
                      <div style={{ color: '#64748b', fontSize: '0.82rem' }}>With {upcoming.dentist} · {upcoming.service}</div>
                    </div>
                  </div>
                  {/* Countdown */}
                  <div style={{ display: 'flex', gap: 16, marginLeft: 'auto' }}>
                    {[['Days', upcoming.date], ['Date', upcoming.date], ['Time', upcoming.time]].map(([label, val], i) => (
                      <div key={i} style={{ textAlign: 'center' }}>
                        <div style={{ fontWeight: 800, fontSize: '1.6rem', color: '#0f172a', lineHeight: 1 }}>{i === 0 ? '—' : val}</div>
                        <div style={{ fontSize: '0.68rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 0.5, marginTop: 4 }}>{label}</div>
                      </div>
                    ))}
                  </div>
                  <div style={{ display: 'flex', gap: 10, marginLeft: 'auto' }}>
                    <button onClick={() => handleCancel(upcoming.id)}
                      style={{ padding: '9px 18px', borderRadius: 8, border: '1.5px solid #e2e8f0', background: '#fff', color: '#475569', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer' }}>
                      Reschedule
                    </button>
                    <button style={{ padding: '9px 18px', borderRadius: 8, border: '1.5px solid #e2e8f0', background: '#fff', color: '#475569', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer' }}>
                      Add to Calendar
                    </button>
                    <span style={{ display: 'flex', alignItems: 'center', padding: '5px 12px', borderRadius: 50, background: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0', fontSize: '0.78rem', fontWeight: 700 }}>
                      CONFIRMED
                    </span>
                  </div>
                </div>
              ) : (
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
              )}
            </div>

            {/* Stat cards */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, minWidth: 180 }}>
              <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', padding: '16px 20px', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
                <div style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 600, marginBottom: 4, textTransform: 'uppercase', letterSpacing: 0.5 }}>Loyalty Points</div>
                <div style={{ fontWeight: 800, fontSize: '1.6rem', color: '#f59e0b' }}>1,250</div>
              </div>
              <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', padding: '16px 20px', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
                <div style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 600, marginBottom: 4, textTransform: 'uppercase', letterSpacing: 0.5 }}>Next Check-up</div>
                <div style={{ fontWeight: 800, fontSize: '1.2rem', color: '#0f172a' }}>Oct 2024</div>
              </div>
            </div>
          </div>

          {/* ── Treatment History ── */}
          <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e2e8f0', padding: '24px 28px', marginBottom: 24, boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <h3 style={{ fontWeight: 800, fontSize: '1rem', color: '#0f172a' }}>Recent Treatment History</h3>
              <button style={{ color: '#2E3192', fontSize: '0.85rem', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer' }}>
                View All Records
              </button>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    {['DATE', 'PROCEDURE', 'DENTIST', 'STATUS', 'ACTION'].map(h => (
                      <th key={h} style={{ textAlign: 'left', padding: '10px 14px', fontSize: '0.72rem', fontWeight: 700, color: '#94a3b8', letterSpacing: 0.5, borderBottom: '1px solid #f1f5f9' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[...MOCK_HISTORY, ...appointments.filter(a => a.status !== 'upcoming').slice(0, 3).map(a => ({
                    date: a.date, procedure: a.service, dentist: a.dentist, status: a.status === 'completed' ? 'Completed' : 'Cancelled', action: 'Download', id: a.id,
                  }))].map((row, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid #f8fafc' }}>
                      <td style={{ padding: '14px', fontSize: '0.875rem', color: '#475569' }}>{row.date}</td>
                      <td style={{ padding: '14px', fontSize: '0.875rem', fontWeight: 600, color: '#0f172a' }}>{row.procedure}</td>
                      <td style={{ padding: '14px', fontSize: '0.875rem', color: '#475569' }}>{row.dentist}</td>
                      <td style={{ padding: '14px' }}>
                        <span style={{ padding: '4px 10px', borderRadius: 50, fontSize: '0.75rem', fontWeight: 600, background: (STATUS_STYLE[row.status] || STATUS_STYLE['upcoming']).background, color: (STATUS_STYLE[row.status] || STATUS_STYLE['upcoming']).color, border: `1px solid ${(STATUS_STYLE[row.status] || STATUS_STYLE['upcoming']).border}` }}>
                          {row.status}
                        </span>
                      </td>
                      <td style={{ padding: '14px' }}>
                        <button style={{ display: 'flex', alignItems: 'center', gap: 5, color: '#2E3192', fontSize: '0.82rem', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer' }}>
                          <FiDownload size={13} /> {row.action}
                        </button>
                      </td>
                    </tr>
                  ))}
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
