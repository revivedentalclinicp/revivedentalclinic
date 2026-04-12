import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { createAppointment } from '../services/appointmentService';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { FiArrowRight, FiArrowLeft, FiCheck, FiPhone } from 'react-icons/fi';

const SERVICES = [
  { id: 'general', title: 'General Dentistry', desc: 'Professional cleanings, annual checkups, and standard fillings.', icon: '🛡' },
  { id: 'cosmetic', title: 'Cosmetic Procedures', desc: 'Professional teeth whitening, porcelain veneers, and bonding.', icon: '✦' },
  { id: 'ortho', title: 'Orthodontics', desc: 'Traditional braces and modern clear aligner solutions.', icon: '📋' },
  { id: 'surgery', title: 'Oral Surgery', desc: 'Wisdom teeth extraction and specialized dental implants.', icon: '🔧' },
];

const DENTISTS = [
  { name: 'Dr. Sarah Miller, DDS', speciality: 'General & Cosmetic', rating: 4.9, reviews: 326, initials: 'SM' },
  { name: 'Dr. James Wilson, PhD', speciality: 'Oral Surgeon', rating: 5.0, reviews: 218, initials: 'JW' },
  { name: 'Dr. Priya Sharma', speciality: 'Orthodontist', rating: 4.9, reviews: 180, initials: 'PS' },
];

const TIMES = ['09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM'];



