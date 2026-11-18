import React from 'react';
import { Sentiment } from '../lib/api';
import { GlassCard, GlowColor } from './GlassCard';
import { SentimentPill } from './SentimentPill';

interface PredictionCardProps {
  modelName: string;
  sentiment: Sentiment | string;
  confidence: number;
  glow?: GlowColor;
  isWinner?: boolean;
}

export const PredictionCard: React.FC<PredictionCardProps> = ({
  modelName,
  sentiment,
  confidence,
  glow = 'none',
  isWinner = false,
}) => {
  // Normalize confidence to 0-100 range
  const confPct = confidence <= 1 ? +(confidence * 100).toFixed(1) : +confidence.toFixed(1);

  const getAccentColor = () => {
    const lower = modelName.toLowerCase();
    if (lower.includes('distilbert')) return '#4f46e5';
    if (lower.includes('svm')) return '#0d9488';
    return '#0284c7';
  };

  const accentColor = getAccentColor();

  return (
    <GlassCard
      glow={glow}
      className={`p-5 flex flex-col justify-between relative ${
        isWinner ? 'ring-2 ring-indigo-500/40' : ''
      }`}
    >
      {isWinner && (
        <div className="absolute -top-2.5 right-4 px-2.5 py-0.5 rounded-full bg-indigo-600 text-white text-[10px] font-mono font-bold uppercase tracking-wider shadow-sm">
          ★ Benchmark Winner
        </div>
      )}

      <div>
        {/* Model header */}
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-mono uppercase tracking-wider text-slate-500 font-semibold">
            {modelName}
          </span>
          <span className="text-[11px] font-mono text-slate-400">
            Inference
          </span>
        </div>

        {/* Sentiment verdict */}
        <div className="flex items-center justify-between mb-5">
          <SentimentPill sentiment={sentiment} size="lg" />
          <div className="text-right">
            <div className="text-xs font-mono text-slate-400">Confidence</div>
            <div className="text-xl font-mono font-extrabold text-slate-900">
              {confPct}%
            </div>
          </div>
        </div>
      </div>

      {/* Thin confidence meter bar with model accent */}
      <div className="mt-2 pt-3 border-t border-slate-100">
        <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-700 ease-out"
            style={{
              width: `${Math.min(100, Math.max(0, confPct))}%`,
              backgroundColor: accentColor,
            }}
          />
        </div>
      </div>
    </GlassCard>
  );
};
