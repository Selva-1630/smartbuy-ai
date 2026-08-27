import React from 'react';

interface ScoreBadgeProps {
  score: number;
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export const ScoreBadge: React.FC<ScoreBadgeProps> = ({
  score,
  label = 'Value Score',
  size = 'md',
  showLabel = true,
}) => {
  let colorBg = 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30';
  let badgeColor = 'text-emerald-500';

  if (score >= 90) {
    colorBg = 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-700/50';
    badgeColor = 'text-emerald-600 dark:text-emerald-400';
  } else if (score >= 80) {
    colorBg = 'bg-blue-500/10 text-blue-600 border-blue-500/30 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-700/50';
    badgeColor = 'text-blue-600 dark:text-blue-400';
  } else if (score >= 70) {
    colorBg = 'bg-amber-500/10 text-amber-600 border-amber-500/30 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-700/50';
    badgeColor = 'text-amber-600 dark:text-amber-400';
  } else {
    colorBg = 'bg-slate-500/10 text-slate-600 border-slate-500/30 dark:bg-slate-800/40 dark:text-slate-400 dark:border-slate-700/50';
    badgeColor = 'text-slate-600 dark:text-slate-400';
  }

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-xs',
    lg: 'px-3.5 py-1.5 text-sm font-semibold',
  };

  return (
    <div className={`inline-flex items-center gap-1.5 rounded-full border font-medium ${sizeClasses[size]} ${colorBg}`}>
      <span className={`font-bold ${badgeColor}`}>{score}</span>
      <span className="opacity-70">/ 100</span>
      {showLabel && <span className="font-normal opacity-90 pl-0.5">· {label}</span>}
    </div>
  );
};
