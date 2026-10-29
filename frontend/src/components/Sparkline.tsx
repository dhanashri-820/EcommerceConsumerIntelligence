import React from 'react';

interface SparklineProps {
  data?: number[];
  color?: string;
  strokeWidth?: number;
  className?: string;
}

export const Sparkline: React.FC<SparklineProps> = ({
  data = [12, 18, 15, 24, 22, 28, 32, 29, 38, 42],
  color = '#22d3ee',
  strokeWidth = 2,
  className = 'w-24 h-7',
}) => {
  const points = React.useMemo(() => {
    if (!data || data.length < 2) return '0,15 100,15';
    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;
    const padding = 3;
    const height = 30 - padding * 2;
    const width = 100;

    return data
      .map((val, idx) => {
        const x = (idx / (data.length - 1)) * width;
        const y = 30 - padding - ((val - min) / range) * height;
        return `${x.toFixed(1)},${y.toFixed(1)}`;
      })
      .join(' ');
  }, [data]);

  return (
    <svg
      viewBox="0 0 100 30"
      className={`overflow-visible inline-block ${className}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <polyline
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
      />
    </svg>
  );
};
