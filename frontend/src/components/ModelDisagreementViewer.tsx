import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api, DisagreementItem } from '../lib/api';
import { GlassCard } from './GlassCard';
import { SentimentPill } from './SentimentPill';
import { exportToCsv, exportToJson } from '../lib/export';
import {
  Sparkles,
  CheckCircle2,
  XCircle,
  Download,
  Filter,
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
        <div className="h-20 bg-slate-200 rounded-xl" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-44 bg-white rounded-xl border border-slate-200" />
          ))}
        </div>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="p-6 rounded-xl bg-rose-50 border border-rose-200 text-center">
        <p className="text-xs text-rose-700 font-mono mb-2">Unable to load disagreement dataset.</p>
        <button
          onClick={() => refetch()}
          className="px-3 py-1.5 rounded-lg bg-rose-600 text-white text-xs font-mono font-semibold hover:bg-rose-700 transition-colors"
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
      <GlassCard className="p-6 border-indigo-200 bg-gradient-to-r from-indigo-50/50 via-white to-sky-50/30">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-indigo-700 font-semibold uppercase tracking-wider mb-1">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              <span>Academic Evaluation Experiment</span>
            </div>
            <h3 className="text-xl font-extrabold text-slate-900">
              Model Disagreement Analysis
            </h3>
            <p className="text-xs text-slate-600 mt-1 max-w-2xl leading-relaxed">
              Curated held-out test reviews demonstrating why DistilBERT’s self-attention outperforms Bag-of-Words n-gram models on complex linguistic phenomena including double negations, sarcasm, and adversative clauses.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleExportCsv}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 border border-slate-200 text-xs font-mono text-slate-700 shadow-sm transition-colors"
              title="Download as CSV"
            >
              <Download className="w-3.5 h-3.5 text-sky-600" />
              <span>Export CSV</span>
            </button>
            <button
              onClick={handleExportJson}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 border border-slate-200 text-xs font-mono text-slate-700 shadow-sm transition-colors"
              title="Download as JSON"
            >
              <Download className="w-3.5 h-3.5 text-indigo-600" />
              <span>Export JSON</span>
            </button>
          </div>
        </div>

        {/* Academic Statistical Banner */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-5 pt-4 border-t border-slate-200">
          <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-between">
            <span className="text-xs text-emerald-900 font-medium">DistilBERT Accuracy:</span>
            <span className="text-sm font-mono font-bold text-emerald-700">100% on Disagreements</span>
          </div>
          <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 flex items-center justify-between">
            <span className="text-xs text-rose-900 font-medium">Logistic Regression:</span>
            <span className="text-sm font-mono font-bold text-rose-700">0% on Disagreements</span>
          </div>
          <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 flex items-center justify-between">
            <span className="text-xs text-rose-900 font-medium">Linear SVM:</span>
            <span className="text-sm font-mono font-bold text-rose-700">0% on Disagreements</span>
          </div>
        </div>
      </GlassCard>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
        <span className="text-slate-500 font-mono text-[11px] shrink-0">Filter Pattern:</span>
        {filters.map((f) => (
          <button
            key={f}
            onClick={() => setSelectedFilter(f)}
            className={`px-3 py-1 rounded-lg font-mono transition-all text-xs shrink-0 ${
              selectedFilter === f
                ? 'bg-indigo-600 text-white font-semibold shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Disagreements Grid */}
      <div className="grid grid-cols-1 gap-5">
        {filteredItems.map((item) => (
          <GlassCard key={item.id} className="p-5 border border-slate-200 hover:border-slate-300 shadow-sm transition-all">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-3 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono text-sky-700 font-bold px-2 py-0.5 rounded bg-sky-50 border border-sky-200">
                  {item.id}
                </span>
                <span className="text-xs font-semibold text-slate-700 px-2.5 py-0.5 rounded bg-slate-100 border border-slate-200">
                  {item.linguistic_pattern}
                </span>
              </div>

              <div className="flex items-center gap-2 text-xs font-mono">
                <span className="text-slate-500">Ground Truth:</span>
                <SentimentPill sentiment={item.ground_truth} size="sm" />
              </div>
            </div>

            {/* Review Quote */}
            <div className="my-4 p-3.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-800 text-xs italic leading-relaxed">
              "{item.review}"
            </div>

            {/* Comparison Row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 my-3">
              {/* DistilBERT */}
              <div className="p-3 rounded-lg bg-indigo-50 border border-indigo-200 flex items-center justify-between">
                <div>
                  <div className="text-[10px] font-mono uppercase text-indigo-700 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>DistilBERT (Correct)</span>
                  </div>
                  <div className="mt-1">
                    <SentimentPill sentiment={item.distilbert.sentiment} size="sm" />
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] font-mono text-slate-500">Confidence</div>
                  <div className="text-xs font-mono font-bold text-slate-900">
                    {(item.distilbert.confidence * 100).toFixed(1)}%
                  </div>
                </div>
              </div>

              {/* Logistic Regression */}
              <div className="p-3 rounded-lg bg-white border border-slate-200 flex items-center justify-between opacity-90">
                <div>
                  <div className="text-[10px] font-mono uppercase text-slate-500 font-semibold flex items-center gap-1">
                    <XCircle className="w-3.5 h-3.5 text-rose-500" />
                    <span>Logistic Regression</span>
                  </div>
                  <div className="mt-1">
                    <SentimentPill sentiment={item.logistic_regression.sentiment} size="sm" />
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] font-mono text-slate-500">Confidence</div>
                  <div className="text-xs font-mono font-bold text-slate-900">
                    {(item.logistic_regression.confidence * 100).toFixed(1)}%
                  </div>
                </div>
              </div>

              {/* Linear SVM */}
              <div className="p-3 rounded-lg bg-white border border-slate-200 flex items-center justify-between opacity-90">
                <div>
                  <div className="text-[10px] font-mono uppercase text-slate-500 font-semibold flex items-center gap-1">
                    <XCircle className="w-3.5 h-3.5 text-rose-500" />
                    <span>Linear SVM</span>
                  </div>
                  <div className="mt-1">
                    <SentimentPill sentiment={item.linear_svm.sentiment} size="sm" />
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] font-mono text-slate-500">Confidence</div>
                  <div className="text-xs font-mono font-bold text-slate-900">
                    {(item.linear_svm.confidence * 100).toFixed(1)}%
                  </div>
                </div>
              </div>
            </div>

            {/* Linguistic Explanation */}
            <div className="mt-4 pt-3 border-t border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-3 text-[11px] leading-relaxed">
              <div className="p-3 rounded-lg bg-rose-50/70 border border-rose-100 text-slate-700">
                <span className="font-semibold text-rose-800 font-mono uppercase text-[10px] block mb-1">
                  Why Bag-of-Words Failed:
                </span>
                {item.bow_failure_reason}
              </div>
              <div className="p-3 rounded-lg bg-emerald-50/70 border border-emerald-100 text-slate-700">
                <span className="font-semibold text-emerald-800 font-mono uppercase text-[10px] block mb-1">
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
