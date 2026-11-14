'use client';

import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  icon: LucideIcon;
  title: string;
  value: string | number;
  subtitle?: string;
  unit?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  accentColor?: string; // hex or tailwind class
  className?: string;
  onClick?: () => void;
}

export default function StatCard({
  icon: Icon,
  title,
  value,
  subtitle,
  unit,
  trend,
  accentColor = '#84cc16', // lime green accent
  className = '',
  onClick,
}: StatCardProps) {
  return (
    <div
      onClick={onClick}
      className={`relative overflow-hidden rounded-2xl bg-slate-800/80 dark:bg-slate-800/90 border border-slate-700/60 p-4 transition-all duration-300 hover:border-slate-600 hover:shadow-lg hover:shadow-black/20 ${onClick ? 'cursor-pointer' : ''} ${className}`}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">{title}</span>
        <div
          className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-700/60"
          style={{ color: accentColor }}
        >
          <Icon className="h-5 w-5" />
        </div>
      </div>

      <div className="mt-3 flex items-baseline gap-1.5">
        <span className="text-2xl font-bold tracking-tight text-white">{value}</span>
        {unit && <span className="text-xs font-medium text-slate-400">{unit}</span>}
      </div>

      {(subtitle || trend) && (
        <div className="mt-2 flex items-center justify-between text-xs">
          {subtitle && <span className="text-slate-400 truncate">{subtitle}</span>}
          {trend && (
            <span
              className={`font-semibold ml-auto ${
                trend.isPositive ? 'text-lime-400' : 'text-rose-400'
              }`}
            >
              {trend.isPositive ? '+' : ''}{trend.value}%
            </span>
          )}
        </div>
      )}
    </div>
  );
}
