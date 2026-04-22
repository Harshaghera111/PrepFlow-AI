import React from 'react';

export default function EmptyState({ title, subtitle, emoji = "📝" }) {
  return (
    <div style={{
      padding: '32px 20px',
      textAlign: 'center',
      background: 'var(--bg-elevated)',
      border: '1px dashed var(--border-strong)',
      borderRadius: '10px'
    }}>
      <div style={{ fontSize: '28px', marginBottom: '10px', opacity: 0.5 }}>{emoji}</div>
      <p style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-2)', marginBottom: '4px' }}>{title}</p>
      <p style={{ fontSize: '12px', color: 'var(--text-3)' }}>{subtitle}</p>
    </div>
  );
}
