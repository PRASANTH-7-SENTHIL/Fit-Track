'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Footprints, Plus, Dumbbell, User } from 'lucide-react';

export default function MobileNav() {
  const pathname = usePathname();

  const navItems = [
    { name: 'Home', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Activity', href: '/activity', icon: Footprints },
    { name: 'Add Food', href: '/food-scanner', icon: Plus, isAction: true },
    { name: 'Workout', href: '/workouts', icon: Dumbbell },
    { name: 'Profile', href: '/profile', icon: User },
  ];

  return (
    <nav className="mobile-nav-footer lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-blue-100 dark:border-slate-800 px-4 py-2 shadow-lg shadow-blue-500/10 dark:shadow-none">
      <div className="flex items-center justify-around max-w-md mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          if (item.isAction) {
            return (
              <Link
                key={item.href}
                href={item.href}
                className="relative -top-5 flex flex-col items-center"
              >
                <div className="h-14 w-14 rounded-full bg-lime-400 text-slate-950 flex items-center justify-center shadow-lg shadow-lime-500/30 border-4 border-white dark:border-slate-900 hover:scale-105 active:scale-95 transition-transform">
                  <Icon className="h-7 w-7 stroke-[2.5]" />
                </div>
                <span className="text-[10px] font-bold text-lime-600 dark:text-lime-400 mt-0.5">
                  Scan Food
                </span>
              </Link>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-lg transition-colors ${
                isActive
                  ? 'text-blue-600 dark:text-lime-400 font-bold'
                  : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
            >
              <Icon className="h-5 w-5" />
              <span className="text-[10px] font-medium">{item.name}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
