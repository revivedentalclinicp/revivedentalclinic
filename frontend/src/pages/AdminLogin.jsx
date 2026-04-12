import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { FiMail, FiLock, FiShield } from 'react-icons/fi';

export default function AdminLogin() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { login, checkAdminStatus, logout } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await login(form.email, form.password);
      const admin = await checkAdminStatus(res.user);
      if (!admin) {
        toast.error('Unauthorized Access — Admin only');
        await logout();
        setLoading(false);
        return;
      }
      toast.success('Welcome, Admin!');
      navigate('/admin/dashboard');
    } catch (err) {
      toast.error(err.message.replace('Firebase:', '').trim());
    }
    setLoading(false);
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #ECEDF8 0%, #f8fafc 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '80px 24px 40px',
    }}>
      <motion.div
        initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{
          width: '100%', maxWidth: 420, background: '#fff',
          borderRadius: 16, border: '1px solid #e2e8f0',
          padding: '40px 36px', boxShadow: '0 4px 24px rgba(0,0,0,0.07)',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: 56, height: 56, borderRadius: 14,
            background: 'linear-gradient(135deg, #3B3F97, #2E3192)',
            marginBottom: 18,
          }}>
            <FiShield size={28} color="#fff" />
          </div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', marginBottom: 6 }}>
            Admin Portal
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
            Revive Dental — Staff Access Only
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email Address</label>
            <div style={{ position: 'relative' }}>
              <FiMail size={15} style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              <input
                type="email" className="form-control" placeholder="admin@revivedental.com"
                style={{ paddingLeft: 38 }}
                value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
                required
              />
            </div>
          </div>
          <div className="form-group">
            <label>Password</label>
            <div style={{ position: 'relative' }}>
              <FiLock size={15} style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              <input
                type="password" className="form-control" placeholder="••••••••"
                style={{ paddingLeft: 38 }}
                value={form.password} onChange={e => setForm({ ...form, password: e.target.value })}
                required
              />
            </div>
          </div>
          <button
            type="submit" className="btn-primary"
            style={{ width: '100%', justifyContent: 'center', padding: '12px', marginTop: 8 }}
            disabled={loading}
          >
            {loading ? <span className="spinner" /> : (
              <><FiShield size={15} /> Sign In as Admin</>
            )}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: 24, color: '#94a3b8', fontSize: '0.8rem' }}>
          This login is restricted to authorized clinic staff only.
        </p>
      </motion.div>
    </div>
  );
}
