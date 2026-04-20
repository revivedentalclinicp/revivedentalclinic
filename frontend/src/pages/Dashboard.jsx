import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { subscribeAppointments, cancelAppointment, updateAppointment } from '../services/appointmentService';
import { subscribeNotifications, markNotificationAsRead } from '../services/notificationService';
import { subscribeUserProfile, updateUserProfile } from '../services/userService';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { FiCalendar, FiFileText, FiGrid, FiSearch, FiBell, FiUser, FiPhoneCall, FiX, FiCheckCircle, FiClock, FiSettings } from 'react-icons/fi';

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', Icon: FiGrid },
  { id: 'appointments', label: 'My Appointments', Icon: FiCalendar },
  { id: 'profile', label: 'Edit Profile', Icon: FiUser },
  { id: 'records', label: 'Records', Icon: FiFileText },
];

const STATUS_STYLE = {
  'completed':            { background: '#f0fdf4', color: '#16a34a', border: '#bbf7d0' },
  'accepted':             { background: '#f0fdf4', color: '#16a34a', border: '#bbf7d0' },
  'pending':              { background: '#fffbeb', color: '#d97706', border: '#fde68a' },
  'rescheduled':          { background: '#fffbeb', color: '#d97706', border: '#fde68a' },
  'reschedule_requested': { background: '#fdf4ff', color: '#c026d3', border: '#f5d0fe' },
  'rejected':             { background: '#fef2f2', color: '#dc2626', border: '#fecaca' },
  'cancelled':            { background: '#fef2f2', color: '#dc2626', border: '#fecaca' },
};

function parseDateTime(dateStr, timeStr) {
  if (!dateStr) return new Date(0);
  if (!timeStr) return new Date(`${dateStr}T00:00:00`);
  let timeMatch = timeStr.match(/(\d+):(\d+)\s(AM|PM)/i);
  if (!timeMatch) return new Date(`${dateStr}T00:00:00`);
  let hours = parseInt(timeMatch[1]);
  let mins = parseInt(timeMatch[2]);
  let modifier = timeMatch[3].toUpperCase();
  if (hours === 12) hours = modifier === 'AM' ? 0 : 12;
  else if (modifier === 'PM') hours += 12;
  const d = new Date(`${dateStr}T00:00:00`);
  d.setHours(hours, mins, 0, 0);
  return d;
}

const TIMES = ['09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM'];

