import { useState, useEffect, useCallback } from 'react';

const NOTIFICATIONS_SETTINGS_KEY = 'energy_os_notification_settings';

export interface NotificationSettings {
    enabled: boolean;
    mode: 'fixed' | 'interval';
    times: string[]; // "HH:MM" format for 'fixed' mode
    interval: number; // in hours for 'interval' mode
    quietHours: {
        enabled: boolean;
        start: string; // "HH:MM"
        end: string;   // "HH:MM"
    };
}

const getInitialSettings = (): NotificationSettings => {
    try {
        const item = window.localStorage.getItem(NOTIFICATIONS_SETTINGS_KEY);
        if (item) {
            const parsed = JSON.parse(item);
            // Basic validation and merging with defaults to handle schema changes
            const defaults: NotificationSettings = {
                enabled: false,
                mode: 'fixed',
                times: ['09:00', '13:00', '17:00'],
                interval: 2,
                quietHours: {
                    enabled: true,
                    start: '22:00',
                    end: '08:00'
                }
            };
            return { ...defaults, ...parsed, quietHours: { ...defaults.quietHours, ...(parsed.quietHours || {}) } };
        }
    } catch (error) {
        console.warn('Error reading notification settings from localStorage', error);
    }
    // Default settings
    return { 
        enabled: false, 
        mode: 'fixed',
        times: ['09:00', '13:00', '17:00'],
        interval: 2,
        quietHours: {
            enabled: true,
            start: '22:00',
            end: '08:00'
        }
    };
};

const isWithinQuietHours = (now: Date, quietHours: NotificationSettings['quietHours']): boolean => {
    if (!quietHours.enabled) return false;

    const currentTime = now.getHours() * 60 + now.getMinutes();
    
    const [startH, startM] = quietHours.start.split(':').map(Number);
    const startTime = startH * 60 + startM;

    const [endH, endM] = quietHours.end.split(':').map(Number);
    const endTime = endH * 60 + endM;

    // Handle overnight quiet hours (e.g., 22:00 - 08:00)
    if (startTime > endTime) {
        return currentTime >= startTime || currentTime < endTime;
    }
    // Handle same-day quiet hours (e.g., 09:00 - 17:00)
    else {
        return currentTime >= startTime && currentTime < endTime;
    }
};


export const useNotifications = () => {
    const [permission, setPermission] = useState<NotificationPermission>('default');
    const [settings, setSettings] = useState<NotificationSettings>(getInitialSettings);

    useEffect(() => {
        if ('Notification' in window) {
            setPermission(Notification.permission);
        }
    }, []);

    useEffect(() => {
        try {
            window.localStorage.setItem(NOTIFICATIONS_SETTINGS_KEY, JSON.stringify(settings));
        } catch (error) {
            console.warn('Error writing notification settings to localStorage', error);
        }
    }, [settings]);

    useEffect(() => {
        if (permission !== 'granted' || !settings.enabled) {
            return;
        }

        const intervalId = setInterval(() => {
            const now = new Date();
            if (isWithinQuietHours(now, settings.quietHours)) {
                return;
            }
            
            if (settings.mode === 'fixed') {
                 const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
                 if (settings.times.includes(currentTime)) {
                    new Notification('Resetuj ENERGIĘ', {
                        body: 'Jak Twoja energia? Czas na ocenę!',
                        icon: '/vite.svg',
                        tag: 'energy-check-in'
                    });
                 }
            } else { // Interval mode
                const minutes = now.getMinutes();
                if (minutes === 0) { // Check only on the hour
                    const [endQuietHour] = settings.quietHours.end.split(':').map(Number);
                    if ((now.getHours() - endQuietHour) % settings.interval === 0) {
                         new Notification('Resetuj ENERGIĘ', {
                            body: 'Jak Twoja energia? Czas na ocenę!',
                            icon: '/vite.svg',
                            tag: 'energy-check-in'
                        });
                    }
                }
            }

        }, 60000); // Check every minute

        return () => clearInterval(intervalId);
    }, [settings, permission]);


    const requestPermission = useCallback(async () => {
        if (!('Notification' in window)) {
            alert('Ta przeglądarka nie obsługuje powiadomień.');
            return;
        }

        const status = await Notification.requestPermission();
        setPermission(status);
        if (status === 'granted') {
            setSettings(prev => ({ ...prev, enabled: true }));
        }
    }, []);

    const updateSettings = useCallback((newSettings: Partial<NotificationSettings>) => {
        setSettings(prev => {
            const updated = { ...prev, ...newSettings };
            // If quietHours is partially updated, merge it
            if (newSettings.quietHours) {
                updated.quietHours = { ...prev.quietHours, ...newSettings.quietHours };
            }
            return updated;
        });
    }, []);
    
    const addReminder = useCallback((time: string) => {
        setSettings(prev => {
            if (prev.times.includes(time)) return prev;
            const newTimes = [...prev.times, time].sort();
            return { ...prev, times: newTimes };
        });
    }, []);

    const removeReminder = useCallback((timeToRemove: string) => {
        setSettings(prev => ({
            ...prev,
            times: prev.times.filter(time => time !== timeToRemove)
        }));
    }, []);


    return {
        permission,
        settings,
        requestPermission,
        updateSettings,
        addReminder,
        removeReminder
    };
};
