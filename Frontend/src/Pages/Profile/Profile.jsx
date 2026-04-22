import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../Context/AuthContext';
import { useToast } from '../../Context/ToastContext';
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer, Tooltip
} from 'recharts';
import { Camera, Edit2, Check, X, Zap, Shield, Target, Star, Award, Flame } from 'lucide-react';
import './Profile.css';
import Footer from '../../Components/Footer';

// Badge icon mapping
const BADGE_ICONS = {
  'Early Bird': <Zap size={16} color="#ffcc00" />,
  'Warrior':    <Shield size={16} color="#ff3366" />,
  'Centurion':  <Target size={16} color="#4ae2ff" />,
};

// Custom radar tooltip
const RadarTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        background: 'rgba(5, 10, 20, 0.95)',
        border: '1px solid #4ae2ff',
        borderRadius: '4px',
        padding: '8px 14px',
        color: '#fff',
        fontSize: '0.85rem'
      }}>
        <p style={{ margin: 0, color: '#4ae2ff', fontWeight: 'bold' }}>{payload[0].payload.axis}</p>
        <p style={{ margin: 0 }}>{payload[0].value}<span style={{ color: '#6b9db3' }}> / 100</span></p>
      </div>
    );
  }
  return null;
};

export default function Profile() {
  const { user, setUser } = useAuth();
  const { addToast } = useToast();
  const fileInputRef = useRef(null);

  const [stats, setStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(true);
  const [isEditingName, setIsEditingName] = useState(false);
  const [newName, setNewName] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch('/api/auth/stats', { credentials: 'include' });
        if (res.ok) {
          const data = await res.json();
          setStats(data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingStats(false);
      }
    };
    fetchStats();
  }, []);

  if (!user) return (
    <div style={{ color: '#4ae2ff', padding: '40px', textAlign: 'center' }}>
      VERIFYING IDENTITY...
    </div>
  );

  const level = user.level || 1;
  const xp = user.xp || 0;
  const xpRequired = level * 1000;
  const xpPercent = Math.min((xp / xpRequired) * 100, 100);

  // ── Avatar upload handler ────────────────────────────
  const handleAvatarClick = () => fileInputRef.current?.click();

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      addToast('Image too large. Max 2MB allowed.', 'error');
      return;
    }

    setUploadingAvatar(true);
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = reader.result;
      try {
        const res = await fetch('/api/auth/profile', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ avatar: base64 })
        });
        if (res.ok) {
          const updated = await res.json();
          setUser(prev => ({ ...prev, avatar: updated.avatar }));
          addToast('Profile picture updated!', 'success');
        } else {
          addToast('Failed to update avatar.', 'error');
        }
      } catch {
        addToast('Network error.', 'error');
      } finally {
        setUploadingAvatar(false);
      }
    };
    reader.readAsDataURL(file);
  };

  // ── Name edit handler ────────────────────────────────
  const startEditName = () => {
    setNewName(user.name);
    setIsEditingName(true);
  };

  const cancelEditName = () => setIsEditingName(false);

  const saveNewName = async () => {
    if (!newName.trim() || newName.trim() === user.name) {
      setIsEditingName(false);
      return;
    }
    setSavingProfile(true);
    try {
      const res = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ name: newName.trim() })
      });
      if (res.ok) {
        const updated = await res.json();
        setUser(prev => ({ ...prev, name: updated.name }));
        addToast('Username updated!', 'success');
        setIsEditingName(false);
      } else {
        addToast('Could not update username.', 'error');
      }
    } catch {
      addToast('Network error.', 'error');
    } finally {
      setSavingProfile(false);
    }
  };

  const radarData = stats?.radarData || [
    { axis: 'Habits', score: 0 },
    { axis: 'Quests', score: 0 },
    { axis: 'Sleep', score: 0 },
    { axis: 'Journal', score: 0 },
    { axis: 'Activity', score: 0 },
    { axis: 'Streak', score: 0 },
  ];

  const totals = stats?.totals || {};
  const badges = user.badges || [];

  return (
    <div className="profile-container">

      {/* ── HERO BANNER ── */}
      <div className="profile-header-banner">
        {/* Avatar */}
        <div className="profile-avatar-wrapper" onClick={handleAvatarClick} title="Click to change avatar">
          {user.avatar ? (
            <img src={user.avatar} alt="Avatar" className="profile-avatar-large" />
          ) : (
            <div className="profile-avatar-placeholder">
              <span>{(user.name || 'U')[0].toUpperCase()}</span>
            </div>
          )}
          <div className="profile-level-badge">{level}</div>
          <div className={`avatar-overlay ${uploadingAvatar ? 'uploading' : ''}`}>
            {uploadingAvatar ? (
              <div className="upload-spinner" />
            ) : (
              <Camera size={24} color="#fff" />
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={handleAvatarChange}
          />
        </div>

        {/* Name + rank */}
        <div className="profile-name-info">
          <div className="profile-name-row">
            {isEditingName ? (
              <div className="name-edit-group">
                <input
                  className="name-edit-input"
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') saveNewName(); if (e.key === 'Escape') cancelEditName(); }}
                  autoFocus
                  maxLength={30}
                />
                <button className="name-action-btn confirm" onClick={saveNewName} disabled={savingProfile}>
                  <Check size={18} />
                </button>
                <button className="name-action-btn cancel" onClick={cancelEditName}>
                  <X size={18} />
                </button>
              </div>
            ) : (
              <>
                <h1>{user.name}</h1>
                <button className="name-edit-trigger" onClick={startEditName} title="Edit username">
                  <Edit2 size={16} />
                </button>
              </>
            )}
          </div>
          <p className="profile-rank">{user.rankTitle || 'Novice'}</p>
          <p className="profile-email">{user.email}</p>

          {/* Friend code */}
          {user.friendCode && (
            <div className="friend-code-pill">
              ALLY CODE: <strong>{user.friendCode}</strong>
            </div>
          )}

          {/* Badges */}
          {badges.length > 0 && (
            <div className="badges-row">
              {badges.map(badge => (
                <div key={badge} className="badge-chip" title={badge}>
                  {BADGE_ICONS[badge] || <Award size={14} color="#fff" />}
                  <span>{badge}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* XP bar */}
        <div className="profile-xp-section">
          <div className="xp-label-row">
            <span>XP PROGRESS</span>
            <span>{xp} / {xpRequired}</span>
          </div>
          <div className="xp-bar-container">
            <div className="xp-bar-fill" style={{ width: `${xpPercent}%` }} />
          </div>
          <span className="xp-sub">{Math.floor(xpRequired - xp)} XP to Level {level + 1}</span>
        </div>
      </div>

      {/* ── MAIN BODY: Radar + Quick Stats ── */}
      <div className="profile-body-grid">

        {/* Radar Chart Panel */}
        <div className="profile-panel radar-panel">
          <h2 className="panel-heading"><span className="decorator">//</span> SKILL MATRIX</h2>
          <p className="panel-sub">Your overall performance across all dimensions</p>

          {loadingStats ? (
            <div style={{ color: '#4ae2ff', textAlign: 'center', padding: '60px 0' }}>
              Scanning skill matrix...
            </div>
          ) : (
            <div style={{ height: '340px', width: '100%' }}>
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                  <PolarGrid stroke="rgba(74, 226, 255, 0.12)" />
                  <PolarAngleAxis
                    dataKey="axis"
                    tick={{ fill: '#8fe8ff', fontSize: 13, fontWeight: 'bold', letterSpacing: '1px' }}
                  />
                  <Radar
                    name="Score"
                    dataKey="score"
                    stroke="#4ae2ff"
                    fill="rgba(74, 226, 255, 0.15)"
                    strokeWidth={2}
                    dot={{ fill: '#4ae2ff', r: 4 }}
                    activeDot={{ fill: '#fff', stroke: '#4ae2ff', r: 6 }}
                  />
                  <Tooltip content={<RadarTooltip />} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Score pills */}
          {!loadingStats && (
            <div className="score-pills">
              {radarData.map(d => (
                <div key={d.axis} className="score-pill">
                  <span className="pill-axis">{d.axis}</span>
                  <span className="pill-score" style={{
                    color: d.score >= 70 ? '#00ffcc' : d.score >= 40 ? '#ffcc00' : '#ff3366'
                  }}>{d.score}%</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Stats Panel */}
        <div className="quick-stats-col">
          <div className="profile-panel stat-mini-card">
            <div className="stat-mini-icon" style={{ background: 'rgba(74,226,255,0.1)', color: '#4ae2ff' }}>
              <Zap size={22} />
            </div>
            <div>
              <div className="stat-mini-label">Total XP Earned</div>
              <div className="stat-mini-val">{xp.toLocaleString()}</div>
            </div>
          </div>

          <div className="profile-panel stat-mini-card">
            <div className="stat-mini-icon" style={{ background: 'rgba(255,170,74,0.1)', color: '#ffaa4a' }}>
              <Flame size={22} />
            </div>
            <div>
              <div className="stat-mini-label">Current Streak</div>
              <div className="stat-mini-val" style={{ color: '#ffaa4a' }}>{user.currentStreak || 0} Days</div>
            </div>
          </div>

          <div className="profile-panel stat-mini-card">
            <div className="stat-mini-icon" style={{ background: 'rgba(255,51,102,0.1)', color: '#ff3366' }}>
              <Shield size={22} />
            </div>
            <div>
              <div className="stat-mini-label">Longest Streak</div>
              <div className="stat-mini-val">{user.longestStreak || 0} Days</div>
            </div>
          </div>

          <div className="profile-panel stat-mini-card">
            <div className="stat-mini-icon" style={{ background: 'rgba(0,255,204,0.1)', color: '#00ffcc' }}>
              <Check size={22} />
            </div>
            <div>
              <div className="stat-mini-label">Habits Completed</div>
              <div className="stat-mini-val">{totals.completedHabits ?? '—'} / {totals.habits ?? '—'}</div>
            </div>
          </div>

          <div className="profile-panel stat-mini-card">
            <div className="stat-mini-icon" style={{ background: 'rgba(74,226,255,0.08)', color: '#8fe8ff' }}>
              <Target size={22} />
            </div>
            <div>
              <div className="stat-mini-label">Quests Completed</div>
              <div className="stat-mini-val">{totals.completedTasks ?? '—'} / {totals.tasks ?? '—'}</div>
            </div>
          </div>

          <div className="profile-panel stat-mini-card">
            <div className="stat-mini-icon" style={{ background: 'rgba(255,204,0,0.1)', color: '#ffcc00' }}>
              <Star size={22} />
            </div>
            <div>
              <div className="stat-mini-label">Avg Sleep</div>
              <div className="stat-mini-val">{totals.avgSleep ? `${totals.avgSleep}h` : '—'}</div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
