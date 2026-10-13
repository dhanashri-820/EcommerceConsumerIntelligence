import React from 'react';

interface SentimentBadgeProps {
  sentiment: 'positive' | 'neutral' | 'negative' | string;
  confidence?: number;
  size?: 'sm' | 'md' | 'lg';
}

export const SentimentBadge: React.FC<SentimentBadgeProps> = ({
  sentiment,
  confidence,
  size = 'md'
}) => {
  const norm = (sentiment || '').toLowerCase();

  const styles = {
    positive: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
    neutral: 'bg-amber-50 text-amber-700 border-amber-200/80',
    negative: 'bg-rose-50 text-rose-700 border-rose-200/80',
  }[norm] || 'bg-slate-50 text-slate-700 border-slate-200';

  const dotColor = {
    positive: 'bg-emerald-500',
    neutral: 'bg-amber-500',
    negative: 'bg-rose-500',
  }[norm] || 'bg-slate-500';

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-[11px]',
    md: 'px-2.5 py-1 text-xs',
    lg: 'px-3.5 py-1.5 text-sm font-semibold'
  }[size];

  return (
    <span className={`inline-flex items-center gap-1.5 font-medium rounded-full border ${styles} ${sizeClasses}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />
      <span className="capitalize">{norm}</span>
      {confidence !== undefined && (
        <span className="text-[10px] opacity-75 font-semibold ml-0.5">
          ({(confidence * (confidence <= 1 ? 100 : 1)).toFixed(1)}%)
        </span>
      )}
    </span>
  );
};
