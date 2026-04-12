import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FiArrowRight, FiCheck, FiClock } from 'react-icons/fi';
import { useScrollAnimation, fadeUp, stagger, scaleIn } from '../hooks/useScrollAnimation';

const services = [
  { emoji: '🧹', title: 'Teeth Cleaning', price: '₹800', duration: '45 min', desc: 'Professional scaling and polishing to remove plaque, tartar, and surface stains.', benefits: ['Plaque removal', 'Fresh breath', 'Gum health', 'Stain removal'] },
  { emoji: '🦷', title: 'Dental Implants', price: '₹25,000+', duration: '2–3 visits', desc: 'Permanent solution for missing teeth with titanium implants supporting a natural-looking crown.', benefits: ['Natural look', 'Long-lasting', 'Bone preservation', 'Full function'] },
  { emoji: '📐', title: 'Orthodontics', price: '₹18,000+', duration: '12–24 months', desc: 'Correct misaligned teeth using modern braces or clear aligners like Invisalign.', benefits: ['Straighter smile', 'Improved bite', 'Clear aligners', 'Better hygiene'] },
  { emoji: '✨', title: 'Teeth Whitening', price: '₹3,500', duration: '60 min', desc: 'Professional in-chair bleaching that lightens teeth by several shades in one session.', benefits: ['8 shades lighter', 'Safe process', 'Long-lasting', 'Instant results'] },
  { emoji: '🩺', title: 'Root Canal', price: '₹5,000+', duration: '1–2 visits', desc: 'Pain-free treatment to save an infected tooth by removing the nerve and sealing the root.', benefits: ['Tooth preservation', 'Pain relief', 'Infection control', 'Crown restoration'] },
  { emoji: '💎', title: 'Cosmetic Dentistry', price: '₹8,000+', duration: 'Varies', desc: 'Enhance your smile with porcelain veneers, bonding, contouring, and aesthetic upgrades.', benefits: ['Custom veneers', 'Bonding & shaping', 'Smile makeover', 'Confidence boost'] },
];

export default function Services() {
  const { ref, isInView } = useScrollAnimation();

  return (
    <div style={{ background: '#f8fafc', minHeight: '100vh', paddingTop: 64 }}>

      {/* Hero */}
      <section style={{ background: '#fff', borderBottom: '1px solid #f1f5f9', padding: '64px 0 56px' }}>
        <div className="container">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <span className="badge" style={{ marginBottom: 16, display: 'inline-flex' }}>Our Services</span>
            <h1 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', fontWeight: 800, color: '#0f172a', marginBottom: 14, maxWidth: 520 }}>
              Comprehensive Dental Care, All Under One Roof
            </h1>
            <p style={{ color: '#64748b', fontSize: '0.975rem', lineHeight: 1.75, maxWidth: 480 }}>
              From routine cleanings to complete smile makeovers — our expert team uses the latest technology to deliver exceptional results.
            </p>
            <div style={{ display: 'flex', gap: 12, marginTop: 28, flexWrap: 'wrap' }}>
              <Link to="/book" className="btn-primary">Book a Consultation <FiArrowRight size={15} /></Link>
              <a href="tel:8669062290" className="btn-white">📞 8669062290</a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="section" style={{ paddingTop: 52, paddingBottom: 64 }}>
        <div className="container">
          <motion.div ref={ref} variants={stagger} initial="hidden" animate={isInView ? 'visible' : 'hidden'}
            style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20 }}>
            {services.map(s => (
              <motion.div key={s.title} variants={scaleIn}
                style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 14, padding: 28, boxShadow: '0 1px 4px rgba(0,0,0,0.05)', transition: 'all 0.22s', cursor: 'pointer' }}
                whileHover={{ y: -4, boxShadow: '0 12px 32px rgba(0,0,0,0.09)' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 18 }}>
                  <div style={{ width: 52, height: 52, borderRadius: 12, background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem' }}>
                    {s.emoji}
                  </div>
                  <span style={{ fontWeight: 800, fontSize: '1.05rem', color: '#2E3192' }}>{s.price}</span>
                </div>

                <h3 style={{ fontWeight: 800, fontSize: '1rem', color: '#0f172a', marginBottom: 8 }}>{s.title}</h3>
                <p style={{ color: '#64748b', fontSize: '0.875rem', lineHeight: 1.65, marginBottom: 20 }}>{s.desc}</p>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 20 }}>
                  {s.benefits.map(b => (
                    <div key={b} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.8rem', color: '#475569' }}>
                      <FiCheck size={12} color="#2E3192" /> {b}
                    </div>
                  ))}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid #f1f5f9', paddingTop: 16 }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.8rem', color: '#94a3b8' }}>
                    <FiClock size={12} /> {s.duration}
                  </span>
                  <Link to="/book" style={{ display: 'flex', alignItems: 'center', gap: 5, color: '#2E3192', fontWeight: 700, fontSize: '0.85rem' }}>
                    Book Now <FiArrowRight size={13} />
                  </Link>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ background: '#2E3192', padding: '64px 0' }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)', fontWeight: 800, color: '#fff', marginBottom: 10 }}>
              Not sure which treatment is right for you?
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.75)', marginBottom: 28, fontSize: '0.95rem' }}>
              Book a free consultation and our specialists will guide you.
            </p>
            <Link to="/book" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#fff', color: '#2E3192', padding: '12px 28px', borderRadius: 10, fontWeight: 700, fontSize: '0.93rem' }}>
              Get Free Consultation <FiArrowRight size={15} />
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
