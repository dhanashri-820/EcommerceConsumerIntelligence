import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import { KpiCard } from '../components/KpiCard';
import { DonutChart } from '../components/DonutChart';
import { GlassCard } from '../components/GlassCard';
import { exportToCsv, exportToJson } from '../lib/export';
import { AlertCircle, RefreshCw, Layers, Download } from 'lucide-react';

export const Overview: React.FC = () => {
  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ['overview'],
    queryFn: () => api.getOverview(),
  });

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-10 w-72 bg-white/5 rounded-lg" />
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-white/5 rounded-xl border border-white/5" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="h-80 bg-white/5 rounded-xl border border-white/5" />
          <div className="lg:col-span-2 h-80 bg-white/5 rounded-xl border border-white/5" />
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
        <h3 className="text-base font-bold text-white mb-2">Failed to load overview data</h3>
        <p className="text-xs text-neon-red/80 font-mono mb-6">
          {error instanceof Error ? error.message : 'Backend connection error at /api/overview'}
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

  const totalReviews = data.totalReviews || 45000;
  const bestF1 = data.bestModelF1 ?? 74.11;

  // Sparkline mockup points for visual trend
  const sparkTotal = [38, 40, 42, 41, 43, 44, 45];
  const sparkPos = [31, 32, 32.5, 33, 33.1, 33.3];
  const sparkNeg = [35, 34.5, 34, 33.8, 33.5, 33.3];

  return (
    <div className="space-y-7">
      {/* Header Strip */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2">
        <div>
          <div className="text-xs uppercase tracking-[0.3em] text-neon-cyan font-mono font-semibold mb-1 flex items-center gap-2">
            <span>REAL-TIME · {totalReviews.toLocaleString()} REVIEWS</span>
            {isFetching && (
              <RefreshCw className="w-3 h-3 text-neon-cyan animate-spin inline" />
            )}
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white">
            Consumer Intelligence / <span className="text-slate-400 font-medium">Command Center</span>
          </h1>
        </div>

        {/* Three model pills & Export */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => exportToCsv('Domains_Overview.csv', data.domains)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 text-xs font-mono text-slate-200 transition-colors"
            title="Download domains summary CSV"
          >
            <Download className="w-3.5 h-3.5 text-neon-cyan" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={() => exportToJson('Overview_Metrics.json', data)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 text-xs font-mono text-slate-200 transition-colors"
            title="Download full overview JSON"
          >
            <Download className="w-3.5 h-3.5 text-neon-violet" />
            <span>Export JSON</span>
          </button>
          <div className="px-3 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-neon-cyan text-xs font-mono font-medium flex items-center gap-1.5 shadow-[0_0_15px_rgba(34,211,238,0.2)]">
            <span className="w-1.5 h-1.5 rounded-full bg-neon-cyan" />
            <span>LR · 69.9%</span>
          </div>
          <div className="px-3 py-1.5 rounded-full bg-lime-500/10 border border-lime-500/30 text-neon-lime text-xs font-mono font-medium flex items-center gap-1.5 shadow-[0_0_15px_rgba(163,230,53,0.2)]">
            <span className="w-1.5 h-1.5 rounded-full bg-neon-lime" />
            <span>Linear SVM · 67.5%</span>
          </div>
          <div className="px-3 py-1.5 rounded-full bg-violet-500/20 border border-violet-500/40 text-violet-300 text-xs font-mono font-bold flex items-center gap-1.5 shadow-[0_0_15px_rgba(167,139,250,0.3)]">
            <span className="w-1.5 h-1.5 rounded-full bg-neon-violet" />
            <span>DistilBERT · 74.1% ★</span>
          </div>
        </div>
      </div>

      {/* Row 1: 4 KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <KpiCard
          label="Total Reviews"
          value={totalReviews.toLocaleString()}
          delta="+8.4%"
          deltaPositive={true}
          sparklineData={sparkTotal}
          accentColor="#22d3ee"
          glow="cyan"
          subtitle="3 balanced domains"
        />

        <KpiCard
          label="Positive Sentiment"
          value={`${data.positivePct}%`}
          delta="+2.1%"
          deltaPositive={true}
          sparklineData={sparkPos}
          accentColor="#a3e635"
          glow="lime"
          subtitle={`${data.distribution.positive.toLocaleString()} records`}
        />

        <KpiCard
          label="Negative Sentiment"
          value={`${data.negativePct}%`}
          delta="-1.8%"
          deltaPositive={true}
          sparklineData={sparkNeg}
          accentColor="#f472b6"
          glow="pink"
          subtitle={`${data.distribution.negative.toLocaleString()} records`}
        />

        <KpiCard
          label="Benchmark Winner"
          value={`${bestF1}%`}
          subtitle="DistilBERT · Macro F1"
          accentColor="#a78bfa"
          glow="violet"
          progressBar={{
            value: bestF1,
            max: 100,
            label: 'Benchmark Target (80%)',
          }}
        />
      </div>

      {/* Row 2: Donut + Domain Bars */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Donut Card (col-span-1) */}
        <GlassCard className="p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-neon-cyan font-semibold">
                CLASS POLARITY
              </span>
              <h3 className="text-base font-bold text-white mt-0.5">Sentiment Distribution</h3>
            </div>
            <span className="text-xs font-mono text-slate-500">N=45K</span>
          </div>

          <DonutChart
            distribution={data.distribution}
            positivePct={data.positivePct}
            neutralPct={data.neutralPct}
            negativePct={data.negativePct}
            height={240}
          />

          <div className="mt-4 pt-3 border-t border-white/[0.06] text-center text-[11px] font-mono text-slate-500">
            Home & Kitchen · Appliances · Sports & Outdoors
          </div>
        </GlassCard>

        {/* Domain Bars (col-span-2) */}
        <GlassCard className="lg:col-span-2 p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-neon-cyan font-semibold">
                  CROSS-DOMAIN GENERALIZATION
                </span>
                <h3 className="text-base font-bold text-white mt-0.5">Domain Breakdown & Coverage</h3>
              </div>
              <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
                <Layers className="w-3.5 h-3.5 text-neon-cyan" />
                <span>3 Benchmark Datasets</span>
              </div>
            </div>

            <div className="space-y-5">
              {data.domains.map((domain) => {
                const maxReviews = 15000;
                const fillPct = Math.min(100, Math.round((domain.count / maxReviews) * 100));

                return (
                  <div key={domain.name} className="space-y-2 group">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <span className="text-sm font-semibold text-slate-200 group-hover:text-white transition-colors">
                          {domain.name}
                        </span>
                        {domain.role && (
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/[0.04] text-slate-400 border border-white/[0.06]">
                            {domain.role}
                          </span>
                        )}
                      </div>

                      {/* Right-aligned mono stats: count · avgRating */}
                      <div className="text-xs font-mono text-slate-300 font-medium">
                        <span>{domain.count.toLocaleString()}</span>
                        <span className="text-slate-600 mx-1.5">·</span>
                        <span className="text-neon-amber">★ {domain.avgRating.toFixed(2)}</span>
                      </div>
                    </div>

                    {/* Horizontal gradient bar with width animation */}
                    <div className="w-full h-3 bg-white/[0.04] rounded-full overflow-hidden p-0.5 border border-white/[0.04]">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-neon-cyan via-neon-violet to-neon-lime transition-all duration-1000 ease-out"
                        style={{
                          width: `${fillPct}%`,
                          boxShadow: '0 0 12px rgba(34,211,238,0.4)',
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-white/[0.06] flex flex-wrap items-center justify-between text-[11px] font-mono text-slate-400 gap-2">
            <span>Primary Training Domain: Home & Kitchen (80/20 train-test split)</span>
            <span className="text-neon-lime font-semibold">100% Balanced Class Distribution</span>
          </div>
        </GlassCard>
      </div>
    </div>
  );
};
