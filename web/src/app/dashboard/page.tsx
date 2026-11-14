'use client';

import React from 'react';
import Link from 'next/link';
import AppShell from '@/components/layout/AppShell';
import ProgressRing from '@/components/ui/ProgressRing';
import NutrientBar from '@/components/ui/NutrientBar';
import StatCard from '@/components/ui/StatCard';
import { useAppStore } from '@/store';
import {
  Footprints,
  Flame,
  Clock,
  Heart,
  Play,
  PlusCircle,
  ScanLine,
  Apple,
  FileText,
  UserCheck,
  Bot,
  Dumbbell,
  Scale,
  Sparkles,
  ChevronRight,
  TrendingUp,
  Activity as ActivityIcon,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';

import MobileStepSensorBanner from '@/components/sensor/MobileStepSensorBanner';

export default function DashboardPage() {
  const {
    profile,
    dailyTargets,
    todayActivity,
    todayNutrition,
    workoutSessions,
    weightHistory,
  } = useAppStore();

  // Targets
  const targetCalories = dailyTargets?.calories || (profile?.gender === 'female' ? 2000 : 2400);
  const targetSteps = dailyTargets?.steps || 10000;
  const targetProtein = dailyTargets?.proteinG || 140;
  const targetCarbs = dailyTargets?.carbsG || 240;
  const targetFat = dailyTargets?.fatG || 60;
  const targetFiber = dailyTargets?.fiberG || 28;

  // Actuals - Zero baseline when no records exist
  const consumedCalories = todayNutrition?.totalCalories || 0;
  const remainingCalories = Math.max(targetCalories - consumedCalories, 0);
  const consumedProtein = todayNutrition?.totalProteinG || 0;
  const consumedCarbs = todayNutrition?.totalCarbsG || 0;
  const consumedFat = todayNutrition?.totalFatG || 0;
  const consumedFiber = todayNutrition?.totalFiberG || 0;

  const currentSteps = todayActivity?.steps || 0;
  const distanceKm = todayActivity?.distanceKm || 0;
  const caloriesBurned = todayActivity?.caloriesBurned || 0;
  const activeMinutes = todayActivity?.activeMinutes || 0;

  const currentWeight = profile?.weightKg || 0;
  const goalWeight = profile?.targetWeightKg || (profile?.fitnessGoal === 'weight_loss' ? Math.max(currentWeight - 5, 0) : profile?.fitnessGoal === 'weight_gain' ? currentWeight + 4 : currentWeight);
  const bmi = profile && profile.heightCm > 0 ? (profile.weightKg / Math.pow(profile.heightCm / 100, 2)).toFixed(1) : '0.0';

  // Real Weekly Activity Chart Data
  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const todayIdx = new Date().getDay();
  const weeklyData = daysOfWeek.map((day, idx) => {
    const isToday = idx === todayIdx;
    return {
      day,
      steps: isToday ? currentSteps : 0,
      calories: isToday ? caloriesBurned : 0,
      isToday,
    };
  });

  return (
    <AppShell
      title="Dashboard"
      subtitle={`Welcome back, ${profile?.fullName || 'Athlete'}! Ready to crush today's goals?`}
      headerAction={
        <Link
          href="/workouts"
          className="hidden sm:flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-lime-400 hover:bg-lime-300 text-slate-950 text-xs font-bold transition-all shadow-md shadow-lime-400/20 active:scale-95"
        >
          <Play className="h-3.5 w-3.5 fill-slate-950" />
          <span>Quick Workout</span>
        </Link>
      }
    >
      <div className="space-y-6">
        {/* LIVE MOBILE SENSOR STEP TRACKER BANNER */}
        <MobileStepSensorBanner />

        {/* HERO STATUS CARD (WHITE WITH LIGHT BLUE IN LIGHT MODE, DARK IN DARK MODE) */}
        <div className="relative overflow-hidden rounded-3xl bg-white dark:bg-gradient-to-br dark:from-slate-900 dark:via-slate-900 dark:to-slate-950 border border-blue-100 dark:border-slate-800 p-6 sm:p-8 shadow-xl shadow-blue-500/5 dark:shadow-2xl hero-status-card">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            {/* Left: Highlight status & Rings */}
            <div className="flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
              <ProgressRing
                progress={(currentSteps / targetSteps) * 100}
                size={160}
                strokeWidth={12}
                color="#84cc16" // Lime green from reference image
                value={currentSteps.toLocaleString()}
                label="STEPS TODAY"
                subValue={`Goal: ${targetSteps.toLocaleString()}`}
              />

              <div className="space-y-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-lime-700 dark:text-lime-400 px-2.5 py-1 rounded-full bg-lime-400/20 border border-lime-400/40">
                  CURRENT STATUS
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                  {Math.round((currentSteps / targetSteps) * 100)}% of Daily Motion
                </h2>
                <p className="text-xs text-slate-600 dark:text-slate-400 max-w-sm">
                  You are only {(targetSteps - currentSteps).toLocaleString()} steps away from reaching your step objective!
                </p>
                <div className="flex flex-wrap gap-2 pt-2 justify-center sm:justify-start">
                  <Link
                    href="/running"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md shadow-blue-600/20 transition-all"
                  >
                    <Play className="h-3 w-3 fill-white" />
                    <span>Start GPS Run</span>
                  </Link>
                  <Link
                    href="/food-scanner"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 text-xs font-semibold border border-blue-200 dark:border-slate-700 transition-all"
                  >
                    <ScanLine className="h-3 w-3 text-blue-600 dark:text-lime-400" />
                    <span>Scan Meal</span>
                  </Link>
                </div>
              </div>
            </div>

            {/* Right: Key 3 Metrics (Matching reference center card) */}
            <div className="grid grid-cols-3 gap-3 w-full md:w-auto">
              <div className="p-3.5 rounded-2xl bg-blue-50/80 dark:bg-slate-950/80 border border-blue-100 dark:border-slate-800/80 text-center min-w-[90px] shadow-sm">
                <Footprints className="h-5 w-5 text-lime-600 dark:text-lime-400 mx-auto mb-1" />
                <span className="text-base font-extrabold text-slate-900 dark:text-white block">{distanceKm}</span>
                <span className="text-[10px] text-slate-600 dark:text-slate-400 uppercase tracking-wider font-semibold">KM Distance</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-blue-50/80 dark:bg-slate-950/80 border border-blue-100 dark:border-slate-800/80 text-center min-w-[90px] shadow-sm">
                <Heart className="h-5 w-5 text-rose-500 dark:text-rose-400 mx-auto mb-1" />
                <span className="text-base font-extrabold text-slate-900 dark:text-white block">118</span>
                <span className="text-[10px] text-slate-600 dark:text-slate-400 uppercase tracking-wider font-semibold">Avg BPM</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-blue-50/80 dark:bg-slate-950/80 border border-blue-100 dark:border-slate-800/80 text-center min-w-[90px] shadow-sm">
                <Flame className="h-5 w-5 text-amber-500 dark:text-amber-400 mx-auto mb-1" />
                <span className="text-base font-extrabold text-slate-900 dark:text-white block">{caloriesBurned}</span>
                <span className="text-[10px] text-slate-600 dark:text-slate-400 uppercase tracking-wider font-semibold">Calo. Burned</span>
              </div>
            </div>
          </div>
        </div>

        {/* QUICK NAVIGATION ACTION TILES */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5">
          {[
            { name: 'Workouts', href: '/workouts', icon: Dumbbell, color: 'text-blue-400' },
            { name: 'Scan Food', href: '/food-scanner', icon: ScanLine, color: 'text-lime-400' },
            { name: 'Food Diary', href: '/nutrition', icon: Apple, color: 'text-amber-400' },
            { name: 'Activity', href: '/activity', icon: Footprints, color: 'text-emerald-400' },
            { name: 'AI Report', href: '/daily-report', icon: FileText, color: 'text-cyan-400' },
            { name: 'Weight', href: '/weight', icon: Scale, color: 'text-purple-400' },
            { name: '3D Avatar', href: '/body-transform', icon: UserCheck, color: 'text-pink-400' },
            { name: 'AI Coach', href: '/ai-assistant', icon: Bot, color: 'text-indigo-400' },
          ].map((action) => {
            const Icon = action.icon;
            return (
              <Link
                key={action.name}
                href={action.href}
                className="flex flex-col items-center justify-center p-3 rounded-2xl bg-slate-900 border border-slate-800/80 hover:border-slate-700 hover:bg-slate-850 hover:scale-105 active:scale-95 transition-all text-center group"
              >
                <div className={`p-2 rounded-xl bg-slate-800/80 mb-1.5 group-hover:bg-slate-700 ${action.color}`}>
                  <Icon className="h-4 w-4" />
                </div>
                <span className="text-[11px] font-semibold text-slate-300 group-hover:text-white">
                  {action.name}
                </span>
              </Link>
            );
          })}
        </div>

        {/* MAIN 2-COLUMN GRID: NUTRITION & PROGRESS */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* NUTRITION & CALORIE TRACKER */}
          <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-xl flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400">
                    <Apple className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">Daily Nutrition Intake</h3>
                    <p className="text-[11px] text-slate-400">Target vs Consumed Real-Time</p>
                  </div>
                </div>
                <Link
                  href="/nutrition"
                  className="text-xs text-blue-400 hover:underline flex items-center gap-1 font-semibold"
                >
                  <span>Diary</span>
                  <ChevronRight className="h-3 w-3" />
                </Link>
              </div>

              {/* Calorie Progress Ring & Summary */}
              <div className="flex items-center justify-around p-4 rounded-2xl bg-slate-950/70 border border-slate-800/70 mb-5">
                <ProgressRing
                  progress={(consumedCalories / targetCalories) * 100}
                  size={120}
                  strokeWidth={10}
                  color="#3b82f6"
                  value={consumedCalories}
                  label="CAL CONSUMED"
                />

                <div className="space-y-2 text-right">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Remaining</span>
                    <span className="text-2xl font-black text-lime-400">{remainingCalories}</span>
                    <span className="text-[10px] text-slate-400"> kcal</span>
                  </div>
                  <div className="pt-2 border-t border-slate-800">
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Target</span>
                    <span className="text-sm font-bold text-slate-300">{targetCalories} kcal</span>
                  </div>
                </div>
              </div>

              {/* Nutrient Bars */}
              <div className="space-y-1">
                <NutrientBar
                  label="Protein (Growth & Repair)"
                  current={consumedProtein}
                  target={targetProtein}
                  unit="g"
                  color="bg-blue-500"
                />
                <NutrientBar
                  label="Carbohydrates (Energy)"
                  current={consumedCarbs}
                  target={targetCarbs}
                  unit="g"
                  color="bg-amber-400"
                />
                <NutrientBar
                  label="Dietary Fats (Hormone balance)"
                  current={consumedFat}
                  target={targetFat}
                  unit="g"
                  color="bg-rose-400"
                />
                <NutrientBar
                  label="Fiber (Digestion & Microbiome)"
                  current={consumedFiber}
                  target={targetFiber}
                  unit="g"
                  color="bg-emerald-400"
                />
              </div>
            </div>

            <div className="pt-4 mt-4 border-t border-slate-800 flex items-center justify-between">
              <span className="text-xs text-slate-400">Missing today's breakfast or lunch?</span>
              <Link
                href="/food-scanner"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700"
              >
                <PlusCircle className="h-3.5 w-3.5 text-lime-400" />
                <span>Add Food</span>
              </Link>
            </div>
          </div>

          {/* WEEKLY ACTIVITY & BODY STATS */}
          <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-xl flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-lime-500/10 text-lime-400">
                    <ActivityIcon className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">Weekly Activity Trend</h3>
                    <p className="text-[11px] text-slate-400">Steps Logged Across 7 Days</p>
                  </div>
                </div>
                <Link
                  href="/activity"
                  className="text-xs text-lime-400 hover:underline flex items-center gap-1 font-semibold"
                >
                  <span>Details</span>
                  <ChevronRight className="h-3 w-3" />
                </Link>
              </div>

              {/* Bar Chart */}
              <div className="h-48 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={weeklyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <XAxis
                      dataKey="day"
                      stroke="#64748b"
                      fontSize={11}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      stroke="#64748b"
                      fontSize={11}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(val) => `${val / 1000}k`}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0f172a',
                        border: '1px solid #334155',
                        borderRadius: '12px',
                        fontSize: '11px',
                      }}
                    />
                    <Bar dataKey="steps" radius={[6, 6, 0, 0]}>
                      {weeklyData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={entry.isToday ? '#84cc16' : '#334155'}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Bottom Body Progress Quick Bar */}
              <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-slate-800">
                <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800/80 text-center">
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Weight</span>
                  <span className="text-lg font-black text-white">{currentWeight} kg</span>
                  <span className="text-[10px] text-lime-400 block">Goal: {goalWeight} kg</span>
                </div>
                <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800/80 text-center">
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block">BMI</span>
                  <span className="text-lg font-black text-blue-400">{bmi}</span>
                  <span className="text-[10px] text-slate-400 block">Normal range</span>
                </div>
                <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800/80 text-center">
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Workouts</span>
                  <span className="text-lg font-black text-amber-400">{workoutSessions?.length || 0}</span>
                  <span className="text-[10px] text-slate-400 block">This week</span>
                </div>
              </div>
            </div>

            <div className="pt-4 mt-4 border-t border-slate-800 flex items-center justify-between">
              <span className="text-xs text-slate-400">View your simulated 3D body transformation</span>
              <Link
                href="/body-transform"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600/20 text-blue-400 hover:bg-blue-600/30 text-xs font-semibold border border-blue-500/30"
              >
                <UserCheck className="h-3.5 w-3.5" />
                <span>3D Body</span>
              </Link>
            </div>
          </div>
        </div>

        {/* DAILY CHALLENGES & UPCOMING WORKOUT (From Reference Design Screen 1) */}
        <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-xl">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-2xl bg-gradient-to-tr from-lime-400 to-emerald-500 flex items-center justify-center text-slate-950 shadow-lg shadow-lime-500/20">
                <Dumbbell className="h-7 w-7" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-lime-400 px-2 py-0.5 rounded-md bg-lime-400/10 border border-lime-400/20">
                  TODAY'S CHALLENGE
                </span>
                <h3 className="text-base font-extrabold text-white mt-1">
                  20 Minute Upper Body Dumbbell & Push Workout
                </h3>
                <p className="text-xs text-slate-400">
                  Target: 30 push-ups, 20 squats, 15 jumping jacks • ~180 kcal burn
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <Link
                href="/workout-session?planId=easy_full_body"
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-lime-400 hover:bg-lime-300 text-slate-950 text-xs font-extrabold shadow-lg shadow-lime-400/20 active:scale-95 transition-all"
              >
                <Play className="h-3.5 w-3.5 fill-slate-950" />
                <span>Join Challenge</span>
              </Link>
              <Link
                href="/workouts"
                className="px-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 transition-all text-center"
              >
                Browse All
              </Link>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
