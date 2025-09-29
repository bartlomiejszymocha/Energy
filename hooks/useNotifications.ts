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
    lastNotificationTime?: number; // timestamp of last notification for interval mode
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
                    try {
                        new Notification('Energy Playbook', {
                            body: 'Jak Twoja energia? Czas na ocenę!',
                            icon: '/favicon.ico',
                            tag: 'energy-check-in'
                        });
                        
                        // Update last notification time for fixed mode too
                        setSettings(prev => ({
                            ...prev,
                            lastNotificationTime: now.getTime()
                        }));
                    } catch (error) {
                        console.error('Błąd wysyłania powiadomienia:', error);
                    }
                 }
            } else { // Interval mode
                const minutes = now.getMinutes();
                if (minutes === 0) { // Check only on the hour
                    const currentTimestamp = now.getTime();
                    const lastNotification = settings.lastNotificationTime || 0;
                    const hoursSinceLastNotification = (currentTimestamp - lastNotification) / (1000 * 60 * 60);
                    
                    // Check if enough time has passed since last notification
                    if (hoursSinceLastNotification >= settings.interval) {
                        // Check if we're past quiet hours end time
                        const [endQuietHour, endQuietMinute] = settings.quietHours.end.split(':').map(Number);
                        const quietHoursEndTime = endQuietHour * 60 + endQuietMinute;
                        const currentTime = now.getHours() * 60 + now.getMinutes();
                        
                        // If quiet hours are overnight (end < start), check if we're past end time
                        const [startQuietHour, startQuietMinute] = settings.quietHours.start.split(':').map(Number);
                        const quietHoursStartTime = startQuietHour * 60 + startQuietMinute;
                        
                        let isPastQuietHours = false;
                        if (quietHoursStartTime > quietHoursEndTime) {
                            // Overnight quiet hours (e.g., 22:00 - 08:00)
                            isPastQuietHours = currentTime >= quietHoursEndTime;
                        } else {
                            // Same-day quiet hours (e.g., 09:00 - 17:00)
                            isPastQuietHours = currentTime >= quietHoursEndTime;
                        }
                        
                        if (isPastQuietHours) {
                            try {
                                new Notification('Energy Playbook', {
                                    body: 'Jak Twoja energia? Czas na ocenę!',
                                    icon: '/favicon.ico',
                                    tag: 'energy-check-in'
                                });
                                
                                // Update last notification time
                                setSettings(prev => ({
                                    ...prev,
                                    lastNotificationTime: currentTimestamp
                                }));
                            } catch (error) {
                                console.error('Błąd wysyłania powiadomienia:', error);
                            }
                        }
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

        // Check if we're on iOS and give special instructions
        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
        const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
        const isMac = /Mac/.test(navigator.userAgent);
        
        if (isIOS || isSafari) {
            // For iOS/Safari, we need to guide the user
            const userConfirmed = confirm(
                'Na iPhone/iPad:\n\n' +
                '1. Kliknij "Dodaj do ekranu głównego" w Safari\n' +
                '2. Następnie otwórz aplikację z ekranu głównego\n' +
                '3. Kliknij "Zezwól" na powiadomienia\n\n' +
                'Czy chcesz kontynuować?'
            );
            
            if (!userConfirmed) return;
        } else if (isMac) {
            // For Mac, give special instructions
            const userConfirmed = confirm(
                'Na Mac:\n\n' +
                '1. Sprawdź czy tryb "Nie przeszkadzać" jest wyłączony\n' +
                '2. Sprawdź ustawienia powiadomień w System Preferences\n' +
                '3. Kliknij "Zezwól" w przeglądarce\n\n' +
                'Czy chcesz kontynuować?'
            );
            
            if (!userConfirmed) return;
        }

        const status = await Notification.requestPermission();
        setPermission(status);
        
        if (status === 'granted') {
            setSettings(prev => ({ ...prev, enabled: true }));
            
            // Show success message with additional iOS instructions
            if (isIOS || isSafari) {
                setTimeout(() => {
                    alert('Powiadomienia włączone! 🎉\n\n' +
                          'Na iPhone: Upewnij się, że aplikacja jest zainstalowana na ekranie głównym dla najlepszej pracy powiadomień.');
                }, 500);
            }
        } else if (status === 'denied') {
            alert('Powiadomienia zostały zablokowane. Możesz je włączyć w ustawieniach przeglądarki.');
        }
    }, []);

    const updateSettings = useCallback((newSettings: Partial<NotificationSettings>) => {
        setSettings(prev => {
            const updated = { ...prev, ...newSettings };
            // If quietHours is partially updated, merge it
            if (newSettings.quietHours) {
                updated.quietHours = { ...prev.quietHours, ...newSettings.quietHours };
            }
            // Reset last notification time if interval or mode changed
            if (newSettings.interval || newSettings.mode) {
                updated.lastNotificationTime = undefined;
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


    const testNotification = useCallback(() => {
        if (permission !== 'granted') {
            alert('Najpierw włącz powiadomienia!');
            return;
        }
        
        // Check if we're on Mac and give special instructions
        const isMac = /Mac/.test(navigator.userAgent);
        
        try {
            const notification = new Notification('Energy Playbook - Test', {
                body: 'To jest testowe powiadomienie! 🎉',
                icon: '/favicon.ico',
                tag: 'test-notification',
                requireInteraction: true // Keep notification visible until clicked
            });
            
            // Add event listeners to track notification behavior
            notification.onclick = () => {
                console.log('Test notification clicked');
                notification.close();
            };
            
            notification.onshow = () => {
                console.log('Test notification shown');
            };
            
            notification.onerror = (error) => {
                console.error('Test notification error:', error);
                alert('Błąd wyświetlania powiadomienia. Sprawdź ustawienia systemowe.');
            };
            
            // For Mac, give additional instructions
            if (isMac) {
                setTimeout(() => {
                    const message = 'Testowe powiadomienie zostało wysłane.\n\n' +
                                   'Jeśli nie widzisz powiadomienia:\n' +
                                   '1. Sprawdź czy Mac nie jest w trybie "Nie przeszkadzać"\n' +
                                   '2. Sprawdź ustawienia powiadomień w System Preferences\n' +
                                   '3. Sprawdź ustawienia powiadomień w przeglądarce\n\n' +
                                   'Czy widzisz powiadomienie?';
                    const userSeesNotification = confirm(message);
                    
                    if (!userSeesNotification) {
                        alert('Rozwiązywanie problemów:\n\n' +
                              '1. System Preferences > Notifications & Focus\n' +
                              '2. Znajdź swoją przeglądarkę i włącz powiadomienia\n' +
                              '3. Sprawdź czy tryb "Do Not Disturb" jest wyłączony\n' +
                              '4. Spróbuj ponownie po odświeżeniu strony');
                    }
                }, 1000);
            }
            
        } catch (error) {
            console.error('Błąd wysyłania powiadomienia:', error);
            alert('Nie udało się wysłać powiadomienia. Sprawdź ustawienia przeglądarki i systemu.');
        }
    }, [permission]);

    return {
        permission,
        settings,
        requestPermission,
        updateSettings,
        addReminder,
        removeReminder,
        testNotification
    };
};
