import { useState, useEffect, useCallback } from 'react';
import type { UserSettings, Theme } from '../types';

const SETTINGS_STORAGE_KEY = 'energy_os_user_settings';

const getInitialSettings = (): UserSettings => {
    try {
        const item = window.localStorage.getItem(SETTINGS_STORAGE_KEY);
        if (item) {
            return JSON.parse(item);
        }
    } catch (error) {
        console.warn('Error reading settings from localStorage', error);
    }

    return {
        name: 'Lider',
        theme: 'dark',
    };
};

export const useUserSettings = () => {
    const [settings, setSettings] = useState<UserSettings>(getInitialSettings);

    useEffect(() => {
        try {
            window.localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
        } catch (error) {
            console.warn('Error writing settings to localStorage', error);
        }

        // Apply theme
        const root = window.document.documentElement;
        if (settings.theme === 'dark') {
            root.classList.add('dark');
        } else {
            root.classList.remove('dark');
        }
    }, [settings]);

    const saveSettings = useCallback((newSettings: Partial<UserSettings>) => {
        setSettings(prev => ({ ...prev, ...newSettings }));
    }, []);

    return { settings, saveSettings };
};