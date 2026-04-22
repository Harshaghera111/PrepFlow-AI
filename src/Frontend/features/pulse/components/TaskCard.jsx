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
  <div className="group relative bg-white dark:bg-zinc-900 rounded-xl p-4 md:p-5 shadow-sm border border-zinc-100 dark:border-zinc-800 animate-pulse">
    <div className="h-4 w-3/4 bg-zinc-200 dark:bg-zinc-800 rounded mb-3"></div>
    <div className="h-3 w-1/4 bg-zinc-100 dark:bg-zinc-800 rounded mb-3"></div>
    <div className="h-3 w-1/2 bg-zinc-100 dark:bg-zinc-800 rounded"></div>
  </div>
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
    <div className={`group relative bg-white dark:bg-zinc-900 rounded-xl p-4 md:p-5 shadow-sm hover:shadow-md hover:scale-[1.02] transition-all duration-200 ease-in-out border border-zinc-100 dark:border-zinc-800 ${isCompleted ? 'opacity-60' : ''} ${isMissed ? 'bg-red-50 dark:bg-red-950/20 border-red-100' : ''} ${!isCompleted && !isMissed ? 'border-l-4 border-l-[var(--orange)]' : ''}`}>
      
      <div className="flex items-start justify-between gap-2">
         <div className="flex items-start gap-3">
           <button 
             onClick={onStatusToggle}
             className={`w-5 h-5 rounded-full mt-0.5 flex-shrink-0 flex items-center justify-center border-2 transition-colors ${isCompleted ? 'border-[var(--green)] bg-[var(--green)]' : 'border-zinc-300 dark:border-zinc-600 bg-transparent hover:border-[var(--orange)]'}`}
           >
             {isCompleted && <span className="text-white text-[10px] font-bold">✓</span>}
           </button>
           <div>
             <h4 className={`text-sm font-semibold text-zinc-800 dark:text-zinc-100 leading-snug ${isCompleted ? 'line-through' : ''}`}>
               {task.title}
             </h4>
             <div className={`inline-flex items-center gap-1 mt-2 text-xs font-medium px-2.5 py-0.5 rounded-full ${tStyle}`}>
                {task.type}
             </div>
             
             <div className="flex items-center gap-1.5 mt-3">
               {!isCompleted && (
                 <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-400">
                   <circle cx="12" cy="12" r="10"></circle>
                   <polyline points="12 6 12 12 16 14"></polyline>
                 </svg>
               )}
               <span className={`text-xs ${isDueSoon && !isCompleted ? 'text-[var(--red)] font-medium' : 'text-zinc-400 dark:text-zinc-500'}`}>
                 {task.deadline && !isCompleted && <ReminderBadge deadline={d} />}
               </span>
               {isMissed && (
                  <span className="text-xs text-[var(--red)] font-medium ml-2">Missed ({task.missedCount})</span>
               )}
             </div>

             {task.description && (
               <p className="text-xs text-zinc-500 mt-2 line-clamp-2">
                 {task.description}
               </p>
             )}
           </div>
         </div>
         <div className={`w-2.5 h-2.5 rounded-full mt-1 flex-shrink-0 ${pStyle}`} title={`Priority: ${priority}`}></div>
      </div>

      <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-150 absolute top-3 right-3 flex gap-1">
        <button className="p-1 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 hover:text-zinc-600 transition-colors" onClick={onDelete} title="Delete Task">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>
        </button>
      </div>

    </div>
  );
}
