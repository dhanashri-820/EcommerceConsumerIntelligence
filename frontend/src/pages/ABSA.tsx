import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import { GlassCard } from '../components/GlassCard';
import { AspectRadar } from '../components/AspectRadar';
import { AspectPolarityBars } from '../components/AspectPolarityBars';
import { exportToCsv, exportToJson } from '../lib/export';
import { AlertCircle, RefreshCw, Compass, Sliders, Download } from 'lucide-react';

export const ABSA: React.FC = () => {
  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ['aspects'],
    queryFn: () => api.getAspectsSummary(),
  });

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-10 w-72 bg-white/5 rounded-lg" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-96 bg-white/5 rounded-xl border border-white/5" />
          <div className="h-96 bg-white/5 rounded-xl border border-white/5" />
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
        <h3 className="text-base font-bold text-white mb-2">Failed to load aspect summary</h3>
        <p className="text-xs text-neon-red/80 font-mono mb-6">
          {error instanceof Error ? error.message : 'Backend connection error at /api/aspects/summary'}
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

  // Calculate total aspect mentions
  const totalMentions = data.reduce((acc, curr) => acc + curr.positive + curr.neutral + curr.negative, 0);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-white/[0.06]">
        <div>
          <div className="text-xs uppercase tracking-[0.3em] text-neon-cyan font-mono font-semibold mb-1 flex items-center gap-2">
            <span>ASPECT-BASED SENTIMENT ANALYSIS</span>
            {isFetching && (
              <RefreshCw className="w-3 h-3 text-neon-cyan animate-spin inline" />
            )}
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white flex items-center gap-3">
            <span>Aspect Radar & Polarity</span>
            <span className="text-xs font-mono font-normal px-2.5 py-1 rounded-md bg-neon-cyan/10 border border-neon-cyan/30 text-neon-cyan">
              6 Core Product Dimensions
            </span>
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
          <button
            onClick={() => exportToCsv('Aspect_Sentiment_Breakdown.csv', data)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 text-slate-200 transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-neon-cyan" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={() => exportToJson('Aspect_Sentiment_Full.json', data)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 text-slate-200 transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-neon-violet" />
            <span>Export JSON</span>
          </button>
          <div className="px-3 py-1.5 rounded-lg bg-white/[0.03] border border-white/10 text-slate-300">
            Total Mentions: {totalMentions.toLocaleString()}
          </div>
          <div className="px-3 py-1.5 rounded-lg bg-neon-cyan/10 border border-neon-cyan/30 text-neon-cyan font-semibold flex items-center gap-1.5">
            <Compass className="w-3.5 h-3.5" />
            <span>Multi-Clause ABSA</span>
          </div>
        </div>
      </div>

      {/* 2-column Grid (lg:grid-cols-2) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Radar Chart Card */}
        <GlassCard className="p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-neon-cyan font-semibold">
                  HEXAGONAL MULTI-AXIS RADAR
                </span>
                <h3 className="text-base font-bold text-white mt-0.5">
                  Aspect Sentiment Coverage
                </h3>
              </div>
              <Compass className="w-4 h-4 text-neon-cyan" />
            </div>
            <p className="text-xs text-slate-400 mb-2">
              Visualizes relative strength of positive sentiment across Quality, Price, Delivery, Durability, Design, and Usability.
            </p>
          </div>

          <AspectRadar aspects={data} height={340} />

          <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between text-[11px] font-mono text-slate-500">
            <span>Grid Rings: 25% · 50% · 75% · 100%</span>
            <span className="text-neon-cyan">Transformer Clause Extraction</span>
          </div>
        </GlassCard>

        {/* Polarity Distribution Card */}
        <GlassCard className="p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-neon-cyan font-semibold">
                  POLARITY BREAKDOWN
                </span>
                <h3 className="text-base font-bold text-white mt-0.5">
                  Aspect Polarity Distribution
                </h3>
              </div>
              <Sliders className="w-4 h-4 text-neon-lime" />
            </div>
            <p className="text-xs text-slate-400 mb-6">
              Positive (lime), neutral (amber), and negative (red) distributions per extracted aspect with exact percentage ratios.
            </p>

            <AspectPolarityBars aspects={data} />
          </div>

          <div className="mt-6 pt-4 border-t border-white/[0.06] flex items-center justify-between text-[11px] font-mono text-slate-500">
            <span>Ratios formatted as: Pos % / Neu % / Neg %</span>
            <span className="text-neon-lime font-semibold">Usability & Design Lead Praise</span>
          </div>
        </GlassCard>
      </div>
    </div>
  );
};
