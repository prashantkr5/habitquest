import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserPlus, Flame, Trophy, Target, Shield, Zap, Copy, CheckCheck, RefreshCw } from 'lucide-react';
import { useAuth } from '../../Context/AuthContext';
import { useToast } from '../../Context/ToastContext';
import './Leaderboard.css';

export default function Leaderboard() {
  const [leaderboard, setLeaderboard] = useState([]);
  const [filter, setFilter] = useState('weeklyXp');
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [friendCodeInput, setFriendCodeInput] = useState('');
  const [myCode, setMyCode] = useState(null);
  const [copied, setCopied] = useState(false);
  const [resetting, setResetting] = useState(false);

  const { user } = useAuth();
  const { addToast } = useToast();

  const fetchLeaderboard = async () => {
    try {
      const res = await fetch('/api/social/leaderboard', { credentials: 'include' });
      if (res.ok) setLeaderboard(await res.json());
    } catch (err) { console.error(err); }
  };

  const fetchMyCode = async () => {
    try {
      const res = await fetch('/api/social/my-code', { credentials: 'include' });
      const d = await res.json();
      if (d.friendCode) setMyCode(d.friendCode);
    } catch (err) { console.error(err); }
  };

  useEffect(() => {
    fetchLeaderboard();
    fetchMyCode();
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
        addToast(`🤝 Connected with ${data.friend.name} (${data.friend.rankTitle})!`, 'success');
        setFriendCodeInput('');
        setIsAddUserOpen(false);
        fetchLeaderboard();
      } else {
        addToast(data.message || 'Connection failed.', 'error');
      }
    } catch { addToast('System error.', 'error'); }
  };

  const copyCode = () => {
    if (!myCode) return;
    navigator.clipboard.writeText(myCode).then(() => {
      setCopied(true);
      addToast('Friend code copied! Share it with your ally.', 'success');
      setTimeout(() => setCopied(false), 2500);
    });
  };

  // Generate a fresh unique code (fixes duplicates)
  const resetCode = async () => {
    setResetting(true);
    try {
      const res = await fetch('/api/social/reset-code', { method: 'POST', credentials: 'include' });
      const d = await res.json();
      if (d.friendCode) {
        setMyCode(d.friendCode);
        addToast('New unique code generated!', 'success');
      }
    } catch { addToast('Could not reset code.', 'error'); }
    finally { setResetting(false); }
  };

  const sortedBoard = [...leaderboard]
    .filter(m => filter === 'globalStreak' ? true : m.weeklyXp !== null)
    .sort((a, b) => b[filter] - a[filter]);

  const getRankClass = (i) => i === 0 ? 'rank-1' : i === 1 ? 'rank-2' : i === 2 ? 'rank-3' : 'rank-other';

  return (
    <div className="leaderboard-container">

      {/* ── Header ── */}
      <div className="lb-header">
        <h1 className="lb-title">Guild Hall</h1>
        <div className="lb-header-right">
          {/* My Code */}
          <div className="lb-my-code">
            <span className="lb-my-code-label">MY CODE</span>
            <span className="lb-my-code-value">{myCode || '······'}</span>
            <button className={`lb-copy-btn ${copied ? 'copied' : ''}`} onClick={copyCode} title="Copy to share">
              {copied ? <CheckCheck size={15} /> : <Copy size={15} />}
            </button>
            <button
              className="lb-copy-btn"
              onClick={resetCode}
              title="Get a new code (if yours is duplicated)"
              disabled={resetting}
              style={{ borderLeft: '1px solid rgba(74,226,255,0.15)', opacity: resetting ? 0.5 : 1 }}
            >
              <RefreshCw size={13} style={{ animation: resetting ? 'spin 0.8s linear infinite' : 'none' }} />
            </button>
          </div>

          {/* Add Ally */}
          <button className="lb-add-btn" onClick={() => setIsAddUserOpen(true)}>
            <UserPlus size={15} /> ADD ALLY
          </button>
        </div>
      </div>

      {/* ── Tab switcher ── */}
      <div className="lb-tabs">
        <button
          className={`lb-tab ${filter === 'weeklyXp' ? 'active-xp' : ''}`}
          onClick={() => setFilter('weeklyXp')}
        >
          <Trophy size={17} /> 7-Day XP Ranking
        </button>
        <button
          className={`lb-tab ${filter === 'globalStreak' ? 'active-streak' : ''}`}
          onClick={() => setFilter('globalStreak')}
        >
          <Flame size={17} /> Global Streak Ranking
        </button>
      </div>

      {/* ── Cards ── */}
      <div className="lb-list">
        {sortedBoard.map((member, index) => (
          <motion.div
            key={member.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.06 }}
            className={`lb-card ${getRankClass(index)} ${member.isMe ? 'is-me' : ''}`}
          >
            {/* Rank */}
            <div className={`lb-rank ${getRankClass(index)}`}>
              #{index + 1}
            </div>

            {/* Avatar initial */}
            <div className={`lb-avatar ${member.isMe ? 'is-me-av' : 'other-av'}`}>
              {(member.name || '?')[0].toUpperCase()}
            </div>

            {/* Info */}
            <div className="lb-player-info">
              <div className="lb-player-name-row">
                <span className="lb-player-name">{member.name}</span>
                {member.isMe && <span className="lb-you-tag">YOU</span>}
              </div>
              <div className="lb-player-sub">Level {member.level} · {member.rankTitle}</div>

              {member.badges?.length > 0 && (
                <div className="lb-badges">
                  {member.badges.map(badge => (
                    <div key={badge} className="lb-badge-icon" title={badge}>
                      {badge === 'Early Bird' && <Zap size={12} color="#ffcc00" />}
                      {badge === 'Warrior'    && <Shield size={12} color="#ff3366" />}
                      {badge === 'Centurion'  && <Target size={12} color="#4ae2ff" />}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Score */}
            <div className="lb-score">
              {filter === 'weeklyXp' ? (
                <>
                  <div className="lb-score-value xp-color">{member.weeklyXp}</div>
                  <div className="lb-score-label">XP THIS WEEK</div>
                </>
              ) : (
                <>
                  <div className="lb-score-value streak-color">{member.globalStreak}</div>
                  <div className="lb-score-label">DAY STREAK</div>
                </>
              )}
            </div>
          </motion.div>
        ))}

        {/* Empty state */}
        {sortedBoard.length === 0 && (
          <div className="lb-empty">
            <p>{filter === 'weeklyXp' ? 'No allies yet — invite someone!' : 'No players found.'}</p>
            {filter === 'weeklyXp' && (
              <div className="lb-empty-info">
                <div className="lb-empty-info-title">WHAT IS 7-DAY XP RANKING?</div>
                <p className="lb-empty-info-text">
                  Tracks how much XP you and your friends earned in the <strong>last 7 days</strong>.
                  Share your <strong>MY CODE</strong> → they enter it in ADD ALLY → you both appear here and compete weekly!
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Add Ally modal ── */}
      <AnimatePresence>
        {isAddUserOpen && (
          <motion.div
            className="lb-modal-overlay"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          >
            <motion.div
              className="lb-modal-box"
              initial={{ scale: 0.92, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.92, opacity: 0 }}
              onClick={e => e.stopPropagation()}
            >
              <div className="lb-modal-corner tl" />
              <div className="lb-modal-corner tr" />
              <div className="lb-modal-corner bl" />
              <div className="lb-modal-corner br" />

              <h2 className="lb-modal-title">[ Assimilate Ally ]</h2>
              <form onSubmit={handleAddFriend}>
                <label className="lb-modal-label">Enter Friend Code</label>
                <input
                  type="text"
                  className="lb-modal-input"
                  value={friendCodeInput}
                  onChange={(e) => setFriendCodeInput(e.target.value.toUpperCase())}
                  placeholder="X7K9A2"
                  maxLength={6}
                  autoFocus
                />
                <button type="submit" className="lb-modal-submit">Establish Link</button>
              </form>
              <button
                onClick={() => setIsAddUserOpen(false)}
                style={{ marginTop: '14px', width: '100%', padding: '10px', background: 'transparent', border: '1px solid rgba(74,226,255,0.2)', color: '#4d6e80', cursor: 'pointer', borderRadius: '8px', fontFamily: 'inherit', fontSize: '0.72rem', letterSpacing: '1px' }}
              >
                CANCEL
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
