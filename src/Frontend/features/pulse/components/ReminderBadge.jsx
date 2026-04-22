import React from 'react';

/**
 * Inline relative-time badge.
 * Red < 24hr, amber < 72hr, green otherwise.
 * @param {Object} props
 * @param {Date} props.deadline
 */
export default function ReminderBadge({ deadline }) {
  if (!deadline) return null;

  const d = deadline?.toDate ? deadline.toDate() : new Date(deadline * 1000 || deadline);
  const ms = d.getTime() - Date.now();
  const hrs = ms / 36e5;
  
  if (ms < 0) return <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-red-50 text-red-500 border border-red-100 font-medium">Overdue</span>;

  let style = "bg-zinc-50 text-zinc-400 border border-zinc-100";
  let text = `Due ${d.toLocaleDateString()}`;

  if (hrs < 1) {
    style = "bg-red-50 text-red-500 border border-red-100";
    text = `Due in ${Math.ceil(ms / 60000)} min`;
  } else if (hrs < 24) {
    style = "bg-orange-50 text-orange-500 border border-orange-100";
    text = `Due in ${Math.ceil(hrs)} hrs`;
  } else if (hrs < 72) {
    style = "bg-yellow-50 text-yellow-600 border border-yellow-100";
    text = `Due in ${Math.ceil(hrs / 24)} days`;
  }

  return (
    <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium ${style}`}>
      {text}
    </span>
  );
}
