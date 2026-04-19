import { useState } from 'react';
import { FiPhone } from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

export default function FloatingContacts() {
  const [hovered, setHovered] = useState(null);

  const whatsappMessage = "Welcome to Revive Dental Speciality Clinic – Book a consultation today!";
  const whatsappUrl = `https://wa.me/918669062290?text=${encodeURIComponent(whatsappMessage)}`;
  const phoneUrl = `tel:8669062290`;

  const buttons = [
    {
      id: 'whatsapp',
      icon: <FaWhatsapp size={26} />,
      url: whatsappUrl,
      bg: 'linear-gradient(135deg, #25D366, #128C7E)',
      shadow: 'rgba(37, 211, 102, 0.4)',
      label: 'WhatsApp',
    },
    {
      id: 'call',
      icon: <FiPhone size={24} />,
      url: phoneUrl,
      bg: 'linear-gradient(135deg, #3B3F97, #2E3192)',
      shadow: 'rgba(46, 49, 146, 0.4)',
      label: 'Call Us',
    }
  ];

  return (
    <div style={{
      position: 'fixed',
      bottom: '30px',
      right: '30px',
      display: 'flex',
      flexDirection: 'column',
      gap: '16px',
      zIndex: 9999,
      alignItems: 'flex-end',
    }}>
      {buttons.map((btn) => (
        <div 
          key={btn.id}
          style={{ display: 'flex', alignItems: 'center', gap: '12px' }}
          onMouseEnter={() => setHovered(btn.id)}
          onMouseLeave={() => setHovered(null)}
        >
          <AnimatePresence>
            {hovered === btn.id && (
              <motion.div
                initial={{ opacity: 0, x: 10, scale: 0.9 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 10, scale: 0.9 }}
                transition={{ duration: 0.2 }}
                style={{
                  background: '#fff',
                  padding: '8px 16px',
                  borderRadius: '20px',
                  boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  color: '#0f172a',
                  border: '1px solid #e2e8f0',
                  pointerEvents: 'none'
                }}
              >
                {btn.label}
              </motion.div>
            )}
          </AnimatePresence>

          <motion.a
            href={btn.url}
            target={btn.id === 'whatsapp' ? '_blank' : '_self'}
            rel="noreferrer"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              background: btn.bg,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              boxShadow: `0 8px 24px ${btn.shadow}`,
              cursor: 'pointer',
              textDecoration: 'none',
              border: '2px solid rgba(255,255,255,0.2)'
            }}
          >
            {btn.icon}
          </motion.a>
        </div>
      ))}
    </div>
  );
}
