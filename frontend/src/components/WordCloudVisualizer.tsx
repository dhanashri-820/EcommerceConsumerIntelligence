import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api, WordCloudItem } from '../lib/api';
import { GlassCard } from './GlassCard';
import { exportToCsv, exportToJson } from '../lib/export';
import {
  Cloud,
  Download,
  TrendingUp,
  TrendingDown,
  Info,
} from 'lucide-react';

export const WordCloudVisualizer: React.FC = () => {
  const [filter, setFilter] = useState<'ALL' | 'POSITIVE' | 'NEGATIVE'>('ALL');
  const [selectedWord, setSelectedWord] = useState<WordCloudItem | null>(null);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['wordcloud'],
    queryFn: () => api.getWordCloud(),
  });

  if (isLoading) {
    return (
      <GlassCard className="p-6">
        <div className="h-6 w-48 bg-slate-200 rounded mb-4 animate-pulse" />
        <div className="h-56 bg-slate-100 rounded-xl border border-slate-200 animate-pulse" />
      </GlassCard>
    );
  }

  if (isError || !data) {
    return null;
  }

  const words = data.words.filter((w) => {
    if (filter === 'ALL') return true;
    return w.sentiment === filter;
  });

  const handleExportCsv = () => {
    exportToCsv('Customer_Voice_WordCloud.csv', words);
  };

  const handleExportJson = () => {
    exportToJson('Customer_Voice_WordCloud.json', words);
  };

  // Calculate font size scaling from 12px to 24px
  const getFontSize = (val: number) => {
    const minVal = 40;
    const maxVal = 100;
    const minFont = 12;
    const maxFont = 22;
    const scaled = minFont + ((val - minVal) / (maxVal - minVal)) * (maxFont - minFont);
    return Math.round(Math.max(minFont, Math.min(maxFont, scaled)));
  };

  return (
    <GlassCard className="p-6 space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-indigo-700 uppercase font-semibold">
            <Cloud className="w-4 h-4 text-indigo-600" />
            <span>Customer Voice Frequency Cloud</span>
          </div>
          <h3 className="text-lg font-bold text-slate-900 mt-0.5">
            Voice-of-Customer Collocation Cloud
          </h3>
          <p className="text-xs text-slate-500">
            N-gram phrase collocations sized by corpus recurrence frequency.
          </p>
        </div>

        {/* Filter Pills & Export */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center p-1 rounded-lg bg-slate-100 border border-slate-200 text-xs font-mono">
            <button
              onClick={() => setFilter('ALL')}
              className={`px-2.5 py-1 rounded-md transition-all ${
                filter === 'ALL'
                  ? 'bg-white text-slate-900 font-bold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All ({data.total_terms})
            </button>
            <button
              onClick={() => setFilter('POSITIVE')}
              className={`px-2.5 py-1 rounded-md transition-all flex items-center gap-1 ${
                filter === 'POSITIVE'
                  ? 'bg-emerald-600 text-white font-bold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <TrendingUp className="w-3 h-3" />
              <span>Praises</span>
            </button>
            <button
              onClick={() => setFilter('NEGATIVE')}
              className={`px-2.5 py-1 rounded-md transition-all flex items-center gap-1 ${
                filter === 'NEGATIVE'
                  ? 'bg-rose-600 text-white font-bold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <TrendingDown className="w-3 h-3" />
              <span>Complaints</span>
            </button>
          </div>

          <button
            onClick={handleExportCsv}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white hover:bg-slate-50 border border-slate-200 text-xs font-mono text-slate-700 shadow-sm transition-colors"
            title="Download CSV"
          >
            <Download className="w-3 h-3 text-sky-600" />
            <span>CSV</span>
          </button>
        </div>
      </div>

      {/* Cloud Canvas Area */}
      <div className="p-6 rounded-xl bg-slate-50 border border-slate-200 min-h-[200px] flex flex-wrap items-center justify-center gap-2.5 select-none">
        {words.map((item, idx) => {
          const fontSize = getFontSize(item.value);
          const isPos = item.sentiment === 'POSITIVE';
          const isSelected = selectedWord?.text === item.text;

          return (
            <button
              key={idx}
              onClick={() => setSelectedWord(item)}
              style={{ fontSize: `${fontSize}px` }}
              className={`px-3 py-1 rounded-lg font-mono transition-all transform hover:scale-105 active:scale-95 cursor-pointer ${
                isSelected
                  ? 'ring-2 ring-indigo-500 shadow-sm z-10'
                  : 'opacity-90 hover:opacity-100'
              } ${
                isPos
                  ? 'text-emerald-800 bg-emerald-50 border border-emerald-200 hover:bg-emerald-100'
                  : 'text-rose-800 bg-rose-50 border border-rose-200 hover:bg-rose-100'
              }`}
            >
              <span className="font-semibold">{item.text}</span>
              <span className="ml-1.5 text-[10px] font-mono text-slate-500 opacity-80">
                {item.value}
              </span>
            </button>
          );
        })}
      </div>

      {/* Selected Term Detail Drawer */}
      {selectedWord && (
        <div className="p-3.5 rounded-lg bg-indigo-50/60 border border-indigo-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-indigo-600 shrink-0" />
            <span className="text-slate-600">Selected Collocation:</span>
            <span className="font-bold text-slate-900 font-mono">"{selectedWord.text}"</span>
            <span
              className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                selectedWord.sentiment === 'POSITIVE'
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-rose-100 text-rose-800'
              }`}
            >
              {selectedWord.sentiment}
            </span>
          </div>
          <div className="flex items-center gap-3 text-slate-600 font-mono text-[11px]">
            <span>Dimension: <strong className="text-slate-900">{selectedWord.category}</strong></span>
            <span>Corpus Weight: <strong className="text-slate-900">{selectedWord.value} / 100</strong></span>
          </div>
        </div>
      )}
    </GlassCard>
  );
};
