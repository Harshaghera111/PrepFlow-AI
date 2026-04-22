import React, { useState, useEffect } from 'react';
import { detectTaskType } from '../utils/detectTaskType';

export default function AddTaskModal({ isOpen, onClose, onAdd }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [deadline, setDeadline] = useState('');
  const [type, setType] = useState('study');
  const [error, setError] = useState(null);

  useEffect(() => {
    if (title.length > 2) {
      setType(detectTaskType(title));
    }
  }, [title]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (title.trim().length < 3 || title.trim().length > 120) {
      setError('Title must be between 3 and 120 characters.');
      return;
    }
    const d = new Date(deadline);
    if (!deadline || d.getTime() <= Date.now()) {
      setError('Deadline must be in the future.');
      return;
    }
    
    onAdd({
      title: title.trim(),
      description: description.trim(),
      type,
      deadline: d,
      status: 'pending',
      missedCount: 0,
      priority: 'low',
      autoDetected: true,
      reminderAt: null // Simplified for MVP
    });
    
    // Reset form
    setTitle('');
    setDescription('');
    setDeadline('');
    setError(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center animate-in fade-in duration-200">
      <div className={`w-full sm:max-w-md bg-white dark:bg-zinc-900 rounded-t-2xl sm:rounded-2xl shadow-xl p-5 sm:p-6 transform transition-all duration-200 ease-out translate-y-0 opacity-100`}>
        
        <div className="flex items-center justify-between mb-5">
           <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">Add New Task</h2>
           <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 hover:text-zinc-600 transition-colors duration-150">
             <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
           </button>
        </div>
        
        {error && <div className="text-[var(--red)] text-xs font-medium bg-red-50 px-3 py-2 rounded-md mb-4">{error}</div>}
        
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="text-xs font-medium text-zinc-500 mb-1 block">Title</label>
            <input 
              autoFocus
              type="text" 
              className={`w-full rounded-lg border ${error ? 'border-[var(--red)] focus:ring-[var(--red)]/30' : 'border-zinc-200 dark:border-zinc-700'} bg-white dark:bg-zinc-800 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--orange)]/40 focus:border-[var(--orange)] transition-colors duration-150`}
              value={title} 
              onChange={e => setTitle(e.target.value)} 
              placeholder="e.g. Finish React assignment" 
            />
          </div>
          
          <div>
            <label className="text-xs font-medium text-zinc-500 mb-1 block">Deadline</label>
            <input 
              type="datetime-local" 
              className="w-full rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--orange)]/40 focus:border-[var(--orange)] transition-colors duration-150"
              value={deadline} 
              onChange={e => setDeadline(e.target.value)} 
            />
          </div>

          <div>
             <label className="text-xs font-medium text-zinc-500 mb-1 block">Type</label>
             <select 
               className="w-full rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--orange)]/40 focus:border-[var(--orange)] transition-colors duration-150"
               value={type} 
               onChange={e => setType(e.target.value)}
             >
               <option value="study">Study</option>
               <option value="assignment">Assignment</option>
               <option value="hackathon">Hackathon</option>
               <option value="event">Event</option>
               <option value="holiday">Holiday</option>
             </select>
             {title.length > 2 && (
                <div className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-orange-50 text-orange-500 border border-orange-100 mt-2">
                  Auto-detected: {type} · tap to change
                </div>
             )}
          </div>

          <div>
             <label className="text-xs font-medium text-zinc-500 mb-1 block">Description (optional)</label>
             <textarea 
               className="w-full rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--orange)]/40 focus:border-[var(--orange)] transition-colors duration-150"
               value={description} 
               onChange={e => setDescription(e.target.value)} 
               placeholder="Details..."
               style={{ minHeight: '80px', resize: 'vertical' }}
               maxLength={500}
             />
          </div>

          <div className="pt-2">
             <button type="submit" className="w-full py-2.5 rounded-lg bg-[var(--orange)] text-white font-medium text-sm hover:brightness-110 active:scale-[0.98] transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed">
               Add Task
             </button>
          </div>
        </form>
      </div>
    </div>
  );
}