// ── Profile Subcomponent ─────────────────────────────────────
function ProfileView({ currentUser, profile }) {
  const [formData, setFormData] = useState({
    name: profile?.name || currentUser?.displayName || '',
    phone: profile?.phone || '',
    gender: profile?.gender || '',
    age: profile?.age || '',
    bloodGroup: profile?.bloodGroup || '',
    address: profile?.address || '',
    city: profile?.city || '',
  });
  const [saving, setSaving] = useState(false);

  const fields = ['name', 'phone', 'gender', 'age', 'bloodGroup', 'address', 'city'];
  const filled = fields.filter(f => !!formData[f]).length;
  const compPercent = Math.round((filled / fields.length) * 100);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.phone) return toast.error('Name and Phone are required.');
    setSaving(true);
    try {
      await updateUserProfile(currentUser.uid, {
        ...formData,
        age: Number(formData.age) || null
      });
      toast.success('Profile updated successfully!');
    } catch {
      toast.error('Failed to save profile');
    }
    setSaving(false);
  };

  return (
    <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e2e8f0', padding: '32px', boxShadow: '0 1px 4px rgba(0,0,0,0.05)', maxWidth: 700, margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h2 style={{ fontWeight: 800, fontSize: '1.4rem', color: '#0f172a' }}>My Profile</h2>
          <p style={{ color: '#64748b', fontSize: '0.85rem' }}>Manage your personal details and clinic mapping parameters.</p>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontWeight: 800, fontSize: '1.2rem', color: compPercent === 100 ? '#16a34a' : '#2E3192' }}>{compPercent}%</div>
          <div style={{ fontSize: '0.65rem', textTransform: 'uppercase', color: '#94a3b8', fontWeight: 600, letterSpacing: 0.5 }}>Completed</div>
        </div>
      </div>

      <form onSubmit={handleSave} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        <div style={{ gridColumn: '1 / -1' }}>
          <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: 6 }}>Email Address (Read-Only)</label>
          <input readOnly value={currentUser?.email || ''} className="form-control" style={{ background: '#f8fafc', color: '#94a3b8', cursor: 'not-allowed' }} />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: 6 }}>Full Name *</label>
          <input required value={formData.name} onChange={e=>setFormData({...formData, name: e.target.value})} className="form-control" placeholder="Jane Doe" />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: 6 }}>Phone Number *</label>
          <input required type="tel" value={formData.phone} onChange={e=>setFormData({...formData, phone: e.target.value})} className="form-control" placeholder="+91 XXXXX XXXXX" />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: 6 }}>Age</label>
          <input type="number" value={formData.age} onChange={e=>setFormData({...formData, age: e.target.value})} className="form-control" placeholder="28" />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: 6 }}>Gender</label>
          <select value={formData.gender} onChange={e=>setFormData({...formData, gender: e.target.value})} className="form-control">
            <option value="">Select Gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: 6 }}>Blood Group</label>
          <select value={formData.bloodGroup} onChange={e=>setFormData({...formData, bloodGroup: e.target.value})} className="form-control">
            <option value="">Select</option>
            <option value="A+">A+</option><option value="A-">A-</option>
            <option value="B+">B+</option><option value="B-">B-</option>
            <option value="O+">O+</option><option value="O-">O-</option>
            <option value="AB+">AB+</option><option value="AB-">AB-</option>
          </select>
        </div>
        
        <div>
          <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: 6 }}>City</label>
          <input value={formData.city} onChange={e=>setFormData({...formData, city: e.target.value})} className="form-control" placeholder="Pune" />
        </div>

        <div style={{ gridColumn: '1 / -1' }}>
          <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: 6 }}>Address</label>
          <textarea rows={2} value={formData.address} onChange={e=>setFormData({...formData, address: e.target.value})} className="form-control" placeholder="123 Dental Lane..." />
        </div>

        <div style={{ gridColumn: '1 / -1', marginTop: 10 }}>
          <button type="submit" disabled={saving} className="btn-primary" style={{ width: '100%', padding: '12px' }}>
            {saving ? 'Saving...' : 'Save Profile Details'}
          </button>
        </div>
      </form>
    </div>
  )
}


