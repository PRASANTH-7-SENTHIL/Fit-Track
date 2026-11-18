'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import AppShell from '@/components/layout/AppShell';
import { useAppStore } from '@/store';
import {
  Play,
  Pause,
  RotateCcw,
  Footprints,
  Heart,
  Flame,
  Navigation,
  Compass,
  ArrowLeft,
  Zap,
  MapPin,
  Map as MapIcon,
  Activity,
  Gauge,
  Timer,
  CheckCircle2,
  AlertCircle,
  Radio,
  History,
  Sliders,
} from 'lucide-react';
import { ActivityType, ActivityRecord } from '@/types';
import { useGeolocationTracker } from '@/lib/useGeolocationTracker';
import RouteHistoryModal from '@/components/map/RouteHistoryModal';

// Dynamically import Leaflet GPS Map to avoid Next.js SSR window errors
const GPSMap = dynamic(() => import('@/components/map/GPSMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-80 sm:h-96 bg-slate-950 rounded-3xl flex flex-col items-center justify-center text-slate-500 border border-slate-800 animate-pulse">
      <Navigation className="h-8 w-8 text-lime-400 mb-2 animate-bounce" />
      <span className="text-xs font-semibold text-slate-400">Initializing Live GPS Map...</span>
    </div>
  ),
});

