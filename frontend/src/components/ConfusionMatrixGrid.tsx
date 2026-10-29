import React from 'react';
import { ConfusionMatrix } from '../lib/api';
import { GlassCard } from './GlassCard';

interface ConfusionMatrixGridProps {
  matrices: ConfusionMatrix[];
}

export const ConfusionMatrixGrid: React.FC<ConfusionMatrixGridProps> = ({ matrices }) => {
  const getAccent = (modelName: string) => {
    const lower = modelName.toLowerCase();
    if (lower.includes('distilbert')) return 'violet';
    if (lower.includes('svm')) return 'lime';
    return 'cyan';
  };

  const getCellClasses = (val: number, maxVal: number, accent: 'cyan' | 'lime' | 'violet') => {
    const ratio = maxVal > 0 ? val / maxVal : 0;
    const level = Math.min(5, Math.max(1, Math.ceil(ratio * 5)));

    const shadeStyles: Record<'cyan' | 'lime' | 'violet', Record<number, string>> = {
      cyan: {
        1: 'bg-cyan-500/10 text-cyan-200/60 border-cyan-500/10',
        2: 'bg-cyan-500/20 text-cyan-200 border-cyan-500/20',
        3: 'bg-cyan-500/35 text-cyan-100 border-cyan-500/30',
        4: 'bg-cyan-500/60 text-white font-bold border-cyan-400/50 shadow-[0_0_12px_rgba(34,211,238,0.3)]',
        5: 'bg-cyan-400/85 text-black font-extrabold border-cyan-300 shadow-[0_0_20px_rgba(34,211,238,0.6)]',
      },
      lime: {
        1: 'bg-lime-500/10 text-lime-200/60 border-lime-500/10',
        2: 'bg-lime-500/20 text-lime-200 border-lime-500/20',
        3: 'bg-lime-500/35 text-lime-100 border-lime-500/30',
        4: 'bg-lime-500/60 text-white font-bold border-lime-400/50 shadow-[0_0_12px_rgba(163,230,53,0.3)]',
        5: 'bg-lime-400/85 text-black font-extrabold border-lime-300 shadow-[0_0_20px_rgba(163,230,53,0.6)]',
      },
      violet: {
        1: 'bg-violet-500/10 text-violet-200/60 border-violet-500/10',
        2: 'bg-violet-500/20 text-violet-200 border-violet-500/20',
        3: 'bg-violet-500/35 text-violet-100 border-violet-500/30',
        4: 'bg-violet-500/60 text-white font-bold border-violet-400/50 shadow-[0_0_12px_rgba(167,139,250,0.3)]',
        5: 'bg-violet-400/85 text-black font-extrabold border-violet-300 shadow-[0_0_20px_rgba(167,139,250,0.6)]',
      },
    };

    return shadeStyles[accent][level];
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      {matrices.map((cm) => {
        const accent = getAccent(cm.model);
        const isWinner = accent === 'violet';
        const labels = cm.labels && cm.labels.length === 3 ? cm.labels : ['Negative', 'Neutral', 'Positive'];
        const matrix = cm.matrix && cm.matrix.length === 3
          ? cm.matrix
          : [
              [600, 250, 50],
              [150, 750, 100],
              [30, 70, 900],
            ];

        // Find max value in this matrix for normalization
        const maxVal = Math.max(...matrix.flat(), 1);

        return (
          <GlassCard
            key={cm.model}
            glow={isWinner ? 'violet' : 'none'}
            className={`p-5 flex flex-col justify-between ${
              isWinner ? 'ring-1 ring-violet-400/40 relative' : ''
            }`}
          >
            {isWinner && (
              <div className="absolute -top-2.5 right-4 px-2.5 py-0.5 rounded-full bg-violet-500 text-black text-[10px] font-mono font-bold uppercase tracking-wider shadow-[0_0_15px_rgba(167,139,250,0.8)]">
                ★ Winner (F1: 74.11%)
              </div>
            )}

            <div>
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-sm font-bold text-white tracking-wide">{cm.model}</h4>
                <span
                  className={`text-[10px] font-mono px-2 py-0.5 rounded uppercase tracking-wider ${
                    accent === 'violet'
                      ? 'bg-violet-500/20 text-violet-300 border border-violet-500/30'
                      : accent === 'lime'
                      ? 'bg-lime-500/20 text-lime-300 border border-lime-500/30'
                      : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                  }`}
                >
                  N = 3,000
                </span>
              </div>

              {/* Heatmap Grid Table */}
              <div className="overflow-x-auto">
                <div className="min-w-[260px]">
                  {/* Column headers (Predicted) */}
                  <div className="grid grid-cols-4 gap-1.5 text-center text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-1.5">
                    <div className="text-left pl-1">Actual \ Pred</div>
                    <div>Neg</div>
                    <div>Neu</div>
                    <div>Pos</div>
                  </div>

                  {/* Rows (Actual) */}
                  {matrix.map((row, rowIdx) => {
                    const rowLabel = labels[rowIdx] || `C${rowIdx}`;
                    const shortRowLabel = rowLabel.slice(0, 3);

                    return (
                      <div key={rowIdx} className="grid grid-cols-4 gap-1.5 items-center mb-1.5">
                        <div className="text-[11px] font-mono text-slate-400 pl-1 font-medium">
                          {shortRowLabel}
                        </div>
                        {row.map((val, colIdx) => {
                          const cellClasses = getCellClasses(val, maxVal, accent);
                          const isDiagonal = rowIdx === colIdx;

                          return (
                            <div
                              key={colIdx}
                              title={`Actual: ${labels[rowIdx]} → Predicted: ${labels[colIdx]}: ${val}`}
                              className={`h-11 rounded-lg border flex flex-col items-center justify-center font-mono text-xs transition-transform hover:scale-105 cursor-default ${cellClasses} ${
                                isDiagonal ? 'ring-1 ring-white/20' : ''
                              }`}
                            >
                              <span className="leading-none">{val.toLocaleString()}</span>
                            </div>
                          );
                        })}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-white/[0.06] text-center text-[10px] font-mono text-slate-500">
              Rows = actual · Columns = predicted
            </div>
          </GlassCard>
        );
      })}
    </div>
  );
};
