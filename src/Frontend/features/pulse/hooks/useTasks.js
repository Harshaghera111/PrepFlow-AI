// src/Frontend/features/pulse/hooks/useTasks.js
import { useState, useEffect } from 'react';
import { subscribeToTasks } from '../../../../Backend/services/taskService';

export function useTasks(userId) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const unsub = subscribeToTasks(userId, (data, err) => {
      if (err) {
        console.warn("Falling back to client-side sort due to fetch error", err);
        setError(err);
        // Fallback: sort client-side in case indexes aren't deployed
        const sorted = data.sort((a,b) => {
           const d1 = a.deadline?.toDate ? a.deadline.toDate() : new Date();
           const d2 = b.deadline?.toDate ? b.deadline.toDate() : new Date();
           return d1 - d2;
        });
        setTasks(sorted);
      } else {
        setTasks(data);
      }
      setLoading(false);
    });

    // CRITICAL: Always clean up listener to prevent memory leaks and zombie snapshots
    return () => unsub();
  }, [userId]);

  return { tasks, loading, error };
}
