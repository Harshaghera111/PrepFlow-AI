// src/Frontend/features/pulse/utils/detectTaskType.js

const TYPE_KEYWORDS = {
  assignment: ['submit', 'assignment', 'homework', 'lab', 'report', 'due'],
  study: ['practice', 'revise', 'read', 'chapter', 'notes', 'learn', 'dsa'],
  hackathon: ['hackathon', 'ideathon', 'sprint', 'challenge', 'build'],
  event: ['seminar', 'webinar', 'fest', 'meet', 'workshop', 'session'],
  holiday: ['holiday', 'break', 'vacation', 'off'],
};

/**
 * Detects best task type based on title string
 * @param {string} title 
 * @returns {string} task type
 */
export function detectTaskType(title) {
  if (!title) return 'study';
  
  const lower = title.toLowerCase();
  const scores = Object.entries(TYPE_KEYWORDS).map(([type, keywords]) => ({
    type,
    score: keywords.filter(k => lower.includes(k)).length,
  }));
  
  const best = scores.sort((a, b) => b.score - a.score)[0];
  return best.score > 0 ? best.type : 'study'; // default fallback
}
