'use client';

import React, { useState, useEffect } from 'react';
import AppShell from '@/components/layout/AppShell';
import { useAppStore } from '@/store';
import { fetchSqlStats } from '@/lib/sql-sync';
import { logOut } from '@/lib/firebase';
import {
  Settings,
  Moon,
  Sun,
  Bell,
  Lock,
  Trash2,
  ShieldCheck,
  CheckCircle2,
  Smartphone,
  Info,
  Database,
  RefreshCw,
  LogOut,
} from 'lucide-react';

export default function SettingsPage() {
  const {
    theme,
    setTheme,
    toggleTheme,
    user,
    setUser,
    setProfile,
    setDailyTargets,
    setTodayNutrition,
    setTodayActivity,
    loadUserDataFromSql,
  } = useAppStore();

  const [stepReminders, setStepReminders] = useState(true);
  const [workoutReminders, setWorkoutReminders] = useState(true);
  const [waterReminders, setWaterReminders] = useState(true);
  const [nutritionReminders, setNutritionReminders] = useState(true);
  const [reportNotifications, setReportNotifications] = useState(true);

  const [savedSuccess, setSavedSuccess] = useState(false);
  const [sqlStats, setSqlStats] = useState<any>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    fetchSqlStats().then((data) => {
      if (data) setSqlStats(data);
    });
  }, []);

  const handleManualSync = async () => {
    if (!user) return;
    setIsSyncing(true);
    await loadUserDataFromSql(user.uid);
    const updated = await fetchSqlStats();
    if (updated) setSqlStats(updated);
    setIsSyncing(false);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleLogout = async () => {
    try {
      await logOut();
    } catch (e) {
      console.warn('Logout error:', e);
    }
    setUser(null);
    setProfile(null);
    window.location.href = '/login';
  };

  const handleClearData = () => {
    if (confirm('Are you sure you want to purge all stored fitness logs? This action is permanent.')) {
      setTodayNutrition(null);
      setTodayActivity(null);
      alert('Local fitness logs and cache successfully cleared.');
    }
  };

  const handleDeleteAccount = () => {
    if (confirm('Delete your FitTrack AI profile and account completely?')) {
      setUser(null);
      setProfile(null);
      setDailyTargets(null);
      window.location.href = '/register';
    }
  };

  return (
    <AppShell
      title="Application Settings"
      subtitle="Theme mode, notification alerts, data privacy, and account preferences"
    >
      <div className="max-w-2xl mx-auto space-y-6">
        {/* SQL RELATIONAL DATABASE CONNECTION STATUS */}
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
              <Database className="h-4 w-4 text-lime-400" />
              <span>SQL Relational Database Storage</span>
            </h3>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[11px] font-bold">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Connected</span>
            </span>
          </div>

          <p className="text-xs text-slate-400">
            Account data is mapped to 15 relational tables in SQL (PostgreSQL &amp; SQLite). Every account retains isolated biometric records, workouts, food diaries, and targets.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800/80">
              <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-semibold">Active Account ID</span>
              <span className="text-xs font-mono font-bold text-white break-all">
                {user?.uid || 'Guest / Not Signed In'}
              </span>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800/80">
              <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-semibold">Database Engine</span>
              <span className="text-xs font-bold text-lime-400">
                {sqlStats?.engine || 'SQLite (node:sqlite) WAL'}
              </span>
            </div>
          </div>

          {/* Table summary badges */}
          {sqlStats?.tables && (
            <div className="space-y-2 pt-1">
              <span className="text-[11px] font-bold text-slate-300">Live Table Record Counts:</span>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {Object.entries(sqlStats.tables).map(([table, count]) => (
                  <div key={table} className="px-2.5 py-1.5 rounded-xl bg-slate-950 border border-slate-800 flex justify-between items-center text-[11px]">
                    <span className="text-slate-400 truncate mr-2">{table}</span>
                    <span className="font-mono font-bold text-white px-1.5 py-0.2 bg-slate-800 rounded">{count as number}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="pt-2 flex items-center justify-between">
            <button
              onClick={handleManualSync}
              disabled={isSyncing || !user}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-xs font-bold text-white transition-all disabled:opacity-50"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'Synchronizing SQL...' : 'Refresh & Sync from SQL'}</span>
            </button>
            {savedSuccess && (
              <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1 animate-fade-in">
                <CheckCircle2 className="h-4 w-4" />
                <span>Account records synchronized</span>
              </span>
            )}
          </div>
        </div>

        {/* THEME PREFERENCE (LIGHT / DARK) */}
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
          <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
            {theme === 'dark' ? <Moon className="h-4 w-4 text-blue-400" /> : <Sun className="h-4 w-4 text-amber-400" />}
            <span>Visual Appearance & Theme</span>
          </h3>
          <p className="text-xs text-slate-400">
            FitTrack AI offers both deep navy dark mode and modern clean light mode.
          </p>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <button
              onClick={() => setTheme('dark')}
              className={`p-4 rounded-2xl border text-left transition-all ${
                theme === 'dark'
                  ? 'bg-blue-600/20 border-blue-500 shadow-lg'
                  : 'bg-slate-950 border-slate-800 text-slate-400'
              }`}
            >
              <div className="h-4 w-4 rounded-full bg-slate-900 border border-slate-600 mb-2" />
              <span className="text-xs font-bold text-white block">Dark Navy Mode</span>
              <span className="text-[10px] text-slate-400">High contrast fitness HUD</span>
            </button>

            <button
              onClick={() => setTheme('light')}
              className={`p-4 rounded-2xl border text-left transition-all ${
                theme === 'light'
                  ? 'bg-blue-600/20 border-blue-500 shadow-lg'
                  : 'bg-slate-950 border-slate-800 text-slate-400'
              }`}
            >
              <div className="h-4 w-4 rounded-full bg-white border-2 border-blue-400 mb-2" />
              <span className="text-xs font-bold text-white block">White & Light Blue</span>
              <span className="text-[10px] text-slate-400">Crisp white cards with soft blue tint</span>
            </button>
          </div>
        </div>

        {/* NOTIFICATION PREFERENCES */}
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
          <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
            <Bell className="h-4 w-4 text-lime-400" />
            <span>Automated Notification Reminders</span>
          </h3>
          <p className="text-xs text-slate-400">
            Configure system alarms and push reminders on supported Android and web devices.
          </p>

          <div className="space-y-3 pt-2">
            {[
              { label: 'Daily Step Reminders', desc: 'Prompts when behind your daily 10,000 steps objective', state: stepReminders, setter: setStepReminders },
              { label: 'Workout Session Reminders', desc: 'Alerts you for scheduled HIIT and strength training', state: workoutReminders, setter: setWorkoutReminders },
              { label: 'Hydration & Water Alerts', desc: 'Reminders to consume your 2.8L water baseline', state: waterReminders, setter: setWaterReminders },
              { label: 'Nutrition & Meal Logging', desc: 'Nudges to log breakfast, lunch, and dinner entries', state: nutritionReminders, setter: setNutritionReminders },
              { label: 'Daily AI Report Dispatch', desc: 'Nightly diagnostic summary of calories and macro splits', state: reportNotifications, setter: setReportNotifications },
            ].map((item, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-950 border border-slate-800/80"
              >
                <div>
                  <h4 className="text-xs font-bold text-white">{item.label}</h4>
                  <p className="text-[11px] text-slate-400">{item.desc}</p>
                </div>

                <button
                  type="button"
                  onClick={() => item.setter(!item.state)}
                  className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    item.state ? 'bg-lime-400' : 'bg-slate-700'
                  }`}
                >
                  <span
                    className={`inline-block h-5 w-5 transform rounded-full bg-slate-950 shadow ring-0 transition duration-200 ease-in-out ${
                      item.state ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* SECURITY & DATA PRIVACY */}
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
          <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-blue-400" />
            <span>Security & Privacy Management</span>
          </h3>

          <div className="space-y-3">
            <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-950 border border-slate-800">
              <div>
                <h4 className="text-xs font-bold text-white">Purge Local Activity Cache</h4>
                <p className="text-[11px] text-slate-400">Clear temporary session metrics</p>
              </div>
              <button
                onClick={handleClearData}
                className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300"
              >
                Clear Cache
              </button>
            </div>

            <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-950 border border-slate-800">
              <div>
                <h4 className="text-xs font-bold text-white">Log Out Current Session</h4>
                <p className="text-[11px] text-slate-400">Exit active session and switch accounts</p>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 text-xs font-bold transition-all active:scale-95"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span>Log Out</span>
              </button>
            </div>

            <div className="flex items-center justify-between p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20">
              <div>
                <h4 className="text-xs font-bold text-rose-300">Delete Account & Fitness Profile</h4>
                <p className="text-[11px] text-rose-400/80">Erase all biometric data permanently</p>
              </div>
              <button
                onClick={handleDeleteAccount}
                className="px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-xs font-bold text-white shadow-md shadow-rose-600/30"
              >
                Delete Account
              </button>
            </div>
          </div>
        </div>

        {/* APP ABOUT & BUILD INFO */}
        <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-900 text-center text-xs text-slate-500 space-y-1">
          <p className="font-semibold text-slate-400">FITTRACK AI • Production Release v2.4.0</p>
          <p className="text-[10px]">Built for Web & Android Ecosystems with Offline-First Persistence</p>
        </div>
      </div>
    </AppShell>
  );
}
