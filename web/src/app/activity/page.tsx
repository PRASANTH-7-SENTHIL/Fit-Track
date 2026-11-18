'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import AppShell from '@/components/layout/AppShell';
import ProgressRing from '@/components/ui/ProgressRing';
import StatCard from '@/components/ui/StatCard';
import { useAppStore } from '@/store';
import {
  Footprints,
  Flame,
  Clock,
  Navigation,
  Plus,
  Play,
  RotateCcw,
  CheckCircle2,
  Calendar,
  Zap,
  MapPin,
} from 'lucide-react';
import { ActivityType, ActivityRecord } from '@/types';
import { calculateCaloriesBurned, calculateDistance } from '@/lib/calculations';
import RouteHistoryModal from '@/components/map/RouteHistoryModal';

import MobileStepSensorBanner from '@/components/sensor/MobileStepSensorBanner';

export default function ActivityTrackerPage() {
  const { profile, dailyTargets, todayActivity, setTodayActivity } = useAppStore();

  const targetSteps = dailyTargets?.steps || 10000;
  const heightCm = profile?.heightCm || 175;
  const weightKg = profile?.weightKg || 74;

  // Real values - 0 if not logged
  const currentSteps = todayActivity?.steps || 0;
  const distanceKm = todayActivity?.distanceKm || 0;
  const caloriesBurned = todayActivity?.caloriesBurned || 0;
  const activeMinutes = todayActivity?.activeMinutes || 0;

  const [addStepsModal, setAddStepsModal] = useState(false);
  const [manualStepsInput, setManualStepsInput] = useState(1000);

  // Quick activity logger state
  const [selectedActivity, setSelectedActivity] = useState<ActivityType>('walking');
  const [activityDuration, setActivityDuration] = useState(30);
  const [selectedRouteActivity, setSelectedRouteActivity] = useState<ActivityRecord | null>(null);

  const handleAddManualSteps = () => {
    const newSteps = currentSteps + Number(manualStepsInput);
    const newDistance = calculateDistance(newSteps, heightCm);
    const stepCalories = Math.round(Number(manualStepsInput) * 0.04);

    setTodayActivity({
      uid: profile?.uid || 'athlete_01',
      date: new Date().toISOString().split('T')[0],
      steps: newSteps,
      distanceKm: newDistance,
      activeMinutes: activeMinutes + Math.round(Number(manualStepsInput) / 100),
      caloriesBurned: caloriesBurned + stepCalories,
      activities: todayActivity?.activities || [],
    });

    setAddStepsModal(false);
  };

  const handleLogQuickActivity = () => {
    const burned = calculateCaloriesBurned(selectedActivity, activityDuration, weightKg);
    const newActivity: ActivityRecord = {
      id: 'act_' + Date.now(),
      type: selectedActivity,
      startTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      durationMinutes: activityDuration,
      caloriesBurned: burned,
      status: 'completed',
    };

    const existingActivities = todayActivity?.activities || [];

    setTodayActivity({
      uid: profile?.uid || 'athlete_01',
      date: new Date().toISOString().split('T')[0],
      steps: currentSteps + (selectedActivity === 'walking' ? activityDuration * 100 : selectedActivity === 'running' ? activityDuration * 150 : 0),
      distanceKm: distanceKm + (selectedActivity === 'walking' ? (activityDuration * 0.08) : selectedActivity === 'running' ? (activityDuration * 0.16) : 0),
      activeMinutes: activeMinutes + activityDuration,
      caloriesBurned: caloriesBurned + burned,
      activities: [newActivity, ...existingActivities],
    });

    alert(`Logged ${activityDuration} mins of ${selectedActivity.replace('_', ' ')}! +${burned} kcal burned.`);
  };

  // Only real activities from the user
  const pastActivities: ActivityRecord[] = todayActivity?.activities || [];

  return (
    <AppShell
      title="Activity Tracker"
      subtitle="Continuous step counting, energy expenditure, and workout durations"
      headerAction={
        <div className="flex items-center gap-2">
          <button
            onClick={() => setAddStepsModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700"
          >
            <Plus className="h-3.5 w-3.5 text-lime-400" />
            <span>Manual Steps</span>
          </button>
          <Link
            href="/running"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-lime-400 hover:bg-lime-300 text-xs font-bold text-slate-950 shadow-md shadow-lime-400/20"
          >
            <Play className="h-3.5 w-3.5 fill-slate-950" />
            <span>GPS Tracking</span>
          </Link>
        </div>
      }
    >
      <div className="space-y-6">
        {/* PHYSICAL MOBILE SENSOR REAL-TIME BANNER */}
        <MobileStepSensorBanner />

        {/* TOP STEP GAIN OVERVIEW */}
        <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <ProgressRing
              progress={(currentSteps / targetSteps) * 100}
              size={170}
              strokeWidth={14}
              color="#84cc16"
              value={currentSteps.toLocaleString()}
              label="DAILY STEPS"
              subValue={`${Math.round((currentSteps / targetSteps) * 100)}% of ${targetSteps.toLocaleString()}`}
            />

            <div className="space-y-2 text-center sm:text-left">
              <span className="text-[11px] font-bold uppercase tracking-wider text-lime-400 px-2.5 py-1 rounded-full bg-lime-400/10 border border-lime-400/20">
                ACTIVE METRICS
              </span>
              <h2 className="text-2xl font-extrabold text-white">Daily Step Progression</h2>
              <p className="text-xs text-slate-400 max-w-sm">
                Steps calculated dynamically from device sensors and synced motion records.
              </p>
              <div className="pt-1 flex items-center gap-3 justify-center sm:justify-start text-xs font-semibold">
                <span className="text-lime-400">{(targetSteps - currentSteps).toLocaleString()} to goal</span>
                <span className="text-slate-600">•</span>
                <span className="text-slate-400">{distanceKm} km traversed</span>
              </div>
            </div>
          </div>

          {/* Quick Stat Tiles */}
          <div className="grid grid-cols-3 gap-3 w-full md:w-auto">
            <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 text-center min-w-[100px]">
              <Navigation className="h-5 w-5 text-blue-400 mx-auto mb-1" />
              <span className="text-lg font-black text-white block">{distanceKm}</span>
              <span className="text-[10px] text-slate-400 uppercase tracking-wider">Kilometers</span>
            </div>
            <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 text-center min-w-[100px]">
              <Clock className="h-5 w-5 text-amber-400 mx-auto mb-1" />
              <span className="text-lg font-black text-white block">{activeMinutes}</span>
              <span className="text-[10px] text-slate-400 uppercase tracking-wider">Active Mins</span>
            </div>
            <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 text-center min-w-[100px]">
              <Flame className="h-5 w-5 text-rose-400 mx-auto mb-1" />
              <span className="text-lg font-black text-white block">{caloriesBurned}</span>
              <span className="text-[10px] text-slate-400 uppercase tracking-wider">Burned kcal</span>
            </div>
          </div>
        </div>

        {/* LOG A PHYSICAL ACTIVITY */}
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Zap className="h-4 w-4 text-lime-400" />
                <span>Log Physical Activity</span>
              </h3>
              <p className="text-[11px] text-slate-400">Record a workout to compute exact MET metabolic calorie expenditure</p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-4">
            {[
              { id: 'walking', label: 'Walking' },
              { id: 'running', label: 'Running' },
              { id: 'cycling', label: 'Cycling' },
              { id: 'gym_workout', label: 'Gym Workout' },
              { id: 'general_exercise', label: 'General Fitness' },
            ].map((act) => (
              <button
                key={act.id}
                type="button"
                onClick={() => setSelectedActivity(act.id as ActivityType)}
                className={`py-3 px-3 rounded-2xl text-xs font-semibold border transition-all text-center ${
                  selectedActivity === act.id
                    ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-600/30 font-bold'
                    : 'bg-slate-950/70 border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                {act.label}
              </button>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4 bg-slate-950/70 p-4 rounded-2xl border border-slate-800">
            <div className="flex-1 w-full">
              <div className="flex justify-between text-xs font-semibold text-slate-300 mb-1.5">
                <span>Duration</span>
                <span className="text-lime-400 font-bold">{activityDuration} minutes</span>
              </div>
              <input
                type="range"
                min={5}
                max={180}
                step={5}
                value={activityDuration}
                onChange={(e) => setActivityDuration(Number(e.target.value))}
                className="w-full accent-lime-400 cursor-pointer"
              />
            </div>

            <button
              onClick={handleLogQuickActivity}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-lime-400 hover:bg-lime-300 text-slate-950 text-xs font-extrabold shadow-md transition-all whitespace-nowrap active:scale-95"
            >
              + Log Activity (+{calculateCaloriesBurned(selectedActivity, activityDuration, weightKg)} kcal)
            </button>
          </div>
        </div>

        {/* RECENT ACTIVITIES LIST */}
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Calendar className="h-4 w-4 text-blue-400" />
              <span>Today's Activity Log</span>
            </h3>
            <span className="text-xs text-slate-400">{pastActivities.length} sessions logged</span>
          </div>

          <div className="space-y-2.5">
            {pastActivities.length === 0 ? (
              <div className="p-8 rounded-2xl bg-slate-950/40 border border-slate-800/60 text-center">
                <Footprints className="h-8 w-8 text-slate-600 mx-auto mb-2" />
                <p className="text-xs font-semibold text-slate-300">No activities recorded today</p>
                <p className="text-[11px] text-slate-500 mt-0.5">Start walking with your phone or log an activity above.</p>
              </div>
            ) : (
              pastActivities.map((act) => (
                <div
                  key={act.id}
                  className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800/80 flex items-center justify-between transition-colors hover:border-slate-700"
                >
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-lime-400">
                    <Footprints className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-bold text-white capitalize">
                        {act.type.replace('_', ' ')}
                      </h4>
                      {act.route && act.route.length > 0 && (
                        <button
                          onClick={() => setSelectedRouteActivity(act)}
                          className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 text-[10px] font-bold text-blue-400 transition-colors"
                        >
                          <MapPin className="h-2.5 w-2.5" />
                          <span>View Map</span>
                        </button>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400">
                      {act.startTime} • {act.durationMinutes} minutes
                      {act.distanceKm ? ` • ${act.distanceKm} km` : ''}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs font-extrabold text-amber-400 block">
                    +{act.caloriesBurned} kcal
                  </span>
                  <span className="text-[10px] text-emerald-400 font-semibold uppercase">
                    {act.status}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
        </div>
      </div>

      {/* Manual Steps Modal */}
      {addStepsModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl">
            <h3 className="text-base font-bold text-white mb-1">Add Manual Steps</h3>
            <p className="text-xs text-slate-400 mb-4">
              Add steps from external pedometers or off-device walking sessions.
            </p>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Steps to Add</label>
                <input
                  type="number"
                  step={100}
                  value={manualStepsInput}
                  onChange={(e) => setManualStepsInput(Number(e.target.value))}
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                {[1000, 2500, 5000].map((count) => (
                  <button
                    key={count}
                    type="button"
                    onClick={() => setManualStepsInput(count)}
                    className="py-1.5 rounded-lg bg-slate-800 text-[11px] font-semibold text-slate-300 hover:bg-slate-700"
                  >
                    +{count.toLocaleString()}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setAddStepsModal(false)}
                className="flex-1 py-2.5 rounded-xl bg-slate-800 text-xs font-semibold text-slate-300 hover:bg-slate-700"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAddManualSteps}
                className="flex-1 py-2.5 rounded-xl bg-lime-400 text-xs font-bold text-slate-950 hover:bg-lime-300 shadow-md"
              >
                Save Steps
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Route History Modal */}
      {selectedRouteActivity && (
        <RouteHistoryModal
          activity={selectedRouteActivity}
          onClose={() => setSelectedRouteActivity(null)}
        />
      )}
    </AppShell>
  );
}
