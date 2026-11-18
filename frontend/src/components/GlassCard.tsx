import React from 'react';

export type GlowColor = 'cyan' | 'violet' | 'lime' | 'amber' | 'red' | 'pink' | 'none';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  glow?: GlowColor;
  hoverGlow?: boolean;
  onClick?: () => void;
}

const glowMap: Record<GlowColor, string> = {
  cyan: 'border-sky-200 hover:border-sky-300 shadow-sm hover:shadow-md',
  violet: 'border-indigo-200 hover:border-indigo-300 shadow-sm hover:shadow-md',
  lime: 'border-emerald-200 hover:border-emerald-300 shadow-sm hover:shadow-md',
  amber: 'border-amber-200 hover:border-amber-300 shadow-sm hover:shadow-md',
  red: 'border-rose-200 hover:border-rose-300 shadow-sm hover:shadow-md',
  pink: 'border-pink-200 hover:border-pink-300 shadow-sm hover:shadow-md',
  none: 'border-slate-200 hover:border-slate-300 shadow-sm hover:shadow-md',
};

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  className = '',
  glow = 'none',
  hoverGlow = false,
  onClick,
}) => {
  const glowClass = glowMap[glow] || glowMap.none;
  const hoverClass = hoverGlow
    ? 'transition-all duration-200 hover:shadow-md hover:-translate-y-0.5'
    : 'transition-all duration-200';

  return (
    <div
      onClick={onClick}
      className={`relative rounded-xl bg-white border ${glowClass} ${hoverClass} ${
        onClick ? 'cursor-pointer' : ''
      } ${className}`}
    >
      {children}
    </div>
  );
};
