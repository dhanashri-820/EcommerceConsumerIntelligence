import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import { GlassCard } from '../components/GlassCard';
import { ModelBarChart } from '../components/ModelBarChart';
import { ConfusionMatrixGrid } from '../components/ConfusionMatrixGrid';
import { PerClassF1Bars } from '../components/PerClassF1Bars';
import { ModelDisagreementViewer } from '../components/ModelDisagreementViewer';
import { ModelCardModal } from '../components/ModelCardModal';
import { exportToCsv, exportToJson } from '../lib/export';
import {
  AlertCircle,
  RefreshCw,
  Trophy,
  Cpu,
  Download,
  FileCode2,
} from 'lucide-react';

export const Models: React.FC = () => {
  const [isModelCardOpen, setIsModelCardOpen] = useState(false);

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
        <div className="h-10 w-72 bg-white/5 rounded-lg" />
        <div className="h-80 bg-white/5 rounded-xl border border-white/5" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-64 bg-white/5 rounded-xl border border-white/5" />
          ))}
        </div>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <GlassCard glow="red" className="p-8 text-center max-w-lg mx-auto my-12">
        <div className="w-12 h-12 rounded-full bg-neon-red/10 border border-neon-red/30 flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="w-6 h-6 text-neon-red" />
        </div>
        <h3 className="text-base font-bold text-white mb-2">Failed to load model metrics</h3>
        <p className="text-xs text-neon-red/80 font-mono mb-6">
          {error instanceof Error ? error.message : 'Backend connection error at /api/models/metrics'}
        </p>
        <button
          onClick={() => refetch()}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-neon-red/20 border border-neon-red/40 text-neon-red hover:bg-neon-red/30 text-xs font-mono font-semibold transition-all"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Retry Connection</span>
        </button>
      </GlassCard>
    );
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-white/[0.06]">
        <div>
          <div className="text-xs uppercase tracking-[0.3em] text-neon-cyan font-mono font-semibold mb-1 flex items-center gap-2">
            <span>MODEL BENCHMARKING SUITE</span>
            {isFetching && (
              <RefreshCw className="w-3 h-3 text-neon-cyan animate-spin inline" />
            )}
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white flex items-center gap-3">
            <span>Model Comparison</span>
            <span className="text-xs font-mono font-normal px-2.5 py-1 rounded-md bg-neon-violet/20 border border-neon-violet/30 text-violet-300">
              DistilBERT + TF-IDF Baselines
            </span>
          </h1>
        </div>

        {/* Right Header Controls */}
        <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
          <button
            onClick={() => setIsModelCardOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neon-violet/15 hover:bg-neon-violet/25 border border-neon-violet/30 text-violet-300 font-semibold transition-colors"
          >
            <FileCode2 className="w-3.5 h-3.5 text-neon-violet" />
            <span>Model Card</span>
          </button>
          <button
            onClick={() => exportToCsv('Model_Benchmark_Metrics.csv', data.metrics)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 text-slate-200 transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-neon-cyan" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={() => exportToJson('Model_Evaluation_Full.json', data)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 text-slate-200 transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-neon-violet" />
            <span>Export JSON</span>
          </button>
          <div className="px-3 py-1.5 rounded-lg bg-white/[0.03] border border-white/10 text-slate-300">
            N = 1,000 / class
          </div>
          <div className="px-3 py-1.5 rounded-lg bg-neon-violet/10 border border-neon-violet/30 text-neon-violet font-semibold flex items-center gap-1.5">
            <Trophy className="w-3.5 h-3.5" />
            <span>Test: 3,000</span>
          </div>
        </div>
      </div>

      {/* Section 1: Grouped Bar Chart Card */}
      <GlassCard className="p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-neon-cyan font-semibold">
              OVERALL PERFORMANCE
            </span>
            <h3 className="text-lg font-bold text-white mt-0.5">
              Accuracy & F1 Benchmark Comparison
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Side-by-side performance across TF-IDF + Logistic Regression, TF-IDF + Linear SVM, and fine-tuned DistilBERT.
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
            <Cpu className="w-4 h-4 text-neon-cyan" />
            <span>3 Architectures Evaluated</span>
          </div>
        </div>

        <ModelBarChart metrics={data.metrics} height={320} />
      </GlassCard>

      {/* Section 2: Confusion Matrices Row */}
      <div className="space-y-4">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-neon-cyan font-semibold">
            ERROR ANALYSIS
          </span>
          <h3 className="text-lg font-bold text-white mt-0.5">
            Confusion Heatmaps by Architecture
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Normalized classification confusion matrices. Intensity levels highlight true positives versus misclassifications.
          </p>
        </div>

        <ConfusionMatrixGrid matrices={data.confusionMatrices} />
      </div>

      {/* Section 3: Per-Class F1 Bars Card */}
      <GlassCard className="p-6">
        <div className="mb-6">
          <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-neon-cyan font-semibold">
            CLASS-LEVEL GRANULARITY
          </span>
          <h3 className="text-lg font-bold text-white mt-0.5">
            Per-Class F1 Score Breakdown
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Examines neutral class challenge vs positive and negative sentiment recognition across models.
          </p>
        </div>

        <PerClassF1Bars metrics={data.metrics} />
      </GlassCard>

      {/* Section 4: Academic Disagreement Viewer */}
      <ModelDisagreementViewer />

      {/* Academic Model Card Modal */}
      <ModelCardModal
        isOpen={isModelCardOpen}
        onClose={() => setIsModelCardOpen(false)}
      />
    </div>
  );
};
