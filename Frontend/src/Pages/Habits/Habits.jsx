import { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, ChevronDown, ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { useAuth } from '../../Context/AuthContext';
import { useToast } from '../../Context/ToastContext';
import AddHabitModal from '../Dashboard/AddHabitModal';
import HabitCard from '../Dashboard/HabitCard';
import '../To-Do-List/ToDo.css';

/* ─── helpers (same as ToDo) ─── */
const toDateKey = (date) => {
  const d = new Date(date);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

const todayKey = () => toDateKey(new Date());

const formatDisplayDate = (dateKey) => {
  const [y, m, d] = dateKey.split('-').map(Number);
  return new Date(y, m - 1, d)
    .toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    .toUpperCase();
};

const isToday = (dateKey) => dateKey === todayKey();

const weekStartOf = (dateKey) => {
  const [, , d] = dateKey.split('-').map(Number);
  return Math.floor((d - 1) / 7) * 7 + 1;
};

export default function Habits() {
  const [habits, setHabits] = useState([]);
  const { user } = useAuth();
  const { addToast } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Collapsible date groups
  const [expandedDates, setExpandedDates] = useState(new Set([todayKey()]));

  // Calendar
  const [calendarDate, setCalendarDate] = useState(() => new Date());
  const [showCalendar, setShowCalendar] = useState(false);
  const [jumpedDate, setJumpedDate] = useState(null);
  const calBtnRef = useRef(null);
  const calendarRef = useRef(null);
  const [calPos, setCalPos] = useState({ top: 0, right: 0 });

  // Week navigation
  const today = new Date();
  const [weekPage, setWeekPage] = useState(() => weekStartOf(todayKey()));
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [viewYear, setViewYear] = useState(today.getFullYear());

  /* ── Fetch habits ── */
  useEffect(() => {
    const fetchHabits = async () => {
      try {
        const res = await fetch('/api/habits', { credentials: 'include' });
        if (res.ok) {
          const data = await res.json();
          setHabits(data.map(h => ({ ...h, id: h._id })));
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchHabits();
  }, []);

  /* ── Calendar position ── */
  useLayoutEffect(() => {
    if (showCalendar && calBtnRef.current) {
      const rect = calBtnRef.current.getBoundingClientRect();
      setCalPos({ top: rect.bottom + 10, right: window.innerWidth - rect.right });
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

  /* ── Habit CRUD ── */
  const handleAddHabit = async (newHabit) => {
    const optimisticHabit = { ...newHabit, id: `temp-${Date.now()}`, _id: `temp-${Date.now()}`, createdAt: new Date().toISOString() };
    setHabits([optimisticHabit, ...habits]);
    try {
      const res = await fetch('/api/habits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newHabit),
        credentials: 'include'
      });
      if (res.ok) {
        const data = await res.json();
        setHabits(prev => prev.map(h => h.id === optimisticHabit.id ? { ...data, id: data._id } : h));
        addToast('Habit Routine Registered.', 'success');
      } else {
        const errorData = await res.json();
        addToast(`Sync Failed: ${errorData.message || 'Auth issue'}`, 'error');
        setHabits(prev => prev.filter(h => h.id !== optimisticHabit.id));
      }
    } catch (err) {
      console.error(err);
      setHabits(prev => prev.filter(h => h.id !== optimisticHabit.id));
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    setHabits(prev => prev.map(h => h.id === id ? { ...h, status: newStatus } : h));
    try {
      const res = await fetch(`/api/habits/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
        credentials: 'include'
      });
      if (res.ok) {
        const data = await res.json();
        setHabits(prev => prev.map(h => h.id === id ? { ...h, streak: data.habit.streak } : h));
        if (newStatus === 'completed') addToast(`Routine Completed! +${data.userStats?.xp - user?.xp || 0} XP`, 'success');
        else if (newStatus === 'pending') addToast('Routine Reverted.', 'info');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteHabit = async (id) => {
    setHabits(prev => prev.filter(h => h.id !== id));
    try {
      await fetch(`/api/habits/${id}`, { method: 'DELETE', credentials: 'include' });
      addToast('Routine Deleted.', 'info');
    } catch (err) {
      console.error(err);
    }
  };

  /* ── Group habits by dateKey ── */
  const habitsByDate = {};
  habits.forEach(habit => {
    const key = toDateKey(habit.createdAt || new Date());
    if (!habitsByDate[key]) habitsByDate[key] = [];
    habitsByDate[key].push(habit);
  });

  /* ── All unique date keys sorted desc ── */
  const allDateKeys = Object.keys(habitsByDate).sort((a, b) => b.localeCompare(a));

  /* ── Filter by current week page ── */
  const weekEnd = weekPage + 6;
  const weekDateKeys = allDateKeys.filter(key => {
    const [y, m, d] = key.split('-').map(Number);
    return y === viewYear && (m - 1) === viewMonth && d >= weekPage && d <= weekEnd;
  });

  const displayDateKeys = jumpedDate
    ? allDateKeys.filter(k => k === jumpedDate)
    : weekDateKeys;

  /* ── Toggle date expand ── */
  const toggleDate = (dateKey) => {
    setExpandedDates(prev => {
      const next = new Set(prev);
      next.has(dateKey) ? next.delete(dateKey) : next.add(dateKey);
      return next;
    });
  };

  /* ── Week navigation ── */
  const prevWeek = () => {
    if (weekPage === 1) {
      let m = viewMonth - 1, y = viewYear;
      if (m < 0) { m = 11; y--; }
      const lastDay = new Date(y, m + 1, 0).getDate();
      const lastWeekStart = Math.floor((lastDay - 1) / 7) * 7 + 1;
      setViewMonth(m); setViewYear(y); setWeekPage(lastWeekStart);
    } else {
      setWeekPage(p => p - 7);
    }
    setJumpedDate(null);
  };

  const nextWeek = () => {
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    if (weekPage + 7 > daysInMonth) {
      let m = viewMonth + 1, y = viewYear;
      if (m > 11) { m = 0; y++; }
      setViewMonth(m); setViewYear(y); setWeekPage(1);
    } else {
      setWeekPage(p => p + 7);
    }
    setJumpedDate(null);
  };

  const goToToday = () => {
    const t = new Date();
    setViewMonth(t.getMonth()); setViewYear(t.getFullYear());
    setWeekPage(weekStartOf(todayKey()));
    setJumpedDate(null);
    setExpandedDates(new Set([todayKey()]));
  };

  /* ── Calendar logic ── */
  const calYear = calendarDate.getFullYear();
  const calMonth = calendarDate.getMonth();
  const firstDay = new Date(calYear, calMonth, 1).getDay();
  const daysInCalMonth = new Date(calYear, calMonth + 1, 0).getDate();

  const calPrevMonth = () => setCalendarDate(d => new Date(d.getFullYear(), d.getMonth() - 1, 1));
  const calNextMonth = () => setCalendarDate(d => new Date(d.getFullYear(), d.getMonth() + 1, 1));

  const handleCalendarDayClick = (day) => {
    const key = `${calYear}-${String(calMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    setJumpedDate(key);
    setExpandedDates(prev => new Set([...prev, key]));
    setShowCalendar(false);
  };

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];
  const dayNames = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

  const monthName = new Date(viewYear, viewMonth, 1).toLocaleString('en-US', { month: 'long' });

  const calendarDayCells = [];
  for (let i = 0; i < firstDay; i++) calendarDayCells.push(null);
  for (let d = 1; d <= daysInCalMonth; d++) calendarDayCells.push(d);

  const hasHabitOnDay = (day) => {
    const key = `${calYear}-${String(calMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return !!habitsByDate[key];
  };

  const isTodayInCal = (day) => {
    const t = new Date();
    return day === t.getDate() && calMonth === t.getMonth() && calYear === t.getFullYear();
  };

  return (
    <div className="todo-container-v2">
      {/* ── Header ── */}
      <div className="todo-header-v2" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>Habit Quests</h1>
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
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="hologram-btn-small"
            style={{ padding: '12px 24px', fontSize: '0.9rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <Plus size={18} /> INITIALIZE ROUTINE
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

      {/* ── Habit List (grouped by date) ── */}
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
              <p className="glitch-text">NO ACTIVE ROUTINES DETECTED</p>
              <p>{jumpedDate ? 'No routines found for the selected date.' : 'No habits logged this week. Initialize a routine above!'}</p>
            </motion.div>
          ) : (
            displayDateKeys.map(dateKey => {
              const dayHabits = habitsByDate[dateKey] || [];
              const dateIsToday = isToday(dateKey);
              const isOpen = expandedDates.has(dateKey);
              const completed = dayHabits.filter(h => h.status === 'completed').length;

              return (
                <motion.div
                  key={dateKey}
                  className={`date-group ${dateIsToday ? 'today-group' : ''}`}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2 }}
                >
                  {/* Clickable date header */}
                  <button
                    className={`date-group-header clickable ${isOpen ? 'open' : ''}`}
                    onClick={() => toggleDate(dateKey)}
                  >
                    <div className="date-header-left">
                      {dateIsToday && <span className="today-pill">TODAY</span>}
                      <h3>{formatDisplayDate(dateKey)}</h3>
                    </div>
                    <div className="date-header-right">
                      <span className="count-badge">{dayHabits.length} ROUTINES · {completed} DONE</span>
                      <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
                        <ChevronDown size={16} className="chevron-icon" />
                      </motion.div>
                    </div>
                  </button>

                  {/* Collapsible habit cards */}
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25, ease: 'easeInOut' }}
                        style={{ overflow: 'hidden' }}
                      >
                        <div className="group-tasks-inner">
                          <AnimatePresence>
                            {dayHabits.map(habit => (
                              <motion.div
                                key={habit.id}
                                layout
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                              >
                                <HabitCard
                                  habit={habit}
                                  onStatusChange={handleStatusChange}
                                  onDelete={handleDeleteHabit}
                                />
                              </motion.div>
                            ))}
                          </AnimatePresence>
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

      <AddHabitModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAdd={handleAddHabit}
      />

      {/* ── Calendar Portal ── */}
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
                    className={`cal-day-cell ${day === null ? 'empty' : ''} ${day && isTodayInCal(day) ? 'today' : ''} ${day && hasHabitOnDay(day) ? 'has-tasks' : ''}`}
                    onClick={() => day && handleCalendarDayClick(day)}
                  >
                    {day}
                    {day && hasHabitOnDay(day) && <span className="task-dot" />}
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
