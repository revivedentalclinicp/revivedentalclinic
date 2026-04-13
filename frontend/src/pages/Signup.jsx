import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { FiMail, FiLock, FiUser, FiPhone } from 'react-icons/fi';
import { FcGoogle } from 'react-icons/fc';

export default function Signup() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirm: '' });
  const [loading, setLoading] = useState(false);
  const { signup, loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.phone.trim()) return toast.error('Phone number is required');
    if (form.password !== form.confirm) return toast.error('Passwords do not match');
    if (form.password.length < 6) return toast.error('Password must be at least 6 characters');
    setLoading(true);
    try {
      await signup(form.email, form.password, form.name, form.phone);
      toast.success('Account created! Welcome 🦷');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.message.replace('Firebase:', '').trim());
    }
    setLoading(false);
  }

  async function handleGoogle() {
    try {
      await loginWithGoogle();
      toast.success('Signed in with Google!');
      navigate('/dashboard');
    } catch { toast.error('Google sign-in failed'); }
  }

  const fields = [
    { key: 'name',    label: 'Full Name',        type: 'text',     placeholder: 'Your Full Name',   Icon: FiUser,  required: true },
    { key: 'email',   label: 'Email Address',     type: 'email',    placeholder: 'you@example.com',  Icon: FiMail,  required: true },
    { key: 'phone',   label: 'Phone Number',      type: 'tel',      placeholder: '98XXXXXXXX',       Icon: FiPhone, required: true },
    { key: 'password',label: 'Password',          type: 'password', placeholder: '••••••••',         Icon: FiLock,  required: true },
    { key: 'confirm', label: 'Confirm Password',  type: 'password', placeholder: '••••••••',         Icon: FiLock,  required: true },
  ];

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #ECEDF8 0%, #f8fafc 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '80px 24px 40px' }}>
      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
        style={{ width: '100%', maxWidth: 440, background: '#fff', borderRadius: 16, border: '1px solid #e2e8f0', padding: '40px 36px', boxShadow: '0 4px 24px rgba(0,0,0,0.07)' }}>

        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 56, height: 56, borderRadius: 14, background: '#ECEDF8', marginBottom: 16 }}>
            <img src="/logo.svg" alt="Revive Dental" style={{ width: 44, height: 44, borderRadius: 10 }} />
          </div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', marginBottom: 6 }}>Create Account</h1>
          <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Start your journey to a healthier smile</p>
        </div>

        <form onSubmit={handleSubmit}>
          {fields.map(({ key, label, type, placeholder, Icon, required }) => (
            <div className="form-group" key={key}>
              <label>
                {label} {required && <span style={{ color: '#ef4444' }}>*</span>}
              </label>
              <div style={{ position: 'relative' }}>
                <Icon size={15} style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                <input
                  type={type}
                  className="form-control"
                  placeholder={placeholder}
                  style={{ paddingLeft: 38 }}
                  value={form[key]}
                  onChange={e => setForm({ ...form, [key]: e.target.value })}
                  required={required}
                />
              </div>
            </div>
          ))}
          <button
            type="submit"
            className="btn-primary"
            style={{ width: '100%', justifyContent: 'center', padding: '12px', marginTop: 4 }}
            disabled={loading}
          >
            {loading ? <span className="spinner" /> : 'Create Account'}
          </button>
        </form>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '20px 0' }}>
          <div style={{ flex: 1, height: 1, background: '#f1f5f9' }} />
          <span style={{ color: '#94a3b8', fontSize: '0.82rem' }}>or</span>
          <div style={{ flex: 1, height: 1, background: '#f1f5f9' }} />
        </div>

        <button
          onClick={handleGoogle}
          style={{
            width: '100%', padding: '11px', borderRadius: 10, border: '1.5px solid #e2e8f0',
            background: '#fff', color: '#374151', display: 'flex',
            alignItems: 'center', justifyContent: 'center', gap: 10,
            fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer', transition: 'all 0.2s',
          }}
          onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
          onMouseLeave={e => e.currentTarget.style.background = '#fff'}
        >
          <FcGoogle size={20} /> Continue with Google
        </button>

        <p style={{ textAlign: 'center', marginTop: 24, color: '#64748b', fontSize: '0.875rem' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: '#2E3192', fontWeight: 700 }}>Sign in</Link>
        </p>
      </motion.div>
    </div>
  );
}
