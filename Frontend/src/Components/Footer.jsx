import { useState } from 'react';
import { Flame, Target, Shield, BookOpen, Users, Zap, Link, Share2, Globe } from 'lucide-react';
import AboutModal from './AboutModal';
import './Footer.css';

const navLinks = [
  { label: 'Dashboard',    href: '/Dashboard' },
  { label: 'Habit Quests', href: '/Habits' },
  { label: 'Daily Quests', href: '/ToDo' },
  { label: 'Forest',       href: '/Forest' },
  { label: 'Leaderboard',  href: '/Leaderboard' },
  { label: 'Journal',      href: '/Journal' },
  { label: 'Profile',      href: '/Profile' },
];

const features = [
  { icon: <Target size={14} />,    label: 'Daily Task Quests' },
  { icon: <Flame size={14} />,     label: 'Habit Streak Tracking' },
  { icon: <Zap size={14} />,       label: 'XP & Level System' },
  { icon: <Users size={14} />,     label: 'Social Leaderboard' },
  { icon: <BookOpen size={14} />,  label: 'Quest Journal' },
  { icon: <Shield size={14} />,    label: 'Focus Forest Mode' },
];

export default function Footer() {
  const [showAbout, setShowAbout] = useState(false);
  const year = new Date().getFullYear();

  return (
    <>
      <footer className="hq-footer">
        {/* Top scan line */}
        <div className="footer-scan-line" />

        <div className="footer-inner">
          {/* ── Brand column ── */}
          <div className="footer-col footer-brand-col">
            <div className="footer-logo">
              <Flame size={20} fill="#ff8c42" color="#ff8c42" />
              <span>HabitQuest</span>
            </div>
            <p className="footer-tagline">
              Your life is the greatest RPG ever made.<br />
              Start playing it like one.
            </p>
            <div className="footer-socials">
              <a href="#" className="footer-social-btn" title="Website"><Globe size={16} /></a>
              <a href="#" className="footer-social-btn" title="Share"><Share2 size={16} /></a>
              <a href="#" className="footer-social-btn" title="Link"><Link size={16} /></a>
            </div>
          </div>

          {/* ── Navigate column ── */}
          <div className="footer-col">
            <h4 className="footer-col-title">Navigate</h4>
            <ul className="footer-link-list">
              {navLinks.map(link => (
                <li key={link.href}>
                  <a href={link.href} className="footer-link">{link.label}</a>
                </li>
              ))}
            </ul>
          </div>

          {/* ── Features column ── */}
          <div className="footer-col">
            <h4 className="footer-col-title">Features</h4>
            <ul className="footer-link-list">
              {features.map((f, i) => (
                <li key={i} className="footer-feature-item">
                  <span className="footer-feature-icon">{f.icon}</span>
                  {f.label}
                </li>
              ))}
            </ul>
          </div>

          {/* ── About / mission column ── */}
          <div className="footer-col">
            <h4 className="footer-col-title">The Mission</h4>
            <p className="footer-mission-text">
              HabitQuest turns the science of self-improvement into an addictive,
              game-like experience. Build streaks, level up, beat your friends —
              and become the best version of yourself.
            </p>
            <button className="footer-about-btn" onClick={() => setShowAbout(true)}>
              Learn More →
            </button>
          </div>
        </div>

        {/* ── Bottom bar ── */}
        <div className="footer-bottom">
          <span className="footer-copy">
            © {year} HabitQuest · All rights reserved
          </span>
          <span className="footer-made">
            Made by the HabitQuest team
          </span>
          <div className="footer-bottom-links">
            <button className="footer-about-btn footer-about-btn--sm" onClick={() => setShowAbout(true)}>About</button>
          </div>
        </div>
      </footer>

      <AboutModal isOpen={showAbout} onClose={() => setShowAbout(false)} />
    </>
  );
}
