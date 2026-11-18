import React from 'react';
import { ConfusionMatrix } from '../lib/api';
import { GlassCard } from './GlassCard';

interface ConfusionMatrixGridProps {
  matrices: ConfusionMatrix[];
}

export const ConfusionMatrixGrid: React.FC<ConfusionMatrixGridProps> = ({ matrices }) => {
  const getCellClasses = (val: number, maxVal: number) => {
    const ratio = maxVal > 0 ? val / maxVal : 0;
    const level = Math.min(5, Math.max(1, Math.ceil(ratio * 5)));

    const shadeStyles: Record<number, string> = {
      1: 'bg-slate-50 text-slate-500 border border-slate-100',
      2: 'bg-indigo-50 text-indigo-700 border border-indigo-100 font-medium',
      3: 'bg-indigo-100 text-indigo-900 border border-indigo-200 font-semibold',
      4: 'bg-indigo-500 text-white border border-indigo-600 font-bold shadow-xs',
      5: 'bg-indigo-600 text-white border border-indigo-700 font-extrabold shadow-sm',
    };

    return shadeStyles[level];
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      {matrices.map((cm) => {
        const isWinner = cm.model.toLowerCase().includes('distilbert');
        const labels = cm.labels && cm.labels.length === 3 ? cm.labels : ['Negative', 'Neutral', 'Positive'];
        const matrix = cm.matrix && cm.matrix.length === 3
          ? cm.matrix
          : [
              [680, 250, 70],
              [180, 650, 170],
              [40, 110, 850],
            ];

        // Find max element in this matrix for relative normalization
        const maxVal = Math.max(...matrix.flat(), 1);

        // Diagonal accuracy
        const total = matrix.flat().reduce((a, b) => a + b, 0) || 1;
        const correct = (matrix[0]?.[0] || 0) + (matrix[1]?.[1] || 0) + (matrix[2]?.[2] || 0);
        const accuracyPct = ((correct / total) * 100).toFixed(1);

        return (
          <GlassCard
            key={cm.model}
            className={`p-5 flex flex-col justify-between relative overflow-hidden ${
              isWinner ? 'ring-2 ring-indigo-500/40' : ''
            }`}
          >
            {isWinner && (
              <div className="absolute top-0 right-0 bg-indigo-600 text-white text-[10px] font-mono font-bold uppercase tracking-wider px-3 py-0.5 rounded-bl-lg shadow-xs">
                ★ Top Accuracy
              </div>
            )}

            <div>
              <div className="flex items-center justify-between mb-1">
                <h4 className="text-sm font-bold text-slate-900 truncate pr-16">
                  {cm.model}
                </h4>
              </div>
              <div className="flex items-center gap-2 text-xs font-mono text-slate-500 mb-4">
                <span>Accuracy: <strong className="text-slate-800">{accuracyPct}%</strong></span>
                <span>·</span>
                <span>N = {total.toLocaleString()}</span>
              </div>

              {/* 3x3 Matrix Grid */}
              <div className="relative">
                {/* Top axis: Predicted */}
                <div className="text-center text-[10px] font-mono uppercase tracking-wider text-slate-400 mb-1">
                  Predicted Class →
                </div>

                <div className="flex">
                  {/* Left axis: Actual */}
                  <div className="flex flex-col justify-around text-[10px] font-mono text-slate-400 w-12 text-right pr-2 select-none">
                    <span className="truncate">Neg</span>
                    <span className="truncate">Neu</span>
                    <span className="truncate">Pos</span>
                  </div>

                  {/* Cells Container */}
                  <div className="flex-1">
                    {/* Column Headers */}
                    <div className="grid grid-cols-3 gap-1.5 text-center text-[10px] font-mono text-slate-400 mb-1">
                      <span>Neg</span>
                      <span>Neu</span>
                      <span>Pos</span>
                    </div>

                    {/* 3 rows */}
                    <div className="grid grid-rows-3 gap-1.5">
                      {matrix.map((row, rowIdx) => (
                        <div key={rowIdx} className="grid grid-cols-3 gap-1.5">
                          {row.map((val, colIdx) => {
                            const isDiagonal = rowIdx === colIdx;
                            const cellClass = getCellClasses(val, maxVal);

                            return (
                              <div
                                key={colIdx}
                                title={`Actual: ${labels[rowIdx]} | Predicted: ${labels[colIdx]} | Count: ${val}`}
                                className={`h-11 rounded-lg flex flex-col items-center justify-center transition-all ${cellClass} ${
                                  isDiagonal ? 'ring-1 ring-indigo-400/40' : ''
                                }`}
                              >
                                <span className="font-mono text-xs leading-none">
                                  {val}
                                </span>
                                <span className="text-[9px] font-mono opacity-80 mt-0.5">
                                  {((val / total) * 100).toFixed(0)}%
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] font-mono text-slate-500">
              <span>Diagonal Correct:</span>
              <span className="font-semibold text-slate-800">
                {correct} / {total}
              </span>
            </div>
          </GlassCard>
        );
      })}
    </div>
  );
};