export default function Dashboard() {
  const { currentUser } = useAuth();
  const [activeNav, setActiveNav] = useState('dashboard');
  const [appointments, setAppointments] = useState([]);
  const [profile, setProfile] = useState({});
  const [notifications, setNotifications] = useState([]);
  const [notifOpen, setNotifOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Reschedule state
  const [rescheduleModal, setRescheduleModal] = useState(null);
  const [newDate, setNewDate] = useState('');
  const [newTime, setNewTime] = useState('');

  useEffect(() => {
    if (!currentUser) { navigate('/login'); return; }
    
    setLoading(true);
    const unsubApp = subscribeAppointments(currentUser.uid, (data) => {
      setAppointments(data);
      setLoading(false);
    });

    const unsubNotif = subscribeNotifications(currentUser.uid, (data) => {
      setNotifications(data);
    });

    const unsubProf = subscribeUserProfile(currentUser.uid, (data) => {
      if (data) setProfile(data);
    });

    return () => { unsubApp(); unsubNotif(); unsubProf(); };
  }, [currentUser, navigate]);

  async function handleCancel(id) {
    try {
      await cancelAppointment(id);
      toast.success('Appointment cancelled');
    } catch { toast.error('Failed to cancel'); }
  }

  async function submitReschedule(e) {
    e.preventDefault();
    if (!newDate || !newTime) return toast.error('Date and time required');
    try {
      await updateAppointment(rescheduleModal.id, {
        status: 'reschedule_requested',
        newRequestedDate: newDate,
        newRequestedTime: newTime
      });
      toast.success('Reschedule request sent to clinic!');
      setRescheduleModal(null);
      setNewDate('');
      setNewTime('');
    } catch {
      toast.error('Failed to submit reschedule');
    }
  }

  const now = new Date();

  // ── Appointment splits ────────────────────────────────
  const upcomingAppointments = [];
  const pendingRequests = [];
  const historyAppointments = [];

  appointments.forEach(a => {
    const isPast = parseDateTime(a.date, a.time) < now;
    if (a.status === 'pending') {
      pendingRequests.push(a);
    } else if ((a.status === 'accepted' || a.status === 'reschedule_requested') && !isPast) {
      upcomingAppointments.push(a);
    } else if (
      isPast ||
      ['completed', 'rejected', 'cancelled', 'rescheduled'].includes(a.status)
    ) {
      historyAppointments.push(a);
    }
  });

  upcomingAppointments.sort((a, b) => parseDateTime(a.date, a.time) - parseDateTime(b.date, b.time));
  pendingRequests.sort((a, b) => parseDateTime(a.date, a.time) - parseDateTime(b.date, b.time));
  historyAppointments.sort((a, b) => parseDateTime(b.date, b.time) - parseDateTime(a.date, a.time));

  const name = profile?.name || currentUser?.displayName || currentUser?.email?.split('@')[0] || 'Patient';
  const unreadNotifs = notifications.filter(n => !n.read).length;

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f8fafc', paddingTop: 64 }}>

      {/* ── Sidebar ── */}
      <motion.aside initial={{ x: -40, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ duration: 0.4 }}
        className="md-hidden"
        style={{ width: 230, flexShrink: 0, background: '#fff', borderRight: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', position: 'sticky', top: 64, height: 'calc(100vh - 64px)', overflowY: 'auto' }}>
        
        <div style={{ padding: '24px 20px 16px', borderBottom: '1px solid #f1f5f9' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'linear-gradient(135deg, #2E3192, #06b6d4)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: '1rem', flexShrink: 0 }}>{name[0].toUpperCase()}</div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#0f172a', textOverflow: 'ellipsis', overflow: 'hidden' }}>{name}</div>
              <div style={{ fontSize: '0.72rem', color: '#94a3b8', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{currentUser?.email}</div>
            </div>
          </div>
          <div style={{ marginTop: 10, fontSize: '0.7rem', color: '#94a3b8', fontWeight: 500 }}>Patient Portal</div>
        </div>

        <nav style={{ padding: '12px 12px', flex: 1 }}>
          {NAV_ITEMS.map(({ id, label, Icon }) => (
            <button key={id} onClick={() => setActiveNav(id)}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 8, border: 'none', textAlign: 'left', marginBottom: 2,
                background: activeNav === id ? '#eff6ff' : 'transparent', color: activeNav === id ? '#2E3192' : '#64748b',
                fontWeight: activeNav === id ? 700 : 500, fontSize: '0.875rem', cursor: 'pointer', transition: 'all 0.18s',
              }}>
              <Icon size={17} />{label}
            </button>
          ))}
        </nav>
      </motion.aside>

      {/* ── Main Content ── */}
      <main style={{ flex: 1, overflowY: 'auto' }}>
        {/* Top bar */}
        <div className="sm-p-4" style={{ background: '#fff', borderBottom: '1px solid #e2e8f0', padding: '12px 28px', display: 'flex', alignItems: 'center', gap: 16, position: 'sticky', top: 0, zIndex: 10 }}>
          <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
            <span>Dashboard</span> <span style={{ margin: '0 4px' }}>/</span> <span style={{ color: '#0f172a', fontWeight: 600, textTransform: 'capitalize' }}>{activeNav}</span>
          </div>
          <div style={{ flex: 1, marginLeft: 'auto', display: 'flex', justifyContent: 'flex-end', gap: 10, alignItems: 'center' }}>
            
            <div style={{ position: 'relative' }}>
              <button 
                onClick={() => setNotifOpen(!notifOpen)}
                style={{ width: 36, height: 36, borderRadius: 8, border: '1px solid #e2e8f0', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', position: 'relative' }}
              >
                <FiBell size={16} color="#64748b" />
                {unreadNotifs > 0 && <span style={{ position: 'absolute', top: -4, right: -4, background: '#ef4444', color: '#fff', fontSize: '0.6rem', fontWeight: 800, width: 16, height: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 50 }}>{unreadNotifs}</span>}
              </button>
              {/* Notif Dropdown */}
              <AnimatePresence>
                {notifOpen && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} style={{ position: 'absolute', top: 45, right: 0, width: 300, background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', padding: 12, zIndex: 50 }}>
                    <h4 style={{ fontSize: '0.85rem', fontWeight: 700, paddingBottom: 8, borderBottom: '1px solid #f1f5f9', marginBottom: 8, color: '#0f172a' }}>Notifications</h4>
                    {notifications.length === 0 ? <p style={{ fontSize: '0.8rem', color: '#94a3b8', textAlign: 'center', padding: '10px 0' }}>No notifications yet</p> : (
                      <div style={{ maxHeight: 300, overflowY: 'auto' }}>
                        {notifications.map(n => (
                          <div key={n.id} onClick={() => { if(!n.read) markNotificationAsRead(n.id); }} style={{ padding: '10px', background: n.read ? 'transparent' : '#f0fdf4', borderRadius: 8, fontSize: '0.8rem', cursor: 'pointer', marginBottom: 4, display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                             <div style={{ width: 6, height: 6, background: n.read ? 'transparent' : '#16a34a', borderRadius: '50%', marginTop: 6 }}/>
                             <div>
                               <div style={{ color: '#0f172a', fontWeight: n.read ? 500 : 700 }}>{n.message}</div>
                               <div style={{ fontSize: '0.65rem', color: '#94a3b8', marginTop: 4 }}>{n.createdAt?.toDate().toLocaleDateString()}</div>
                             </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg, #2E3192, #06b6d4)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: '0.85rem', flexShrink: 0 }}>{name[0].toUpperCase()}</div>
          </div>
        </div>

        <div className="sm-p-4" style={{ padding: '24px 28px' }}>
          
          {loading ? (
             <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 300 }}>
               <span className="spinner" style={{ borderColor: '#e2e8f0', borderTopColor: '#3B3F97', width: 32, height: 32 }} />
             </div>
          ) : activeNav === 'profile' ? (
             <ProfileView currentUser={currentUser} profile={profile} />
          ) : activeNav === 'dashboard' ? (
            <>
              {/* ── Welcome & Quick Actions ── */}
              <div style={{ marginBottom: 32 }}>
                <h1 style={{ fontWeight: 800, fontSize: '1.8rem', color: '#0f172a', marginBottom: 6 }}>Welcome, {name.split(' ')[0]} 👋</h1>
                <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: 20 }}>Manage your dental appointments, view records, and update details directly from your portal.</p>
                
                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                   <Link to="/book" className="btn-primary" style={{ padding: '10px 20px', display: 'flex', alignItems: 'center', gap: 8 }}><FiCalendar/> Book Appointment</Link>
                   <a href="tel:8669062290" className="btn-secondary" style={{ padding: '10px 20px', display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}><FiPhoneCall/> Contact Clinic</a>
                </div>
              </div>

              {/* ── Summary Stats ── */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 32 }}>
                <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e2e8f0', padding: 20, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                  <div style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', marginBottom: 8 }}>Upcoming Visists</div>
                  <div style={{ fontSize: '2rem', fontWeight: 800, color: '#2E3192' }}>{upcomingAppointments.length}</div>
                </div>
                <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e2e8f0', padding: 20, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                  <div style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', marginBottom: 8 }}>Pending Requests</div>
                  <div style={{ fontSize: '2rem', fontWeight: 800, color: '#d97706' }}>{pendingRequests.length}</div>
                </div>
              </div>

              {/* ── Next Upcoming (Nearest 1) ── */}
              {upcomingAppointments.length > 0 && (
                <div style={{ marginBottom: 32 }}>
                  <h3 style={{ fontWeight: 800, fontSize: '1.1rem', color: '#0f172a', marginBottom: 16 }}>Next Appointment</h3>
                  <div className="sm-p-4" style={{ background: '#fff', borderRadius: 14, border: '1px solid #bbf7d0', borderLeft: '4px solid #16a34a', padding: '20px', boxShadow: '0 4px 15px rgba(22, 163, 74, 0.05)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                        <div style={{ width: 45, height: 45, borderRadius: 12, background: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <FiCalendar size={20} color="#16a34a" />
                        </div>
                        <div>
                          <div style={{ fontWeight: 800, fontSize: '1rem', color: '#0f172a' }}>{upcomingAppointments[0].reason || 'General Consultation'}</div>
                          <div style={{ color: '#64748b', fontSize: '0.82rem' }}>With {upcomingAppointments[0].doctor}</div>
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: 20, marginLeft: 'auto' }}>
                        <div style={{ textAlign: 'center' }}>
                          <div style={{ fontWeight: 800, fontSize: '1.1rem', color: '#0f172a' }}>{new Date(upcomingAppointments[0].date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</div>
                          <div style={{ fontSize: '0.65rem', color: '#94a3b8', textTransform: 'uppercase' }}>Date</div>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                          <div style={{ fontWeight: 800, fontSize: '1.1rem', color: '#0f172a' }}>{upcomingAppointments[0].time}</div>
                          <div style={{ fontSize: '0.65rem', color: '#94a3b8', textTransform: 'uppercase' }}>Time</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          ) : activeNav === 'appointments' ? (
            <>
              {/* ── All Upcoming Appointments ── */}
              <h3 style={{ fontWeight: 800, fontSize: '1.3rem', color: '#0f172a', marginBottom: 16 }}>Upcoming Appointments</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 32 }}>
                {upcomingAppointments.length > 0 ? (
                  upcomingAppointments.map(upcoming => (
                    <div key={upcoming.id} className="sm-p-4" style={{ background: '#fff', borderRadius: 14, border: '1px solid #e2e8f0', padding: '20px', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                          <div style={{ width: 45, height: 45, borderRadius: 12, background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <FiCalendar size={20} color="#2E3192" />
                          </div>
                          <div>
                            <div style={{ fontWeight: 800, fontSize: '1rem', color: '#0f172a' }}>{upcoming.reason || 'General Consultation'}</div>
                            <div style={{ color: '#64748b', fontSize: '0.82rem' }}>With {upcoming.doctor}</div>
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: 20, marginLeft: 'auto' }}>
                          <div style={{ textAlign: 'center' }}>
                            <div style={{ fontWeight: 800, fontSize: '1.1rem', color: '#0f172a' }}>{new Date(upcoming.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</div>
                            <div style={{ fontSize: '0.65rem', color: '#94a3b8', textTransform: 'uppercase' }}>Date</div>
                          </div>
                          <div style={{ textAlign: 'center' }}>
                            <div style={{ fontWeight: 800, fontSize: '1.1rem', color: '#0f172a' }}>{upcoming.time}</div>
                            <div style={{ fontSize: '0.65rem', color: '#94a3b8', textTransform: 'uppercase' }}>Time</div>
                          </div>
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 10, marginLeft: 'auto' }}>
                          <span style={{ padding: '5px 12px', borderRadius: 50, background: (STATUS_STYLE[upcoming.status] || STATUS_STYLE['pending']).background, color: (STATUS_STYLE[upcoming.status] || STATUS_STYLE['pending']).color, border: `1px solid ${(STATUS_STYLE[upcoming.status] || STATUS_STYLE['pending']).border}`, fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>
                            {upcoming.status === 'reschedule_requested' ? 'REQUESTED RESCHEDULE' : 'APPROVED'}
                          </span>
                          {upcoming.status !== 'reschedule_requested' && (
                             <button onClick={() => setRescheduleModal(upcoming)} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', color: '#475569', padding: '6px 12px', borderRadius: 8, fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' }}>
                               Request Reschedule
                             </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div style={{ padding: 30, background: '#fff', borderRadius: 14, border: '1px dashed #cbd5e1', textAlign: 'center' }}>
                    <div style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: 12 }}>No upcoming appointments scheduled</div>
                    <Link to="/book" className="btn-primary" style={{ display: 'inline-flex', padding: '8px 16px' }}>Book Now</Link>
                  </div>
                )}
              </div>

              {/* ── Pending Requests ── */}
              {pendingRequests.length > 0 && (
                <>
                  <h3 style={{ fontWeight: 800, fontSize: '1.1rem', color: '#0f172a', marginBottom: 16 }}>Pending Requests</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 32 }}>
                    {pendingRequests.map(pending => (
                      <div key={pending.id} className="sm-p-4" style={{ background: '#fff', borderRadius: 14, border: '1px solid #e2e8f0', padding: '16px 20px', boxShadow: '0 1px 4px rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <FiClock size={18} color="#d97706" />
                          <div>
                            <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#0f172a' }}>{new Date(pending.date).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })} at {pending.time}</div>
                            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Waiting for clinic confirmation</div>
                          </div>
                        </div>
                        <button onClick={() => handleCancel(pending.id)} style={{ color: '#dc2626', fontSize: '0.8rem', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer' }}>Cancel Request</button>
                      </div>
                    ))}
                  </div>
                </>
              )}

              {/* ── Treatment History ── */}
              <div id="history-section" style={{ background: '#fff', borderRadius: 14, border: '1px solid #e2e8f0', padding: '24px 28px', marginBottom: 24, boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
                <h3 style={{ fontWeight: 800, fontSize: '1rem', color: '#0f172a', marginBottom: 20 }}>Appointment History</h3>
                <div className="table-responsive" style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr>
                        {['DATE', 'TIME', 'CLINICIAN', 'STATUS'].map(h => (
                          <th key={h} style={{ textAlign: 'left', padding: '10px 14px', fontSize: '0.72rem', fontWeight: 700, color: '#94a3b8', letterSpacing: 0.5, borderBottom: '1px solid #f1f5f9' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {historyAppointments.length === 0 ? (
                        <tr><td colSpan="4" style={{ textAlign: 'center', padding: '24px', color: '#64748b', fontSize: '0.85rem' }}>No history records found.</td></tr>
                      ) : (
                        historyAppointments.map((a) => (
                          <tr key={a.id} style={{ borderBottom: '1px solid #f8fafc' }}>
                            <td style={{ padding: '14px', fontSize: '0.875rem', color: '#475569' }}>
                              <span style={{ fontWeight: 600, color: '#0f172a' }}>{new Date(a.date).toLocaleDateString()}</span>
                            </td>
                            <td style={{ padding: '14px', fontSize: '0.875rem', fontWeight: 600, color: '#0f172a' }}>{a.time}</td>
                            <td style={{ padding: '14px', fontSize: '0.875rem', color: '#475569' }}>{a.doctor}</td>
                            <td style={{ padding: '14px' }}>
                              <span style={{ padding: '4px 10px', borderRadius: 50, fontSize: '0.75rem', fontWeight: 600, textTransform: 'capitalize', ...(STATUS_STYLE[a.status] || STATUS_STYLE['pending']) }}>
                                {a.status}
                              </span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          ) : (
            <div style={{ padding: 40, textAlign: 'center', color: '#94a3b8' }}>Select an option from the sidebar</div>
          )}

        </div>
      </main>

      {/* ── Reschedule Modal ── */}
      {rescheduleModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: '#fff', padding: 32, borderRadius: 16, width: '90%', maxWidth: 400 }}>
            <h3 style={{ fontWeight: 800, fontSize: '1.2rem', marginBottom: 8, color: '#0f172a' }}>Request Reschedule</h3>
            <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: 24 }}>Select your newly preferred date and time. Your current appointment will be held until the clinic approves this change.</p>
            
            <form onSubmit={submitReschedule}>
              <div style={{ marginBottom: 16 }}>
                <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 600 }}>New Date</label>
                <input required type="date" value={newDate} onChange={e => setNewDate(e.target.value)} min={new Date().toISOString().split('T')[0]} className="form-control" />
              </div>
              <div style={{ marginBottom: 24 }}>
                <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 600 }}>New Time</label>
                <select required value={newTime} onChange={e => setNewTime(e.target.value)} className="form-control">
                  <option value="">Select Time</option>
                  {TIMES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div style={{ display: 'flex', gap: 12 }}>
                <button type="button" onClick={() => setRescheduleModal(null)} className="btn-secondary" style={{ flex: 1 }}>Cancel</button>
                <button type="submit" className="btn-primary" style={{ flex: 1 }}>Send Request</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
