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
    { name: 'Positive', value: distribution.positive, color: '#10b981', pct: posPct },
    { name: 'Neutral', value: distribution.neutral, color: '#f59e0b', pct: neuPct },
    { name: 'Negative', value: distribution.negative, color: '#ef4444', pct: negPct },
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
                    <div className="bg-white px-3 py-2 rounded-lg text-xs shadow-lg border border-slate-200 font-mono">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                        <span className="text-slate-900 font-semibold">{item.name}</span>
                      </div>
                      <div className="text-slate-500">
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
              cx="50%"
              cy="50%"
              innerRadius={72}
              outerRadius={95}
              paddingAngle={4}
              dataKey="value"
              stroke="#ffffff"
              strokeWidth={3}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>

        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-2xl font-extrabold font-mono text-slate-900 tracking-tight">
            {total.toLocaleString()}
          </span>
          <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400">
            Reviews
          </span>
        </div>
      </div>

      {/* Legend list */}
      <div className="w-full sm:w-1/2 space-y-3">
        {chartData.map((item) => (
          <div
            key={item.name}
            className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-200/80 hover:bg-slate-100/70 transition-colors"
          >
            <div className="flex items-center gap-2.5">
              <span className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
              <span className="text-xs font-semibold text-slate-700">{item.name}</span>
            </div>
            <div className="flex items-center gap-3 font-mono text-xs">
              <span className="text-slate-500 font-medium">{item.value.toLocaleString()}</span>
              <span className="text-slate-900 font-bold w-12 text-right">{item.pct}%</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
