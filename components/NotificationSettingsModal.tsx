import React, { useState } from 'react';
import { XMarkIcon, BellIcon } from './icons/LucideIcons';
import type { NotificationSettings } from '../hooks/useNotifications';

interface NotificationSettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    permission: NotificationPermission;
    settings: NotificationSettings;
    requestPermission: () => void;
    updateSettings: (newSettings: Partial<NotificationSettings>) => void;
    addReminder: (time: string) => void;
    removeReminder: (time: string) => void;
    testNotification: () => void;
}

const SettingsSection: React.FC<{ title: string, children: React.ReactNode }> = ({ title, children }) => (
    <div className="border-t border-gray-200 dark:border-space-700 pt-4 mt-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-cloud-white mb-3">{title}</h3>
        {children}
    </div>
);

const ToggleSwitch: React.FC<{
    label: string;
    checked: boolean;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}> = ({ label, checked, onChange }) => (
     <div className="flex items-center justify-between bg-gray-100 dark:bg-space-800 p-3 rounded-lg border border-gray-200 dark:border-transparent">
        <span className="font-medium text-gray-900 dark:text-cloud-white">{label}</span>
        <label className="relative inline-flex items-center cursor-pointer">
            <input 
                type="checkbox" 
                className="sr-only peer"
                checked={checked}
                onChange={onChange}
            />
            <div className="w-11 h-6 bg-gray-300 dark:bg-space-700 rounded-full peer peer-focus:ring-2 peer-focus:ring-electric-500 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-electric-500"></div>
        </label>
    </div>
);

