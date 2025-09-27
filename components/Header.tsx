import React from 'react';
import type { User } from 'firebase/auth';
import { BellIcon } from './icons/Icons';
import { ProfileDropdown } from './ProfileDropdown';
import { ArrowUpTrayIcon } from './icons/Icons';

interface HeaderProps {
  user: User | null;
  onSignOut: () => void;
  onLoginClick: () => void;
  title: string;
  streak: number;
  onOpenNotifications: () => void;
}

export const Header: React.FC<HeaderProps> = ({ user, onSignOut, onLoginClick, title, streak, onOpenNotifications }) => {
  const streakTitle = streak > 0 
    ? `Twoja obecna passa to ${streak} ${streak === 1 ? 'dzień' : 'dni'}`
    : 'Wykonaj dziś akcję, aby rozpocząć passę!';

  return (
    <header className="bg-white/5 border-b border-white/10 backdrop-blur-sm shadow-lg sticky top-0 z-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center gap-3">
              <span className="text-2xl">🎯</span>
              <div>
                <span className="text-lg font-bold text-cloud-white tracking-tight">{title}</span>
                <span className="block text-xs text-system-grey md:hidden">Bartłomiej Szymocha</span>
                <span className="hidden text-xs text-system-grey md:block">Narzędzie od Bartłomiej Szymocha</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div 
              className="flex items-center gap-2 bg-white/10 border border-white/20 px-3 py-1.5 rounded-full animate-fade-in-up backdrop-blur-sm"
              title={streakTitle}
            >
              <span className="text-lg transition-all duration-300">🔥</span>
              <span className="font-bold text-cloud-white">{streak}</span>
              <span className="hidden sm:inline text-sm font-medium text-system-grey">Streak</span>
            </div>
             <button
              onClick={onOpenNotifications}
              className="hidden sm:block p-2 rounded-full bg-white/10 border border-white/20 text-system-grey hover:bg-white/20 hover:border-white/40 hover:text-cloud-white transition-all duration-200 backdrop-blur-sm"
              title="Ustawienia powiadomień"
              aria-label="Otwórz ustawienia powiadomień"
            >
                <BellIcon className="h-6 w-6" />
            </button>
            {user ? (
                <ProfileDropdown user={user} onSignOut={onSignOut} />
            ) : (
                <button
                    onClick={onLoginClick}
                    className="flex items-center gap-2 bg-electric-500 text-cloud-white font-bold py-2 px-4 rounded-lg shadow-md hover:bg-electric-600 transition-all duration-200 hover:scale-105 active:scale-95 text-sm"
                >
                    <ArrowUpTrayIcon className="h-5 w-5" />
                    <span className="sm:hidden">Zaloguj</span>
                    <span className="hidden sm:inline">Zaloguj się, aby synchronizować</span>
                </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};