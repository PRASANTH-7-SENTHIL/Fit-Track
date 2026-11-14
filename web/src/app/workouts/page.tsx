'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import AppShell from '@/components/layout/AppShell';
import { WORKOUT_PLANS } from '@/lib/workout-plans';
import { WorkoutDifficulty, WorkoutPlan } from '@/types';
import {
  Dumbbell,
  Flame,
  Clock,
  Play,
  CheckCircle2,
  ChevronRight,
  Sparkles,
  Zap,
} from 'lucide-react';

export default function WorkoutModesPage() {
  const [activeTab, setActiveTab] = useState<WorkoutDifficulty>('easy');

  const filteredPlans = WORKOUT_PLANS.filter((p) => p.difficulty === activeTab);

  return (
    <AppShell
      title="Workout Modes"
      subtitle="Structured 3-tier difficulty regimens customized to your conditioning"
      headerAction={
        <Link
          href="/workout-history"
          className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700"
        >
          View History
        </Link>
      }
    >
      <div className="space-y-6">
        {/* DIFFICULTY PILL TABS (MATCHING REFERENCE APP TOP BAR: Beginner / Intermediate / Advance) */}
        <div className="flex items-center justify-center sm:justify-start gap-2 bg-slate-900 p-1.5 rounded-2xl border border-slate-800 max-w-md mx-auto sm:mx-0">
          {[
            { id: 'easy', label: 'Beginner', badge: 'Tier 1' },
            { id: 'medium', label: 'Intermediate', badge: 'Tier 2' },
            { id: 'hard', label: 'Advance', badge: 'Tier 3' },
          ].map((tab) => {
            const isSelected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as WorkoutDifficulty)}
                className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  isSelected
                    ? 'bg-lime-400 text-slate-950 shadow-lg shadow-lime-400/25 font-extrabold'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* WORKOUT CARDS GRID (INSPIRED BY REFERENCE DESIGN TILES) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredPlans.map((plan) => (
            <div
              key={plan.id}
              className="group rounded-3xl bg-slate-900 border border-slate-800 overflow-hidden shadow-xl hover:border-slate-700 transition-all duration-300 flex flex-col justify-between"
            >
              {/* Card Banner */}
              <div className="relative h-44 bg-gradient-to-tr from-slate-950 via-slate-900 to-blue-950/60 p-5 flex flex-col justify-between border-b border-slate-800/80">
                <div className="flex justify-between items-center">
                  <span
                    className={`text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full ${
                      plan.difficulty === 'easy'
                        ? 'bg-emerald-400/10 text-emerald-400 border border-emerald-400/20'
                        : plan.difficulty === 'medium'
                        ? 'bg-amber-400/10 text-amber-400 border border-amber-400/20'
                        : 'bg-rose-400/10 text-rose-400 border border-rose-400/20'
                    }`}
                  >
                    {plan.difficulty.toUpperCase()} MODE
                  </span>

                  <div className="flex items-center gap-1 text-[11px] font-bold text-slate-300 bg-slate-900/80 px-2.5 py-1 rounded-full border border-slate-700">
                    <Clock className="h-3 w-3 text-lime-400" />
                    <span>{plan.estimatedDurationMinutes} mins</span>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-extrabold text-white group-hover:text-lime-300 transition-colors">
                    {plan.name}
                  </h3>
                  <div className="flex items-center gap-3 mt-1 text-xs text-slate-400">
                    <span className="flex items-center gap-1">
                      <Flame className="h-3.5 w-3.5 text-amber-400" />
                      <span>~{plan.estimatedCaloriesBurned} kcal</span>
                    </span>
                    <span>•</span>
                    <span>{plan.exercises.length} Exercises</span>
                  </div>
                </div>
              </div>

              {/* Exercise Items Preview */}
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div className="space-y-2 mb-6">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    EXERCISES INCLUDED
                  </span>
                  <div className="space-y-1.5">
                    {plan.exercises.slice(0, 4).map((ex, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between text-xs py-1 px-2.5 rounded-lg bg-slate-950/60 border border-slate-800/60"
                      >
                        <span className="font-semibold text-slate-300">{ex.name}</span>
                        <span className="text-slate-400 text-[11px]">
                          {ex.targetReps ? `${ex.targetReps} reps` : ex.targetDurationSeconds ? `${Math.round(ex.targetDurationSeconds / 60)} min` : `${ex.targetDistanceKm} km`}
                        </span>
                      </div>
                    ))}
                    {plan.exercises.length > 4 && (
                      <p className="text-[10px] text-slate-500 pl-2">
                        +{plan.exercises.length - 4} more exercises
                      </p>
                    )}
                  </div>
                </div>

                <Link
                  href={`/workout-session?planId=${plan.id}`}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-lg shadow-blue-600/30 group-hover:bg-lime-400 group-hover:text-slate-950 transition-all active:scale-95"
                >
                  <Play className="h-3.5 w-3.5 fill-current" />
                  <span>Start Workout Session</span>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
