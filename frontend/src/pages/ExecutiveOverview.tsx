import React from 'react';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Tooltip, 
  Legend, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid 
} from 'recharts';
import { 
  Database, 
  Award, 
  CheckCircle2, 
  Layers, 
  TrendingUp, 
  Star,
  ArrowRight
} from 'lucide-react';
import { OverviewData } from '../services/api';
import { MetricCard } from '../components/MetricCard';
import { SentimentBadge } from '../components/SentimentBadge';

interface Props {
  data: OverviewData;
  onNavigate: (page: any) => void;
}

export const ExecutiveOverview: React.FC<Props> = ({ data, onNavigate }) => {
  const pieData = data.sentiment_distribution.map(d => ({
    name: `${d.label} (${d.percentage}%)`,
    value: d.count,
    color: d.color
  }));

  const categoryChartData = data.categories.map(c => ({
    name: c.name,
    reviews: c.reviews
  }));

  return (
    <div className="space-y-6">
      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Processed Reviews"
          value={data.total_reviews.toLocaleString()}
          subtitle="Across 3 Amazon categories"
          icon={<Database className="w-5 h-5" />}
          badge="100% Balanced"
          trend="positive"
        />
        <MetricCard
          title="Top Accuracy (DistilBERT)"
          value={`${data.key_metrics.best_accuracy}%`}
          subtitle="+4.13% vs Logistic Regression"
          icon={<Award className="w-5 h-5" />}
          badge="Leader"
          trend="positive"
        />
        <MetricCard
          title="Top Macro F1-Score"
          value={`${data.key_metrics.best_macro_f1}%`}
          subtitle="N = 3,000 held-out test reviews"
          icon={<TrendingUp className="w-5 h-5" />}
          badge="+6.57% vs SVM"
          trend="positive"
        />
        <MetricCard
          title="Product Aspects Mined"
          value={data.key_metrics.aspects_tracked}
          subtitle="Quality, Price, Delivery, Durability..."
          icon={<Layers className="w-5 h-5" />}
          badge="Fine-Grained"
          trend="neutral"
        />
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Sentiment Distribution Card */}
        <div className="lg:col-span-6 bg-white rounded-xl border border-slate-200/90 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">Sentiment Distribution (Primary Dataset)</h3>
              <p className="text-xs text-slate-500 mt-0.5">Balanced Home & Kitchen reviews to eliminate class bias</p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-slate-100 text-slate-700">
              15,000 Samples
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={95}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(val: any) => [`${Number(val).toLocaleString()} reviews`, 'Volume']}
                  contentStyle={{ backgroundColor: '#0F172A', color: '#fff', borderRadius: '8px', fontSize: '12px', border: 'none' }}
                />
                <Legend 
                  verticalAlign="bottom" 
                  height={36}
                  iconType="circle"
                  formatter={(val) => <span className="text-xs text-slate-600 font-medium">{val}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-3 gap-2 mt-2 pt-3 border-t border-slate-100 text-center">
            {data.sentiment_distribution.map((item) => (
              <div key={item.label} className="p-2 rounded-lg bg-slate-50">
                <span className="text-[11px] font-medium text-slate-500 block">{item.label}</span>
                <span className="text-sm font-bold text-slate-900">{item.count.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Multi-Domain Preparation Card */}
        <div className="lg:col-span-6 bg-white rounded-xl border border-slate-200/90 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">Multi-Domain Evaluation Pipeline</h3>
              <p className="text-xs text-slate-500 mt-0.5">Equalized sample sizing across three e-commerce sectors</p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-100">
              Cross-Domain Ready
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryChartData} layout="vertical" margin={{ left: 20, right: 20, top: 10, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E2E8F0" />
                <XAxis type="number" tick={{ fontSize: 11, fill: '#64748B' }} domain={[0, 18000]} />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 11, fill: '#334155' }} width={110} />
                <Tooltip
                  formatter={(val: any) => [`${Number(val).toLocaleString()} reviews`, 'Volume']}
                  contentStyle={{ backgroundColor: '#0F172A', color: '#fff', borderRadius: '8px', fontSize: '12px', border: 'none' }}
                />
                <Bar dataKey="reviews" fill="#4F46E5" radius={[0, 6, 6, 0]} barSize={24} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-2 mt-2 pt-3 border-t border-slate-100">
            {data.categories.map((cat) => (
              <div key={cat.name} className="flex items-center justify-between text-xs py-1 px-2 rounded hover:bg-slate-50">
                <span className="font-semibold text-slate-800">{cat.name}</span>
                <span className="text-slate-500">{cat.role}</span>
                <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                  {cat.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Reviews Sample Table & Quick Action */}
      <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">Sample Evaluated Customer Reviews</h3>
            <p className="text-xs text-slate-500 mt-0.5">Verified examples ingested by the sentiment and aspect extraction pipeline</p>
          </div>
          <button
            onClick={() => onNavigate('predictor')}
            className="flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors"
          >
            <span>Test Live Predictor</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 uppercase font-semibold border-y border-slate-200">
              <tr>
                <th className="py-3 px-4">ASIN</th>
                <th className="py-3 px-4">Rating</th>
                <th className="py-3 px-4">Review Excerpt</th>
                <th className="py-3 px-4">Model Sentiment</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-normal text-slate-700">
              {data.recent_reviews.map((rev, idx) => (
                <tr key={idx} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3 px-4 font-mono text-[11px] text-slate-500">{rev.asin}</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-1 font-semibold text-amber-600">
                      <span>{rev.rating}</span>
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    </div>
                  </td>
                  <td className="py-3 px-4 max-w-md text-slate-600 leading-relaxed font-sans">{rev.text}</td>
                  <td className="py-3 px-4">
                    <SentimentBadge sentiment={rev.sentiment} size="sm" />
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
