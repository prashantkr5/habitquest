import { Activity } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Heatmap({ title, data, loading }) {
  return (
    <div className="dashboard-card" style={{ flex: 1 }}>
      <h3 style={{ fontSize: '0.9rem', color: 'var(--dash-text-gray)', marginBottom: '15px', textTransform: 'uppercase', letterSpacing: '1px' }}>
        <Activity size={16} /> {title}
      </h3>
      <div className="heatmap-grid">
        {loading && <p style={{color:'var(--dash-text-gray)'}}>Initializing system sync...</p>}
        {!loading && data && data.map((day, i) => (
          <motion.div 
            key={day.date || day.id}
            className={`heat-day lvl-${day.level}`}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: i * 0.01, duration: 0.2 }}
            title={`${day.date}: ${day.count} Completed`}
          />
        ))}
      </div>
    </div>
  );
}
