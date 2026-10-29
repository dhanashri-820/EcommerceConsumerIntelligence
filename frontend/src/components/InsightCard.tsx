import React from 'react';
import { Insight } from '../lib/api';
import { GlassCard } from './GlassCard';

interface InsightCardProps {
  insight: Insight;
  index?: number;
}

export const InsightCard: React.FC<InsightCardProps> = ({ insight }) => {
  const areaLower = (insight.focusArea || '').toLowerCase();

  let borderColor = 'border-l-neon-violet';
  let badgeClasses = 'text-neon-violet bg-neon-violet/10 border-neon-violet/30';
  let topTag = 'STRATEGIC INSIGHT';

  if (areaLower.includes('durab') || areaLower.includes('defect') || areaLower.includes('motor') || areaLower.includes('build')) {
    borderColor = 'border-l-neon-red';
    badgeClasses = 'text-neon-red bg-neon-red/10 border-neon-red/30';
    topTag = 'CRITICAL DEFECT';
  } else if (areaLower.includes('packag') || areaLower.includes('logistic') || areaLower.includes('deliver') || areaLower.includes('transit')) {
    borderColor = 'border-l-neon-amber';
    badgeClasses = 'text-neon-amber bg-neon-amber/10 border-neon-amber/30';
    topTag = 'LOGISTICS RISK';
  } else if (areaLower.includes('ux') || areaLower.includes('usab') || areaLower.includes('clean') || areaLower.includes('user') || areaLower.includes('experience')) {
    borderColor = 'border-l-neon-cyan';
    badgeClasses = 'text-neon-cyan bg-neon-cyan/10 border-neon-cyan/30';
    topTag = 'USABILITY FRICTION';
  } else if (areaLower.includes('market') || areaLower.includes('propos') || areaLower.includes('growth') || areaLower.includes('praise')) {
    borderColor = 'border-l-neon-lime';
    badgeClasses = 'text-neon-lime bg-neon-lime/10 border-neon-lime/30';
    topTag = 'GROWTH LEVER';
  }

  return (
    <GlassCard
      className={`p-5 border-l-4 ${borderColor} flex flex-col justify-between hover:bg-white/[0.06] transition-all group`}
    >
      <div>
        {/* Top row: topTag + micro badge */}
        <div className="flex items-center justify-between gap-3 mb-3">
          <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-slate-400 font-semibold">
            {topTag}
          </span>
          <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border uppercase tracking-wider font-semibold ${badgeClasses}`}>
            {insight.focusArea}
          </span>
        </div>

        {/* Quote line: customer voice */}
        <div className="mb-3">
          <blockquote className="text-sm font-semibold text-slate-100 group-hover:text-white transition-colors leading-relaxed">
            "{insight.customerVoice}"
          </blockquote>
        </div>

        {/* Body: recommended action */}
        <p className="text-xs text-slate-400 leading-relaxed mb-4">
          {insight.action}
        </p>
      </div>

      {/* Footer: expected impact */}
      <div className="pt-3 border-t border-white/[0.06] flex items-center gap-1.5 text-xs font-mono font-medium text-neon-lime">
        <span className="text-neon-lime">→</span>
        <span>{insight.expectedImpact}</span>
      </div>
    </GlassCard>
  );
};
