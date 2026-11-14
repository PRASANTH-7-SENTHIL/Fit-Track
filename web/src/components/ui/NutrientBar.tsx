'use client';

import React from 'react';

interface NutrientBarProps {
  label: string;
  current: number;
  target: number;
  unit?: string;
  color?: string; // e.g. 'bg-blue-600', 'bg-lime-500', 'bg-amber-500', 'bg-emerald-500'
  barColorHex?: string;
}

export default function NutrientBar({
  label,
  current,
  target,
  unit = 'g',
  color = 'bg-blue-600',
  barColorHex,
}: NutrientBarProps) {
  const percentage = target > 0 ? Math.min(Math.round((current / target) * 100), 100) : 0;

  return (
    <div className="w-full flex flex-col gap-1.5 my-2">
      <div className="flex justify-between items-center text-xs">
        <span className="font-semibold text-slate-300 dark:text-slate-200">{label}</span>
        <div className="text-slate-400 dark:text-slate-400">
          <span className="font-bold text-white dark:text-white">{Math.round(current)}</span>
          <span className="text-[11px] text-slate-400"> / {Math.round(target)}{unit}</span>
          <span className="ml-1.5 text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
            {percentage}%
          </span>
        </div>
      </div>
      <div className="w-full h-2.5 bg-slate-800 dark:bg-slate-800/80 rounded-full overflow-hidden p-0.5 border border-slate-700/50">
        <div
          className={`h-full rounded-full transition-all duration-700 ease-out ${!barColorHex ? color : ''}`}
          style={{
            width: `${percentage}%`,
            backgroundColor: barColorHex || undefined,
          }}
        />
      </div>
    </div>
  );
}
