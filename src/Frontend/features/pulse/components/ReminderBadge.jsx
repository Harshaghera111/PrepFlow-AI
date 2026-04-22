import React from 'react';

/**
 * Inline relative-time badge.
 * Red < 24hr, amber < 72hr, green otherwise.
 * @param {Object} props
 * @param {Date} props.deadline
 */
export default function ReminderBadge({ deadline }) {
  if (!deadline) return null;

  const now = Date.now();
  const msLeft = deadline.getTime() - now;
  const hoursLeft = msLeft / 36e5;
  const daysLeft = hoursLeft / 24;

  let colorVar = 'var(--green)';
  let bgVar = 'var(--green-muted)';
  let borderColor = 'var(--green-border)';

  if (hoursLeft < 0) {
    colorVar = 'var(--red)'; bgVar = 'var(--red-muted)'; borderColor = 'rgba(239, 71, 67, 0.25)';
  } else if (hoursLeft < 24) {
    colorVar = 'var(--red)'; bgVar = 'var(--red-muted)'; borderColor = 'rgba(239, 71, 67, 0.25)';
  } else if (hoursLeft < 72) {
    colorVar = 'var(--yellow)'; bgVar = 'var(--yellow-muted)'; borderColor = 'rgba(255, 192, 30, 0.25)';
  }

  let text = '';
  if (hoursLeft < 0) text = `Overdue by ${Math.abs(Math.round(hoursLeft))}h`;
  else if (hoursLeft < 24) text = `in ${Math.round(hoursLeft)} hours`;
  else text = `in ${Math.round(daysLeft)} days`;

  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      padding: '2px 8px',
      borderRadius: '4px',
      fontSize: '11px',
      fontWeight: 600,
      background: bgVar,
      color: colorVar,
      border: `1px solid ${borderColor}`,
      whiteSpace: 'nowrap'
    }}>
      {text}
    </span>
  );
}
