import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  FiArrowRight, FiStar, FiChevronLeft, FiChevronRight,
  FiCheck, FiPhone, FiCalendar, FiShield, FiAward,
  FiMapPin, FiMail, FiSend,
} from 'react-icons/fi';
import { GiTooth } from 'react-icons/gi';
import { useState, useEffect, useRef } from 'react';
import { useScrollAnimation, fadeUp, stagger, scaleIn } from '../hooks/useScrollAnimation';
import { submitInquiry } from '../services/inquiryService';
import toast from 'react-hot-toast';

/* ═══════════════════════════════════════════
   HERO
═══════════════════════════════════════════ */
function Hero() {
  const [activeFeature, setActiveFeature] = useState(0);
  const features = ['Pain-free procedures', 'Latest technology', 'Expert certified team', '24/7 emergency care'];

  useEffect(() => {
    const t = setInterval(() => setActiveFeature(i => (i + 1) % features.length), 2200);
    return () => clearInterval(t);
  }, []);

  return (
    <section style={{ background: 'linear-gradient(135deg, #ECEDF8 0%, #ffffff 50%, #F0F4FF 100%)', paddingTop: 68, minHeight: '92vh', display: 'flex', alignItems: 'center', position: 'relative', overflow: 'hidden' }}>
      {/* Grid pattern */}
      <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle, rgba(59,63,151,0.07) 1px, transparent 1px)', backgroundSize: '32px 32px', pointerEvents: 'none' }} />

      <div className="container" style={{ position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 64, alignItems: 'center', padding: '48px 0' }}>

          {/* LEFT */}
          <div>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#fff', border: '1px solid #B0B2DA', borderRadius: 50, padding: '6px 16px 6px 8px', marginBottom: 28, boxShadow: '0 2px 12px rgba(59,63,151,0.1)' }}>
                <div style={{ width: 24, height: 24, borderRadius: '50%', background: '#3B3F97', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <FiShield size={12} color="#fff" />
                </div>
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#3B3F97' }}>Trusted &amp; Certified Care</span>
              </div>
            </motion.div>

            <motion.h1 initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }}
              style={{ fontSize: 'clamp(2.2rem, 4.5vw, 3.4rem)', fontWeight: 900, color: '#0f172a', lineHeight: 1.1, marginBottom: 24 }}>
              Your Perfect{' '}
              <span style={{ position: 'relative', display: 'inline-block' }}>
                <span style={{ color: '#F58220' }}>Smile</span>
                <svg style={{ position: 'absolute', bottom: -4, left: 0, width: '100%', height: 6 }} viewBox="0 0 200 6" preserveAspectRatio="none">
                  <path d="M0 5 Q50 0 100 5 Q150 10 200 5" stroke="#F58220" strokeWidth="2.5" fill="none" strokeLinecap="round" opacity="0.4" />
                </svg>
              </span>
              <br />Starts{' '}
              <span style={{ color: '#3B3F97' }}>Here</span>
            </motion.h1>

            <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
              style={{ color: '#64748b', fontSize: '1.05rem', lineHeight: 1.75, marginBottom: 16, maxWidth: 440 }}>
              Experience world-class dental care with advanced technology and a warm, friendly atmosphere. Book instantly through our easy online system.
            </motion.p>

            {/* Animated rotating feature tag */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
              style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 32, height: 28 }}>
              <FiCheck size={16} color="#3B3F97" />
              <AnimatePresence mode="wait">
                <motion.span key={activeFeature}
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  style={{ color: '#3B3F97', fontWeight: 700, fontSize: '0.925rem' }}>
                  {features[activeFeature]}
                </motion.span>
              </AnimatePresence>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
              style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 44 }}>
              <Link to="/book" className="btn-primary" style={{ padding: '14px 32px', fontSize: '0.975rem', borderRadius: 12 }}>
                Book Appointment <FiArrowRight size={16} />
              </Link>
              <Link to="/services" className="btn-outline" style={{ padding: '14px 28px', fontSize: '0.975rem', borderRadius: 12 }}>
                View Services
              </Link>
            </motion.div>

            {/* Stats */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
              style={{ display: 'flex', gap: 0, borderTop: '1px solid #e2e8f0', paddingTop: 28 }}>
              {[['2,000+', 'Happy Patients', '#3B3F97'], ['4.9★', 'Average rating', '#F58220']].map(([num, label, color], i) => (
                <div key={label} style={{ flex: 1, paddingLeft: i > 0 ? 24 : 0, borderLeft: i > 0 ? '1px solid #f1f5f9' : 'none', marginLeft: i > 0 ? 24 : 0 }}>
                  <div style={{ fontSize: '1.6rem', fontWeight: 900, color, lineHeight: 1 }}>{num}</div>
                  <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: 5, fontWeight: 500 }}>{label}</div>
                </div>
              ))}
            </motion.div>
          </div>

          {/* RIGHT — interactive card */}
          <motion.div initial={{ opacity: 0, x: 40, scale: 0.95 }} animate={{ opacity: 1, x: 0, scale: 1 }} transition={{ duration: 0.7, delay: 0.15 }}
            style={{ position: 'relative' }}>
            {/* Main card */}
            <div style={{
              background: '#fff', borderRadius: 24, border: '1px solid #e2e8f0',
              boxShadow: '0 20px 60px rgba(59,63,151,0.12), 0 4px 16px rgba(0,0,0,0.06)',
              overflow: 'hidden',
            }}>
              {/* Blue header */}
              <div style={{ background: 'linear-gradient(135deg, #3B3F97, #2E3192)', padding: '28px 28px 24px', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: -20, right: -20, width: 100, height: 100, borderRadius: '50%', background: 'rgba(255,255,255,0.08)' }} />
                <div style={{ position: 'absolute', bottom: -10, left: 40, width: 60, height: 60, borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />
                <motion.div animate={{ rotate: [0, 8, -8, 0] }} transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 64, height: 64, borderRadius: 18, background: 'rgba(255,255,255,0.15)', marginBottom: 16 }}>
                  <img src="/logo.svg" alt="Revive Dental" style={{ width: 48, height: 48, borderRadius: 12 }} />
                </motion.div>
                <div style={{ color: '#fff', fontWeight: 800, fontSize: '1.15rem', marginBottom: 4 }}>Book Your Visit</div>
                <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.85rem' }}>Next available: Today, 2:00 PM</div>
              </div>

              {/* Body */}
              <div style={{ padding: '24px 28px' }}>
                {[
                  { label: 'Service', value: 'Select treatment', icon: '🦷' },
                  { label: 'Dentist', value: 'Choose specialist', icon: '👨‍⚕️' },
                  { label: 'Date & Time', value: 'Pick a slot', icon: '📅' },
                ].map((item, i) => (
                  <Link to="/book" key={item.label}
                    style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '13px 0', borderBottom: i < 2 ? '1px solid #f8fafc' : 'none', transition: 'all 0.2s', cursor: 'pointer' }}
                    onMouseEnter={e => e.currentTarget.style.paddingLeft = '6px'}
                    onMouseLeave={e => e.currentTarget.style.paddingLeft = '0'}>
                    <div style={{ width: 38, height: 38, borderRadius: 10, background: '#ECEDF8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', flexShrink: 0 }}>{item.icon}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 600, marginBottom: 2 }}>{item.label}</div>
                      <div style={{ fontSize: '0.88rem', color: '#64748b' }}>{item.value}</div>
                    </div>
                    <FiArrowRight size={15} color="#3B3F97" />
                  </Link>
                ))}
                <Link to="/book" className="btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: 20, padding: '13px', borderRadius: 10, fontSize: '0.95rem' }}>
                  Book Appointment <FiArrowRight size={15} />
                </Link>
              </div>
            </div>

            {/* Floating badge — rating */}
            <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              style={{ position: 'absolute', top: -16, right: -16, background: '#fff', border: '1px solid #e2e8f0', borderRadius: 14, padding: '10px 16px', boxShadow: '0 8px 24px rgba(0,0,0,0.1)', display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: '1.2rem' }}>⭐</span>
              <div>
                <div style={{ fontWeight: 800, fontSize: '0.9rem', color: '#0f172a' }}>4.9 / 5.0</div>
                <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>326 reviews</div>
              </div>
            </motion.div>

            {/* Floating badge — emergency */}
            <motion.div animate={{ y: [0, 6, 0] }} transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
              style={{ position: 'absolute', bottom: -16, left: -16, background: '#3B3F97', borderRadius: 14, padding: '10px 16px', boxShadow: '0 8px 24px rgba(59,63,151,0.35)', display: 'flex', alignItems: 'center', gap: 8 }}>
              <FiPhone size={15} color="#fff" />
              <div>
                <div style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.7)', fontWeight: 600 }}>24/7 Emergency</div>
                <div style={{ fontWeight: 800, fontSize: '0.85rem', color: '#fff' }}>8669062290</div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Scroll hint */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2 }}
        style={{ position: 'absolute', bottom: 28, left: '50%', transform: 'translateX(-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
        <span style={{ fontSize: '0.7rem', color: '#94a3b8', letterSpacing: 2, fontWeight: 600 }}>SCROLL</span>
        <motion.div animate={{ y: [0, 6, 0] }} transition={{ duration: 1.4, repeat: Infinity }}
          style={{ width: 1.5, height: 28, background: 'linear-gradient(to bottom, #3B3F97, transparent)' }} />
      </motion.div>
    </section>
  );
}

