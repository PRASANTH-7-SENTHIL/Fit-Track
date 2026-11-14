// ============================================================
// FitTrack AI - Physical Mobile Device Sensor Step Tracker
// Uses HTML5 DeviceMotionEvent / Accelerometer hardware sensors
// ============================================================
import { useAppStore, getTodayString } from '@/store';
import { calculateDistance, calculateCaloriesBurned } from '@/lib/calculations';
import { syncActivityToSql } from '@/lib/sql-sync';
import { syncDailyActivityToFirestore } from '@/lib/firebase';

interface SensorCallback {
  (data: { stepsToday: number; magnitude: number; isActive: boolean }): void;
}

class MobileStepSensorManager {
  private isListening = false;
  private lastStepTimestamp = 0;
  private lastSyncTimestamp = 0;
  private isPeak = false;
  private minStepIntervalMs = 280; // Maximum ~3.5 steps/second to prevent vibration false triggers
  private stepThreshold = 1.35; // Acceleration deviation threshold in m/s^2
  private gravity = 9.80665;
  private listeners: Set<SensorCallback> = new Set();
  private pendingSyncSteps = 0;

  // Initialize and automatically start listening if device supports motion
  public start() {
    if (typeof window === 'undefined' || this.isListening) return;

    // Check if DeviceMotionEvent exists
    if ('DeviceMotionEvent' in window) {
      // iOS 13+ requires explicit permission request
      const DeviceMotion = window.DeviceMotionEvent as any;
      if (typeof DeviceMotion.requestPermission === 'function') {
        // Handled via user tap gesture if required
      } else {
        this.attachEventListener();
      }
    }
  }

  public async requestPermissionAndStart(): Promise<boolean> {
    if (typeof window === 'undefined') return false;
    const DeviceMotion = window.DeviceMotionEvent as any;

    if (typeof DeviceMotion?.requestPermission === 'function') {
      try {
        const permission = await DeviceMotion.requestPermission();
        if (permission === 'granted') {
          this.attachEventListener();
          return true;
        }
        return false;
      } catch (err) {
        console.warn('[Sensor] Permission request failed:', err);
        return false;
      }
    } else {
      this.attachEventListener();
      return true;
    }
  }

  private attachEventListener() {
    if (this.isListening) return;
    this.handleMotionEvent = this.handleMotionEvent.bind(this);
    window.addEventListener('devicemotion', this.handleMotionEvent, { passive: true });
    this.isListening = true;
    this.notify({ stepsToday: this.getCurrentSteps(), magnitude: 0, isActive: true });
  }

  public stop() {
    if (!this.isListening || typeof window === 'undefined') return;
    window.removeEventListener('devicemotion', this.handleMotionEvent);
    this.isListening = false;
    this.notify({ stepsToday: this.getCurrentSteps(), magnitude: 0, isActive: false });
  }

  private handleMotionEvent(event: DeviceMotionEvent) {
    const acc = event.acceleration || event.accelerationIncludingGravity;
    if (!acc) return;

    const x = acc.x ?? 0;
    const y = acc.y ?? 0;
    const z = acc.z ?? 0;

    let magnitude = 0;
    if (event.acceleration && (acc.x !== null || acc.y !== null || acc.z !== null)) {
      // Direct linear acceleration without gravity
      magnitude = Math.sqrt(x * x + y * y + z * z);
    } else {
      // Acceleration including gravity: remove ~9.8m/s^2 baseline
      const totalAcc = Math.sqrt(x * x + y * y + z * z);
      magnitude = Math.abs(totalAcc - this.gravity);
    }

    const now = Date.now();

    // Peak detection with hysteresis & time threshold
    if (magnitude > this.stepThreshold && !this.isPeak) {
      if (now - this.lastStepTimestamp > this.minStepIntervalMs) {
        this.isPeak = true;
        this.lastStepTimestamp = now;
        this.onStepDetected(magnitude);
      }
    } else if (magnitude < this.stepThreshold * 0.7) {
      this.isPeak = false;
    }

    // Notify UI listeners of current live acceleration
    this.notify({
      stepsToday: this.getCurrentSteps(),
      magnitude: Math.round(magnitude * 100) / 100,
      isActive: this.isListening,
    });
  }

  private onStepDetected(magnitude: number) {
    const store = useAppStore.getState();
    const user = store.user;
    const profile = store.profile;
    const today = getTodayString();

    const currentActivity = store.todayActivity || {
      uid: user?.uid || 'athlete_01',
      date: today,
      steps: 0,
      distanceKm: 0,
      activeMinutes: 0,
      caloriesBurned: 0,
      activities: [],
    };

    const newSteps = (currentActivity.steps || 0) + 1;
    const heightCm = profile?.heightCm || 175;
    const weightKg = profile?.weightKg || 74;

    // Real bio-mechanical formulas
    const newDistance = calculateDistance(newSteps, heightCm);
    const stepCalories = Math.round(newSteps * 0.04);
    const newActiveMins = Math.max(currentActivity.activeMinutes, Math.floor(newSteps / 100));

    const updatedActivity = {
      ...currentActivity,
      steps: newSteps,
      distanceKm: newDistance,
      caloriesBurned: stepCalories,
      activeMinutes: newActiveMins,
    };

    // Update global store state immediately
    store.setTodayActivity(updatedActivity);

    this.pendingSyncSteps++;
    const now = Date.now();

    // Debounced network persistence (sync to SQL & Firebase every 4 seconds or 10 steps)
    if (now - this.lastSyncTimestamp > 4000 || this.pendingSyncSteps >= 10) {
      this.lastSyncTimestamp = now;
      this.pendingSyncSteps = 0;

      if (user?.uid) {
        syncActivityToSql(user.uid, updatedActivity);
        if (!user.uid.startsWith('demo_')) {
          syncDailyActivityToFirestore(user.uid, today, updatedActivity);
        }
      }
    }
  }

  private getCurrentSteps(): number {
    return useAppStore.getState().todayActivity?.steps || 0;
  }

  public subscribe(cb: SensorCallback): () => void {
    this.listeners.add(cb);
    cb({ stepsToday: this.getCurrentSteps(), magnitude: 0, isActive: this.isListening });
    return () => {
      this.listeners.delete(cb);
    };
  }

  private notify(data: { stepsToday: number; magnitude: number; isActive: boolean }) {
    for (const listener of this.listeners) {
      try {
        listener(data);
      } catch (err) {
        // ignore listener error
      }
    }
  }

  public getStatus() {
    return {
      isListening: this.isListening,
      stepsToday: this.getCurrentSteps(),
    };
  }
}

export const mobileStepSensor = new MobileStepSensorManager();
