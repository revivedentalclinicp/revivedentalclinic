import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FiMapPin, FiPhone, FiMail, FiInstagram, FiFacebook, FiTwitter, FiClock } from 'react-icons/fi';

export default function Footer() {
  const navigate = useNavigate();
  const location = useLocation();

  /**
   * Navigate to a page AND scroll to top.
   * If already on the target page, just scroll to top.
   */
  function goTo(path) {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (location.pathname !== path) {
      navigate(path);
    }
  }

  /**
   * Navigate to home page and scroll to a section.
   */
  function goToSection(sectionId) {
    const scrollToEl = () => {
      const el = document.getElementById(sectionId);
      if (el) {
        const top = el.getBoundingClientRect().top + window.scrollY - 68;
        window.scrollTo({ top, behavior: 'smooth' });
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    };

    if (location.pathname !== '/') {
      navigate('/');
      setTimeout(scrollToEl, 400);
    } else {
      scrollToEl();
    }
  }

  const linkStyle = {
    display: 'block', color: '#64748b', fontSize: '0.875rem',
    marginBottom: 10, transition: 'color 0.2s', cursor: 'pointer',
    textDecoration: 'none', background: 'none', border: 'none',
    textAlign: 'left', padding: 0,
  };

  return (
    <footer style={{
      background: '#070d1a',
      borderTop: '1px solid rgba(255,255,255,0.07)',
      padding: '60px 0 0',
    }}>
      <div className="container">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 40, marginBottom: 48 }}>

          {/* Brand */}
          <div>
            <button
              onClick={() => goTo('/')}
              style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
            >
              <img src="/logo.svg" alt="Revive Dental" style={{ width: 38, height: 38, borderRadius: 8 }} />
              <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#fff' }}>
                Revive <span style={{ color: '#3B3F97' }}>Dental</span>
              </span>
            </button>
            <p style={{ color: '#64748b', fontSize: '0.875rem', lineHeight: 1.75, maxWidth: 240, marginBottom: 16 }}>
              Revive Dental Speciality Clinic — Modern dentistry with a personal touch. We care for your smile like our own.
            </p>
            <div style={{ display: 'flex', gap: 10 }}>
              {[FiInstagram, FiFacebook, FiTwitter].map((Icon, i) => (
                <a key={i} href="#" style={{
                  width: 36, height: 36, borderRadius: 8,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: 'rgba(255,255,255,0.05)', color: '#94a3b8',
                  border: '1px solid rgba(255,255,255,0.08)', transition: 'all 0.25s',
                }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(59,63,151,0.2)'; e.currentTarget.style.color = '#818cf8'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = '#94a3b8'; }}
                ><Icon size={15} /></a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 style={{ fontWeight: 700, marginBottom: 18, color: '#f1f5f9', fontSize: '0.9rem' }}>Quick Links</h4>
            <button onClick={() => goTo('/')} style={linkStyle}
              onMouseEnter={e => e.currentTarget.style.color = '#818cf8'}
              onMouseLeave={e => e.currentTarget.style.color = '#64748b'}>
              Home
            </button>
            <button onClick={() => goTo('/services')} style={linkStyle}
              onMouseEnter={e => e.currentTarget.style.color = '#818cf8'}
              onMouseLeave={e => e.currentTarget.style.color = '#64748b'}>
              Services
            </button>
            <button onClick={() => goTo('/doctors')} style={linkStyle}
              onMouseEnter={e => e.currentTarget.style.color = '#818cf8'}
              onMouseLeave={e => e.currentTarget.style.color = '#64748b'}>
              Our Doctor
            </button>
            <button onClick={() => goToSection('about')} style={linkStyle}
              onMouseEnter={e => e.currentTarget.style.color = '#818cf8'}
              onMouseLeave={e => e.currentTarget.style.color = '#64748b'}>
              About Us
            </button>
            <button onClick={() => goToSection('contact')} style={linkStyle}
              onMouseEnter={e => e.currentTarget.style.color = '#818cf8'}
              onMouseLeave={e => e.currentTarget.style.color = '#64748b'}>
              Contact
            </button>
            <button onClick={() => goTo('/book')} style={{ ...linkStyle, color: '#818cf8', fontWeight: 600 }}
              onMouseEnter={e => e.currentTarget.style.color = '#a5b4fc'}
              onMouseLeave={e => e.currentTarget.style.color = '#818cf8'}>
              Book Appointment
            </button>
            <button onClick={() => goTo('/user/dashboard')} style={linkStyle}
              onMouseEnter={e => e.currentTarget.style.color = '#818cf8'}
              onMouseLeave={e => e.currentTarget.style.color = '#64748b'}>
              Patient Dashboard
            </button>
          </div>

          {/* Services */}
          <div>
            <h4 style={{ fontWeight: 700, marginBottom: 18, color: '#f1f5f9', fontSize: '0.9rem' }}>Our Services</h4>
            {['Teeth Cleaning', 'Dental Implants', 'Orthodontics / Braces', 'Teeth Whitening', 'Root Canal', 'Cosmetic Dentistry'].map(s => (
              <p key={s} style={{ color: '#64748b', fontSize: '0.875rem', marginBottom: 10 }}>{s}</p>
            ))}
          </div>

          {/* Contact */}
          <div>
            <h4 style={{ fontWeight: 700, marginBottom: 18, color: '#f1f5f9', fontSize: '0.9rem' }}>Contact Us</h4>
            {[
              [FiMapPin, 'IVY BOTANICA, D-08, Ivy Estate Rd, opposite Sonchafa Building, beside Aasha Medical, Wagholi, Pune, Maharashtra 412207'],
              [FiPhone, '8669062290'],
              [FiMail, 'revivedentalclinicp@gmail.com'],
            ].map(([Icon, text], i) => (
              <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', marginBottom: 14 }}>
                <Icon size={15} color="#3B3F97" style={{ flexShrink: 0, marginTop: 3 }} />
                <span style={{ color: '#64748b', fontSize: '0.875rem', lineHeight: 1.55 }}>{text}</span>
              </div>
            ))}
            <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', marginTop: 4 }}>
              <FiClock size={15} color="#3B3F97" style={{ flexShrink: 0, marginTop: 3 }} />
              <div>
                <p style={{ color: '#64748b', fontSize: '0.875rem', marginBottom: 2 }}>Mon–Sat: 9 AM – 7 PM</p>
                <p style={{ color: '#64748b', fontSize: '0.875rem' }}>Sun: 10 AM – 2 PM</p>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom bar */}
        <div style={{
          borderTop: '1px solid rgba(255,255,255,0.07)',
          padding: '18px 0',
          display: 'flex', justifyContent: 'space-between',
          alignItems: 'center', flexWrap: 'wrap', gap: 12,
        }}>
          <p style={{ color: '#475569', fontSize: '0.82rem' }}>
            © 2025 Revive Dental Speciality Clinic. All rights reserved.
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            <p style={{ color: '#475569', fontSize: '0.82rem' }}>Made with ❤️ for healthy smiles</p>
            <Link
              to="/admin"
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              style={{
                color: '#334155', fontSize: '0.75rem', fontWeight: 500,
                opacity: 0.5, transition: 'opacity 0.2s', textDecoration: 'none',
              }}
              onMouseEnter={e => e.currentTarget.style.opacity = '1'}
              onMouseLeave={e => e.currentTarget.style.opacity = '0.5'}
            >
              Admin Login
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
