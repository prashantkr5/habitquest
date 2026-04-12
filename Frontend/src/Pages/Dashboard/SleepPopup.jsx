import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function SleepPopup({ isOpen, onSave }) {
  const [hours, setHours] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const h = parseFloat(hours);
    if (!isNaN(h) && h >= 0 && h <= 24) {
      onSave(h);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed',
              top: 0, left: 0, right: 0, bottom: 0,
              background: 'rgba(2, 5, 11, 0.9)',
              backdropFilter: 'blur(10px)',
              zIndex: 200
            }}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            style={{
              position: 'fixed',
              top: '50%', left: '50%',
              x: '-50%', y: '-50%',
              background: 'linear-gradient(180deg, rgba(8, 15, 30, 0.95) 0%, rgba(4, 8, 15, 0.98) 100%)',
              border: '1px solid #4ae2ff',
              padding: '40px',
              borderRadius: '2px',
              width: '90%',
              maxWidth: '400px',
              zIndex: 201,
              textAlign: 'center',
              boxShadow: '0 0 30px rgba(74, 226, 255, 0.2)'
            }}
          >
            <p style={{ color: '#4ae2ff', fontSize: '0.7rem', letterSpacing: '4px', textTransform: 'uppercase', marginBottom: '10px' }}>System Diagnostics</p>
            <h2 style={{ color: 'white', marginBottom: '20px', letterSpacing: '2px' }}>[ SLEEP LOG REQUIRED ]</h2>
            <p style={{ color: '#6b9db3', marginBottom: '30px', fontSize: '0.9rem' }}>How many hours did you rest in the last 24-hour cycle to sustain your vitality?</p>
            
            <form onSubmit={handleSubmit}>
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginBottom: '30px' }}>
                {[6, 7, 8].map(h => (
                  <button
                    key={h}
                    type="button"
                    onClick={() => setHours(h.toString())}
                    style={{
                      padding: '10px 20px',
                      background: hours === h.toString() ? 'rgba(74, 226, 255, 0.2)' : 'rgba(0,0,0,0.3)',
                      border: hours === h.toString() ? '1px solid #4ae2ff' : '1px solid rgba(74, 226, 255, 0.2)',
                      color: hours === h.toString() ? '#4ae2ff' : '#6b9db3',
                      cursor: 'pointer',
                      borderRadius: '2px'
                    }}
                  >
                    {h}h
                  </button>
                ))}
              </div>
              
              <input 
                type="number"
                step="0.5"
                value={hours}
                onChange={(e) => setHours(e.target.value)}
                placeholder="Custom hours (e.g. 7.5)"
                style={{
                  width: '100%',
                  padding: '12px',
                  background: 'rgba(0,0,0,0.5)',
                  border: '1px solid rgba(74, 226, 255, 0.3)',
                  color: 'white',
                  textAlign: 'center',
                  marginBottom: '20px',
                  outline: 'none',
                  borderRadius: '2px'
                }}
              />

              <button
                type="submit"
                style={{
                  width: '100%',
                  padding: '15px',
                  background: '#4ae2ff',
                  color: '#000',
                  fontWeight: 'bold',
                  border: 'none',
                  cursor: 'pointer',
                  letterSpacing: '2px',
                  textTransform: 'uppercase',
                  borderRadius: '2px',
                  boxShadow: '0 0 15px rgba(74, 226, 255, 0.4)'
                }}
              >
                Log Diagnostics
              </button>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
