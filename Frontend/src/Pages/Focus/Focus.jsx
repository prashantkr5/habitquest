import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, RotateCcw, SkipForward } from 'lucide-react';
import './Focus.css';

export default function Focus() {
  const PRESETS = {
    25: { work: 25 * 60, break: 5 * 60 },
    55: { work: 55 * 60, break: 10 * 60 },
    85: { work: 85 * 60, break: 15 * 60 }
  };

  const [activePreset, setActivePreset] = useState(25);
  const [timeLeft, setTimeLeft] = useState(PRESETS[25].work);
  const [isActive, setIsActive] = useState(false);
  const [mode, setMode] = useState('work'); // 'work' | 'break'

  const WORK_TIME = PRESETS[activePreset].work;
  const BREAK_TIME = PRESETS[activePreset].break;

  useEffect(() => {
    let interval = null;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => setTimeLeft(timeLeft - 1), 1000);
    } else if (timeLeft === 0) {
      handleCompleteCurrentCycle();
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft]);

  const handleCompleteCurrentCycle = () => {
    setIsActive(false);
    if (mode === 'work') {
      setMode('break');
      setTimeLeft(BREAK_TIME);
      // Give XP bonus logic will go here
    } else {
      setMode('work');
      setTimeLeft(WORK_TIME);
    }
  };

  const handlePresetSelect = (minutes) => {
    setActivePreset(minutes);
    setMode('work');
    setTimeLeft(PRESETS[minutes].work);
    setIsActive(false);
  };

  const toggleTimer = () => setIsActive(!isActive);

  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(mode === 'work' ? WORK_TIME : BREAK_TIME);
  };

  const skipCycle = () => {
    handleCompleteCurrentCycle();
  };

  // Format time (MM:SS)
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Calculate circular progress percentage
  const totalDuration = mode === 'work' ? WORK_TIME : BREAK_TIME;
  const progressPercent = ((totalDuration - timeLeft) / totalDuration) * 100;

  // Dashboard circle circumference
  const radius = 130;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progressPercent / 100) * circumference;

  return (
    <div className="focus-container">
      <div className="focus-header">
        <h1>Focus Area <span className="mode-badge">{mode === 'work' ? '🔥 Work' : '☕ Break'}</span></h1>
        <p>Complete Pomodoro cycles to earn massive XP!</p>
        
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginTop: '20px' }}>
          {[25, 55, 85].map(preset => (
            <button 
              key={preset}
              onClick={() => handlePresetSelect(preset)}
              style={{
                background: activePreset === preset ? 'var(--dash-btn-gradient)' : 'var(--dash-panel-bg)',
                color: 'white',
                border: activePreset === preset ? 'none' : '1px solid var(--dash-glass-border)',
                padding: '8px 16px',
                borderRadius: '20px',
                fontWeight: '600',
                opacity: isActive ? 0.5 : 1,
                cursor: isActive ? 'not-allowed' : 'pointer'
              }}
              disabled={isActive}
            >
              {preset} Min
            </button>
          ))}
        </div>
      </div>

      <div className="timer-wrapper">
        <svg className="progress-ring" width="320" height="320">
          <circle
            className="progress-ring__circle-bg"
            strokeWidth="15"
            fill="transparent"
            r={radius}
            cx="160"
            cy="160"
          />
          <motion.circle
            className="progress-ring__circle-fg"
            strokeWidth="15"
            fill="transparent"
            r={radius}
            cx="160"
            cy="160"
            style={{
              strokeDasharray: circumference,
              strokeDashoffset: strokeDashoffset,
              stroke: mode === 'work' ? 'var(--text-active)' : '#2ed573' // Red/pink for work, green for break
            }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1, ease: "linear" }}
          />
        </svg>

        <div className="timer-text-container">
          <h2 className="timer-text">{formatTime(timeLeft)}</h2>
          <span className="timer-label">{mode === 'work' ? 'Time to hustle' : 'Time to chill'}</span>
        </div>
      </div>

      <div className="timer-controls">
        <button onClick={resetTimer} className="control-btn secondary" title="Reset">
          <RotateCcw size={24} />
        </button>
        <button onClick={toggleTimer} className="control-btn primary">
          {isActive ? <Pause size={32} /> : <Play size={32} style={{ marginLeft: '4px' }} />}
        </button>
        <button onClick={skipCycle} className="control-btn secondary" title="Skip">
          <SkipForward size={24} />
        </button>
      </div>
    </div>
  );
}
