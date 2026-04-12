import React, { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const ToastContext = createContext();

export const useToast = () => useContext(ToastContext);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info') => {
    const id = Date.now().toString() + Math.random().toString();
    setToasts((prev) => [...prev, { id, message, type }]);

    // Auto dismiss after 3s
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  }, []);

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <div style={{
        position: 'fixed', bottom: '30px', left: '50%', transform: 'translateX(-50%)',
        display: 'flex', flexDirection: 'column', gap: '10px', zIndex: 9999, pointerEvents: 'none'
      }}>
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 50, scale: 0.3 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
              style={{
                background: t.type === 'xp' ? 'linear-gradient(90deg, #b373f2 0%, #a260e3 100%)' : 'var(--dash-panel-bg)',
                color: 'white',
                padding: '12px 24px',
                borderRadius: '50px',
                boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
                border: '1px solid var(--dash-glass-border)',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                fontSize: '0.95rem'
              }}
            >
              {t.type === 'xp' && <span>⭐</span>}
              {t.message}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};
