import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Save, CalendarDays, Trash2 } from 'lucide-react';
import { useToast } from '../../Context/ToastContext';
import './Journal.css';

export default function Journal() {
  const { addToast } = useToast();
  const [entries, setEntries] = useState([]);
  const [activeEntryId, setActiveEntryId] = useState(null);
  
  const activeEntry = entries.find(e => e.id === activeEntryId) || null;

  useEffect(() => {
    const fetchEntries = async () => {
      try {
        const res = await fetch('http://localhost:5001/api/journal', {credentials: 'include'});
        if (res.ok) {
          const data = await res.json();
          const loaded = data.map(e => ({...e, id: e._id, date: e.dateString}));
          setEntries(loaded);
          if (loaded.length > 0) setActiveEntryId(loaded[0].id);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchEntries();
  }, []);

  const handleCreateNew = async () => {
    try {
      const res = await fetch('http://localhost:5001/api/journal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: 'New Journal Entry', content: '' }),
        credentials: 'include'
      });
      if (res.ok) {
        const e = await res.json();
        const newEntry = {...e, id: e._id, date: e.dateString};
        setEntries([newEntry, ...entries]);
        setActiveEntryId(newEntry.id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdate = (field, value) => {
    setEntries(entries.map(e => 
      e.id === activeEntryId ? { ...e, [field]: value } : e
    ));
  };

  const handleSave = async () => {
    if (!activeEntry) return;
    try {
      await fetch(`http://localhost:5001/api/journal/${activeEntry.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: activeEntry.title, content: activeEntry.content }),
        credentials: 'include'
      });
      if (res.ok) {
        addToast('Journal entry saved successfully!', 'success');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async () => {
    if (!activeEntry) return;
    try {
      await fetch(`http://localhost:5001/api/journal/${activeEntry.id}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      const newEntries = entries.filter(e => e.id !== activeEntryId);
      setEntries(newEntries);
      if (newEntries.length > 0) setActiveEntryId(newEntries[0].id);
      else setActiveEntryId(null);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="journal-container">
      {/* Sidebar List */}
      <div className="journal-sidebar">
        <h2>
          Entries
          <button className="new-entry-btn" onClick={handleCreateNew}>
            <Plus size={16} /> New
          </button>
        </h2>
        
        <div className="entries-list">
          <AnimatePresence>
            {entries.map(entry => (
              <motion.div 
                key={entry.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`entry-card ${entry.id === activeEntryId ? 'active' : ''}`}
                onClick={() => setActiveEntryId(entry.id)}
              >
                <div className="entry-title">{entry.title || 'Untitled Entry'}</div>
                <div className="entry-date">{entry.date}</div>
                <div className="entry-preview">{entry.content || 'No content yet...'}</div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* Main Editor */}
      {activeEntry ? (
        <motion.div 
          className="journal-editor"
          key={activeEntryId} // Force re-render animation when swapping entries
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="editor-header">
            <span className="editor-date">
              <CalendarDays size={18} /> {activeEntry.date}
            </span>
            <div style={{display: 'flex', gap: '10px'}}>
              <button className="save-btn" onClick={handleSave}>
                <Save size={18} /> Save
              </button>
              <button 
                className="save-btn" 
                style={{background: 'rgba(255, 71, 87, 0.2)', color: '#ff4757', boxShadow: 'none'}} 
                onClick={handleDelete}
              >
                <Trash2 size={18} /> 
              </button>
            </div>
          </div>

          <input 
            type="text" 
            className="title-input" 
            placeholder="Entry Title..." 
            value={activeEntry.title}
            onChange={(e) => handleUpdate('title', e.target.value)}
          />

          <textarea 
            className="content-input" 
            placeholder="Start writing your thoughts here..."
            value={activeEntry.content}
            onChange={(e) => handleUpdate('content', e.target.value)}
          />
        </motion.div>
      ) : (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>
          Select an entry or create a new one.
        </div>
      )}
    </div>
  );
}
