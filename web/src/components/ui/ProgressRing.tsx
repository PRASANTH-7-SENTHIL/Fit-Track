'use client';

import React from 'react';

interface ProgressRingProps {
  progress: number; // 0 to 100+
  size?: number;
  strokeWidth?: number;
  color?: string; // hex or tailwind class like #2563EB or #84cc16
  trackColor?: string;
  label?: string;
  value?: string | number;
  subValue?: string;
  className?: string;
}

export default function ProgressRing({
  progress,
  size = 140,
  strokeWidth = 10,
  color = '#84cc16', // Lime green accent from reference design
  trackColor,
  label,
  value,
  subValue,
  className = '',
}: ProgressRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const clampedProgress = Math.min(Math.max(progress, 0), 100);
  const strokeDashoffset = circumference - (clampedProgress / 100) * circumference;

  return (
    <div className={`relative flex flex-col items-center justify-center ${className}`} style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={trackColor || 'currentColor'}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeLinecap="round"
          className="text-slate-800 [html.light_&]:text-blue-100"
        />
        {/* Animated Progress Indicator */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      {/* Centered Content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-2">
        {value !== undefined && (
          <span className="text-xl md:text-2xl font-bold tracking-tight text-white [html.light_&]:text-slate-900">
            {value}
          </span>
        )}
        {label && (
          <span className="text-xs font-semibold text-slate-400 [html.light_&]:text-slate-600 mt-0.5">
            {label}
          </span>
        )}
        {subValue && (
          <span className="text-[10px] text-slate-500 [html.light_&]:text-slate-400">
            {subValue}
          </span>
        )}
      </div>
    </div>
  );
}
