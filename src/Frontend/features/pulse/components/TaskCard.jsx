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
export const TaskCardSkeleton = () => (
  <div className="card skeleton" style={{ minHeight: '80px' }} />
);

export default function TaskCard({ task, loading, onStatusToggle, onDelete }) {
  if (loading) {
    return <TaskCardSkeleton />;
  }

  const priorityColors = {
    low: 'bg-[var(--green)]',
    medium: 'bg-[var(--yellow)]',
    high: 'bg-[var(--orange)]',
    critical: 'bg-[var(--red)] ring-2 ring-red-200 animate-pulse'
  };
  
  const typeStyles = {
    assignment: 'bg-blue-50 text-blue-600 border border-blue-100',
    study: 'bg-green-50 text-green-600 border border-green-100',
    hackathon: 'bg-orange-50 text-orange-500 border border-orange-100',
    event: 'bg-purple-50 text-purple-600 border border-purple-100',
    holiday: 'bg-zinc-100 text-zinc-500 border border-zinc-200'
  };

  const priority = getEffectivePriority(task);
  const pStyle = priorityColors[priority] || 'bg-zinc-400';
  const tStyle = typeStyles[task.type?.toLowerCase()] || typeStyles.holiday;

  const isCompleted = task.status === 'completed';
  const isMissed = task.status === 'missed';

  const d = task.deadline?.toDate ? task.deadline.toDate() : new Date(task.deadline * 1000 || task.deadline);
  const isDueSoon = (d.getTime() - Date.now()) < 24 * 3600 * 1000 && (d.getTime() - Date.now()) > 0;

  return (
    <div className={`card ${isMissed ? 'card-accent-red' : ''}`} style={{ opacity: isCompleted ? 0.6 : 1 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', flex: 1 }}>
          {/* Completion toggle */}
          <button
            onClick={onStatusToggle}
            style={{
              width: '18px', height: '18px', borderRadius: '50%', marginTop: '2px',
              border: `2px solid ${isCompleted ? 'var(--green)' : 'var(--border-strong)'}`,
              background: isCompleted ? 'var(--green)' : 'transparent',
              cursor: 'pointer', flexShrink: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}
          >
            {isCompleted && <span style={{ color: '#fff', fontSize: '10px' }}>✓</span>}
          </button>

          <div style={{ flex: 1 }}>
            <h4 style={{
              fontSize: '14px', fontWeight: 600, color: 'var(--text-1)', margin: 0,
              textDecoration: isCompleted ? 'line-through' : 'none'
            }}>
              {task.title}
            </h4>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px', flexWrap: 'wrap' }}>
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${tStyle}`}>{task.type}</span>
              {task.deadline && !isCompleted && <ReminderBadge deadline={d} />}
              {isMissed && (
                <span style={{ fontSize: '11px', color: 'var(--red)', fontWeight: 600 }}>Missed ({task.missedCount})</span>
              )}
            </div>

            {task.description && (
              <p style={{ fontSize: '13px', color: 'var(--text-2)', marginTop: '6px', marginBottom: 0 }}>
                {task.description}
              </p>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
          <div className={`w-2 h-2 rounded-full ${pStyle}`} title={`Priority: ${priority}`}></div>
          <button className="btn-icon" onClick={onDelete} title="Delete">✕</button>
        </div>
      </div>
    </div>
  );
}
