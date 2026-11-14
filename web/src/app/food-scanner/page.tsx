'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import AppShell from '@/components/layout/AppShell';
import { searchFoods, FOOD_DATABASE, FoodItem } from '@/lib/food-database';
import {
  Camera,
  Upload,
  Search,
  Plus,
  Sparkles,
  ArrowRight,
  Apple,
  CheckCircle2,
  ScanLine,
} from 'lucide-react';

export default function FoodScannerPage() {
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<'ai_scan' | 'search' | 'manual'>('ai_scan');

  // AI Scan states
  const [analyzing, setAnalyzing] = useState(false);
  const [selectedPhotoName, setSelectedPhotoName] = useState<string | null>(null);

  // Search states
  const [searchQuery, setSearchQuery] = useState('');
  const searchResults = searchQuery ? searchFoods(searchQuery) : FOOD_DATABASE.slice(0, 8);

  // Manual states
  const [manualName, setManualName] = useState('');
  const [manualQuantity, setManualQuantity] = useState(1);
  const [manualUnit, setManualUnit] = useState('piece');
  const [manualCalories, setManualCalories] = useState(150);
  const [manualProtein, setManualProtein] = useState(5);
  const [manualCarbs, setManualCarbs] = useState(25);
  const [manualFat, setManualFat] = useState(3);
  const [manualFiber, setManualFiber] = useState(2);

  // Simulate AI photo analysis
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedPhotoName(file.name);
      setAnalyzing(true);

      // Simulate vision AI recognizing a popular dish e.g. Dosa or Chicken Breast
      setTimeout(() => {
        setAnalyzing(false);
        const recognizedItem = FOOD_DATABASE.find((f) => f.name.toLowerCase() === 'dosa') || FOOD_DATABASE[0];

        // Navigate to confirmation screen
        const params = new URLSearchParams({
          foodName: recognizedItem.name,
          quantity: '2',
          unit: recognizedItem.unit,
          servingSizeG: recognizedItem.servingSizeG.toString(),
          calories: (recognizedItem.calories * 2).toString(),
          proteinG: (recognizedItem.proteinG * 2).toString(),
          carbsG: (recognizedItem.carbsG * 2).toString(),
          fatG: (recognizedItem.fatG * 2).toString(),
          fiberG: (recognizedItem.fiberG * 2).toString(),
          source: 'ai_scan',
        });

        router.push(`/food-confirm?${params.toString()}`);
      }, 1500);
    }
  };

  const handleSelectFood = (food: FoodItem) => {
    const params = new URLSearchParams({
      foodName: food.name,
      quantity: '1',
      unit: food.unit,
      servingSizeG: food.servingSizeG.toString(),
      calories: food.calories.toString(),
      proteinG: food.proteinG.toString(),
      carbsG: food.carbsG.toString(),
      fatG: food.fatG.toString(),
      fiberG: food.fiberG.toString(),
      source: 'search',
    });

    router.push(`/food-confirm?${params.toString()}`);
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams({
      foodName: manualName || 'Custom Food',
      quantity: manualQuantity.toString(),
      unit: manualUnit,
      servingSizeG: '100',
      calories: manualCalories.toString(),
      proteinG: manualProtein.toString(),
      carbsG: manualCarbs.toString(),
      fatG: manualFat.toString(),
      fiberG: manualFiber.toString(),
      source: 'manual',
    });

    router.push(`/food-confirm?${params.toString()}`);
  };

  return (
    <AppShell
      title="AI Food Scanner & Calories"
      subtitle="Instantly identify meals, calculate calories, and log nutrients"
    >
      <div className="max-w-2xl mx-auto space-y-6">
        {/* TAB SELECTOR */}
        <div className="grid grid-cols-3 gap-2 bg-slate-900 p-1.5 rounded-2xl border border-slate-800">
          <button
            onClick={() => setActiveTab('ai_scan')}
            className={`flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'ai_scan'
                ? 'bg-lime-400 text-slate-950 shadow-lg shadow-lime-400/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Sparkles className="h-4 w-4" />
            <span>AI Food Scan</span>
          </button>

          <button
            onClick={() => setActiveTab('search')}
            className={`flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'search'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Search className="h-4 w-4" />
            <span>Search Foods</span>
          </button>

          <button
            onClick={() => setActiveTab('manual')}
            className={`flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'manual'
                ? 'bg-slate-800 text-white border border-slate-700'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Plus className="h-4 w-4" />
            <span>Manual Entry</span>
          </button>
        </div>

        {/* TAB 1: AI CAMERA / PHOTO UPLOAD */}
        {activeTab === 'ai_scan' && (
          <div className="p-8 rounded-3xl bg-slate-900 border border-slate-800 text-center shadow-xl space-y-6 animate-fade-in">
            <div className="relative border-2 border-dashed border-slate-700 hover:border-lime-400 rounded-3xl p-10 flex flex-col items-center justify-center cursor-pointer transition-colors group bg-slate-950/60">
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />

              {analyzing ? (
                <div className="flex flex-col items-center gap-4">
                  <div className="h-16 w-16 rounded-full border-4 border-lime-400 border-t-transparent animate-spin" />
                  <div>
                    <h4 className="text-base font-bold text-white">AI Vision Analysis in Progress...</h4>
                    <p className="text-xs text-slate-400 mt-1">
                      Identifying dish components, Indian food taxonomy, and portion sizes...
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <div className="h-16 w-16 rounded-3xl bg-slate-900 border border-slate-800 flex items-center justify-center text-lime-400 group-hover:scale-110 transition-transform mb-4 shadow-lg shadow-lime-400/10">
                    <Camera className="h-8 w-8" />
                  </div>
                  <h4 className="text-base font-bold text-white">Snap or Upload Food Photograph</h4>
                  <p className="text-xs text-slate-400 mt-1 max-w-sm">
                    FitTrack AI uses visual neural recognition to identify Idli, Dosa, Chapati, Curries, Rice, Chicken, Eggs and calculate total nutrients.
                  </p>
                  <span className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-lime-400 text-slate-950 text-xs font-extrabold shadow-md">
                    <Upload className="h-3.5 w-3.5" />
                    <span>Select Image</span>
                  </span>
                </div>
              )}
            </div>

            {/* Quick Demo Previews */}
            <div className="text-left">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                Or Quick Test Common Indian Dishes:
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {['Dosa', 'Idli', 'Chapati', 'Chicken Curry'].map((name) => {
                  const food = FOOD_DATABASE.find((f) => f.name === name);
                  return (
                    <button
                      key={name}
                      onClick={() => food && handleSelectFood(food)}
                      className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-lime-400 text-xs text-left transition-colors"
                    >
                      <span className="font-bold text-white block">{name}</span>
                      <span className="text-[10px] text-lime-400">
                        {food?.calories} kcal • {food?.proteinG}g protein
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: SEARCH FOOD DATABASE */}
        {activeTab === 'search' && (
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4 animate-fade-in">
            <div className="relative">
              <Search className="absolute left-4 top-3.5 h-4 w-4 text-slate-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search Indian foods (e.g. Dosa, Rice, Sambar, Paneer, Chicken, Eggs)..."
                className="w-full pl-11 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-2xl text-xs text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
              {searchResults.map((food, i) => (
                <div
                  key={i}
                  onClick={() => handleSelectFood(food)}
                  className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800/80 hover:border-slate-700 cursor-pointer flex items-center justify-between transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-lime-400 font-bold">
                      <Apple className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white group-hover:text-lime-400 transition-colors">
                        {food.name}
                      </h4>
                      <p className="text-[11px] text-slate-400">
                        1 {food.unit} ({food.servingSizeG}g) • {food.category}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <span className="text-xs font-black text-amber-400 block">
                        {food.calories} kcal
                      </span>
                      <span className="text-[10px] text-slate-400">
                        P: {food.proteinG}g | C: {food.carbsG}g | F: {food.fatG}g
                      </span>
                    </div>
                    <ArrowRight className="h-4 w-4 text-slate-500 group-hover:text-white transition-colors" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: MANUAL FOOD ENTRY */}
        {activeTab === 'manual' && (
          <form onSubmit={handleManualSubmit} className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4 animate-fade-in">
            <div>
              <h3 className="text-sm font-bold text-white mb-1">Manual Nutritional Entry</h3>
              <p className="text-xs text-slate-400 mb-4">Input custom home-cooked or packaged food macronutrients</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2 sm:col-span-1">
                <label className="block text-xs font-semibold text-slate-300 mb-1">Food Name</label>
                <input
                  type="text"
                  required
                  value={manualName}
                  onChange={(e) => setManualName(e.target.value)}
                  placeholder="e.g. Protein Smoothie"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                />
              </div>

              <div className="col-span-2 sm:col-span-1">
                <label className="block text-xs font-semibold text-slate-300 mb-1">Serving Quantity</label>
                <input
                  type="number"
                  step="0.5"
                  value={manualQuantity}
                  onChange={(e) => setManualQuantity(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Calories (kcal)</label>
                <input
                  type="number"
                  required
                  value={manualCalories}
                  onChange={(e) => setManualCalories(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Protein (g)</label>
                <input
                  type="number"
                  value={manualProtein}
                  onChange={(e) => setManualProtein(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Carbs (g)</label>
                <input
                  type="number"
                  value={manualCarbs}
                  onChange={(e) => setManualCarbs(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Fat (g)</label>
                <input
                  type="number"
                  value={manualFat}
                  onChange={(e) => setManualFat(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 font-bold text-xs text-white shadow-lg transition-all mt-4"
            >
              Continue to Confirmation
            </button>
          </form>
        )}
      </div>
    </AppShell>
  );
}
