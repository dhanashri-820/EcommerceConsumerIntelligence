import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

interface DonutChartProps {
  distribution: {
    positive: number;
    neutral: number;
    negative: number;
  };
  positivePct?: number;
  neutralPct?: number;
  negativePct?: number;
  height?: number;
}

export const DonutChart: React.FC<DonutChartProps> = ({
  distribution,
  positivePct,
  neutralPct,
  negativePct,
  height = 290,
}) => {
  const total = (distribution.positive + distribution.neutral + distribution.negative) || 1;

  const posPct = positivePct ?? Math.round((distribution.positive / total) * 100);
  const neuPct = neutralPct ?? Math.round((distribution.neutral / total) * 100);
  const negPct = negativePct ?? (100 - posPct - neuPct);

  const chartData = [
    { name: 'Positive', value: distribution.positive, color: '#a3e635', pct: posPct },
    { name: 'Neutral', value: distribution.neutral, color: '#fbbf24', pct: neuPct },
    { name: 'Negative', value: distribution.negative, color: '#f87171', pct: negPct },
  ];

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-6 w-full">
      {/* Chart container with absolute centered label */}
      <div className="relative w-full sm:w-1/2 flex items-center justify-center" style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const item = payload[0].payload;
                  return (
                    <div className="glass-panel px-3 py-2 rounded-lg text-xs shadow-xl border border-white/10 font-mono">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                        <span className="text-white font-semibold">{item.name}</span>
                      </div>
                      <div className="text-slate-300">
                        {item.value.toLocaleString()} reviews ({item.pct}%)
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={70}
              outerRadius={95}
              stroke="rgba(5, 7, 13, 0.9)"
              strokeWidth={4}
              startAngle={90}
              endAngle={-270}
              isAnimationActive={true}
              animationDuration={800}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>

        {/* Center label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-3xl font-extrabold font-mono tracking-tight text-white">
            {posPct}%
          </span>
          <span className="text-[11px] uppercase tracking-widest text-neon-lime font-semibold">
            Positive
          </span>
        </div>
      </div>

      {/* Custom legend with mono percentages */}
      <div className="w-full sm:w-1/2 flex flex-col gap-3 pr-2">
        {chartData.map((slice) => (
          <div
            key={slice.name}
            className="flex items-center justify-between p-2.5 rounded-lg bg-white/[0.02] border border-white/[0.04] hover:border-white/10 transition-colors"
          >
            <div className="flex items-center gap-2.5">
              <span
                className="w-2.5 h-2.5 rounded-full"
                style={{
                  backgroundColor: slice.color,
                  boxShadow: `0 0 10px ${slice.color}66`,
                }}
              />
              <span className="text-xs font-medium text-slate-300">{slice.name}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs font-mono text-slate-400">
                {slice.value.toLocaleString()}
              </span>
              <span
                className="text-xs font-mono font-bold w-12 text-right"
                style={{ color: slice.color }}
              >
                {slice.pct}%
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