export default function BookAppointment() {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({ service: '', serviceTitle: '', dentist: '', date: '', time: '', notes: '' });
  const [loading, setLoading] = useState(false);
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const today = new Date().toISOString().split('T')[0];

  const STEPS = ['SERVICE', 'DENTIST', 'DATE & TIME'];



  async function handleConfirm() {
    if (!currentUser) { toast.error('Please login to book'); navigate('/login'); return; }
    setLoading(true);
    try {
      await createAppointment({
        userId:    currentUser.uid,
        userName:  currentUser.displayName,
        userEmail: currentUser.email,
        service:   form.serviceTitle,
        dentist:   form.dentist,
        date:      form.date,
        time:      form.time,
        notes:     form.notes,
      });
      toast.success('Appointment booked! 🦷');
      navigate('/dashboard');
    } catch { toast.error('Booking failed. Please try again.'); }
    setLoading(false);
  }

  const canNext = (step === 0 && form.service) || (step === 1 && form.dentist) || (step === 2 && form.date && form.time);

  return (
    <div style={{ background: '#f8fafc', minHeight: '100vh', paddingTop: 64 }}>
      <div className="container" style={{ maxWidth: 1200, padding: '36px 24px' }}>

        {/* Step progress header */}
        <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e2e8f0', padding: '20px 28px', marginBottom: 20, boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14, flexWrap: 'wrap', gap: 12 }}>
            <h2 style={{ fontWeight: 800, fontSize: '1.15rem', color: '#0f172a' }}>Schedule Your Visit</h2>
            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#2E3192', background: '#eff6ff', padding: '4px 12px', borderRadius: 50 }}>
              STEP {step + 1} OF {STEPS.length}
            </span>
          </div>
          {/* Progress bar */}
          <div style={{ height: 4, background: '#f1f5f9', borderRadius: 4, marginBottom: 12, position: 'relative' }}>
            <motion.div animate={{ width: `${((step + 1) / STEPS.length) * 100}%` }} transition={{ duration: 0.4 }}
              style={{ height: '100%', background: '#2E3192', borderRadius: 4 }} />
          </div>
          <div style={{ display: 'flex', gap: 0 }}>
            {STEPS.map((s, i) => (
              <div key={s} style={{ flex: 1, textAlign: i === 0 ? 'left' : i === STEPS.length - 1 ? 'right' : 'center' }}>
                <span style={{ fontSize: '0.72rem', fontWeight: 700, color: i <= step ? '#2E3192' : '#94a3b8', letterSpacing: 0.5 }}>{s}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 20, alignItems: 'start' }}>

          {/* ── Main form panel ── */}
          <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e2e8f0', padding: 28, boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
            <AnimatePresence mode="wait">
              <motion.div key={step}
                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.28 }}>

                {/* Step 0: Service */}
                {step === 0 && (
                  <>
                    <h3 style={{ fontWeight: 800, fontSize: '1.05rem', color: '#0f172a', marginBottom: 6 }}>Step 1: Choose a Service</h3>
                    <p style={{ color: '#64748b', fontSize: '0.875rem', marginBottom: 24 }}>Select the treatment you're looking for to see available specialists.</p>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                      {SERVICES.map(s => (
                        <button key={s.id} onClick={() => setForm({ ...form, service: s.id, serviceTitle: s.title })}
                          style={{
                            padding: '18px 20px', borderRadius: 10, border: `2px solid`,
                            borderColor: form.service === s.id ? '#2E3192' : '#e2e8f0',
                            background: form.service === s.id ? '#eff6ff' : '#fff',
                            textAlign: 'left', cursor: 'pointer', transition: 'all 0.18s', position: 'relative',
                          }}>
                          <div style={{ fontSize: '1.3rem', marginBottom: 10 }}>{s.icon}</div>
                          <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#0f172a', marginBottom: 6 }}>{s.title}</div>
                          <div style={{ color: '#64748b', fontSize: '0.8rem', lineHeight: 1.5 }}>{s.desc}</div>
                          {form.service === s.id && (
                            <div style={{ position: 'absolute', top: 12, right: 12, width: 20, height: 20, borderRadius: '50%', background: '#2E3192', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <FiCheck size={12} color="#fff" />
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  </>
                )}

                {/* Step 1: Dentist */}
                {step === 1 && (
                  <>
                    <h3 style={{ fontWeight: 800, fontSize: '1.05rem', color: '#0f172a', marginBottom: 6 }}>Step 2: Recommended Dentists</h3>
                    <p style={{ color: '#64748b', fontSize: '0.875rem', marginBottom: 24 }}>Based on your selected service, here are our top specialists.</p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                      {DENTISTS.map(d => (
                        <div key={d.name} style={{
                          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                          padding: '16px 20px', borderRadius: 10, border: `2px solid`,
                          borderColor: form.dentist === d.name ? '#2E3192' : '#e2e8f0',
                          background: form.dentist === d.name ? '#eff6ff' : '#fff',
                          cursor: 'pointer', transition: 'all 0.18s',
                        }} onClick={() => setForm({ ...form, dentist: d.name })}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                            <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'linear-gradient(135deg, #2E319220, #2E319240)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, color: '#2E3192', fontSize: '0.9rem', border: '2px solid #2E319220', flexShrink: 0 }}>
                              {d.initials}
                            </div>
                            <div>
                              <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#0f172a' }}>{d.name}</div>
                              <div style={{ color: '#64748b', fontSize: '0.8rem' }}>{d.speciality}</div>
                              <div style={{ color: '#f59e0b', fontSize: '0.75rem', marginTop: 2 }}>
                                {'★'.repeat(Math.round(d.rating))} <span style={{ color: '#94a3b8' }}>({d.reviews} reviews)</span>
                              </div>
                            </div>
                          </div>
                          <button onClick={e => { e.stopPropagation(); setForm({ ...form, dentist: d.name }); }}
                            style={{ padding: '7px 16px', borderRadius: 8, border: `1.5px solid ${form.dentist === d.name ? '#2E3192' : '#e2e8f0'}`, background: form.dentist === d.name ? '#2E3192' : '#fff', color: form.dentist === d.name ? '#fff' : '#2E3192', fontWeight: 600, fontSize: '0.82rem', cursor: 'pointer', transition: 'all 0.2s', flexShrink: 0 }}>
                            Select
                          </button>
                        </div>
                      ))}
                    </div>
                  </>
                )}

                {/* Step 2: Date & Time */}
                {step === 2 && (
                  <>
                    <h3 style={{ fontWeight: 800, fontSize: '1.05rem', color: '#0f172a', marginBottom: 6 }}>Step 3: Date & Time</h3>
                    <p style={{ color: '#64748b', fontSize: '0.875rem', marginBottom: 24 }}>Choose your preferred appointment slot.</p>
                    <div className="form-group">
                      <label>Preferred Date</label>
                      <input type="date" className="form-control" min={today}
                        value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} />
                    </div>
                    <div className="form-group">
                      <label>Available Time Slots</label>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 4 }}>
                        {TIMES.map(t => (
                          <button key={t} onClick={() => setForm({ ...form, time: t })}
                            style={{ padding: '9px 16px', borderRadius: 8, border: `1.5px solid`, borderColor: form.time === t ? '#2E3192' : '#e2e8f0', background: form.time === t ? '#eff6ff' : '#fff', color: form.time === t ? '#2E3192' : '#475569', fontWeight: 600, fontSize: '0.83rem', cursor: 'pointer', transition: 'all 0.15s' }}>
                            {t}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="form-group" style={{ marginTop: 8 }}>
                      <label>Notes <span style={{ color: '#94a3b8', fontWeight: 400 }}>(optional)</span></label>
                      <textarea className="form-control" rows={3} placeholder="Any concerns or special instructions..."
                        value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} style={{ resize: 'vertical' }} />
                    </div>
                  </>
                )}
              </motion.div>
            </AnimatePresence>

            {/* Nav buttons */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 28, paddingTop: 20, borderTop: '1px solid #f1f5f9' }}>
              <button onClick={() => setStep(s => s - 1)} disabled={step === 0}
                style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 18px', borderRadius: 8, border: '1.5px solid #e2e8f0', background: '#fff', color: '#475569', fontWeight: 600, fontSize: '0.875rem', cursor: step === 0 ? 'not-allowed' : 'pointer', opacity: step === 0 ? 0.4 : 1, transition: 'all 0.2s' }}>
                <FiArrowLeft size={15} /> Back
              </button>
              {step < 2 ? (
                <button onClick={() => setStep(s => s + 1)} disabled={!canNext} className="btn-primary"
                  style={{ opacity: canNext ? 1 : 0.5, cursor: canNext ? 'pointer' : 'not-allowed' }}>
                  Continue to {STEPS[step + 1]} <FiArrowRight size={15} />
                </button>
              ) : (
                <button onClick={handleConfirm} className="btn-primary" disabled={loading || !canNext}>
                  {loading ? <span className="spinner" /> : <><FiCheck size={15} /> Confirm Booking</>}
                </button>
              )}
            </div>
          </div>

          {/* ── Right Sidebar ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Booking Summary */}
            <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e2e8f0', padding: 22, boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
              <h4 style={{ fontWeight: 700, fontSize: '0.95rem', color: '#0f172a', marginBottom: 18 }}>Booking Summary</h4>
              {[
                ['Service', form.serviceTitle || '—'],
                ['Dentist', form.dentist || '—'],
                ['Date', form.date || '—'],
                ['Time', form.time || '—'],
              ].map(([label, val]) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', paddingBottom: 14, marginBottom: 14, borderBottom: '1px solid #f1f5f9', gap: 12 }}>
                  <span style={{ color: '#64748b', fontSize: '0.85rem' }}>{label}</span>
                  <span style={{ fontWeight: 600, fontSize: '0.875rem', color: '#0f172a', textAlign: 'right', maxWidth: 160 }}>{val}</span>
                </div>
              ))}
              {form.service === 'general' && (
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 4 }}>
                  <span style={{ color: '#64748b', fontSize: '0.85rem' }}>Est. Cost</span>
                  <span style={{ fontWeight: 700, color: '#2E3192', fontSize: '0.95rem' }}>₹800</span>
                </div>
              )}
            </div>

            {/* Quick Info */}
            <div style={{ background: '#ECEDF8', borderRadius: 12, border: '1px solid #B0B2DA', padding: '16px' }}>
              <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#3B3F97', marginBottom: 8 }}>📋 What to Expect</div>
              <ul style={{ color: '#475569', fontSize: '0.82rem', lineHeight: 1.8, paddingLeft: 16 }}>
                <li>Appointment confirmation within 24 hours</li>
                <li>Bring any previous dental records</li>
                <li>Arrive 10 min early for paperwork</li>
                <li>Bring valid ID and insurance card</li>
              </ul>
            </div>

            {/* Emergency */}
            <div style={{ background: '#fff5f5', borderRadius: 12, border: '1px solid #fecaca', padding: '14px 16px', display: 'flex', alignItems: 'flex-start', gap: 10 }}>
              <span style={{ fontSize: '1.1rem', flexShrink: 0, marginTop: 2 }}>🚨</span>
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#dc2626', marginBottom: 3 }}>Dental Emergency?</div>
                <a href="tel:8669062290" style={{ color: '#dc2626', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <FiPhone size={12} /> Call 24/7: 8669062290
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