export default function RunningTrackerPage() {
  const { profile, todayActivity, setTodayActivity } = useAppStore();
  const weightKg = profile?.weightKg || 74;

  const [activeTab, setActiveTab] = useState<'map' | 'hud'>('map');
  const [selectedHistoryActivity, setSelectedHistoryActivity] = useState<ActivityRecord | null>(null);

  const {
    mode,
    setMode,
    isTracking,
    isPaused,
    isSimulating,
    gpsStatus,
    errorMessage,
    currentPosition,
    route,
    distanceKm,
    durationSeconds,
    currentSpeedKmh,
    averageSpeedKmh,
    formattedPace,
    caloriesBurned,
    steps,
    startTracking,
    pauseTracking,
    resumeTracking,
    stopTracking,
    resetTracking,
  } = useGeolocationTracker('running', weightKg);

  const formatTimer = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStartRealGps = () => {
    startTracking(false);
  };

  const handleStartSimulation = () => {
    startTracking(true);
  };

  const handleTogglePause = () => {
    if (isPaused) {
      resumeTracking();
    } else {
      pauseTracking();
    }
  };

  const handleFinishWorkout = () => {
    const record = stopTracking();

    if (record) {
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
        distanceKm: Math.round((current.distanceKm + record.distanceKm!) * 100) / 100,
        activeMinutes: current.activeMinutes + record.durationMinutes,
        caloriesBurned: current.caloriesBurned + record.caloriesBurned,
        activities: [record, ...(current.activities || [])],
      });

      setSelectedHistoryActivity(record);
    } else {
      resetTracking();
    }
  };

  // Filter previous GPS sessions
  const pastGpsSessions = (todayActivity?.activities || []).filter(
    (a) => a.route && a.route.length > 0
  );

  return (
    <AppShell
      title="Live GPS Activity Tracker"
      subtitle="Real-time Geolocation tracking for walking, running, and cycling"
      headerAction={
        <div className="flex items-center gap-2">
          {pastGpsSessions.length > 0 && (
            <button
              onClick={() => setSelectedHistoryActivity(pastGpsSessions[0])}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700 transition-colors"
            >
              <History className="h-3.5 w-3.5 text-lime-400" />
              <span>Last Route ({pastGpsSessions.length})</span>
            </button>
          )}
          <Link
            href="/activity"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700 transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Activity Dashboard</span>
          </Link>
        </div>
      }
    >
      <div className="max-w-4xl mx-auto space-y-6">
        {/* GPS Permission Warning / Error Banner */}
        {errorMessage && (
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3 text-amber-300">
            <AlertCircle className="h-5 w-5 shrink-0 mt-0.5 text-amber-400" />
            <div className="flex-1 text-xs">
              <p className="font-bold">{errorMessage}</p>
              <p className="mt-1 text-amber-400/80">
                You can switch to <strong>Demo Simulation</strong> mode to test live route rendering and pace calculation on your current device.
              </p>
            </div>
            {!isTracking && (
              <button
                onClick={handleStartSimulation}
                className="px-3 py-1.5 rounded-xl bg-lime-400 hover:bg-lime-300 text-slate-950 font-bold text-xs whitespace-nowrap"
              >
                Start Demo Route
              </button>
            )}
          </div>
        )}

        {/* TOP ACTIVITY & VIEW SELECTOR */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-3 rounded-2xl shadow-lg">
          {/* Mode Selector */}
          <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800 w-full sm:w-auto justify-around">
            {[
              { id: 'running', label: 'Running', icon: '🏃' },
              { id: 'walking', label: 'Walking', icon: '🚶' },
              { id: 'cycling', label: 'Cycling', icon: '🚴' },
            ].map((m) => (
              <button
                key={m.id}
                disabled={isTracking}
                onClick={() => setMode(m.id as ActivityType)}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  mode === m.id
                    ? 'bg-lime-400 text-slate-950 shadow-md shadow-lime-400/20'
                    : 'text-slate-400 hover:text-white disabled:opacity-50'
                }`}
              >
                <span>{m.icon}</span>
                <span>{m.label}</span>
              </button>
            ))}
          </div>

          {/* GPS Status & Simulation indicator */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-950 border border-slate-800 text-[11px] font-semibold text-slate-300">
              <Radio
                className={`h-3.5 w-3.5 ${
                  isTracking ? 'text-lime-400 animate-pulse' : 'text-slate-500'
                }`}
              />
              <span>
                {isSimulating
                  ? 'Demo Simulation'
                  : gpsStatus === 'active'
                  ? 'GPS Active'
                  : gpsStatus === 'searching'
                  ? 'Searching Satellites...'
                  : 'GPS Ready'}
              </span>
            </div>

            {/* View Switcher Tabs */}
            <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
              <button
                onClick={() => setActiveTab('map')}
                className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                  activeTab === 'map'
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <MapIcon className="h-3.5 w-3.5" />
                <span>Map</span>
              </button>
              <button
                onClick={() => setActiveTab('hud')}
                className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                  activeTab === 'hud'
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Activity className="h-3.5 w-3.5" />
                <span>HUD</span>
              </button>
            </div>
          </div>
        </div>

        {/* MAIN DISPLAY: INTERACTIVE MAP OR ATHLETE HUD */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* LEFT: MAP / VISUAL DISPLAY (7 cols) */}
          <div className="lg:col-span-7">
            {activeTab === 'map' ? (
              <div className="h-[420px] sm:h-[480px] w-full relative">
                <GPSMap
                  currentPosition={currentPosition}
                  route={route}
                  isTracking={isTracking}
                  activityType={mode}
                />
              </div>
            ) : (
              /* ATHLETE SILHOUETTE HUD CARD */
              <div className="h-[420px] sm:h-[480px] w-full rounded-3xl bg-black border border-slate-800 p-6 shadow-2xl flex flex-col items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
                <svg
                  viewBox="0 0 200 240"
                  className="w-48 h-56 drop-shadow-[0_10px_20px_rgba(0,0,0,0.8)] my-auto"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <circle cx="100" cy="35" r="18" fill="#38bdf8" />
                  <path
                    d="M100 55 C120 55 130 75 125 100 L115 130 C120 150 145 170 140 210 L125 210 C120 180 105 160 100 150 L85 190 L60 210 L50 200 L75 165 L85 120 L70 105 L50 120 L40 110 L65 85 C80 65 90 55 100 55 Z"
                    fill="url(#runnerGrad2)"
                  />
                  <path d="M125 85 L155 105 L150 118 L125 102 Z" fill="#38bdf8" />
                  <defs>
                    <linearGradient id="runnerGrad2" x1="100" y1="55" x2="100" y2="210" gradientUnits="userSpaceOnUse">
                      <stop stopColor="#38bdf8" />
                      <stop offset="0.5" stopColor="#2563eb" />
                      <stop offset="1" stopColor="#84cc16" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="text-center pt-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-lime-400">
                    Live Cadence Sensor
                  </span>
                  <p className="text-[11px] text-slate-400">Telemetry synced with GPS location stream</p>
                </div>
              </div>
            )}
          </div>

          {/* RIGHT: LIVE TELEMETRY & CONTROLS (5 cols) */}
          <div className="lg:col-span-5 flex flex-col justify-between space-y-4">
            {/* TIMER & MAIN DISTANCE HERO */}
            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl text-center">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest block mb-1">
                ELAPSED TIME
              </span>
              <div className="text-5xl font-black font-mono tracking-wider text-white mb-4">
                {formatTimer(durationSeconds)}
              </div>

              <div className="pt-4 border-t border-slate-800/80 flex items-center justify-around">
                <div>
                  <span className="text-3xl font-extrabold text-lime-400 block">
                    {distanceKm}
                  </span>
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                    Kilometers
                  </span>
                </div>
                <div className="h-8 w-px bg-slate-800" />
                <div>
                  <span className="text-3xl font-extrabold text-blue-400 block font-mono">
                    {formattedPace}
                  </span>
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                    Pace / km
                  </span>
                </div>
              </div>
            </div>

            {/* SECONDARY METRICS TILES */}
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 text-center">
                <Gauge className="h-4 w-4 text-cyan-400 mx-auto mb-1" />
                <span className="text-lg font-black text-white block">
                  {currentSpeedKmh}
                </span>
                <span className="text-[10px] text-slate-400 uppercase font-semibold">
                  Speed km/h
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 text-center">
                <Flame className="h-4 w-4 text-rose-400 mx-auto mb-1" />
                <span className="text-lg font-black text-white block">
                  {caloriesBurned}
                </span>
                <span className="text-[10px] text-slate-400 uppercase font-semibold">
                  Burned kcal
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 text-center">
                <Footprints className="h-4 w-4 text-lime-400 mx-auto mb-1" />
                <span className="text-lg font-black text-white block">
                  {mode === 'cycling' ? '--' : steps}
                </span>
                <span className="text-[10px] text-slate-400 uppercase font-semibold">
                  Steps
                </span>
              </div>
            </div>

            {/* CONTROLS AREA */}
            <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-3">
              {!isTracking ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    onClick={handleStartRealGps}
                    className="py-4 px-4 rounded-2xl bg-lime-400 hover:bg-lime-300 text-slate-950 font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-lime-400/30 active:scale-95 transition-all"
                  >
                    <Play className="h-5 w-5 fill-slate-950" />
                    <span>Start GPS Track</span>
                  </button>

                  <button
                    onClick={handleStartSimulation}
                    className="py-4 px-4 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs flex items-center justify-center gap-2 transition-all active:scale-95"
                  >
                    <Navigation className="h-4 w-4 text-blue-400" />
                    <span>Demo Simulation</span>
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  {/* Pause / Resume Button */}
                  <button
                    onClick={handleTogglePause}
                    className={`flex-1 py-4 px-4 rounded-2xl font-black text-sm flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-all ${
                      isPaused
                        ? 'bg-lime-400 hover:bg-lime-300 text-slate-950 shadow-lime-400/30'
                        : 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-amber-500/30'
                    }`}
                  >
                    {isPaused ? (
                      <>
                        <Play className="h-5 w-5 fill-slate-950" />
                        <span>Resume</span>
                      </>
                    ) : (
                      <>
                        <Pause className="h-5 w-5 fill-slate-950" />
                        <span>Pause</span>
                      </>
                    )}
                  </button>

                  {/* Finish & Save Workout */}
                  <button
                    onClick={handleFinishWorkout}
                    className="flex-1 py-4 px-4 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-rose-600/30 active:scale-95 transition-all"
                  >
                    <CheckCircle2 className="h-5 w-5" />
                    <span>Finish & Save</span>
                  </button>
                </div>
              )}

              {/* Reset if paused or idle with data */}
              {isTracking && (
                <button
                  onClick={resetTracking}
                  className="w-full py-2 rounded-xl bg-slate-950/60 hover:bg-slate-800 text-[11px] font-semibold text-slate-400 hover:text-slate-200 border border-slate-800/80 transition-colors"
                >
                  Discard Current Session
                </button>
              )}
            </div>
          </div>
        </div>

        {/* PAST GPS SESSIONS LIST */}
        {pastGpsSessions.length > 0 && (
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <History className="h-4 w-4 text-blue-400" />
                <span>Recorded GPS Routes ({pastGpsSessions.length})</span>
              </h3>
              <span className="text-xs text-slate-400">Click any session to view route on map</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {pastGpsSessions.map((session) => (
                <div
                  key={session.id}
                  onClick={() => setSelectedHistoryActivity(session)}
                  className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800/80 hover:border-slate-700 cursor-pointer transition-all hover:scale-[1.01] group"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-lime-400 px-2 py-0.5 rounded-full bg-lime-400/10 border border-lime-400/20">
                      {session.type}
                    </span>
                    <span className="text-[11px] text-slate-400">{session.startTime}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-lg font-black text-white block">
                        {session.distanceKm ?? 0} km
                      </span>
                      <span className="text-[11px] text-slate-400">
                        {session.durationMinutes} mins • {session.caloriesBurned} kcal
                      </span>
                    </div>

                    <div className="h-9 w-9 rounded-xl bg-slate-900 group-hover:bg-blue-600/20 border border-slate-800 group-hover:border-blue-500/40 flex items-center justify-center text-blue-400 transition-colors">
                      <MapPin className="h-4 w-4" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Route History Modal */}
      {selectedHistoryActivity && (
        <RouteHistoryModal
          activity={selectedHistoryActivity}
          onClose={() => setSelectedHistoryActivity(null)}
        />
      )}
    </AppShell>
  );
}
