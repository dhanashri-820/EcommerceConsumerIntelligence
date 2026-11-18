import React from 'react';
import { ModelMetrics } from '../lib/api';

interface PerClassF1BarsProps {
  metrics: ModelMetrics[];
}

export const PerClassF1Bars: React.FC<PerClassF1BarsProps> = ({ metrics }) => {
  const classes: Array<{ key: 'negative' | 'neutral' | 'positive'; label: string; badgeColor: string }> = [
    { key: 'negative', label: 'Negative Sentiment', badgeColor: 'text-rose-700 bg-rose-50 border-rose-200' },
    { key: 'neutral', label: 'Neutral Sentiment', badgeColor: 'text-amber-700 bg-amber-50 border-amber-200' },
    { key: 'positive', label: 'Positive Sentiment', badgeColor: 'text-emerald-700 bg-emerald-50 border-emerald-200' },
  ];

  const getModelColor = (modelName: string) => {
    const lower = modelName.toLowerCase();
    if (lower.includes('distilbert')) return '#4f46e5'; // indigo
    if (lower.includes('svm')) return '#0d9488'; // teal
    return '#0284c7'; // sky
  };

  return (
    <div className="space-y-6">
      {/* Legend */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-3 border-b border-slate-200">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          Metric: Per-Class F1 Score (%)
        </span>
        <div className="flex items-center gap-4 text-xs font-mono">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-sky-600" />
            <span className="text-slate-600">Logistic Regression</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-teal-600" />
            <span className="text-slate-600">Linear SVM</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-indigo-600" />
            <span className="text-slate-600 font-semibold">DistilBERT</span>
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
                  <span className="w-36 text-xs font-mono text-slate-600 truncate">
                    {m.model}
                  </span>
                  <div className="flex-1 h-3 bg-slate-100 rounded-full overflow-hidden relative border border-slate-200/80">
                    <div
                      className="h-full rounded-full transition-all duration-700 ease-out"
                      style={{
                        width: `${Math.min(100, Math.max(0, val))}%`,
                        backgroundColor: color,
                      }}
                    />
                  </div>
                  <span className="w-14 text-right text-xs font-mono font-bold text-slate-800">
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
