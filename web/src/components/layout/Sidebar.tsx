'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Footprints,
  Navigation,
  Dumbbell,
  History,
  ScanLine,
  Apple,
  FileText,
  Scale,
  UserCheck,
  Bot,
  User,
  Settings,
  LogOut,
  Sparkles,
  Sun,
  Moon,
  X,
} from 'lucide-react';
import { useAppStore } from '@/store';
import { logOut } from '@/lib/firebase';

interface SidebarProps {
  mobileOpen?: boolean;
  onClose?: () => void;
}

const navItems = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Activity Tracker', href: '/activity', icon: Footprints },
  { name: 'Running / GPS', href: '/running', icon: Navigation },
  { name: 'Workout Modes', href: '/workouts', icon: Dumbbell },
  { name: 'Workout History', href: '/workout-history', icon: History },
  { name: 'Food Scanner', href: '/food-scanner', icon: ScanLine },
  { name: 'Nutrition Diary', href: '/nutrition', icon: Apple },
  { name: 'Daily AI Report', href: '/daily-report', icon: FileText },
  { name: 'Weight Tracker', href: '/weight', icon: Scale },
  { name: 'AI Body Transform', href: '/body-transform', icon: UserCheck },
  { name: 'AI Fitness Assistant', href: '/ai-assistant', icon: Bot },
  { name: 'Profile', href: '/profile', icon: User },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export default function Sidebar({ mobileOpen = false, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { user, profile, setUser, setProfile, theme, toggleTheme } = useAppStore();

  const handleLogout = async () => {
    try {
      await logOut();
    } catch (e) {
      console.warn('Firebase signout error:', e);
    }
    setUser(null);
    setProfile(null);
    window.location.href = '/login';
  };

  return (
    <>
      {/* Mobile Drawer Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 lg:w-64 flex flex-col bg-slate-900 border-r border-slate-800 text-slate-100 select-none shadow-2xl transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="h-18 flex items-center justify-between gap-3 px-6 border-b border-slate-800/80">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-blue-600 to-lime-500 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <div>
              <span className="font-extrabold text-lg tracking-wider text-white">FITTRACK <span className="text-lime-400">AI</span></span>
              <p className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold">Smart Companion</p>
            </div>
          </div>

          {/* Close button on mobile */}
          {onClose && (
            <button
              onClick={onClose}
              className="lg:hidden p-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
              aria-label="Close Navigation Menu"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* User Quick Info */}
        <div className="p-4 mx-3 my-3 rounded-2xl bg-slate-800/60 border border-slate-700/50 flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center font-bold text-white text-sm shadow overflow-hidden shrink-0">
            {(profile?.photoURL || user?.photoURL) ? (
              <img
                src={profile?.photoURL || user?.photoURL}
                alt={profile?.fullName || 'Athlete'}
                className="h-full w-full object-cover"
              />
            ) : (
              profile?.fullName ? profile.fullName.charAt(0).toUpperCase() : (user?.displayName ? user.displayName.charAt(0).toUpperCase() : 'U')
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-white truncate">
              {profile?.fullName || user?.displayName || 'Fitness Athlete'}
            </p>
            <p className="text-[11px] text-lime-400 truncate font-medium">
              {profile?.fitnessGoal ? profile.fitnessGoal.replace('_', ' ').toUpperCase() : 'Ready to Transform'}
            </p>
          </div>
        </div>

        {/* Nav Menu */}
        <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => onClose?.()}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30 font-semibold'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/80'
                }`}
              >
                <Icon className={`h-4 w-4 ${isActive ? 'text-lime-300' : 'text-slate-400'}`} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </div>

        {/* Theme Toggle & Logout Action */}
        <div className="p-4 border-t border-slate-800 space-y-1.5">
          <button
            onClick={toggleTheme}
            className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors"
          >
            <span className="flex items-center gap-3">
              {theme === 'dark' ? <Moon className="h-4 w-4 text-blue-400" /> : <Sun className="h-4 w-4 text-amber-500" />}
              <span>{theme === 'dark' ? 'Dark Navy' : 'White & Light Blue'}</span>
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-slate-300">
              {theme === 'dark' ? 'Dark' : 'Light'}
            </span>
          </button>

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 transition-all active:scale-98"
            title="Log out of account"
          >
            <span className="flex items-center gap-2.5">
              <LogOut className="h-4 w-4" />
              <span>Log Out Account</span>
            </span>
            <span className="text-[10px] text-rose-300/80 font-mono">Exit</span>
          </button>
        </div>
      </aside>
    </>
  );
}
