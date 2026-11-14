'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  User,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Flame,
  Dumbbell,
  Scale,
  HeartPulse,
  Activity,
  Check,
} from 'lucide-react';
import { useAppStore } from '@/store';
import { Gender, FitnessGoal, ActivityLevel } from '@/types';
import { calculateAllFitnessMetrics } from '@/lib/calculations';

export default function ProfileSetupPage() {
  const router = useRouter();
  const { user, setUser, setProfile, setCalculations } = useAppStore();

  const [step, setStep] = useState(1);

  // Form states
  const [fullName, setFullName] = useState(user?.displayName || '');
  const [age, setAge] = useState(25);
  const [gender, setGender] = useState<Gender>('male');

  const [heightCm, setHeightCm] = useState(175);
  const [weightKg, setWeightKg] = useState<number>(73.5);
  const [heightUnit, setHeightUnit] = useState<'cm' | 'inch'>('cm');
  const [weightUnit, setWeightUnit] = useState<'kg' | 'lbs'>('kg');

  // Feet & Inches computed helpers
  const totalInches = Math.round(heightCm / 2.54);
  const feet = Math.floor(totalInches / 12);
  const inches = totalInches % 12;

  const handleFeetInchesChange = (newFeet: number, newInches: number) => {
    const totalIn = Math.max(36, Math.min(96, newFeet * 12 + newInches));
    setHeightCm(Math.round(totalIn * 2.54));
  };

  const [fitnessGoal, setFitnessGoal] = useState<FitnessGoal>('muscle_building');
  const [activityLevel, setActivityLevel] = useState<ActivityLevel>('moderately_active');

  // Body measurements (optional)
  const [chestCm, setChestCm] = useState<number | undefined>(98);
  const [waistCm, setWaistCm] = useState<number | undefined>(82);
  const [hipCm, setHipCm] = useState<number | undefined>(94);
  const [neckCm, setNeckCm] = useState<number | undefined>(38);
  const [bodyFatPercentage, setBodyFatPercentage] = useState<number | undefined>(15);

  const handleFinish = () => {
    const activeUid = user?.uid || `athlete_${Date.now()}`;
    const weightNum = Number(weightKg);
    const targetW =
      fitnessGoal === 'weight_loss'
        ? Math.round((weightNum - 5) * 10) / 10
        : fitnessGoal === 'weight_gain' || fitnessGoal === 'muscle_building'
        ? Math.round((weightNum + 4) * 10) / 10
        : weightNum;

    if (!user) {
      setUser({
        uid: activeUid,
        email: 'athlete@fittrack.ai',
        displayName: fullName || 'Athlete',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        onboardingComplete: false,
        providers: ['local'],
      });
    }

    const profileData = {
      uid: activeUid,
      fullName: fullName || 'Athlete',
      age: Number(age),
      gender,
      heightCm: Number(heightCm),
      weightKg: weightNum,
      targetWeight: targetW,
      fitnessGoal,
      activityLevel,
      chestCm: chestCm ? Number(chestCm) : undefined,
      waistCm: waistCm ? Number(waistCm) : undefined,
      hipCm: hipCm ? Number(hipCm) : undefined,
      neckCm: neckCm ? Number(neckCm) : undefined,
      bodyFatPercentage: bodyFatPercentage ? Number(bodyFatPercentage) : undefined,
      updatedAt: new Date().toISOString(),
    };

    setProfile(profileData as any);

    // Calculate all metrics
    const metrics = calculateAllFitnessMetrics(
      weightNum,
      Number(heightCm),
      Number(age),
      gender,
      activityLevel,
      fitnessGoal
    );
    setCalculations(metrics);

    router.push('/fitness-plan');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-4 py-8">
      <div className="w-full max-w-xl bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
        {/* Progress Bar & Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-400 mb-2">
            <span className="flex items-center gap-1.5 text-lime-400 font-bold uppercase tracking-wider">
              <Sparkles className="h-3.5 w-3.5" />
              FitTrack AI Setup
            </span>
            <span>Step {step} of 5</span>
          </div>
          <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
            <div
              className="bg-gradient-to-r from-blue-500 to-lime-400 h-full transition-all duration-500 ease-out"
              style={{ width: `${(step / 5) * 100}%` }}
            />
          </div>
        </div>

        {/* STEP 1: Basic Demographics */}
        {step === 1 && (
          <div className="space-y-6 animate-fade-in">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-white">Let's Get Acquainted</h2>
              <p className="text-xs text-slate-400 mt-1">
                Tell us your name, age and gender for baseline metabolic computations.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Full Name</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Jason Smith"
                  className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Age: {age} years</label>
                <input
                  type="range"
                  min={14}
                  max={90}
                  value={age}
                  onChange={(e) => setAge(Number(e.target.value))}
                  className="w-full accent-lime-400 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                  <span>14 y/o</span>
                  <span>50 y/o</span>
                  <span>90 y/o</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2">Biological Gender</label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { id: 'male', label: 'Male' },
                    { id: 'female', label: 'Female' },
                    { id: 'prefer_not_to_say', label: 'Other' },
                  ].map((g) => (
                    <button
                      key={g.id}
                      type="button"
                      onClick={() => setGender(g.id as Gender)}
                      className={`py-3 px-4 rounded-xl text-xs font-semibold border transition-all ${
                        gender === g.id
                          ? 'bg-blue-600 border-blue-500 text-white shadow-md'
                          : 'bg-slate-800/80 border-slate-700/80 text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      {g.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: Height & Weight */}
        {step === 2 && (
          <div className="space-y-6 animate-fade-in">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-white">Body Stature</h2>
              <p className="text-xs text-slate-400 mt-1">
                Select your preferred measurement units (CM / INCH) and enter your exact height and weight.
              </p>
            </div>

            <div className="space-y-6">
              {/* HEIGHT CARD */}
              <div className="p-5 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <span className="text-xs font-semibold text-slate-300">Height</span>
                    <p className="text-[11px] text-slate-500">
                      {heightUnit === 'cm' ? `${feet} ft ${inches} in equivalent` : `${heightCm} cm equivalent`}
                    </p>
                  </div>

                  {/* Unit Selector: CM vs INCH */}
                  <div className="flex bg-slate-900 border border-slate-800 rounded-xl p-1">
                    <button
                      type="button"
                      onClick={() => setHeightUnit('cm')}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                        heightUnit === 'cm'
                          ? 'bg-lime-400 text-slate-950 shadow-sm'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      CM
                    </button>
                    <button
                      type="button"
                      onClick={() => setHeightUnit('inch')}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                        heightUnit === 'inch'
                          ? 'bg-lime-400 text-slate-950 shadow-sm'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      INCH (FT/IN)
                    </button>
                  </div>
                </div>

                {heightUnit === 'cm' ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-3">
                      <input
                        type="range"
                        min={100}
                        max={240}
                        step={1}
                        value={heightCm}
                        onChange={(e) => setHeightCm(Number(e.target.value))}
                        className="flex-1 accent-lime-400 cursor-pointer h-2 bg-slate-800 rounded-lg"
                      />
                      <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 min-w-[100px] justify-end">
                        <input
                          type="number"
                          min={100}
                          max={250}
                          value={heightCm}
                          onChange={(e) => setHeightCm(Math.max(100, Math.min(250, Number(e.target.value) || 100)))}
                          className="w-16 bg-transparent text-right font-black text-lime-400 text-base focus:outline-none"
                        />
                        <span className="text-xs font-bold text-slate-400">cm</span>
                      </div>
                    </div>
                    <div className="flex justify-between text-[10px] text-slate-500">
                      <span>120 cm (3&apos;11&quot;)</span>
                      <span>175 cm (5&apos;9&quot;)</span>
                      <span>230 cm (7&apos;6&quot;)</span>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-4">
                      {/* Feet Picker */}
                      <div className="bg-slate-900 border border-slate-800/80 rounded-xl p-3">
                        <label className="block text-[11px] font-semibold text-slate-400 mb-1">Feet</label>
                        <div className="flex items-center justify-between">
                          <input
                            type="number"
                            min={3}
                            max={7}
                            value={feet}
                            onChange={(e) => handleFeetInchesChange(Number(e.target.value), inches)}
                            className="w-16 bg-transparent font-black text-lime-400 text-lg focus:outline-none"
                          />
                          <span className="text-xs font-bold text-slate-400">ft (&apos;)</span>
                        </div>
                      </div>

                      {/* Inches Picker */}
                      <div className="bg-slate-900 border border-slate-800/80 rounded-xl p-3">
                        <label className="block text-[11px] font-semibold text-slate-400 mb-1">Inches</label>
                        <div className="flex items-center justify-between">
                          <input
                            type="number"
                            min={0}
                            max={11}
                            value={inches}
                            onChange={(e) => handleFeetInchesChange(feet, Number(e.target.value))}
                            className="w-16 bg-transparent font-black text-lime-400 text-lg focus:outline-none"
                          />
                          <span className="text-xs font-bold text-slate-400">in (&quot;)</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs text-slate-400 px-1 pt-1">
                      <span>Total: <strong className="text-white font-bold">{totalInches} inches</strong></span>
                      <span className="text-lime-400 font-semibold">{heightCm} cm</span>
                    </div>
                  </div>
                )}
              </div>

              {/* WEIGHT CARD */}
              <div className="p-5 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <span className="text-xs font-semibold text-slate-300">Current Weight</span>
                    <p className="text-[11px] text-slate-500">
                      Supports point values (e.g. 73.5 kg)
                    </p>
                  </div>

                  {/* Unit Selector: KG vs LBS */}
                  <div className="flex bg-slate-900 border border-slate-800 rounded-xl p-1">
                    <button
                      type="button"
                      onClick={() => setWeightUnit('kg')}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                        weightUnit === 'kg'
                          ? 'bg-blue-600 text-white shadow-sm'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      KG
                    </button>
                    <button
                      type="button"
                      onClick={() => setWeightUnit('lbs')}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                        weightUnit === 'lbs'
                          ? 'bg-blue-600 text-white shadow-sm'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      LBS
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <input
                      type="range"
                      min={30}
                      max={200}
                      step={0.1}
                      value={weightKg}
                      onChange={(e) => setWeightKg(parseFloat(parseFloat(e.target.value).toFixed(1)))}
                      className="flex-1 accent-blue-500 cursor-pointer h-2 bg-slate-800 rounded-lg"
                    />

                    {/* Direct Number Input */}
                    <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 min-w-[110px] justify-end">
                      <input
                        type="number"
                        step={0.1}
                        min={30}
                        max={250}
                        value={weightUnit === 'kg' ? weightKg : parseFloat((weightKg * 2.20462).toFixed(1))}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value) || 0;
                          if (weightUnit === 'kg') {
                            setWeightKg(val);
                          } else {
                            setWeightKg(parseFloat((val / 2.20462).toFixed(1)));
                          }
                        }}
                        className="w-18 bg-transparent text-right font-black text-blue-400 text-base focus:outline-none"
                      />
                      <span className="text-xs font-bold text-slate-400">
                        {weightUnit === 'kg' ? 'kg' : 'lbs'}
                      </span>
                    </div>
                  </div>

                  {/* Micro Stepper adjustments (+ / - 0.5 kg & 0.1 kg) */}
                  <div className="flex items-center justify-between pt-1">
                    <div className="flex gap-1.5">
                      <button
                        type="button"
                        onClick={() => setWeightKg((w) => parseFloat(Math.max(30, w - 0.5).toFixed(1)))}
                        className="px-2 py-1 rounded-lg bg-slate-900 border border-slate-800 text-[11px] font-semibold text-slate-300 hover:bg-slate-800 hover:text-white active:scale-95 transition-all"
                      >
                        -0.5
                      </button>
                      <button
                        type="button"
                        onClick={() => setWeightKg((w) => parseFloat(Math.max(30, w - 0.1).toFixed(1)))}
                        className="px-2 py-1 rounded-lg bg-slate-900 border border-slate-800 text-[11px] font-semibold text-slate-300 hover:bg-slate-800 hover:text-white active:scale-95 transition-all"
                      >
                        -0.1
                      </button>
                    </div>

                    <div className="text-[11px] text-slate-400 font-medium">
                      {weightUnit === 'kg' ? (
                        <span>≈ {(weightKg * 2.20462).toFixed(1)} lbs</span>
                      ) : (
                        <span>≈ {weightKg.toFixed(1)} kg</span>
                      )}
                    </div>

                    <div className="flex gap-1.5">
                      <button
                        type="button"
                        onClick={() => setWeightKg((w) => parseFloat(Math.min(220, w + 0.1).toFixed(1)))}
                        className="px-2 py-1 rounded-lg bg-slate-900 border border-slate-800 text-[11px] font-semibold text-slate-300 hover:bg-slate-800 hover:text-white active:scale-95 transition-all"
                      >
                        +0.1
                      </button>
                      <button
                        type="button"
                        onClick={() => setWeightKg((w) => parseFloat(Math.min(220, w + 0.5).toFixed(1)))}
                        className="px-2 py-1 rounded-lg bg-slate-900 border border-slate-800 text-[11px] font-semibold text-slate-300 hover:bg-slate-800 hover:text-white active:scale-95 transition-all"
                      >
                        +0.5
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: Fitness Goal */}
        {step === 3 && (
          <div className="space-y-6 animate-fade-in">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-white">Your Primary Target</h2>
              <p className="text-xs text-slate-400 mt-1">
                This dictates your daily calorie surplus, deficit, and macro splits.
              </p>
            </div>

            <div className="space-y-2.5">
              {[
                { id: 'weight_loss', label: 'Weight Loss', desc: 'Caloric deficit (-500 kcal) with high protein preservation', icon: Flame, color: 'text-rose-400' },
                { id: 'muscle_building', label: 'Muscle Building', desc: 'Hypertrophy target (+300 kcal) with optimal 2.0g/kg protein', icon: Dumbbell, color: 'text-blue-400' },
                { id: 'weight_gain', label: 'Weight Gain', desc: 'Healthy surplus (+400 kcal) with balanced complex carbohydrates', icon: Scale, color: 'text-amber-400' },
                { id: 'weight_maintenance', label: 'Weight Maintenance', desc: 'Iso-caloric maintenance to sustain body composition', icon: Activity, color: 'text-lime-400' },
                { id: 'general_fitness', label: 'General Fitness', desc: 'Endurance, stamina, clean nutrition and heart health', icon: HeartPulse, color: 'text-indigo-400' },
              ].map((g) => {
                const Icon = g.icon;
                const isSelected = fitnessGoal === g.id;
                return (
                  <div
                    key={g.id}
                    onClick={() => setFitnessGoal(g.id as FitnessGoal)}
                    className={`p-3.5 rounded-2xl border cursor-pointer flex items-center justify-between transition-all ${
                      isSelected
                        ? 'bg-blue-600/20 border-blue-500 shadow-md'
                        : 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2.5 rounded-xl bg-slate-900 border border-slate-800 ${g.color}`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-white">{g.label}</h4>
                        <p className="text-[11px] text-slate-400 mt-0.5">{g.desc}</p>
                      </div>
                    </div>
                    {isSelected && (
                      <div className="h-6 w-6 rounded-full bg-blue-500 flex items-center justify-center text-white">
                        <Check className="h-3.5 w-3.5" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* STEP 4: Activity Level */}
        {step === 4 && (
          <div className="space-y-6 animate-fade-in">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-white">Daily Activity Rhythm</h2>
              <p className="text-xs text-slate-400 mt-1">
                Determines your Total Daily Energy Expenditure (TDEE multiplier).
              </p>
            </div>

            <div className="space-y-2.5">
              {[
                { id: 'sedentary', label: 'Sedentary', factor: '1.2x', desc: 'Desk job, minimal daily movement, <5,000 steps' },
                { id: 'lightly_active', label: 'Lightly Active', factor: '1.375x', desc: 'Light exercise 1-3 days/week or 6,000-8,000 steps' },
                { id: 'moderately_active', label: 'Moderately Active', factor: '1.55x', desc: 'Moderate exercise 3-5 days/week or active lifestyle' },
                { id: 'very_active', label: 'Very Active', factor: '1.725x', desc: 'Hard exercise 6-7 days/week, athletic training' },
              ].map((a) => {
                const isSelected = activityLevel === a.id;
                return (
                  <div
                    key={a.id}
                    onClick={() => setActivityLevel(a.id as ActivityLevel)}
                    className={`p-3.5 rounded-2xl border cursor-pointer flex items-center justify-between transition-all ${
                      isSelected
                        ? 'bg-lime-400/10 border-lime-400 shadow-md'
                        : 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs font-bold text-white">{a.label}</h4>
                        <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-slate-800 text-lime-400">
                          {a.factor}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">{a.desc}</p>
                    </div>
                    {isSelected && (
                      <div className="h-6 w-6 rounded-full bg-lime-400 flex items-center justify-center text-slate-950 font-bold">
                        <Check className="h-3.5 w-3.5" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* STEP 5: Optional Body Measurements */}
        {step === 5 && (
          <div className="space-y-6 animate-fade-in">
            <div>
              <div className="flex items-center justify-between">
                <h2 className="text-xl sm:text-2xl font-black text-white">Body Measurements</h2>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30">
                  Optional
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Entering circumferences refines your 3D body avatar visualization.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Chest (cm)</label>
                <input
                  type="number"
                  value={chestCm || ''}
                  onChange={(e) => setChestCm(Number(e.target.value) || undefined)}
                  placeholder="e.g. 100"
                  className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Waist (cm)</label>
                <input
                  type="number"
                  value={waistCm || ''}
                  onChange={(e) => setWaistCm(Number(e.target.value) || undefined)}
                  placeholder="e.g. 82"
                  className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Hip (cm)</label>
                <input
                  type="number"
                  value={hipCm || ''}
                  onChange={(e) => setHipCm(Number(e.target.value) || undefined)}
                  placeholder="e.g. 96"
                  className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Neck (cm)</label>
                <input
                  type="number"
                  value={neckCm || ''}
                  onChange={(e) => setNeckCm(Number(e.target.value) || undefined)}
                  placeholder="e.g. 38"
                  className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                />
              </div>

              <div className="col-span-2">
                <label className="block text-xs font-semibold text-slate-300 mb-1">Estimated Body Fat % (if known)</label>
                <input
                  type="number"
                  value={bodyFatPercentage || ''}
                  onChange={(e) => setBodyFatPercentage(Number(e.target.value) || undefined)}
                  placeholder="e.g. 15%"
                  className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                />
              </div>
            </div>
          </div>
        )}

        {/* Footer Navigation */}
        <div className="flex items-center justify-between mt-8 pt-6 border-t border-slate-800">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep(step - 1)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Previous</span>
            </button>
          ) : (
            <div />
          )}

          {step < 5 ? (
            <button
              type="button"
              onClick={() => setStep(step + 1)}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 font-bold text-xs text-white shadow-lg shadow-blue-600/30 transition-all ml-auto"
            >
              <span>Next Step</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleFinish}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-lime-400 hover:bg-lime-300 font-extrabold text-xs text-slate-950 shadow-xl shadow-lime-400/25 transition-all ml-auto"
            >
              <Sparkles className="h-4 w-4" />
              <span>Calculate My AI Plan</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
