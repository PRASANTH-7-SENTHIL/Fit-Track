'use client';

import React, { useEffect, useState } from 'react';
import { mobileStepSensor } from '@/lib/sensor-step-tracker';
import { Smartphone, Activity, Footprints, ShieldCheck } from 'lucide-react';
import { useAppStore } from '@/store';

export default function MobileStepSensorBanner() {
  const { todayActivity } = useAppStore();
  const [isActive, setIsActive] = useState(false);
  const [magnitude, setMagnitude] = useState(0);
  const [hasPermissionPrompt, setHasPermissionPrompt] = useState(false);

  useEffect(() => {
    // Automatically start sensor
    mobileStepSensor.start();

    // Check if device requires permission (iOS Safari)
    if (typeof window !== 'undefined') {
      const DeviceMotion = (window as any).DeviceMotionEvent;
      if (typeof DeviceMotion?.requestPermission === 'function') {
        setHasPermissionPrompt(true);
      }
    }

    const unsubscribe = mobileStepSensor.subscribe((data) => {
      setIsActive(data.isActive);
      setMagnitude(data.magnitude);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const handleEnableSensor = async () => {
    const granted = await mobileStepSensor.requestPermissionAndStart();
    if (granted) {
      setHasPermissionPrompt(false);
      setIsActive(true);
    }
  };

  const currentSteps = todayActivity?.steps || 0;

  return (
    <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-3 sm:p-4 backdrop-blur-md shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        <div className="relative">
          <div className="h-10 w-10 rounded-xl bg-lime-400/10 border border-lime-400/30 flex items-center justify-center text-lime-400">
            <Smartphone className="h-5 w-5" />
          </div>
          {isActive && (
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-lime-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-lime-500" />
            </span>
          )}
        </div>

        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-white">Physical Mobile Step Sensor</span>
            <span
              className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                isActive
                  ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                  : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
              }`}
            >
              <span className={`h-1.5 w-1.5 rounded-full ${isActive ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
              <span>{isActive ? 'Live Accelerometer Connected' : 'Sensor Ready'}</span>
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Automatically counts your physical walking steps as you move with your phone.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3 self-end sm:self-auto">
        {hasPermissionPrompt && !isActive ? (
          <button
            onClick={handleEnableSensor}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-lime-400 hover:bg-lime-300 text-slate-950 text-xs font-extrabold shadow-md transition-all active:scale-95"
          >
            <Activity className="h-3.5 w-3.5" />
            <span>Enable Mobile Motion</span>
          </button>
        ) : (
          <div className="flex items-center gap-4 bg-slate-950/80 border border-slate-800 rounded-xl px-3.5 py-1.5">
            <div className="flex items-center gap-1.5 text-lime-400">
              <Footprints className="h-4 w-4" />
              <span className="text-sm font-black font-mono tracking-tight">{currentSteps.toLocaleString()}</span>
              <span className="text-[10px] text-slate-400 uppercase font-semibold">steps</span>
            </div>

            {magnitude > 0 && (
              <div className="text-[10px] font-mono text-slate-400 border-l border-slate-800 pl-3 hidden sm:block">
                motion: <span className="text-lime-300 font-bold">{magnitude.toFixed(1)} m/s²</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
