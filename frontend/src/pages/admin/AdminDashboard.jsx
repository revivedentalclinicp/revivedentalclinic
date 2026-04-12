import { useEffect, useState } from 'react';
import { getDashboardStats } from '../../services/adminService';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { FiUsers, FiCalendar, FiClock, FiMessageSquare } from 'react-icons/fi';
import toast from 'react-hot-toast';

const STAT_CONFIG = [
  { key: 'totalPatients', label: 'Total Patients', Icon: FiUsers, color: '#3B3F97', bg: '#ECEDF8' },
  { key: 'todayAppointments', label: "Today's Appointments", Icon: FiCalendar, color: '#F58220', bg: '#FEF3E4' },
  { key: 'pendingApprovals', label: 'Pending Approvals', Icon: FiClock, color: '#d97706', bg: '#fffbeb' },
  { key: 'totalInquiries', label: 'Total Inquiries', Icon: FiMessageSquare, color: '#0891b2', bg: '#ecfeff' },
];

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  async function fetchStats() {
    try {
      const data = await getDashboardStats();
      setStats(data);
    } catch (err) {
      toast.error('Failed to load dashboard data');
    }
    setLoading(false);
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 400 }}>
        <span className="spinner" style={{ borderColor: '#e2e8f0', borderTopColor: '#3B3F97', width: 32, height: 32 }} />
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div>
      {/* ── Stat Cards ── */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: 16, marginBottom: 24,
      }}>
        {STAT_CONFIG.map(({ key, label, Icon, color, bg }) => (
          <div
            key={key}
            style={{
              background: '#fff', borderRadius: 14, border: '1px solid #e2e8f0',
              padding: '22px 24px', boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                {label}
              </span>
              <div style={{
                width: 40, height: 40, borderRadius: 10, background: bg,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Icon size={20} color={color} />
              </div>
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 900, color: '#0f172a' }}>
              {stats[key]}
            </div>
          </div>
        ))}
      </div>

      {/* ── Chart + Upcoming ── */}
      <div style={{
        display: 'grid', gridTemplateColumns: '1fr 360px',
        gap: 20, alignItems: 'start',
      }}
        className="admin-dashboard-grid"
      >
        {/* Chart */}
        <div style={{
          background: '#fff', borderRadius: 14, border: '1px solid #e2e8f0',
          padding: '24px', boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
        }}>
          <h3 style={{ fontWeight: 800, fontSize: '1rem', color: '#0f172a', marginBottom: 4 }}>
            Patients Per Month
          </h3>
          <p style={{ color: '#94a3b8', fontSize: '0.82rem', marginBottom: 24 }}>
            Based on appointment bookings (last 12 months)
          </p>
          <div style={{ width: '100%', height: 280 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" fontSize={11} tick={{ fill: '#94a3b8' }} />
                <YAxis fontSize={11} tick={{ fill: '#94a3b8' }} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    background: '#0f172a', color: '#fff', borderRadius: 8,
                    border: 'none', fontSize: '0.82rem',
                  }}
                  labelStyle={{ color: '#94a3b8' }}
                />
                <Bar dataKey="count" fill="#3B3F97" radius={[6, 6, 0, 0]} name="Patients" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Upcoming Appointments */}
        <div style={{
          background: '#fff', borderRadius: 14, border: '1px solid #e2e8f0',
          padding: '24px', boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
        }}>
          <h3 style={{ fontWeight: 800, fontSize: '1rem', color: '#0f172a', marginBottom: 20 }}>
            Upcoming Appointments
          </h3>
          {stats.upcoming.length === 0 ? (
            <p style={{ color: '#94a3b8', fontSize: '0.85rem', textAlign: 'center', padding: '32px 0' }}>
              No upcoming appointments
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {stats.upcoming.map((a, i) => (
                <div
                  key={a.id || i}
                  style={{
                    padding: '14px 16px', borderRadius: 10,
                    border: '1px solid #f1f5f9', background: '#fafbfc',
                    transition: 'all 0.15s',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span style={{ fontWeight: 700, fontSize: '0.88rem', color: '#0f172a' }}>
                      {a.name || 'Patient'}
                    </span>
                    <span style={{
                      padding: '2px 8px', borderRadius: 50, fontSize: '0.7rem',
                      fontWeight: 700, background: '#ECEDF8', color: '#3B3F97',
                    }}>
                      {a.status}
                    </span>
                  </div>
                  <div style={{ color: '#64748b', fontSize: '0.8rem' }}>
                    {a.service} · {a.date} · {a.time}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
