import { motion } from 'framer-motion';

export default function WeeklyBarChart({ activities }) {
  // activities is an array of Activity objects
  // We want to count 'complete' actions for each of the last 7 days.
  
  const days = ['Su', 'M', 'T', 'W', 'Th', 'F', 'S'];
  const today = new Date();
  
  // Initialize array for last 7 days mapping
  const chartData = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    d.setHours(0,0,0,0);
    chartData.push({
      dateStr: d.toDateString(),
      dayLabel: days[d.getDay()],
      count: 0
    });
  }

  // Aggregate completion counts
  if (activities && activities.length > 0) {
    activities.forEach(acc => {
      if (acc.action === 'complete') {
        const accDate = new Date(acc.createdAt);
        accDate.setHours(0,0,0,0);
        
        const match = chartData.find(cd => cd.dateStr === accDate.toDateString());
        if (match) {
          match.count += 1;
        }
      } else if (acc.action === 'undo') {
        const accDate = new Date(acc.createdAt);
        accDate.setHours(0,0,0,0);
        
        const match = chartData.find(cd => cd.dateStr === accDate.toDateString());
        if (match) {
          match.count = Math.max(0, match.count - 1);
        }
      }
    });
  }

  const maxCount = Math.max(...chartData.map(d => d.count), 5); // Ensure at least 5 for scale

  return (
    <div className="dashboard-card" style={{ width: '100%', marginBottom: '20px' }}>
      <h2 style={{ fontSize: '1rem', color: '#8fe8ff', marginBottom: '20px', letterSpacing: '1px', textTransform: 'uppercase' }}>7-Day Yield Rate</h2>
      
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', height: '150px', paddingBottom: '20px', borderBottom: '1px solid rgba(74, 226, 255, 0.2)' }}>
        {chartData.map((data, index) => {
          const heightPercent = (data.count / maxCount) * 100;
          return (
            <div key={index} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '30px' }}>
              <div 
                style={{ 
                  color: '#4ae2ff', 
                  fontSize: '0.7rem', 
                  marginBottom: '5px',
                  opacity: data.count > 0 ? 1 : 0 
                }}
              >
                {data.count}
              </div>
              <motion.div 
                initial={{ height: 0 }}
                animate={{ height: `${heightPercent}%` }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                style={{
                  width: '100%',
                  background: data.count > 0 ? 'linear-gradient(180deg, #4ae2ff 0%, rgba(74, 226, 255, 0.2) 100%)' : 'rgba(255,255,255,0.05)',
                  borderRadius: '2px 2px 0 0',
                  minHeight: '4px'
                }}
              />
            </div>
          );
        })}
      </div>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px' }}>
        {chartData.map((data, index) => (
          <div key={index} style={{ width: '30px', textAlign: 'center', color: '#6b9db3', fontSize: '0.8rem' }}>
            {data.dayLabel}
          </div>
        ))}
      </div>
    </div>
  );
}
