'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import AppShell from '@/components/layout/AppShell';
import { getWorkoutById, WORKOUT_PLANS } from '@/lib/workout-plans';
import { useAppStore } from '@/store';
import {
  Play,
  Pause,
  RotateCcw,
  SkipForward,
  CheckCircle2,
  Clock,
  Flame,
  Dumbbell,
  ArrowLeft,
  Volume2,
  Sparkles,
} from 'lucide-react';
import { WorkoutSession, ExerciseResult } from '@/types';

function WorkoutSessionContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const planId = searchParams.get('planId') || 'easy_full_body';

  const { addWorkoutSession, user, profile, todayActivity, setTodayActivity } = useAppStore();

  const plan = getWorkoutById(planId) || WORKOUT_PLANS[0];

  const [currentExerciseIdx, setCurrentExerciseIdx] = useState(0);
  const [isResting, setIsResting] = useState(false);
  const [restCountdown, setRestCountdown] = useState(30);

  const [isActive, setIsActive] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [exerciseSeconds, setExerciseSeconds] = useState(0);
  const [currentReps, setCurrentReps] = useState(0);

  const [completed, setCompleted] = useState(false);
  const [exerciseResults, setExerciseResults] = useState<ExerciseResult[]>([]);

  const currentExercise = plan.exercises[currentExerciseIdx];

  // Global Session Timer
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isActive && !completed) {
      interval = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);

        if (!isResting) {
          setExerciseSeconds((prev) => prev + 1);
        } else {
          setRestCountdown((prev) => {
            if (prev <= 1) {
              setIsResting(false);
              return 30;
            }
            return prev - 1;
          });
        }
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, isResting, completed]);

  const handleNextExercise = () => {
    // Record current result
    const result: ExerciseResult = {
      exerciseId: currentExercise.id,
      exerciseName: currentExercise.name,
      completedReps: currentExercise.type === 'reps' ? currentReps || currentExercise.targetReps : undefined,
      completedDurationSeconds: currentExercise.type === 'duration' ? exerciseSeconds : undefined,
      completed: true,
      caloriesBurned: Math.round(
        currentExercise.caloriesPerUnit *
          (currentExercise.type === 'reps'
            ? currentReps || currentExercise.targetReps || 20
            : exerciseSeconds)
      ),
    };

    const updated = [...exerciseResults, result];
    setExerciseResults(updated);

    if (currentExerciseIdx < plan.exercises.length - 1) {
      // Trigger rest period
      setIsResting(true);
      setRestCountdown(currentExercise.restDurationSeconds || 30);
      setCurrentExerciseIdx(currentExerciseIdx + 1);
      setExerciseSeconds(0);
      setCurrentReps(0);
    } else {
      // Complete workout
      finishWorkout(updated);
    }
  };

  const finishWorkout = (results: ExerciseResult[]) => {
    setIsActive(false);
    setCompleted(true);

    const totalBurned = results.reduce((acc, curr) => acc + curr.caloriesBurned, 0) || plan.estimatedCaloriesBurned;

    const session: WorkoutSession = {
      id: 'session_' + Date.now(),
      uid: user?.uid || profile?.uid || 'athlete_01',
      workoutPlanId: plan.id,
      workoutName: plan.name,
      difficulty: plan.difficulty,
      date: new Date().toISOString().split('T')[0],
      startTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      endTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      exercises: results,
      totalCaloriesBurned: totalBurned,
      completionPercentage: 100,
      status: 'completed',
    };

    addWorkoutSession(session);

    // Also sync to today's activity calories
    if (todayActivity) {
      setTodayActivity({
        ...todayActivity,
        caloriesBurned: todayActivity.caloriesBurned + totalBurned,
        activeMinutes: todayActivity.activeMinutes + Math.round(elapsedSeconds / 60),
      });
    }
  };

  const progressPct = Math.round(((currentExerciseIdx) / plan.exercises.length) * 100);

  return (
    <AppShell
      title={plan.name}
      subtitle={`Exercise ${currentExerciseIdx + 1} of ${plan.exercises.length}`}
      headerAction={
        <button
          onClick={() => router.push('/workouts')}
          className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-slate-800 text-slate-300 hover:text-white"
        >
          Exit Session
        </button>
      }
    >
      <div className="max-w-xl mx-auto space-y-6">
        {/* COMPLETED CELEBRATION SCREEN */}
        {completed ? (
          <div className="p-8 rounded-3xl bg-slate-900 border border-slate-800 text-center shadow-2xl animate-fade-in">
            <div className="h-20 w-20 rounded-full bg-lime-400 text-slate-950 flex items-center justify-center mx-auto mb-4 shadow-xl shadow-lime-400/30">
              <CheckCircle2 className="h-10 w-10 stroke-[2.5]" />
            </div>

            <span className="text-xs font-bold uppercase tracking-wider text-lime-400 px-3 py-1 rounded-full bg-lime-400/10 border border-lime-400/20">
              WORKOUT ACCOMPLISHED
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-white mt-2">Outstanding Effort!</h2>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              You completed all {plan.exercises.length} exercises of {plan.name}.
            </p>

            <div className="grid grid-cols-2 gap-4 my-8 max-w-xs mx-auto">
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
                <Clock className="h-5 w-5 text-blue-400 mx-auto mb-1" />
                <span className="text-xl font-black text-white block">
                  {Math.floor(elapsedSeconds / 60)}m {elapsedSeconds % 60}s
                </span>
                <span className="text-[10px] text-slate-400 uppercase">Duration</span>
              </div>
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
                <Flame className="h-5 w-5 text-amber-400 mx-auto mb-1" />
                <span className="text-xl font-black text-lime-400 block">
                  ~{plan.estimatedCaloriesBurned}
                </span>
                <span className="text-[10px] text-slate-400 uppercase">Calories Burned</span>
              </div>
            </div>

            <div className="flex gap-3">
              <Link
                href="/workout-history"
                className="flex-1 py-3.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 border border-slate-700"
              >
                Workout History
              </Link>
              <Link
                href="/dashboard"
                className="flex-1 py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-500 text-xs font-bold text-white shadow-lg shadow-blue-600/30"
              >
                Back to Dashboard
              </Link>
            </div>
          </div>
        ) : (
          /* ACTIVE EXERCISE VIEW */
          <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 sm:p-8 shadow-2xl space-y-6">
            {/* Progress line */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-semibold text-slate-400">
                <span>Progress: {progressPct}%</span>
                <span>
                  {currentExerciseIdx + 1} / {plan.exercises.length} Exercises
                </span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-lime-400 h-full transition-all duration-300"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
            </div>

            {/* REST MODE BANNER */}
            {isResting ? (
              <div className="p-8 rounded-3xl bg-slate-950 border border-amber-500/30 text-center animate-pulse">
                <span className="text-xs font-bold text-amber-400 uppercase tracking-widest block mb-2">
                  REST & RECOVERY
                </span>
                <span className="text-6xl font-mono font-black text-amber-400 block mb-2">
                  {restCountdown}s
                </span>
                <p className="text-xs text-slate-400">
                  Catch your breath! Next up:{' '}
                  <span className="text-white font-bold">{currentExercise?.name}</span>
                </p>
                <button
                  onClick={() => setIsResting(false)}
                  className="mt-4 px-4 py-1.5 rounded-xl bg-slate-800 text-xs font-semibold text-slate-300 hover:text-white"
                >
                  Skip Rest
                </button>
              </div>
            ) : (
              /* ACTIVE EXERCISE CARD */
              <div className="p-6 rounded-2xl bg-slate-950/80 border border-slate-800 text-center space-y-4">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-blue-400 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20">
                  CURRENT EXERCISE
                </span>

                <h3 className="text-3xl font-black text-white">{currentExercise.name}</h3>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  {currentExercise.description}
                </p>

                {/* Counter / Timer depending on type */}
                <div className="py-6 my-2 border-y border-slate-800 flex flex-col items-center justify-center">
                  {currentExercise.type === 'reps' ? (
                    <div>
                      <span className="text-[11px] text-slate-400 uppercase tracking-wider block mb-1">
                        TARGET REPETITIONS
                      </span>
                      <span className="text-6xl font-black text-lime-400 font-mono">
                        {currentExercise.targetReps}
                      </span>
                      <span className="text-xs text-slate-400 block mt-1">reps</span>
                    </div>
                  ) : (
                    <div>
                      <span className="text-[11px] text-slate-400 uppercase tracking-wider block mb-1">
                        ELAPSED EXERCISE TIME
                      </span>
                      <span className="text-6xl font-black text-lime-400 font-mono">
                        {Math.floor(exerciseSeconds / 60)}:
                        {(exerciseSeconds % 60).toString().padStart(2, '0')}
                      </span>
                      {currentExercise.targetDurationSeconds && (
                        <span className="text-xs text-slate-400 block mt-1">
                          Target: {Math.round(currentExercise.targetDurationSeconds / 60)} mins
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Instructions Accordion */}
                <div className="text-left bg-slate-900/80 p-4 rounded-xl border border-slate-800/80 space-y-1.5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    FORM INSTRUCTIONS:
                  </span>
                  {currentExercise.instructions.map((inst, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs text-slate-300">
                      <span className="h-1.5 w-1.5 rounded-full bg-lime-400 mt-1.5 flex-shrink-0" />
                      <span>{inst}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* CONTROLS */}
            <div className="flex items-center justify-between gap-4">
              <button
                onClick={() => setIsActive(!isActive)}
                className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl font-black text-xs shadow-xl active:scale-95 transition-all ${
                  isActive
                    ? 'bg-amber-400 hover:bg-amber-300 text-slate-950'
                    : 'bg-lime-400 hover:bg-lime-300 text-slate-950 shadow-lime-400/25'
                }`}
              >
                {isActive ? (
                  <>
                    <Pause className="h-4 w-4 fill-slate-950" />
                    <span>PAUSE</span>
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 fill-slate-950" />
                    <span>{elapsedSeconds > 0 ? 'RESUME' : 'START SESSION'}</span>
                  </>
                )}
              </button>

              <button
                onClick={handleNextExercise}
                className="flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl bg-blue-600 hover:bg-blue-500 font-black text-xs text-white shadow-xl shadow-blue-600/30 active:scale-95 transition-all"
              >
                <span>
                  {currentExerciseIdx === plan.exercises.length - 1 ? 'FINISH WORKOUT' : 'NEXT EXERCISE'}
                </span>
                <SkipForward className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}

export default function WorkoutSessionPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-400">Loading workout session...</div>}>
      <WorkoutSessionContent />
    </Suspense>
  );
}
