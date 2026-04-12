import { useState, useEffect } from 'react';
import { Plus, BarChart3, Moon, Activity as ActivityIcon, Check, X } from 'lucide-react';
import HabitCard from './HabitCard';
import Heatmap from './Heatmap';
import WeeklyBarChart from './WeeklyBarChart';
import SleepChart from './SleepChart';
import SleepPopup from './SleepPopup';
import AddHabitModal from './AddHabitModal';
import { useAuth } from '../../Context/AuthContext';
import { useToast } from '../../Context/ToastContext';
import './Dashboard.css';

import { useNavigate } from 'react-router-dom';
import welcomeChar from '../../Images/Char-img-removebg.png';
import AddTaskModal from './AddTaskModal';

export default function Dashboard() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSleepModalOpen, setIsSleepModalOpen] = useState(false);
  const [habits, setHabits] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [heatmaps, setHeatmaps] = useState({ heatmapHabit: [], heatmapTask: [] });
  const [recentActivities, setRecentActivities] = useState([]);
  const [loadingHeatmap, setLoadingHeatmap] = useState(true);
  
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const { user, setUser } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch Habits
        const hRes = await fetch('http://localhost:5001/api/habits', {credentials: 'include'});
        if (hRes.ok) {
          const hData = await hRes.json();
          setHabits(hData.map(h => ({...h, id: h._id})));
        }

        // Fetch Tasks
        const tRes = await fetch('http://localhost:5001/api/tasks', {credentials: 'include'});
        if (tRes.ok) {
          const tData = await tRes.json();
          // Filter to show top 5 most recent tasks (includes completed so they don't vanish)
          setTasks(tData.slice(0, 5)); 
        }

        // Fetch Heatmaps
        const mapRes = await fetch('http://localhost:5001/api/activity/heatmap', {credentials: 'include'});
        if (mapRes.ok) {
          const mapData = await mapRes.json();
          setHeatmaps(mapData);
        }

        // Fetch Recent Activities
        const recentRes = await fetch('http://localhost:5001/api/activity/recent', {credentials: 'include'});
        if (recentRes.ok) {
          const rData = await recentRes.json();
          setRecentActivities(rData);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingHeatmap(false);
      }
    };

    const checkSleep = async () => {
      try {
        const todayIso = new Date().toISOString().split('T')[0];
        const res = await fetch('http://localhost:5001/api/sleep', {credentials: 'include'});
        if (res.ok) {
          const sleepLogs = await res.json();
          const loggedToday = sleepLogs.some(log => log.dateString === todayIso);
          if (!loggedToday) {
            setIsSleepModalOpen(true);
          }
        }
      } catch (err) {
        console.error(err);
      }
    };

    fetchData();
    checkSleep();
  }, []);

  const handleStatusChange = async (id, newStatus) => {
    // OPTIMISTIC UPDATE
    setHabits(prev => prev.map(h => h.id === id ? { ...h, status: newStatus } : h));

    try {
      const res = await fetch(`http://localhost:5001/api/habits/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
        credentials: 'include'
      });
      if (res.ok) {
        const data = await res.json();
        setHabits(prev => prev.map(h => h.id === id ? { ...h, streak: data.habit.streak } : h));
        if (data.userStats) {
          setUser(prev => ({ ...prev, ...data.userStats }));
        }
        if (newStatus === 'completed') {
          addToast(`Habit achieved! +${data.habit?.xpReward || 50} XP`, 'xp');
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleTaskStatusChange = async (id, newStatus) => {
    // OPTIMISTIC UPDATE
    setTasks(prev => prev.map(t => t._id === id ? { ...t, status: newStatus } : t));
    
    try {
      const res = await fetch(`http://localhost:5001/api/tasks/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
        credentials: 'include'
      });
      const data = await res.json();
      if (res.ok && data.userStats) {
        setUser(prev => ({ ...prev, ...data.userStats }));
        if (newStatus === 'completed') {
           addToast("Quest complete! Level up imminent.", "xp");
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteTask = async (id) => {
    setTasks(prev => prev.filter(t => t._id !== id));
    try {
      await fetch(`http://localhost:5001/api/tasks/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      addToast('Quest Deleted.', 'info');
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddHabit = async (newHabit) => {
    const optimisticHabit = { ...newHabit, id: `temp-${Date.now()}`, _id: `temp-${Date.now()}` };
    setHabits([optimisticHabit, ...habits]);
    
    try {
      const res = await fetch('http://localhost:5001/api/habits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newHabit),
        credentials: 'include'
      });
      if (res.ok) {
        const h = await res.json();
        setHabits(prev => prev.map(item => item.id === optimisticHabit.id ? {...h, id: h._id} : item));
      } else {
        const errorData = await res.json();
        addToast(`System Backup Sync Failed: ${errorData.message || 'Auth issue'}`, 'error');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteHabit = async (id) => {
    setHabits(prev => prev.filter(h => h.id !== id));
    try {
      await fetch(`http://localhost:5001/api/habits/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      addToast('Routine Deleted.', 'info');
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddTaskSubmit = async (newTask) => {
    const optimisticTask = { ...newTask, id: `temp-${Date.now()}`, _id: `temp-${Date.now()}`, createdAt: new Date().toISOString() };
    setTasks([optimisticTask, ...tasks]);
    
    try {
      const res = await fetch('http://localhost:5001/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTask),
        credentials: 'include'
      });
      if (res.ok) {
        const t = await res.json();
        setTasks(prev => prev.map(item => item.id === optimisticTask.id ? {...t, id: t._id} : item));
        addToast('New Quest fully logged.', 'success');
      } else {
        const errorData = await res.json();
        addToast(`System Backup Sync Failed: ${errorData.message || 'Auth issue'}`, 'error');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const saveSleep = async (hours) => {
    try {
      const todayIso = new Date().toISOString().split('T')[0];
      const res = await fetch('http://localhost:5001/api/sleep', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hours, dateString: todayIso }),
        credentials: 'include'
      });
      if (res.ok) {
        addToast(`Sleep logged: ${hours}h. Recovery complete.`, 'info');
        setIsSleepModalOpen(false);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="dashboard-container-v2">
      {/* FULL WIDTH TOP SECTION: Hello Card */}
      <div className="welcome-banner-full">
        <div className="welcome-content">
          <p className="system-tag">SYSTEM_READY // USER_IDENTIFIED</p>
          <h2>Hello, {user?.name || 'Hunter'}!</h2>
          <p>Analyzing current quest trajectory... All systems operational. Prepare for today's objectives.</p>
          <div className="banner-stats">
            <div className="b-stat"><span>LVL</span> {user?.level || 1}</div>
            <div className="b-stat"><span>XP</span> {user?.xp || 0}/1000</div>
            <div className="b-stat" title="Latest Routine Streak"><span>STREAK</span> {habits.length > 0 ? habits[0].streak : 0}</div>
            <div className="b-stat" title="Highest Routine Record" style={{borderColor: '#ffcc00'}}><span>HIGHEST</span> {habits.length > 0 ? Math.max(...habits.map(h => h.streak)) : 0}</div>
          </div>
        </div>
        <div className="welcome-art">
           <img src={welcomeChar} alt="Character" className="floating-char-v2" />
        </div>
      </div>

      {/* MID SECTION: Heatmaps Split */}
      <div className="analytics-row">
        <Heatmap 
          title="Habit Intensity" 
          data={heatmaps.heatmapHabit} 
          loading={loadingHeatmap} 
        />
        <Heatmap 
          title="Daily Quest Intensity" 
          data={heatmaps.heatmapTask} 
          loading={loadingHeatmap} 
        />
      </div>

      <WeeklyBarChart activities={recentActivities} />

      {/* SLEEP CHART SECTION */}
      <SleepChart />

      {/* DAILY QUESTS HUD */}
      <div 
        className="dashboard-card" 
        style={{ width: '100%', marginBottom: '20px', cursor: 'pointer' }}
        onClick={() => navigate('/ToDo')}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ fontSize: '1.2rem', color: '#fff', margin: 0, letterSpacing: '2px' }}>[ DAILY QUESTS ]</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <div style={{ fontSize: '0.7rem', color: '#4ae2ff' }}>{tasks.length} PENDING OBJECTIVES</div>
            <button 
              className="hologram-btn-small" 
              onClick={(e) => { e.stopPropagation(); setIsTaskModalOpen(true); }}
            >
              + NEW QUEST
            </button>
          </div>
        </div>
        
        <div className="habits-list-scroll" style={{maxHeight:'none'}}>
          {tasks.map(task => (
            <div key={task._id} className="habit-card" style={{borderLeft: `4px solid ${task.status === 'completed' ? '#00ffcc' : '#4ae2ff'}`}}>
              <div style={{display:'flex', alignItems:'center', gap:'15px'}}>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{color: task.status === 'completed' ? 'var(--dash-text-gray)' : '#fff', fontWeight:500, textDecoration: task.status === 'completed' ? 'line-through' : 'none'}}>{task.title}</span>
                  {task.description && (
                    <span style={{ fontSize: '0.8rem', color: '#6b9db3', fontStyle: 'italic', marginTop: '2px' }}>
                      {task.description}
                    </span>
                  )}
                </div>
              </div>
              
              <div className="habit-actions">
                <button 
                  className={`status-btn ${task.status === 'completed' ? 'completed' : ''}`}
                  onClick={(e) => { e.stopPropagation(); task.status !== 'completed' && handleTaskStatusChange(task._id, 'completed'); }}
                  title={task.status === 'completed' ? "Quest Complete" : "Mark Completed"}
                  style={{ cursor: task.status === 'completed' ? 'not-allowed' : 'pointer', opacity: task.status === 'completed' ? 0.7 : 1 }}
                >
                  <Check size={20} />
                </button>
                <button 
                  className="status-btn missed"
                  onClick={(e) => { e.stopPropagation(); handleDeleteTask(task._id); }}
                  title="Delete Quest"
                >
                  <X size={20} />
                </button>
              </div>
            </div>
          ))}
          {tasks.length === 0 && (
            <p style={{ color: 'var(--dash-text-gray)', textAlign: 'center', padding: '20px' }}>
              No active quests. Syncing required.
            </p>
          )}
        </div>
      </div>

      {/* HABITS HUD */}
      <div className="dashboard-card" style={{ width: '100%' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ fontSize: '1.2rem', color: '#fff', margin: 0, letterSpacing: '2px' }}>[ HABIT QUESTS ]</h2>
        </div>
        
        <div className="habits-list-scroll" style={{maxHeight:'none'}}>
          {habits.map(habit => (
            <HabitCard 
              key={habit.id} 
              habit={habit} 
              onStatusChange={handleStatusChange}
              onDelete={handleDeleteHabit}
            />
          ))}
          {habits.length === 0 && (
            <p style={{ color: 'var(--dash-text-gray)', textAlign: 'center', padding: '20px' }}>
              No active routines detected.
            </p>
          )}
        </div>
      </div>

      <AddHabitModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onAdd={handleAddHabit}
      />

      <AddTaskModal 
        isOpen={isTaskModalOpen} 
        onClose={() => setIsTaskModalOpen(false)} 
        onAdd={handleAddTaskSubmit}
      />

      <SleepPopup 
        isOpen={isSleepModalOpen} 
        onSave={saveSleep}
      />
    </div>
  );
}
