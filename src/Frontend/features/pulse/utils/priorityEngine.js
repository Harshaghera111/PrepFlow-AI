// src/Frontend/features/pulse/utils/priorityEngine.js

/**
 * Calculates priority based on deadline, type, and missed count
 * @param {Date} deadline 
 * @param {string} type 
 * @param {number} missedCount 
 * @returns {string} priority: 'low' | 'medium' | 'high' | 'critical'
 */
export function calculatePriority(deadline, type, missedCount) {
  const hoursLeft = (deadline.getTime() - Date.now()) / 36e5;

  if (missedCount >= 2) return 'critical';
  if (hoursLeft < 0) return 'critical';
  if (hoursLeft < 24) return 'high';
  if (type === 'assignment' || hoursLeft < 72) return 'high';
  if (type === 'hackathon' || hoursLeft < 168) return 'medium';
  return 'low';
}

/**
 * Helper to get priority from a Task object directly
 * @param {Object} task 
 * @returns {string} priority
 */
export function getEffectivePriority(task) {
  // Graceful fallback for non-timstamp deadline formats if needed
  const d = task.deadline?.toDate ? task.deadline.toDate() : new Date(task.deadline * 1000 || task.deadline);
  return calculatePriority(d, task.type, task.missedCount || 0);
}
