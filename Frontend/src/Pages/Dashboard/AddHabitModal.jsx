import { motion, AnimatePresence } from 'framer-motion';
import { X, Hexagon, Zap, Shield, Heart } from 'lucide-react';
import { useState } from 'react';

const ICONS = [
  { name: 'Hexagon', component: <Hexagon size={18} /> },
  { name: 'Zap', component: <Zap size={18} /> },
  { name: 'Shield', component: <Shield size={18} /> },
  { name: 'Heart', component: <Heart size={18} /> }
];

const COLORS = ['#4ae2ff', '#ff3366', '#00ffcc', '#ffcc00', '#b84dff'];
const FREQUENCIES = ['Daily', 'M', 'T', 'W', 'Th', 'F', 'S', 'Su'];

export default function AddHabitModal({ isOpen, onClose, onAdd }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [icon, setIcon] = useState('Hexagon');
  const [color, setColor] = useState('#4ae2ff');
  const [frequency, setFrequency] = useState(['Daily']);

  const toggleFrequency = (freq) => {
    if (freq === 'Daily') {
      setFrequency(['Daily']);
      return;
    }
    const newFreq = frequency.includes('Daily') ? [] : [...frequency];
    if (newFreq.includes(freq)) {
      setFrequency(newFreq.filter(f => f !== freq));
    } else {
      setFrequency([...newFreq, freq]);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    
    // Exact PRD XP mapping
    let xpReward = 20; // Medium
    if (priority === 'Low') xpReward = 10;
    if (priority === 'High') xpReward = 30;

    onAdd({ 
      title, 
      description, 
      priority, 
      streak: 0, 
      xpReward, 
      status: 'pending',
      icon,
      color,
      frequency: frequency.length === 0 ? ['Daily'] : frequency
    });
    
    // Reset state
    setTitle('');
    setDescription('');
    setPriority('Medium');
    setIcon('Hexagon');
    setColor('#4ae2ff');
    setFrequency(['Daily']);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            style={{
              position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
              background: 'rgba(5, 10, 20, 0.85)', backdropFilter: 'blur(8px)', zIndex: 100
            }}
          />

          <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 101, pointerEvents: 'none' }}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              style={{
                position: 'relative', background: 'linear-gradient(180deg, rgba(8, 15, 30, 0.95) 0%, rgba(4, 8, 15, 0.98) 100%)',
                border: `1px solid ${color}`, borderRadius: '2px', padding: '30px', width: '90%', maxWidth: '450px',
                maxHeight: '90vh', overflowY: 'auto', pointerEvents: 'auto',
                boxShadow: `0 0 20px ${color}33`, fontFamily: "'Courier New', Courier, monospace"
              }}
            >
              {/* Decorative corners mapped to color selected */}
              <div style={{ position: 'absolute', top: -1, left: -1, width: '40px', height: '40px', borderTop: `2px solid ${color}`, borderLeft: `2px solid ${color}` }} />
              <div style={{ position: 'absolute', top: -1, right: -1, width: '40px', height: '40px', borderTop: `2px solid ${color}`, borderRight: `2px solid ${color}` }} />
              <div style={{ position: 'absolute', bottom: -1, left: -1, width: '40px', height: '40px', borderBottom: `2px solid ${color}`, borderLeft: `2px solid ${color}` }} />
              <div style={{ position: 'absolute', bottom: -1, right: -1, width: '40px', height: '40px', borderBottom: `2px solid ${color}`, borderRight: `2px solid ${color}` }} />

              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', borderBottom: `1px solid ${color}44`, paddingBottom: '15px' }}>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <p style={{ margin: 0, color, fontSize: '0.7rem', letterSpacing: '4px', textTransform: 'uppercase' }}>System Config</p>
                  <h2 style={{ margin: '5px 0 0 0', color: 'white', letterSpacing: '2px', textShadow: '0 0 10px rgba(255,255,255,0.3)', fontWeight: '500' }}>[ NEW HABIT ]</h2>
                </div>
                <button onClick={onClose} type="button" style={{ background: 'none', border: 'none', color, cursor: 'pointer', opacity: 0.7 }}>
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div>
                  <label style={{ color: '#8fe8ff', fontSize: '0.85rem', marginBottom: '8px', display: 'block', letterSpacing: '1px' }}>HABIT TITLE</label>
                  <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Read 10 Pages"
                    style={{ width: '100%', padding: '14px', borderRadius: '2px', border: '1px solid rgba(74, 226, 255, 0.3)', background: 'rgba(0, 0, 0, 0.4)', color: '#fff', outline: 'none', fontFamily: 'inherit' }}
                    autoFocus
                  />
                </div>

                <div>
                  <label style={{ color: '#8fe8ff', fontSize: '0.85rem', marginBottom: '8px', display: 'block', letterSpacing: '1px' }}>FREQUENCY</label>
                  <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
                    {FREQUENCIES.map(f => (
                      <button key={f} type="button" onClick={() => toggleFrequency(f)}
                        style={{ padding: '8px 12px', background: frequency.includes(f) ? `${color}33` : 'rgba(0,0,0,0.3)', color: frequency.includes(f) ? color : '#6b9db3', border: frequency.includes(f) ? `1px solid ${color}` : '1px solid rgba(74,226,255,0.2)', cursor: 'pointer' }}>
                        {f}
                      </button>
                    ))}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '20px' }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ color: '#8fe8ff', fontSize: '0.85rem', marginBottom: '8px', display: 'block', letterSpacing: '1px' }}>ICON</label>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      {ICONS.map(i => (
                        <button key={i.name} type="button" onClick={() => setIcon(i.name)}
                          style={{ padding: '10px', background: icon === i.name ? `${color}33` : 'none', color: icon === i.name ? color : '#fff', border: `1px solid ${icon === i.name ? color : 'rgba(255,255,255,0.1)'}`, cursor: 'pointer' }}>
                          {i.component}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={{ color: '#8fe8ff', fontSize: '0.85rem', marginBottom: '8px', display: 'block', letterSpacing: '1px' }}>COLOR</label>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      {COLORS.map(c => (
                        <button key={c} type="button" onClick={() => setColor(c)}
                          style={{ width: '30px', height: '30px', borderRadius: '50%', background: c, border: color === c ? '2px solid white' : 'none', cursor: 'pointer' }} />
                      ))}
                    </div>
                  </div>
                </div>

                <div>
                  <label style={{ color: '#8fe8ff', fontSize: '0.85rem', marginBottom: '8px', display: 'block', letterSpacing: '1px' }}>DIFFICULTY (XP REWARD)</label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                    {['Low', 'Medium', 'High'].map(prio => (
                      <button key={prio} type="button" onClick={() => setPriority(prio)}
                        style={{ padding: '12px 10px', background: priority === prio ? `${color}33` : 'rgba(0, 0, 0, 0.3)', color: priority === prio ? color : '#6b9db3', border: priority === prio ? `1px solid ${color}` : '1px solid rgba(74, 226, 255, 0.2)', cursor: 'pointer' }}>
                        {prio}<br/><span style={{fontSize: '0.7rem'}}>{prio==='Low'?'[10 XP]':prio==='Medium'?'[20 XP]':'[30 XP]'}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
                  <button type="submit"
                    style={{ padding: '14px 30px', background: color, color: '#000', border: 'none', fontWeight: 'bold', letterSpacing: '2px', textTransform: 'uppercase', cursor: 'pointer', borderRadius: '2px', boxShadow: `0 0 15px ${color}66` }}>
                    Accept Habit
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
