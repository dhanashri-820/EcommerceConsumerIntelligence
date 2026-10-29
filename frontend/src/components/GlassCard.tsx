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
  cyan: 'shadow-[0_0_30px_-6px_rgba(34,211,238,0.5)] border-neon-cyan/30',
  violet: 'shadow-[0_0_30px_-6px_rgba(167,139,250,0.5)] border-neon-violet/30',
  lime: 'shadow-[0_0_30px_-6px_rgba(163,230,53,0.5)] border-neon-lime/30',
  amber: 'shadow-[0_0_30px_-6px_rgba(251,191,36,0.5)] border-neon-amber/30',
  red: 'shadow-[0_0_30px_-6px_rgba(248,113,113,0.5)] border-neon-red/30',
  pink: 'shadow-[0_0_30px_-6px_rgba(244,114,182,0.5)] border-neon-pink/30',
  none: '',
};

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  className = '',
  glow = 'none',
  hoverGlow = false,
  onClick,
}) => {
  const glowClass = glowMap[glow] || '';
  const hoverClass = hoverGlow
    ? 'transition-all duration-300 hover:border-white/20 hover:bg-white/[0.06] hover:shadow-[0_0_30px_-6px_rgba(34,211,238,0.25)]'
    : 'transition-all duration-200';

  return (
    <div
      onClick={onClick}
      className={`relative rounded-xl bg-white/[0.04] border border-white/[0.08] backdrop-blur-xl ${glowClass} ${hoverClass} ${
        onClick ? 'cursor-pointer' : ''
      } ${className}`}
    >
      {children}
    </div>
  );
};
