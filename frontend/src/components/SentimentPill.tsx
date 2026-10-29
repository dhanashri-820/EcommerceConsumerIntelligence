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

  let colorClasses = 'bg-amber-400/20 text-amber-300 border-amber-400/40';
  let dotColor = 'bg-amber-400';

  if (norm === 'POSITIVE') {
    colorClasses = 'bg-lime-400/20 text-lime-300 border-lime-400/40';
    dotColor = 'bg-lime-400 shadow-[0_0_8px_#a3e635]';
  } else if (norm === 'NEGATIVE') {
    colorClasses = 'bg-red-500/20 text-red-300 border-red-400/40';
    dotColor = 'bg-red-500 shadow-[0_0_8px_#f87171]';
  } else {
    dotColor = 'bg-amber-400 shadow-[0_0_8px_#fbbf24]';
  }

  const sizeClasses = {
    sm: 'text-[10px] px-2 py-0.5 gap-1.5',
    md: 'text-xs px-2.5 py-1 gap-2',
    lg: 'text-sm px-3.5 py-1.5 gap-2.5 font-semibold',
  }[size];

  return (
    <span
      className={`inline-flex items-center rounded-full font-mono uppercase tracking-wider border font-medium transition-all ${colorClasses} ${sizeClasses}`}
    >
      {showDot && <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />}
      {norm}
    </span>
  );
};
