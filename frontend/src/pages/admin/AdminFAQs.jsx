import { useEffect, useState } from 'react';
import { getAllFAQs, addFAQ, updateFAQ, deleteFAQ } from '../../services/adminService';
import toast from 'react-hot-toast';
import { FiPlus, FiEdit2, FiTrash2, FiSave, FiX } from 'react-icons/fi';

export default function AdminFAQs() {
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [newQ, setNewQ] = useState('');
  const [newA, setNewA] = useState('');
  const [editId, setEditId] = useState(null);
  const [editQ, setEditQ] = useState('');
  const [editA, setEditA] = useState('');

  useEffect(() => { fetchData(); }, []);

  async function fetchData() {
    try {
      const data = await getAllFAQs();
      setFaqs(data);
    } catch { toast.error('Failed to load FAQs'); }
    setLoading(false);
  }

  async function handleAdd() {
    if (!newQ.trim() || !newA.trim()) { toast.error('Fill both fields'); return; }
    try {
      await addFAQ(newQ, newA);
      toast.success('FAQ added');
      setNewQ(''); setNewA(''); setShowAdd(false);
      fetchData();
    } catch { toast.error('Failed to add FAQ'); }
  }

  async function handleUpdate(id) {
    if (!editQ.trim() || !editA.trim()) { toast.error('Fill both fields'); return; }
    try {
      await updateFAQ(id, editQ, editA);
      toast.success('FAQ updated');
      setEditId(null);
      fetchData();
    } catch { toast.error('Failed to update'); }
  }

  async function handleDelete(id) {
    if (!confirm('Delete this FAQ?')) return;
    try {
      await deleteFAQ(id);
      toast.success('FAQ deleted');
      fetchData();
    } catch { toast.error('Failed to delete'); }
  }

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
          FAQ Management
        </h2>
        <button
          onClick={() => setShowAdd(!showAdd)}
          className="btn-primary"
          style={{ padding: '9px 18px', fontSize: '0.85rem' }}
        >
          <FiPlus size={15} /> Add FAQ
        </button>
      </div>

      {/* Add Form */}
      {showAdd && (
        <div style={{
          background: '#fff', borderRadius: 14, border: '1px solid #e2e8f0',
          padding: '24px', marginBottom: 20, boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
        }}>
          <h3 style={{ fontWeight: 700, fontSize: '0.95rem', color: '#0f172a', marginBottom: 16 }}>
            New FAQ
          </h3>
          <div className="form-group">
            <label>Question</label>
            <input
              className="form-control" placeholder="Enter question..."
              value={newQ} onChange={e => setNewQ(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>Answer</label>
            <textarea
              className="form-control" rows={3} placeholder="Enter answer..."
              value={newA} onChange={e => setNewA(e.target.value)}
            />
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={handleAdd} className="btn-primary" style={{ padding: '9px 18px' }}>
              <FiSave size={14} /> Save FAQ
            </button>
            <button
              onClick={() => { setShowAdd(false); setNewQ(''); setNewA(''); }}
              style={{
                padding: '9px 18px', borderRadius: 8, border: '1px solid #e2e8f0',
                background: '#fff', color: '#64748b', fontWeight: 600, cursor: 'pointer',
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* FAQ List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {faqs.length === 0 ? (
          <div style={{
            background: '#fff', borderRadius: 14, border: '1px solid #e2e8f0',
            padding: '40px', textAlign: 'center', color: '#94a3b8',
          }}>
            No FAQs added yet. Click "Add FAQ" to create one.
          </div>
        ) : (
          faqs.map(faq => (
            <div
              key={faq.id}
              style={{
                background: '#fff', borderRadius: 14, border: '1px solid #e2e8f0',
                padding: '20px 24px', boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
              }}
            >
              {editId === faq.id ? (
                /* Editing mode */
                <>
                  <div className="form-group">
                    <label>Question</label>
                    <input
                      className="form-control" value={editQ}
                      onChange={e => setEditQ(e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label>Answer</label>
                    <textarea
                      className="form-control" rows={3} value={editA}
                      onChange={e => setEditA(e.target.value)}
                    />
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button
                      onClick={() => handleUpdate(faq.id)}
                      style={{
                        padding: '6px 14px', borderRadius: 6, border: '1px solid #bbf7d0',
                        background: '#f0fdf4', color: '#16a34a', fontWeight: 600,
                        fontSize: '0.82rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4,
                      }}
                    >
                      <FiSave size={13} /> Save
                    </button>
                    <button
                      onClick={() => setEditId(null)}
                      style={{
                        padding: '6px 14px', borderRadius: 6, border: '1px solid #e2e8f0',
                        background: '#fff', color: '#64748b', fontWeight: 600,
                        fontSize: '0.82rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4,
                      }}
                    >
                      <FiX size={13} /> Cancel
                    </button>
                  </div>
                </>
              ) : (
                /* Display mode */
                <>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
                    <div style={{ flex: 1 }}>
                      <h4 style={{ fontWeight: 700, fontSize: '0.95rem', color: '#0f172a', marginBottom: 8 }}>
                        Q: {faq.question}
                      </h4>
                      <p style={{ color: '#64748b', fontSize: '0.88rem', lineHeight: 1.6 }}>
                        A: {faq.answer}
                      </p>
                    </div>
                    <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                      <button
                        onClick={() => { setEditId(faq.id); setEditQ(faq.question); setEditA(faq.answer); }}
                        style={{
                          padding: '6px 10px', borderRadius: 6, border: '1px solid #B0B2DA',
                          background: '#ECEDF8', color: '#3B3F97', cursor: 'pointer',
                          display: 'flex', alignItems: 'center',
                        }}
                      >
                        <FiEdit2 size={14} />
                      </button>
                      <button
                        onClick={() => handleDelete(faq.id)}
                        style={{
                          padding: '6px 10px', borderRadius: 6, border: '1px solid #fecaca',
                          background: '#fef2f2', color: '#dc2626', cursor: 'pointer',
                          display: 'flex', alignItems: 'center',
                        }}
                      >
                        <FiTrash2 size={14} />
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
