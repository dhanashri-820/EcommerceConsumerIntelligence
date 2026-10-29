import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api, WordCloudItem } from '../lib/api';
import { GlassCard } from './GlassCard';
import { exportToCsv, exportToJson } from '../lib/export';
import {
  Cloud,
  Sparkles,
  Download,
  Filter,
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
        <div className="h-6 w-48 bg-white/5 rounded mb-4 animate-pulse" />
        <div className="h-56 bg-white/5 rounded-xl border border-white/5 animate-pulse" />
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

  // Calculate font size scaling from 12px to 26px
  const getFontSize = (val: number) => {
    const minVal = 40;
    const maxVal = 100;
    const minFont = 12;
    const maxFont = 26;
    const scaled = minFont + ((val - minVal) / (maxVal - minVal)) * (maxFont - minFont);
    return Math.round(Math.max(minFont, Math.min(maxFont, scaled)));
  };

  return (
    <GlassCard className="p-6 space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-neon-cyan uppercase font-semibold">
            <Cloud className="w-4 h-4" />
            <span>CUSTOMER VOICE FREQUENCY CLOUD</span>
          </div>
          <h3 className="text-lg font-bold text-white mt-0.5">
            Voice-of-Customer Collocation Cloud
          </h3>
          <p className="text-xs text-slate-400">
            N-gram phrase collocations sized by corpus recurrence frequency.
          </p>
        </div>

        {/* Filter Pills & Export */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center p-1 rounded-lg bg-black/40 border border-white/10 text-xs font-mono">
            <button
              onClick={() => setFilter('ALL')}
              className={`px-2.5 py-1 rounded-md transition-all ${
                filter === 'ALL'
                  ? 'bg-neon-cyan/20 text-neon-cyan font-bold border border-neon-cyan/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              All ({data.total_terms})
            </button>
            <button
              onClick={() => setFilter('POSITIVE')}
              className={`px-2.5 py-1 rounded-md transition-all flex items-center gap-1 ${
                filter === 'POSITIVE'
                  ? 'bg-neon-lime/20 text-neon-lime font-bold border border-neon-lime/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <TrendingUp className="w-3 h-3" />
              <span>Praises</span>
            </button>
            <button
              onClick={() => setFilter('NEGATIVE')}
              className={`px-2.5 py-1 rounded-md transition-all flex items-center gap-1 ${
                filter === 'NEGATIVE'
                  ? 'bg-neon-red/20 text-neon-red font-bold border border-neon-red/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <TrendingDown className="w-3 h-3" />
              <span>Complaints</span>
            </button>
          </div>

          <button
            onClick={handleExportCsv}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 text-xs font-mono text-slate-300 transition-colors"
            title="Download CSV"
          >
            <Download className="w-3 h-3 text-neon-cyan" />
            <span>CSV</span>
          </button>
        </div>
      </div>

      {/* Cloud Canvas Area */}
      <div className="p-6 rounded-xl bg-black/30 border border-white/[0.06] min-h-[220px] flex flex-wrap items-center justify-center gap-3 select-none">
        {words.map((item, idx) => {
          const fontSize = getFontSize(item.value);
          const isPos = item.sentiment === 'POSITIVE';
          const isSelected = selectedWord?.text === item.text;

          return (
            <button
              key={idx}
              onClick={() => setSelectedWord(item)}
              style={{ fontSize: `${fontSize}px` }}
              className={`px-3 py-1 rounded-xl font-mono transition-all transform hover:scale-110 active:scale-95 cursor-pointer ${
                isSelected
                  ? 'ring-2 ring-white scale-110 z-10'
                  : 'opacity-90 hover:opacity-100'
              } ${
                isPos
                  ? 'text-neon-lime bg-neon-lime/[0.08] border border-neon-lime/25 hover:bg-neon-lime/20 hover:shadow-[0_0_15px_rgba(163,230,53,0.3)]'
                  : 'text-neon-red bg-neon-red/[0.08] border border-neon-red/25 hover:bg-neon-red/20 hover:shadow-[0_0_15px_rgba(244,63,94,0.3)]'
              }`}
            >
              <span>{item.text}</span>
              <span className="ml-1.5 text-[10px] font-mono text-slate-400 opacity-70">
                {item.value}
              </span>
            </button>
          );
        })}
      </div>

      {/* Selected Term Detail Drawer */}
      {selectedWord && (
        <div className="p-3.5 rounded-lg bg-white/[0.03] border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs animate-fadeIn">
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-neon-cyan shrink-0" />
            <span className="text-slate-300">Selected Collocation:</span>
            <span className="font-bold text-white font-mono">"{selectedWord.text}"</span>
            <span
              className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                selectedWord.sentiment === 'POSITIVE'
                  ? 'bg-neon-lime/20 text-neon-lime'
                  : 'bg-neon-red/20 text-neon-red'
              }`}
            >
              {selectedWord.sentiment}
            </span>
          </div>
          <div className="flex items-center gap-3 text-slate-400 font-mono text-[11px]">
            <span>Dimension: <strong className="text-white">{selectedWord.category}</strong></span>
            <span>Corpus Weight: <strong className="text-white">{selectedWord.value} / 100</strong></span>
          </div>
        </div>
      )}
    </GlassCard>
  );
};

