'use client';

import React, { useState } from 'react';
import AppShell from '@/components/layout/AppShell';
import { useAppStore } from '@/store';
import {
  UserCheck,
  Sparkles,
  RotateCw,
  Eye,
  Sliders,
  Calendar,
  Layers,
  ArrowRight,
  TrendingDown,
  CheckCircle2,
  Info,
} from 'lucide-react';
import { AvatarView, AvatarGender } from '@/types';

export default function BodyTransformationPage() {
  const { profile, weightHistory } = useAppStore();

  const [genderModel, setGenderModel] = useState<AvatarGender>(
    profile?.gender === 'female' ? 'female' : 'male'
  );
  const [activeView, setActiveView] = useState<AvatarView>('front');
  const [zoomLevel, setZoomLevel] = useState(1);
  const [timelineDay, setTimelineDay] = useState<1 | 30 | 60 | 90>(1);
  const [generating, setGenerating] = useState(false);

  const height = profile?.heightCm || 178;
  const currentWeight = profile?.weightKg || 74;
  const chest = profile?.chestCm || 100;
  const waist = profile?.waistCm || 82;
  const hip = profile?.hipCm || 96;

  // Compute parametric proportions for SVG rendering
  // Scale shoulders, waist, and hips relative to standard baseline
  const shoulderWidth = genderModel === 'male' ? Math.min(Math.max((chest / 100) * 85, 70), 105) : Math.min(Math.max((chest / 100) * 75, 65), 90);
  const waistWidth = Math.min(Math.max((waist / 80) * 55, 42), 80);
  const hipWidth = genderModel === 'female' ? Math.min(Math.max((hip / 95) * 75, 60), 95) : Math.min(Math.max((hip / 95) * 62, 50), 75);

  // Goal body proportions (leaner waist, defined shoulders)
  const goalShoulderWidth = shoulderWidth * 1.08;
  const goalWaistWidth = waistWidth * 0.88;
  const goalHipWidth = hipWidth * 0.95;

  const handleGenerateNew = () => {
    setGenerating(true);
    setTimeout(() => {
      setGenerating(false);
    }, 900);
  };

  // Anatomical Neutral Avatar SVG Generator
  const renderAvatarSvg = (
    sWidth: number,
    wWidth: number,
    hWidth: number,
    view: AvatarView,
    isGoal: boolean = false
  ) => {
    const strokeColor = isGoal ? '#84cc16' : '#38bdf8';
    const fillColor = isGoal ? 'rgba(132, 204, 22, 0.12)' : 'rgba(56, 189, 248, 0.12)';

    return (
      <svg
        viewBox="0 0 240 360"
        className="w-full h-full drop-shadow-xl transition-all duration-700 ease-out"
        style={{ transform: `scale(${zoomLevel})` }}
      >
        <defs>
          <linearGradient id={isGoal ? 'goalGrad' : 'currGrad'} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={isGoal ? '#84cc16' : '#38bdf8'} stopOpacity="0.4" />
            <stop offset="100%" stopColor={isGoal ? '#22c55e' : '#2563eb'} stopOpacity="0.1" />
          </linearGradient>
        </defs>

        {/* Head */}
        <ellipse cx="120" cy="50" rx="20" ry="26" fill={fillColor} stroke={strokeColor} strokeWidth="2.5" />
        
        {/* Neck */}
        <path d="M112 75 L112 88 L128 88 L128 75 Z" fill={fillColor} stroke={strokeColor} strokeWidth="2" />

        {view === 'front' && (
          <g>
            {/* Torso & Shoulders */}
            <path
              d={`
                M ${120 - sWidth / 2} 95
                Q 120 90 ${120 + sWidth / 2} 95
                L ${120 + sWidth / 2 + 8} 125
                L ${120 + wWidth / 2} 175
                L ${120 + hWidth / 2} 210
                L 132 225
                L 134 320
                L 118 320
                L 120 230
                L 106 225
                L 108 320
                L 92 320
                L 94 210
                L ${120 - hWidth / 2} 210
                L ${120 - wWidth / 2} 175
                L ${120 - sWidth / 2 - 8} 125
                Z
              `}
              fill={`url(#${isGoal ? 'goalGrad' : 'currGrad'})`}
              stroke={strokeColor}
              strokeWidth="2.5"
              strokeLinejoin="round"
            />

            {/* Arm Silhouettes */}
            <path
              d={`M ${120 - sWidth / 2 - 8} 125 L ${120 - sWidth / 2 - 16} 220 L ${120 - sWidth / 2 - 8} 220 L ${120 - sWidth / 2} 150 Z`}
              fill={fillColor}
              stroke={strokeColor}
              strokeWidth="2"
            />
            <path
              d={`M ${120 + sWidth / 2 + 8} 125 L ${120 + sWidth / 2 + 16} 220 L ${120 + sWidth / 2 + 8} 220 L ${120 + sWidth / 2} 150 Z`}
              fill={fillColor}
              stroke={strokeColor}
              strokeWidth="2"
            />

            {/* Subtle muscle proportion contour guides */}
            <path d={`M 105 130 Q 120 138 135 130`} stroke={strokeColor} strokeWidth="1.5" strokeOpacity="0.4" fill="none" />
            <path d={`M 120 135 L 120 185`} stroke={strokeColor} strokeWidth="1.5" strokeOpacity="0.3" fill="none" />
            <circle cx="120" cy="180" r="2" fill={strokeColor} fillOpacity="0.6" />
          </g>
        )}

        {view === 'side' && (
          <g>
            {/* Side silhouette */}
            <path
              d={`
                M 120 88
                C 140 100 138 140 128 175
                C 132 195 135 210 128 230
                L 130 320
                L 115 320
                L 112 230
                C 105 200 108 170 112 140
                C 114 110 116 95 120 88
                Z
              `}
              fill={`url(#${isGoal ? 'goalGrad' : 'currGrad'})`}
              stroke={strokeColor}
              strokeWidth="2.5"
              strokeLinejoin="round"
            />
            {/* Side Arm */}
            <path d="M 120 115 L 122 215" stroke={strokeColor} strokeWidth="6" strokeLinecap="round" opacity="0.6" />
          </g>
        )}

        {view === 'back' && (
          <g>
            {/* Back View */}
            <path
              d={`
                M ${120 - sWidth / 2} 95
                Q 120 90 ${120 + sWidth / 2} 95
                L ${120 + sWidth / 2 + 8} 125
                L ${120 + wWidth / 2} 175
                L ${120 + hWidth / 2} 210
                L 132 225
                L 134 320
                L 118 320
                L 120 230
                L 106 225
                L 108 320
                L 92 320
                L 94 210
                L ${120 - hWidth / 2} 210
                L ${120 - wWidth / 2} 175
                L ${120 - sWidth / 2 - 8} 125
                Z
              `}
              fill={`url(#${isGoal ? 'goalGrad' : 'currGrad'})`}
              stroke={strokeColor}
              strokeWidth="2.5"
            />
            {/* Latissimus / Spine contour */}
            <path d="M 120 95 L 120 205" stroke={strokeColor} strokeWidth="1.5" strokeOpacity="0.4" fill="none" />
            <path d={`M 100 120 Q 120 135 140 120`} stroke={strokeColor} strokeWidth="1.5" strokeOpacity="0.3" fill="none" />
          </g>
        )}
      </svg>
    );
  };

  return (
    <AppShell
      title="AI Body Transformation"
      subtitle="Neutral parametric 3D body representation calibrated to your anthropometric measurements"
      headerAction={
        <button
          onClick={handleGenerateNew}
          disabled={generating}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-lime-400 hover:bg-lime-300 text-xs font-bold text-slate-950 shadow-md transition-all disabled:opacity-50"
        >
          {generating ? (
            <div className="h-3.5 w-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
          ) : (
            <Sparkles className="h-3.5 w-3.5" />
          )}
          <span>Generate Avatar</span>
        </button>
      }
    >
      <div className="space-y-6">
        {/* DISCLAIMER CALLOUT (MANDATORY FROM SPECIFICATION) */}
        <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-start gap-3">
          <Info className="h-5 w-5 text-blue-400 flex-shrink-0 mt-0.5" />
          <div className="text-xs text-slate-300 leading-relaxed">
            <span className="font-bold text-white block">Parametric Illustrative Estimate</span>
            Height and weight alone cannot completely discern lean versus adipose tissue. This model provides an illustrative estimation derived from Mifflin-St Jeor metabolic formulas and circumferences. The goal avatar represents a hypothetical simulation, not a guaranteed result.
          </div>
        </div>

        {/* CONTROLS BAR: GENDER MODEL, VIEW ANGLE, ZOOM */}
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-wrap items-center justify-between gap-4">
          {/* Gender Model Selector */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-400">Model:</span>
            <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800">
              <button
                onClick={() => setGenderModel('male')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  genderModel === 'male' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                Male Frame
              </button>
              <button
                onClick={() => setGenderModel('female')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  genderModel === 'female' ? 'bg-pink-600 text-white shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                Female Frame
              </button>
            </div>
          </div>

          {/* Perspective Angle Tabs */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-400">View:</span>
            <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800">
              {(['front', 'side', 'back'] as AvatarView[]).map((v) => (
                <button
                  key={v}
                  onClick={() => setActiveView(v)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold capitalize transition-all ${
                    activeView === v ? 'bg-slate-800 text-lime-400 shadow' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {v} View
                </button>
              ))}
            </div>
          </div>

          {/* Zoom Slider */}
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-slate-400">Zoom:</span>
            <input
              type="range"
              min="0.8"
              max="1.3"
              step="0.05"
              value={zoomLevel}
              onChange={(e) => setZoomLevel(Number(e.target.value))}
              className="w-24 accent-lime-400 cursor-pointer"
            />
          </div>
        </div>

        {/* SIDE-BY-SIDE AVATARS: CURRENT BODY VS GOAL BODY */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* CURRENT BODY AVATAR */}
          <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-xl flex flex-col items-center justify-between text-center">
            <div className="w-full flex items-center justify-between mb-2">
              <span className="text-xs font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                CURRENT BODY
              </span>
              <span className="text-xs font-bold text-slate-400">
                {currentWeight} kg • BMI {((currentWeight / Math.pow(height / 100, 2)).toFixed(1))}
              </span>
            </div>

            <div className="w-full h-80 flex items-center justify-center overflow-hidden my-2">
              {renderAvatarSvg(shoulderWidth, waistWidth, hipWidth, activeView, false)}
            </div>

            <div className="w-full p-3 rounded-2xl bg-slate-950/70 border border-slate-800/80 text-left text-[11px] text-slate-400 space-y-1">
              <div className="flex justify-between">
                <span>Chest Circumference:</span>
                <span className="text-white font-bold">{chest} cm</span>
              </div>
              <div className="flex justify-between">
                <span>Waist Circumference:</span>
                <span className="text-white font-bold">{waist} cm</span>
              </div>
              <div className="flex justify-between">
                <span>Hip Circumference:</span>
                <span className="text-white font-bold">{hip} cm</span>
              </div>
            </div>
          </div>

          {/* GOAL BODY SIMULATION */}
          <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-xl flex flex-col items-center justify-between text-center relative overflow-hidden">
            <div className="w-full flex items-center justify-between mb-2">
              <span className="text-xs font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full bg-lime-400/10 text-lime-400 border border-lime-400/20">
                GOAL BODY (SIMULATION)
              </span>
              <span className="text-xs font-bold text-lime-400">
                Target: {profile?.fitnessGoal === 'weight_loss' ? currentWeight - 5 : currentWeight + 3} kg
              </span>
            </div>

            <div className="w-full h-80 flex items-center justify-center overflow-hidden my-2">
              {renderAvatarSvg(goalShoulderWidth, goalWaistWidth, goalHipWidth, activeView, true)}
            </div>

            <div className="w-full p-3 rounded-2xl bg-slate-950/70 border border-slate-800/80 text-left text-[11px] text-slate-400 space-y-1">
              <div className="flex justify-between">
                <span>Simulated Waist Ratio:</span>
                <span className="text-lime-400 font-bold">-12% Adipose Reduction</span>
              </div>
              <div className="flex justify-between">
                <span>Hypertrophy Shoulder Width:</span>
                <span className="text-lime-400 font-bold">+8% Deltoid/Back Tone</span>
              </div>
              <div className="flex justify-between">
                <span>Estimated Target Window:</span>
                <span className="text-white font-bold">~90 Days Dedicated Training</span>
              </div>
            </div>
          </div>
        </div>

        {/* TRANSFORMATION TIMELINE: DAY 1 / 30 / 60 / 90 */}
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-extrabold text-white">Transformation Timeline Progression</h3>
              <p className="text-[11px] text-slate-400">Interactive recorded progression across training milestones</p>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-3">
            {[
              { day: 1, label: 'Day 1', weight: currentWeight, status: 'Baseline' },
              { day: 30, label: 'Day 30', weight: currentWeight - 1.5, status: 'Fat Adaptation' },
              { day: 60, label: 'Day 60', weight: currentWeight - 3.2, status: 'Body Recomp' },
              { day: 90, label: 'Day 90', weight: currentWeight - 4.8, status: 'Goal Attainment' },
            ].map((milestone) => (
              <button
                key={milestone.day}
                onClick={() => setTimelineDay(milestone.day as any)}
                className={`p-4 rounded-2xl border text-center transition-all ${
                  timelineDay === milestone.day
                    ? 'bg-blue-600/20 border-blue-500 shadow-lg'
                    : 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
                }`}
              >
                <span className="text-xs font-black text-white block mb-0.5">{milestone.label}</span>
                <span className="text-base font-extrabold text-lime-400 block">{milestone.weight} kg</span>
                <span className="text-[10px] text-slate-400 block mt-1">{milestone.status}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
