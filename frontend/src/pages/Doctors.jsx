import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { FiStar, FiArrowRight, FiAward, FiCheckCircle } from 'react-icons/fi';
import { useScrollAnimation, fadeUp } from '../hooks/useScrollAnimation';
import { useAuth } from '../context/AuthContext';

const DR_AJAY = {
  name: 'Dr. Ajay Giri',
  qualification: 'MDS',
  speciality: 'Dental Specialist',
  exp: '12+ Years',
  rating: 5.0,
  reviews: 326,
  color: '#3B3F97',
  photo: '/doctor.jpg',
  bio: 'Dr. Ajay Giri is a highly experienced dental specialist with over 12 years of expertise in providing advanced and patient-friendly dental care. Known for his gentle approach and precision, he ensures a comfortable experience for every patient.',
  qualifications: [
    'BDS – Dental Surgery',
    'MDS – Master of Dental Surgery',
    'Advanced Implantology Certified',
    'Laser Dentistry Specialist',
  ],
  treats: ['Root Canal', 'Dental Implants', 'Orthodontics', 'Extractions', 'Teeth Whitening', 'Cosmetic Dentistry'],
};

export default function Doctors() {
  const { ref, isInView } = useScrollAnimation();
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  function handleBooking() {
    if (!currentUser) {
      navigate('/login');
    } else {
      navigate('/book');
    }
  }

  const d = DR_AJAY;

  return (
    <div style={{ background: '#f8fafc', minHeight: '100vh', paddingTop: 64 }}>

      {/* Hero */}
      <section style={{ background: '#fff', borderBottom: '1px solid #f1f5f9', padding: '64px 0 52px' }}>
        <div className="container">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <span className="badge" style={{ marginBottom: 16, display: 'inline-flex' }}>Meet the Team</span>
            <h1 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.6rem)', fontWeight: 800, color: '#0f172a', marginBottom: 12, maxWidth: 500 }}>
              Your Specialist, Dedicated to Your Smile
            </h1>
            <p style={{ color: '#64748b', fontSize: '0.975rem', lineHeight: 1.75, maxWidth: 480 }}>
              Highly qualified and caring — Dr. Ajay Giri brings over 12 years of expertise to every patient, every visit.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Doctor Card */}
      <section className="section" style={{ paddingTop: 48 }}>
        <div className="container">
          <motion.div ref={ref}
            initial={{ opacity: 0, y: 24 }} animate={isInView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.5 }}>

            {/* Main card */}
            <div style={{
              background: '#fff', border: '1px solid #e2e8f0', borderRadius: 20,
              boxShadow: '0 4px 24px rgba(59,63,151,0.08)', overflow: 'hidden',
            }}>

              {/* Blue banner */}
              <div style={{
                background: 'linear-gradient(135deg, #3B3F97, #2E3192)',
                padding: '32px 40px', display: 'flex', alignItems: 'center', gap: 24,
                position: 'relative', overflow: 'hidden',
              }}>
                <div style={{ position: 'absolute', top: -30, right: -30, width: 150, height: 150, borderRadius: '50%', background: 'rgba(255,255,255,0.06)' }} />
                <div style={{ position: 'absolute', bottom: -40, left: 200, width: 100, height: 100, borderRadius: '50%', background: 'rgba(255,255,255,0.04)' }} />
                <div style={{ position: 'relative', zIndex: 1 }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'rgba(255,255,255,0.6)', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 6 }}>
                    Chief Dental Specialist
                  </div>
                  <h2 style={{ fontSize: '1.8rem', fontWeight: 900, color: '#fff', marginBottom: 4 }}>{d.name}</h2>
                  <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: '1rem', fontWeight: 600 }}>{d.qualification} &nbsp;·&nbsp; {d.speciality}</div>
                </div>
                <div style={{ marginLeft: 'auto', display: 'flex', gap: 24, position: 'relative', zIndex: 1 }}>
                  {[['12+', 'Years Experience'], ['5.0★', 'Rating'], ['326+', 'Reviews']].map(([val, label]) => (
                    <div key={label} style={{ textAlign: 'center' }}>
                      <div style={{ fontWeight: 900, fontSize: '1.5rem', color: '#fff' }}>{val}</div>
                      <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.65)', marginTop: 3 }}>{label}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Body */}
              <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 0 }}>

                {/* Left — Photo */}
                <div style={{
                  padding: '36px 28px', borderRight: '1px solid #f1f5f9',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20,
                }}>
                  <div style={{
                    width: 200, height: 220,
                    borderRadius: 16,
                    overflow: 'hidden',
                    border: '3px solid #ECEDF8',
                    boxShadow: '0 8px 32px rgba(59,63,151,0.12)',
                  }}>
                    <img
                      src={d.photo}
                      alt={d.name}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        objectPosition: 'top center',
                        display: 'block',
                      }}
                    />
                  </div>

                  {/* Stars */}
                  <div style={{ display: 'flex', gap: 4, justifyContent: 'center' }}>
                    {[...Array(5)].map((_, j) => (
                      <FiStar key={j} size={18} fill="#fbbf24" color="#fbbf24" />
                    ))}
                  </div>
                  <div style={{ fontSize: '0.82rem', color: '#94a3b8', textAlign: 'center' }}>
                    {d.reviews}+ verified patient reviews
                  </div>

                  <button
                    onClick={handleBooking}
                    className="btn-primary"
                    style={{ width: '100%', justifyContent: 'center', padding: '12px' }}
                  >
                    Book Appointment <FiArrowRight size={15} />
                  </button>

                  <div style={{ width: '100%', padding: '12px 16px', background: '#ECEDF8', borderRadius: 10, textAlign: 'center' }}>
                    <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginBottom: 2 }}>Emergency / Enquiry</div>
                    <a href="tel:8669062290" style={{ fontWeight: 800, fontSize: '1.05rem', color: '#3B3F97' }}>
                      8669062290
                    </a>
                  </div>
                </div>

                {/* Right — Info */}
                <div style={{ padding: '36px 36px' }}>
                  <h3 style={{ fontWeight: 800, fontSize: '1rem', color: '#0f172a', marginBottom: 6 }}>About Dr. Ajay Giri</h3>
                  <p style={{ color: '#475569', fontSize: '0.92rem', lineHeight: 1.8, marginBottom: 28 }}>
                    {d.bio}
                  </p>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 28 }}>
                    <div>
                      <h4 style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 14 }}>
                        Qualifications
                      </h4>
                      {d.qualifications.map(q => (
                        <div key={q} style={{ display: 'flex', gap: 8, marginBottom: 10, fontSize: '0.875rem', color: '#475569', alignItems: 'flex-start' }}>
                          <FiCheckCircle size={14} color="#3B3F97" style={{ flexShrink: 0, marginTop: 2 }} />
                          {q}
                        </div>
                      ))}
                    </div>
                    <div>
                      <h4 style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 14 }}>
                        Specializes In
                      </h4>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                        {d.treats.map(t => (
                          <span key={t} style={{
                            padding: '5px 14px', borderRadius: 50, fontSize: '0.8rem',
                            fontWeight: 600, background: '#ECEDF8', color: '#3B3F97',
                            border: '1px solid #B0B2DA',
                          }}>{t}</span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Achievement badges */}
                  <div style={{ display: 'flex', gap: 12, marginTop: 28, flexWrap: 'wrap' }}>
                    {[
                      ['🏆', 'Award-Winning Dentist'],
                      ['💉', 'Pain-Free Specialist'],
                      ['🚨', '24/7 Emergency Care'],
                    ].map(([icon, label]) => (
                      <div key={label} style={{
                        display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px',
                        borderRadius: 50, background: '#f8fafc', border: '1px solid #e2e8f0',
                        fontSize: '0.82rem', fontWeight: 600, color: '#475569',
                      }}>
                        <span>{icon}</span> {label}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

          </motion.div>
        </div>
      </section>
    </div>
  );
}
