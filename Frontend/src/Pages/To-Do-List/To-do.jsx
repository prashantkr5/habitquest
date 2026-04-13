import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Check, Edit2, Save, X, Settings2 } from 'lucide-react';
import { useAuth } from '../../Context/AuthContext';
import { useToast } from '../../Context/ToastContext';
import AddTaskModal from '../Dashboard/AddTaskModal';
import './ToDo.css';

export default function ToDo() {
  const [tasks, setTasks] = useState([]);
  const { setUser } = useAuth();
  const { addToast } = useToast();
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [editingTask, setEditingTask] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const res = await fetch('/api/tasks', {credentials: 'include'});
        if (res.ok) {
          const data = await res.json();
          setTasks(data.map(t => ({...t, id: t._id, xp: t.xpReward})));
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchTasks();
  }, []);



  const handleDetailedTaskSubmit = async (newTask) => {
    if (newTask.id) {
      const optimisticTask = { ...newTask };
      setTasks(tasks.map(t => t.id === newTask.id ? { ...t, ...optimisticTask } : t));
      
      try {
        const res = await fetch(`/api/tasks/${newTask.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newTask),
          credentials: 'include'
        });
        if (res.ok) {
          const t = await res.json();
          setTasks(prev => prev.map(tItem => tItem.id === newTask.id ? {...tItem, ...t, id: t._id, xp: t.xpReward} : tItem));
          addToast('Quest Updated Successfully!', 'success');
        } else {
          const errData = await res.json().catch(() => ({}));
          console.warn(`Silenced Update Failure:`, errData);
        }
      } catch (err) {
        console.error(err);
        addToast('Network Error: Could not connect to System DB', 'error');
        // Revert optimistic update for editing
        setTasks(tasks.map(t => t.id === newTask.id ? tasks.find(original => original.id === newTask.id) : t));
      }
    } else {
      const optimisticTask = { ...newTask, id: `temp-${Date.now()}`, _id: `temp-${Date.now()}`, createdAt: new Date().toISOString() };
      setTasks([optimisticTask, ...tasks]);
      
      try {
        const res = await fetch('/api/tasks', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newTask),
          credentials: 'include'
        });
        if (res.ok) {
          const t = await res.json();
          setTasks(prev => prev.map(tItem => tItem.id === optimisticTask.id ? {...t, id: t._id, xp: t.xpReward} : tItem));
          addToast('Detailed Quest Activated!', 'success');
        } else {
          const errorData = await res.json().catch(() => ({}));
          addToast(`System Backup Sync Failed: ${errorData.message || 'Server Error'}`, 'error');
          // Revert optimistic addition if the server rejected it
          setTasks(prev => prev.filter(t => t.id !== optimisticTask.id));
        }
      } catch (err) {
        console.error(err);
        addToast('Network Error: Quest failed to save to System DB', 'error');
        // Revert optimistic addition
        setTasks(prev => prev.filter(t => t.id !== optimisticTask.id));
      }
    }
    setEditingTask(null);
  };

  const toggleTaskStatus = async (id) => {
    const task = tasks.find(t => t.id === id);
    const newStatus = task.status === 'pending' ? 'completed' : 'pending';
    setTasks(tasks.map(t => t.id === id ? { ...t, status: newStatus } : t));

    try {
      const res = await fetch(`/api/tasks/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
        credentials: 'include'
      });
      const data = await res.json();
      if (res.ok && data.userStats) {
        setUser(prev => ({ ...prev, ...data.userStats }));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const deleteTask = async (id) => {
    setTasks(tasks.filter(t => t.id !== id));
    try {
      await fetch(`/api/tasks/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      });
    } catch (err) {
      console.error(err);
    }
  };

  const startEditing = (task) => {
    setEditingTask(task);
    setIsModalOpen(true);
  };

  // Grouping logic
  const groupTasksByDate = () => {
    const groups = {};
    tasks.forEach(task => {
      const date = new Date(task.createdAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
      if (!groups[date]) groups[date] = [];
      groups[date].push(task);
    });
    return groups;
  };

  const groupedTasks = groupTasksByDate();

  return (
    <div className="todo-container-v2">
      <div className="todo-header-v2" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>

          <h1 style={{ margin: 0 }}>Daily Quests</h1>
        </div>
        <button 
          className="hologram-btn-small" 
          style={{ padding: '15px 30px', fontSize: '1rem', fontWeight: 'bold' }}
          onClick={() => setIsModalOpen(true)}
        >
          <Plus size={20} style={{marginRight: '10px'}} /> QUICK ADD QUEST
        </button>
      </div>

      <div className="quest-scroll-area">
        <AnimatePresence>
          {Object.keys(groupedTasks).map(date => (
            <div key={date} className="date-group">
              <div className="date-group-header">
                <h3>{date}</h3>
                <span className="count-badge">{groupedTasks[date].length} QUESTS</span>
              </div>
              
              <div className="group-tasks">
                {groupedTasks[date].map(task => (
                  <motion.div 
                    key={task.id} 
                    className={`quest-item-v2 ${task.status === 'completed' ? 'completed' : ''}`}
                    layout
                  >
                    <div className="q-left">
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <span className="q-title">{task.title}</span>
                          {task.description && (
                            <span style={{ fontSize: '0.8rem', color: '#6b9db3', fontStyle: 'italic', marginTop: '2px' }}>
                              {task.description}
                            </span>
                          )}
                        </div>
                    </div>

                    <div className="q-right">
                      <span className={`p-badge ${task.priority}`}>{task.priority}</span>
                      <div className="habit-actions" style={{gap: '10px'}}>
                          <>
                            <button 
                              className={`status-btn ${task.status === 'completed' ? 'completed' : ''}`}
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                if (task.status !== 'completed') {
                                  toggleTaskStatus(task.id);
                                }
                              }}
                              title={task.status === 'completed' ? "Quest Complete" : "Mark Completed"}
                              style={{ cursor: task.status === 'completed' ? 'not-allowed' : 'pointer', opacity: task.status === 'completed' ? 0.7 : 1 }}
                            >
                              <Check size={20} />
                            </button>
                            <button onClick={() => startEditing(task)} title="Edit Quest" className="status-btn" style={{color: 'var(--dash-text-gray)', borderColor: 'var(--dash-glass-border)', background: 'transparent'}}><Edit2 size={16} /></button>
                            <button 
                              className="status-btn missed"
                              onClick={() => deleteTask(task.id)}
                              title="Delete Quest"
                            >
                              <X size={20} />
                            </button>
                          </>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          ))}
        </AnimatePresence>

        {tasks.length === 0 && (
          <div className="empty-state-v2">
            <p className="glitch-text">NO ACTIVE OBJECTIVES DETECTED</p>
            <p>Click "Add Quest" to begin your journey, Hunter.</p>
          </div>
        )}
      </div>

      <AddTaskModal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setEditingTask(null); }}
        onAdd={handleDetailedTaskSubmit}
        initialTask={editingTask}
      />
    </div>
  );
}