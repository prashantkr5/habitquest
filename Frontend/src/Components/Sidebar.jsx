import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, CheckSquare, Timer, BookOpen, Hexagon, PenTool, X, Send, Trophy, TreePine } from 'lucide-react';
import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import logoImg from '../Images/Logo-fav.jpeg';
import { useToast } from '../Context/ToastContext';
import './Layout.css';

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [isNoteOpen, setIsNoteOpen] = useState(false);
  const [noteContent, setNoteContent] = useState('');

  const navItems = [
    { path: '/Dashboard', name: 'Dashboard', icon: <LayoutDashboard size={20} /> },
    { path: '/Habits', name: 'Habit Quests', icon: <Hexagon size={20} /> },
    { path: '/ToDo', name: 'Daily Quests', icon: <CheckSquare size={20} /> },
    { path: '/Focus', name: 'Forest', icon: <TreePine size={20} /> },
    { path: '/Leaderboard', name: 'Leaderboard', icon: <Trophy size={20} /> },
    { path: '/Journal', name: 'Journal', icon: <BookOpen size={20} /> }
  ];

  const saveNote = async () => {
    if (!noteContent.trim()) return;
    try {
      const today = new Date();
      const dateString = today.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      const res = await fetch('/api/journal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          title: `Quick Note - ${today.getHours()}:${today.getMinutes()} ${today.getHours()>=12?'PM':'AM'}`, 
          content: noteContent,
          dateString: dateString
        }),
        credentials: 'include'
      });
      if(res.ok) {
        setNoteContent('');
        setIsNoteOpen(false);
        addToast('Quick Note securely logged to Journal.', 'info');
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <>
      <div className="sidebar" style={{ display: 'flex', flexDirection: 'column', height: '100%', paddingBottom: '20px' }}>
        <div>
          <div className="sidebar-logo">
            <img src={logoImg} alt="Logo" style={{width: '32px', height: '32px', borderRadius: '8px', marginRight: '10px'}} />
            HabitQuest
          </div>
          
          <div className="nav-links">
            {navItems.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                className={`nav-item ${location.pathname === item.path.split('#')[0] && (item.name!=='Habit Quests') ? 'active' : ''}`}
              >
                {item.icon}
                <span>{item.name}</span>
              </Link>
            ))}
          </div>
        </div>

        <div style={{ marginTop: 'auto', padding: '0 15px' }}>
          <button 
            className="hologram-btn-small" 
            style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', padding: '12px' }}
            onClick={() => setIsNoteOpen(true)}
          >
            <PenTool size={16} /> QUICK NOTE
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isNoteOpen && (
          <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: 999 }}>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
              onClick={() => setIsNoteOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
              style={{
                position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                background: 'linear-gradient(180deg, rgba(8, 15, 30, 0.95) 0%, rgba(4, 8, 15, 0.98) 100%)',
                border: '1px solid rgba(74, 226, 255, 0.4)', borderRadius: '2px', padding: '25px', width: '90%', maxWidth: '400px',
                boxShadow: '0 0 20px rgba(74, 226, 255, 0.15)', zIndex: 1000
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(74, 226, 255, 0.2)', paddingBottom: '10px', marginBottom: '15px' }}>
                <h3 style={{ margin: 0, color: 'white', letterSpacing: '1px' }}>[ QUICK NOTE LOG ]</h3>
                <X size={20} color="#4ae2ff" style={{ cursor: 'pointer' }} onClick={() => setIsNoteOpen(false)} />
              </div>
              <textarea
                autoFocus
                placeholder="Initialize memory log..."
                value={noteContent}
                onChange={e => setNoteContent(e.target.value)}
                style={{
                  width: '100%', height: '120px', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(74,226,255,0.3)',
                  color: '#fff', padding: '10px', outline: 'none', resize: 'none', marginBottom: '15px'
                }}
              />
              <button 
                className="hologram-btn-small" 
                style={{ width: '100%', display: 'flex', justifyContent: 'center', gap: '8px' }}
                onClick={saveNote}
              >
                <Send size={16} /> SAVE TO JOURNAL
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
