import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import { GlassCard } from '../components/GlassCard';
import { InsightCard } from '../components/InsightCard';
import { WordCloudVisualizer } from '../components/WordCloudVisualizer';
import { exportToCsv, exportToJson } from '../lib/export';
import {
  AlertCircle,
  RefreshCw,
  MessageSquareQuote,
  Sparkles,
  Download,
} from 'lucide-react';

export const Insights: React.FC = () => {
  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ['insights'],
    queryFn: () => api.getInsights(),
  });

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-10 w-72 bg-white/5 rounded-lg" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-48 bg-white/5 rounded-xl border border-white/5" />
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
        <h3 className="text-base font-bold text-white mb-2">Failed to load consumer insights</h3>
        <p className="text-xs text-neon-red/80 font-mono mb-6">
          {error instanceof Error ? error.message : 'Backend connection error at /api/insights'}
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
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-white/[0.06]">
        <div>
          <div className="text-xs uppercase tracking-[0.3em] text-neon-cyan font-mono font-semibold mb-1 flex items-center gap-2">
            <span>VOICE OF CUSTOMER MINING</span>
            {isFetching && (
              <RefreshCw className="w-3 h-3 text-neon-cyan animate-spin inline" />
            )}
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white flex items-center gap-3">
            <span>Actionable Insights</span>
            <span className="text-xs font-mono font-normal px-2.5 py-1 rounded-md bg-neon-lime/10 border border-neon-lime/30 text-neon-lime">
              NLP Clustering & Extraction
            </span>
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
          <button
            onClick={() => exportToCsv('Consumer_Insights_Recommendations.csv', data)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 text-slate-200 transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-neon-cyan" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={() => exportToJson('Consumer_Insights_Full.json', data)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 text-slate-200 transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-neon-violet" />
            <span>Export JSON</span>
          </button>
          <div className="px-3 py-1.5 rounded-lg bg-white/[0.03] border border-white/10 text-slate-300">
            {data.length} Strategic Drivers
          </div>
          <div className="px-3 py-1.5 rounded-lg bg-neon-lime/10 border border-neon-lime/30 text-neon-lime font-semibold flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Prioritized ROI</span>
          </div>
        </div>
      </div>

      {/* Description Banner */}
      <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] flex items-start gap-3">
        <MessageSquareQuote className="w-5 h-5 text-neon-cyan shrink-0 mt-0.5" />
        <p className="text-xs text-slate-300 leading-relaxed">
          High-frequency customer complaints and praised features extracted using n-gram collocation frequency and aspect-sentiment correlation. Prioritized recommendations include projected product, fulfillment, and marketing impact.
        </p>
      </div>

      {/* Interactive Word Cloud Visualizer */}
      <WordCloudVisualizer />

      {/* Cards Grid (md:grid-cols-2) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {data.map((insight, idx) => (
          <InsightCard key={idx} insight={insight} index={idx} />
        ))}
      </div>
    </div>
  );
};
