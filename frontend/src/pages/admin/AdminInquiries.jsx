import { useEffect, useState } from 'react';
import { getAllInquiries, markInquiryContacted, deleteInquiry } from '../../services/adminService';
import toast from 'react-hot-toast';
import { FiCheck, FiTrash2, FiSearch, FiPhone } from 'react-icons/fi';

const STATUS_COLORS = {
  new:       { bg: '#fffbeb', color: '#d97706', border: '#fde68a' },
  contacted: { bg: '#f0fdf4', color: '#16a34a', border: '#bbf7d0' },
};

export default function AdminInquiries() {
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => { fetchData(); }, []);

  async function fetchData() {
    try {
      const data = await getAllInquiries();
      setInquiries(data);
    } catch { toast.error('Failed to load inquiries'); }
    setLoading(false);
  }

  async function handleMarkContacted(id) {
    try {
      await markInquiryContacted(id);
      toast.success('Marked as contacted');
      fetchData();
    } catch { toast.error('Failed to update'); }
  }

  async function handleDelete(id) {
    if (!confirm('Delete this inquiry?')) return;
    try {
      await deleteInquiry(id);
      toast.success('Inquiry deleted');
      fetchData();
    } catch { toast.error('Failed to delete'); }
  }

  const filtered = inquiries.filter(inq =>
    (inq.name || '').toLowerCase().includes(search.toLowerCase()) ||
    (inq.phone || '').includes(search) ||
    (inq.email || '').toLowerCase().includes(search.toLowerCase())
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
        <div>
          <h2 style={{ fontWeight: 800, fontSize: '1.2rem', color: '#0f172a', marginBottom: 4 }}>
            Inquiry Management
          </h2>
          <p style={{ color: '#94a3b8', fontSize: '0.82rem' }}>
            <FiPhone size={12} style={{ marginRight: 4 }} />
            Contact patients using clinic phone: <strong style={{ color: '#0f172a' }}>8669062290</strong>
          </p>
        </div>
        <div style={{ position: 'relative' }}>
          <FiSearch size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search by name, phone, email..."
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
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 800 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                {['Name', 'Phone', 'Email', 'Location', 'Message', 'Status', 'Actions'].map(h => (
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
                    No inquiries found
                  </td>
                </tr>
              ) : (
                filtered.map(inq => {
                  const sc = STATUS_COLORS[inq.status] || STATUS_COLORS.new;
                  return (
                    <tr key={inq.id} style={{ borderBottom: '1px solid #f8fafc' }}>
                      <td style={{ padding: '14px 16px', fontWeight: 600, fontSize: '0.88rem', color: '#0f172a' }}>
                        {inq.name || '—'}
                      </td>
                      <td style={{ padding: '14px 16px', fontSize: '0.85rem', color: '#475569' }}>
                        {inq.phone || '—'}
                      </td>
                      <td style={{ padding: '14px 16px', fontSize: '0.85rem', color: '#475569' }}>
                        {inq.email || '—'}
                      </td>
                      <td style={{ padding: '14px 16px', fontSize: '0.85rem', color: '#475569' }}>
                        {inq.location || '—'}
                      </td>
                      <td style={{ padding: '14px 16px', fontSize: '0.82rem', color: '#475569', maxWidth: 200 }}>
                        <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {inq.message || '—'}
                        </div>
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <span style={{
                          padding: '4px 10px', borderRadius: 50, fontSize: '0.75rem',
                          fontWeight: 700, background: sc.bg, color: sc.color,
                          border: `1px solid ${sc.border}`, textTransform: 'capitalize',
                        }}>
                          {inq.status}
                        </span>
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ display: 'flex', gap: 6 }}>
                          {inq.status === 'new' && (
                            <button
                              onClick={() => handleMarkContacted(inq.id)}
                              style={{
                                padding: '5px 12px', borderRadius: 6,
                                border: '1px solid #bbf7d0', background: '#f0fdf4',
                                color: '#16a34a', fontWeight: 600, fontSize: '0.78rem',
                                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4,
                              }}
                            >
                              <FiCheck size={13} /> Contacted
                            </button>
                          )}
                          <button
                            onClick={() => handleDelete(inq.id)}
                            style={{
                              padding: '5px 10px', borderRadius: 6,
                              border: '1px solid #fecaca', background: '#fef2f2',
                              color: '#dc2626', fontWeight: 600, fontSize: '0.78rem',
                              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4,
                            }}
                          >
                            <FiTrash2 size={13} />
                          </button>
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
    </div>
  );
}
