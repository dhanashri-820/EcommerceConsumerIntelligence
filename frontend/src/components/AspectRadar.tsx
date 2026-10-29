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
      <div className="w-full" style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="75%" data={chartData}>
            <PolarGrid
              stroke="rgba(255, 255, 255, 0.08)"
              gridType="polygon"
            />
            <PolarAngleAxis
              dataKey="aspect"
              tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 500 }}
            />
            <PolarRadiusAxis
              angle={30}
              domain={[0, 100]}
              ticks={['25', '50', '75', '100'] as any}
              stroke="rgba(255, 255, 255, 0.2)"
              tick={{ fill: '#64748b', fontSize: 10, fontFamily: 'JetBrains Mono' }}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div className="glass-panel px-3.5 py-2.5 rounded-lg border border-neon-cyan/30 text-xs font-mono shadow-2xl">
                      <div className="text-white font-bold mb-1">{data.aspect}</div>
                      <div className="text-neon-cyan font-bold mb-1">
                        Positive Ratio: {data.positiveRate}%
                      </div>
                      <div className="text-[11px] text-slate-400 space-y-0.5">
                        <div>+ Pos: {data.positive}</div>
                        <div>~ Neu: {data.neutral}</div>
                        <div>- Neg: {data.negative}</div>
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
              stroke="#22d3ee"
              strokeWidth={2}
              fill="rgba(34, 211, 238, 0.2)"
              fillOpacity={0.6}
              isAnimationActive={true}
              animationDuration={800}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      <div className="text-center text-[11px] font-mono text-slate-400 mt-1">
        Axis metric: Aspect Positive Sentiment Percentage (0 - 100%)
      </div>
    </div>
  );
};
