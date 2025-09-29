import React, { useState, useEffect } from 'react';
import type { UserSettings } from '../types';
import { XMarkIcon, SunIcon, MoonIcon } from './icons/LucideIcons';

interface UserSettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (settings: UserSettings) => void;
    currentSettings: UserSettings;
}

export const UserSettingsModal: React.FC<UserSettingsModalProps> = ({ isOpen, onClose, onSave, currentSettings }) => {
    const [name, setName] = useState(currentSettings.name);
    const [theme, setTheme] = useState(currentSettings.theme);

    useEffect(() => {
        setName(currentSettings.name);
        setTheme(currentSettings.theme);
    }, [currentSettings]);

    if (!isOpen) {
        return null;
    }

    const handleSave = () => {
        onSave({ name, theme });
        onClose();
    };

    const activeThemeClasses = "bg-electric-500 text-cloud-white";
    const inactiveThemeClasses = "bg-space-800 text-system-grey hover:bg-space-700";

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-white dark:bg-space-900 rounded-xl shadow-2xl w-full max-w-md p-6 relative animate-fade-in-up" onClick={e => e.stopPropagation()}>
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 dark:text-system-grey hover:text-black dark:hover:text-cloud-white transition">
                    <XMarkIcon className="h-6 w-6" />
                </button>

                <h2 className="text-2xl font-bold text-space-950 dark:text-cloud-white text-center mb-6">Ustawienia</h2>

                <div className="space-y-6">
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-system-grey mb-2">
                            Twoje imię
                        </label>
                        <input
                            type="text"
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full bg-gray-100 dark:bg-space-800 text-space-950 dark:text-cloud-white rounded-lg p-3 text-sm focus:ring-2 focus:ring-electric-500 focus:outline-none transition"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-system-grey mb-2">
                            Motyw
                        </label>
                        <div className="flex gap-2 bg-gray-200 dark:bg-space-800 p-1 rounded-lg">
                            <button
                                onClick={() => setTheme('light')}
                                className={`w-1/2 py-2 px-4 rounded-md flex items-center justify-center gap-2 transition-colors ${theme === 'light' ? activeThemeClasses : inactiveThemeClasses}`}
                            >
                                <SunIcon className="h-5 w-5" />
                                Jasny
                            </button>
                            <button
                                onClick={() => setTheme('dark')}
                                className={`w-1/2 py-2 px-4 rounded-md flex items-center justify-center gap-2 transition-colors ${theme === 'dark' ? activeThemeClasses : inactiveThemeClasses}`}
                            >
                                <MoonIcon className="h-5 w-5" />
                                Ciemny
                            </button>
                        </div>
                    </div>
                </div>

                <div className="mt-8">
                    <button
                        onClick={handleSave}
                        className="w-full bg-electric-500 text-cloud-white font-bold py-3 px-4 rounded-lg shadow-md hover:bg-electric-600 transition-colors"
                    >
                        Zapisz zmiany
                    </button>
                </div>
            </div>
            <style>{`
                @keyframes fade-in-up {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in-up {
                    animation: fade-in-up 0.3s ease-out forwards;
                }
            `}</style>
        </div>
    );
};