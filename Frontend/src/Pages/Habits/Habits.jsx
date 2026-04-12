import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus } from 'lucide-react';
import { useAuth } from '../../Context/AuthContext';
import { useToast } from '../../Context/ToastContext';
import AddHabitModal from '../Dashboard/AddHabitModal';
import HabitCard from '../Dashboard/HabitCard';
import '../To-Do-List/ToDo.css'; // Re-use the layout styles of ToDo page

export default function Habits() {
  const [habits, setHabits] = useState([]);
  const { user } = useAuth();
  const { addToast } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchHabits = async () => {
      try {
        const res = await fetch('http://localhost:5001/api/habits', {credentials: 'include'});
        if (res.ok) {
          const data = await res.json();
          setHabits(data.map(h => ({...h, id: h._id})));
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchHabits();
  }, []);

  const handleAddHabit = async (newHabit) => {
    // OPTIMISTIC UPDATE: Show instantly on UI
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
        // Silently swap temp ID with real DB ID
        const data = await res.json();
        setHabits(prev => prev.map(h => h.id === optimisticHabit.id ? {...data, id: data._id} : h));
        addToast('Habit Routine Registered.', 'success');
      } else {
        const errorData = await res.json();
        addToast(`System Backup Sync Failed: ${errorData.message || 'Auth issue'}`, 'error');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    const prevHabits = [...habits];
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
        if (newStatus === 'completed') {
           addToast(`Routine Completed! +${data.userStats?.xp - user.xp || 0} XP`, 'success');
        } else if (newStatus === 'pending') {
           addToast(`Routine Reverted.`, 'info');
        }
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

  return (
    <div className="todo-container">
      <div className="todo-header-v2" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--dash-panel-bg)', padding: '30px', border: '1px solid var(--dash-glass-border)', borderRadius: 'var(--dash-border-radius)', boxShadow: '0 0 20px rgba(74, 226, 255, 0.05)' }}>
        <h1 style={{ margin: 0, textTransform: 'uppercase', letterSpacing: '4px', textShadow: '0 0 15px rgba(74, 226, 255, 0.8), 0 0 30px rgba(74, 226, 255, 0.4)', color: '#fff' }}>Habit Quests</h1>
        <button 
          type="button" 
          onClick={() => setIsModalOpen(true)} 
          className="hologram-btn-small"
          style={{ padding: '15px 30px', fontSize: '1rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '10px' }}
        >
          <Plus size={20} /> INITIALIZE ROUTINE
        </button>
      </div>

      <div className="task-list" style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginTop: '30px' }}>
        <AnimatePresence>
          {habits.map((habit) => (
            <motion.div
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              key={habit.id}
              className={`task-row ${habit.status === 'completed' ? 'completed' : ''}`}
              style={{ padding: 0 }}
            >
              <HabitCard 
                habit={habit} 
                onStatusChange={handleStatusChange} 
                onDelete={handleDeleteHabit}
              />
            </motion.div>
          ))}
          {habits.length === 0 && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="empty-state-v2"
            >
              <p className="glitch-text">NO ACTIVE ROUTINES DETECTED</p>
              <p>Click "Initialize Routine" to begin establishing habits.</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AddHabitModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onAdd={handleAddHabit}
      />
    </div>
  );
}
