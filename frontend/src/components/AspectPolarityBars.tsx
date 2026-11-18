import React from 'react';
import { AspectSummary } from '../lib/api';

interface AspectPolarityBarsProps {
  aspects: AspectSummary[];
}

export const AspectPolarityBars: React.FC<AspectPolarityBarsProps> = ({ aspects }) => {
  const orderedAspects: Array<AspectSummary['aspect']> = [
    'Quality',
    'Price',
    'Delivery',
    'Durability',
    'Design',
    'Usability',
  ];

  return (
    <div className="space-y-4">
      {/* Legend & Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-200">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          Aspect Polarity Ratios
        </span>
        <div className="flex items-center gap-3 text-xs font-mono">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span className="text-slate-600 font-medium">Pos %</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            <span className="text-slate-600 font-medium">Neu %</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
            <span className="text-slate-600 font-medium">Neg %</span>
          </div>
        </div>
      </div>

      <div className="space-y-3.5">
        {orderedAspects.map((aspectName) => {
          const item = aspects.find((a) => a.aspect === aspectName);
          const pos = item?.positive || 0;
          const neu = item?.neutral || 0;
          const neg = item?.negative || 0;
          const total = pos + neu + neg || 1;

          const posPct = Math.round((pos / total) * 100);
          const neuPct = Math.round((neu / total) * 100);
          const negPct = Math.max(0, 100 - posPct - neuPct);

          return (
            <div key={aspectName} className="flex items-center gap-3 group">
              <span className="w-24 text-xs font-semibold text-slate-700 truncate font-mono">
                {aspectName}
              </span>

              {/* 3-segment bar with clean appearance */}
              <div className="flex-1 h-3 rounded-full overflow-hidden flex bg-slate-100 border border-slate-200">
                <div
                  style={{ width: `${posPct}%` }}
                  className="bg-emerald-500 transition-all duration-500 hover:brightness-105"
                  title={`Positive: ${posPct}%`}
                />
                <div
                  style={{ width: `${neuPct}%` }}
                  className="bg-amber-400 transition-all duration-500 hover:brightness-105"
                  title={`Neutral: ${neuPct}%`}
                />
                <div
                  style={{ width: `${negPct}%` }}
                  className="bg-rose-500 transition-all duration-500 hover:brightness-105"
                  title={`Negative: ${negPct}%`}
                />
              </div>

              {/* Numeric percent label */}
              <div className="w-24 text-right text-xs font-mono font-medium text-slate-500 flex justify-end gap-1.5">
                <span className="text-emerald-700 font-semibold">{posPct}%</span>
                <span className="text-slate-300">/</span>
                <span className="text-rose-700 font-semibold">{negPct}%</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
