'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { ActivityRecord } from '@/types';
import { X, Navigation, Clock, Flame, Zap, Footprints, Calendar } from 'lucide-react';

const GPSMap = dynamic(() => import('@/components/map/GPSMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-64 bg-slate-950 rounded-2xl flex items-center justify-center text-slate-500 animate-pulse">
      Loading Route Map...
    </div>
  ),
});

interface RouteHistoryModalProps {
  activity: ActivityRecord | null;
  onClose: () => void;
}

export default function RouteHistoryModal({ activity, onClose }: RouteHistoryModalProps) {
  if (!activity) return null;

  const route = activity.route || [];
  const firstPoint = route[0] || null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-lime-400 px-2.5 py-0.5 rounded-full bg-lime-400/10 border border-lime-400/20">
                {activity.type.toUpperCase()}
              </span>
              <span className="text-xs text-slate-400">
                {activity.startTime} {activity.endTime ? `- ${activity.endTime}` : ''}
              </span>
            </div>
            <h3 className="text-lg font-black text-white mt-1 capitalize">
              {activity.type} Route Overview
            </h3>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Map View */}
        <div className="my-4 h-72 w-full rounded-2xl overflow-hidden border border-slate-800">
          {route.length > 0 && firstPoint ? (
            <GPSMap
              currentPosition={{ lat: firstPoint.lat, lng: firstPoint.lng }}
              route={route}
              isTracking={false}
              activityType={activity.type}
            />
          ) : (
            <div className="w-full h-full bg-slate-950 flex flex-col items-center justify-center text-slate-500 p-4 text-center">
              <Navigation className="h-8 w-8 mb-2 opacity-50" />
              <p className="text-xs font-semibold text-slate-400">No GPS coordinates recorded for this session.</p>
              <p className="text-[11px] text-slate-600 mt-1">Manual activity entries do not have route waypoints.</p>
            </div>
          )}
        </div>

        {/* Workout Metrics Grid */}
        <div className="grid grid-cols-4 gap-3 mb-4">
          <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 text-center">
            <Navigation className="h-4 w-4 text-blue-400 mx-auto mb-1" />
            <span className="text-base font-black text-white block">{activity.distanceKm ?? 0}</span>
            <span className="text-[10px] text-slate-400 uppercase">Kilometers</span>
          </div>

          <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 text-center">
            <Clock className="h-4 w-4 text-amber-400 mx-auto mb-1" />
            <span className="text-base font-black text-white block">{activity.durationMinutes}</span>
            <span className="text-[10px] text-slate-400 uppercase">Minutes</span>
          </div>

          <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 text-center">
            <Flame className="h-4 w-4 text-rose-400 mx-auto mb-1" />
            <span className="text-base font-black text-white block">{activity.caloriesBurned}</span>
            <span className="text-[10px] text-slate-400 uppercase">Burned kcal</span>
          </div>

          <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 text-center">
            <Zap className="h-4 w-4 text-lime-400 mx-auto mb-1" />
            <span className="text-base font-black text-white block">
              {activity.averageSpeedKmh ? `${activity.averageSpeedKmh}` : '--'}
            </span>
            <span className="text-[10px] text-slate-400 uppercase">Avg km/h</span>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-2 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-lime-400 hover:bg-lime-300 text-slate-950 text-xs font-bold transition-all shadow-md"
          >
            Close Overview
          </button>
        </div>
      </div>
    </div>
  );
}
