import React from 'react';
import type { AppView } from '../types';
import { ChartBarIcon, BoltIcon, SparklesIcon } from './icons/Icons';

interface HeaderProps {
  currentView: AppView;
  setCurrentView: (view: AppView) => void;
}

export const Header: React.FC<HeaderProps> = ({ currentView, setCurrentView }) => {
  const navItemClasses = "flex flex-col sm:flex-row items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200";
  const activeClasses = "bg-electric-500 text-cloud-white";
  const inactiveClasses = "text-system-grey hover:bg-space-800 hover:text-cloud-white";

  return (
    <header className="bg-space-900 shadow-lg sticky top-0 z-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center gap-2">
              <SparklesIcon className="h-8 w-8 text-electric-500" />
              <span className="text-xl font-bold text-cloud-white tracking-tight">Energy Playbook</span>
            </div>
          </div>
          <nav className="flex items-center space-x-2 sm:space-x-4">
            <button
              onClick={() => setCurrentView('dashboard')}
              className={`${navItemClasses} ${currentView === 'dashboard' ? activeClasses : inactiveClasses}`}
            >
              <ChartBarIcon className="h-5 w-5" />
              <span className="hidden sm:inline">Dashboard</span>
            </button>
            <button
              onClick={() => setCurrentView('actionHub')}
              className={`${navItemClasses} ${currentView === 'actionHub' ? activeClasses : inactiveClasses}`}
            >
              <BoltIcon className="h-5 w-5" />
              <span className="hidden sm:inline">Narzędziownik energetyczny</span>
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
};