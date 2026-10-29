import React from 'react';
import { GlassCard, GlowColor } from './GlassCard';
import { Sparkline } from './Sparkline';

interface KpiCardProps {
  label: string;
  value: string | number;
  delta?: string;
  deltaPositive?: boolean;
  sparklineData?: number[];
  accentColor?: string;
  glow?: GlowColor;
  progressBar?: {
    value: number;
    max?: number;
    label?: string;
  };
  subtitle?: string;
}

export const KpiCard: React.FC<KpiCardProps> = ({
  label,
  value,
  delta,
  deltaPositive = true,
  sparklineData,
  accentColor = '#22d3ee',
  glow = 'cyan',
  progressBar,
  subtitle,
}) => {
  return (
    <GlassCard glow={glow} className="p-5 flex flex-col justify-between overflow-hidden relative group">
      {/* Subtle top indicator line */}
      <div
        className="absolute top-0 left-0 right-0 h-[2px] opacity-60 group-hover:opacity-100 transition-opacity"
        style={{ background: `linear-gradient(90deg, transparent, ${accentColor}, transparent)` }}
      />

      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">
            {label}
          </span>
          {subtitle && (
            <p className="text-[11px] text-slate-500 font-medium mt-0.5">{subtitle}</p>
          )}
        </div>
        {sparklineData && (
          <Sparkline data={sparklineData} color={accentColor} className="w-20 h-6 shrink-0 opacity-85 group-hover:opacity-100 transition-opacity" />
        )}
      </div>

      <div className="mt-1">
        <div className="text-3xl font-extrabold font-mono tracking-tight text-white">
          {value}
        </div>

        {delta && (
          <div className="flex items-center gap-1.5 mt-2 text-xs font-mono">
            <span
              className={`inline-flex items-center font-medium ${
                deltaPositive ? 'text-neon-lime' : 'text-neon-red'
              }`}
            >
              {deltaPositive ? '↑' : '↓'} {delta}
            </span>
            <span className="text-slate-500 text-[11px]">vs baseline</span>
          </div>
        )}

        {progressBar && (
          <div className="mt-3">
            <div className="flex justify-between items-center text-[10px] font-mono text-slate-400 mb-1">
              <span>{progressBar.label || 'Score'}</span>
              <span className="text-slate-200 font-semibold">{progressBar.value}%</span>
            </div>
            <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700 ease-out"
                style={{
                  width: `${Math.min(100, Math.max(0, (progressBar.value / (progressBar.max || 100)) * 100))}%`,
                  background: `linear-gradient(90deg, #22d3ee, #a78bfa)`,
                }}
              />
            </div>
          </div>
        )}
      </div>
    </GlassCard>
  );
};
