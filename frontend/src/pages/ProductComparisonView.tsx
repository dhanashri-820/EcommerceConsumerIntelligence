import React, { useState, useEffect } from 'react';
import { 
  GitCompare, 
  Trophy, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle, 
  Download, 
  Printer, 
  ShieldCheck, 
  Star, 
  ThumbsUp, 
  ThumbsDown 
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
  compareProducts, 
  ProductComparisonResponse, 
  exportToCsv, 
  triggerPrintReport 
} from '../services/api';

export const ProductComparisonView: React.FC = () => {
  const [data, setData] = useState<ProductComparisonResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [itemA, setItemA] = useState('Home & Kitchen');
  const [itemB, setItemB] = useState('Appliances');

  const loadComparison = async (a: string, b: string) => {
    setIsLoading(true);
    const res = await compareProducts(a, b);
    setData(res);
    setIsLoading(false);
  };

  useEffect(() => {
    loadComparison(itemA, itemB);
  }, [itemA, itemB]);

  const handleExportCsv = () => {
    if (!data?.aspect_comparison) return;
    exportToCsv(`product_comparison_${itemA}_vs_${itemB}.csv`, data.aspect_comparison);
  };

  if (isLoading || !data) {
    return (
      <div className="h-96 flex flex-col items-center justify-center gap-3 text-slate-400">
        <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs font-medium">Computing aspect-level comparative metrics...</p>
      </div>
    );
  }

  // Count winners
  let winsA = 0;
  let winsB = 0;
  for (const row of data.aspect_comparison) {
    if (row.winner === data.item_a.name) winsA++;
    else if (row.winner === data.item_b.name) winsB++;
  }

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
              Comparative Intelligence
            </span>
            <span className="text-xs text-slate-500">Side-by-Side Aspect Evaluation</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 mt-1">Product & Domain Aspect Comparison</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Benchmark two product lines or Amazon categories across Quality, Price, Delivery, Durability, Design, and Usability.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => triggerPrintReport('Product Comparison Report')}
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

      {/* Selectors Bar */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex-1 w-full space-y-1">
          <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">Select Primary Subject (A):</label>
          <select
            value={itemA}
            onChange={(e) => setItemA(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          >
            {data.available_options.map((opt) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        </div>

        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 shrink-0 font-bold text-xs">
          VS
        </div>

        <div className="flex-1 w-full space-y-1">
          <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">Select Benchmark Target (B):</label>
          <select
            value={itemB}
            onChange={(e) => setItemB(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          >
            {data.available_options.map((opt) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Side-by-Side KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Item A Card */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-200">
                Subject A
              </span>
              <h3 className="text-lg font-bold text-slate-900 mt-1">{data.item_a.name}</h3>
              {data.item_a.asin && <p className="text-[11px] text-slate-400 font-mono">ASIN: {data.item_a.asin}</p>}
            </div>
            <div className="text-right">
              <span className="text-2xl font-bold text-slate-900 flex items-center gap-1 justify-end">
                {data.item_a.avg_rating.toFixed(1)} <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
              </span>
              <p className="text-[11px] text-slate-500">{data.item_a.sample_size.toLocaleString()} reviews</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 p-3.5 rounded-xl border border-slate-100">
            <div>
              <span className="text-slate-500 text-[11px]">Net Sentiment Score</span>
              <p className={`font-bold text-sm ${data.item_a.net_sentiment >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                {data.item_a.net_sentiment > 0 ? `+${data.item_a.net_sentiment}` : data.item_a.net_sentiment}%
              </p>
            </div>
            <div>
              <span className="text-slate-500 text-[11px]">Verified Buyers</span>
              <p className="font-bold text-sm text-slate-800">{data.item_a.verified_purchase_rate}%</p>
            </div>
          </div>

          <div className="space-y-2 text-xs">
            <div className="p-2.5 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-start gap-2">
              <ThumbsUp className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <strong className="block text-[11px] uppercase tracking-wide">Top Strength:</strong>
                <span>{data.item_a.top_strength}</span>
              </div>
            </div>
            <div className="p-2.5 rounded-lg bg-rose-50 text-rose-800 border border-rose-200 flex items-start gap-2">
              <ThumbsDown className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <strong className="block text-[11px] uppercase tracking-wide">Key Friction Point:</strong>
                <span>{data.item_a.top_weakness}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Item B Card */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200">
                Subject B
              </span>
              <h3 className="text-lg font-bold text-slate-900 mt-1">{data.item_b.name}</h3>
              {data.item_b.asin && <p className="text-[11px] text-slate-400 font-mono">ASIN: {data.item_b.asin}</p>}
            </div>
            <div className="text-right">
              <span className="text-2xl font-bold text-slate-900 flex items-center gap-1 justify-end">
                {data.item_b.avg_rating.toFixed(1)} <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
              </span>
              <p className="text-[11px] text-slate-500">{data.item_b.sample_size.toLocaleString()} reviews</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 p-3.5 rounded-xl border border-slate-100">
            <div>
              <span className="text-slate-500 text-[11px]">Net Sentiment Score</span>
              <p className={`font-bold text-sm ${data.item_b.net_sentiment >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                {data.item_b.net_sentiment > 0 ? `+${data.item_b.net_sentiment}` : data.item_b.net_sentiment}%
              </p>
            </div>
            <div>
              <span className="text-slate-500 text-[11px]">Verified Buyers</span>
              <p className="font-bold text-sm text-slate-800">{data.item_b.verified_purchase_rate}%</p>
            </div>
          </div>

          <div className="space-y-2 text-xs">
            <div className="p-2.5 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-start gap-2">
              <ThumbsUp className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <strong className="block text-[11px] uppercase tracking-wide">Top Strength:</strong>
                <span>{data.item_b.top_strength}</span>
              </div>
            </div>
            <div className="p-2.5 rounded-lg bg-rose-50 text-rose-800 border border-rose-200 flex items-start gap-2">
              <ThumbsDown className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <strong className="block text-[11px] uppercase tracking-wide">Key Friction Point:</strong>
                <span>{data.item_b.top_weakness}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Head-to-Head Aspect Comparison Chart */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">Head-to-Head ABSA Dimensions Score (0 &ndash; 100)</h3>
            <p className="text-xs text-slate-500">Evaluated aspect quality scores derived from customer opinion polarity.</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 flex items-center gap-1">
              <Trophy className="w-3.5 h-3.5" />
              {winsA > winsB ? `${data.item_a.name} leads (${winsA} vs ${winsB})` : winsB > winsA ? `${data.item_b.name} leads (${winsB} vs ${winsA})` : 'Tied overall'}
            </span>
          </div>
        </div>

        <div className="h-80 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.aspect_comparison}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="aspect" tick={{ fontSize: 11, fill: '#64748b', fontWeight: 600 }} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#64748b' }} />
              <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px' }} />
              <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
              <Bar dataKey="score_a" name={data.item_a.name} fill="#6366F1" radius={[4, 4, 0, 0]} />
              <Bar dataKey="score_b" name={data.item_b.name} fill="#94A3B8" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Detailed Aspect Winner Table */}
        <div className="overflow-x-auto border border-slate-200 rounded-xl mt-4">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
              <tr>
                <th className="py-2.5 px-3">Aspect</th>
                <th className="py-2.5 px-3">{data.item_a.name} Score</th>
                <th className="py-2.5 px-3">{data.item_b.name} Score</th>
                <th className="py-2.5 px-3">Score Differential</th>
                <th className="py-2.5 px-3 text-right">Advantage Winner</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.aspect_comparison.map((row) => (
                <tr key={row.aspect} className="hover:bg-slate-50/60">
                  <td className="py-2.5 px-3 font-bold text-slate-900">{row.aspect}</td>
                  <td className="py-2.5 px-3 font-semibold text-indigo-600">{row.score_a} / 100</td>
                  <td className="py-2.5 px-3 font-semibold text-slate-600">{row.score_b} / 100</td>
                  <td className="py-2.5 px-3">
                    <span className={`font-mono text-xs font-semibold ${row.diff > 0 ? 'text-indigo-600' : row.diff < 0 ? 'text-slate-600' : 'text-slate-400'}`}>
                      {row.diff > 0 ? `+${row.diff}` : row.diff} pts
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-right">
                    <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                      row.winner === data.item_a.name
                        ? 'bg-indigo-100 text-indigo-700'
                        : row.winner === data.item_b.name
                        ? 'bg-slate-200 text-slate-700'
                        : 'bg-slate-100 text-slate-500'
                    }`}>
                      {row.winner}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
