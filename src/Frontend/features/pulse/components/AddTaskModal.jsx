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
    <div style={{
      position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
      background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(3px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
    }}>
      <div className="card" style={{ width: '90%', maxWidth: '420px', padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
          <h2 style={{ fontSize: '16px', fontWeight: 600, margin: 0, color: 'var(--text-1)' }}>Add New Task</h2>
          <button className="btn-icon" onClick={onClose} title="Close">✕</button>
        </div>

        {error && (
          <div style={{ color: 'var(--red)', fontSize: '12px', background: 'var(--red-muted)', padding: '8px 12px', borderRadius: '6px', marginBottom: '14px' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: 'var(--text-2)', marginBottom: '5px' }}>Title</label>
            <input
              autoFocus
              type="text"
              className="auth-input"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g. Finish React assignment"
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: 'var(--text-2)', marginBottom: '5px' }}>Deadline</label>
            <input
              type="datetime-local"
              className="auth-input"
              value={deadline}
              onChange={e => setDeadline(e.target.value)}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: 'var(--text-2)', marginBottom: '5px' }}>Type (Auto-detected)</label>
            <select className="auth-input" value={type} onChange={e => setType(e.target.value)}>
              <option value="study">Study</option>
              <option value="assignment">Assignment</option>
              <option value="hackathon">Hackathon</option>
              <option value="event">Event</option>
              <option value="holiday">Holiday</option>
            </select>
            {title.length > 2 && (
              <span style={{ display: 'inline-block', marginTop: '6px', fontSize: '11px', color: 'var(--orange)', background: 'var(--orange-muted)', border: '1px solid var(--orange-border)', padding: '2px 8px', borderRadius: '100px' }}>
                Auto-detected: {type}
              </span>
            )}
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: 'var(--text-2)', marginBottom: '5px' }}>Description (optional)</label>
            <textarea
              className="auth-input"
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Details..."
              style={{ minHeight: '70px', resize: 'vertical' }}
              maxLength={500}
            />
          </div>

          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '4px' }}>
            <button type="button" className="btn btn-outline" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-orange">Add Task</button>
          </div>
        </form>
      </div>
    </div>
  );
}
