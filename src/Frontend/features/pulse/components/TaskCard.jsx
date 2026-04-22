import React from 'react';
import ReminderBadge from './ReminderBadge';
import { getEffectivePriority } from '../utils/priorityEngine';

/**
 * TaskCard UI component
 * @param {Object} props
 * @param {Object} props.task
 * @param {boolean} props.loading
 * @param {Function} props.onStatusToggle
 * @param {Function} props.onDelete
 */
export default function TaskCard({ task, loading, onStatusToggle, onDelete }) {
  if (loading) {
    return (
      <div className="card pf-glass-card skeleton" style={{ minHeight: '100px', marginBottom: '12px' }} />
    );
  }

  const priorityColors = {
    low: 'var(--text-3)',
    medium: 'var(--yellow)',
    high: 'var(--orange)',
    critical: 'var(--red)'
  };
  
  const priority = getEffectivePriority(task);
  const pColor = priorityColors[priority] || 'var(--text-3)';

  const isCompleted = task.status === 'completed';
  const isMissed = task.status === 'missed';

  return (
    <div className={`card ${isMissed ? 'card-accent-red' : ''}`} style={{ 
      marginBottom: '12px',
      opacity: isCompleted ? 0.6 : 1,
      transition: 'opacity 0.2s',
      display: 'flex',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      gap: '12px'
    }}>
      <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
        <button 
          onClick={onStatusToggle}
          style={{
            width: '20px', height: '20px', borderRadius: '50%',
            marginTop: '2px',
            border: `2px solid ${isCompleted ? 'var(--green)' : 'var(--border-strong)'}`,
            background: isCompleted ? 'var(--green)' : 'transparent',
            cursor: 'pointer',
            flexShrink: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}
        >
          {isCompleted && <span style={{ color: '#fff', fontSize: '10px' }}>✓</span>}
        </button>
        
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <h4 style={{ 
              fontSize: '15px', fontWeight: 600, 
              color: 'var(--text-1)', margin: 0,
              textDecoration: isCompleted ? 'line-through' : 'none'
            }}>
              {task.title}
            </h4>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: pColor }} title={`Priority: ${priority}`} />
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px', flexWrap: 'wrap' }}>
            <span className="tag" style={{ padding: '2px 8px', fontSize: '11px' }}>{task.type}</span>
            {task.deadline && !isCompleted && (
              <ReminderBadge deadline={task.deadline?.toDate ? task.deadline.toDate() : new Date(task.deadline * 1000 || task.deadline)} />
            )}
            {isMissed && (
               <span style={{ fontSize: '11px', color: 'var(--red)', fontWeight: 600 }}>Missed ({task.missedCount})</span>
            )}
          </div>
          
          {task.description && (
             <p style={{ fontSize: '13px', color: 'var(--text-2)', marginTop: '8px', marginBottom: 0 }}>
               {task.description}
             </p>
          )}
        </div>
      </div>
      
      <button className="btn-icon" onClick={onDelete} style={{ flexShrink: 0 }}>✕</button>
    </div>
  );
}
