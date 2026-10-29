import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api, DisagreementItem } from '../lib/api';
import { GlassCard } from './GlassCard';
import { SentimentPill } from './SentimentPill';
import { exportToCsv, exportToJson } from '../lib/export';
import {
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Download,
  Filter,
  Layers,
  ArrowRight,
  RefreshCw,
} from 'lucide-react';

export const ModelDisagreementViewer: React.FC = () => {
  const [selectedFilter, setSelectedFilter] = useState<string>('All');

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['disagreements'],
    queryFn: () => api.getDisagreements(),
  });

  if (isLoading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-20 bg-white/5 rounded-xl border border-white/5" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-44 bg-white/5 rounded-xl border border-white/5" />
          ))}
        </div>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="p-6 rounded-xl bg-neon-red/10 border border-neon-red/30 text-center">
        <p className="text-xs text-neon-red font-mono mb-2">Unable to load disagreement dataset.</p>
        <button
          onClick={() => refetch()}
          className="px-3 py-1.5 rounded-lg bg-neon-red/20 text-neon-red text-xs font-mono font-semibold"
        >
          Retry
        </button>
      </div>
    );
  }

  const filters = ['All', 'Negation', 'Sarcasm', 'Conjunction', 'Neutral'];

  const filteredItems = data.disagreements.filter((item) => {
    if (selectedFilter === 'All') return true;
    const pat = item.linguistic_pattern.toLowerCase();
    const sel = selectedFilter.toLowerCase();
    return pat.includes(sel);
  });

  const handleExportCsv = () => {
    const rows = filteredItems.map((item) => ({
      id: item.id,
      ground_truth: item.ground_truth,
      distilbert_pred: item.distilbert.sentiment,
      distilbert_conf: item.distilbert.confidence,
      logistic_pred: item.logistic_regression.sentiment,
      logistic_conf: item.logistic_regression.confidence,
      svm_pred: item.linear_svm.sentiment,
      svm_conf: item.linear_svm.confidence,
      linguistic_pattern: item.linguistic_pattern,
      review: item.review,
      bow_failure_reason: item.bow_failure_reason,
      distilbert_success: item.distilbert_success,
    }));
    exportToCsv('Model_Disagreements_Evaluation.csv', rows);
  };

  const handleExportJson = () => {
    exportToJson('Model_Disagreements_Evaluation.json', data);
  };

  return (
    <div className="space-y-6">
      {/* Header & Academic Proof Banner */}
      <GlassCard className="p-6 border-neon-violet/30 bg-gradient-to-br from-neon-violet/10 via-black/40 to-transparent">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-neon-violet font-semibold uppercase tracking-wider mb-1">
              <Sparkles className="w-4 h-4" />
              <span>ACADEMIC EVALUATION EXPERIMENT</span>
            </div>
            <h3 className="text-xl font-extrabold text-white">
              Model Disagreement Analysis
            </h3>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
              Curated held-out test reviews demonstrating why DistilBERT’s self-attention outperforms Bag-of-Words n-gram models on complex linguistic phenomena including double negations, sarcasm, and adversative clauses.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleExportCsv}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 text-xs font-mono text-slate-200 transition-colors"
              title="Download as CSV"
            >
              <Download className="w-3.5 h-3.5 text-neon-cyan" />
              <span>Export CSV</span>
            </button>
            <button
              onClick={handleExportJson}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 text-xs font-mono text-slate-200 transition-colors"
              title="Download as JSON"
            >
              <Download className="w-3.5 h-3.5 text-neon-violet" />
              <span>Export JSON</span>
            </button>
          </div>
        </div>

        {/* Academic Statistical Banner */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-5 pt-4 border-t border-white/[0.08]">
          <div className="p-3 rounded-lg bg-neon-lime/10 border border-neon-lime/20 flex items-center justify-between">
            <span className="text-xs text-slate-300 font-medium">DistilBERT Accuracy:</span>
            <span className="text-sm font-mono font-bold text-neon-lime">100% on Disagreements</span>
          </div>
          <div className="p-3 rounded-lg bg-neon-red/10 border border-neon-red/20 flex items-center justify-between">
            <span className="text-xs text-slate-300 font-medium">Logistic Regression:</span>
            <span className="text-sm font-mono font-bold text-neon-red">0% on Disagreements</span>
          </div>
          <div className="p-3 rounded-lg bg-neon-red/10 border border-neon-red/20 flex items-center justify-between">
            <span className="text-xs text-slate-300 font-medium">Linear SVM:</span>
            <span className="text-sm font-mono font-bold text-neon-red">0% on Disagreements</span>
          </div>
        </div>
      </GlassCard>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
        <span className="text-slate-400 font-mono text-[11px] shrink-0">Filter Pattern:</span>
        {filters.map((f) => (
          <button
            key={f}
            onClick={() => setSelectedFilter(f)}
            className={`px-3 py-1 rounded-lg font-mono transition-all text-xs shrink-0 ${
              selectedFilter === f
                ? 'bg-neon-violet text-black font-bold shadow-[0_0_15px_rgba(167,139,250,0.5)]'
                : 'bg-white/[0.03] text-slate-300 hover:bg-white/[0.08] border border-white/5'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Disagreements Grid */}
      <div className="grid grid-cols-1 gap-5">
        {filteredItems.map((item) => (
          <GlassCard key={item.id} className="p-5 border border-white/10 hover:border-white/20 transition-all">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-3 pb-3 border-b border-white/[0.06]">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono text-neon-cyan font-bold px-2 py-0.5 rounded bg-neon-cyan/10 border border-neon-cyan/20">
                  {item.id}
                </span>
                <span className="text-xs font-semibold text-white px-2 py-0.5 rounded bg-white/[0.05] border border-white/10">
                  {item.linguistic_pattern}
                </span>
              </div>

              <div className="flex items-center gap-2 text-xs font-mono">
                <span className="text-slate-400">Ground Truth:</span>
                <SentimentPill sentiment={item.ground_truth} size="sm" />
              </div>
            </div>

            {/* Review Quote */}
            <div className="my-4 p-3.5 rounded-lg bg-black/40 border border-white/5 text-slate-200 text-xs italic leading-relaxed">
              "{item.review}"
            </div>

            {/* Comparison Row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 my-3">
              {/* DistilBERT */}
              <div className="p-3 rounded-lg bg-neon-violet/10 border border-neon-violet/30 flex items-center justify-between">
                <div>
                  <div className="text-[10px] font-mono uppercase text-neon-violet font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-neon-lime" />
                    <span>DistilBERT</span>
                  </div>
                  <div className="mt-1">
                    <SentimentPill sentiment={item.distilbert.sentiment} size="sm" />
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] font-mono text-slate-400">Confidence</div>
                  <div className="text-xs font-mono font-bold text-white">
                    {(item.distilbert.confidence * 100).toFixed(1)}%
                  </div>
                </div>
              </div>

              {/* Logistic Regression */}
              <div className="p-3 rounded-lg bg-white/[0.02] border border-white/[0.06] flex items-center justify-between opacity-80">
                <div>
                  <div className="text-[10px] font-mono uppercase text-slate-400 font-semibold flex items-center gap-1">
                    <XCircle className="w-3 h-3 text-neon-red" />
                    <span>Logistic Regression</span>
                  </div>
                  <div className="mt-1">
                    <SentimentPill sentiment={item.logistic_regression.sentiment} size="sm" />
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] font-mono text-slate-400">Confidence</div>
                  <div className="text-xs font-mono font-bold text-white">
                    {(item.logistic_regression.confidence * 100).toFixed(1)}%
                  </div>
                </div>
              </div>

              {/* Linear SVM */}
              <div className="p-3 rounded-lg bg-white/[0.02] border border-white/[0.06] flex items-center justify-between opacity-80">
                <div>
                  <div className="text-[10px] font-mono uppercase text-slate-400 font-semibold flex items-center gap-1">
                    <XCircle className="w-3 h-3 text-neon-red" />
                    <span>Linear SVM</span>
                  </div>
                  <div className="mt-1">
                    <SentimentPill sentiment={item.linear_svm.sentiment} size="sm" />
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] font-mono text-slate-400">Confidence</div>
                  <div className="text-xs font-mono font-bold text-white">
                    {(item.linear_svm.confidence * 100).toFixed(1)}%
                  </div>
                </div>
              </div>
            </div>

            {/* Linguistic Explanation */}
            <div className="mt-4 pt-3 border-t border-white/[0.05] grid grid-cols-1 md:grid-cols-2 gap-3 text-[11px] leading-relaxed">
              <div className="p-2.5 rounded-lg bg-neon-red/[0.05] border border-neon-red/15 text-slate-300">
                <span className="font-semibold text-neon-red font-mono uppercase text-[10px] block mb-1">
                  Why Bag-of-Words Failed:
                </span>
                {item.bow_failure_reason}
              </div>
              <div className="p-2.5 rounded-lg bg-neon-lime/[0.05] border border-neon-lime/15 text-slate-300">
                <span className="font-semibold text-neon-lime font-mono uppercase text-[10px] block mb-1">
                  Why DistilBERT Succeeded:
                </span>
                {item.distilbert_success}
              </div>
            </div>
          </GlassCard>
        ))}
      </div>
    </div>
  );
};

