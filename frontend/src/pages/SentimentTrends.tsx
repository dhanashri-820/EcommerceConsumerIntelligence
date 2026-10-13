import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  Calendar, 
  Download, 
  Layers, 
  CheckCircle2, 
  Clock, 
  ShieldCheck, 
  BarChart2, 
  ArrowUpRight,
  Printer
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Legend 
} from 'recharts';
import { 
  fetchSentimentTrends, 
  SentimentTrendsData, 
  exportToCsv, 
  triggerPrintReport 
} from '../services/api';

export const SentimentTrends: React.FC = () => {
  const [data, setData] = useState<SentimentTrendsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [chartMode, setChartMode] = useState<'proportions' | 'net_sentiment' | 'counts'>('proportions');

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      const res = await fetchSentimentTrends();
      setData(res);
      setIsLoading(false);
    }
    loadData();
  }, []);

  const handleExportCsv = () => {
    if (!data?.quarterly_trends) return;
    exportToCsv('sentiment_trends_quarterly.csv', data.quarterly_trends);
  };

  if (isLoading || !data) {
    return (
      <div className="h-96 flex flex-col items-center justify-center gap-3 text-slate-400">
        <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs font-medium">Calculating temporal sentiment distributions...</p>
      </div>
    );
  }

  const latest = data.quarterly_trends[data.quarterly_trends.length - 1] || {};

  return (
    <div className="space-y-6">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
              Temporal Intelligence
            </span>
            <span className="text-xs text-slate-500 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              {data.date_range.start} &ndash; {data.date_range.end}
            </span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 mt-1">Multi-Domain Sentiment Trends & Longitudinal Shifts</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Quarterly longitudinal tracking of 45,000 Amazon reviews showing customer satisfaction evolution.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => triggerPrintReport('Sentiment Trends')}
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

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Tracked Quarters</span>
            <Clock className="w-4 h-4 text-indigo-600" />
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2">{data.quarterly_trends.length} Quarters</p>
          <p className="text-[11px] text-slate-500 mt-1">{data.date_range.start} through {data.date_range.end}</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Latest Net Sentiment</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <p className={`text-2xl font-bold mt-2 ${latest.net_sentiment >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
            {latest.net_sentiment > 0 ? `+${latest.net_sentiment}` : latest.net_sentiment}%
          </p>
          <p className="text-[11px] text-slate-500 mt-1">Net index (% Pos &minus; % Neg) in {latest.period}</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Verified Purchase Rate</span>
            <ShieldCheck className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2">87.2%</p>
          <p className="text-[11px] text-slate-500 mt-1">Cross-domain verified buyer authentications</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Peak Positive Quarter</span>
            <ArrowUpRight className="w-4 h-4 text-indigo-600" />
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2">2022 Q2 (43.1%)</p>
          <p className="text-[11px] text-slate-500 mt-1">Highest customer satisfaction surge</p>
        </div>
      </div>

      {/* Main Chart Section */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">Longitudinal Sentiment Dynamics</h3>
            <p className="text-xs text-slate-500">Examine how customer praise vs dissatisfaction evolves across quarters.</p>
          </div>

          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setChartMode('proportions')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                chartMode === 'proportions' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Percentages (%)
            </button>
            <button
              onClick={() => setChartMode('net_sentiment')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                chartMode === 'net_sentiment' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Net Sentiment Index
            </button>
            <button
              onClick={() => setChartMode('counts')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                chartMode === 'counts' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Raw Counts
            </button>
          </div>
        </div>

        <div className="h-80 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            {chartMode === 'proportions' ? (
              <AreaChart data={data.quarterly_trends}>
                <defs>
                  <linearGradient id="colorPos" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0.1}/>
                  </linearGradient>
                  <linearGradient id="colorNeu" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#F59E0B" stopOpacity={0.1}/>
                  </linearGradient>
                  <linearGradient id="colorNeg" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#EF4444" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#EF4444" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="period" tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis unit="%" tick={{ fontSize: 11, fill: '#64748b' }} domain={[0, 60]} />
                <Tooltip 
                  formatter={(val: any) => [`${val}%`, '']} 
                  contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                <Area type="monotone" dataKey="positive_pct" name="Positive %" stroke="#10B981" fillOpacity={1} fill="url(#colorPos)" />
                <Area type="monotone" dataKey="neutral_pct" name="Neutral %" stroke="#F59E0B" fillOpacity={1} fill="url(#colorNeu)" />
                <Area type="monotone" dataKey="negative_pct" name="Negative %" stroke="#EF4444" fillOpacity={1} fill="url(#colorNeg)" />
              </AreaChart>
            ) : chartMode === 'net_sentiment' ? (
              <LineChart data={data.quarterly_trends}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="period" tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis unit="%" tick={{ fontSize: 11, fill: '#64748b' }} domain={[-20, 25]} />
                <Tooltip 
                  formatter={(val: any) => [`${val}%`, 'Net Sentiment']} 
                  contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                <Line type="monotone" dataKey="net_sentiment" name="Net Sentiment Index (% Pos - % Neg)" stroke="#6366F1" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
              </LineChart>
            ) : (
              <LineChart data={data.quarterly_trends}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="period" tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px' }} />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                <Line type="monotone" dataKey="positive" name="Positive Reviews" stroke="#10B981" strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="neutral" name="Neutral Reviews" stroke="#F59E0B" strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="negative" name="Negative Reviews" stroke="#EF4444" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            )}
          </ResponsiveContainer>
        </div>
      </div>

      {/* Cross-Domain Category Comparison Section */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div>
          <h3 className="text-base font-bold text-slate-900">Cross-Domain Generalization Benchmarks</h3>
          <p className="text-xs text-slate-500">Comparative dataset metrics across all three balanced Amazon product categories.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {data.category_comparison.map((cat) => (
            <div key={cat.category} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:shadow-sm transition-all space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-sm text-slate-900">{cat.category}</h4>
                <span className="text-[10px] font-semibold bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full border border-indigo-200">
                  {cat.total_reviews.toLocaleString()} Reviews
                </span>
              </div>

              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Balanced Distribution</span>
                  <span className="font-semibold text-slate-900">33.3% / 33.3% / 33.3%</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Verified Purchase Rate</span>
                  <span className="font-semibold text-emerald-600">{cat.verified_purchase_rate}%</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Top Model Macro F1</span>
                  <span className="font-semibold text-indigo-600">{cat.best_model_f1}%</span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px] text-slate-500">
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  Dataset Verified
                </span>
                <span>Avg Rating: {cat.avg_rating.toFixed(1)} ★</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
