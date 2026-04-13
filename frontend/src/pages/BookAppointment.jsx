import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { createAppointment, getBookedSlots } from '../services/appointmentService';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { FiArrowRight, FiArrowLeft, FiCheck, FiPhone, FiClock, FiCalendar, FiUser } from 'react-icons/fi';

// ── Doctor Data ─────────────────────────────────────────────────
const DOCTOR = {
  name: 'Dr. Ajay Giri',
  qualification: 'MDS (Master of Dental Surgery)',
  experience: '12+ Years',
  speciality: 'Dental Specialist',
  rating: 5,
  reviews: 200,
  initials: 'AG',
};

// ── Time Slots ──────────────────────────────────────────────────
const ALL_TIMES = [
  '09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
  '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM',
];

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'https://revivedentalbackend.onrender.com';

const STEPS = ['SELECT DOCTOR', 'SELECT DATE', 'TIME & REASON'];

export default function BookAppointment() {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    doctor: '',
    date: '',
    time: '',
    reason: '',
  });
  const [bookedSlots, setBookedSlots] = useState([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const { currentUser, userProfile } = useAuth();
  const navigate = useNavigate();
  const today = new Date().toISOString().split('T')[0];

  // Guard: redirect to login if not authenticated
  useEffect(() => {
    if (!currentUser) {
      toast.error('Please login to book an appointment');
      navigate('/login');
    }
  }, [currentUser, navigate]);

  // Load booked slots when doctor + date are both selected
  useEffect(() => {
    if (form.doctor && form.date && step >= 2) {
      fetchBookedSlots();
    }
  }, [form.doctor, form.date, step]);

  async function fetchBookedSlots() {
    setSlotsLoading(true);
    try {
      const slots = await getBookedSlots(form.doctor, form.date);
      setBookedSlots(slots);
    } catch {
      setBookedSlots([]);
    }
    setSlotsLoading(false);
  }

  async function handleConfirm() {
    if (!currentUser) { toast.error('Please login'); navigate('/login'); return; }
    if (!form.date || !form.time) { toast.error('Please select date and time'); return; }

    setLoading(true);
    try {
      const name  = currentUser.displayName || userProfile?.name || '';
      const email = currentUser.email || '';
      const phone = userProfile?.phone || '';

      await createAppointment({
        userId: currentUser.uid,
        name,
        email,
        phone,
        doctor: form.doctor,
        date:   form.date,
        time:   form.time,
        reason: form.reason,
      });

      // Notify admin via backend email
      try {
        await fetch(`${BACKEND_URL}/api/email/notify-admin`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userName:  name,
            userEmail: email,
            userPhone: phone,
            doctor:    form.doctor,
            date:      form.date,
            time:      form.time,
            reason:    form.reason,
          }),
        });
      } catch { /* don't fail booking if email fails */ }

      toast.success('Appointment booked! We\'ll confirm shortly 🦷');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.message || 'Booking failed. Please try again.');
    }
    setLoading(false);
  }

  const isSlotBooked = (time) => bookedSlots.includes(time);

  const canNext =
    (step === 0 && form.doctor) ||
    (step === 1 && form.date) ||
    (step === 2 && form.date && form.time);

  if (!currentUser) return null;

  return (
    <div style={{ background: '#f8fafc', minHeight: '100vh', paddingTop: 64 }}>
      <div className="container" style={{ maxWidth: 1100, padding: '36px 20px' }}>

        {/* ── Step Header ── */}
        <div style={{
          background: '#fff', borderRadius: 14, border: '1px solid #e2e8f0',
          padding: '20px 28px', marginBottom: 20, boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14, flexWrap: 'wrap', gap: 12 }}>
            <h2 style={{ fontWeight: 800, fontSize: '1.15rem', color: '#0f172a' }}>Schedule Your Visit</h2>
            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#2E3192', background: '#eff6ff', padding: '4px 12px', borderRadius: 50 }}>
              STEP {step + 1} OF {STEPS.length}
            </span>
          </div>
          {/* Progress bar */}
          <div style={{ height: 4, background: '#f1f5f9', borderRadius: 4, marginBottom: 12 }}>
            <motion.div
              animate={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
              transition={{ duration: 0.4 }}
              style={{ height: '100%', background: 'linear-gradient(90deg, #2E3192, #3B3F97)', borderRadius: 4 }}
            />
          </div>
          <div style={{ display: 'flex', gap: 0 }}>
            {STEPS.map((s, i) => (
              <div key={s} style={{ flex: 1, textAlign: i === 0 ? 'left' : i === STEPS.length - 1 ? 'right' : 'center' }}>
                <span style={{ fontSize: '0.72rem', fontWeight: 700, color: i <= step ? '#2E3192' : '#94a3b8', letterSpacing: 0.5 }}>{s}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Main Layout ── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 20, alignItems: 'start' }}>

          {/* ── Form Panel ── */}
          <div style={{
            background: '#fff', borderRadius: 14, border: '1px solid #e2e8f0',
            padding: 28, boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
          }}>
            <AnimatePresence mode="wait">
              <motion.div key={step}
                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.28 }}>

                {/* ── Step 1: Select Doctor ── */}
                {step === 0 && (
                  <>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                      <FiUser size={18} color="#2E3192" />
                      <h3 style={{ fontWeight: 800, fontSize: '1.05rem', color: '#0f172a', margin: 0 }}>Select Your Doctor</h3>
                    </div>
                    <p style={{ color: '#64748b', fontSize: '0.875rem', marginBottom: 24 }}>
                      Our specialist is ready to provide the best dental care for you.
                    </p>

                    <div
                      onClick={() => setForm({ ...form, doctor: DOCTOR.name })}
                      style={{
                        padding: '24px 28px', borderRadius: 14,
                        border: `2.5px solid ${form.doctor === DOCTOR.name ? '#2E3192' : '#e2e8f0'}`,
                        background: form.doctor === DOCTOR.name ? 'linear-gradient(135deg, #ECEDF8, #eff6ff)' : '#fff',
                        cursor: 'pointer', transition: 'all 0.22s',
                        display: 'flex', alignItems: 'center', gap: 24,
                        position: 'relative',
                        boxShadow: form.doctor === DOCTOR.name ? '0 4px 16px rgba(46,49,146,0.15)' : 'none',
                      }}
                    >
                      {/* Avatar */}
                      <div style={{
                        width: 80, height: 80, borderRadius: '50%', flexShrink: 0,
                        background: 'linear-gradient(135deg, #2E3192, #3B3F97)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: '#fff', fontWeight: 800, fontSize: '1.5rem',
                        boxShadow: '0 4px 16px rgba(46,49,146,0.3)',
                        border: '3px solid rgba(255,255,255,0.3)',
                      }}>
                        {DOCTOR.initials}
                      </div>

                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 800, fontSize: '1.1rem', color: '#0f172a', marginBottom: 4 }}>
                          {DOCTOR.name}
                        </div>
                        <div style={{ color: '#2E3192', fontSize: '0.85rem', fontWeight: 600, marginBottom: 6 }}>
                          {DOCTOR.qualification}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
                          {/* Stars */}
                          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                            <div style={{ display: 'flex', gap: 2 }}>
                              {[...Array(5)].map((_, i) => (
                                <span key={i} style={{ color: '#f59e0b', fontSize: '1rem' }}>★</span>
                              ))}
                            </div>
                            <span style={{ color: '#64748b', fontSize: '0.8rem' }}>({DOCTOR.reviews}+ reviews)</span>
                          </div>
                          {/* Experience badge */}
                          <span style={{
                            background: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0',
                            padding: '3px 10px', borderRadius: 50, fontSize: '0.75rem', fontWeight: 700,
                          }}>
                            {DOCTOR.experience} Experience
                          </span>
                        </div>
                      </div>

                      {/* Selected check */}
                      {form.doctor === DOCTOR.name && (
                        <div style={{
                          position: 'absolute', top: 16, right: 16,
                          width: 28, height: 28, borderRadius: '50%',
                          background: '#2E3192', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                          <FiCheck size={15} color="#fff" />
                        </div>
                      )}
                    </div>

                    {/* Info box */}
                    <div style={{
                      marginTop: 20, padding: '14px 18px', borderRadius: 10,
                      background: '#ECEDF8', border: '1px solid #B0B2DA',
                    }}>
                      <p style={{ color: '#3B3F97', fontSize: '0.83rem', fontWeight: 700, marginBottom: 4 }}>🦷 About Dr. Ajay Giri</p>
                      <p style={{ color: '#475569', fontSize: '0.82rem', lineHeight: 1.6, margin: 0 }}>
                        Dr. Ajay Giri is a highly experienced dental specialist at Revive Dental Speciality Clinic with over 12 years of expertise
                        in restorative, cosmetic, and general dentistry. Known for patient-first care and advanced treatment techniques.
                      </p>
                    </div>
                  </>
                )}

                {/* ── Step 2: Select Date ── */}
                {step === 1 && (
                  <>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                      <FiCalendar size={18} color="#2E3192" />
                      <h3 style={{ fontWeight: 800, fontSize: '1.05rem', color: '#0f172a', margin: 0 }}>Select Appointment Date</h3>
                    </div>
                    <p style={{ color: '#64748b', fontSize: '0.875rem', marginBottom: 24 }}>
                      Choose your preferred appointment date. Sundays are available 10 AM–2 PM.
                    </p>

                    <div className="form-group" style={{ maxWidth: 320 }}>
                      <label>Preferred Date <span style={{ color: '#ef4444' }}>*</span></label>
                      <input
                        type="date"
                        className="form-control"
                        min={today}
                        value={form.date}
                        onChange={e => {
                          setForm({ ...form, date: e.target.value, time: '' });
                          setBookedSlots([]);
                        }}
                        style={{ fontSize: '1rem', padding: '12px 16px' }}
                      />
                    </div>

                    {form.date && (
                      <div style={{
                        marginTop: 16, padding: '16px 20px', borderRadius: 12,
                        background: '#f0fdf4', border: '1px solid #bbf7d0',
                        display: 'flex', alignItems: 'center', gap: 10,
                      }}>
                        <FiCalendar size={18} color="#16a34a" />
                        <div>
                          <div style={{ color: '#16a34a', fontWeight: 700, fontSize: '0.9rem' }}>
                            {new Date(form.date + 'T00:00:00').toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                          </div>
                          <div style={{ color: '#64748b', fontSize: '0.78rem' }}>Selected appointment date</div>
                        </div>
                      </div>
                    )}

                    {/* Clinic hours reminder */}
                    <div style={{ marginTop: 20, padding: '14px 18px', borderRadius: 10, background: '#ECEDF8', border: '1px solid #B0B2DA' }}>
                      <p style={{ color: '#3B3F97', fontSize: '0.83rem', fontWeight: 700, marginBottom: 6 }}>🕐 Clinic Hours</p>
                      <p style={{ color: '#475569', fontSize: '0.82rem', margin: '0 0 4px' }}>Mon–Sat: 9:00 AM – 7:00 PM</p>
                      <p style={{ color: '#475569', fontSize: '0.82rem', margin: 0 }}>Sunday: 10:00 AM – 2:00 PM</p>
                    </div>
                  </>
                )}

                {/* ── Step 3: Time & Reason ── */}
                {step === 2 && (
                  <>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                      <FiClock size={18} color="#2E3192" />
                      <h3 style={{ fontWeight: 800, fontSize: '1.05rem', color: '#0f172a', margin: 0 }}>Select Time & Add Details</h3>
                    </div>
                    <p style={{ color: '#64748b', fontSize: '0.875rem', marginBottom: 20 }}>
                      Choose an available time slot. Greyed-out slots are already booked.
                    </p>

                    {/* Time slots */}
                    <div className="form-group">
                      <label>Available Time Slots <span style={{ color: '#ef4444' }}>*</span></label>
                      {slotsLoading ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '16px 0', color: '#64748b', fontSize: '0.85rem' }}>
                          <span className="spinner" style={{ width: 18, height: 18, borderWidth: 2, borderColor: '#e2e8f0', borderTopColor: '#2E3192' }} />
                          Checking available slots...
                        </div>
                      ) : (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 8 }}>
                          {ALL_TIMES.map(t => {
                            const booked = isSlotBooked(t);
                            const selected = form.time === t;
                            return (
                              <button
                                key={t}
                                onClick={() => !booked && setForm({ ...form, time: t })}
                                disabled={booked}
                                style={{
                                  padding: '10px 18px', borderRadius: 10,
                                  border: `2px solid`,
                                  borderColor: booked ? '#e2e8f0' : selected ? '#2E3192' : '#e2e8f0',
                                  background: booked ? '#f8fafc' : selected ? '#2E3192' : '#fff',
                                  color: booked ? '#cbd5e1' : selected ? '#fff' : '#475569',
                                  fontWeight: 600, fontSize: '0.85rem',
                                  cursor: booked ? 'not-allowed' : 'pointer',
                                  transition: 'all 0.18s',
                                  position: 'relative',
                                }}
                              >
                                {t}
                                {booked && (
                                  <span style={{
                                    display: 'block', fontSize: '0.62rem', color: '#ef4444',
                                    fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, marginTop: 2,
                                  }}>
                                    Booked
                                  </span>
                                )}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    {/* Legend */}
                    <div style={{ display: 'flex', gap: 16, marginTop: 8, marginBottom: 20 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <div style={{ width: 14, height: 14, borderRadius: 4, background: '#2E3192' }} />
                        <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Selected</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <div style={{ width: 14, height: 14, borderRadius: 4, background: '#f8fafc', border: '1px solid #e2e8f0' }} />
                        <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Booked</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <div style={{ width: 14, height: 14, borderRadius: 4, background: '#fff', border: '2px solid #e2e8f0' }} />
                        <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Available</span>
                      </div>
                    </div>

                    {/* Reason (optional) */}
                    <div className="form-group">
                      <label>
                        Reason for Visit{' '}
                        <span style={{ color: '#94a3b8', fontWeight: 400, fontSize: '0.8rem' }}>(optional)</span>
                      </label>
                      <textarea
                        className="form-control"
                        rows={3}
                        placeholder="E.g. toothache, routine checkup, teeth cleaning..."
                        value={form.reason}
                        onChange={e => setForm({ ...form, reason: e.target.value })}
                        style={{ resize: 'vertical' }}
                      />
                    </div>
                  </>
                )}
              </motion.div>
            </AnimatePresence>

            {/* ── Navigation Buttons ── */}
            <div style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              marginTop: 28, paddingTop: 20, borderTop: '1px solid #f1f5f9',
            }}>
              <button
                onClick={() => setStep(s => s - 1)}
                disabled={step === 0}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '10px 20px', borderRadius: 8, border: '1.5px solid #e2e8f0',
                  background: '#fff', color: '#475569', fontWeight: 600, fontSize: '0.875rem',
                  cursor: step === 0 ? 'not-allowed' : 'pointer',
                  opacity: step === 0 ? 0.4 : 1, transition: 'all 0.2s',
                }}
              >
                <FiArrowLeft size={15} /> Back
              </button>

              {step < 2 ? (
                <button
                  onClick={() => setStep(s => s + 1)}
                  disabled={!canNext}
                  className="btn-primary"
                  style={{ opacity: canNext ? 1 : 0.5, cursor: canNext ? 'pointer' : 'not-allowed' }}
                >
                  Continue <FiArrowRight size={15} />
                </button>
              ) : (
                <button
                  onClick={handleConfirm}
                  className="btn-primary"
                  disabled={loading || !canNext}
                >
                  {loading ? <span className="spinner" /> : <><FiCheck size={15} /> Confirm Booking</>}
                </button>
              )}
            </div>
          </div>

          {/* ── Right Sidebar ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

            {/* Booking Summary */}
            <div style={{
              background: '#fff', borderRadius: 14, border: '1px solid #e2e8f0',
              padding: '22px 24px', boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
            }}>
              <h4 style={{ fontWeight: 700, fontSize: '0.95rem', color: '#0f172a', marginBottom: 18 }}>Booking Summary</h4>
              {[
                ['Doctor', form.doctor || '—'],
                ['Date', form.date ? new Date(form.date + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'],
                ['Time', form.time || '—'],
                ['Reason', form.reason || 'Not specified'],
              ].map(([label, val]) => (
                <div key={label} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
                  paddingBottom: 12, marginBottom: 12, borderBottom: '1px solid #f1f5f9', gap: 12,
                }}>
                  <span style={{ color: '#64748b', fontSize: '0.82rem', whiteSpace: 'nowrap' }}>{label}</span>
                  <span style={{ fontWeight: 600, fontSize: '0.84rem', color: '#0f172a', textAlign: 'right', maxWidth: 160 }}>{val}</span>
                </div>
              ))}
              {/* Patient */}
              <div style={{ paddingTop: 4 }}>
                <span style={{ color: '#64748b', fontSize: '0.82rem' }}>Patient</span>
                <div style={{ fontWeight: 600, fontSize: '0.84rem', color: '#2E3192', marginTop: 4 }}>
                  {currentUser?.displayName || userProfile?.name || currentUser?.email?.split('@')[0] || '—'}
                </div>
              </div>
            </div>

            {/* What to Expect */}
            <div style={{ background: '#ECEDF8', borderRadius: 12, border: '1px solid #B0B2DA', padding: '16px 18px' }}>
              <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#3B3F97', marginBottom: 10 }}>📋 What to Expect</div>
              <ul style={{ color: '#475569', fontSize: '0.82rem', lineHeight: 1.85, paddingLeft: 18, margin: 0 }}>
                <li>Admin will review and confirm your request</li>
                <li>You'll receive an email when confirmed</li>
                <li>Arrive 10 min early for paperwork</li>
                <li>Bring any previous dental records</li>
              </ul>
            </div>

            {/* Emergency */}
            <div style={{
              background: '#fff5f5', borderRadius: 12, border: '1px solid #fecaca',
              padding: '14px 16px', display: 'flex', alignItems: 'flex-start', gap: 10,
            }}>
              <span style={{ fontSize: '1.1rem', flexShrink: 0, marginTop: 2 }}>🚨</span>
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#dc2626', marginBottom: 4 }}>Dental Emergency?</div>
                <a href="tel:8669062290" style={{ color: '#dc2626', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <FiPhone size={12} /> Call Now: 8669062290
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
