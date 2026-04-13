import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, UserPlus, Flame, Star, Trophy, Target, Shield, Zap } from 'lucide-react';
import { useAuth } from '../../Context/AuthContext';
import { useToast } from '../../Context/ToastContext';
import './Leaderboard.css';

export default function Leaderboard() {
  const [leaderboard, setLeaderboard] = useState([]);
  const [filter, setFilter] = useState('weeklyXp'); // weeklyXp or globalStreak
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [friendCodeInput, setFriendCodeInput] = useState('');
  
  const { user } = useAuth();
  const { addToast } = useToast();

  const fetchLeaderboard = async () => {
    try {
      const res = await fetch('/api/social/leaderboard', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setLeaderboard(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const handleAddFriend = async (e) => {
    e.preventDefault();
    if (!friendCodeInput.trim()) return;
    try {
      const res = await fetch('/api/social/add-friend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ friendCode: friendCodeInput.trim() }),
        credentials: 'include'
      });
      const data = await res.json();
      if (res.ok) {
        addToast(`Successfully connected with ${data.friend.name}!`, 'success');
        setFriendCodeInput('');
        setIsAddUserOpen(false);
        fetchLeaderboard();
      } else {
        addToast(data.message || 'Connection failed.', 'error');
      }
    } catch (err) {
      addToast('System error adding friend.', 'error');
    }
  };

  const sortedBoard = [...leaderboard].sort((a, b) => b[filter] - a[filter]);

  return (
    <div className="leaderboard-container">
      <div className="system-header">
        <p className="system-tag">SOCIAL_NETWORK // NETWORK_RANKING</p>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1 style={{ margin: 0, textTransform: 'uppercase', letterSpacing: '4px' }}>Guild Hall</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div style={{ fontSize: '0.8rem', color: '#8fe8ff', background: 'rgba(74, 226, 255, 0.1)', padding: '8px 12px', borderRadius: '4px', border: '1px solid rgba(74, 226, 255, 0.3)' }}>
              MY CODE: <span style={{ color: '#fff', fontWeight: 'bold', letterSpacing: '2px', marginLeft: '5px' }}>{user?.friendCode || 'NO_CODE'}</span>
            </div>
            <button 
              className="hologram-btn-small" 
              onClick={() => setIsAddUserOpen(true)}
              style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              <UserPlus size={16} /> ADD ALLY
            </button>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '15px', marginBottom: '20px' }}>
        <button 
          onClick={() => setFilter('weeklyXp')}
          style={{
            flex: 1, padding: '15px', background: filter === 'weeklyXp' ? 'rgba(74, 226, 255, 0.15)' : 'rgba(0,0,0,0.4)',
            border: filter === 'weeklyXp' ? '1px solid #4ae2ff' : '1px solid rgba(74, 226, 255, 0.2)',
            color: filter === 'weeklyXp' ? '#fff' : '#6b9db3', borderRadius: '4px', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 'bold',
            boxShadow: filter === 'weeklyXp' ? 'inset 0 0 15px rgba(74, 226, 255, 0.1)' : 'none'
          }}
        >
          <Trophy size={18} color={filter === 'weeklyXp' ? '#4ae2ff' : '#6b9db3'} /> 7-Day XP Ranking
        </button>
        <button 
          onClick={() => setFilter('globalStreak')}
          style={{
            flex: 1, padding: '15px', background: filter === 'globalStreak' ? 'rgba(255, 51, 102, 0.15)' : 'rgba(0,0,0,0.4)',
            border: filter === 'globalStreak' ? '1px solid #ff3366' : '1px solid rgba(74, 226, 255, 0.2)',
            color: filter === 'globalStreak' ? '#fff' : '#6b9db3', borderRadius: '4px', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 'bold',
            boxShadow: filter === 'globalStreak' ? 'inset 0 0 15px rgba(255, 51, 102, 0.1)' : 'none'
          }}
        >
          <Flame size={18} color={filter === 'globalStreak' ? '#ff3366' : '#6b9db3'} /> Global Streak Ranking
        </button>
      </div>

      <div className="leaderboard-list">
        {sortedBoard.map((member, index) => (
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            key={member.id} 
            className={`leaderboard-card ${member.isMe ? 'is-me' : ''}`}
            style={{ 
              display: 'flex', alignItems: 'center', padding: '20px', 
              background: 'rgba(0, 0, 0, 0.4)', border: member.isMe ? '1px solid #4ae2ff' : '1px solid rgba(74, 226, 255, 0.1)',
              borderRadius: '4px', marginBottom: '10px', position: 'relative', overflow: 'hidden'
            }}
          >
            {member.isMe && (
              <div style={{ position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', background: '#4ae2ff' }} />
            )}
            
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: index === 0 ? '#ffcc00' : index === 1 ? '#e2e8f0' : index === 2 ? '#cd7f32' : '#6b9db3', width: '50px', textAlign: 'center' }}>
              #{index + 1}
            </div>

            <div style={{ flex: 1, paddingLeft: '20px' }}>
              <h3 style={{ margin: 0, color: '#fff', fontSize: '1.1rem', letterSpacing: '1px' }}>
                {member.name} {member.isMe && <span style={{ fontSize: '0.7rem', color: '#4ae2ff', marginLeft: '10px' }}>(YOU)</span>}
              </h3>
              <p style={{ margin: '5px 0 0 0', color: '#8fe8ff', fontSize: '0.8rem', letterSpacing: '1px' }}>
                Level {member.level} {member.rankTitle}
              </p>
              
              {/* Badges Display */}
              {member.badges && member.badges.length > 0 && (
                <div style={{ display: 'flex', gap: '5px', marginTop: '10px' }}>
                  {member.badges.map(badge => (
                    <div key={badge} title={badge} style={{ background: 'rgba(74, 226, 255, 0.1)', border: '1px solid rgba(74, 226, 255, 0.3)', borderRadius: '2px', padding: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {badge === 'Early Bird' && <Zap size={14} color="#ffcc00" />}
                      {badge === 'Warrior' && <Shield size={14} color="#ff3366" />}
                      {badge === 'Centurion' && <Target size={14} color="#4ae2ff" />}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', minWidth: '100px' }}>
              {filter === 'weeklyXp' ? (
                <>
                  <div style={{ color: '#4ae2ff', fontSize: '1.2rem', fontWeight: 'bold' }}>{member.weeklyXp}</div>
                  <div style={{ color: '#6b9db3', fontSize: '0.7rem', letterSpacing: '1px' }}>XP YIELD</div>
                </>
              ) : (
                <>
                  <div style={{ color: '#ff3366', fontSize: '1.2rem', fontWeight: 'bold' }}>{member.globalStreak}</div>
                  <div style={{ color: '#6b9db3', fontSize: '0.7rem', letterSpacing: '1px' }}>DAY STREAK</div>
                </>
              )}
            </div>
          </motion.div>
        ))}
        {sortedBoard.length === 0 && (
             <p style={{ color: '#6b9db3', textAlign: 'center', padding: '40px' }}>Network is empty. Recruit allies to engage in cross-system tracking.</p>
        )}
      </div>

      <AnimatePresence>
        {isAddUserOpen && (
          <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 101 }}>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(5px)' }}
              onClick={() => setIsAddUserOpen(false)}
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              style={{ position: 'relative', background: 'linear-gradient(180deg, #0a1128 0%, #050a14 100%)', padding: '30px', border: '1px solid #4ae2ff', borderRadius: '4px', width: '90%', maxWidth: '400px', zIndex: 102 }}
            >
              <h2 style={{ color: '#fff', fontSize: '1.2rem', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '20px', textAlign: 'center' }}>[ ASSIMILATE ALLY ]</h2>
              <form onSubmit={handleAddFriend}>
                <label style={{ display: 'block', color: '#8fe8ff', fontSize: '0.8rem', letterSpacing: '1px', marginBottom: '10px' }}>INPUT FRIEND CODE</label>
                <input 
                  type="text" 
                  value={friendCodeInput} 
                  onChange={(e) => setFriendCodeInput(e.target.value.toUpperCase())}
                  placeholder="e.g. X7K9A2"
                  style={{ width: '100%', padding: '15px', background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(74, 226, 255, 0.3)', color: '#fff', fontSize: '1.2rem', letterSpacing: '5px', textAlign: 'center', outline: 'none', marginBottom: '20px' }}
                  maxLength={6}
                  autoFocus
                />
                <button type="submit" style={{ width: '100%', padding: '15px', background: '#4ae2ff', color: '#000', border: 'none', fontWeight: 'bold', letterSpacing: '2px', cursor: 'pointer', transition: 'all 0.2s' }}>
                  ESTABLISH LINK
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
