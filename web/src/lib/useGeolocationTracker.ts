'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { ActivityType, GeoPoint, ActivityRecord } from '@/types';
import { calculateCaloriesBurned } from '@/lib/calculations';

export interface LocationCoord {
  lat: number;
  lng: number;
  accuracy?: number;
  speed?: number | null; // m/s from GPS
  heading?: number | null;
  altitude?: number | null;
}

export type GpsStatus = 'idle' | 'searching' | 'active' | 'denied' | 'unsupported';

// Haversine formula to compute distance between two latitude/longitude points in meters
export function calculateHaversineMeters(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371000; // Earth radius in meters
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Format pace into mm:ss per km
export function formatPace(paceMinKm: number): string {
  if (!isFinite(paceMinKm) || paceMinKm <= 0 || paceMinKm > 60) return '--:--';
  const mins = Math.floor(paceMinKm);
  const secs = Math.round((paceMinKm - mins) * 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export function useGeolocationTracker(initialMode: ActivityType = 'running', userWeightKg: number = 70) {
  const [mode, setMode] = useState<ActivityType>(initialMode);
  const [isTracking, setIsTracking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);

  const [gpsStatus, setGpsStatus] = useState<GpsStatus>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [currentPosition, setCurrentPosition] = useState<LocationCoord | null>(null);
  const [route, setRoute] = useState<GeoPoint[]>([]);

  const [durationSeconds, setDurationSeconds] = useState(0);
  const [distanceMeters, setDistanceMeters] = useState(0);
  const [currentSpeedKmh, setCurrentSpeedKmh] = useState(0);
  const [averageSpeedKmh, setAverageSpeedKmh] = useState(0);

  const watchIdRef = useRef<number | null>(null);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const simulationIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const simAngleRef = useRef(0);
  const simCenterRef = useRef<{ lat: number; lng: number }>({ lat: 40.7829, lng: -73.9654 }); // Default reference coordinates

  const lastRecordedPointRef = useRef<{ lat: number; lng: number; time: number } | null>(null);
  const sessionStartTimeRef = useRef<Date | null>(null);

  // Compute derived values
  const distanceKm = Math.round((distanceMeters / 1000) * 100) / 100;
  const durationMinutes = durationSeconds / 60;
  
  // Pace in min/km
  const paceMinKm = distanceKm > 0.05 ? durationMinutes / distanceKm : 0;
  const formattedPace = formatPace(paceMinKm);

  // Calories based on MET calculations
  const caloriesBurned = Math.round(
    calculateCaloriesBurned(mode, Math.max(durationMinutes, 1), userWeightKg)
  );

  // Estimated steps based on mode and distance
  // Walking: ~1300 steps/km, Running: ~1100 steps/km, Cycling: 0
  const steps = mode === 'cycling' 
    ? 0 
    : Math.round(distanceKm * (mode === 'running' ? 1150 : 1350));

  // Timer Effect
  useEffect(() => {
    if (isTracking && !isPaused) {
      timerIntervalRef.current = setInterval(() => {
        setDurationSeconds((prev) => {
          const nextSec = prev + 1;
          if (distanceKm > 0 && nextSec > 0) {
            const avgSpeed = (distanceKm / (nextSec / 3600));
            setAverageSpeedKmh(Math.round(avgSpeed * 10) / 10);
          }
          return nextSec;
        });
      }, 1000);
    } else {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    }

    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [isTracking, isPaused, distanceKm]);

  // Handle incoming position from GPS or simulation
  const handleNewCoordinates = useCallback((coord: LocationCoord) => {
    const now = Date.now();
    setCurrentPosition(coord);

    if (lastRecordedPointRef.current) {
      const dist = calculateHaversineMeters(
        lastRecordedPointRef.current.lat,
        lastRecordedPointRef.current.lng,
        coord.lat,
        coord.lng
      );

      // Filter out GPS micro-jitter (< 2m) or unrealistic teleport jumps (> 500m in 1s)
      if (dist >= 2 && dist < 500) {
        setDistanceMeters((prev) => prev + dist);

        const timeDiffSec = (now - lastRecordedPointRef.current.time) / 1000;
        if (timeDiffSec > 0) {
          const instantSpeed = (dist / timeDiffSec) * 3.6; // convert m/s to km/h
          setCurrentSpeedKmh(Math.round(instantSpeed * 10) / 10);
        }

        const newPoint: GeoPoint = {
          lat: coord.lat,
          lng: coord.lng,
          timestamp: new Date().toISOString(),
        };

        setRoute((prev) => [...prev, newPoint]);
        lastRecordedPointRef.current = { lat: coord.lat, lng: coord.lng, time: now };
      }
    } else {
      // First point of session
      const newPoint: GeoPoint = {
        lat: coord.lat,
        lng: coord.lng,
        timestamp: new Date().toISOString(),
      };
      setRoute([newPoint]);
      lastRecordedPointRef.current = { lat: coord.lat, lng: coord.lng, time: now };
      simCenterRef.current = { lat: coord.lat, lng: coord.lng };
    }
  }, []);

  // Real GPS Watcher
  const startGpsWatch = useCallback(() => {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      setGpsStatus('unsupported');
      setErrorMessage('Geolocation is not supported by your browser.');
      return;
    }

    setGpsStatus('searching');
    setErrorMessage(null);

    const options: PositionOptions = {
      enableHighAccuracy: true,
      maximumAge: 1000,
      timeout: 12000,
    };

    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        setGpsStatus('active');
        const { latitude, longitude, accuracy, speed, heading, altitude } = pos.coords;

        handleNewCoordinates({
          lat: latitude,
          lng: longitude,
          accuracy,
          speed,
          heading,
          altitude,
        });
      },
      (err) => {
        console.warn('Geolocation watch error:', err.message);
        if (err.code === err.PERMISSION_DENIED) {
          setGpsStatus('denied');
          setErrorMessage('Location permission denied. Please allow location access or try Demo Simulation mode.');
        } else {
          setGpsStatus('searching');
        }
      },
      options
    );
  }, [handleNewCoordinates]);

  // Simulation Runner (for desktop/indoor testing)
  const startSimulationLoop = useCallback(() => {
    setIsSimulating(true);
    setGpsStatus('active');
    setErrorMessage(null);

    // Initial center if not already set
    if (!currentPosition) {
      setCurrentPosition({
        lat: simCenterRef.current.lat,
        lng: simCenterRef.current.lng,
        accuracy: 5,
        speed: mode === 'cycling' ? 5.8 : mode === 'running' ? 2.9 : 1.3,
      });
    }

    simulationIntervalRef.current = setInterval(() => {
      simAngleRef.current += mode === 'cycling' ? 0.05 : mode === 'running' ? 0.025 : 0.012;
      const angle = simAngleRef.current;

      // Elliptical pleasant circuit trajectory
      const radiusLat = 0.0035; // ~380m
      const radiusLng = 0.0055; // ~450m
      const lat = simCenterRef.current.lat + radiusLat * Math.sin(angle) + (Math.sin(angle * 3) * 0.0004);
      const lng = simCenterRef.current.lng + radiusLng * Math.cos(angle) + (Math.cos(angle * 2) * 0.0003);

      const targetSpeedKmh = mode === 'cycling' ? 22 : mode === 'running' ? 10.8 : 5.1;
      const speedJitter = (Math.random() - 0.5) * 0.8;

      handleNewCoordinates({
        lat,
        lng,
        accuracy: 4,
        speed: (targetSpeedKmh + speedJitter) / 3.6,
        heading: (angle * 180) / Math.PI + 90,
      });
    }, 1000);
  }, [currentPosition, handleNewCoordinates, mode]);

  // Initial location fetch (single preview without starting full tracking)
  useEffect(() => {
    if (typeof window !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const coord: LocationCoord = {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            accuracy: pos.coords.accuracy,
          };
          setCurrentPosition(coord);
          simCenterRef.current = { lat: coord.lat, lng: coord.lng };
        },
        () => {
          // Use default location
        },
        { enableHighAccuracy: true, timeout: 6000 }
      );
    }
  }, []);

  // Cleanup watchers on unmount
  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null && typeof window !== 'undefined' && navigator.geolocation) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
      if (simulationIntervalRef.current) clearInterval(simulationIntervalRef.current);
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, []);

  // Control Actions
  const startTracking = (simulate: boolean = false) => {
    setIsTracking(true);
    setIsPaused(false);
    sessionStartTimeRef.current = new Date();

    if (simulate) {
      startSimulationLoop();
    } else {
      setIsSimulating(false);
      startGpsWatch();
    }
  };

  const pauseTracking = () => {
    setIsPaused(true);
    if (simulationIntervalRef.current) {
      clearInterval(simulationIntervalRef.current);
      simulationIntervalRef.current = null;
    }
  };

  const resumeTracking = () => {
    setIsPaused(false);
    if (isSimulating) {
      startSimulationLoop();
    }
  };

  const stopTracking = (): ActivityRecord | null => {
    if (watchIdRef.current !== null && typeof window !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    if (simulationIntervalRef.current) {
      clearInterval(simulationIntervalRef.current);
      simulationIntervalRef.current = null;
    }
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }

    setIsTracking(false);
    setIsPaused(false);

    if (durationSeconds < 5 && distanceMeters < 10) {
      // Session too short
      return null;
    }

    const record: ActivityRecord = {
      id: 'gps_' + Date.now(),
      type: mode,
      startTime: sessionStartTimeRef.current
        ? sessionStartTimeRef.current.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        : new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      endTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      durationMinutes: Math.max(Math.round(durationSeconds / 60), 1),
      distanceKm,
      caloriesBurned,
      averageSpeedKmh: averageSpeedKmh || currentSpeedKmh,
      route,
      status: 'completed',
    };

    return record;
  };

  const resetTracking = () => {
    if (watchIdRef.current !== null && typeof window !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    if (simulationIntervalRef.current) clearInterval(simulationIntervalRef.current);
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);

    setIsTracking(false);
    setIsPaused(false);
    setIsSimulating(false);
    setRoute([]);
    setDurationSeconds(0);
    setDistanceMeters(0);
    setCurrentSpeedKmh(0);
    setAverageSpeedKmh(0);
    lastRecordedPointRef.current = null;
  };

  return {
    mode,
    setMode,
    isTracking,
    isPaused,
    isSimulating,
    gpsStatus,
    errorMessage,
    currentPosition,
    route,
    distanceKm,
    distanceMeters,
    durationSeconds,
    durationMinutes,
    currentSpeedKmh,
    averageSpeedKmh,
    paceMinKm,
    formattedPace,
    caloriesBurned,
    steps,
    startTracking,
    pauseTracking,
    resumeTracking,
    stopTracking,
    resetTracking,
  };
}
