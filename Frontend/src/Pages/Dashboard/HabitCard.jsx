import { Check, X, Hexagon, Zap, Shield, Heart } from 'lucide-react';
import { motion } from 'framer-motion';

const IconMap = {
  Hexagon: <Hexagon size={24} />,
  Zap: <Zap size={24} />,
  Shield: <Shield size={24} />,
  Heart: <Heart size={24} />
};

export default function HabitCard({ habit, onStatusChange, onDelete }) {
  return (
    <motion.div 
      className="habit-card"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      style={{ borderLeft: `4px solid ${habit.color || '#4ae2ff'}`, boxShadow: `0 4px 10px ${habit.color ? habit.color+'22' : 'rgba(0,0,0,0.2)'}` }}
    >
      <div className="habit-info">
        <div className="habit-icon" style={{ background: `${habit.color || '#4ae2ff'}22`, color: habit.color || '#4ae2ff' }}>
          {IconMap[habit.icon] || IconMap['Hexagon']}
        </div>
        <div className="habit-details">
          <h3>{habit.title}</h3>
          {habit.description && (
             <p style={{ fontSize: '0.8rem', color: 'var(--dash-text-gray)', marginTop: '4px', marginBottom: '4px', fontStyle: 'italic' }}>
               {habit.description}
             </p>
          )}
          <p>{habit.streak} Day Streak • +{habit.xpReward} XP</p>
        </div>
      </div>
      
      <div className="habit-actions">
        <button 
          className={`status-btn ${habit.status === 'completed' ? 'completed' : ''}`}
          onClick={(e) => { 
            e.preventDefault(); 
            e.stopPropagation(); 
            if (habit.status !== 'completed') {
              onStatusChange(habit.id, 'completed');
            }
          }}
          title={habit.status === 'completed' ? "Routine Complete" : "Mark Completed"}
          style={{ cursor: habit.status === 'completed' ? 'not-allowed' : 'pointer', opacity: habit.status === 'completed' ? 0.7 : 1 }}
        >
          <Check size={20} />
        </button>
        <button 
          className="status-btn missed"
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); onDelete && onDelete(habit.id); }}
          title="Delete Routine"
        >
          <X size={20} />
        </button>
      </div>
    </motion.div>
  );
}
