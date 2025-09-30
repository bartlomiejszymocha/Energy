import React from 'react';
import type { User } from 'firebase/auth';
import { BellIcon, SunIcon, MoonIcon, FlameIcon } from './icons/LucideIcons';
import { ProfileDropdown } from './ProfileDropdown';
import { ArrowUpTrayIcon } from './icons/LucideIcons';
import { useTheme } from '../hooks/useTheme';

interface HeaderProps {
  user: User | null;
  onSignOut: () => void;
  onLoginClick: () => void;
  title: string;
  streak: number;
  onOpenNotifications: () => void;
}

export const Header: React.FC<HeaderProps> = ({ user, onSignOut, onLoginClick, title, streak, onOpenNotifications }) => {
  const { theme, toggleTheme, isDark } = useTheme();
  
  const streakTitle = streak > 0 
    ? `Twoja obecna passa to ${streak} ${streak === 1 ? 'dzień' : 'dni'}`
    : 'Wykonaj dziś akcję, aby rozpocząć passę!';

  return (
    <header className="bg-white/80 dark:bg-space-800/80 border-b border-gray-200 dark:border-white/10 shadow-lg sticky top-0 z-50 backdrop-blur-sm" style={{ willChange: 'transform', transform: 'translateZ(0)' }}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-14 items-center justify-between gap-6 sm:gap-8">
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center gap-1.5 sm:gap-2">
              <img 
                src="https://firebasestorage.googleapis.com/v0/b/energy-playbook.firebasestorage.app/o/logoDES%20(1).png?alt=media&token=71219723-d4ca-4fa4-9c46-eb224a715a10" 
                alt="Energy Playbook Logo" 
                className="h-9 w-9 sm:h-8 sm:w-8 object-contain"
              />
              <div>
                <span className="text-base font-bold text-gray-900 dark:text-cloud-white tracking-tight">{title}</span>
                <span className="block text-xs text-gray-600 dark:text-system-grey md:hidden">Bartłomiej Szymocha</span>
                <span className="hidden text-xs text-gray-600 dark:text-system-grey md:block">Narzędzie od Bartłomiej Szymocha</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1 sm:gap-2 md:gap-3 ml-4 sm:ml-6">
            <div 
              className="flex items-center gap-1 sm:gap-2 bg-gray-100 dark:bg-space-900 border border-gray-200 dark:border-white/20 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full animate-fade-in-up min-h-[36px]"
              title={streakTitle}
            >
              <FlameIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-orange-500" />
              <span className="font-bold text-xs sm:text-sm text-gray-900 dark:text-cloud-white">{streak}</span>
              <span className="hidden sm:inline text-xs font-medium text-gray-600 dark:text-system-grey">Streak</span>
            </div>
            <button
              onClick={toggleTheme}
              className="p-1.5 sm:p-2 rounded-full bg-gray-100 dark:bg-space-900 border border-gray-200 dark:border-white/20 text-gray-600 dark:text-system-grey hover:bg-gray-200 dark:hover:bg-space-800 hover:border-gray-300 dark:hover:border-white/40 hover:text-gray-900 dark:hover:text-cloud-white transition-all duration-200 min-w-[36px] min-h-[36px] flex items-center justify-center"
              title={`Przełącz na ${isDark ? 'light' : 'dark'} mode`}
              aria-label={`Przełącz na ${isDark ? 'light' : 'dark'} mode`}
            >
                {isDark ? <SunIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4" /> : <MoonIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />}
            </button>
            <button
              onClick={onOpenNotifications}
              className="p-1.5 sm:p-2 rounded-full bg-gray-100 dark:bg-space-900 border border-gray-200 dark:border-white/20 text-gray-600 dark:text-system-grey hover:bg-gray-200 dark:hover:bg-space-800 hover:border-gray-300 dark:hover:border-white/40 hover:text-gray-900 dark:hover:text-cloud-white transition-all duration-200 min-w-[36px] min-h-[36px] flex items-center justify-center"
              title="Ustawienia powiadomień"
              aria-label="Otwórz ustawienia powiadomień"
            >
                <BellIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </button>
            {user ? (
                <ProfileDropdown user={user} onSignOut={onSignOut} />
            ) : (
                <button
                    onClick={onLoginClick}
                    className="flex items-center gap-2 bg-electric-500 text-white font-bold py-2 px-4 rounded-lg shadow-md hover:bg-electric-600 transition-all duration-200 hover:scale-105 active:scale-95 text-sm"
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