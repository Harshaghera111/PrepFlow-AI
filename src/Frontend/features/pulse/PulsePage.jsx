import React, { useState } from 'react';
import { useTasks } from './hooks/useTasks';
import { useFCM } from './hooks/useFCM';
import { addTask, updateTask, deleteTask } from '../../../Backend/services/taskService';
import TaskCard from './components/TaskCard';
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
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 px-4 sm:px-6 lg:px-8 py-6">
       <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
             <div>
                <h1 className="text-xl font-semibold text-zinc-800 dark:text-zinc-100">PrepFlow Pulse</h1>
                <p className="text-sm text-zinc-500 mt-0.5">{subStatus}</p>
             </div>
             <button onClick={() => setIsModalOpen(true)} className="hidden md:flex items-center gap-1.5 py-2 px-4 rounded-lg bg-[var(--orange)] text-white font-medium text-sm hover:brightness-110 active:scale-[0.98] transition-all duration-150 shadow-md hover:shadow-lg">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                Add Task
             </button>
          </div>
          <div className="border-b border-zinc-100 dark:border-zinc-800 mb-6"></div>

          {DEMO_MODE && (
             <div className="w-full rounded-xl bg-[var(--orange)]/10 border border-[var(--orange)]/20 px-4 py-3 mb-6 flex items-center justify-center gap-2 text-sm text-orange-700 dark:text-orange-300 font-medium">
               <span className="text-lg">💡</span> Demo Mode: This is a preview of PrepFlow Pulse with sample data
             </div>
          )}

          {error && (
            <div className="w-full rounded-xl bg-red-50 border border-red-100 px-4 py-3 mb-6 flex items-center justify-center gap-2 text-sm text-red-600 font-medium tracking-wide">
              Real-time sync degraded. Using local state.
            </div>
          )}

          {/* Today */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-base leading-none">📅</span>
              <h2 className="text-sm font-semibold text-zinc-600 dark:text-zinc-400 uppercase tracking-wide">Today</h2>
              <span className="ml-auto text-xs font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-500 px-2 py-0.5 rounded-full">{todaysTasks.length}</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {loading ? (
                <><TaskCard loading /><TaskCard loading /><TaskCard loading /></>
              ) : todaysTasks.length > 0 ? todaysTasks.map(t => (
                 <TaskCard key={t.id} task={t} onStatusToggle={() => handleToggleStatus(t)} onDelete={() => handleDelete(t.id)} />
              )) : (
                 <div className="col-span-full"><EmptyState title="Clear for today" subtitle="Nothing here. Stay ahead — add one." emoji="🎉" /></div>
              )}
            </div>
          </div>
          
          <hr className="border-zinc-100 dark:border-zinc-800 my-6" />

          {/* Upcoming */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-base leading-none">🗓</span>
              <h2 className="text-sm font-semibold text-zinc-600 dark:text-zinc-400 uppercase tracking-wide">Upcoming</h2>
              <span className="ml-auto text-xs font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-500 px-2 py-0.5 rounded-full">{upcomingTasks.length}</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {loading ? (
                <><TaskCard loading /><TaskCard loading /><TaskCard loading /></>
              ) : upcomingTasks.length > 0 ? upcomingTasks.map(t => (
                 <TaskCard key={t.id} task={t} onStatusToggle={() => handleToggleStatus(t)} onDelete={() => handleDelete(t.id)} />
              )) : (
                 <div className="col-span-full"><EmptyState title="Nothing approaching" subtitle="Nothing here. Stay ahead — add one." emoji="📅" /></div>
              )}
            </div>
          </div>

          <hr className="border-zinc-100 dark:border-zinc-800 my-6" />

          {/* Missed */}
          {missedTasks.length > 0 || !loading && (
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-base leading-none">⚠️</span>
                <h2 className="text-sm font-semibold text-red-500 dark:text-red-400 uppercase tracking-wide">Missed tasks</h2>
                <span className="ml-auto text-xs font-medium bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 border border-red-100 dark:border-red-900 px-2 py-0.5 rounded-full">{missedTasks.length}</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {missedTasks.length > 0 ? missedTasks.map(t => (
                   <TaskCard key={t.id} task={t} onStatusToggle={() => handleToggleStatus(t)} onDelete={() => handleDelete(t.id)} />
                )) : (
                   <div className="col-span-full"><EmptyState title="All caught up" subtitle="No missed tasks. Keep it up." emoji="👏" isMissed /></div>
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

      <div className="group fixed bottom-6 right-6 z-40">
        <div className="group-hover:opacity-100 opacity-0 absolute right-16 bottom-2 bg-zinc-800 text-white text-xs rounded-md px-2 py-1 whitespace-nowrap pointer-events-none transition-opacity duration-150 hidden md:block">
          Add Task
        </div>
        <button 
          className="w-14 h-14 rounded-full bg-[var(--orange)] text-white text-2xl font-light flex items-center justify-center shadow-lg hover:shadow-xl hover:scale-110 active:scale-95 transition-all duration-200"
          onClick={() => setIsModalOpen(true)}
        >
          +
        </button>
      </div>
    </div>
  );
}
