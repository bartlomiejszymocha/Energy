import React from 'react';
import { ArrowLeftIcon, SettingsIcon } from './icons/LucideIcons';

interface AdminPageProps {
    onBack: () => void;
}

export const AdminPage: React.FC<AdminPageProps> = ({ onBack }) => {
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

                {/* Content */}
                <div className="bg-white dark:bg-space-900 rounded-xl shadow-lg p-6 sm:p-8">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-cloud-white mb-4">
                        Tworzenie treningów
                    </h2>
                    <p className="text-gray-600 dark:text-system-grey mb-6">
                        Tutaj będzie możliwość tworzenia i zarządzania dodatkowymi treningami.
                    </p>
                    
                    <div className="bg-gray-50 dark:bg-space-800 rounded-lg p-4">
                        <p className="text-sm text-gray-500 dark:text-system-grey/70">
                            🚧 Funkcjonalność w przygotowaniu...
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};
