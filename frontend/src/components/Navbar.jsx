import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { FiMenu, FiX, FiUser, FiLogOut } from 'react-icons/fi';
import styles from './Navbar.module.css';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);

  useEffect(() => { setMenuOpen(false); }, [location]);

  async function handleLogout() { await logout(); navigate('/'); }

  /**
   * Smooth-scroll to a section by ID.
   * If on a different page, navigate to "/" first, then scroll after a short delay.
   */
  function scrollToSection(sectionId) {
    setMenuOpen(false);
    const NAVBAR_HEIGHT = 68;
    const scrollAndOffset = () => {
      const el = document.getElementById(sectionId);
      if (el) {
        const top = el.getBoundingClientRect().top + window.scrollY - NAVBAR_HEIGHT;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    };

    if (location.pathname !== '/') {
      navigate('/');
      // Wait for navigation + render
      setTimeout(scrollAndOffset, 350);
    } else {
      scrollAndOffset();
    }
  }

  function scrollToTop() {
    setMenuOpen(false);
    if (location.pathname !== '/') {
      navigate('/');
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  const navLinks = [
    { label: 'Home',     action: scrollToTop,                   path: '/'        },
    { label: 'Services', path: '/services',                     action: null      },
    { label: 'Doctor',   path: '/doctors',                      action: null      },
    { label: 'About Us', action: () => scrollToSection('about'), path: null       },
    { label: 'Contact',  action: () => scrollToSection('contact'), path: null     },
  ];

  const isActive = (link) => {
    if (link.path) return location.pathname === link.path;
    return false;
  };

  function handleNavClick(e, link) {
    if (link.action) {
      e.preventDefault();
      link.action();
    }
  }

  return (
    <nav className={`${styles.navbar} ${scrolled ? styles.scrolled : ''}`}>
      <div className={styles.container}>
        <button
          onClick={scrollToTop}
          className={styles.logo}
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
        >
          <img
            src="/logo.svg"
            alt="Revive Dental Logo"
            className={styles.logoIcon}
          />
          <span className={styles.logoText}>
            Revive <span className={styles.logoAccent}>Dental</span>
          </span>
        </button>

        <ul className={styles.links}>
          {navLinks.map((l) => (
            <li key={l.label}>
              {l.path && !l.action ? (
                <Link
                  to={l.path}
                  className={`${styles.link} ${isActive(l) ? styles.active : ''}`}
                >
                  {l.label}
                </Link>
              ) : (
                <a
                  href={l.path || '#'}
                  className={`${styles.link} ${isActive(l) ? styles.active : ''}`}
                  onClick={(e) => handleNavClick(e, l)}
                >
                  {l.label}
                </a>
              )}
            </li>
          ))}
        </ul>

        <div className={styles.actions}>
          {currentUser ? (
            <>
              <Link to="/user/dashboard" className={styles.userBtn}>
                <FiUser size={14} />
                {currentUser.displayName?.split(' ')[0] || 'Dashboard'}
              </Link>
              <button onClick={handleLogout} className={styles.logoutBtn} title="Logout">
                <FiLogOut size={15} />
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn-ghost">Login</Link>
              <Link to="/book" className="btn-primary" style={{ padding: '9px 20px', fontSize: '0.875rem' }}>
                Book Appointment
              </Link>
            </>
          )}
        </div>

        <button className={styles.hamburger} onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? <FiX size={22} /> : <FiMenu size={22} />}
        </button>
      </div>

      <AnimatePresence>
        {menuOpen && (
          <motion.div className={styles.mobileMenu}
            initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.25 }}>
            {navLinks.map(l => (
              l.path && !l.action ? (
                <Link key={l.label} to={l.path} className={styles.mobileLink}>{l.label}</Link>
              ) : (
                <a
                  key={l.label}
                  href={l.path || '#'}
                  className={styles.mobileLink}
                  onClick={(e) => handleNavClick(e, l)}
                >
                  {l.label}
                </a>
              )
            ))}
            {currentUser ? (
              <>
                <Link to="/user/dashboard" className={styles.mobileLink}>Dashboard</Link>
                <button onClick={handleLogout} className={styles.mobileLink}
                  style={{ background: 'none', border: 'none', textAlign: 'left', width: '100%', color: '#ef4444', cursor: 'pointer' }}>Logout</button>
              </>
            ) : (
              <>
                <Link to="/login" className={styles.mobileLink}>Login</Link>
                <Link to="/book" className={styles.mobileLink} style={{ color: 'var(--accent)', fontWeight: 600 }}>Book Appointment</Link>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
