'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import AppShell from '@/components/layout/AppShell';
import { useAppStore } from '@/store';
import {
  History,
  Dumbbell,
  Clock,
  Flame,
  Calendar,
  CheckCircle2,
  Filter,
  Plus,
} from 'lucide-react';
import { WorkoutSession } from '@/types';

export default function WorkoutHistoryPage() {
  const { workoutSessions } = useAppStore();
  const [filterDifficulty, setFilterDifficulty] = useState<string>('all');

  // Only real user workouts
  const sessionsToDisplay = workoutSessions;

  const filtered = filterDifficulty === 'all'
    ? sessionsToDisplay
    : sessionsToDisplay.filter((s) => s.difficulty === filterDifficulty);

  const totalCalories = sessionsToDisplay.reduce((sum, s) => sum + s.totalCaloriesBurned, 0);

  return (
    <AppShell
      title="Workout History"
      subtitle="Comprehensive archive of completed workout sessions and calories burned"
      headerAction={
        <Link
          href="/workouts"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-lime-400 hover:bg-lime-300 text-xs font-bold text-slate-950 shadow-md"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>New Workout</span>
        </Link>
      }
    >
      <div className="space-y-6">
        {/* STATS OVERVIEW CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
              Workouts Logged
            </span>
            <span className="text-2xl font-black text-white">{sessionsToDisplay.length}</span>
            <p className="text-[11px] text-lime-400 mt-1">100% completion adherence</p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
              Cumulative Burn
            </span>
            <span className="text-2xl font-black text-amber-400">{totalCalories.toLocaleString()}</span>
            <span className="text-[11px] text-slate-400 ml-1">kcal</span>
            <p className="text-[11px] text-slate-400 mt-1">High metabolic efficiency</p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
              Average Intensity
            </span>
            <span className="text-2xl font-black text-blue-400">Medium</span>
            <p className="text-[11px] text-slate-400 mt-1">Consistent progression</p>
          </div>
        </div>

        {/* FILTER BAR */}
        <div className="flex items-center gap-2 bg-slate-900 p-1.5 rounded-2xl border border-slate-800 max-w-sm">
          {['all', 'easy', 'medium', 'hard'].map((lvl) => (
            <button
              key={lvl}
              onClick={() => setFilterDifficulty(lvl)}
              className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-bold capitalize transition-all ${
                filterDifficulty === lvl
                  ? 'bg-blue-600 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {lvl}
            </button>
          ))}
        </div>

        {/* WORKOUT ENTRIES */}
        <div className="space-y-3">
          {filtered.length === 0 ? (
            <div className="p-12 rounded-3xl bg-slate-900 border border-slate-800 text-center space-y-3">
              <Dumbbell className="h-10 w-10 text-slate-600 mx-auto" />
              <h4 className="text-sm font-bold text-white">No workouts recorded yet</h4>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Complete a workout routine to build your training history and track calories burned.
              </p>
              <Link
                href="/workouts"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-lime-400 hover:bg-lime-300 text-slate-950 text-xs font-bold transition-all shadow-md"
              >
                Browse &amp; Start Workouts
              </Link>
            </div>
          ) : (
            filtered.map((session) => (
              <div
                key={session.id}
                className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-slate-700 transition-all"
              >
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-center text-lime-400">
                  <Dumbbell className="h-6 w-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-extrabold text-white">{session.workoutName}</h4>
                    <span
                      className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                        session.difficulty === 'easy'
                          ? 'bg-emerald-400/10 text-emerald-400 border border-emerald-400/20'
                          : session.difficulty === 'medium'
                          ? 'bg-amber-400/10 text-amber-400 border border-amber-400/20'
                          : 'bg-rose-400/10 text-rose-400 border border-rose-400/20'
                      }`}
                    >
                      {session.difficulty}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      <span>{session.date}</span>
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>{session.startTime}</span>
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-6 border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-800">
                <div className="text-right">
                  <span className="text-base font-extrabold text-amber-400 block">
                    +{session.totalCaloriesBurned} kcal
                  </span>
                  <span className="text-[10px] text-lime-400 font-semibold flex items-center gap-1 justify-end">
                    <CheckCircle2 className="h-3 w-3" />
                    <span>Completed</span>
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
      </div>
    </AppShell>
  );
}
