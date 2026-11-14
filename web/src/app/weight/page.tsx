'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import AppShell from '@/components/layout/AppShell';
import { useAppStore, getTodayString } from '@/store';
import {
  Scale,
  Plus,
  TrendingDown,
  TrendingUp,
  UserCheck,
  Calendar,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { WeightEntry } from '@/types';

export default function WeightTrackerPage() {
  const { profile, setProfile, weightHistory, addWeightEntry } = useAppStore();

  const currentWeight = profile?.weightKg || 0;
  const heightCm = profile?.heightCm || 0;
  const goalWeight = profile?.targetWeightKg || (currentWeight ? currentWeight : 0);

  const bmi = (currentWeight > 0 && heightCm > 0) ? (currentWeight / Math.pow(heightCm / 100, 2)).toFixed(1) : '--';

  const [modalOpen, setModalOpen] = useState(false);
  const [newWeight, setNewWeight] = useState(currentWeight || 70);
  const [weightNotes, setWeightNotes] = useState('');

  const entriesToDisplay = weightHistory;

  const chartData = entriesToDisplay.map((e) => ({
    date: e.date.substring(5), // MM-DD
    weight: e.weightKg,
  }));

  const handleSaveWeight = (e: React.FormEvent) => {
    e.preventDefault();
    const computedBmi = heightCm > 0 ? Number((Number(newWeight) / Math.pow(heightCm / 100, 2)).toFixed(1)) : 0;
    const entry: WeightEntry = {
      id: 'weight_' + Date.now(),
      uid: profile?.uid || 'athlete_01',
      date: getTodayString(),
      weightKg: Number(newWeight),
      bmi: computedBmi,
      notes: weightNotes,
      createdAt: new Date().toISOString(),
    };

    addWeightEntry(entry);

    if (profile) {
      setProfile({
        ...profile,
        weightKg: Number(newWeight),
        updatedAt: new Date().toISOString(),
      });
    }

    setModalOpen(false);
  };

  const initialWeight = entriesToDisplay[0]?.weightKg || currentWeight;
  const netChange = entriesToDisplay.length > 1 ? Math.round((currentWeight - initialWeight) * 10) / 10 : 0;

  return (
    <AppShell
      title="Weight Tracker"
      subtitle="Monitor body mass trajectory, BMI fluctuations, and transformation milestones"
      headerAction={
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-lime-400 hover:bg-lime-300 text-xs font-bold text-slate-950 shadow-md"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>Log Weight</span>
        </button>
      }
    >
      <div className="space-y-6">
        {/* STATS OVERVIEW CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
              Current Weight
            </span>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-black text-white">{currentWeight}</span>
              <span className="text-xs font-bold text-slate-400">kg</span>
            </div>
            <span className="text-[11px] text-lime-400 font-semibold block mt-1">Logged today</span>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
              Goal Weight
            </span>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-black text-blue-400">{goalWeight}</span>
              <span className="text-xs font-bold text-slate-400">kg</span>
            </div>
            <span className="text-[11px] text-slate-400 block mt-1">
              {Math.abs(currentWeight - goalWeight).toFixed(1)} kg to objective
            </span>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
              Body Mass Index
            </span>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-black text-amber-400">{bmi}</span>
              <span className="text-xs font-bold text-slate-400">BMI</span>
            </div>
            <span className="text-[11px] text-emerald-400 font-semibold block mt-1">Normal Weight</span>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
              Net Progress
            </span>
            <div className="flex items-baseline gap-1">
              <span className={`text-3xl font-black ${netChange <= 0 ? 'text-lime-400' : 'text-amber-400'}`}>
                {netChange > 0 ? `+${netChange}` : netChange}
              </span>
              <span className="text-xs font-bold text-slate-400">kg</span>
            </div>
            <span className="text-[11px] text-slate-400 block mt-1">Since onboarding</span>
          </div>
        </div>

        {/* WEIGHT PROGRESS GRAPH (RECHARTS) */}
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-extrabold text-white">Weight Progression Trajectory</h3>
              <p className="text-[11px] text-slate-400">Historical trend across logged measurement entries</p>
            </div>
            <Link
              href="/body-transform"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600/20 text-blue-400 hover:bg-blue-600/30 text-xs font-bold border border-blue-500/30"
            >
              <UserCheck className="h-3.5 w-3.5" />
              <span>Simulate 3D Avatar</span>
            </Link>
          </div>

          {chartData.length > 0 ? (
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="date" stroke="#64748b" fontSize={11} tickLine={false} />
                  <YAxis
                    domain={['dataMin - 2', 'dataMax + 2']}
                    stroke="#64748b"
                    fontSize={11}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      border: '1px solid #334155',
                      borderRadius: '12px',
                      fontSize: '11px',
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="weight"
                    stroke="#84cc16"
                    strokeWidth={3}
                    dot={{ fill: '#84cc16', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-44 flex flex-col items-center justify-center text-center p-6 border border-dashed border-slate-800 rounded-2xl bg-slate-950/40">
              <Scale className="h-8 w-8 text-slate-600 mb-2" />
              <p className="text-xs font-semibold text-slate-300">No weight history logged yet</p>
              <p className="text-[11px] text-slate-500 mt-1">Log your first weight entry above to visualize your progress trajectory.</p>
            </div>
          )}
        </div>

        {/* LOGGED WEIGHT HISTORY TABLE */}
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
          <h3 className="text-sm font-extrabold text-white">Recorded Measurements Log</h3>

          {entriesToDisplay.length > 0 ? (
            <div className="space-y-2">
              {entriesToDisplay.map((entry, idx) => (
                <div
                  key={entry.id || idx}
                  className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800/80 flex items-center justify-between hover:border-slate-700 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-blue-400">
                      <Scale className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white">{entry.date}</h4>
                      <p className="text-[11px] text-slate-400">BMI: {entry.bmi} • Regular Weigh-in</p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-sm font-black text-white block">{entry.weightKg} kg</span>
                    <span className="text-[10px] text-slate-500">Recorded</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center border border-dashed border-slate-800 rounded-2xl bg-slate-950/40">
              <Scale className="h-8 w-8 text-slate-600 mx-auto mb-2" />
              <p className="text-xs font-semibold text-slate-300">No measurement records found</p>
              <p className="text-[11px] text-slate-500 mt-1">Tap "+ Log Weight" to record your current body mass.</p>
            </div>
          )}
        </div>
      </div>

      {/* Log Weight Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleSaveWeight}
            className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4"
          >
            <h3 className="text-base font-bold text-white">Log Current Weight</h3>
            <p className="text-xs text-slate-400">
              Update today's weigh-in to sync BMI and body transformation avatars.
            </p>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-semibold text-slate-300">Weight (kg)</label>
                <span className="text-[10px] text-slate-400">≈ {(newWeight * 2.20462).toFixed(1)} lbs</span>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setNewWeight((w) => parseFloat(Math.max(30, w - 0.5).toFixed(1)))}
                  className="px-2.5 py-3 bg-slate-950 border border-slate-800 rounded-xl text-xs font-bold text-slate-300 hover:text-white"
                >
                  -0.5
                </button>
                <button
                  type="button"
                  onClick={() => setNewWeight((w) => parseFloat(Math.max(30, w - 0.1).toFixed(1)))}
                  className="px-2 py-3 bg-slate-950 border border-slate-800 rounded-xl text-xs font-bold text-slate-300 hover:text-white"
                >
                  -0.1
                </button>
                <input
                  type="number"
                  step="0.1"
                  required
                  value={newWeight}
                  onChange={(e) => setNewWeight(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-3 bg-slate-950 border border-slate-800 rounded-xl text-base font-bold text-blue-400 text-center"
                />
                <button
                  type="button"
                  onClick={() => setNewWeight((w) => parseFloat(Math.min(250, w + 0.1).toFixed(1)))}
                  className="px-2 py-3 bg-slate-950 border border-slate-800 rounded-xl text-xs font-bold text-slate-300 hover:text-white"
                >
                  +0.1
                </button>
                <button
                  type="button"
                  onClick={() => setNewWeight((w) => parseFloat(Math.min(250, w + 0.5).toFixed(1)))}
                  className="px-2.5 py-3 bg-slate-950 border border-slate-800 rounded-xl text-xs font-bold text-slate-300 hover:text-white"
                >
                  +0.5
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Notes (Optional)</label>
              <input
                type="text"
                value={weightNotes}
                onChange={(e) => setWeightNotes(e.target.value)}
                placeholder="e.g. Morning weigh-in before breakfast"
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="flex-1 py-2.5 rounded-xl bg-slate-800 text-xs font-semibold text-slate-300 hover:bg-slate-700"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 rounded-xl bg-lime-400 text-xs font-bold text-slate-950 hover:bg-lime-300 shadow-md"
              >
                Save Weigh-in
              </button>
            </div>
          </form>
        </div>
      )}
    </AppShell>
  );
}
