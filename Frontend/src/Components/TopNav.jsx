import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../Context/AuthContext';
import { useTheme } from '../Context/ThemeContext';
import { Bell, Settings, Flame, Moon, Sun, LogOut, User as UserIcon, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import avatarImg from '../Images/Char-img2.JPG';
import './Layout.css';
import './Dropdowns.css';

export default function TopNav() {
  const { user, setUser } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const [showSettings, setShowSettings] = useState(false);
  const [showNotifs, setShowNotifs] = useState(false);
  const [notifications, setNotifications] = useState([]);

  // Stats calculate
  const level = user?.level || 1;
  const xp = user?.xp || 0;
  const xpRequired = level * 1000; 
  const xpPercent = Math.min((xp / xpRequired) * 100, 100);
  const streak = user?.currentStreak || 0;
  const rank = user?.rankTitle || 'Novice';

  useEffect(() => {
    if (showNotifs) {
      // Fetch notifs when opening dropdown
      fetch('/api/notifications', { credentials: 'include' })
        .then(res => res.json())
        .then(data => {
            if(Array.isArray(data)) setNotifications(data);
        })
        .catch(console.error);
    }
  }, [showNotifs]);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
    setUser(null);
    navigate('/Login');
  };

  return (
    <div className="topnav">
      <div className="player-info">
        <Link to="/Profile" title="View Profile">
          <img src={avatarImg} alt="Player Avatar" className="player-avatar-img" />
        </Link>
        <div className="player-stats">
          <div className="stat-header">
            <span className="level-badge">LVL {level}</span>
            <span className="rank-title">{rank}</span>
          </div>
          <div className="xp-container">
            <motion.div 
              className="xp-fill"
              initial={{ width: 0 }}
              animate={{ width: `${xpPercent}%` }}
              transition={{ duration: 1.5, ease: "easeOut" }}
            />
          </div>
          <span className="xp-text">{xp} / {xpRequired} XP</span>
        </div>
      </div>

      <div className="top-actions">
        <div className="streak-badge">
          <Flame size={18} fill="white" />
          {streak} 
        </div>
        
        {/* Settings Dropdown */}
        <div style={{position: 'relative'}}>
          <button className="action-btn" onClick={() => {setShowSettings(!showSettings); setShowNotifs(false);}}>
            <Settings size={20} />
          </button>
          <AnimatePresence>
            {showSettings && (
              <motion.div className="dropdown-menu"
                initial={{opacity:0, y:-10}} animate={{opacity:1, y:0}} exit={{opacity:0, y:-10}}
              >
                <button onClick={toggleTheme} className="dropdown-item">
                  {theme === 'dark' ? <Sun size={16}/> : <Moon size={16}/>} 
                  {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
                </button>
                <button onClick={() => navigate('/Profile')} className="dropdown-item">
                  <UserIcon size={16} /> Profile
                </button>
                <button className="dropdown-item">
                  <Info size={16} /> About
                </button>
                <div style={{height: '1px', background: 'var(--dash-glass-border)', margin: '5px 0'}} />
                <button onClick={handleLogout} className="dropdown-item" style={{color: '#ff4757'}}>
                  <LogOut size={16} /> Sign Out
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Notifications Dropdown */}
        <div style={{position: 'relative'}}>
          <button className="action-btn" onClick={() => {setShowNotifs(!showNotifs); setShowSettings(false);}}>
            <Bell size={20} />
          </button>
          <AnimatePresence>
            {showNotifs && (
              <motion.div className="dropdown-menu notif-menu"
                initial={{opacity:0, y:-10}} animate={{opacity:1, y:0}} exit={{opacity:0, y:-10}}
              >
                <h4 style={{padding: '10px 15px', margin: 0, borderBottom: '1px solid var(--dash-glass-border)'}}>Notifications</h4>
                <div className="notif-list" style={{maxHeight:'300px', overflowY:'auto'}}>
                  {notifications.length === 0 ? (
                     <div style={{padding: '20px', textAlign: 'center', color: 'var(--dash-text-gray)'}}>No recent notifications</div>
                  ) : (
                     notifications.map(n => (
                       <div key={n._id} className="notif-item" style={{padding: '12px 15px', borderBottom: '1px solid var(--dash-glass-border)'}}>
                         <strong style={{display: 'block', fontSize: '0.9rem', color: 'var(--dash-text-dark)'}}>{n.title}</strong>
                         <span style={{fontSize: '0.8rem', color: 'var(--dash-text-gray)'}}>{n.message}</span>
                       </div>
                     ))
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </div>
    </div>
  );
}
