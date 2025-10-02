import React, { useState } from 'react';
import { ArrowLeftIcon, SettingsIcon, PlusIcon, ListIcon, ZapIcon, HeartIcon, ClockIcon, TargetIcon } from './icons/LucideIcons';
import { WorkoutBuilder } from './WorkoutBuilder';
import { WorkoutManager } from './WorkoutManager';

interface AdminPageProps {
    onBack: () => void;
}

export const AdminPage: React.FC<AdminPageProps> = ({ onBack }) => {
    const [currentView, setCurrentView] = useState<'dashboard' | 'workout-builder' | 'workout-manager'>('dashboard');

    if (currentView === 'workout-builder') {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-space-950">
                <WorkoutBuilder onClose={() => setCurrentView('dashboard')} />
            </div>
        );
    }

    if (currentView === 'workout-manager') {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-space-950">
                <WorkoutManager onClose={() => setCurrentView('dashboard')} />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 dark:from-space-950 dark:via-space-900 dark:to-space-800">
            <div className="max-w-6xl mx-auto px-4 py-8">
                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                    <button
                        onClick={onBack}
                        className="flex items-center gap-2 text-gray-500 dark:text-system-grey hover:text-gray-700 dark:hover:text-cloud-white hover:bg-white/50 dark:hover:bg-space-800/50 transition-all duration-200 px-3 py-2 rounded-lg backdrop-blur-sm"
                    >
                        <ArrowLeftIcon className="h-5 w-5" />
                        <span>Powrót</span>
                    </button>
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-gradient-to-r from-electric-500/20 to-blue-500/20 backdrop-blur-sm">
                            <SettingsIcon className="h-6 w-6 text-electric-500" />
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-cloud-white">
                            Panel Administratora
                        </h1>
                    </div>
                </div>

                {/* Dashboard */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                    {/* Create Workout Card */}
                    <div className="backdrop-blur-xl bg-white/60 dark:bg-space-900/60 rounded-2xl border border-white/30 dark:border-space-700/30 p-6 shadow-xl hover:shadow-2xl transition-all duration-200 hover:scale-[1.02]">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 rounded-lg bg-gradient-to-r from-electric-500/20 to-blue-500/20 backdrop-blur-sm">
                                <PlusIcon className="h-6 w-6 text-electric-500" />
                            </div>
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-cloud-white">
                                Nowy trening
                            </h2>
                        </div>
                        <p className="text-gray-600 dark:text-system-grey mb-6">
                            Stwórz nowy trening interwałowy używając ćwiczeń z bazy danych. Trening zostanie zapisany jako nowa akcja.
                        </p>
                        <button
                            onClick={() => setCurrentView('workout-builder')}
                            className="w-full bg-gradient-to-r from-electric-500 to-blue-500 text-white font-medium py-3 px-4 rounded-xl hover:from-electric-600 hover:to-blue-600 transition-all duration-200 shadow-lg hover:shadow-xl"
                        >
                            Stwórz trening
                        </button>
                    </div>

                    {/* Manage Workouts Card */}
                    <div className="backdrop-blur-xl bg-white/60 dark:bg-space-900/60 rounded-2xl border border-white/30 dark:border-space-700/30 p-6 shadow-xl hover:shadow-2xl transition-all duration-200 hover:scale-[1.02]">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 rounded-lg bg-gradient-to-r from-blue-500/20 to-cyan-500/20 backdrop-blur-sm">
                                <ListIcon className="h-6 w-6 text-blue-500" />
                            </div>
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-cloud-white">
                                Zarządzaj treningami
                            </h2>
                        </div>
                        <p className="text-gray-600 dark:text-system-grey mb-6">
                            Przeglądaj i edytuj istniejące treningi. Zarządzaj uprawnieniami i widocznością.
                        </p>
                        <button
                            onClick={() => setCurrentView('workout-manager')}
                            className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-medium py-3 px-4 rounded-xl hover:from-blue-600 hover:to-cyan-600 transition-all duration-200 shadow-lg hover:shadow-xl"
                        >
                            Zarządzaj treningami
                        </button>
                    </div>

                    {/* Coming Soon Cards */}
                    <div className="backdrop-blur-xl bg-white/40 dark:bg-space-900/40 rounded-2xl border border-white/20 dark:border-space-700/20 p-6 shadow-lg opacity-75">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 rounded-lg bg-gradient-to-r from-purple-500/20 to-pink-500/20 backdrop-blur-sm">
                                <ZapIcon className="h-6 w-6 text-purple-500" />
                            </div>
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-cloud-white">
                                Reset Energetyczny
                            </h2>
                            <div className="ml-auto px-2 py-1 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full">
                                <span className="text-xs font-medium text-purple-600 dark:text-purple-400">Wkrótce</span>
                            </div>
                        </div>
                        <p className="text-gray-600 dark:text-system-grey mb-6">
                            Twórz specjalne protokoły resetu energetycznego z ćwiczeniami oddechowymi i relaksacyjnymi.
                        </p>
                        <button
                            disabled
                            className="w-full bg-gradient-to-r from-gray-400 to-gray-500 text-white font-medium py-3 px-4 rounded-xl cursor-not-allowed opacity-50"
                        >
                            Dostępne wkrótce
                        </button>
                    </div>

                    <div className="backdrop-blur-xl bg-white/40 dark:bg-space-900/40 rounded-2xl border border-white/20 dark:border-space-700/20 p-6 shadow-lg opacity-75">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 rounded-lg bg-gradient-to-r from-green-500/20 to-emerald-500/20 backdrop-blur-sm">
                                <HeartIcon className="h-6 w-6 text-green-500" />
                            </div>
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-cloud-white">
                                Ćwiczenia Oddechowe
                            </h2>
                            <div className="ml-auto px-2 py-1 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-full">
                                <span className="text-xs font-medium text-green-600 dark:text-green-400">Wkrótce</span>
                            </div>
                        </div>
                        <p className="text-gray-600 dark:text-system-grey mb-6">
                            Projektuj sekwencje ćwiczeń oddechowych z różnymi wzorcami i czasami trwania.
                        </p>
                        <button
                            disabled
                            className="w-full bg-gradient-to-r from-gray-400 to-gray-500 text-white font-medium py-3 px-4 rounded-xl cursor-not-allowed opacity-50"
                        >
                            Dostępne wkrótce
                        </button>
                    </div>

                    <div className="backdrop-blur-xl bg-white/40 dark:bg-space-900/40 rounded-2xl border border-white/20 dark:border-space-700/20 p-6 shadow-lg opacity-75">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 rounded-lg bg-gradient-to-r from-orange-500/20 to-red-500/20 backdrop-blur-sm">
                                <TargetIcon className="h-6 w-6 text-orange-500" />
                            </div>
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-cloud-white">
                                Protokoły Specjalne
                            </h2>
                            <div className="ml-auto px-2 py-1 bg-gradient-to-r from-orange-500/20 to-red-500/20 rounded-full">
                                <span className="text-xs font-medium text-orange-600 dark:text-orange-400">Wkrótce</span>
                            </div>
                        </div>
                        <p className="text-gray-600 dark:text-system-grey mb-6">
                            Zaawansowane protokoły łączące różne typy ćwiczeń w spersonalizowane programy treningowe.
                        </p>
                        <button
                            disabled
                            className="w-full bg-gradient-to-r from-gray-400 to-gray-500 text-white font-medium py-3 px-4 rounded-xl cursor-not-allowed opacity-50"
                        >
                            Dostępne wkrótce
                        </button>
                    </div>
                </div>

                {/* Stats */}
                <div className="backdrop-blur-xl bg-white/60 dark:bg-space-900/60 rounded-2xl border border-white/30 dark:border-space-700/30 p-6 shadow-xl">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 rounded-lg bg-gradient-to-r from-indigo-500/20 to-purple-500/20 backdrop-blur-sm">
                            <ClockIcon className="h-5 w-5 text-indigo-500" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-cloud-white">
                            Statystyki
                        </h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="text-center p-4 rounded-xl bg-gradient-to-r from-electric-500/10 to-blue-500/10 backdrop-blur-sm">
                            <div className="text-3xl font-bold text-electric-500 mb-2">0</div>
                            <div className="text-sm text-gray-600 dark:text-system-grey">Utworzone treningi</div>
                        </div>
                        <div className="text-center p-4 rounded-xl bg-gradient-to-r from-blue-500/10 to-cyan-500/10 backdrop-blur-sm">
                            <div className="text-3xl font-bold text-blue-500 mb-2">0</div>
                            <div className="text-sm text-gray-600 dark:text-system-grey">Aktywne treningi</div>
                        </div>
                        <div className="text-center p-4 rounded-xl bg-gradient-to-r from-green-500/10 to-emerald-500/10 backdrop-blur-sm">
                            <div className="text-3xl font-bold text-green-500 mb-2">0</div>
                            <div className="text-sm text-gray-600 dark:text-system-grey">Wykonania</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