/* ═══════════════════════════════════════════
   TRUST BAR
═══════════════════════════════════════════ */
function TrustBar() {
  const { ref, isInView } = useScrollAnimation();
  return (
    <section style={{ background: '#fff', borderTop: '1px solid #f1f5f9', borderBottom: '1px solid #f1f5f9', padding: '28px 0' }}>
      <div className="container">
        <motion.div ref={ref} initial={{ opacity: 0, y: 16 }} animate={isInView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.5 }}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-around', gap: 16, flexWrap: 'wrap' }}>
          {[
            [FiShield, 'Trusted & Certified', 'ISO 9001 Certified Clinic'],
            [FiAward, 'Award Winning', 'Best Dental Clinic 2024'],
            [GiTooth, '5,000+ Patients', 'Happy & satisfied'],
            [FiCalendar, 'Easy Booking', 'Online in under 2 min'],
          ].map(([Icon, title, sub]) => (
            <div key={title} style={{ display: 'flex', alignItems: 'center', gap: 12, flex: '1 1 200px' }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: '#ECEDF8', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Icon size={18} color="#3B3F97" />
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#0f172a' }}>{title}</div>
                <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>{sub}</div>
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════
   SERVICES
═══════════════════════════════════════════ */
const services = [
  { emoji: '🦷', title: 'Teeth Cleaning', desc: 'Professional scaling & polishing to remove plaque, tartar and surface stains. Recommended every 6 months.', price: '₹800', tag: 'Popular' },
  { emoji: '🔩', title: 'Dental Implants', desc: 'Permanent missing tooth replacement with titanium implants. Natural look, feel, and function restored.', price: '₹25,000+', tag: 'Advanced' },
  { emoji: '📐', title: 'Orthodontics', desc: 'Straighten misaligned teeth with modern braces or Invisalign clear aligners for all ages.', price: '₹18,000+', tag: 'Braces' },
  { emoji: '✨', title: 'Teeth Whitening', desc: 'In-chair professional bleaching lightens teeth by up to 8 shades in just one 60-minute session.', price: '₹3,500', tag: 'Quick' },
  { emoji: '🩺', title: 'Root Canal', desc: 'Pain-free endodontic therapy that saves your natural tooth by removing infection from the root canal.', price: '₹5,000+', tag: 'Painless' },
  { emoji: '💎', title: 'Cosmetic Dentistry', desc: 'Transform your smile with porcelain veneers, bonding, gum contouring and full makeovers.', price: '₹8,000+', tag: 'Aesthetic' },
];

function ServicesSection() {
  const { ref, isInView } = useScrollAnimation();
  const [hovered, setHovered] = useState(null);

  return (
    <section className="section" style={{ background: '#ECEDF8' }}>
      <div className="container">
        <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}
          style={{ textAlign: 'center', marginBottom: 52 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#fff', border: '1px solid #B0B2DA', borderRadius: 50, padding: '5px 14px', marginBottom: 16 }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#3B3F97' }}>OUR SERVICES</span>
          </div>
          <h2 style={{ fontSize: 'clamp(1.7rem, 3.5vw, 2.4rem)', fontWeight: 900, color: '#0f172a', marginBottom: 12 }}>Comprehensive Dental Care</h2>
          <p style={{ color: '#64748b', fontSize: '0.975rem', maxWidth: 480, margin: '0 auto', lineHeight: 1.7 }}>
            We offer a wide range of services to keep your smile healthy and bright, using the latest medical technology.
          </p>
        </motion.div>

        <motion.div ref={ref} variants={stagger} initial="hidden" animate={isInView ? 'visible' : 'hidden'}
          style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
          {services.map((s, i) => (
            <motion.div key={s.title} variants={scaleIn}
              onHoverStart={() => setHovered(i)} onHoverEnd={() => setHovered(null)}
              style={{
                background: hovered === i ? '#3B3F97' : '#fff',
                border: `1px solid ${hovered === i ? '#3B3F97' : '#e2e8f0'}`,
                borderRadius: 16, padding: '28px 24px', cursor: 'pointer',
                transition: 'all 0.28s ease', boxShadow: hovered === i ? '0 16px 48px rgba(59,63,151,0.25)' : '0 1px 4px rgba(0,0,0,0.05)',
              }}
              whileHover={{ y: -6 }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 18 }}>
                <div style={{ width: 52, height: 52, borderRadius: 14, background: hovered === i ? 'rgba(255,255,255,0.15)' : '#ECEDF8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem', transition: 'all 0.28s' }}>
                  {s.emoji}
                </div>
                <span style={{ padding: '3px 10px', borderRadius: 50, fontSize: '0.72rem', fontWeight: 700, background: hovered === i ? 'rgba(255,255,255,0.15)' : '#ECEDF8', color: hovered === i ? '#fff' : '#3B3F97', transition: 'all 0.28s' }}>
                  {s.tag}
                </span>
              </div>
              <h3 style={{ fontWeight: 800, fontSize: '1.02rem', color: hovered === i ? '#fff' : '#0f172a', marginBottom: 8, transition: 'all 0.28s' }}>{s.title}</h3>
              <p style={{ color: hovered === i ? 'rgba(255,255,255,0.8)' : '#64748b', fontSize: '0.86rem', lineHeight: 1.65, marginBottom: 20, transition: 'all 0.28s' }}>{s.desc}</p>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontWeight: 800, fontSize: '1rem', color: hovered === i ? '#fff' : '#F58220', transition: 'all 0.28s' }}>{s.price}</span>
                <Link to="/book" style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.82rem', fontWeight: 700, color: hovered === i ? '#fff' : '#3B3F97', transition: 'all 0.28s' }}>
                  Book <FiArrowRight size={13} />
                </Link>
              </div>
            </motion.div>
          ))}
        </motion.div>

        <div style={{ textAlign: 'center', marginTop: 36 }}>
          <Link to="/services" className="btn-outline" style={{ padding: '12px 28px' }}>
            View All Services <FiArrowRight size={15} />
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════
   TESTIMONIALS — DUAL-ROW INFINITE SCROLL
═══════════════════════════════════════════ */
const REAL_TESTIMONIALS = [
  {
    name: 'Komal Giri',
    avatar: 'KG',
    color: '#3B3F97',
    rating: 5,
    highlight: 'Painless',
    text: 'I recently underwent RCT and wisdom tooth extraction at Revive Dental Speciality Clinic and had an excellent experience. Dr. Ajay and the staff made me feel comfortable throughout. The clinic is clean, well-equipped, and the procedures were virtually painless. Highly recommended!',
  },
  {
    name: 'Devendra Shingane',
    avatar: 'DS',
    color: '#F58220',
    rating: 5,
    highlight: 'Gentle',
    text: 'The doctor was very gentle during my tooth extraction. I barely felt any pain and the whole process was quick. The staff was polite and the clinic was very clean. I will definitely recommend Revive Dental to my family and friends.',
  },
  {
    name: 'Priyanka Pagey',
    avatar: 'PP',
    color: '#059669',
    rating: 5,
    highlight: 'Trusted',
    text: "I've always been terrified of dentists, but the team at Revive Dental changed that completely. They were so patient and explained every step before doing it. The clinic has a calming atmosphere and the treatment was absolutely painless. Best dental experience ever!",
  },
  {
    name: 'Monali Bagul',
    avatar: 'MB',
    color: '#3B3F97',
    rating: 5,
    highlight: 'Painless',
    text: 'I had a root canal treatment here and I was dreading it, but Dr. Ajay made it completely stress-free. The clinic is hygienic and modern. The staff is friendly and professional. I am so glad I chose Revive Dental. Zero pain, great results!',
  },
  {
    name: 'Jayesh Patil',
    avatar: 'JP',
    color: '#7c3aed',
    rating: 5,
    highlight: 'Trusted',
    text: 'Dr. Ajay creates a calm and comfortable environment which makes even the most anxious patients feel at ease. His expertise is evident in his work. The clinic is state-of-the-art and the procedures are pain-free. Highly satisfied with the treatment.',
  },
  {
    name: 'Aishwarya Dubey',
    avatar: 'AD',
    color: '#F58220',
    rating: 5,
    highlight: 'Emergency Care',
    text: 'I had severe pain during pregnancy at 2 AM and was really worried about finding a dentist. Dr. Ajay at Revive Dental attended to me promptly despite the odd hours. He was extremely careful given my condition and provided immediate relief. Truly a life saver!',
  },
  {
    name: 'Amit Naidu',
    avatar: 'AN',
    color: '#0891b2',
    rating: 5,
    highlight: 'Emergency Care',
    text: 'I had severe tooth pain at night and called the clinic in desperation. They assisted me immediately and provided emergency treatment. The pain was gone within hours. Dr. Ajay is not just a great dentist but also a very compassionate human being.',
  },
  {
    name: 'Kishor Khanapurkar',
    avatar: 'KK',
    color: '#3B3F97',
    rating: 5,
    highlight: 'Gentle',
    text: 'My extraction and denture treatment were smooth and comfortable, thanks to Dr. Ajay and the wonderful team at Revive Dental. The dentures fit perfectly and look completely natural. The whole experience from consultation to completion was excellent.',
  },
];

// Split into two rows
const ROW1 = REAL_TESTIMONIALS.slice(0, 4);
const ROW2 = REAL_TESTIMONIALS.slice(4);

function TestimonialCard({ t }) {
  return (
    <div style={{
      background: '#fff',
      border: '1px solid #e2e8f0',
      borderRadius: 16,
      padding: '24px',
      width: 320,
      flexShrink: 0,
      boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
      userSelect: 'none',
    }}>
      {/* Stars */}
      <div style={{ display: 'flex', gap: 3, marginBottom: 12 }}>
        {[...Array(t.rating)].map((_, j) => <FiStar key={j} size={14} fill="#fbbf24" color="#fbbf24" />)}
      </div>

      {/* Highlight pill */}
      <div style={{ marginBottom: 12 }}>
        <span style={{
          padding: '3px 10px', borderRadius: 50, fontSize: '0.72rem', fontWeight: 700,
          background: '#ECEDF8', color: '#3B3F97',
        }}>
          {t.highlight}
        </span>
      </div>

      {/* Text */}
      <p style={{
        color: '#475569', fontSize: '0.85rem', lineHeight: 1.7,
        marginBottom: 18, fontStyle: 'italic',
        display: '-webkit-box', WebkitLineClamp: 4,
        WebkitBoxOrient: 'vertical', overflow: 'hidden',
      }}>
        "{t.text}"
      </p>

      {/* Author */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{
          width: 38, height: 38, borderRadius: '50%',
          background: `${t.color}18`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontWeight: 800, fontSize: '0.85rem', color: t.color,
          border: `2px solid ${t.color}30`,
        }}>
          {t.avatar}
        </div>
        <div>
          <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#0f172a' }}>{t.name}</div>
          <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Verified Patient</div>
        </div>
      </div>
    </div>
  );
}

function ScrollRow({ items, direction = 'left', speed = 35 }) {
  const doubled = [...items, ...items];
  const ref = useRef(null);
  const [isPaused, setIsPaused] = useState(false);
  const posRef = useRef(0);
  const rafRef = useRef(null);
  const CARD_W = 340; // card width + gap
  const TOTAL = items.length * CARD_W;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const step = () => {
      if (!isPaused) {
        posRef.current += direction === 'left' ? 0.5 : -0.5;
        if (posRef.current >= TOTAL) posRef.current -= TOTAL;
        if (posRef.current < 0) posRef.current += TOTAL;
        el.style.transform = `translateX(-${posRef.current}px)`;
      }
      rafRef.current = requestAnimationFrame(step);
    };
    rafRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafRef.current);
  }, [isPaused, direction, TOTAL]);

  return (
    <div
      style={{ overflow: 'hidden', width: '100%' }}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div
        ref={ref}
        style={{ display: 'flex', gap: 20, willChange: 'transform' }}
      >
        {doubled.map((t, i) => (
          <TestimonialCard key={i} t={t} />
        ))}
      </div>
    </div>
  );
}

function TestimonialsSection() {
  return (
    <section className="section" style={{ background: '#EFF6FF', overflow: 'hidden' }}>
      <div className="container">
        <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}
          style={{ textAlign: 'center', marginBottom: 48 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#fff', border: '1px solid #B0B2DA', borderRadius: 50, padding: '5px 14px', marginBottom: 14 }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#3B3F97' }}>PATIENT STORIES</span>
          </div>
          <h2 style={{ fontSize: 'clamp(1.7rem, 3.5vw, 2.4rem)', fontWeight: 900, color: '#0f172a', marginBottom: 12 }}>
            Voices of <span style={{ color: '#F58220' }}>Trust</span>
          </h2>
          <p style={{ color: '#64748b', fontSize: '0.975rem', maxWidth: 460, margin: '0 auto', lineHeight: 1.7 }}>
            Real reviews from real patients. Here's what our community says about Revive Dental.
          </p>
        </motion.div>
      </div>

      {/* Row 1 — scrolls left */}
      <div style={{ marginBottom: 20 }}>
        <ScrollRow items={ROW1} direction="left" />
      </div>
      {/* Row 2 — scrolls right */}
      <ScrollRow items={ROW2} direction="right" />

      <div style={{ textAlign: 'center', marginTop: 36 }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, color: '#64748b', fontSize: '0.85rem' }}>
          <FiStar size={14} fill="#fbbf24" color="#fbbf24" />
          <span>4.9 average rating based on 326+ reviews on Google</span>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════
   WHY CHOOSE US
═══════════════════════════════════════════ */
function WhyUs() {
  const { ref, isInView } = useScrollAnimation();
  const reasons = [
    { icon: '🏆', title: 'Award-Winning Care', desc: 'Recognized as the Best Dental Clinic of 2024 by the National Dental Association.' },
    { icon: '🚨', title: '24/7 Emergency Care', desc: 'We are available around the clock for dental emergencies. Call us any time at 8669062290.' },
    { icon: '💉', title: 'Pain-Free Procedures', desc: 'We use the latest numbing techniques and sedation options for a completely comfortable experience.' },
    { icon: '📱', title: 'Digital Records', desc: 'All your dental records, X-rays, and treatment plans are stored securely and accessible anytime.' },
  ];
  return (
    <section id="about" className="section" style={{ background: 'linear-gradient(135deg, #ECEDF8, #F0F4FF)' }}>
      <div className="container">
        <motion.div style={{ textAlign: 'center', marginBottom: 48 }} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#fff', border: '1px solid #B0B2DA', borderRadius: 50, padding: '5px 14px', marginBottom: 14 }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#3B3F97' }}>WHY CHOOSE US</span>
          </div>
          <h2 style={{ fontSize: 'clamp(1.7rem, 3.5vw, 2.4rem)', fontWeight: 900, color: '#0f172a' }}>The Revive Dental Difference</h2>
        </motion.div>
        <motion.div ref={ref} variants={stagger} initial="hidden" animate={isInView ? 'visible' : 'hidden'}
          style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20 }}>
          {reasons.map((r) => (
            <motion.div key={r.title} variants={fadeUp}
              style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 14, padding: '28px 22px', boxShadow: '0 1px 4px rgba(0,0,0,0.04)', textAlign: 'center' }}
              whileHover={{ y: -4, boxShadow: '0 12px 32px rgba(0,0,0,0.09)' }}>
              <div style={{ fontSize: '2rem', marginBottom: 16 }}>{r.icon}</div>
              <h3 style={{ fontWeight: 800, fontSize: '0.95rem', color: '#0f172a', marginBottom: 8 }}>{r.title}</h3>
              <p style={{ color: '#64748b', fontSize: '0.83rem', lineHeight: 1.65 }}>{r.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════
   CTA BANNER
═══════════════════════════════════════════ */
function CTABanner() {
  return (
    <section style={{ background: 'linear-gradient(135deg, #3B3F97, #2E3192)', padding: '80px 0', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.06) 1px, transparent 1px)', backgroundSize: '28px 28px', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', top: -60, right: -60, width: 240, height: 240, borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />
      <div style={{ position: 'absolute', bottom: -80, left: -40, width: 300, height: 300, borderRadius: '50%', background: 'rgba(255,255,255,0.04)' }} />
      <div className="container" style={{ position: 'relative', zIndex: 1 }}>
        <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          style={{ textAlign: 'center' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 50, padding: '5px 14px', marginBottom: 20 }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#fff' }}>✦ Limited Slots Available</span>
          </div>
          <h2 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', fontWeight: 900, color: '#fff', marginBottom: 12, lineHeight: 1.15 }}>
            Ready for Your Brightest <span style={{ color: '#F58220' }}>Smile</span>?
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '1rem', maxWidth: 440, margin: '0 auto 36px', lineHeight: 1.7 }}>
            Schedule your first consultation today. Our team is ready to help you find the perfect slot.
          </p>
          <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/book"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#F58220', color: '#fff', padding: '14px 32px', borderRadius: 12, fontWeight: 800, fontSize: '0.975rem', boxShadow: '0 4px 20px rgba(245,130,32,0.35)', transition: 'all 0.2s' }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.background = '#E0741F'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.background = '#F58220'; }}>
              Book Appointment <FiArrowRight size={16} />
            </Link>
            <a href="tel:8669062290"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.12)', color: '#fff', padding: '14px 28px', borderRadius: 12, fontWeight: 700, fontSize: '0.975rem', border: '1.5px solid rgba(255,255,255,0.25)', transition: 'all 0.2s' }}>
              <FiPhone size={16} /> Call Us Now
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════
   CONTACT / INQUIRY SECTION
═══════════════════════════════════════════ */
function ContactSection() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', location: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  function handleChange(e) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.name || !form.email || !form.phone || !form.location || !form.message) {
      toast.error('Please fill in all fields');
      return;
    }
    setLoading(true);
    try {
      await submitInquiry(form);
      setSubmitted(true);
      setForm({ name: '', email: '', phone: '', location: '', message: '' });
    } catch (err) {
      toast.error('Failed to send message. Please try again.');
    }
    setLoading(false);
  }

  return (
    <section id="contact" className="section" style={{ background: '#fff' }}>
      <div className="container">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 60, alignItems: 'center' }}>

          {/* LEFT — Info */}
          <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#ECEDF8', border: '1px solid #B0B2DA', borderRadius: 50, padding: '5px 14px', marginBottom: 16 }}>
              <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#3B3F97' }}>GET IN TOUCH</span>
            </div>
            <h2 style={{ fontSize: 'clamp(1.7rem, 3vw, 2.2rem)', fontWeight: 900, color: '#0f172a', marginBottom: 16, lineHeight: 1.2 }}>
              Send Us a <span style={{ color: '#F58220' }}>Message</span>
            </h2>
            <p style={{ color: '#64748b', fontSize: '0.975rem', lineHeight: 1.75, marginBottom: 32 }}>
              Have a question or want to find out more about our services? Just fill out the form and our team will get back to you shortly — no login required.
            </p>

            {[
              [FiMapPin, 'Our Location', 'IVY BOTANICA, D-08, Ivy Estate Rd, opposite to Sonchafa Building, beside Aasha Medical, Wagholi, Pune, Maharashtra 412207'],
              [FiPhone, 'Phone', '8669062290'],
              [FiMail, 'Email', 'revivedentalclinicdigital@gmail.com'],
              [FiCalendar, 'Working Hours', 'Mon–Sat: 9 AM – 7 PM | Sun: 10 AM – 2 PM'],
            ].map(([Icon, label, value]) => (
              <div key={label} style={{ display: 'flex', gap: 14, marginBottom: 20, alignItems: 'flex-start' }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: '#ECEDF8', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icon size={17} color="#3B3F97" />
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.82rem', color: '#94a3b8', marginBottom: 2 }}>{label}</div>
                  <div style={{ color: '#0f172a', fontSize: '0.9rem', lineHeight: 1.5 }}>{value}</div>
                </div>
              </div>
            ))}
          </motion.div>

          {/* RIGHT — Form */}
          <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
            <div style={{
              background: '#fff', borderRadius: 20, border: '1px solid #e2e8f0',
              padding: '36px', boxShadow: '0 8px 40px rgba(59,63,151,0.08)',
            }}>
              {submitted ? (
                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4 }}
                  style={{ textAlign: 'center', padding: '40px 20px' }}>
                  <div style={{ fontSize: '3rem', marginBottom: 16 }}>✅</div>
                  <h3 style={{ fontWeight: 800, fontSize: '1.2rem', color: '#0f172a', marginBottom: 12 }}>
                    Message Sent!
                  </h3>
                  <p style={{ color: '#64748b', fontSize: '0.95rem', lineHeight: 1.7 }}>
                    Thank you! Our team will contact you shortly.
                  </p>
                  <button
                    onClick={() => setSubmitted(false)}
                    style={{
                      marginTop: 24, padding: '10px 24px', borderRadius: 8,
                      border: '1.5px solid #3B3F97', background: '#fff',
                      color: '#3B3F97', fontWeight: 700, cursor: 'pointer',
                    }}>
                    Send Another
                  </button>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit}>
                  <h3 style={{ fontWeight: 800, fontSize: '1.1rem', color: '#0f172a', marginBottom: 6 }}>Quick Inquiry</h3>
                  <p style={{ color: '#94a3b8', fontSize: '0.82rem', marginBottom: 24 }}>No login required — we'll get back to you!</p>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
                    <div className="form-group" style={{ margin: 0 }}>
                      <label>Full Name *</label>
                      <input
                        name="name" type="text" className="form-control"
                        placeholder="Ravi Kumar"
                        value={form.name} onChange={handleChange} required
                      />
                    </div>
                    <div className="form-group" style={{ margin: 0 }}>
                      <label>Email Address *</label>
                      <input
                        name="email" type="email" className="form-control"
                        placeholder="ravi@email.com"
                        value={form.email} onChange={handleChange} required
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
                    <div className="form-group" style={{ margin: 0 }}>
                      <label>Contact Number *</label>
                      <input
                        name="phone" type="tel" className="form-control"
                        placeholder="9876543210"
                        value={form.phone} onChange={handleChange} required
                      />
                    </div>
                    <div className="form-group" style={{ margin: 0 }}>
                      <label>Location *</label>
                      <input
                        name="location" type="text" className="form-control"
                        placeholder="Wagholi, Pune"
                        value={form.location} onChange={handleChange} required
                      />
                    </div>
                  </div>

                  <div className="form-group" style={{ marginBottom: 20 }}>
                    <label>Message *</label>
                    <textarea
                      name="message" className="form-control" rows={4}
                      placeholder="Tell us about your dental concern or what service you're interested in..."
                      value={form.message} onChange={handleChange} required
                      style={{ resize: 'none' }}
                    />
                  </div>

                  <button
                    type="submit"
                    className="btn-primary"
                    style={{ width: '100%', justifyContent: 'center', padding: '13px', fontSize: '0.95rem' }}
                    disabled={loading}
                  >
                    {loading ? (
                      <span className="spinner" />
                    ) : (
                      <><FiSend size={16} /> Send Message</>
                    )}
                  </button>
                </form>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════
   HOME PAGE
═══════════════════════════════════════════ */
export default function Home() {
  return (
    <>
      <Hero />
      <TrustBar />
      <ServicesSection />
      <TestimonialsSection />
      <WhyUs />
      <CTABanner />
      <ContactSection />
    </>
  );
}
