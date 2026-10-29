import React from 'react';
import { ModelMetrics } from '../lib/api';

interface PerClassF1BarsProps {
  metrics: ModelMetrics[];
}

export const PerClassF1Bars: React.FC<PerClassF1BarsProps> = ({ metrics }) => {
  const classes: Array<{ key: 'negative' | 'neutral' | 'positive'; label: string; badgeColor: string }> = [
    { key: 'negative', label: 'Negative Sentiment', badgeColor: 'text-neon-red bg-neon-red/10 border-neon-red/30' },
    { key: 'neutral', label: 'Neutral Sentiment', badgeColor: 'text-neon-amber bg-neon-amber/10 border-neon-amber/30' },
    { key: 'positive', label: 'Positive Sentiment', badgeColor: 'text-neon-lime bg-neon-lime/10 border-neon-lime/30' },
  ];

  const getModelColor = (modelName: string) => {
    const lower = modelName.toLowerCase();
    if (lower.includes('distilbert')) return '#a78bfa'; // violet
    if (lower.includes('svm')) return '#a3e635'; // lime
    return '#22d3ee'; // cyan
  };

  return (
    <div className="space-y-6">
      {/* Legend */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-3 border-b border-white/[0.06]">
        <span className="text-xs font-semibold uppercase tracking-widest text-slate-400">
          Metric: Per-Class F1 Score (%)
        </span>
        <div className="flex items-center gap-4 text-xs font-mono">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-neon-cyan" />
            <span className="text-slate-300">Logistic Regression</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-neon-lime" />
            <span className="text-slate-300">Linear SVM</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-neon-violet" />
            <span className="text-slate-300">DistilBERT</span>
          </div>
        </div>
      </div>

      {classes.map((cls) => (
        <div key={cls.key} className="space-y-2.5">
          <div className="flex items-center justify-between">
            <span className={`text-xs font-mono px-2.5 py-0.5 rounded-full border uppercase tracking-wider font-semibold ${cls.badgeColor}`}>
              {cls.label}
            </span>
          </div>

          <div className="space-y-2 pl-1">
            {metrics.map((m) => {
              const val = m.perClassF1?.[cls.key] ?? 0;
              const color = getModelColor(m.model);

              return (
                <div key={m.model} className="flex items-center gap-3">
                  <span className="w-28 text-xs font-mono text-slate-400 truncate">
                    {m.model}
                  </span>
                  <div className="flex-1 h-3 bg-white/[0.06] rounded-full overflow-hidden relative">
                    <div
                      className="h-full rounded-full transition-all duration-700 ease-out"
                      style={{
                        width: `${Math.min(100, Math.max(0, val))}%`,
                        backgroundColor: color,
                        boxShadow: `0 0 10px ${color}88`,
                      }}
                    />
                  </div>
                  <span
                    className="w-14 text-right text-xs font-mono font-bold"
                    style={{ color }}
                  >
                    {val.toFixed(2)}%
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};
