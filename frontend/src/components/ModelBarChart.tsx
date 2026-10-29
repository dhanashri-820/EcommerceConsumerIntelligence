import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { ModelMetrics } from '../lib/api';

interface ModelBarChartProps {
  metrics: ModelMetrics[];
  height?: number;
}

export const ModelBarChart: React.FC<ModelBarChartProps> = ({
  metrics,
  height = 320,
}) => {
  const chartData = metrics.map((m) => {
    let shortName = m.model;
    if (m.model.toLowerCase().includes('logistic')) shortName = 'LR';
    else if (m.model.toLowerCase().includes('svm')) shortName = 'SVM';
    else if (m.model.toLowerCase().includes('distilbert')) shortName = 'DistilBERT';

    return {
      name: shortName,
      fullName: m.model,
      accuracy: m.accuracy,
      macroF1: m.macroF1,
      weightedF1: m.weightedF1,
    };
  });

  return (
    <div className="w-full">
      {/* Top Legend Header */}
      <div className="flex items-center justify-end gap-5 mb-4 text-xs font-mono">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-sm bg-neon-cyan shadow-[0_0_8px_#22d3ee]" />
          <span className="text-slate-300">Accuracy</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-sm bg-neon-lime shadow-[0_0_8px_#a3e635]" />
          <span className="text-slate-300">Macro F1</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-sm bg-neon-violet shadow-[0_0_8px_#a78bfa]" />
          <span className="text-slate-300">Weighted F1</span>
        </div>
      </div>

      <div style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            barGap={6}
          >
            <CartesianGrid
              stroke="rgba(255, 255, 255, 0.06)"
              strokeDasharray="3 3"
              vertical={false}
            />
            <XAxis
              dataKey="name"
              stroke="#64748b"
              tick={{ fill: '#94a3b8', fontSize: 12, fontFamily: 'JetBrains Mono' }}
              tickLine={{ stroke: 'rgba(255,255,255,0.1)' }}
              axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
            />
            <YAxis
              domain={[0, 100]}
              ticks={[0, 25, 50, 75, 100]}
              stroke="#64748b"
              tick={{ fill: '#94a3b8', fontSize: 11, fontFamily: 'JetBrains Mono' }}
              tickLine={{ stroke: 'rgba(255,255,255,0.1)' }}
              axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
            />
            <Tooltip
              cursor={{ fill: 'rgba(255, 255, 255, 0.02)' }}
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div className="glass-panel px-3.5 py-2.5 rounded-lg border border-white/10 text-xs font-mono shadow-2xl">
                      <div className="text-white font-bold mb-2 pb-1 border-b border-white/10">
                        {data.fullName}
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center justify-between gap-4 text-neon-cyan">
                          <span>Accuracy:</span>
                          <span className="font-bold">{data.accuracy.toFixed(2)}%</span>
                        </div>
                        <div className="flex items-center justify-between gap-4 text-neon-lime">
                          <span>Macro F1:</span>
                          <span className="font-bold">{data.macroF1.toFixed(2)}%</span>
                        </div>
                        <div className="flex items-center justify-between gap-4 text-neon-violet">
                          <span>Weighted F1:</span>
                          <span className="font-bold">{data.weightedF1.toFixed(2)}%</span>
                        </div>
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar
              dataKey="accuracy"
              name="Accuracy"
              fill="#22d3ee"
              radius={[4, 4, 0, 0]}
              maxBarSize={32}
              isAnimationActive={true}
              animationDuration={900}
            />
            <Bar
              dataKey="macroF1"
              name="Macro F1"
              fill="#a3e635"
              radius={[4, 4, 0, 0]}
              maxBarSize={32}
              isAnimationActive={true}
              animationDuration={1100}
            />
            <Bar
              dataKey="weightedF1"
              name="Weighted F1"
              fill="#a78bfa"
              radius={[4, 4, 0, 0]}
              maxBarSize={32}
              isAnimationActive={true}
              animationDuration={1300}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
