'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import AppShell from '@/components/layout/AppShell';
import { useAppStore } from '@/store';
import { logOut } from '@/lib/firebase';
import {
  User,
  Save,
  CheckCircle2,
  Sparkles,
  Camera,
  Activity,
  Flame,
  Scale,
  ShieldCheck,
  LogOut,
} from 'lucide-react';
import { Gender, FitnessGoal, ActivityLevel } from '@/types';
import { calculateAllFitnessMetrics } from '@/lib/calculations';

export default function UserProfilePage() {
  const router = useRouter();
  const { user, profile, setProfile, setCalculations, setUser } = useAppStore();

  const [fullName, setFullName] = useState(profile?.fullName || user?.displayName || 'Alex Mercer');
  const [age, setAge] = useState(profile?.age || 26);
  const [gender, setGender] = useState<Gender>(profile?.gender || 'male');
  const [heightCm, setHeightCm] = useState(profile?.heightCm || 178);
  const [weightKg, setWeightKg] = useState(profile?.weightKg || 74);
  const [heightUnit, setHeightUnit] = useState<'cm' | 'inch'>('cm');

  const totalInches = Math.round(heightCm / 2.54);
  const feet = Math.floor(totalInches / 12);
  const inches = totalInches % 12;
  const [fitnessGoal, setFitnessGoal] = useState<FitnessGoal>(profile?.fitnessGoal || 'muscle_building');
  const [activityLevel, setActivityLevel] = useState<ActivityLevel>(profile?.activityLevel || 'moderately_active');

  const [chestCm, setChestCm] = useState<number | undefined>(profile?.chestCm || 102);
  const [waistCm, setWaistCm] = useState<number | undefined>(profile?.waistCm || 80);
  const [hipCm, setHipCm] = useState<number | undefined>(profile?.hipCm || 96);
  const [neckCm, setNeckCm] = useState<number | undefined>(profile?.neckCm || 38);
  const [bodyFat, setBodyFat] = useState<number | undefined>(profile?.bodyFatPercentage || 14.5);

  const [savedToast, setSavedToast] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    const updated = {
      uid: user?.uid || profile?.uid || 'athlete_01',
      fullName,
      age: Number(age),
      gender,
      heightCm: Number(heightCm),
      weightKg: Number(weightKg),
      fitnessGoal,
      activityLevel,
      chestCm: chestCm ? Number(chestCm) : undefined,
      waistCm: waistCm ? Number(waistCm) : undefined,
      hipCm: hipCm ? Number(hipCm) : undefined,
      neckCm: neckCm ? Number(neckCm) : undefined,
      bodyFatPercentage: bodyFat ? Number(bodyFat) : undefined,
      updatedAt: new Date().toISOString(),
    };

    setProfile(updated);

    // Recalculate metrics
    const metrics = calculateAllFitnessMetrics(
      Number(weightKg),
      Number(heightCm),
      Number(age),
      gender,
      activityLevel,
      fitnessGoal
    );
    setCalculations(metrics);

    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 3000);
  };

  const bmi = (weightKg / Math.pow(heightCm / 100, 2)).toFixed(1);

  return (
    <AppShell
      title="User Profile & Biometrics"
      subtitle="Manage your physiological baseline and anthropic parameters"
      headerAction={
        <button
          onClick={handleSave}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-lime-400 hover:bg-lime-300 text-xs font-bold text-slate-950 shadow-md transition-all active:scale-95"
        >
          <Save className="h-3.5 w-3.5" />
          <span>Save Changes</span>
        </button>
      }
    >
      <div className="max-w-3xl mx-auto space-y-6">
        {savedToast && (
          <div className="p-4 rounded-2xl bg-lime-400/10 border border-lime-400/30 text-lime-400 text-xs font-bold flex items-center gap-2 animate-fade-in">
            <CheckCircle2 className="h-4 w-4" />
            <span>Profile and metabolic calculations successfully updated!</span>
          </div>
        )}

        {/* HEADER PROFILE AVATAR CARD */}
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl flex flex-col sm:flex-row items-center gap-6">
          <div className="relative">
            <div className="h-24 w-24 rounded-full bg-gradient-to-tr from-blue-600 via-indigo-600 to-lime-400 flex items-center justify-center text-3xl font-black text-white shadow-xl shadow-blue-500/20">
              {fullName.charAt(0).toUpperCase()}
            </div>
            <button className="absolute bottom-0 right-0 p-2 rounded-full bg-slate-800 border border-slate-700 text-slate-200 hover:text-white shadow-md">
              <Camera className="h-4 w-4" />
            </button>
          </div>

          <div className="text-center sm:text-left space-y-1">
            <h2 className="text-2xl font-black text-white">{fullName}</h2>
            <p className="text-xs text-slate-400">{user?.email || 'athlete@fittrack.ai'}</p>
            <div className="flex flex-wrap gap-2 pt-2 justify-center sm:justify-start">
              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 uppercase">
                Goal: {fitnessGoal.replace('_', ' ')}
              </span>
              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-lime-400/10 text-lime-400 border border-lime-400/20 uppercase">
                BMI: {bmi}
              </span>
            </div>
          </div>
        </div>

        {/* MAIN PROFILE FORM */}
        <form onSubmit={handleSave} className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-6">
          <h3 className="text-sm font-extrabold text-white pb-3 border-b border-slate-800">
            Personal Parameters
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Full Name</label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Age</label>
              <input
                type="number"
                required
                value={age}
                onChange={(e) => setAge(Number(e.target.value))}
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Gender</label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value as Gender)}
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="prefer_not_to_say">Other / Unspecified</option>
              </select>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-semibold text-slate-300">
                  Height {heightUnit === 'cm' ? '(cm)' : '(ft / in)'}
                </label>
                <button
                  type="button"
                  onClick={() => setHeightUnit(heightUnit === 'cm' ? 'inch' : 'cm')}
                  className="text-[10px] font-bold text-lime-400 bg-lime-400/10 hover:bg-lime-400/20 px-2 py-0.5 rounded-md border border-lime-400/30 transition-all"
                >
                  Switch to {heightUnit === 'cm' ? 'INCH' : 'CM'}
                </button>
              </div>
              {heightUnit === 'cm' ? (
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={100}
                    max={250}
                    required
                    value={heightCm}
                    onChange={(e) => setHeightCm(Number(e.target.value))}
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                  />
                  <span className="text-[11px] text-slate-400 whitespace-nowrap">
                    ({feet}&apos;{inches}&quot;)
                  </span>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex items-center bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5">
                    <input
                      type="number"
                      min={3}
                      max={7}
                      value={feet}
                      onChange={(e) => {
                        const newF = Number(e.target.value);
                        setHeightCm(Math.round(((newF * 12) + inches) * 2.54));
                      }}
                      className="w-full bg-transparent text-xs text-white font-bold focus:outline-none"
                    />
                    <span className="text-[10px] font-semibold text-slate-400">ft</span>
                  </div>
                  <div className="flex items-center bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5">
                    <input
                      type="number"
                      min={0}
                      max={11}
                      value={inches}
                      onChange={(e) => {
                        const newI = Number(e.target.value);
                        setHeightCm(Math.round(((feet * 12) + newI) * 2.54));
                      }}
                      className="w-full bg-transparent text-xs text-white font-bold focus:outline-none"
                    />
                    <span className="text-[10px] font-semibold text-slate-400">in</span>
                  </div>
                </div>
              )}
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-semibold text-slate-300">Weight (kg)</label>
                <span className="text-[10px] text-slate-400">≈ {(weightKg * 2.20462).toFixed(1)} lbs</span>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setWeightKg((w) => parseFloat(Math.max(30, w - 0.5).toFixed(1)))}
                  className="px-2 py-2 bg-slate-950 border border-slate-800 rounded-xl text-[11px] text-slate-400 hover:text-white"
                >
                  -0.5
                </button>
                <input
                  type="number"
                  step="0.1"
                  min={30}
                  max={250}
                  required
                  value={weightKg}
                  onChange={(e) => setWeightKg(parseFloat(e.target.value) || 0)}
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white text-center font-bold"
                />
                <button
                  type="button"
                  onClick={() => setWeightKg((w) => parseFloat(Math.min(250, w + 0.5).toFixed(1)))}
                  className="px-2 py-2 bg-slate-950 border border-slate-800 rounded-xl text-[11px] text-slate-400 hover:text-white"
                >
                  +0.5
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Fitness Goal</label>
              <select
                value={fitnessGoal}
                onChange={(e) => setFitnessGoal(e.target.value as FitnessGoal)}
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
              >
                <option value="weight_loss">Weight Loss</option>
                <option value="muscle_building">Muscle Building</option>
                <option value="weight_gain">Weight Gain</option>
                <option value="weight_maintenance">Weight Maintenance</option>
                <option value="general_fitness">General Fitness</option>
              </select>
            </div>

            <div className="col-span-1 sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-300 mb-1">Activity Level</label>
              <select
                value={activityLevel}
                onChange={(e) => setActivityLevel(e.target.value as ActivityLevel)}
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
              >
                <option value="sedentary">Sedentary (desk job, minimal movement)</option>
                <option value="lightly_active">Lightly Active (1-3 workouts/week)</option>
                <option value="moderately_active">Moderately Active (3-5 workouts/week)</option>
                <option value="very_active">Very Active (heavy physical training)</option>
              </select>
            </div>
          </div>

          <h3 className="text-sm font-extrabold text-white pt-4 pb-2 border-b border-slate-800">
            Optional Body Circumferences (Refines 3D Avatar)
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Chest (cm)</label>
              <input
                type="number"
                value={chestCm || ''}
                onChange={(e) => setChestCm(Number(e.target.value) || undefined)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Waist (cm)</label>
              <input
                type="number"
                value={waistCm || ''}
                onChange={(e) => setWaistCm(Number(e.target.value) || undefined)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Hip (cm)</label>
              <input
                type="number"
                value={hipCm || ''}
                onChange={(e) => setHipCm(Number(e.target.value) || undefined)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Body Fat %</label>
              <input
                type="number"
                step="0.5"
                value={bodyFat || ''}
                onChange={(e) => setBodyFat(Number(e.target.value) || undefined)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-4 rounded-2xl bg-blue-600 hover:bg-blue-500 font-extrabold text-xs text-white shadow-xl shadow-blue-600/30 active:scale-98 transition-all"
          >
            Update Profile & Refresh Targets
          </button>
        </form>

        {/* ACCOUNT SESSION & LOGOUT */}
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h4 className="text-sm font-extrabold text-white flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-rose-400" />
              <span>Account Session</span>
            </h4>
            <p className="text-xs text-slate-400 mt-1">
              Signed in as <strong className="text-slate-200">{user?.email || 'athlete@fittrack.ai'}</strong> ({user?.uid || 'active_athlete'})
            </p>
          </div>
          <button
            type="button"
            onClick={async () => {
              try {
                await logOut();
              } catch (e) {
                console.warn(e);
              }
              setUser(null);
              setProfile(null);
              router.push('/login');
            }}
            className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-xs font-bold text-white shadow-lg shadow-rose-600/30 transition-all active:scale-95"
          >
            <LogOut className="h-4 w-4" />
            <span>Log Out of Account</span>
          </button>
        </div>
      </div>
    </AppShell>
  );
}
