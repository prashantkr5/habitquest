import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

export default function SleepChart() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSleep = async () => {
      try {
        const res = await fetch('/api/sleep', { credentials: 'include' });
        if (res.ok) {
          const json = await res.json();
          const chartData = json.map(item => ({
            day: new Date(item.dateString).toLocaleDateString('en-US', { weekday: 'short' }),
            hours: item.hours
          }));
          setData(chartData);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchSleep();
  }, []);

  if (loading) return <div style={{ color: '#4ae2ff', padding: '20px' }}>Loading System Diagnostics...</div>;

  return (
    <div className="dashboard-card" style={{ width: '100%', marginBottom: '20px', padding: '20px' }}>
      <h2 className="dashboard-section-heading">
        <span className="decorator">//</span> REST & RECOVERY
      </h2>
      
      {data.length === 0 ? (
        <div style={{ color: '#6b9db3', textAlign: 'center', padding: '40px 0' }}>No sleep data found. Resting is vital for leveling up.</div>
      ) : (
        <div style={{ height: '200px', width: '100%' }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(74, 226, 255, 0.1)" vertical={false} />
              <XAxis dataKey="day" stroke="#6b9db3" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#6b9db3" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip 
                contentStyle={{ background: '#050a14', border: '1px solid #4ae2ff', borderRadius: '2px', color: '#4ae2ff' }}
                itemStyle={{ color: '#fff' }}
              />
              <Line 
                type="monotone" 
                dataKey="hours" 
                stroke="#4ae2ff" 
                strokeWidth={3}
                dot={{ fill: '#050a14', stroke: '#4ae2ff', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, fill: '#fff', stroke: '#4ae2ff' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
