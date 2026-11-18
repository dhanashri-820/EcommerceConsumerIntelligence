import React from 'react';
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import { AspectSummary } from '../lib/api';

interface AspectRadarProps {
  aspects: AspectSummary[];
  height?: number;
}

export const AspectRadar: React.FC<AspectRadarProps> = ({
  aspects,
  height = 320,
}) => {
  const orderedAspects: Array<AspectSummary['aspect']> = [
    'Quality',
    'Price',
    'Delivery',
    'Durability',
    'Design',
    'Usability',
  ];

  const chartData = orderedAspects.map((aspectName) => {
    const found = aspects.find((a) => a.aspect === aspectName);
    const pos = found?.positive || 0;
    const neu = found?.neutral || 0;
    const neg = found?.negative || 0;
    const total = pos + neu + neg;
    const positiveRate = total > 0 ? Math.round((pos / total) * 100) : 0;

    return {
      aspect: aspectName,
      positiveRate,
      positive: pos,
      neutral: neu,
      negative: neg,
      total,
    };
  });

  return (
    <div className="w-full flex flex-col items-center justify-center">
      <div style={{ width: '100%', height }}>
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="75%" data={chartData}>
            <PolarGrid stroke="#e2e8f0" strokeDasharray="3 3" />
            <PolarAngleAxis
              dataKey="aspect"
              stroke="#64748b"
              tick={{ fill: '#334155', fontSize: 12, fontWeight: 600 }}
            />
            <PolarRadiusAxis
              angle={30}
              domain={[0, 100]}
              stroke="#cbd5e1"
              tick={{ fill: '#64748b', fontSize: 10, fontFamily: 'monospace' }}
              tickFormatter={(v) => `${v}%`}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div className="bg-white p-3 rounded-lg shadow-lg border border-slate-200 text-xs font-mono">
                      <div className="text-slate-900 font-bold mb-1 pb-1 border-b border-slate-100 flex items-center justify-between gap-4">
                        <span>{data.aspect}</span>
                        <span className="text-indigo-600 font-bold">{data.positiveRate}% Pos</span>
                      </div>
                      <div className="space-y-0.5 text-slate-500">
                        <div>Positive: {data.positive}</div>
                        <div>Neutral: {data.neutral}</div>
                        <div>Negative: {data.negative}</div>
                        <div className="text-[10px] text-slate-400 pt-1">Total: {data.total} mentions</div>
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Radar
              name="Positive Rate"
              dataKey="positiveRate"
              stroke="#4f46e5"
              fill="#6366f1"
              fillOpacity={0.25}
              strokeWidth={2}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
