// src/Backend/services/taskService.js
import { collection, addDoc, updateDoc, deleteDoc, doc, query, where, orderBy, limit, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';

/**
 * Subscribes to real-time tasks for a user
 * @param {string} userId - Firebase Auth UID
 * @param {Function} callback - Callback function receiving tasks array
 * @returns {Function} Unsubscribe function
 */
export function subscribeToTasks(userId, callback) {
  if (!userId) return () => {};

  try {
    const q = query(
      collection(db, 'tasks'),
      where('userId', '==', userId),
      orderBy('deadline'),
      limit(50)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const tasks = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      callback(tasks);
    }, (error) => {
      console.error("Firestore tasks subscription error (indexes might be building):", error);
      // Fallback for missing indexes: UI should handle empty or unsorted gracefully inside the hook
      callback([], error);
    });

    return unsubscribe;
  } catch (err) {
    console.error("Error creating query:", err);
    callback([], err);
    return () => {};
  }
}

/**
 * Adds a new task
 * @param {Object} data - Task data excluding id, createdAt, updatedAt
 */
export async function addTask(data) {
  const tasksRef = collection(db, 'tasks');
  await addDoc(tasksRef, {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });
}

/**
 * Updates an existing task
 * @param {string} id - Task doc ID
 * @param {Object} data - Partial task data
 */
export async function updateTask(id, data) {
  const taskRef = doc(db, 'tasks', id);
  await updateDoc(taskRef, {
    ...data,
    updatedAt: serverTimestamp()
  });
}

/**
 * Deletes a task
 * @param {string} id - Task doc ID
 */
export async function deleteTask(id) {
  const taskRef = doc(db, 'tasks', id);
  await deleteDoc(taskRef);
}
