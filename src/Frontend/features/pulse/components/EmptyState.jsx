import React from 'react';

export default function EmptyState({ title, subtitle, emoji = "📝" }) {
  return (
    <div className="flex flex-col items-center justify-center text-center p-6 border border-zinc-100 dark:border-zinc-800 rounded-xl bg-zinc-50/50 dark:bg-zinc-900/50 min-h-[120px]">
      <div className="text-3xl mb-2 opacity-40">{emoji}</div>
      <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400 mb-1">{title}</p>
      <p className="text-xs text-zinc-400 dark:text-zinc-500">{subtitle}</p>
    </div>
  );
}
