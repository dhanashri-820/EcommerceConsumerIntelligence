import React, { useState, useEffect } from 'react';
import { 
  Grid, 
  Layers, 
  Download, 
  Printer, 
  Sparkles, 
  Info, 
  TrendingUp, 
  TrendingDown,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Legend 
} from 'recharts';
import { 
  fetchAspectHeatmap, 
  AspectHeatmapData, 
  exportToCsv, 
  triggerPrintReport 
} from '../services/api';

export const AspectHeatmapView: React.FC = () => {
  const [data, setData] = useState<AspectHeatmapData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedAspect, setSelectedAspect] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      const res = await fetchAspectHeatmap();
      setData(res);
      setIsLoading(false);
    }
    loadData();
  }, []);

  const handleExportCsv = () => {
    if (!data?.aspect_totals) return;
    exportToCsv('aspect_sentiment_heatmap.csv', data.aspect_totals);
  };

  // Helper for heatmap cell color
  const getCellBg = (netScore: number): string => {
    if (netScore >= 20) return 'bg-emerald-500/20 text-emerald-800 border-emerald-300';
    if (netScore > 0) return 'bg-emerald-400/10 text-emerald-700 border-emerald-200';
    if (netScore === 0) return 'bg-slate-100 text-slate-700 border-slate-200';
    if (netScore >= -25) return 'bg-amber-500/15 text-amber-800 border-amber-300';
    return 'bg-rose-500/20 text-rose-800 border-rose-300';
  };

  if (isLoading || !data) {
    return (
      <div className="h-96 flex flex-col items-center justify-center gap-3 text-slate-400">
        <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs font-medium">Synthesizing multi-aspect sentiment heatmaps...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
              ABSA Deep Dive
            </span>
            <span className="text-xs text-slate-500">6 Product Dimensions Tracked</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 mt-1">Aspect-Based Sentiment Heatmap Matrix</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Cross-tabulated clause opinions isolating Quality, Price, Delivery, Durability, Design, and Usability.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => triggerPrintReport('Aspect Sentiment Heatmap')}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Report</span>
          </button>
          <button
            onClick={handleExportCsv}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Heatmap Grid Matrix */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">Net Sentiment Score Heatmap (% Pos &minus; % Neg)</h3>
            <p className="text-xs text-slate-500">Color density reflects customer praise vs negative friction for each domain aspect.</p>
          </div>
          <div className="hidden sm:flex items-center gap-3 text-xs text-slate-500">
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-emerald-500/30 border border-emerald-400"></span> Positive Net</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-amber-500/25 border border-amber-400"></span> Moderate Friction</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-rose-500/30 border border-rose-400"></span> Severe Pain Point</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-600 text-xs font-semibold">
                <th className="py-3 px-4">Aspect Dimension</th>
                {data.categories.map((cat) => (
                  <th key={cat} className="py-3 px-4 text-center">{cat}</th>
                ))}
                <th className="py-3 px-4 text-center bg-indigo-50/50 text-indigo-900">Overall Net Sentiment</th>
                <th className="py-3 px-4 text-right">Total Mentions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {data.matrix.map((row) => {
                const totalItem = data.aspect_totals.find((t) => t.aspect === row.aspect);
                const overallNet = totalItem ? totalItem.net_sentiment : 0;
                const isSelected = selectedAspect === row.aspect;

                return (
                  <tr 
                    key={row.aspect} 
                    onClick={() => setSelectedAspect(isSelected ? null : row.aspect)}
                    className={`cursor-pointer transition-colors ${isSelected ? 'bg-indigo-50/40' : 'hover:bg-slate-50/80'}`}
                  >
                    <td className="py-3 px-4 font-bold text-slate-900 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-indigo-600" />
                      {row.aspect}
                    </td>

                    {data.categories.map((cat) => {
                      const cell = row[cat] || { net: 0, pos: 0, neg: 0, neu: 0, total: 0 };
                      return (
                        <td key={cat} className="py-3 px-3 text-center">
                          <div className={`py-1.5 px-2.5 rounded-lg border font-bold text-xs inline-block transition-transform hover:scale-105 ${getCellBg(cell.net)}`}>
                            {cell.net > 0 ? `+${cell.net}%` : `${cell.net}%`}
                            <span className="block text-[9px] font-normal text-slate-500 mt-0.5">
                              {cell.pos}P / {cell.neg}N
                            </span>
                          </div>
                        </td>
                      );
                    })}

                    <td className="py-3 px-4 text-center bg-indigo-50/30">
                      <span className={`px-2.5 py-1 rounded-lg font-bold text-xs ${overallNet >= 0 ? 'text-emerald-700 bg-emerald-100' : 'text-rose-700 bg-rose-100'}`}>
                        {overallNet > 0 ? `+${overallNet}%` : `${overallNet}%`}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-right font-semibold text-slate-700">
                      {totalItem ? totalItem.total.toLocaleString() : '-'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Stacked Aspect Sentiment Distribution Bar Chart */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div>
          <h3 className="text-base font-bold text-slate-900">Total Sentiment Volume by Aspect</h3>
          <p className="text-xs text-slate-500">Distribution of positive, neutral, and negative customer opinion clauses across all 6 aspects.</p>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.aspect_totals} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 11, fill: '#64748b' }} />
              <YAxis dataKey="aspect" type="category" tick={{ fontSize: 11, fill: '#64748b', fontWeight: 600 }} width={80} />
              <Tooltip 
                formatter={(val: any, name: any) => [`${val} clauses`, name]}
                contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px' }}
              />
              <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
              <Bar dataKey="positive" name="Positive" stackId="a" fill="#10B981" radius={[0, 0, 0, 0]} />
              <Bar dataKey="neutral" name="Neutral" stackId="a" fill="#F59E0B" radius={[0, 0, 0, 0]} />
              <Bar dataKey="negative" name="Negative" stackId="a" fill="#EF4444" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Aspect Key Takeaways Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-emerald-50/60 border border-emerald-200/80 p-5 rounded-2xl space-y-2">
          <div className="flex items-center gap-2 text-emerald-800 font-bold text-sm">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            Top Praised Aspect: Usability & Design
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Customers consistently praise ease of operation and countertop aesthetics (+41.2% Net Sentiment in Usability and +24.9% in Design). Maintain intuitive one-touch controls and modern matte finishes.
          </p>
        </div>

        <div className="bg-rose-50/60 border border-rose-200/80 p-5 rounded-2xl space-y-2">
          <div className="flex items-center gap-2 text-rose-800 font-bold text-sm">
            <AlertTriangle className="w-4 h-4 text-rose-600" />
            Highest Friction Aspect: Durability & Price
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Durability exhibits the lowest sentiment (&minus;52.9% Net Sentiment), primarily driven by premature plastic coupling failure within weeks. Reinforcing stress-bearing components directly resolves these 1-star reviews.
          </p>
        </div>
      </div>
    </div>
  );
};
