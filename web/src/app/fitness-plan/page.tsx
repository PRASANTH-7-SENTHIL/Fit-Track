'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Sparkles,
  Flame,
  CheckCircle2,
  TrendingUp,
  Droplet,
  Footprints,
  Dumbbell,
  Sliders,
  ArrowRight,
} from 'lucide-react';
import { useAppStore } from '@/store';
import ProgressRing from '@/components/ui/ProgressRing';
import NutrientBar from '@/components/ui/NutrientBar';

export default function FitnessPlanPage() {
  const router = useRouter();
  const { profile, calculations, setDailyTargets, setUser, user } = useAppStore();

  // If no calculations present, fallback to sane defaults
  const calc = calculations || {
    bmi: 23.4,
    bmiCategory: 'Normal',
    bmr: 1720,
    tdee: 2450,
    dailyCalorieTarget: 2250,
    proteinTargetG: 150,
    carbTargetG: 240,
    fatTargetG: 65,
    fiberTargetG: 30,
    dailyStepTarget: 10000,
    waterIntakeMl: 2800,
  };

  // Editable target overrides
  const [calorieTarget, setCalorieTarget] = useState(calc.dailyCalorieTarget);
  const [proteinTarget, setProteinTarget] = useState(calc.proteinTargetG);
  const [carbTarget, setCarbTarget] = useState(calc.carbTargetG);
  const [fatTarget, setFatTarget] = useState(calc.fatTargetG);
  const [fiberTarget, setFiberTarget] = useState(calc.fiberTargetG);
  const [stepTarget, setStepTarget] = useState(calc.dailyStepTarget);
  const [isEditing, setIsEditing] = useState(false);

  const handleSetDailyTarget = () => {
    const activeUid = user?.uid || profile?.uid || `athlete_${Date.now()}`;
    const targets = {
      uid: activeUid,
      calories: Number(calorieTarget),
      proteinG: Number(proteinTarget),
      carbsG: Number(carbTarget),
      fatG: Number(fatTarget),
      fiberG: Number(fiberTarget),
      steps: Number(stepTarget),
      waterMl: calc.waterIntakeMl,
      setAt: new Date().toISOString(),
    };

    setDailyTargets(targets);

    const currentUser = user || {
      uid: activeUid,
      email: 'athlete@fittrack.ai',
      displayName: profile?.fullName || 'Athlete',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      onboardingComplete: true,
      providers: ['local'],
    };

    setUser({ ...currentUser, onboardingComplete: true });
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-4 py-12">
      <div className="w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-10 shadow-2xl backdrop-blur-xl">
        {/* Top Celebration Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-lime-400/10 text-lime-400 text-xs font-bold border border-lime-400/30 mb-3">
            <CheckCircle2 className="h-4 w-4" />
            <span>AI Health Intelligence Generated</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">Your Personalized Fitness Target</h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-lg mx-auto">
            Calculated via Mifflin-St Jeor metabolic modeling calibrated for your goal:{' '}
            <span className="text-white font-bold capitalize">
              {profile?.fitnessGoal?.replace('_', ' ') || 'General Fitness'}
            </span>
          </p>
        </div>

        {/* METABOLIC TRIFECTA CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          {/* BMI Card */}
          <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 flex flex-col items-center text-center">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Body Mass Index</span>
            <ProgressRing
              progress={Math.min((calc.bmi / 35) * 100, 100)}
              size={100}
              strokeWidth={8}
              color="#3b82f6"
              value={calc.bmi}
              label={calc.bmiCategory}
            />
          </div>

          {/* BMR Card */}
          <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 flex flex-col items-center justify-center text-center">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Basal Metabolic Rate</span>
            <span className="text-3xl font-black text-amber-400 my-1">{calc.bmr}</span>
            <span className="text-[11px] text-slate-400">kcal/day at absolute rest</span>
            <span className="text-[10px] text-slate-500 mt-2 px-2 py-0.5 rounded bg-slate-900 border border-slate-800">
              Mifflin-St Jeor
            </span>
          </div>

          {/* TDEE Card */}
          <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 flex flex-col items-center justify-center text-center">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Total Daily Energy</span>
            <span className="text-3xl font-black text-lime-400 my-1">{calc.tdee}</span>
            <span className="text-[11px] text-slate-400">kcal burned with daily motion</span>
            <span className="text-[10px] text-slate-500 mt-2 px-2 py-0.5 rounded bg-slate-900 border border-slate-800">
              Activity multiplier
            </span>
          </div>
        </div>

        {/* DAILY NUTRITION & CALORIE TARGET */}
        <div className="p-6 rounded-2xl bg-slate-950/90 border border-slate-800/90 mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-3">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Recommended Daily Caloric Intake</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-4xl font-extrabold text-white tracking-tight">{calorieTarget}</span>
                <span className="text-sm font-semibold text-slate-400">kcal / day</span>
              </div>
            </div>

            <button
              onClick={() => setIsEditing(!isEditing)}
              className="self-start sm:self-auto flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 transition-colors"
            >
              <Sliders className="h-3.5 w-3.5" />
              <span>{isEditing ? 'Close Adjustments' : 'Customize Targets'}</span>
            </button>
          </div>

          {/* Edit Slider drawer */}
          {isEditing && (
            <div className="pt-4 pb-2 border-b border-slate-800 space-y-3 animate-fade-in">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="text-slate-300 font-semibold">Calories: {calorieTarget} kcal</label>
                  <input
                    type="range"
                    min={1200}
                    max={4000}
                    step={50}
                    value={calorieTarget}
                    onChange={(e) => setCalorieTarget(Number(e.target.value))}
                    className="w-full accent-blue-500 cursor-pointer"
                  />
                </div>
                <div>
                  <label className="text-slate-300 font-semibold">Daily Steps: {stepTarget.toLocaleString()}</label>
                  <input
                    type="range"
                    min={3000}
                    max={25000}
                    step={500}
                    value={stepTarget}
                    onChange={(e) => setStepTarget(Number(e.target.value))}
                    className="w-full accent-lime-400 cursor-pointer"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Macronutrients breakdown */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-center">
              <span className="text-[11px] font-semibold text-blue-400 block mb-1">PROTEIN</span>
              <span className="text-xl font-black text-white">{proteinTarget}g</span>
              <span className="text-[10px] text-slate-500 block mt-0.5">{proteinTarget * 4} kcal (optimal)</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-center">
              <span className="text-[11px] font-semibold text-amber-400 block mb-1">CARBOHYDRATES</span>
              <span className="text-xl font-black text-white">{carbTarget}g</span>
              <span className="text-[10px] text-slate-500 block mt-0.5">{carbTarget * 4} kcal (energy)</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-center">
              <span className="text-[11px] font-semibold text-rose-400 block mb-1">HEALTHY FATS</span>
              <span className="text-xl font-black text-white">{fatTarget}g</span>
              <span className="text-[10px] text-slate-500 block mt-0.5">{fatTarget * 9} kcal (hormones)</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-center">
              <span className="text-[11px] font-semibold text-emerald-400 block mb-1">DIETARY FIBER</span>
              <span className="text-xl font-black text-white">{fiberTarget}g</span>
              <span className="text-[10px] text-slate-500 block mt-0.5">Gut & metabolic health</span>
            </div>
          </div>

          {/* Extra daily targets */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4 pt-4 border-t border-slate-800/80">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-900/60 border border-slate-800/60">
              <Footprints className="h-5 w-5 text-lime-400" />
              <div>
                <span className="text-xs font-bold text-white">{stepTarget.toLocaleString()} steps/day</span>
                <p className="text-[10px] text-slate-400">Baseline movement target</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-900/60 border border-slate-800/60">
              <Droplet className="h-5 w-5 text-blue-400" />
              <div>
                <span className="text-xs font-bold text-white">{(calc.waterIntakeMl / 1000).toFixed(1)} L water</span>
                <p className="text-[10px] text-slate-400">Optimal hydration balance</p>
              </div>
            </div>
          </div>
        </div>

        {/* PRIMARY COMMIT ACTION BUTTON */}
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <button
            onClick={handleSetDailyTarget}
            className="w-full flex items-center justify-center gap-2 py-4 px-8 rounded-2xl bg-blue-600 hover:bg-blue-500 text-sm font-extrabold text-white shadow-xl shadow-blue-600/30 active:scale-98 transition-all tracking-wide"
          >
            <span>SET MY DAILY TARGET</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
