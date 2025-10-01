import React, { useState, useRef, useEffect } from 'react';
import { XMarkIcon, InformationCircleIcon } from './icons/LucideIcons';

interface LogEnergyModalProps {
    onClose: () => void;
    onSave: (rating: number | undefined, note: string, timestamp: number, meal?: boolean) => void;
    onOpenGuide?: () => void;
}

export const LogEnergyModal: React.FC<LogEnergyModalProps> = ({ onClose, onSave, onOpenGuide }) => {
    const [rating, setRating] = useState<number>(0);
    const [note, setNote] = useState('');
    const [logDate, setLogDate] = useState(new Date());
    const [isEditingTime, setIsEditingTime] = useState(false);
    const [hasMeal, setHasMeal] = useState(false);
    const [hasSeenGuide, setHasSeenGuide] = useState(() => {
        return localStorage.getItem('energy-guide-seen') === 'true';
    });
    const noteInputRef = useRef<HTMLTextAreaElement>(null);

    // Automatically focus the textarea when the modal opens and reset state
    useEffect(() => {
        setLogDate(new Date());
        const timer = setTimeout(() => {
            noteInputRef.current?.focus({ preventScroll: true });
        }, 100); 

        return () => clearTimeout(timer);
    }, []);


    const RATING_CONFIG: { [key: number]: { color: string; label: string } } = {
        1: { color: 'bg-danger-red', label: 'Przetrwanie' },
        2: { color: 'bg-alert-orange', label: 'Autopilot' },
        3: { color: 'bg-warning-yellow', label: 'Stabilnie' },
        4: { color: 'bg-success-green', label: 'Focus' },
        5: { color: 'bg-cyan-500', label: 'Flow' },
    };
    
    const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            if (rating > 0 || note.trim() !== '' || hasMeal) {
                onSave(rating > 0 ? rating : undefined, note, logDate.getTime(), hasMeal);
            }
            return;
        }

        if (note === '' && ['1', '2', '3', '4', '5'].includes(event.key)) {
            event.preventDefault();
            setRating(Number(event.key));
        }
    };

    const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const [hours, minutes] = e.target.value.split(':');
        const newDate = new Date(logDate);
        if (hours) newDate.setHours(parseInt(hours, 10));
        if (minutes) newDate.setMinutes(parseInt(minutes, 10));
        setLogDate(newDate);
    };

    const isSaveDisabled = rating === 0 && note.trim() === '' && !hasMeal;
    const formattedTime = logDate.toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' });
    const timeForInput = `${String(logDate.getHours()).padStart(2, '0')}:${String(logDate.getMinutes()).padStart(2, '0')}`;

    return (
        <div 
            className="bg-black bg-opacity-70"
            onClick={onClose}
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                width: '100vw',
                height: '100vh',
                zIndex: 999999,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '1rem'
            }}
        >
            <div 
                className="bg-white dark:bg-space-900 border border-gray-200 dark:border-white/10 rounded-xl shadow-2xl w-full max-w-md p-6 relative animate-fade-in-up"
                onClick={(e) => e.stopPropagation()}
            >
                {onOpenGuide && (
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            localStorage.setItem('energy-guide-seen', 'true');
                            setHasSeenGuide(true);
                            onOpenGuide();
                        }}
                        className={`absolute top-4 left-4 text-gray-400 dark:text-system-grey/70 hover:text-electric-500 dark:hover:text-electric-500 transition-all hover:scale-110 ${!hasSeenGuide ? 'animate-pulse-subtle' : ''}`}
                        title="Przewodnik oceniania energii"
                    >
                        <InformationCircleIcon className="h-6 w-6" />
                    </button>
                )}
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-600 dark:text-system-grey hover:text-gray-900 dark:hover:text-cloud-white transition">
                    <XMarkIcon className="h-6 w-6" />
                </button>

                <h2 className="text-2xl font-bold text-gray-900 dark:text-cloud-white text-center mb-2">Jak Twoja energia?</h2>
                <p className="text-center text-gray-600 dark:text-system-grey mb-6">Oceń swój obecny poziom energii lub dodaj notatkę.</p>
                
                <div className="flex justify-center items-center gap-3 sm:gap-4 mb-6">
                    {[1, 2, 3, 4, 5].map(level => (
                         <button
                            key={level}
                            onClick={() => setRating(rating === level ? 0 : level)}
                            className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full text-xl font-bold transition-all duration-200 flex items-center justify-center
                                ${rating === level ? `text-white ${RATING_CONFIG[level].color} scale-110 shadow-lg` : 'bg-gray-100 dark:bg-space-800 border border-gray-200 dark:border-white/20 text-gray-600 dark:text-system-grey hover:bg-gray-200 dark:hover:bg-space-700'}`}
                        >
                            {level}
                        </button>
                    ))}
                </div>
                
                {rating > 0 && (
                    <p className={`text-center font-semibold mb-6 transition-opacity duration-300 ${
                        rating === 1 ? 'text-red-600 dark:text-red-400' :
                        rating === 2 ? 'text-orange-600 dark:text-orange-400' :
                        rating === 3 ? 'text-yellow-600 dark:text-yellow-500' :
                        rating === 4 ? 'text-green-600 dark:text-green-400' :
                        'text-cyan-600 dark:text-cyan-400'
                    }`}>
                        {RATING_CONFIG[rating].label}
                    </p>
                )}

                <div className="border-t border-gray-200 dark:border-white/10 pt-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-cloud-white">Dodaj notatkę</h3>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setHasMeal(!hasMeal)}
                                className={`text-base font-mono py-2 px-3 rounded-lg transition-all ${
                                    hasMeal 
                                        ? 'bg-success-green text-white hover:bg-success-green/80' 
                                        : 'bg-gray-100 dark:bg-space-800 border border-gray-200 dark:border-white/20 text-gray-600 dark:text-system-grey hover:bg-gray-200 dark:hover:bg-space-700'
                                }`}
                                title="Dodaj posiłek"
                            >
                                Posiłek
                            </button>
                            {isEditingTime ? (
                                <input
                                    type="time"
                                    value={timeForInput}
                                    onChange={handleTimeChange}
                                    onBlur={() => setIsEditingTime(false)}
                                    autoFocus
                                    className="bg-gray-100 dark:bg-space-800 border border-gray-200 dark:border-white/20 text-gray-900 dark:text-cloud-white rounded-lg p-2 text-base font-mono focus:ring-2 focus:ring-electric-500 focus:outline-none transition"
                                />
                            ) : (
                                <button
                                    onClick={() => setIsEditingTime(true)}
                                    className="text-base font-mono text-gray-600 dark:text-system-grey bg-gray-100 dark:bg-space-800 border border-gray-200 dark:border-white/20 hover:bg-gray-200 dark:hover:bg-space-700 py-2 px-3 rounded-lg transition-colors"
                                    title="Zmień godzinę wpisu"
                                >
                                    {formattedTime}
                                </button>
                            )}
                        </div>
                    </div>
                    <textarea
                        ref={noteInputRef}
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Tutaj wpisz swoje notatki..."
                        className="w-full bg-gray-100 dark:bg-space-800 border border-gray-200 dark:border-white/20 text-gray-900 dark:text-cloud-white rounded-lg p-3 text-base focus:ring-2 focus:ring-electric-500 focus:outline-none transition"
                        rows={3}
                    />
                    <p className="hidden sm:block text-xs text-gray-600 dark:text-system-grey text-right mt-2">
                        Naciśnij <kbd>1-5</kbd> aby ocenić, potem <kbd>Enter</kbd> aby zapisać.
                    </p>
                </div>

                <div className="mt-8">
                    <button
                        onClick={() => onSave(rating > 0 ? rating : undefined, note, logDate.getTime(), hasMeal)}
                        disabled={isSaveDisabled}
                        className="w-full bg-electric-500 text-white font-bold py-3 px-4 rounded-lg shadow-md hover:bg-electric-600 transition-colors disabled:bg-gray-100 dark:disabled:bg-space-800 disabled:text-gray-400 dark:disabled:text-system-grey/50 disabled:cursor-not-allowed disabled:border disabled:border-gray-200 dark:disabled:border-white/20"
                    >
                        Zapisz
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
                @keyframes pulse-subtle {
                    0%, 100% { opacity: 0.6; }
                    50% { opacity: 1; }
                }
                .animate-pulse-subtle {
                    animation: pulse-subtle 2s ease-in-out infinite;
                }
            `}</style>
        </div>
    );
};