import React, { useState } from 'react';
import { ArrowLeftIcon, SettingsIcon, PlusIcon, ListIcon } from './icons/LucideIcons';
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
        <div className="min-h-screen bg-gray-50 dark:bg-space-950">
            <div className="max-w-4xl mx-auto px-4 py-8">
                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                    <button
                        onClick={onBack}
                        className="flex items-center gap-2 text-gray-600 dark:text-system-grey hover:text-gray-900 dark:hover:text-cloud-white transition-colors"
                    >
                        <ArrowLeftIcon className="h-5 w-5" />
                        <span>Powrót</span>
                    </button>
                    <div className="flex items-center gap-3">
                        <SettingsIcon className="h-6 w-6 text-electric-500" />
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-cloud-white">
                            Panel Administratora
                        </h1>
                    </div>
                </div>

                {/* Dashboard */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Create Workout Card */}
                    <div className="bg-white dark:bg-space-900 rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-electric-500/10 rounded-lg">
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
                            className="w-full bg-electric-500 text-white font-medium py-3 px-4 rounded-lg hover:bg-electric-600 transition-colors"
                        >
                            Stwórz trening
                        </button>
                    </div>

                    {/* Manage Workouts Card */}
                    <div className="bg-white dark:bg-space-900 rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-blue-500/10 rounded-lg">
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
                            className="w-full bg-blue-500 text-white font-medium py-3 px-4 rounded-lg hover:bg-blue-600 transition-colors"
                        >
                            Zarządzaj treningami
                        </button>
                    </div>
                </div>

                {/* Stats */}
                <div className="mt-8 bg-white dark:bg-space-900 rounded-xl shadow-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-cloud-white mb-4">
                        Statystyki
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="text-center">
                            <div className="text-2xl font-bold text-electric-500">0</div>
                            <div className="text-sm text-gray-600 dark:text-system-grey">Utworzone treningi</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-blue-500">0</div>
                            <div className="text-sm text-gray-600 dark:text-system-grey">Aktywne treningi</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-green-500">0</div>
                            <div className="text-sm text-gray-600 dark:text-system-grey">Wykonania</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
