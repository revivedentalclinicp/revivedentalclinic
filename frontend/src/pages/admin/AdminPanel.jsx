import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  FiGrid, FiCalendar, FiMessageSquare, FiHelpCircle,
  FiLogOut, FiMenu, FiX, FiUsers, FiHome
} from 'react-icons/fi';
import AdminDashboard from './AdminDashboard';
import AdminAppointments from './AdminAppointments';
import AdminInquiries from './AdminInquiries';
import AdminFAQs from './AdminFAQs';
import AdminRecords from './AdminRecords';

const NAV = [
  { id: 'dashboard', label: 'Dashboard', Icon: FiGrid },
  { id: 'appointments', label: 'Appointments', Icon: FiCalendar },
  { id: 'records', label: 'Patient Records', Icon: FiUsers },
  { id: 'inquiries', label: 'Inquiries', Icon: FiMessageSquare },
  { id: 'faqs', label: 'FAQs', Icon: FiHelpCircle },
];

export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    navigate('/');
  }

  const name = currentUser?.displayName || currentUser?.email?.split('@')[0] || 'Admin';

  function renderContent() {
    switch (activeTab) {
      case 'dashboard':    return <AdminDashboard />;
      case 'appointments': return <AdminAppointments />;
      case 'records':      return <AdminRecords />;
      case 'inquiries':    return <AdminInquiries />;
      case 'faqs':         return <AdminFAQs />;
      default:             return <AdminDashboard />;
    }
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f8fafc', position: 'relative' }}>

      {/* ── Mobile overlay ── */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)',
            zIndex: 40,
          }}
          className="mobile-overlay md-block"
        />
      )}

      {/* ── Sidebar ── */}
      <aside
        style={{
          width: 250, flexShrink: 0, background: '#fff',
          borderRight: '1px solid #e2e8f0',
          display: 'flex', flexDirection: 'column',
          position: 'fixed', top: 0, left: sidebarOpen ? 0 : -250,
          height: '100vh', zIndex: 50,
          transition: 'left 0.3s ease',
          overflowY: 'auto',
        }}
        className={`admin-sidebar ${sidebarOpen ? 'open' : ''}`}
      >
        {/* Brand */}
        <div style={{
          padding: '24px 20px 16px',
          borderBottom: '1px solid #f1f5f9',
          display: 'flex', alignItems: 'center', gap: 10,
        }}>
          <div 
            onClick={() => toast('👋 Welcome, Revive Dental Speciality Clinic!', { 
              style: { borderRadius: '10px', background: '#3B3F97', color: '#fff', fontWeight: 600 }
            })}
            style={{
            width: 40, height: 40, borderRadius: 10,
            background: 'linear-gradient(135deg, #3B3F97, #2E3192)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0, cursor: 'pointer',
            boxShadow: '0 4px 10px rgba(46,49,146,0.3)'
          }}>
            <img src="/logo.svg" alt="Revive" style={{ width: 28, height: 28, borderRadius: 6 }} />
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: '0.95rem', color: '#0f172a' }}>
              Revive <span style={{ color: '#3B3F97' }}>Dental</span>
            </div>
            <div style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 600 }}>ADMIN PANEL</div>
          </div>
          {/* Mobile close */}
          <button
            onClick={() => setSidebarOpen(false)}
            className="sidebar-close-btn"
            style={{
              marginLeft: 'auto', background: 'none', border: 'none',
              cursor: 'pointer', color: '#64748b', display: 'none',
            }}
          >
            <FiX size={20} />
          </button>
        </div>

        {/* Nav */}
        <nav style={{ padding: '12px', flex: 1 }}>
          {NAV.map(({ id, label, Icon }) => (
            <button
              key={id}
              onClick={() => { setActiveTab(id); setSidebarOpen(false); }}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                padding: '11px 14px', borderRadius: 8, border: 'none',
                textAlign: 'left', marginBottom: 2,
                background: activeTab === id ? '#ECEDF8' : 'transparent',
                color: activeTab === id ? '#3B3F97' : '#64748b',
                fontWeight: activeTab === id ? 700 : 500,
                fontSize: '0.875rem', cursor: 'pointer',
                transition: 'all 0.18s',
              }}
            >
              <Icon size={17} />
              {label}
            </button>
          ))}
        </nav>

        {/* User info + logout */}
        <div style={{ padding: '16px', borderTop: '1px solid #f1f5f9' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <div style={{
              width: 36, height: 36, borderRadius: '50%',
              background: 'linear-gradient(135deg, #3B3F97, #F58220)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', fontWeight: 800, fontSize: '0.85rem',
            }}>
              {name[0].toUpperCase()}
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontWeight: 600, fontSize: '0.82rem', color: '#0f172a' }}>{name}</div>
              <div style={{
                fontSize: '0.7rem', color: '#94a3b8',
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              }}>{currentUser?.email}</div>
            </div>
          </div>
          <button
            onClick={() => navigate('/')}
            style={{
              width: '100%', display: 'flex', alignItems: 'center', gap: 8,
              padding: '9px 14px', borderRadius: 8, border: '1px solid #e2e8f0',
              background: '#f8fafc', color: '#475569', fontWeight: 600,
              fontSize: '0.82rem', cursor: 'pointer', transition: 'all 0.18s',
              marginBottom: 8
            }}
          >
            <FiHome size={15} /> Website Home
          </button>
          <button
            onClick={handleLogout}
            style={{
              width: '100%', display: 'flex', alignItems: 'center', gap: 8,
              padding: '9px 14px', borderRadius: 8, border: '1px solid #fecaca',
              background: '#fef2f2', color: '#dc2626', fontWeight: 600,
              fontSize: '0.82rem', cursor: 'pointer', transition: 'all 0.18s',
            }}
          >
            <FiLogOut size={15} /> Logout
          </button>
        </div>
      </aside>

      {/* ── Main Content ── */}
      <main style={{ flex: 1, marginLeft: 0, minHeight: '100vh', width: 0 }} className="admin-main">
        {/* Top bar */}
        <div style={{
          background: '#fff', borderBottom: '1px solid #e2e8f0',
          padding: '14px 24px', display: 'flex', alignItems: 'center', gap: 16,
          position: 'sticky', top: 0, zIndex: 30,
        }}>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="sidebar-toggle-btn"
            style={{
              background: 'none', border: '1px solid #e2e8f0',
              borderRadius: 8, padding: '6px 8px', cursor: 'pointer',
              color: '#64748b', display: 'none',
            }}
          >
            <FiMenu size={18} />
          </button>
          <div>
            <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Admin</span>
            <span style={{ margin: '0 4px', color: '#94a3b8' }}>/</span>
            <span style={{ fontSize: '0.8rem', color: '#0f172a', fontWeight: 600, textTransform: 'capitalize' }}>
              {activeTab}
            </span>
          </div>
          <div style={{ flex: 1 }} />
          <span style={{ fontWeight: 600, fontSize: '0.85rem', color: '#0f172a' }}>
            Welcome, {name.split(' ')[0]}
          </span>
          <div style={{
            width: 36, height: 36, borderRadius: '50%',
            background: 'linear-gradient(135deg, #3B3F97, #F58220)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontWeight: 800, fontSize: '0.85rem',
          }}>
            {name[0].toUpperCase()}
          </div>
        </div>

        {/* Content */}
        <div style={{ padding: '24px' }}>
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
          >
            {renderContent()}
          </motion.div>
        </div>
      </main>
    </div>
  );
}
