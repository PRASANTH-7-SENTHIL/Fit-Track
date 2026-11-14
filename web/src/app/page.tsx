'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Sparkles, ArrowRight, ShieldCheck, Flame, Zap, Dumbbell } from 'lucide-react';
import Link from 'next/link';

export default function SplashPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-lime-400 selection:text-slate-900">
      {/* Top Banner / Navbar */}
      <header className="px-6 py-6 flex items-center justify-between max-w-6xl w-full mx-auto">
        <div className="flex items-center gap-3">
          <div className="h-11 w-11 rounded-2xl bg-gradient-to-tr from-blue-600 to-lime-400 flex items-center justify-center shadow-lg shadow-blue-500/25">
            <Sparkles className="h-6 w-6 text-white" />
          </div>
          <div>
            <span className="font-black text-xl tracking-wider text-white">FITTRACK <span className="text-lime-400">AI</span></span>
            <p className="text-[10px] text-slate-400 tracking-widest font-semibold uppercase">Ultimate Fitness Platform</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white transition-colors"
          >
            Sign In
          </Link>
          <Link
            href="/register"
            className="px-5 py-2.5 rounded-xl text-xs font-bold bg-lime-400 text-slate-950 hover:bg-lime-300 transition-all shadow-md shadow-lime-400/20 active:scale-95"
          >
            Get Started
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center text-center px-4 max-w-4xl mx-auto py-12">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-800/90 border border-slate-700/80 text-lime-400 text-xs font-semibold mb-6 shadow-inner">
          <Zap className="h-3.5 w-3.5" />
          <span>Next-Generation AI Fitness & Nutrition Ecosystem</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white max-w-3xl leading-[1.15]">
          Track Your Fitness.{' '}
          <span className="bg-gradient-to-r from-blue-400 via-lime-300 to-emerald-400 bg-clip-text text-transparent">
            Transform Your Body.
          </span>{' '}
          Achieve Your Goals.
        </h1>

        <p className="mt-6 text-base sm:text-lg text-slate-400 max-w-2xl leading-relaxed">
          The all-in-one AI fitness companion. Instant food recognition, smart calorie tracking,
          personalized workout regimens, live GPS pacing, and interactive AI body transformation visualizations.
        </p>

        {/* Feature Highlights Pills */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-10 w-full max-w-3xl">
          <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800/90 flex flex-col items-center">
            <Flame className="h-6 w-6 text-amber-400 mb-2" />
            <span className="text-sm font-bold text-white">Smart Burn</span>
            <span className="text-[11px] text-slate-400">TDEE & Calorie Engine</span>
          </div>
          <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800/90 flex flex-col items-center">
            <Sparkles className="h-6 w-6 text-lime-400 mb-2" />
            <span className="text-sm font-bold text-white">AI Food Scan</span>
            <span className="text-[11px] text-slate-400">Nutrient Breakdown</span>
          </div>
          <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800/90 flex flex-col items-center">
            <Dumbbell className="h-6 w-6 text-blue-400 mb-2" />
            <span className="text-sm font-bold text-white">3-Tier Workouts</span>
            <span className="text-[11px] text-slate-400">Interactive Guided Reps</span>
          </div>
          <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800/90 flex flex-col items-center">
            <ShieldCheck className="h-6 w-6 text-indigo-400 mb-2" />
            <span className="text-sm font-bold text-white">Body Avatar</span>
            <span className="text-[11px] text-slate-400">Transformation Progress</span>
          </div>
        </div>

        {/* Call to action buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full justify-center max-w-md">
          <Link
            href="/dashboard"
            className="w-full sm:w-auto flex-1 flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-blue-600 hover:bg-blue-500 font-bold text-white shadow-xl shadow-blue-600/30 active:scale-95 transition-all text-sm"
          >
            <span>Launch Dashboard</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/register"
            className="w-full sm:w-auto flex-1 flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-slate-800 hover:bg-slate-700/80 font-bold text-slate-200 border border-slate-700/80 active:scale-95 transition-all text-sm"
          >
            <span>Create Account</span>
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 border-t border-slate-900 text-center text-xs text-slate-500">
        <p>© 2026 FitTrack AI. All rights reserved. Powered by Advanced Agentic Fitness Science.</p>
      </footer>
    </div>
  );
}