export const NotificationSettingsModal: React.FC<NotificationSettingsModalProps> = ({
    isOpen,
    onClose,
    permission,
    settings,
    requestPermission,
    updateSettings,
    addReminder,
    removeReminder,
    testNotification
}) => {
    const [newTime, setNewTime] = useState('12:00');

    if (!isOpen) return null;

    const handleAddTime = (e: React.FormEvent) => {
        e.preventDefault();
        if (newTime) {
            addReminder(newTime);
        }
    };
    
    const renderContent = () => {
        // Check if we're on iOS/Safari/Mac
        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
        const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
        const isMac = /Mac/.test(navigator.userAgent);
        const showIOSInstructions = (isIOS || isSafari) && permission === 'default';
        const showMacInstructions = isMac && permission === 'default';

        if (permission === 'denied') {
            return (
                <div className="text-center p-4 bg-gray-100 dark:bg-space-800 rounded-lg border border-gray-200 dark:border-transparent">
                    <p className="text-gray-900 dark:text-cloud-white">Powiadomienia są zablokowane w ustawieniach Twojej przeglądarki.</p>
                    <p className="text-gray-600 dark:text-system-grey text-sm mt-2">Aby włączyć powiadomienia, musisz zmienić ustawienia uprawnień dla tej strony.</p>
                </div>
            );
        }

        if (showIOSInstructions) {
            return (
                <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                    <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-3">📱 Instrukcje dla iPhone/iPad</h3>
                    <div className="text-left text-sm text-blue-800 dark:text-blue-200 space-y-2">
                        <p><strong>1.</strong> Kliknij przycisk "Udostępnij" w Safari (kwadrat z strzałką)</p>
                        <p><strong>2.</strong> Wybierz "Dodaj do ekranu głównego"</p>
                        <p><strong>3.</strong> Otwórz aplikację z ekranu głównego (nie z Safari!)</p>
                        <p><strong>4.</strong> Kliknij przycisk poniżej i wybierz "Zezwól"</p>
                    </div>
                    <button
                        onClick={requestPermission}
                        className="mt-4 bg-electric-500 text-white font-bold py-2 px-6 rounded-lg hover:bg-electric-600 transition-colors"
                    >
                        Włącz powiadomienia
                    </button>
                </div>
            );
        }

        if (showMacInstructions) {
            return (
                <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                    <h3 className="text-lg font-semibold text-green-900 dark:text-green-100 mb-3">💻 Instrukcje dla Mac</h3>
                    <div className="text-left text-sm text-green-800 dark:text-green-200 space-y-2">
                        <p><strong>1.</strong> Sprawdź czy tryb "Nie przeszkadzać" jest wyłączony</p>
                        <p><strong>2.</strong> System Preferences → Notifications & Focus</p>
                        <p><strong>3.</strong> Znajdź swoją przeglądarkę i włącz powiadomienia</p>
                        <p><strong>4.</strong> Kliknij przycisk poniżej i wybierz "Zezwól"</p>
                    </div>
                    <button
                        onClick={requestPermission}
                        className="mt-4 bg-electric-500 text-white font-bold py-2 px-6 rounded-lg hover:bg-electric-600 transition-colors"
                    >
                        Włącz powiadomienia
                    </button>
                </div>
            );
        }

        if (permission === 'default') {
            return (
                <div className="text-center">
                    <p className="text-gray-600 dark:text-system-grey mb-4">Włącz powiadomienia, aby otrzymywać przypomnienia o ocenie swojej energii w ciągu dnia.</p>
                    <button
                        onClick={requestPermission}
                        className="w-full bg-electric-500 text-white font-bold py-3 px-4 rounded-lg shadow-md hover:bg-electric-600 transition-transform duration-200 hover:scale-105 active:scale-95"
                    >
                        Włącz powiadomienia
                    </button>
                </div>
            );
        }

        // Permission is 'granted'
        return (
            <div>
                <ToggleSwitch 
                    label="Włącz przypomnienia"
                    checked={settings.enabled}
                    onChange={(e) => updateSettings({ enabled: e.target.checked })}
                />

                {/* Test notification button */}
                <div className="mt-4">
                    <button
                        onClick={testNotification}
                        className="w-full bg-blue-500 text-white font-medium py-2 px-4 rounded-lg shadow-sm hover:bg-blue-600 transition-colors duration-200 flex items-center justify-center gap-2"
                    >
                        <BellIcon className="h-4 w-4" />
                        Wyślij testowe powiadomienie
                    </button>
                </div>

                <div className={`mt-6 transition-opacity duration-300 ${settings.enabled ? 'opacity-100' : 'opacity-50 pointer-events-none'}`}>
                    <SettingsSection title="Tryb powiadomień">
                         <div className="flex gap-2 bg-gray-100 dark:bg-space-800 p-1 rounded-lg border border-gray-200 dark:border-transparent">
                            <button
                                onClick={() => updateSettings({ mode: 'fixed' })}
                                className={`w-1/2 py-2 text-sm font-bold rounded-md transition-colors ${settings.mode === 'fixed' ? 'bg-electric-500 text-white' : 'text-gray-600 dark:text-system-grey hover:bg-gray-200 dark:hover:bg-space-700'}`}
                            >
                                Stałe Godziny
                            </button>
                             <button
                                onClick={() => updateSettings({ mode: 'interval' })}
                                className={`w-1/2 py-2 text-sm font-bold rounded-md transition-colors ${settings.mode === 'interval' ? 'bg-electric-500 text-white' : 'text-gray-600 dark:text-system-grey hover:bg-gray-200 dark:hover:bg-space-700'}`}
                            >
                                Interwał
                            </button>
                        </div>
                    </SettingsSection>
                    
                    {settings.mode === 'fixed' ? (
                        <SettingsSection title="Godziny przypomnień">
                            <div className="flex flex-wrap gap-2 mb-4">
                                {settings.times.map(time => (
                                    <div key={time} className="bg-gray-100 dark:bg-space-800 rounded-full flex items-center gap-2 pl-3 pr-1 py-1 border border-gray-200 dark:border-transparent">
                                        <span className="font-mono text-sm text-gray-600 dark:text-system-grey">{time}</span>
                                        <button onClick={() => removeReminder(time)} className="bg-gray-200 dark:bg-space-700 hover:bg-danger-red/50 text-gray-600 dark:text-system-grey hover:text-white rounded-full p-0.5 transition">
                                            <XMarkIcon className="h-4 w-4" />
                                        </button>
                                    </div>
                                ))}
                                {settings.times.length === 0 && <p className="text-gray-600 dark:text-system-grey text-sm">Brak zaplanowanych przypomnień.</p>}
                            </div>
                            <form onSubmit={handleAddTime} className="flex items-center gap-3">
                                <input 
                                    type="time"
                                    value={newTime}
                                    onChange={(e) => setNewTime(e.target.value)}
                                    className="bg-gray-100 dark:bg-space-800 text-gray-900 dark:text-cloud-white rounded-lg p-2 text-base focus:ring-2 focus:ring-electric-500 focus:outline-none transition w-full border border-gray-200 dark:border-transparent"
                                />
                                <button type="submit" className="bg-electric-500 text-white font-bold py-2 px-4 rounded-lg shadow-md hover:bg-electric-600 transition">
                                    Dodaj
                                </button>
                            </form>
                        </SettingsSection>
                    ) : (
                         <SettingsSection title="Częstotliwość interwału">
                            <div className="flex items-center gap-3 bg-gray-100 dark:bg-space-800 p-3 rounded-lg border border-gray-200 dark:border-transparent">
                                <label htmlFor="interval-hours" className="text-gray-600 dark:text-system-grey">Przypominaj co</label>
                                <select 
                                    id="interval-hours"
                                    value={settings.interval}
                                    onChange={(e) => updateSettings({ interval: Number(e.target.value) })}
                                    className="bg-gray-200 dark:bg-space-700 text-gray-900 dark:text-cloud-white rounded-lg p-2 text-base focus:ring-2 focus:ring-electric-500 focus:outline-none transition"
                                >
                                    <option value="1">1</option>
                                    <option value="2">2</option>
                                    <option value="3">3</option>
                                    <option value="4">4</option>
                                </select>
                                <span className="text-gray-600 dark:text-system-grey">godziny</span>
                            </div>
                        </SettingsSection>
                    )}

                    <SettingsSection title="Godziny ciszy">
                         <ToggleSwitch
                            label="Nie przeszkadzać"
                            checked={settings.quietHours.enabled}
                            onChange={(e) => updateSettings({ quietHours: { ...settings.quietHours, enabled: e.target.checked } })}
                        />
                        <div className={`mt-3 flex items-center justify-center gap-4 transition-opacity duration-300 ${settings.quietHours.enabled ? 'opacity-100' : 'opacity-50 pointer-events-none'}`}>
                             <input 
                                type="time"
                                value={settings.quietHours.start}
                                onChange={(e) => updateSettings({ quietHours: { ...settings.quietHours, start: e.target.value } })}
                                className="bg-gray-100 dark:bg-space-800 text-gray-900 dark:text-cloud-white rounded-lg p-2 text-base focus:ring-2 focus:ring-electric-500 focus:outline-none transition w-full border border-gray-200 dark:border-transparent"
                            />
                            <span className="text-gray-600 dark:text-system-grey">do</span>
                             <input 
                                type="time"
                                value={settings.quietHours.end}
                                onChange={(e) => updateSettings({ quietHours: { ...settings.quietHours, end: e.target.value } })}
                                className="bg-gray-100 dark:bg-space-800 text-gray-900 dark:text-cloud-white rounded-lg p-2 text-base focus:ring-2 focus:ring-electric-500 focus:outline-none transition w-full border border-gray-200 dark:border-transparent"
                            />
                        </div>
                    </SettingsSection>
                </div>
            </div>
        );
    };

    return (
        <div 
            className="fixed inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center p-4"
            onClick={onClose}
        >
            <div 
                className="bg-white dark:bg-space-900 rounded-xl shadow-2xl w-full max-w-md p-6 relative animate-fade-in-up border border-gray-200 dark:border-transparent"
                onClick={(e) => e.stopPropagation()}
            >
                <button 
                    onClick={onClose} 
                    className="absolute top-4 right-4 text-gray-600 dark:text-system-grey hover:text-gray-900 dark:hover:text-cloud-white transition"
                    aria-label="Zamknij"
                >
                    <XMarkIcon className="h-6 w-6" />
                </button>
                
                <div className="flex flex-col items-center text-center mb-6">
                    <div className="bg-electric-500/10 rounded-full p-3 mb-3">
                        <BellIcon className="h-8 w-8 text-electric-500" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-cloud-white">Ustawienia Powiadomień</h2>
                </div>
                
                {renderContent()}

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
