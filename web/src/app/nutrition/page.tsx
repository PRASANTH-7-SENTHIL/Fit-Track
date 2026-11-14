'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import AppShell from '@/components/layout/AppShell';
import ProgressRing from '@/components/ui/ProgressRing';
import NutrientBar from '@/components/ui/NutrientBar';
import { useAppStore, initializeTodayNutrition, getTodayString } from '@/store';
import {
  Apple,
  Plus,
  Trash2,
  ChevronDown,
  ChevronUp,
  Flame,
  Calendar,
  Sparkles,
  ArrowRight,
  Coffee,
  Sun,
  Moon,
  Cookie,
} from 'lucide-react';
import { MealCategory, FoodEntry } from '@/types';

export default function NutritionTrackerPage() {
  const {
    user,
    profile,
    dailyTargets,
    todayNutrition,
    setTodayNutrition,
    removeFoodEntry,
  } = useAppStore();

  const [dateSelection, setDateSelection] = useState(getTodayString());

  // Real nutrition data for the selected day
  const nutrition = todayNutrition || {
    uid: user?.uid || 'athlete_01',
    date: getTodayString(),
    totalCalories: 0,
    totalProteinG: 0,
    totalCarbsG: 0,
    totalFatG: 0,
    totalFiberG: 0,
    meals: {
      breakfast: [],
      lunch: [],
      dinner: [],
      snacks: [],
    },
  };

  const targetCal = dailyTargets?.calories || 2450;
  const targetProtein = dailyTargets?.proteinG || 160;
  const targetCarbs = dailyTargets?.carbsG || 260;
  const targetFat = dailyTargets?.fatG || 65;
  const targetFiber = dailyTargets?.fiberG || 30;

  const remainingCal = Math.max(targetCal - nutrition.totalCalories, 0);

  const mealIcons: Record<MealCategory, any> = {
    breakfast: Coffee,
    lunch: Sun,
    dinner: Moon,
    snacks: Cookie,
  };

  const handleDelete = (id: string) => {
    removeFoodEntry(id);
  };

  return (
    <AppShell
      title="Daily Nutrition Tracker"
      subtitle="Complete macronutrient balance, meal logging, and remaining targets"
      headerAction={
        <Link
          href="/food-scanner"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-lime-400 hover:bg-lime-300 text-xs font-bold text-slate-950 shadow-md"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>Add Food</span>
        </Link>
      }
    >
      <div className="space-y-6">
        {/* NUTRITION BANNER WITH CALORIE RING */}
        <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <ProgressRing
              progress={(nutrition.totalCalories / targetCal) * 100}
              size={160}
              strokeWidth={14}
              color="#3b82f6"
              value={nutrition.totalCalories}
              label="KCAL CONSUMED"
              subValue={`${remainingCal} kcal remaining`}
            />

            <div className="space-y-2 text-center sm:text-left">
              <span className="text-[11px] font-bold uppercase tracking-wider text-blue-400 px-2.5 py-1 rounded-full bg-blue-500/10 border border-blue-500/20">
                DAILY METABOLIC STATUS
              </span>
              <h2 className="text-2xl font-black text-white">Daily Macro Equilibrium</h2>
              <p className="text-xs text-slate-400 max-w-sm">
                Target: {targetCal} kcal • Consumed: {nutrition.totalCalories} kcal • Remaining: {remainingCal} kcal
              </p>
            </div>
          </div>

          {/* Macronutrient Bars */}
          <div className="w-full md:w-72 bg-slate-950/80 p-4 rounded-2xl border border-slate-800/80 space-y-1">
            <NutrientBar
              label="Protein"
              current={nutrition.totalProteinG}
              target={targetProtein}
              unit="g"
              color="bg-blue-500"
            />
            <NutrientBar
              label="Carbohydrates"
              current={nutrition.totalCarbsG}
              target={targetCarbs}
              unit="g"
              color="bg-amber-400"
            />
            <NutrientBar
              label="Fats"
              current={nutrition.totalFatG}
              target={targetFat}
              unit="g"
              color="bg-rose-400"
            />
            <NutrientBar
              label="Fiber"
              current={nutrition.totalFiberG}
              target={targetFiber}
              unit="g"
              color="bg-emerald-400"
            />
          </div>
        </div>

        {/* 4 MEAL CATEGORIES ACCORDION / CARDS */}
        <div className="space-y-4">
          {(['breakfast', 'lunch', 'dinner', 'snacks'] as MealCategory[]).map((category) => {
            const Icon = mealIcons[category];
            const entries = nutrition.meals[category] || [];
            const mealCalories = entries.reduce((sum, item) => sum + item.calories, 0);

            return (
              <div
                key={category}
                className="p-5 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-3"
              >
                {/* Meal Category Header */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center text-lime-400">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-extrabold text-white capitalize">
                        {category}
                      </h3>
                      <p className="text-[11px] text-slate-400">
                        {entries.length} items logged
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-sm font-black text-amber-400">
                      {mealCalories} kcal
                    </span>
                    <Link
                      href={`/food-scanner?category=${category}`}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                      title="Add item to this meal"
                    >
                      <Plus className="h-4 w-4" />
                    </Link>
                  </div>
                </div>

                {/* Items under this meal */}
                {entries.length === 0 ? (
                  <p className="text-xs text-slate-500 py-2 italic text-center">
                    No items logged yet for {category}. Tap + to add.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {entries.map((item) => (
                      <div
                        key={item.id}
                        className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800/80 flex items-center justify-between hover:border-slate-700 transition-colors"
                      >
                        <div>
                          <h4 className="text-xs font-bold text-white">{item.foodName}</h4>
                          <p className="text-[11px] text-slate-400">
                            {item.quantity} {item.unit} • {item.servingSizeG}g • P: {item.proteinG}g | C: {item.carbsG}g | F: {item.fatG}g
                          </p>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className="text-xs font-black text-amber-400">
                            {item.calories} kcal
                          </span>
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="p-1.5 text-slate-500 hover:text-rose-400 transition-colors"
                            title="Remove food entry"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </AppShell>
  );
}
