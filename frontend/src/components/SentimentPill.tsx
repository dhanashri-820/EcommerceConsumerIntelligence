import React from 'react';
import { Sentiment } from '../lib/api';

interface SentimentPillProps {
  sentiment: Sentiment | string;
  size?: 'sm' | 'md' | 'lg';
  showDot?: boolean;
}

export const SentimentPill: React.FC<SentimentPillProps> = ({
  sentiment,
  size = 'md',
  showDot = true,
}) => {
  const norm = String(sentiment).toUpperCase() as Sentiment;

  let colorClasses = 'bg-amber-50 text-amber-800 border-amber-200';
  let dotColor = 'bg-amber-500';

  if (norm === 'POSITIVE') {
    colorClasses = 'bg-emerald-50 text-emerald-800 border-emerald-200';
    dotColor = 'bg-emerald-500';
  } else if (norm === 'NEGATIVE') {
    colorClasses = 'bg-rose-50 text-rose-800 border-rose-200';
    dotColor = 'bg-rose-500';
  }

  const sizeClasses = {
    sm: 'text-[10px] px-2 py-0.5 gap-1.5',
    md: 'text-xs px-2.5 py-1 gap-2',
    lg: 'text-sm px-3.5 py-1.5 gap-2.5 font-semibold',
  }[size];

  return (
    <span
      className={`inline-flex items-center rounded-full font-mono uppercase tracking-wider border font-medium transition-all shadow-xs ${colorClasses} ${sizeClasses}`}
    >
      {showDot && <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />}
      {norm}
    </span>
  );
};
