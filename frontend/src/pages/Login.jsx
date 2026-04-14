import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { FiMail, FiLock } from 'react-icons/fi';
import { FcGoogle } from 'react-icons/fc';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { login, loginWithGoogle, checkUserStatus, checkAdminStatus, promoteToUser, logout } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await login(form.email, form.password);
      let isUser = await checkUserStatus(res.user);
      const isAdmin = await checkAdminStatus(res.user);

      if (!isUser && !isAdmin) {
        await promoteToUser(res.user);
        isUser = true;
      }

      if (!isUser) {
        toast.error('Access Denied. Please use the Admin Portal.');
        await logout();
        setLoading(false);
        return;
      }
      toast.success('Welcome back!');
      navigate('/user/dashboard');
    } catch (err) {
      toast.error(err.message.replace('Firebase:', '').trim());
    }
    setLoading(false);
  }

  async function handleGoogle() {
    try {
      const res = await loginWithGoogle();
      const isUser = await checkUserStatus(res.user);
      if (!isUser) {
        toast.error('Access Denied. Please use the Admin Portal.');
        await logout();
        return;
      }
      toast.success('Signed in with Google!');
      navigate('/user/dashboard');
    } catch { toast.error('Google sign-in failed'); }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #ECEDF8 0%, #f8fafc 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '80px 24px 40px' }}>
      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
        className="sm-p-4"
        style={{ width: '100%', maxWidth: 420, background: '#fff', borderRadius: 16, border: '1px solid #e2e8f0', padding: '40px 36px', boxShadow: '0 4px 24px rgba(0,0,0,0.07)' }}>

        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 56, height: 56, borderRadius: 14, background: '#ECEDF8', marginBottom: 18 }}>
            <img src="/logo.svg" alt="Revive Dental" style={{ width: 44, height: 44, borderRadius: 10 }} />
          </div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', marginBottom: 6 }}>Welcome back</h1>
          <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Sign in to your patient portal</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email Address</label>
            <div style={{ position: 'relative' }}>
              <FiMail size={15} style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              <input type="email" className="form-control" placeholder="you@example.com"
                style={{ paddingLeft: 38 }}
                value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
            </div>
          </div>
          <div className="form-group">
            <label>Password</label>
            <div style={{ position: 'relative' }}>
              <FiLock size={15} style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              <input type="password" className="form-control" placeholder="••••••••"
                style={{ paddingLeft: 38 }}
                value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required />
            </div>
          </div>
          <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '12px', marginTop: 8 }} disabled={loading}>
            {loading ? <span className="spinner" /> : 'Sign In'}
          </button>
        </form>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '20px 0' }}>
          <div style={{ flex: 1, height: 1, background: '#f1f5f9' }} />
          <span style={{ color: '#94a3b8', fontSize: '0.82rem' }}>or</span>
          <div style={{ flex: 1, height: 1, background: '#f1f5f9' }} />
        </div>

        <button onClick={handleGoogle} style={{
          width: '100%', padding: '11px', borderRadius: 10, border: '1.5px solid #e2e8f0',
          background: '#fff', color: '#374151', display: 'flex', alignItems: 'center',
          justifyContent: 'center', gap: 10, fontWeight: 600, fontSize: '0.9rem',
          cursor: 'pointer', transition: 'all 0.2s',
        }}
          onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
          onMouseLeave={e => e.currentTarget.style.background = '#fff'}>
          <FcGoogle size={20} /> Continue with Google
        </button>

        <p style={{ textAlign: 'center', marginTop: 24, color: '#64748b', fontSize: '0.875rem' }}>
          Don't have an account?{' '}
          <Link to="/signup" style={{ color: '#2E3192', fontWeight: 700 }}>Create one</Link>
        </p>
      </motion.div>
    </div>
  );
}
