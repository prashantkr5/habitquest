import { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Check, Edit2, X, ChevronDown, ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { useAuth } from '../../Context/AuthContext';
import { useToast } from '../../Context/ToastContext';
import AddTaskModal from '../Dashboard/AddTaskModal';
import './ToDo.css';

/* ─── helpers ─── */
const toDateKey = (date) => {
  const d = new Date(date);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

const todayKey = () => toDateKey(new Date());

const formatDisplayDate = (dateKey) => {
  const [y, m, d] = dateKey.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).toUpperCase();
};

const isToday = (dateKey) => dateKey === todayKey();

/* Week that contains a given dateKey (Mon–Sun, week-of-month style) */
const weekStartOf = (dateKey) => {
  const [y, m, d] = dateKey.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  // Week within the month: day 1-7, 8-14, 15-21, 22-28, 29-end
  const day = date.getDate();
  const weekStart = Math.floor((day - 1) / 7) * 7 + 1;
  return weekStart; // numeric start day of week group
};

export default function ToDo() {
  const [tasks, setTasks] = useState([]);
  const { setUser } = useAuth();
  const { addToast } = useToast();
  const [editingTask, setEditingTask] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Expanded dates (collapsible)
  const [expandedDates, setExpandedDates] = useState(new Set([todayKey()]));

  // Calendar
  const [calendarDate, setCalendarDate] = useState(() => new Date());
  const [showCalendar, setShowCalendar] = useState(false);
  const [jumpedDate, setJumpedDate] = useState(null); // date jumped to via calendar
  const calBtnRef = useRef(null);       // the CALENDAR button
  const calendarRef = useRef(null);     // the floating calendar panel
  const [calPos, setCalPos] = useState({ top: 0, right: 0 }); // fixed position

  // Week navigation — track which "week group" is visible (per-month chunk)
  const today = new Date();
  const [weekPage, setWeekPage] = useState(() => weekStartOf(todayKey()));
  // weekPage is the starting day (1, 8, 15, 22, 29) of the visible week in the current month view
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [viewYear, setViewYear] = useState(today.getFullYear());

  /* ── Fetch tasks ── */
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const res = await fetch('/api/tasks', { credentials: 'include' });
        if (res.ok) {
          const data = await res.json();
          setTasks(data.map(t => ({ ...t, id: t._id, xp: t.xpReward })));
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchTasks();
  }, []);

  /* ── Position calendar below the button (fixed coords) ── */
  useLayoutEffect(() => {
    if (showCalendar && calBtnRef.current) {
      const rect = calBtnRef.current.getBoundingClientRect();
      setCalPos({
        top: rect.bottom + 10,
        right: window.innerWidth - rect.right,
      });
    }
  }, [showCalendar]);

  /* ── Close calendar on outside click ── */
  useEffect(() => {
    const handler = (e) => {
      if (
        calendarRef.current && !calendarRef.current.contains(e.target) &&
        calBtnRef.current && !calBtnRef.current.contains(e.target)
      ) {
        setShowCalendar(false);
      }
    };
    if (showCalendar) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showCalendar]);

  /* ── Task CRUD ── */
  const handleDetailedTaskSubmit = async (newTask) => {
    if (newTask.id) {
      setTasks(tasks.map(t => t.id === newTask.id ? { ...t, ...newTask } : t));
      try {
        const res = await fetch(`/api/tasks/${newTask.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newTask),
          credentials: 'include'
        });
        if (res.ok) {
          const t = await res.json();
          setTasks(prev => prev.map(tItem => tItem.id === newTask.id ? { ...tItem, ...t, id: t._id, xp: t.xpReward } : tItem));
          addToast('Quest Updated Successfully!', 'success');
        }
      } catch (err) {
        console.error(err);
        addToast('Network Error', 'error');
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
          setTasks(prev => prev.map(tItem => tItem.id === optimisticTask.id ? { ...t, id: t._id, xp: t.xpReward } : tItem));
          addToast('Detailed Quest Activated!', 'success');
        } else {
          setTasks(prev => prev.filter(t => t.id !== optimisticTask.id));
        }
      } catch (err) {
        setTasks(prev => prev.filter(t => t.id !== optimisticTask.id));
        addToast('Network Error', 'error');
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
      if (res.ok && data.userStats) setUser(prev => ({ ...prev, ...data.userStats }));
    } catch (err) {
      console.error(err);
    }
  };

  const deleteTask = async (id) => {
    setTasks(tasks.filter(t => t.id !== id));
    try {
      await fetch(`/api/tasks/${id}`, { method: 'DELETE', credentials: 'include' });
    } catch (err) {
      console.error(err);
    }
  };

  const startEditing = (task) => {
    setEditingTask(task);
    setIsModalOpen(true);
  };

  /* ── Group tasks by dateKey ── */
  const tasksByDate = {};
  tasks.forEach(task => {
    const key = toDateKey(task.createdAt);
    if (!tasksByDate[key]) tasksByDate[key] = [];
    tasksByDate[key].push(task);
  });

  /* ── All unique date keys sorted desc ── */
  const allDateKeys = Object.keys(tasksByDate).sort((a, b) => b.localeCompare(a));

  /* ── Filter by current week page (day 1-7, 8-14, etc.) within viewYear/viewMonth ── */
  const weekEnd = weekPage + 6;
  const weekDateKeys = allDateKeys.filter(key => {
    const [y, m, d] = key.split('-').map(Number);
    return y === viewYear && (m - 1) === viewMonth && d >= weekPage && d <= weekEnd;
  });

  // also include jumped date (from calendar) even if outside current week
  const displayDateKeys = jumpedDate
    ? allDateKeys.filter(k => k === jumpedDate)
    : weekDateKeys;

  /* ── Toggle date expand ── */
  const toggleDate = (dateKey) => {
    setExpandedDates(prev => {
      const next = new Set(prev);
      if (next.has(dateKey)) next.delete(dateKey);
      else next.add(dateKey);
      return next;
    });
  };

  /* ── Week navigation ── */
  const prevWeek = () => {
    if (weekPage === 1) {
      // go to previous month
      let m = viewMonth - 1;
      let y = viewYear;
      if (m < 0) { m = 11; y--; }
      const daysInPrevMonth = new Date(y, m + 1, 0).getDate();
      const lastWeekStart = Math.floor((daysInPrevMonth - 1) / 7) * 7 + 1;
      setViewMonth(m);
      setViewYear(y);
      setWeekPage(lastWeekStart);
    } else {
      setWeekPage(p => p - 7);
    }
    setJumpedDate(null);
  };

  const nextWeek = () => {
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    if (weekPage + 7 > daysInMonth) {
      // go to next month
      let m = viewMonth + 1;
      let y = viewYear;
      if (m > 11) { m = 0; y++; }
      setViewMonth(m);
      setViewYear(y);
      setWeekPage(1);
    } else {
      setWeekPage(p => p + 7);
    }
    setJumpedDate(null);
  };

  const goToToday = () => {
    const t = new Date();
    setViewMonth(t.getMonth());
    setViewYear(t.getFullYear());
    setWeekPage(weekStartOf(todayKey()));
    setJumpedDate(null);
    setExpandedDates(new Set([todayKey()]));
  };

  /* ── Calendar logic ── */
  const calYear = calendarDate.getFullYear();
  const calMonth = calendarDate.getMonth();
  const firstDay = new Date(calYear, calMonth, 1).getDay(); // 0=Sun
  const daysInCalMonth = new Date(calYear, calMonth + 1, 0).getDate();

  const calPrevMonth = () => setCalendarDate(d => new Date(d.getFullYear(), d.getMonth() - 1, 1));
  const calNextMonth = () => setCalendarDate(d => new Date(d.getFullYear(), d.getMonth() + 1, 1));

  const handleCalendarDayClick = (day) => {
    const key = `${calYear}-${String(calMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    if (tasksByDate[key]) {
      setJumpedDate(key);
      setExpandedDates(prev => new Set([...prev, key]));
    } else {
      setJumpedDate(key); // show empty
    }
    setShowCalendar(false);
  };

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];
  const dayNames = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

  const monthName = new Date(viewYear, viewMonth, 1).toLocaleString('en-US', { month: 'long' });

  const calendarDayCells = [];
  for (let i = 0; i < firstDay; i++) calendarDayCells.push(null);
  for (let d = 1; d <= daysInCalMonth; d++) calendarDayCells.push(d);

  const hasTaskOnDay = (day) => {
    const key = `${calYear}-${String(calMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return !!tasksByDate[key];
  };

  const isTodayInCal = (day) => {
    const t = new Date();
    return day === t.getDate() && calMonth === t.getMonth() && calYear === t.getFullYear();
  };

  return (
    <div className="todo-container-v2">
      {/* ── Header ── */}
      <div className="todo-header-v2" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>Daily Quests</h1>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          {/* Calendar toggle */}
          <button
            ref={calBtnRef}
            className="hologram-btn-small cal-toggle-btn"
            onClick={() => setShowCalendar(s => !s)}
            title="Open Calendar"
            style={{ padding: '12px 18px', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <Calendar size={18} /> CALENDAR
          </button>

          <button
            className="hologram-btn-small"
            style={{ padding: '12px 24px', fontSize: '0.9rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}
            onClick={() => setIsModalOpen(true)}
          >
            <Plus size={18} /> QUICK ADD QUEST
          </button>
        </div>
      </div>

      {/* ── Week Navigator ── */}
      <div className="week-nav-bar">
        <button className="week-nav-btn" onClick={prevWeek}><ChevronLeft size={18} /></button>
        <div className="week-nav-center">
          <span className="week-label">
            {jumpedDate
              ? `📅 Viewing: ${formatDisplayDate(jumpedDate)}`
              : `${monthName} ${viewYear}  ·  Days ${weekPage}–${Math.min(weekPage + 6, new Date(viewYear, viewMonth + 1, 0).getDate())}`
            }
          </span>
          {(jumpedDate || weekPage !== weekStartOf(todayKey()) || viewMonth !== today.getMonth() || viewYear !== today.getFullYear()) && (
            <button className="today-chip" onClick={goToToday}>Back to Today</button>
          )}
        </div>
        <button className="week-nav-btn" onClick={nextWeek}><ChevronRight size={18} /></button>
      </div>

      {/* ── Quest Scroll Area ── */}
      <div className="quest-scroll-area">
        <AnimatePresence mode="wait">
          {displayDateKeys.length === 0 ? (
            <motion.div
              key="empty"
              className="empty-state-v2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <p className="glitch-text">NO QUESTS IN THIS PERIOD</p>
              <p>{jumpedDate ? 'No quests found for the selected date.' : 'No quests logged for this week. Add one above!'}</p>
            </motion.div>
          ) : (
            displayDateKeys.map(dateKey => {
              const dayTasks = tasksByDate[dateKey] || [];
              const dateIsToday = isToday(dateKey);
              const isOpen = expandedDates.has(dateKey);
              const completed = dayTasks.filter(t => t.status === 'completed').length;

              return (
                <motion.div
                  key={dateKey}
                  className={`date-group ${dateIsToday ? 'today-group' : ''}`}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2 }}
                >
                  {/* Date header — clickable to collapse */}
                  <button
                    className={`date-group-header clickable ${isOpen ? 'open' : ''}`}
                    onClick={() => toggleDate(dateKey)}
                  >
                    <div className="date-header-left">
                      {dateIsToday && <span className="today-pill">TODAY</span>}
                      <h3>{formatDisplayDate(dateKey)}</h3>
                    </div>
                    <div className="date-header-right">
                      <span className="count-badge">{dayTasks.length} QUESTS · {completed} DONE</span>
                      <motion.div
                        animate={{ rotate: isOpen ? 180 : 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <ChevronDown size={16} className="chevron-icon" />
                      </motion.div>
                    </div>
                  </button>

                  {/* Collapsible task list */}
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        className="group-tasks"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25, ease: 'easeInOut' }}
                        style={{ overflow: 'hidden' }}
                      >
                        <div className="group-tasks-inner">
                          {dayTasks.map(task => (
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
                                <span className="xp-badge">+{task.priority === 'Low' ? 5 : task.priority === 'Medium' ? 8 : 10} XP</span>
                                <div className="habit-actions" style={{ gap: '10px' }}>
                                  <button
                                    className={`status-btn ${task.status === 'completed' ? 'completed' : ''}`}
                                    onClick={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      if (task.status !== 'completed') toggleTaskStatus(task.id);
                                    }}
                                    title={task.status === 'completed' ? 'Quest Complete' : 'Mark Completed'}
                                    style={{ cursor: task.status === 'completed' ? 'not-allowed' : 'pointer', opacity: task.status === 'completed' ? 0.7 : 1 }}
                                  >
                                    <Check size={18} />
                                  </button>
                                  <button onClick={() => startEditing(task)} title="Edit Quest" className="status-btn" style={{ color: 'var(--dash-text-gray)', borderColor: 'var(--dash-glass-border)', background: 'transparent' }}>
                                    <Edit2 size={15} />
                                  </button>
                                  <button className="status-btn missed" onClick={() => deleteTask(task.id)} title="Delete Quest">
                                    <X size={18} />
                                  </button>
                                </div>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })
          )}
        </AnimatePresence>
      </div>

      <AddTaskModal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setEditingTask(null); }}
        onAdd={handleDetailedTaskSubmit}
        initialTask={editingTask}
      />

      {/* ── Calendar Portal — renders outside all overflow:hidden parents ── */}
      {createPortal(
        <AnimatePresence>
          {showCalendar && (
            <motion.div
              ref={calendarRef}
              className="mini-calendar"
              style={{ position: 'fixed', top: calPos.top, right: calPos.right }}
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.18 }}
            >
              <div className="mini-cal-header">
                <button className="cal-nav-btn" onClick={calPrevMonth}><ChevronLeft size={16} /></button>
                <span className="cal-month-label">{monthNames[calMonth]} {calYear}</span>
                <button className="cal-nav-btn" onClick={calNextMonth}><ChevronRight size={16} /></button>
              </div>
              <div className="mini-cal-grid">
                {dayNames.map(d => (
                  <div key={d} className="cal-day-name">{d}</div>
                ))}
                {calendarDayCells.map((day, idx) => (
                  <div
                    key={idx}
                    className={`cal-day-cell ${day === null ? 'empty' : ''} ${day && isTodayInCal(day) ? 'today' : ''} ${day && hasTaskOnDay(day) ? 'has-tasks' : ''}`}
                    onClick={() => day && handleCalendarDayClick(day)}
                  >
                    {day}
                    {day && hasTaskOnDay(day) && <span className="task-dot" />}
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
}