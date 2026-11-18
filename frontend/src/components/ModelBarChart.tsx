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
          <span className="w-2.5 h-2.5 rounded-sm bg-sky-600" />
          <span className="text-slate-600">Accuracy</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-sm bg-emerald-600" />
          <span className="text-slate-600">Macro F1</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-sm bg-indigo-600" />
          <span className="text-slate-600">Weighted F1</span>
        </div>
      </div>

      <div style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
            <XAxis
              dataKey="name"
              stroke="#94a3b8"
              tick={{ fill: '#475569', fontSize: 12, fontFamily: 'monospace' }}
            />
            <YAxis
              domain={[50, 85]}
              stroke="#94a3b8"
              tick={{ fill: '#475569', fontSize: 11, fontFamily: 'monospace' }}
              tickFormatter={(v) => `${v}%`}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div className="bg-white p-3 rounded-lg shadow-xl border border-slate-200 text-xs font-mono">
                      <div className="text-slate-900 font-bold mb-2 pb-1 border-b border-slate-100">
                        {data.fullName}
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center justify-between gap-4 text-sky-700">
                          <span>Accuracy:</span>
                          <span className="font-bold">{data.accuracy}%</span>
                        </div>
                        <div className="flex items-center justify-between gap-4 text-emerald-700">
                          <span>Macro F1:</span>
                          <span className="font-bold">{data.macroF1}%</span>
                        </div>
                        <div className="flex items-center justify-between gap-4 text-indigo-700">
                          <span>Weighted F1:</span>
                          <span className="font-bold">{data.weightedF1}%</span>
                        </div>
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar dataKey="accuracy" fill="#0284c7" radius={[4, 4, 0, 0]} maxBarSize={38} />
            <Bar dataKey="macroF1" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={38} />
            <Bar dataKey="weightedF1" fill="#6366f1" radius={[4, 4, 0, 0]} maxBarSize={38} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
