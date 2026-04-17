import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { FiClock, FiAlertCircle } from 'react-icons/fi';

// 30 minutes in milliseconds
const SESSION_TIMEOUT_MS = 30 * 60 * 1000;
// 15 seconds warning before logout
const WARNING_BEFORE_MS = 15 * 1000; 

export default function SessionManager() {
  const { currentUser, logout } = useAuth();
  const [showWarning, setShowWarning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(WARNING_BEFORE_MS / 1000);

  const resetTimer = useCallback(() => {
    if (showWarning) setShowWarning(false);
    
    const lastActivity = Date.now();
    localStorage.setItem('lastActivity', lastActivity);
  }, [showWarning]);

  useEffect(() => {
    // Only track session if user is logged in
    if (!currentUser) return;

    resetTimer();

    const events = ['mousemove', 'keydown', 'mousedown', 'scroll', 'touchstart'];
    events.forEach(e => window.addEventListener(e, resetTimer));

    const interval = setInterval(() => {
      const lastActivity = parseInt(localStorage.getItem('lastActivity') || Date.now(), 10);
      const idleTime = Date.now() - lastActivity;

      // Time to show warning?
      if (idleTime >= (SESSION_TIMEOUT_MS - WARNING_BEFORE_MS) && idleTime < SESSION_TIMEOUT_MS) {
        setShowWarning(true);
        setTimeLeft(Math.ceil((SESSION_TIMEOUT_MS - idleTime) / 1000));
      } 
      // Time to logout?
      else if (idleTime >= SESSION_TIMEOUT_MS) {
        clearInterval(interval);
        logout();
      }
    }, 1000);

    return () => {
      events.forEach(e => window.removeEventListener(e, resetTimer));
      clearInterval(interval);
    };
  }, [currentUser, resetTimer, logout]);

  return (
    <AnimatePresence>
      {showWarning && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 99999, padding: 20
        }}>
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            style={{
              background: '#fff', padding: '32px', borderRadius: '16px',
              maxWidth: 400, width: '100%', textAlign: 'center',
              boxShadow: '0 20px 40px rgba(0,0,0,0.1)'
            }}
          >
            <div style={{
              width: 64, height: 64, borderRadius: '50%', background: '#fffbeb',
              color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 20px'
            }}>
              <FiClock size={32} />
            </div>
            <h2 style={{ color: '#0f172a', fontSize: '1.25rem', fontWeight: 800, marginBottom: 12 }}>
              Session Expiring Soon
            </h2>
            <p style={{ color: '#475569', fontSize: '0.95rem', lineHeight: 1.5, marginBottom: 24 }}>
              Your session will expire in <strong style={{ color: '#dc2626' }}>{timeLeft} seconds</strong> due to inactivity. Click to stay logged in.
            </p>
            <button 
              onClick={resetTimer}
              className="btn-primary"
              style={{ width: '100%', justifyContent: 'center', padding: '12px' }}
            >
              Continue Session
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
