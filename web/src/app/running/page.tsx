'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import AppShell from '@/components/layout/AppShell';
import { useAppStore } from '@/store';
import {
  Play,
  Pause,
  Square,
  RotateCcw,
  Footprints,
  Heart,
  Flame,
  Navigation,
  Compass,
  ArrowLeft,
  Volume2,
  CheckCircle2,
} from 'lucide-react';
import { ActivityRecord } from '@/types';

export default function RunningTrackerPage() {
  const { profile, todayActivity, setTodayActivity } = useAppStore();

  const [mode, setMode] = useState<'running' | 'walking' | 'cycling'>('running');
  const [isRunning, setIsRunning] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [targetDurationMinutes, setTargetDurationMinutes] = useState(20);

  // Simulated metrics during run
  const [steps, setSteps] = useState(852);
  const [heartRate, setHeartRate] = useState(112);
  const [distanceKm, setDistanceKm] = useState(1.32);
  const [caloriesBurned, setCaloriesBurned] = useState(118);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isRunning) {
      interval = setInterval(() => {
        setSeconds((prev) => prev + 1);

        // Increment dynamic metrics
        setSteps((s) => s + (mode === 'running' ? 3 : 2));
        setDistanceKm((d) => Math.round((d + (mode === 'running' ? 0.003 : 0.0015)) * 1000) / 1000);
        setCaloriesBurned((c) => c + 1);
        setHeartRate((hr) => 120 + Math.floor(Math.sin(Date.now() / 5000) * 8));
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, mode]);

  const formatTimer = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleToggle = () => {
    setIsRunning(!isRunning);
  };

  const handleStop = () => {
    setIsRunning(false);

    if (seconds > 10) {
      const newRecord: ActivityRecord = {
        id: 'run_' + Date.now(),
        type: mode,
        startTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        durationMinutes: Math.max(Math.round(seconds / 60), 1),
        distanceKm,
        caloriesBurned,
        status: 'completed',
      };

      const current = todayActivity || {
        uid: profile?.uid || 'athlete_01',
        date: new Date().toISOString().split('T')[0],
        steps: 0,
        distanceKm: 0,
        activeMinutes: 0,
        caloriesBurned: 0,
        activities: [],
      };

      setTodayActivity({
        ...current,
        steps: current.steps + steps,
        distanceKm: Math.round((current.distanceKm + distanceKm) * 100) / 100,
        activeMinutes: current.activeMinutes + Math.round(seconds / 60),
        caloriesBurned: current.caloriesBurned + caloriesBurned,
        activities: [newRecord, ...(current.activities || [])],
      });

      alert(`Workout Completed! Traversed ${distanceKm} km, logged ${steps} steps, and burned ${caloriesBurned} kcal.`);
    }

    setSeconds(0);
    setSteps(0);
    setDistanceKm(0);
    setCaloriesBurned(0);
  };

  const remainingSeconds = Math.max(targetDurationMinutes * 60 - seconds, 0);

  return (
    <AppShell
      title="Live GPS Activity"
      subtitle="Matching FitTrack AI Pro Screen HUD"
    >
      <div className="max-w-md mx-auto space-y-4">
        {/* TOP ACTIVITY HUD CARD (INSPIRED DIRECTLY BY REFERENCE IMAGE CENTER) */}
        <div className="relative overflow-hidden rounded-3xl bg-black border border-slate-800 p-6 shadow-2xl text-slate-100 flex flex-col items-center">
          {/* Subtle Top Mode Selector */}
          <div className="flex items-center gap-2 mb-4 bg-slate-900/90 p-1 rounded-full border border-slate-800">
            {(['running', 'walking', 'cycling'] as const).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`px-3 py-1 rounded-full text-[11px] font-bold uppercase transition-all ${
                  mode === m
                    ? 'bg-lime-400 text-slate-950 shadow-md shadow-lime-400/20'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {m}
              </button>
            ))}
          </div>

          {/* ATHLETE GRAPHIC / AVATAR SILHOUETTE */}
          <div className="relative w-48 h-56 flex items-center justify-center my-2">
            <div className="absolute inset-0 bg-blue-500/10 rounded-full blur-2xl" />
            <svg
              viewBox="0 0 200 240"
              className="w-full h-full drop-shadow-[0_10px_20px_rgba(0,0,0,0.8)]"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Stylized Runner Silhouette */}
              <circle cx="100" cy="35" r="18" fill="#38bdf8" />
              <path
                d="M100 55 C120 55 130 75 125 100 L115 130 C120 150 145 170 140 210 L125 210 C120 180 105 160 100 150 L85 190 L60 210 L50 200 L75 165 L85 120 L70 105 L50 120 L40 110 L65 85 C80 65 90 55 100 55 Z"
                fill="url(#runnerGrad)"
              />
              <path
                d="M125 85 L155 105 L150 118 L125 102 Z"
                fill="#38bdf8"
              />
              <defs>
                <linearGradient id="runnerGrad" x1="100" y1="55" x2="100" y2="210" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#38bdf8" />
                  <stop offset="0.5" stopColor="#2563eb" />
                  <stop offset="1" stopColor="#84cc16" />
                </linearGradient>
              </defs>
            </svg>
          </div>

          {/* CURRENT STATUS METRIC ROW */}
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">
            CURRENT STATUS
          </span>

          <div className="grid grid-cols-3 gap-3 w-full mb-6">
            {/* Steps */}
            <div className="p-3 rounded-2xl bg-slate-900/90 border border-slate-800 text-center">
              <Footprints className="h-4 w-4 text-lime-400 mx-auto mb-1" />
              <span className="text-lg font-black text-white block">{steps}</span>
              <span className="text-[10px] text-slate-400">Steps</span>
            </div>

            {/* Heart Rate */}
            <div className="p-3 rounded-2xl bg-slate-900/90 border border-slate-800 text-center">
              <Heart className="h-4 w-4 text-rose-500 mx-auto mb-1 animate-pulse" />
              <span className="text-lg font-black text-white block">{heartRate}</span>
              <span className="text-[10px] text-slate-400">BPM</span>
            </div>

            {/* Calories Burned */}
            <div className="p-3 rounded-2xl bg-slate-900/90 border border-slate-800 text-center">
              <Flame className="h-4 w-4 text-amber-400 mx-auto mb-1" />
              <span className="text-lg font-black text-white block">{caloriesBurned}</span>
              <span className="text-[10px] text-slate-400">Calo. Burned</span>
            </div>
          </div>

          {/* LARGE DIGITAL TIMER (MATCHING 16:00 DISPLAY) */}
          <div className="text-center mb-6">
            <span className="text-5xl font-mono font-bold tracking-wider text-white">
              {formatTimer(seconds)}
            </span>
            <p className="text-xs text-slate-400 mt-1">
              {formatTimer(remainingSeconds)} remaining of {targetDurationMinutes}m target
            </p>
          </div>

          {/* CONTROLS ROW (MATCHING DURATION, PROMINENT LIME-GREEN PAUSE, EXIT) */}
          <div className="flex items-center justify-between w-full px-4 mb-4">
            {/* Target Duration button */}
            <div className="px-4 py-2.5 rounded-2xl bg-slate-900 border border-slate-800 text-xs font-bold text-slate-300">
              Duration <span className="text-lime-400">{targetDurationMinutes}Min</span>
            </div>

            {/* HUGE LIME-GREEN PLAY / PAUSE BUTTON */}
            <button
              onClick={handleToggle}
              className="h-16 w-16 rounded-full bg-lime-400 hover:bg-lime-300 text-slate-950 flex items-center justify-center shadow-xl shadow-lime-400/40 active:scale-95 transition-all"
            >
              {isRunning ? (
                <Pause className="h-8 w-8 fill-slate-950" />
              ) : (
                <Play className="h-8 w-8 fill-slate-950 ml-1" />
              )}
            </button>

            {/* EXIT / STOP BUTTON */}
            <button
              onClick={handleStop}
              className="px-5 py-2.5 rounded-2xl bg-slate-900 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 border border-slate-800 text-xs font-bold transition-all"
            >
              Exit
            </button>
          </div>

          {/* BOTTOM QUICK ACTIONS: MORE & SET GOAL */}
          <div className="grid grid-cols-2 gap-3 w-full pt-3 border-t border-slate-900">
            <button
              onClick={() => setTargetDurationMinutes(targetDurationMinutes === 20 ? 30 : targetDurationMinutes === 30 ? 45 : 20)}
              className="py-2.5 rounded-xl bg-slate-900/70 border border-slate-800 text-xs font-semibold text-slate-300 hover:bg-slate-800"
            >
              Target: {targetDurationMinutes}m
            </button>
            <Link
              href="/activity"
              className="py-2.5 rounded-xl bg-slate-900/70 border border-slate-800 text-xs font-semibold text-slate-300 hover:bg-slate-800 text-center"
            >
              View History
            </Link>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
