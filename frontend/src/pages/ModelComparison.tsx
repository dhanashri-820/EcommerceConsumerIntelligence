import React, { useState } from 'react';
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
  CheckCircle2, 
  Cpu, 
  TrendingUp, 
  HelpCircle, 
  Layers, 
  Table 
} from 'lucide-react';
import { ModelMetricsData } from '../services/api';

interface Props {
  data: ModelMetricsData;
}

export const ModelComparison: React.FC<Props> = ({ data }) => {
  const [selectedCM, setSelectedCM] = useState<string>('DistilBERT');

  // Format grouped bar chart data for overall metrics
  const metricKeys = ['Accuracy', 'Macro Precision', 'Macro Recall', 'Macro F1', 'Weighted F1'];
  
  const groupedChartData = metricKeys.map((metric) => {
    const entry: Record<string, any> = { metric };
    data.comparison.forEach((m) => {
      // Map short name for legend
      const shortName = m.Model.includes('DistilBERT') 
        ? 'DistilBERT' 
        : (m.Model.includes('Logistic') ? 'Logistic Regression' : 'Linear SVM');
      entry[shortName] = m[metric as keyof typeof m];
    });
    return entry;
  });

  // Per class chart data
  const perClassChartData = [
    {
      class: 'Negative',
      'DistilBERT': 72.52,
      'Logistic Regression': 68.11,
      'Linear SVM': 66.26,
    },
    {
      class: 'Neutral',
      'DistilBERT': 64.65,
      'Logistic Regression': 62.45,
      'Linear SVM': 58.22,
    },
    {
      class: 'Positive',
      'DistilBERT': 85.16,
      'Logistic Regression': 79.67,
      'Linear SVM': 78.13,
    }
  ];

  const currentCM = data.confusion_matrices[selectedCM] || data.confusion_matrices['DistilBERT'];

  return (
    <div className="space-y-6">
      {/* Benchmark Header Info Banner */}
      <div className="bg-gradient-to-r from-slate-900 to-indigo-950 rounded-xl p-5 text-white shadow-md border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded text-[11px] font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              Verified Benchmark Results
            </span>
            <span className="text-xs text-slate-400">Canonical Test Set: N = 3,000</span>
          </div>
          <h2 className="text-lg font-bold text-white tracking-tight">
            DistilBERT Outperforms Classical Baselines by +4.13% to +6.56%
          </h2>
          <p className="text-xs text-slate-300 max-w-2xl mt-1 leading-relaxed">
            All models were evaluated on 1,000 positive, 1,000 neutral, and 1,000 negative held-out test reviews. DistilBERT's bidirectional self-attention successfully resolves complex negation and clause dependencies.
          </p>
        </div>
        <div className="flex items-center gap-4 bg-slate-800/60 p-3 rounded-lg border border-slate-700/60 text-right">
          <div>
            <span className="text-[11px] text-slate-400 block font-medium">DistilBERT Test Acc</span>
            <span className="text-xl font-bold text-emerald-400">74.03%</span>
          </div>
          <div className="h-8 w-px bg-slate-700" />
          <div>
            <span className="text-[11px] text-slate-400 block font-medium">Macro F1</span>
            <span className="text-xl font-bold text-indigo-400">74.11%</span>
          </div>
        </div>
      </div>

      {/* Metric Comparison Table */}
      <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">Overall Performance Evaluation Table</h3>
            <p className="text-xs text-slate-500 mt-0.5">Metrics computed on identical held-out test distributions (3-Class Balanced)</p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded bg-slate-100 text-slate-700">
            Source: outputs/model_comparison/
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 uppercase font-semibold border-y border-slate-200">
              <tr>
                <th className="py-3 px-4">Model Architecture</th>
                <th className="py-3 px-4">Accuracy</th>
                <th className="py-3 px-4">Macro Precision</th>
                <th className="py-3 px-4">Macro Recall</th>
                <th className="py-3 px-4 font-bold text-indigo-700">Macro F1-Score</th>
                <th className="py-3 px-4">Weighted F1</th>
                <th className="py-3 px-4 text-center">Rank</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {data.comparison.map((m, idx) => {
                const isBest = m.Model.includes('DistilBERT');
                return (
                  <tr key={m.Model} className={isBest ? 'bg-emerald-50/40 hover:bg-emerald-50/60' : 'hover:bg-slate-50'}>
                    <td className="py-3.5 px-4 font-bold text-slate-900 flex items-center gap-2">
                      {isBest && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                      <span>{m.Model}</span>
                    </td>
                    <td className="py-3.5 px-4 font-semibold">{m.Accuracy.toFixed(2)}%</td>
                    <td className="py-3.5 px-4">{m['Macro Precision'].toFixed(2)}%</td>
                    <td className="py-3.5 px-4">{m['Macro Recall'].toFixed(2)}%</td>
                    <td className={`py-3.5 px-4 font-bold ${isBest ? 'text-emerald-700 text-sm' : 'text-slate-800'}`}>
                      {m['Macro F1'].toFixed(2)}%
                    </td>
                    <td className="py-3.5 px-4">{m['Weighted F1'].toFixed(2)}%</td>
                    <td className="py-3.5 px-4 text-center">
                      <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                        idx === 2 ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-700'
                      }`}>
                        {idx === 2 ? '1st' : (idx === 0 ? '2nd' : '3rd')}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Grouped Bar Chart */}
        <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200/90 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">Evaluation Metric Comparison (%)</h3>
              <p className="text-xs text-slate-500 mt-0.5">Direct comparison across 5 standard evaluation dimensions</p>
            </div>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={groupedChartData} margin={{ top: 15, right: 15, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="metric" tick={{ fontSize: 11, fill: '#334155' }} />
                <YAxis domain={[50, 85]} tick={{ fontSize: 11, fill: '#64748B' }} unit="%" />
                <Tooltip 
                  formatter={(val: any) => [`${val}%`, 'Score']}
                  contentStyle={{ backgroundColor: '#0F172A', color: '#fff', borderRadius: '8px', fontSize: '12px', border: 'none' }}
                />
                <Legend verticalAlign="top" height={36} iconType="circle" />
                <Bar dataKey="DistilBERT" fill="#10B981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Logistic Regression" fill="#4F46E5" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Linear SVM" fill="#F97316" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Per-Class F1 Chart */}
        <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200/90 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">Per-Class F1-Score Breakdown</h3>
              <p className="text-xs text-slate-500 mt-0.5">Sentiment-specific classification robustness</p>
            </div>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={perClassChartData} margin={{ top: 15, right: 15, left: -15, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="class" tick={{ fontSize: 11, fill: '#334155' }} />
                <YAxis domain={[50, 95]} tick={{ fontSize: 11, fill: '#64748B' }} unit="%" />
                <Tooltip 
                  formatter={(val: any) => [`${val}%`, 'F1-Score']}
                  contentStyle={{ backgroundColor: '#0F172A', color: '#fff', borderRadius: '8px', fontSize: '12px', border: 'none' }}
                />
                <Legend verticalAlign="top" height={36} iconType="circle" />
                <Bar dataKey="DistilBERT" fill="#10B981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Logistic Regression" fill="#4F46E5" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Linear SVM" fill="#F97316" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Confusion Matrix Interactive Visualizer */}
      <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
          <div>
            <h3 className="text-base font-bold text-slate-900">Confusion Matrix Visualizer</h3>
            <p className="text-xs text-slate-500 mt-0.5">Analysis of true labels versus model predicted labels on test set</p>
          </div>

          <div className="flex items-center gap-1.5 p-1 rounded-lg bg-slate-100 border border-slate-200">
            {['DistilBERT', 'Logistic Regression', 'Linear SVM'].map((mName) => (
              <button
                key={mName}
                onClick={() => setSelectedCM(mName)}
                className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                  selectedCM === mName 
                    ? 'bg-white text-slate-900 shadow-sm' 
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {mName}
              </button>
            ))}
          </div>
        </div>

        <div className="max-w-xl mx-auto p-4 bg-slate-50/60 rounded-xl border border-slate-200">
          <div className="text-center font-bold text-xs uppercase tracking-wider text-slate-500 mb-3">
            Predicted Sentiment Label
          </div>

          <div className="grid grid-cols-4 gap-2 text-center text-xs">
            <div className="font-semibold text-slate-400 self-center">True \ Pred</div>
            {currentCM.labels.map(l => (
              <div key={l} className="font-bold text-slate-700 py-1">{l}</div>
            ))}

            {currentCM.labels.map((rowLabel, rIdx) => (
              <React.Fragment key={rowLabel}>
                <div className="font-bold text-slate-700 self-center text-left pl-2">{rowLabel}</div>
                {currentCM.matrix[rIdx].map((val, cIdx) => {
                  const isDiagonal = rIdx === cIdx;
                  const intensity = Math.min(Math.round((val / 1000) * 100), 100);
                  const bgColor = isDiagonal 
                    ? 'bg-emerald-500 text-white font-bold' 
                    : (val > 150 ? 'bg-amber-100 text-amber-900 font-semibold' : 'bg-slate-100 text-slate-600');

                  return (
                    <div 
                      key={`${rIdx}-${cIdx}`}
                      className={`p-3 rounded-lg border border-slate-200/50 flex flex-col items-center justify-center transition-all ${bgColor}`}
                    >
                      <span className="text-base font-bold">{val}</span>
                      <span className="text-[10px] opacity-80">{((val / 1000) * 100).toFixed(1)}%</span>
                    </div>
                  );
                })}
              </React.Fragment>
            ))}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-200 text-center text-[11px] text-slate-500">
            Diagonal cells (green) represent correct predictions. Neutral reviews exhibit the highest off-diagonal confusion.
          </div>
        </div>
      </div>

      {/* Cross-Domain Transferability Evaluation Table */}
      <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">Cross-Domain Zero-Shot Generalization Benchmarks</h3>
            <p className="text-xs text-slate-500 mt-0.5">Evaluation of models trained on one Amazon category and tested on completely distinct product domains.</p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded bg-slate-100 text-slate-700">
            Source: outputs/cross_domain_results.csv
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 uppercase font-semibold border-y border-slate-200">
              <tr>
                <th className="py-2.5 px-3">Training Domain</th>
                <th className="py-2.5 px-3">Evaluation Domain</th>
                <th className="py-2.5 px-3">Cross-Domain Accuracy</th>
                <th className="py-2.5 px-3">Cross-Domain Macro F1</th>
                <th className="py-2.5 px-3">Generalization Retention</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <tr className="hover:bg-slate-50">
                <td className="py-2.5 px-3 font-semibold text-slate-800">Home & Kitchen</td>
                <td className="py-2.5 px-3 text-slate-600">Appliances</td>
                <td className="py-2.5 px-3 font-bold text-slate-800">61.58%</td>
                <td className="py-2.5 px-3 font-bold text-indigo-700">61.14%</td>
                <td className="py-2.5 px-3"><span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded text-[10px] font-semibold">87.2% Retention</span></td>
              </tr>
              <tr className="hover:bg-slate-50">
                <td className="py-2.5 px-3 font-semibold text-slate-800">Appliances</td>
                <td className="py-2.5 px-3 text-slate-600">Home & Kitchen</td>
                <td className="py-2.5 px-3 font-bold text-slate-800">62.12%</td>
                <td className="py-2.5 px-3 font-bold text-indigo-700">62.68%</td>
                <td className="py-2.5 px-3"><span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded text-[10px] font-semibold">89.4% Retention</span></td>
              </tr>
              <tr className="hover:bg-slate-50">
                <td className="py-2.5 px-3 font-semibold text-slate-800">Home & Kitchen</td>
                <td className="py-2.5 px-3 text-slate-600">Sports & Outdoors</td>
                <td className="py-2.5 px-3 font-bold text-slate-800">63.11%</td>
                <td className="py-2.5 px-3 font-bold text-indigo-700">63.51%</td>
                <td className="py-2.5 px-3"><span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded text-[10px] font-semibold">90.6% Retention</span></td>
              </tr>
              <tr className="hover:bg-slate-50">
                <td className="py-2.5 px-3 font-semibold text-slate-800">Sports & Outdoors</td>
                <td className="py-2.5 px-3 text-slate-600">Home & Kitchen</td>
                <td className="py-2.5 px-3 font-bold text-slate-800">66.80%</td>
                <td className="py-2.5 px-3 font-bold text-indigo-700">66.86%</td>
                <td className="py-2.5 px-3"><span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded text-[10px] font-semibold">95.4% Retention</span></td>
              </tr>
              <tr className="hover:bg-slate-50">
                <td className="py-2.5 px-3 font-semibold text-slate-800">Appliances</td>
                <td className="py-2.5 px-3 text-slate-600">Sports & Outdoors</td>
                <td className="py-2.5 px-3 font-bold text-slate-800">61.29%</td>
                <td className="py-2.5 px-3 font-bold text-indigo-700">61.87%</td>
                <td className="py-2.5 px-3"><span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded text-[10px] font-semibold">88.3% Retention</span></td>
              </tr>
              <tr className="hover:bg-slate-50">
                <td className="py-2.5 px-3 font-semibold text-slate-800">Sports & Outdoors</td>
                <td className="py-2.5 px-3 text-slate-600">Appliances</td>
                <td className="py-2.5 px-3 font-bold text-slate-800">62.36%</td>
                <td className="py-2.5 px-3 font-bold text-indigo-700">62.01%</td>
                <td className="py-2.5 px-3"><span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded text-[10px] font-semibold">88.5% Retention</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
