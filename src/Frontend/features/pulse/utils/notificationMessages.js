// src/Frontend/features/pulse/utils/notificationMessages.js

/**
 * Gets notification predefined messages
 * @param {Object} task 
 * @param {string} scenario 'reminder_1hr' | 'at_deadline' | 'missed' | 'streak'
 * @returns {Object} { title, body }
 */
export function getNotificationMessage(task, scenario) {
  const map = {
    reminder_1hr: {
      title: 'Heads up — 1 hour left',
      body: `"${task.title}" is due soon. A focused hour now closes it out.`,
    },
    at_deadline: {
      title: 'Deadline reached',
      body: `"${task.title}" — submit what you have. Done beats perfect.`,
    },
    missed: {
      title: 'Missed task flagged',
      body: `"${task.title}" moved to high priority. Let's recover today.`,
    },
    streak: {
      title: 'You are on a roll',
      body: 'Tasks cleared. Your consistency is your advantage.',
    },
  };
  return map[scenario];
}
