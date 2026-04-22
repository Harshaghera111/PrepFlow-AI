import React, { useState } from 'react';
import { useTasks } from './hooks/useTasks';
import { useFCM } from './hooks/useFCM';
import { addTask, updateTask, deleteTask } from '../../../Backend/services/taskService';
import TaskCard, { TaskCardSkeleton } from './components/TaskCard';
import EmptyState from './components/EmptyState';
import AddTaskModal from './components/AddTaskModal';

const DEMO_MODE = true;

const demoTasks = [
  {
    id: "1",
    title: "Practice DSA - Arrays",
    type: "study",
    deadline: new Date(Date.now() + 2 * 60 * 60 * 1000),
    priority: "high",
    status: "pending",
  },
  {
    id: "2",
    title: "Submit DBMS Assignment",
    type: "assignment",
    deadline: new Date(Date.now() - 2 * 60 * 60 * 1000),
    priority: "high",
    status: "missed",
    missedCount: 1,
  },
  {
    id: "3",
    title: "Apply for Hackathon",
    type: "hackathon",
    deadline: new Date(Date.now() + 24 * 60 * 60 * 1000),
    priority: "medium",
    status: "pending",
  }
];

export default function PulsePage({ user }) {
  const { tasks: dbTasks, loading: dbLoading, error: dbError } = useTasks(user?.uid);
  const { toastMessage } = useFCM(user?.uid);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [localTasks, setLocalTasks] = useState(demoTasks);

  const tasks = DEMO_MODE ? localTasks : dbTasks;
  const loading = DEMO_MODE ? false : dbLoading;
  const error = DEMO_MODE ? null : dbError;

  // Fallback debug to confirm render on deployed site
  console.log("PulsePage rendered successfully. DEMO_MODE:", DEMO_MODE, "Tasks loaded:", tasks.length);

  const getDashboardStatus = (tasksArray) => {
    const isToday = (deadline) => {
      const d = deadline?.toDate ? deadline.toDate() : new Date(deadline * 1000 || deadline);
      const now = new Date();
      return d.getDate() === now.getDate() && d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    };
    const missedNum = tasksArray.filter(t => t.status === 'missed').length;
    const dueToday = tasksArray.filter(t => isToday(t.deadline) && t.status === 'pending').length;
    const allDone = tasksArray.length > 0 && tasksArray.every(t => t.status === 'completed');

    if (tasksArray.length === 0) return "Ready to plan your day?";
    if (allDone) return "✅ All clear. Great work today.";
    if (missedNum > 0) return `⚠️ ${missedNum} task${missedNum>1?'s':''} need attention.`;
    if (dueToday > 0) return `🔥 ${dueToday} task${dueToday>1?'s':''} due today.`;
    return "📅 You're on track. Keep going.";
  };

  const subStatus = getDashboardStatus(tasks);

  const handleToggleStatus = async (task) => {
    const newStatus = task.status === 'completed' ? 'pending' : 'completed';
    if (DEMO_MODE) {
      setLocalTasks(prev => prev.map(t => t.id === task.id ? { ...t, status: newStatus } : t));
      return;
    }
    await updateTask(task.id, { status: newStatus });
  };

  const handleDelete = async (taskId) => {
    if (window.confirm("Are you sure you want to delete this task?")) {
      if (DEMO_MODE) {
        setLocalTasks(prev => prev.filter(t => t.id !== taskId));
        return;
      }
      await deleteTask(taskId);
    }
  };

  const handleAddTask = async (taskData) => {
    if (DEMO_MODE) {
      const newTask = { ...taskData, id: Date.now().toString(), userId: user?.uid || 'demo-user' };
      setLocalTasks(prev => [...prev, newTask]);
      return;
    }
    await addTask({ ...taskData, userId: user.uid });
  };

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

  missedTasks.sort((a,b) => (b.missedCount || 0) - (a.missedCount || 0));

  return (
    <div className="pf-dashboard-bg" style={{ minHeight: '100vh' }}>
      <div className="pf-dashboard-container fade-in">
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div>
            <h1 style={{ fontSize: '20px', fontWeight: 600, margin: 0, color: 'var(--text-1)' }}>PrepFlow Pulse</h1>
            <p style={{ fontSize: '13px', color: 'var(--text-2)', marginTop: '4px' }}>{subStatus}</p>
          </div>
          <button onClick={() => setIsModalOpen(true)} className="btn btn-orange btn-sm hidden md:inline-flex">
            + Add Task
          </button>
        </div>

        {DEMO_MODE && (
          <div style={{
            background: 'var(--orange-muted)', border: '1px solid var(--orange-border)',
            padding: '8px 16px', borderRadius: '8px', marginBottom: '16px',
            color: 'var(--orange)', fontSize: '13px', fontWeight: 500,
            textAlign: 'center'
          }}>
            💡 Demo Mode — sample data only
          </div>
        )}

        {error && (
          <div style={{ padding: '10px 14px', background: 'var(--red-muted)', color: 'var(--red)', borderRadius: '8px', marginBottom: '16px', fontSize: '13px' }}>
            Real-time sync degraded. Using local state.
          </div>
        )}

        {/* Today */}
        <div style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <span>📅</span>
            <h2 style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-2)', textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>Today</h2>
            <span className="tag" style={{ marginLeft: 'auto', padding: '2px 8px', fontSize: '11px' }}>{todaysTasks.length}</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {loading ? (
              <><TaskCardSkeleton /><TaskCardSkeleton /></>
            ) : todaysTasks.length > 0 ? todaysTasks.map(t => (
              <TaskCard key={t.id} task={t} onStatusToggle={() => handleToggleStatus(t)} onDelete={() => handleDelete(t.id)} />
            )) : (
              <EmptyState title="Clear for today" subtitle="Nothing here. Stay ahead — add one." emoji="🎉" />
            )}
          </div>
        </div>

        <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '4px 0 20px' }} />

        {/* Upcoming */}
        <div style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <span>🗓</span>
            <h2 style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-2)', textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>Upcoming</h2>
            <span className="tag" style={{ marginLeft: 'auto', padding: '2px 8px', fontSize: '11px' }}>{upcomingTasks.length}</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {loading ? (
              <><TaskCardSkeleton /><TaskCardSkeleton /></>
            ) : upcomingTasks.length > 0 ? upcomingTasks.map(t => (
              <TaskCard key={t.id} task={t} onStatusToggle={() => handleToggleStatus(t)} onDelete={() => handleDelete(t.id)} />
            )) : (
              <EmptyState title="Nothing approaching" subtitle="Nothing here. Stay ahead — add one." emoji="📅" />
            )}
          </div>
        </div>

        <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '4px 0 20px' }} />

        {/* Missed */}
        {(missedTasks.length > 0 || !loading) && (
          <div style={{ marginBottom: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <span>⚠️</span>
              <h2 style={{ fontSize: '13px', fontWeight: 600, color: 'var(--red)', textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>Missed</h2>
              <span className="tag" style={{ marginLeft: 'auto', padding: '2px 8px', fontSize: '11px' }}>{missedTasks.length}</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {missedTasks.length > 0 ? missedTasks.map(t => (
                <TaskCard key={t.id} task={t} onStatusToggle={() => handleToggleStatus(t)} onDelete={() => handleDelete(t.id)} />
              )) : (
                <EmptyState title="All caught up" subtitle="No missed tasks. Keep it up." emoji="👏" />
              )}
            </div>
          </div>
        )}
      </div>

      <AddTaskModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAdd={handleAddTask}
      />

      {/* FAB — mobile */}
      <button
        className="btn btn-orange"
        onClick={() => setIsModalOpen(true)}
        style={{
          position: 'fixed', bottom: '24px', right: '24px', zIndex: 200,
          width: '52px', height: '52px', borderRadius: '26px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '22px', boxShadow: 'var(--shadow-md)'
        }}
      >
        +
      </button>
    </div>
  );
}
