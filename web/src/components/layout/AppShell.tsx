'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/layout/Sidebar';
import MobileNav from '@/components/layout/MobileNav';
import { useAppStore } from '@/store';
import { Bell, Moon, Sun, Sparkles, LogOut, Menu } from 'lucide-react';
import Link from 'next/link';
import { subscribeToAuth, logOut } from '@/lib/firebase';
import { mobileStepSensor } from '@/lib/sensor-step-tracker';

interface AppShellProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  headerAction?: React.ReactNode;
}

export default function AppShell({
  children,
  title,
  subtitle,
  headerAction,
}: AppShellProps) {
  const router = useRouter();
  const { user, profile, theme, toggleTheme, setUser, setProfile } = useAppStore();
  const [mounted, setMounted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    setMounted(true);

    // Auto-start physical motion sensor in the background
    if (typeof window !== 'undefined') {
      mobileStepSensor.start();
    }

    const unsubscribe = subscribeToAuth((fbUser) => {
      if (fbUser) {
        useAppStore.getState().setUser({
          uid: fbUser.uid,
          email: fbUser.email || 'athlete@fittrack.ai',
          displayName: fbUser.displayName || fbUser.email?.split('@')[0] || 'Athlete',
          photoURL: fbUser.photoURL || undefined,
          createdAt: fbUser.metadata.creationTime || new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          onboardingComplete: true,
          providers: fbUser.providerData.map((p) => p.providerId),
        });
      }
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await logOut();
    } catch (e) {
      console.warn('Logout error:', e);
    }
    setUser(null);
    setProfile(null);
    router.push('/login');
  };

  useEffect(() => {
    if (mounted && !user) {
      router.push('/login');
    }
  }, [mounted, user, router]);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm font-semibold tracking-wider text-slate-300">FITTRACK AI LOADING...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col antialiased">
      <Sidebar
        mobileOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
      />

      {/* Main Content Area */}
      <div className="lg:pl-64 flex flex-col flex-1 pb-20 lg:pb-8">
        {/* Top Header Bar */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-800 bg-slate-900/80 backdrop-blur-md px-3 sm:px-6">
          <div className="flex items-center gap-2.5 sm:gap-3">
            {/* Mobile Hamburger Menu Button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 border border-slate-700/80 text-slate-300 hover:text-white transition-all active:scale-95 shadow-sm"
              aria-label="Open Navigation Menu"
              title="Open Navigation Menu"
            >
              <Menu className="h-5 w-5 text-lime-400" />
            </button>

            <div className="flex flex-col">
              <h1 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                {title || 'FitTrack AI'}
                {title === 'Dashboard' && (
                  <span className="text-[10px] font-semibold bg-lime-400/20 text-lime-400 border border-lime-400/30 px-2 py-0.5 rounded-full">
                    LIVE
                  </span>
                )}
              </h1>
              {subtitle && (
                <p className="text-[11px] text-slate-400 hidden sm:block">{subtitle}</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {headerAction}

            {/* Quick theme toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl bg-slate-800/80 border border-slate-700 text-slate-300 hover:text-white transition-colors"
              title="Toggle Theme"
            >
              {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>

            {/* Notifications */}
            <Link
              href="/settings"
              className="p-2 rounded-xl bg-slate-800/80 border border-slate-700 text-slate-300 hover:text-white relative transition-colors"
            >
              <Bell className="h-4 w-4" />
              <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-lime-400" />
            </Link>

            {/* Profile Avatar / Quick Link */}
            <Link
              href="/profile"
              className="flex items-center gap-2 p-1.5 pr-3 rounded-xl bg-slate-800/80 border border-slate-700/80 hover:border-slate-600 transition-colors"
            >
              <div className="h-7 w-7 rounded-lg bg-gradient-to-tr from-blue-600 to-lime-500 flex items-center justify-center text-xs font-bold text-white">
                {profile?.fullName?.charAt(0) || 'A'}
              </div>
              <span className="text-xs font-medium text-slate-200 hidden md:block">
                {profile?.fullName?.split(' ')[0] || 'Athlete'}
              </span>
            </Link>

            {/* Account Logout Button */}
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 py-1.5 px-2.5 sm:px-3 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 text-xs font-bold transition-all active:scale-95"
              title="Logout from FitTrack AI"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-6 max-w-7xl w-full mx-auto animate-fade-in">
          {children}
        </main>
      </div>

      <MobileNav />
    </div>
  );
}
