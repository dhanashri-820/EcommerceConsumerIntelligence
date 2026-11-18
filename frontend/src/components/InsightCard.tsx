import React from 'react';
import { Insight } from '../lib/api';
import { GlassCard } from './GlassCard';

interface InsightCardProps {
  insight: Insight;
  index?: number;
}

export const InsightCard: React.FC<InsightCardProps> = ({ insight }) => {
  const areaLower = (insight.focusArea || '').toLowerCase();

  let borderColor = 'border-l-indigo-600';
  let badgeClasses = 'text-indigo-700 bg-indigo-50 border-indigo-200';
  let topTag = 'STRATEGIC INSIGHT';

  if (areaLower.includes('durab') || areaLower.includes('defect') || areaLower.includes('motor') || areaLower.includes('build')) {
    borderColor = 'border-l-rose-500';
    badgeClasses = 'text-rose-700 bg-rose-50 border-rose-200';
    topTag = 'CRITICAL DEFECT';
  } else if (areaLower.includes('packag') || areaLower.includes('logistic') || areaLower.includes('deliver') || areaLower.includes('transit')) {
    borderColor = 'border-l-amber-500';
    badgeClasses = 'text-amber-700 bg-amber-50 border-amber-200';
    topTag = 'LOGISTICS RISK';
  } else if (areaLower.includes('ux') || areaLower.includes('usab') || areaLower.includes('clean') || areaLower.includes('user') || areaLower.includes('experience')) {
    borderColor = 'border-l-sky-500';
    badgeClasses = 'text-sky-700 bg-sky-50 border-sky-200';
    topTag = 'USABILITY FRICTION';
  } else if (areaLower.includes('market') || areaLower.includes('propos') || areaLower.includes('growth') || areaLower.includes('praise')) {
    borderColor = 'border-l-emerald-500';
    badgeClasses = 'text-emerald-700 bg-emerald-50 border-emerald-200';
    topTag = 'GROWTH LEVER';
  }

  return (
    <GlassCard
      className={`p-5 border-l-4 ${borderColor} flex flex-col justify-between hover:bg-slate-50/60 transition-all group`}
    >
      <div>
        {/* Top row: topTag + micro badge */}
        <div className="flex items-center justify-between gap-3 mb-3">
          <span className="text-[10px] font-mono uppercase tracking-[0.15em] text-slate-400 font-semibold">
            {topTag}
          </span>
          <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border uppercase tracking-wider font-semibold ${badgeClasses}`}>
            {insight.focusArea}
          </span>
        </div>

        {/* Quote line: customer voice */}
        <div className="mb-3">
          <blockquote className="text-sm font-semibold text-slate-900 group-hover:text-indigo-900 transition-colors leading-relaxed">
            "{insight.customerVoice}"
          </blockquote>
        </div>

        {/* Body: recommended action */}
        <p className="text-xs text-slate-600 leading-relaxed mb-4">
          {insight.action}
        </p>
      </div>

      {/* Footer: expected impact */}
      <div className="pt-3 border-t border-slate-100 flex items-center gap-1.5 text-xs font-mono font-medium text-emerald-700">
        <span className="text-emerald-600 font-bold">→</span>
        <span>{insight.expectedImpact}</span>
      </div>
    </GlassCard>
  );
};
