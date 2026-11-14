'use client';

import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import AppShell from '@/components/layout/AppShell';
import { useAppStore, initializeTodayNutrition, getTodayString } from '@/store';
import { MealCategory, FoodEntry } from '@/types';
import {
  Sparkles,
  Check,
  X,
  Flame,
  Apple,
  AlertCircle,
  Clock,
  ArrowLeft,
} from 'lucide-react';

function FoodConfirmContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const {
    user,
    profile,
    todayNutrition,
    setTodayNutrition,
    addFoodEntry,
  } = useAppStore();

  const foodName = searchParams.get('foodName') || 'Dosa';
  const baseCalories = Number(searchParams.get('calories') || '260');
  const baseProtein = Number(searchParams.get('proteinG') || '6');
  const baseCarbs = Number(searchParams.get('carbsG') || '44');
  const baseFat = Number(searchParams.get('fatG') || '6');
  const baseFiber = Number(searchParams.get('fiberG') || '2.5');
  const initialQuantity = Number(searchParams.get('quantity') || '2');
  const unit = searchParams.get('unit') || 'pieces';
  const servingSizeG = Number(searchParams.get('servingSizeG') || '200');
  const source = (searchParams.get('source') as any) || 'ai_scan';

  // Editable states
  const [quantity, setQuantity] = useState(initialQuantity);
  const [mealCategory, setMealCategory] = useState<MealCategory>('breakfast');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);

  // Scaled values
  const ratio = initialQuantity > 0 ? quantity / initialQuantity : 1;
  const scaledCalories = Math.round(baseCalories * ratio);
  const scaledProtein = Math.round(baseProtein * ratio * 10) / 10;
  const scaledCarbs = Math.round(baseCarbs * ratio * 10) / 10;
  const scaledFat = Math.round(baseFat * ratio * 10) / 10;
  const scaledFiber = Math.round(baseFiber * ratio * 10) / 10;
  const scaledWeight = Math.round(servingSizeG * ratio);

  const handleUpdate = () => {
    if (hasSubmitted || isSubmitting) return;
    setIsSubmitting(true);

    const uid = user?.uid || profile?.uid || 'athlete_01';
    const entryId = 'food_' + Date.now();

    const newEntry: FoodEntry = {
      id: entryId,
      uid,
      date: getTodayString(),
      mealCategory,
      foodName,
      quantity,
      unit,
      servingSizeG: scaledWeight,
      calories: scaledCalories,
      proteinG: scaledProtein,
      carbsG: scaledCarbs,
      fatG: scaledFat,
      fiberG: scaledFiber,
      source,
      confirmed: true,
      createdAt: new Date().toISOString(),
    };

    // Ensure nutrition container initialized
    let currentNutrition = todayNutrition;
    if (!currentNutrition || currentNutrition.date !== getTodayString()) {
      currentNutrition = initializeTodayNutrition(uid);
    }

    const updatedMeals = {
      ...currentNutrition.meals,
      [mealCategory]: [...currentNutrition.meals[mealCategory], newEntry],
    };

    setTodayNutrition({
      ...currentNutrition,
      totalCalories: currentNutrition.totalCalories + scaledCalories,
      totalProteinG: currentNutrition.totalProteinG + scaledProtein,
      totalCarbsG: currentNutrition.totalCarbsG + scaledCarbs,
      totalFatG: currentNutrition.totalFatG + scaledFat,
      totalFiberG: currentNutrition.totalFiberG + scaledFiber,
      meals: updatedMeals,
    });

    setHasSubmitted(true);

    // Toast/Alert & redirect to Nutrition Diary
    setTimeout(() => {
      router.push('/nutrition');
    }, 400);
  };

  const handleCancel = () => {
    // Discard everything without modifying any store state
    router.back();
  };

  return (
    <AppShell
      title="Food Confirmation"
      subtitle="Verify portion quantities and nutrition values before saving"
    >
      <div className="max-w-xl mx-auto space-y-6 animate-fade-in">
        <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 sm:p-8 shadow-2xl">
          {/* Top Status */}
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-lime-400/10 text-lime-400 border border-lime-400/20">
                <Sparkles className="h-4 w-4" />
              </span>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400">Analysis Completed</span>
                <h3 className="text-sm font-extrabold text-white">Review & Confirm Entry</h3>
              </div>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 capitalize">
              {source.replace('_', ' ')}
            </span>
          </div>

          {/* Dish Headline */}
          <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-950 border border-slate-800 mb-6">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-lime-400 flex items-center justify-center text-slate-950 font-black">
                <Apple className="h-6 w-6 text-slate-950" />
              </div>
              <div>
                <h2 className="text-lg font-black text-white">{foodName}</h2>
                <p className="text-xs text-slate-400">
                  Approx. {scaledWeight}g total portion
                </p>
              </div>
            </div>

            <div className="text-right">
              <span className="text-2xl font-black text-lime-400 block">{scaledCalories}</span>
              <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Total kcal</span>
            </div>
          </div>

          {/* Quantity Scaling Control */}
          <div className="space-y-4 mb-6">
            <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-bold text-slate-300">Quantity / Servings</span>
                <span className="text-sm font-black text-blue-400">
                  {quantity} {unit}
                </span>
              </div>
              <input
                type="range"
                min="0.5"
                max="10"
                step="0.5"
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                className="w-full accent-blue-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                <span>0.5 portion</span>
                <span>5 portions</span>
                <span>10 portions</span>
              </div>
            </div>

            {/* Meal Category Picker */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-2">
                Assign to Meal Category:
              </label>
              <div className="grid grid-cols-4 gap-2">
                {(['breakfast', 'lunch', 'dinner', 'snacks'] as const).map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setMealCategory(cat)}
                    className={`py-2 px-3 rounded-xl text-xs font-bold capitalize transition-all ${
                      mealCategory === cat
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* RECALCULATED MACRONUTRIENT GRID */}
          <div className="grid grid-cols-4 gap-2.5 mb-8">
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-center">
              <span className="text-[10px] font-semibold text-blue-400 block mb-0.5">PROTEIN</span>
              <span className="text-base font-black text-white">{scaledProtein}g</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-center">
              <span className="text-[10px] font-semibold text-amber-400 block mb-0.5">CARBS</span>
              <span className="text-base font-black text-white">{scaledCarbs}g</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-center">
              <span className="text-[10px] font-semibold text-rose-400 block mb-0.5">FAT</span>
              <span className="text-base font-black text-white">{scaledFat}g</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-center">
              <span className="text-[10px] font-semibold text-emerald-400 block mb-0.5">FIBER</span>
              <span className="text-base font-black text-white">{scaledFiber}g</span>
            </div>
          </div>

          {/* TWO PRIMARY MANDATORY BUTTONS: UPDATE & CANCEL */}
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={handleCancel}
              className="flex items-center justify-center gap-2 py-3.5 px-4 rounded-2xl bg-slate-800 hover:bg-slate-700 font-bold text-xs text-slate-300 border border-slate-700 active:scale-95 transition-all"
            >
              <X className="h-4 w-4" />
              <span>CANCEL</span>
            </button>

            <button
              type="button"
              disabled={isSubmitting || hasSubmitted}
              onClick={handleUpdate}
              className="flex items-center justify-center gap-2 py-3.5 px-4 rounded-2xl bg-blue-600 hover:bg-blue-500 font-extrabold text-xs text-white shadow-lg shadow-blue-600/30 active:scale-95 transition-all disabled:opacity-50"
            >
              {isSubmitting ? (
                <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Check className="h-4 w-4" />
                  <span>UPDATE</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

export default function FoodConfirmPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-400">Loading food details...</div>}>
      <FoodConfirmContent />
    </Suspense>
  );
}
