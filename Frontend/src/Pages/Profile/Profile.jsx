import { useAuth } from '../../Context/AuthContext';
import avatarImg from '../../Images/Char-img2.JPG';
import './Profile.css';

export default function Profile() {
  const { user } = useAuth();
  
  if (!user) return <div style={{color:'white'}}>Loading...</div>;

  const level = user.level || 1;
  const xp = user.xp || 0;
  const xpRequired = level * 1000;
  const xpPercent = Math.min((xp / xpRequired) * 100, 100);

  return (
    <div className="profile-container">
      <div className="profile-header-banner">
        <div className="profile-avatar-wrapper">
          <img src={avatarImg} alt="Avatar" className="profile-avatar-large" />
          <div className="profile-level-badge">{level}</div>
        </div>
        <div className="profile-name-info">
          <h1>{user.name}</h1>
          <p className="profile-rank">{user.rankTitle || 'Novice'}</p>
        </div>
      </div>

      <div className="profile-stats-grid">
        <div className="stats-card">
          <h3>Total XP</h3>
          <p className="stats-value">{xp}</p>
          <div className="xp-bar-container">
            <div className="xp-bar-fill" style={{width: `${xpPercent}%`}}></div>
          </div>
          <span style={{fontSize:'0.8rem', color: 'var(--dash-text-gray)'}}>{Math.floor(xpRequired - xp)} XP to next level</span>
        </div>

        <div className="stats-card">
          <h3>Current Streak</h3>
          <p className="stats-value highlight-fire">{user.currentStreak || 0} Days</p>
        </div>

        <div className="stats-card">
          <h3>Longest Streak</h3>
          <p className="stats-value">{user.longestStreak || 0} Days</p>
        </div>
      </div>
    </div>
  );
}
