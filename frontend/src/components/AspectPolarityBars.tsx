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
      <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
        <span className="text-xs font-semibold uppercase tracking-widest text-slate-400">
          Aspect Polarity Ratios
        </span>
        <div className="flex items-center gap-3 text-xs font-mono">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-neon-lime" />
            <span className="text-slate-300">Pos %</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-neon-amber" />
            <span className="text-slate-300">Neu %</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-neon-red" />
            <span className="text-slate-300">Neg %</span>
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
              <span className="w-24 text-xs font-semibold text-slate-200 truncate font-mono">
                {aspectName}
              </span>

              {/* 3-segment bar with subtle glow on hover */}
              <div
                className="flex-1 h-3.5 bg-white/[0.05] rounded-full overflow-hidden flex transition-all duration-300 group-hover:ring-1 group-hover:ring-white/20"
                title={`${aspectName}: ${posPct}% Pos (${pos}), ${neuPct}% Neu (${neu}), ${negPct}% Neg (${neg})`}
              >
                {posPct > 0 && (
                  <div
                    className="h-full bg-neon-lime transition-all duration-700 ease-out"
                    style={{
                      width: `${posPct}%`,
                      boxShadow: '0 0 8px rgba(163,230,53,0.4)',
                    }}
                  />
                )}
                {neuPct > 0 && (
                  <div
                    className="h-full bg-neon-amber transition-all duration-700 ease-out"
                    style={{
                      width: `${neuPct}%`,
                      boxShadow: '0 0 8px rgba(251,191,36,0.4)',
                    }}
                  />
                )}
                {negPct > 0 && (
                  <div
                    className="h-full bg-neon-red transition-all duration-700 ease-out"
                    style={{
                      width: `${negPct}%`,
                      boxShadow: '0 0 8px rgba(248,113,113,0.4)',
                    }}
                  />
                )}
              </div>

              {/* Mono ratio at right end */}
              <div className="w-24 text-right text-xs font-mono font-bold tracking-tight">
                <span className="text-neon-lime">{posPct}</span>
                <span className="text-slate-500 mx-0.5">/</span>
                <span className="text-neon-amber">{neuPct}</span>
                <span className="text-slate-500 mx-0.5">/</span>
                <span className="text-neon-red">{negPct}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
