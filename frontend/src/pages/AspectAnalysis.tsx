import React, { useState, useMemo } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import { 
  Layers, 
  Search, 
  Filter, 
  CheckCircle, 
  AlertCircle, 
  Clock, 
  ShieldAlert 
} from 'lucide-react';
import { AspectsSummaryData } from '../services/api';
import { SentimentBadge } from '../components/SentimentBadge';

interface Props {
  data: AspectsSummaryData;
}

export const AspectAnalysis: React.FC<Props> = ({ data }) => {
  const [selectedAspect, setSelectedAspect] = useState<string>('All');
  const [selectedSentiment, setSelectedSentiment] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Aspects chart data
  const chartData = data.aspect_breakdown.map((item) => ({
    aspect: item.aspect,
    Positive: item.positive,
    Neutral: item.neutral,
    Negative: item.negative,
    total: item.total
  }));

  // Filtering clauses
  const filteredClauses = useMemo(() => {
    return data.sample_clauses.filter((clause) => {
      const matchAspect = selectedAspect === 'All' || clause.aspect === selectedAspect;
      const matchSentiment = selectedSentiment === 'All' || clause.sentiment.toLowerCase() === selectedSentiment.toLowerCase();
      const matchSearch = !searchQuery || 
        clause.clause.toLowerCase().includes(searchQuery.toLowerCase()) ||
        clause.keyword.toLowerCase().includes(searchQuery.toLowerCase()) ||
        clause.review_text.toLowerCase().includes(searchQuery.toLowerCase());
      return matchAspect && matchSentiment && matchSearch;
    });
  }, [data.sample_clauses, selectedAspect, selectedSentiment, searchQuery]);

  return (
    <div className="space-y-6">
      {/* Aspect Overview Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {data.aspect_breakdown.map((asp) => {
          const isHighestPos = asp.aspect === 'Usability' || asp.aspect === 'Design';
          const isHighPain = asp.aspect === 'Durability' || asp.aspect === 'Price';

          return (
            <div 
              key={asp.aspect}
              onClick={() => setSelectedAspect(asp.aspect)}
              className={`cursor-pointer p-4 rounded-xl border transition-all ${
                selectedAspect === asp.aspect 
                  ? 'bg-indigo-50/80 border-indigo-400 shadow-sm ring-2 ring-indigo-200' 
                  : 'bg-white border-slate-200 hover:border-slate-300 shadow-sm'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-xs text-slate-800">{asp.aspect}</span>
                {isHighestPos ? (
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                ) : (isHighPain ? (
                  <ShieldAlert className="w-3.5 h-3.5 text-rose-500" />
                ) : null)}
              </div>
              <div className="text-xl font-bold text-slate-900">{asp.total}</div>
              <div className="flex items-center justify-between text-[11px] text-slate-500 mt-1">
                <span>Pos Rate:</span>
                <span className={`font-semibold ${asp.positive_rate > 40 ? 'text-emerald-600' : 'text-slate-700'}`}>
                  {asp.positive_rate}%
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main ABSA Stacked Chart */}
      <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">Aspect-Level Sentiment Distribution</h3>
            <p className="text-xs text-slate-500 mt-0.5">Frequency of positive, neutral, and negative sentiment mentions per aspect</p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded bg-slate-100 text-slate-700">
            {data.total_aspect_mentions.toLocaleString()} Aspect Mentions
          </span>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 15, right: 15, left: -10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
              <XAxis dataKey="aspect" tick={{ fontSize: 11, fill: '#334155' }} />
              <YAxis tick={{ fontSize: 11, fill: '#64748B' }} />
              <Tooltip 
                formatter={(val: any, name: any) => [`${val} mentions`, name]}
                contentStyle={{ backgroundColor: '#0F172A', color: '#fff', borderRadius: '8px', fontSize: '12px', border: 'none' }}
              />
              <Legend verticalAlign="top" height={36} iconType="circle" />
              <Bar dataKey="Positive" fill="#10B981" stackId="a" radius={[0, 0, 0, 0]} />
              <Bar dataKey="Neutral" fill="#F59E0B" stackId="a" radius={[0, 0, 0, 0]} />
              <Bar dataKey="Negative" fill="#EF4444" stackId="a" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Filterable Extracted Clauses Table */}
      <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">Extracted Aspect Clauses & Evidence</h3>
            <p className="text-xs text-slate-500 mt-0.5">Granular phrases extracted from reviews with matched keywords</p>
          </div>

          {/* Filters Bar */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search clause or keyword..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 w-48 text-slate-800"
              />
            </div>

            <select
              value={selectedAspect}
              onChange={(e) => setSelectedAspect(e.target.value)}
              className="text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="All">All Aspects</option>
              {data.aspect_breakdown.map(a => (
                <option key={a.aspect} value={a.aspect}>{a.aspect}</option>
              ))}
            </select>

            <select
              value={selectedSentiment}
              onChange={(e) => setSelectedSentiment(e.target.value)}
              className="text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="All">All Sentiments</option>
              <option value="positive">Positive</option>
              <option value="neutral">Neutral</option>
              <option value="negative">Negative</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 uppercase font-semibold border-y border-slate-200">
              <tr>
                <th className="py-3 px-4">Aspect</th>
                <th className="py-3 px-4">Sentiment</th>
                <th className="py-3 px-4">Matched Keyword</th>
                <th className="py-3 px-4">Extracted Clause</th>
                <th className="py-3 px-4">Confidence</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {filteredClauses.length > 0 ? (
                filteredClauses.slice(0, 15).map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4 font-bold text-slate-900">{row.aspect}</td>
                    <td className="py-3 px-4">
                      <SentimentBadge sentiment={row.sentiment} size="sm" />
                    </td>
                    <td className="py-3 px-4">
                      <code className="text-[11px] bg-slate-100 px-1.5 py-0.5 rounded text-indigo-700 font-mono">
                        {row.keyword}
                      </code>
                    </td>
                    <td className="py-3 px-4 max-w-md text-slate-800 font-normal italic">
                      "{row.clause}"
                    </td>
                    <td className="py-3 px-4 text-slate-500 font-mono text-[11px]">
                      {(row.confidence * 100).toFixed(1)}%
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400">
                    No clauses matched your filter criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
