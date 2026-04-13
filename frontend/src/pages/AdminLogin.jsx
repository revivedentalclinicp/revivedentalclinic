import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { FiMail, FiLock, FiShield, FiArrowLeft, FiHome } from 'react-icons/fi';

export default function AdminLogin() {
  const [view, setView] = useState('login'); // 'login' | 'forgot'
  const [form, setForm] = useState({ email: '', password: '' });
  const [resetEmail, setResetEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const { login, checkAdminStatus, logout, sendAdminPasswordReset } = useAuth();
  const navigate = useNavigate();

  // ── Login handler ─────────────────────────────────────────────
  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await login(form.email, form.password);
      const isAdmin = await checkAdminStatus(res.user);
      if (!isAdmin) {
        toast.error('Unauthorized — Admin access only');
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

  // ── Forgot password handler ────────────────────────────────────
  async function handleForgotPassword(e) {
    e.preventDefault();
    setLoading(true);
    try {
      await sendAdminPasswordReset(resetEmail.trim());
      setResetSent(true);
      toast.success('Password reset email sent!');
    } catch (err) {
      toast.error(err.message);
    }
    setLoading(false);
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #ECEDF8 0%, #f8fafc 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '40px 24px',
    }}>
      <div style={{ width: '100%', maxWidth: 420 }}>

        {/* Back to Home */}
        <Link
          to="/"
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            color: '#64748b', fontSize: '0.875rem', fontWeight: 600,
            textDecoration: 'none', marginBottom: 24,
            transition: 'color 0.2s',
          }}
          onMouseEnter={e => e.currentTarget.style.color = '#2E3192'}
          onMouseLeave={e => e.currentTarget.style.color = '#64748b'}
        >
          <FiHome size={15} /> Back to Home
        </Link>

        <AnimatePresence mode="wait">

          {/* ── LOGIN VIEW ── */}
          {view === 'login' && (
            <motion.div key="login"
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.35 }}
              style={{
                background: '#fff', borderRadius: 16, border: '1px solid #e2e8f0',
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

              <div style={{ textAlign: 'center', marginTop: 20 }}>
                <button
                  onClick={() => { setView('forgot'); setResetSent(false); setResetEmail(''); }}
                  style={{
                    background: 'none', border: 'none', color: '#2E3192',
                    fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer',
                    textDecoration: 'underline',
                  }}
                >
                  Forgot Password?
                </button>
              </div>

              <p style={{ textAlign: 'center', marginTop: 16, color: '#94a3b8', fontSize: '0.78rem' }}>
                Restricted to authorized clinic staff only.
              </p>
            </motion.div>
          )}

          {/* ── FORGOT PASSWORD VIEW ── */}
          {view === 'forgot' && (
            <motion.div key="forgot"
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.35 }}
              style={{
                background: '#fff', borderRadius: 16, border: '1px solid #e2e8f0',
                padding: '40px 36px', boxShadow: '0 4px 24px rgba(0,0,0,0.07)',
              }}
            >
              <button
                onClick={() => setView('login')}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  background: 'none', border: 'none', color: '#64748b',
                  fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer',
                  marginBottom: 24, padding: 0,
                }}
              >
                <FiArrowLeft size={15} /> Back to Login
              </button>

              <div style={{ textAlign: 'center', marginBottom: 28 }}>
                <div style={{
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  width: 56, height: 56, borderRadius: 14,
                  background: '#ECEDF8', marginBottom: 16,
                }}>
                  <FiMail size={26} color="#3B3F97" />
                </div>
                <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a', marginBottom: 6 }}>
                  Reset Password
                </h1>
                <p style={{ color: '#64748b', fontSize: '0.875rem' }}>
                  Enter your admin email to receive a reset link.
                </p>
              </div>

              {resetSent ? (
                <div style={{
                  background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 12,
                  padding: '20px 24px', textAlign: 'center',
                }}>
                  <div style={{ fontSize: '2rem', marginBottom: 10 }}>📧</div>
                  <p style={{ color: '#16a34a', fontWeight: 700, fontSize: '0.95rem', margin: 0 }}>
                    Reset email sent!
                  </p>
                  <p style={{ color: '#64748b', fontSize: '0.85rem', marginTop: 8 }}>
                    Check your inbox at <strong>{resetEmail}</strong> and follow the link to reset your password.
                  </p>
                  <button
                    onClick={() => setView('login')}
                    className="btn-primary"
                    style={{ marginTop: 16, justifyContent: 'center', padding: '10px 24px' }}
                  >
                    Back to Login
                  </button>
                </div>
              ) : (
                <form onSubmit={handleForgotPassword}>
                  <div className="form-group">
                    <label>Admin Email Address</label>
                    <div style={{ position: 'relative' }}>
                      <FiMail size={15} style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                      <input
                        type="email" className="form-control" placeholder="admin@revivedental.com"
                        style={{ paddingLeft: 38 }}
                        value={resetEmail} onChange={e => setResetEmail(e.target.value)}
                        required
                      />
                    </div>
                    <p style={{ color: '#94a3b8', fontSize: '0.78rem', marginTop: 6 }}>
                      Only registered admin emails will receive a reset link.
                    </p>
                  </div>
                  <button
                    type="submit" className="btn-primary"
                    style={{ width: '100%', justifyContent: 'center', padding: '12px' }}
                    disabled={loading}
                  >
                    {loading ? <span className="spinner" /> : 'Send Reset Email'}
                  </button>
                </form>
              )}
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}
