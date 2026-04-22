import React, { useState } from 'react';
import { useTasks } from './hooks/useTasks';
import { useFCM } from './hooks/useFCM';
import { addTask, updateTask, deleteTask } from '../../../Backend/services/taskService';
import TaskCard from './components/TaskCard';
import EmptyState from './components/EmptyState';
import AddTaskModal from './components/AddTaskModal';

export default function PulsePage({ user }) {
  const { tasks, loading, error } = useTasks(user?.uid);
  const { toastMessage } = useFCM(user?.uid);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleToggleStatus = async (task) => {
    const newStatus = task.status === 'completed' ? 'pending' : 'completed';
    await updateTask(task.id, { status: newStatus });
  };

  const handleDelete = async (taskId) => {
    if (window.confirm("Are you sure you want to delete this task?")) {
      await deleteTask(taskId);
    }
  };

  const handleAddTask = async (taskData) => {
    await addTask({ ...taskData, userId: user.uid });
  };

  // Sections
  const now = new Date();
  const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
  const next7DaysEnd = new Date(todayEnd.getTime() + 7 * 24 * 60 * 60 * 1000);

  let todaysTasks = [];
  let upcomingTasks = [];
  let missedTasks = [];

  tasks.forEach(t => {
    if (t.status === 'missed') {
      missedTasks.push(t);
      return;
    }
    const d = t.deadline?.toDate ? t.deadline.toDate() : new Date(t.deadline * 1000 || t.deadline);
    if (d <= todayEnd) todaysTasks.push(t);
    else if (d <= next7DaysEnd) upcomingTasks.push(t);
  });

  // Sort Missed by missedCount desc
  missedTasks.sort((a,b) => (b.missedCount || 0) - (a.missedCount || 0));

  return (
    <div className="pf-dashboard-bg" style={{ minHeight: '100vh' }}>
      <div className="pf-dashboard-container fade-in">
        
        {toastMessage && (
           <div style={{
             position: 'fixed', top: '70px', right: '20px', zIndex: 9999,
             background: 'var(--bg-elevated)', border: '1px solid var(--orange)',
             padding: '12px 16px', borderRadius: '8px', boxShadow: 'var(--shadow-md)',
             color: 'var(--text-1)'
           }}>
             <strong style={{ display: 'block', color: 'var(--orange)' }}>{toastMessage.title}</strong>
             <span style={{ fontSize: '13px' }}>{toastMessage.body}</span>
           </div>
        )}

        <div className="pf-dashboard-header pf-glass-card">
          <div>
             <h1 style={{ fontSize: '24px', fontWeight: 800, margin: 0, letterSpacing: '-0.5px' }}>
                PrepFlow <span style={{ color: 'var(--orange)' }}>Pulse</span>
             </h1>
             <p style={{ color: 'var(--text-2)', fontSize: '14px', marginTop: '4px' }}>
                Smart Reminder & Tracking System
             </p>
          </div>
          <button className="btn btn-orange" onClick={() => setIsModalOpen(true)}>
             + Add Task
          </button>
        </div>

        {error && (
           <div style={{ padding: '12px', background: 'var(--red-muted)', color: 'var(--red)', borderRadius: '8px', marginBottom: '16px', fontSize: '13px' }}>
             Warning: Real-time sync degraded (index building). Falling back to local sort.
           </div>
        )}

        <div className="pf-dashboard-grid" style={{ gridTemplateColumns: '1fr' }}>
           
           {/* Today */}
           <div style={{ marginBottom: '24px' }}>
             <h2 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '12px', color: 'var(--text-1)' }}>Today's Tasks</h2>
             {loading ? <TaskCard loading /> : todaysTasks.length > 0 ? todaysTasks.map(t => (
               <TaskCard 
                 key={t.id} 
                 task={t} 
                 onStatusToggle={() => handleToggleStatus(t)} 
                 onDelete={() => handleDelete(t.id)} 
               />
             )) : <EmptyState title="Clear for today" subtitle="Enjoy your day or jump ahead." emoji="🎉" />}
           </div>

           {/* Upcoming */}
           <div style={{ marginBottom: '24px' }}>
             <h2 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '12px', color: 'var(--text-1)' }}>Upcoming (Next 7 days)</h2>
             {loading ? <TaskCard loading /> : upcomingTasks.length > 0 ? upcomingTasks.map(t => (
               <TaskCard 
                 key={t.id} 
                 task={t} 
                 onStatusToggle={() => handleToggleStatus(t)} 
                 onDelete={() => handleDelete(t.id)} 
               />
             )) : <EmptyState title="Nothing approaching" subtitle="Add new assignments or study goals." emoji="📅" />}
           </div>

           {/* Missed */}
           {missedTasks.length > 0 && (
             <div style={{ marginBottom: '24px' }}>
               <h2 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '12px', color: 'var(--red)' }}>Missed Tasks</h2>
               {missedTasks.map(t => (
                 <TaskCard 
                   key={t.id} 
                   task={t} 
                   onStatusToggle={() => handleToggleStatus(t)} 
                   onDelete={() => handleDelete(t.id)} 
                 />
               ))}
             </div>
           )}

        </div>
      </div>

      <AddTaskModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onAdd={handleAddTask} 
      />

      {/* Floating Action Button for mobile */}
      <button 
        className="btn btn-orange"
        onClick={() => setIsModalOpen(true)}
        style={{
          position: 'fixed', bottom: '24px', right: '24px', zIndex: 200,
          width: '56px', height: '56px', borderRadius: '28px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '24px', boxShadow: 'var(--shadow-md)'
        }}
      >
        +
      </button>
    </div>
  );
}
