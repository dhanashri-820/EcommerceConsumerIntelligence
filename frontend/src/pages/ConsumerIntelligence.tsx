import React from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { 
  AlertTriangle, 
  ThumbsUp, 
  CheckCircle, 
  TrendingUp, 
  Wrench, 
  Truck, 
  Sparkles, 
  DollarSign 
} from 'lucide-react';
import { ConsumerInsightsData } from '../services/api';

interface Props {
  data: ConsumerInsightsData;
}

export const ConsumerIntelligence: React.FC<Props> = ({ data }) => {
  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded text-[11px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
              Voice-of-Customer Mining
            </span>
            <span className="text-xs text-slate-500">N-gram Pattern Analysis</span>
          </div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">
            Evidence-Based Strategic Product Roadmaps
          </h2>
          <p className="text-xs text-slate-500 max-w-2xl mt-0.5 leading-relaxed">
            By isolating high-frequency phrases in negative versus positive reviews, we convert qualitative feedback into quantifiable engineering and marketing improvements.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-center min-w-[100px]">
            <span className="text-[11px] text-rose-600 font-semibold block">Top Failure Driver</span>
            <span className="text-sm font-bold text-rose-800">Motor Couplings</span>
          </div>
          <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-center min-w-[100px]">
            <span className="text-[11px] text-emerald-600 font-semibold block">Top Hero Feature</span>
            <span className="text-sm font-bold text-emerald-800">Easy Clean</span>
          </div>
        </div>
      </div>

      {/* Complaints vs Praises Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Complaints Chart */}
        <div className="lg:col-span-6 bg-white rounded-xl border border-slate-200/90 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Top 8 Recurring Complaints</h3>
                <p className="text-xs text-slate-500 mt-0.5">High-frequency negative phrases and pain points</p>
              </div>
            </div>
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200">
              Negative Subset
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.top_complaint_ngrams} layout="vertical" margin={{ top: 5, right: 20, left: 30, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E2E8F0" />
                <XAxis type="number" tick={{ fontSize: 11, fill: '#64748B' }} />
                <YAxis dataKey="phrase" type="category" tick={{ fontSize: 11, fill: '#334155' }} width={100} />
                <Tooltip 
                  formatter={(val: any) => [`${val} reviews`, 'Mentions']}
                  contentStyle={{ backgroundColor: '#0F172A', color: '#fff', borderRadius: '8px', fontSize: '12px', border: 'none' }}
                />
                <Bar dataKey="count" fill="#EF4444" radius={[0, 4, 4, 0]} barSize={16} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Praises Chart */}
        <div className="lg:col-span-6 bg-white rounded-xl border border-slate-200/90 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <ThumbsUp className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Top 8 Praised Product Features</h3>
                <p className="text-xs text-slate-500 mt-0.5">Key drivers of 4-star and 5-star customer advocacy</p>
              </div>
            </div>
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
              Positive Subset
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.top_praise_ngrams} layout="vertical" margin={{ top: 5, right: 20, left: 30, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E2E8F0" />
                <XAxis type="number" tick={{ fontSize: 11, fill: '#64748B' }} />
                <YAxis dataKey="phrase" type="category" tick={{ fontSize: 11, fill: '#334155' }} width={100} />
                <Tooltip 
                  formatter={(val: any) => [`${val} reviews`, 'Mentions']}
                  contentStyle={{ backgroundColor: '#0F172A', color: '#fff', borderRadius: '8px', fontSize: '12px', border: 'none' }}
                />
                <Bar dataKey="count" fill="#10B981" radius={[0, 4, 4, 0]} barSize={16} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Themed Complaints Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-sm">
          <h3 className="text-base font-bold text-slate-900 mb-1">Clustered Defect Categories</h3>
          <p className="text-xs text-slate-500 mb-4">Categorized customer pain points and suggested mitigations</p>

          <div className="space-y-3">
            {data.complaints.slice(0, 5).map((item, idx) => (
              <div key={idx} className="p-3 rounded-lg border border-slate-100 bg-slate-50/70 hover:bg-slate-50 transition-colors">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-slate-800">{item.Theme}</span>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200">
                    Impact: {item.Impact}
                  </span>
                </div>
                <div className="text-xs text-slate-600 mb-1">
                  <span className="text-slate-400">Trigger phrase:</span> <code className="bg-slate-200/60 px-1 rounded text-rose-700 font-mono text-[11px]">{item.Phrase}</code>
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  <strong className="text-slate-700">Mitigation:</strong> {item.Action}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-sm">
          <h3 className="text-base font-bold text-slate-900 mb-1">Selling Points & Brand Strengths</h3>
          <p className="text-xs text-slate-500 mb-4">Core consumer satisfaction triggers to leverage in marketing</p>

          <div className="space-y-3">
            {data.praises.slice(0, 5).map((item, idx) => (
              <div key={idx} className="p-3 rounded-lg border border-slate-100 bg-slate-50/70 hover:bg-slate-50 transition-colors">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-slate-800">{item.Theme}</span>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Freq: {item.Frequency}
                  </span>
                </div>
                <div className="text-xs text-slate-600 mb-1">
                  <span className="text-slate-400">Trigger phrase:</span> <code className="bg-slate-200/60 px-1 rounded text-emerald-700 font-mono text-[11px]">{item.Phrase}</code>
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  <strong className="text-slate-700">Marketing Action:</strong> {item.Recommendation}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Actionable Recommendations Table */}
      <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">Actionable Strategic Recommendations</h3>
            <p className="text-xs text-slate-500 mt-0.5">Cross-functional interventions linked directly to customer sentiment data</p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded bg-indigo-50 text-indigo-700 border border-indigo-100">
            Business Impact
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 uppercase font-semibold border-y border-slate-200">
              <tr>
                <th className="py-3 px-4">Department / Category</th>
                <th className="py-3 px-4">Customer Pain Point / Signal</th>
                <th className="py-3 px-4">Recommended Strategic Action</th>
                <th className="py-3 px-4 font-bold text-indigo-700">Expected ROI</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {data.recommendations.map((rec, idx) => (
                <tr key={idx} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-slate-900 whitespace-nowrap">
                    {rec.Category}
                  </td>
                  <td className="py-3.5 px-4 text-slate-600 max-w-xs">{rec['Issue Identified']}</td>
                  <td className="py-3.5 px-4 text-slate-800 max-w-sm">{rec.Recommendation}</td>
                  <td className="py-3.5 px-4">
                    <span className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                      {rec['Expected ROI']}
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
