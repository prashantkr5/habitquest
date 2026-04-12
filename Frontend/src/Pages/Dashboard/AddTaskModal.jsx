import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { useState } from 'react';
import { useEffect } from 'react';

export default function AddTaskModal({ isOpen, onClose, onAdd, initialTask = null }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('Medium');

  useEffect(() => {
    if (isOpen) {
      if (initialTask) {
        setTitle(initialTask.title || '');
        setDescription(initialTask.description || '');
        setPriority(initialTask.priority || 'Medium');
      } else {
        setTitle('');
        setDescription('');
        setPriority('Medium');
      }
    }
  }, [isOpen, initialTask]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    onAdd({ 
      id: initialTask?.id,
      title, 
      description, 
      priority, 
      xpReward: initialTask ? initialTask.xpReward : 10, 
      status: initialTask ? initialTask.status : 'pending' 
    });
    setTitle('');
    setDescription('');
    onClose();
  };


  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop with a deep mechanical blue shadow */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            style={{
              position: 'fixed',
              top: 0, left: 0, right: 0, bottom: 0,
              background: 'rgba(5, 10, 20, 0.85)', // Darker, less purple
              backdropFilter: 'blur(8px)',
              zIndex: 100
            }}
          />

          {/* Modal Content - Solo Leveling Holographic Theme */}
          <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 101, pointerEvents: 'none' }}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              style={{
                position: 'relative',
                background: 'linear-gradient(180deg, rgba(8, 15, 30, 0.95) 0%, rgba(4, 8, 15, 0.98) 100%)',
                border: '1px solid rgba(74, 226, 255, 0.4)',
                borderRadius: '2px', // Sharp corners like a terminal window
                padding: '30px',
                width: '90%',
                maxWidth: '450px',
                maxHeight: '90vh',
                overflowY: 'auto',
                pointerEvents: 'auto',
                boxShadow: '0 0 20px rgba(74, 226, 255, 0.15), inset 0 0 15px rgba(74, 226, 255, 0.05)',
                fontFamily: "'Courier New', Courier, monospace"
              }}
            >
              {/* Header / Top Border decoration */}
              <div style={{ position: 'absolute', top: -1, left: -1, width: '40px', height: '40px', borderTop: '2px solid #4ae2ff', borderLeft: '2px solid #4ae2ff' }} />
              <div style={{ position: 'absolute', top: -1, right: -1, width: '40px', height: '40px', borderTop: '2px solid #4ae2ff', borderRight: '2px solid #4ae2ff' }} />
              <div style={{ position: 'absolute', bottom: -1, left: -1, width: '40px', height: '40px', borderBottom: '2px solid #4ae2ff', borderLeft: '2px solid #4ae2ff' }} />
              <div style={{ position: 'absolute', bottom: -1, right: -1, width: '40px', height: '40px', borderBottom: '2px solid #4ae2ff', borderRight: '2px solid #4ae2ff' }} />


              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', borderBottom: '1px solid rgba(74, 226, 255, 0.2)', paddingBottom: '15px' }}>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <p style={{ margin: 0, color: '#4ae2ff', fontSize: '0.7rem', letterSpacing: '4px', textTransform: 'uppercase' }}>System Window</p>
                  <h2 style={{ margin: '5px 0 0 0', color: 'white', letterSpacing: '2px', textShadow: '0 0 10px rgba(255,255,255,0.3)', fontWeight: '500' }}>
                    {initialTask ? '[ UPDATE QUEST RECORD ]' : '[ NEW QUEST RECORD ]'}
                  </h2>
                </div>
                <button 
                  onClick={onClose}
                  type="button"
                  style={{ background: 'none', border: 'none', color: '#4ae2ff', cursor: 'pointer', opacity: 0.7 }}
                >
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div>
                  <label style={{ color: '#8fe8ff', fontSize: '0.85rem', marginBottom: '8px', display: 'block', letterSpacing: '1px' }}>QUEST TITLE</label>
                  <input 
                    type="text" 
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Daily Check-in"
                    style={{
                      width: '100%',
                      padding: '14px',
                      borderRadius: '2px',
                      border: '1px solid rgba(74, 226, 255, 0.3)',
                      background: 'rgba(0, 0, 0, 0.4)',
                      color: '#fff',
                      outline: 'none',
                      fontFamily: 'inherit',
                      transition: 'border 0.3s ease'
                    }}
                    autoFocus
                  />
                </div>

                <div>
                  <label style={{ color: '#8fe8ff', fontSize: '0.85rem', marginBottom: '8px', display: 'block', letterSpacing: '1px' }}>QUEST DESCRIPTION (OPTIONAL)</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSubmit(e);
                      }
                    }}
                    placeholder="Additional conditions..."
                    style={{
                      width: '100%',
                      padding: '14px',
                      borderRadius: '2px',
                      border: '1px solid rgba(74, 226, 255, 0.3)',
                      background: 'rgba(0, 0, 0, 0.4)',
                      color: '#fff',
                      outline: 'none',
                      resize: 'vertical',
                      minHeight: '80px',
                      fontFamily: 'inherit'
                    }}
                  />
                </div>


                <div>
                  <label style={{ color: '#8fe8ff', fontSize: '0.85rem', marginBottom: '8px', display: 'block', letterSpacing: '1px' }}>DIFFICULTY PRIORITY</label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                    {['Low', 'Medium', 'High'].map(prio => (
                      <button
                        key={prio}
                        type="button"
                        onClick={() => setPriority(prio)}
                        style={{ 
                          padding: '12px 10px',
                          background: priority === prio ? 'rgba(74, 226, 255, 0.15)' : 'rgba(0, 0, 0, 0.3)',
                          color: priority === prio ? '#4ae2ff' : '#6b9db3',
                          border: priority === prio ? '1px solid #4ae2ff' : '1px solid rgba(74, 226, 255, 0.2)',
                          borderRadius: '2px',
                          cursor: 'pointer',
                          fontSize: '0.85rem',
                          letterSpacing: '1px',
                          textTransform: 'uppercase',
                          fontWeight: priority === prio ? 'bold' : 'normal',
                          boxShadow: priority === prio ? 'inset 0 0 10px rgba(74,226,255,0.2)' : 'none',
                          transition: 'all 0.2s ease'
                        }}
                      >
                        {prio}
                      </button>
                    ))}
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
                  <button 
                    type="submit"
                    style={{ 
                      padding: '14px 30px', 
                      background: '#4ae2ff', 
                      color: '#000', 
                      border: 'none', 
                      fontWeight: 'bold', 
                      letterSpacing: '2px',
                      textTransform: 'uppercase',
                      cursor: 'pointer',
                      borderRadius: '2px',
                      boxShadow: '0 0 15px rgba(74, 226, 255, 0.4)'
                    }}
                  >
                    {initialTask ? 'Update Quest' : 'Accept Quest'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
