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
    if (lower.includes('distilbert')) return '#a78bfa';
    if (lower.includes('svm')) return '#a3e635';
    return '#22d3ee';
  };

  const accentColor = getAccentColor();

  return (
    <GlassCard
      glow={glow}
      className={`p-5 flex flex-col justify-between relative ${
        isWinner ? 'ring-1 ring-violet-400/50' : ''
      }`}
    >
      {isWinner && (
        <div className="absolute -top-2.5 right-4 px-2.5 py-0.5 rounded-full bg-neon-violet text-black text-[10px] font-mono font-bold uppercase tracking-wider shadow-[0_0_15px_rgba(167,139,250,0.8)]">
          ★ Benchmark Winner
        </div>
      )}

      <div>
        {/* Model header */}
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-mono uppercase tracking-widest text-slate-400 font-semibold">
            {modelName}
          </span>
          <span className="text-[11px] font-mono text-slate-500">
            Inference
          </span>
        </div>

        {/* Sentiment verdict */}
        <div className="flex items-center justify-between mb-5">
          <SentimentPill sentiment={sentiment} size="lg" />
          <div className="text-right">
            <div className="text-xs font-mono text-slate-400">Confidence</div>
            <div className="text-xl font-mono font-extrabold text-white">
              {confPct}%
            </div>
          </div>
        </div>
      </div>

      {/* Thin confidence meter bar with model accent */}
      <div className="mt-2 pt-3 border-t border-white/[0.06]">
        <div className="w-full h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-700 ease-out"
            style={{
              width: `${Math.min(100, Math.max(0, confPct))}%`,
              backgroundColor: accentColor,
              boxShadow: `0 0 10px ${accentColor}`,
            }}
          />
        </div>
      </div>
    </GlassCard>
  );
};
