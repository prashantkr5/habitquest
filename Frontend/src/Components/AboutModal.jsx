import { motion, AnimatePresence } from 'framer-motion';
import { createPortal } from 'react-dom';
import { X, Zap, Trophy, Users, Target, Flame, Star, Shield, TrendingUp, BookOpen } from 'lucide-react';
import './AboutModal.css';

const features = [
  {
    icon: <Target size={26} />,
    color: '#4ae2ff',
    title: 'Daily Quests',
    desc: 'Break big goals into bite-sized daily tasks. Complete quests, earn XP, and watch your progress stack up day after day.',
  },
  {
    icon: <Flame size={26} />,
    color: '#ff8c42',
    title: 'Habit Streaks',
    desc: 'Build unstoppable routines. Every consecutive day you complete a habit extends your streak and multiplies your XP rewards.',
  },
  {
    icon: <Trophy size={26} />,
    color: '#ffd700',
    title: 'Level Up System',
    desc: 'Earn XP with every completed task. Level up through ranks — from Novice to Elite Hunter — and unlock new milestones.',
  },
  {
    icon: <Users size={26} />,
    color: '#b47fff',
    title: 'Friend Leaderboard',
    desc: 'Compete with friends on the global streak ranking. Nothing beats a little friendly rivalry to keep you accountable.',
  },
  {
    icon: <BookOpen size={26} />,
    color: '#4aff9e',
    title: 'Quest Journal',
    desc: 'Reflect on your journey. Log thoughts, wins, and lessons in your personal journal and track your mental growth.',
  },
  {
    icon: <Shield size={26} />,
    color: '#ff4a6a',
    title: 'Focus Forest',
    desc: 'Enter a distraction-free focus session. Plant trees, block the noise, and do your deepest work with zero interruptions.',
  },
];

const milestones = [
  { level: 1,   rank: 'Novice',        xp: '0 XP',      color: '#8fe8ff' },
  { level: 5,   rank: 'Apprentice',    xp: '5,000 XP',  color: '#4ae2ff' },
  { level: 10,  rank: 'Scout',         xp: '10,000 XP', color: '#4aff9e' },
  { level: 15,  rank: 'Hunter',        xp: '15,000 XP', color: '#a8ff78' },
  { level: 20,  rank: 'Elite Hunter',  xp: '20,000 XP', color: '#ffd700' },
  { level: 30,  rank: 'Shadow Knight', xp: '30,000 XP', color: '#b47fff' },
  { level: 40,  rank: 'Dark Paladin',  xp: '40,000 XP', color: '#ff8c42' },
  { level: 50,  rank: 'Monarch',       xp: '50,000 XP', color: '#ff4a6a' },
  { level: 70,  rank: 'Grandmaster',   xp: '70,000 XP', color: '#ff2d6f' },
  { level: 90,  rank: 'Legend',        xp: '90,000 XP', color: '#ff0055' },
  { level: 100, rank: 'Eternal',       xp: '100,000 XP',color: '#fff' },
];

export default function AboutModal({ isOpen, onClose }) {
  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="about-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Centering wrapper (flex) + Modal */}
          <div className="about-overlay-wrapper" onClick={onClose}>
          <motion.div
            className="about-modal"
            initial={{ opacity: 0, scale: 0.94, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 30 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            onClick={e => e.stopPropagation()}
          >
            {/* Corner accents */}
            <div className="about-corner tl" />
            <div className="about-corner tr" />
            <div className="about-corner bl" />
            <div className="about-corner br" />

            {/* Scrollable content */}
            <div className="about-scroll">
              {/* Close */}
              <button className="about-close" onClick={onClose}>
                <X size={22} />
              </button>

              {/* Hero */}
              <div className="about-hero">
                <div className="about-badge">SYSTEM BRIEFING</div>
                <h1 className="about-title">
                  Welcome to <span className="about-glow">HabitQuest</span>
                </h1>
                <p className="about-subtitle">
                  Your life is the greatest RPG ever made. <br />
                  It's time to start playing it like one.
                </p>
              </div>

              {/* Mission */}
              <div className="about-section">
                <div className="about-section-label"><TrendingUp size={14} /> OUR MISSION</div>
                <p className="about-mission-text">
                  HabitQuest turns the science of habit formation into an addictive, game-like experience.
                  We believe that <strong>discipline is a skill</strong> — and like any skill, it can be levelled up.
                  By combining daily task management, streak tracking, XP rewards, and social competition,
                  we make self-improvement feel less like a chore and more like an adventure you can't put down.
                </p>
              </div>

              {/* Features grid */}
              <div className="about-section">
                <div className="about-section-label"><Zap size={14} /> WHAT YOU CAN DO</div>
                <div className="about-features-grid">
                  {features.map((f, i) => (
                    <motion.div
                      key={i}
                      className="about-feature-card"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.05 * i, duration: 0.3 }}
                      style={{ '--card-color': f.color }}
                    >
                      <div className="about-feature-icon" style={{ color: f.color, background: `${f.color}18` }}>
                        {f.icon}
                      </div>
                      <h3 className="about-feature-title" style={{ color: f.color }}>{f.title}</h3>
                      <p className="about-feature-desc">{f.desc}</p>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Rank milestones */}
              <div className="about-section">
                <div className="about-section-label"><Star size={14} /> YOUR RANK JOURNEY</div>
                <p className="about-rank-intro">Every action earns XP. Every XP pushes you closer to the next rank. How far will you go?</p>
                <div className="about-rank-track">
                  {milestones.map((m, i) => (
                    <div key={i} className="about-rank-step">
                      <div className="about-rank-dot" style={{ background: m.color, boxShadow: `0 0 10px ${m.color}` }} />
                      {i < milestones.length - 1 && <div className="about-rank-line" />}
                      <div className="about-rank-info">
                        <span className="about-rank-level" style={{ color: m.color }}>LVL {m.level}</span>
                        <span className="about-rank-name">{m.rank}</span>
                        <span className="about-rank-xp">{m.xp}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Social CTA */}
              <div className="about-section about-social-cta">
                <div className="about-cta-icon"><Users size={36} /></div>
                <h2 className="about-cta-title">Stronger Together</h2>
                <p className="about-cta-text">
                  Challenge your friends, climb the leaderboard, and hold each other accountable.
                  The best hunters don't go it alone — they build a squad.
                  Invite your friends, compare streaks, and race to the top of the rankings.
                </p>
                <div className="about-cta-stats">
                  <div className="about-stat-pill">🔥 Build daily streaks</div>
                  <div className="about-stat-pill">⚡ Earn XP every action</div>
                  <div className="about-stat-pill">🏆 Climb the leaderboard</div>
                  <div className="about-stat-pill">👥 Beat your friends</div>
                </div>
              </div>

              {/* Footer */}
              <div className="about-footer">
                <span>HabitQuest</span> · Built to make you better · Every. Single. Day.
              </div>
            </div>
          </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
}
