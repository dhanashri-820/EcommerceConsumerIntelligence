import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import { GlassCard } from '../components/GlassCard';
import { ModelBarChart } from '../components/ModelBarChart';
import { ConfusionMatrixGrid } from '../components/ConfusionMatrixGrid';
import { PerClassF1Bars } from '../components/PerClassF1Bars';
import { ModelDisagreementViewer } from '../components/ModelDisagreementViewer';
import { exportToCsv, exportToJson } from '../lib/export';
import {
  AlertCircle,
  RefreshCw,
  Trophy,
  Cpu,
  Download,
} from 'lucide-react';

export const Models: React.FC = () => {
  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ['metrics'],
    queryFn: () => api.getMetrics(),
  });

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-10 w-64 bg-slate-200 rounded-lg" />
        <div className="h-80 bg-white rounded-xl border border-slate-200" />
        <div className="h-96 bg-white rounded-xl border border-slate-200" />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <GlassCard glow="red" className="p-8 text-center max-w-lg mx-auto my-12">
        <div className="w-12 h-12 rounded-full bg-rose-50 border border-rose-200 flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="w-6 h-6 text-rose-600" />
        </div>
        <h3 className="text-base font-bold text-slate-900 mb-2">Failed to load model metrics</h3>
        <p className="text-xs text-rose-600 font-mono mb-6">
          {error instanceof Error ? error.message : 'Backend connection error at /api/models/metrics'}
        </p>
        <button
          onClick={() => refetch()}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-rose-600 text-white hover:bg-rose-700 text-xs font-mono font-semibold transition-all shadow-sm"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Retry Connection</span>
        </button>
      </GlassCard>
    );
  }

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-indigo-600 uppercase tracking-wider mb-1">
            <Cpu className="w-4 h-4" />
            <span>Benchmark Suite</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900 flex items-center gap-3">
            <span>Model Comparison</span>
            <span className="text-xs font-mono font-normal px-2.5 py-1 rounded-md bg-indigo-50 border border-indigo-200 text-indigo-700">
              DistilBERT + TF-IDF Baselines
            </span>
          </h1>
        </div>

        {/* Right Header Controls */}
        <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
          <button
            onClick={() => exportToCsv('Model_Benchmark_Metrics.csv', data.metrics)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 shadow-sm transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-sky-600" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={() => exportToJson('Model_Evaluation_Full.json', data)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 shadow-sm transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-indigo-600" />
            <span>Export JSON</span>
          </button>
          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 border border-slate-200 text-slate-600 shadow-sm transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? 'animate-spin text-indigo-600' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Section 1: Benchmark Winner Callout */}
      <GlassCard className="p-6 border-indigo-200 bg-gradient-to-r from-indigo-50/70 via-white to-sky-50/40 relative overflow-hidden">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-indigo-600 flex items-center justify-center shrink-0 shadow-sm shadow-indigo-200 text-white">
              <Trophy className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded">
                  Top Performing Architecture
                </span>
                <span className="text-xs text-slate-500 font-mono">
                  Evaluated on 3,000 Held-Out Reviews
                </span>
              </div>
              <h2 className="text-xl font-bold text-slate-900">
                DistilBERT Fine-Tuned Transformer
              </h2>
              <p className="text-xs text-slate-600 mt-1 max-w-2xl leading-relaxed">
                Outperforms Bag-of-Words baselines by capturing bi-directional contextual embeddings and resolving nuanced sentiment, clause boundaries, and subtle negations.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 bg-white px-5 py-3 rounded-xl border border-indigo-100 shadow-sm shrink-0">
            <div>
              <div className="text-[10px] font-mono uppercase tracking-wider text-slate-500">
                Accuracy Advantage
              </div>
              <div className="text-2xl font-extrabold font-mono text-emerald-600">
                +4.13%
              </div>
              <div className="text-[10px] text-slate-500">vs Logistic Regression</div>
            </div>
            <div className="h-8 w-[1px] bg-slate-200" />
            <div>
              <div className="text-[10px] font-mono uppercase tracking-wider text-slate-500">
                Macro F1 Delta
              </div>
              <div className="text-2xl font-extrabold font-mono text-indigo-600">
                +4.03%
              </div>
              <div className="text-[10px] text-slate-500">74.11% vs 70.08%</div>
            </div>
          </div>
        </div>
      </GlassCard>

      {/* Section 2: Overall Metrics Comparison Chart */}
      <GlassCard className="p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6 pb-4 border-b border-slate-200">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Comparative Metric Benchmarking
            </h3>
            <p className="text-xs text-slate-500">
              Test Split: 3,000 Amazon Reviews (Stratified 1:1:1 across Negative, Neutral, Positive)
            </p>
          </div>
        </div>

        <ModelBarChart metrics={data.metrics} />
      </GlassCard>

      {/* Section 3: Per-Class F1 Analysis */}
      <GlassCard className="p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6 pb-4 border-b border-slate-200">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Per-Class F1-Score Breakdown
            </h3>
            <p className="text-xs text-slate-500">
              Highlights the challenge of the Neutral class across all architectures
            </p>
          </div>
        </div>

        <PerClassF1Bars metrics={data.metrics} />
      </GlassCard>

      {/* Section 4: Confusion Matrices */}
      <div className="space-y-4">
        <div>
          <h3 className="text-base font-bold text-slate-900">
            Confusion Matrices (Held-out Test Evaluation)
          </h3>
          <p className="text-xs text-slate-500">
            Row-normalized and absolute counts for test sample predictions ($N=1,000$ per ground truth class)
          </p>
        </div>

        <ConfusionMatrixGrid matrices={data.confusionMatrices} />
      </div>

      {/* Section 5: Academic Disagreement Viewer */}
      <ModelDisagreementViewer />
    </div>
  );
};
