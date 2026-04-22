import React from 'react';

export default function EmptyState({ title, subtitle, emoji = "📝" }) {
  return (
    <div style={{
      padding: '40px 20px',
      textAlign: 'center',
      background: 'var(--bg-elevated)',
      border: '1px dashed var(--border-strong)',
      borderRadius: '10px'
    }}>
      <div style={{ fontSize: '32px', marginBottom: '12px' }}>{emoji}</div>
      <h3 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-1)', marginBottom: '6px' }}>{title}</h3>
      <p style={{ fontSize: '13px', color: 'var(--text-3)' }}>{subtitle}</p>
    </div>
  );
}
