import React, { useState, useEffect, useRef, useCallback } from 'react';
import { XMarkIcon } from './icons/Icons';
import type { ActionItem } from '../types';

interface IntelligentPomodoroModalProps {
    isOpen: boolean;
    onClose: () => void;
    onComplete: () => void;
    action: ActionItem;
}

type Stage = 'setup' | 'focus' | 'evaluate' | 'flowSetup' | 'flow' | 'break';

const FOCUS_LEVELS = [
    { key: 'distracted', label: 'Rozproszony', color: 'bg-alert-orange' },
    { key: 'ok', label: 'OK', color: 'bg-warning-yellow' },
    { key: 'good', label: 'Dobry', color: 'bg-success-green/80' },
    { key: 'flow', label: 'Flow', color: 'bg-success-green' }
];

export const IntelligentPomodoroModal: React.FC<IntelligentPomodoroModalProps> = ({
    isOpen,
    onClose,
    onComplete,
    action
}) => {
    const [stage, setStage] = useState<Stage>('setup');
    const [focusDuration, setFocusDuration] = useState(25); // in minutes
    const [timeLeft, setTimeLeft] = useState(0); // in seconds for focus/break/flow
    const [totalFocusTime, setTotalFocusTime] = useState(0); // in seconds
    const [currentFlowDuration, setCurrentFlowDuration] = useState(0); // in seconds, for progress bar
    const timerRef = useRef<number | null>(null);
    const audioContextRef = useRef<AudioContext | null>(null);
    const [isCompleted, setIsCompleted] = useState(false);

    const playSound = useCallback((type: 'start' | 'end') => {
        if (!audioContextRef.current) return;
        const context = audioContextRef.current;
        if (context.state === 'suspended') {
            context.resume();
        }

        const oscillator = context.createOscillator();
        const gainNode = context.createGain();
        oscillator.connect(gainNode);
        gainNode.connect(context.destination);

        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(type === 'start' ? 440 : 880, context.currentTime);
        gainNode.gain.setValueAtTime(0.3, context.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + 0.5);
        
        oscillator.start(context.currentTime);
        oscillator.stop(context.currentTime + 0.5);
    }, []);

    const stopTimer = useCallback(() => {
        if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }
    }, []);

    useEffect(() => {
        if (!isOpen) {
            // Reset state when modal is closed
            stopTimer();
            setStage('setup');
            setFocusDuration(25);
            setTotalFocusTime(0);
            setIsCompleted(false);
            return;
        }

        // Initialize AudioContext on user interaction
        if (!audioContextRef.current) {
            try {
                const win = window as unknown as { AudioContext?: typeof AudioContext; webkitAudioContext?: typeof AudioContext };
                audioContextRef.current = new (win.AudioContext || win.webkitAudioContext!)();
            } catch (e) { console.error("Web Audio API is not supported."); }
        }

    }, [isOpen, stopTimer]);


    useEffect(() => {
        if (stage === 'focus' || stage === 'break' || stage === 'flow') {
            timerRef.current = window.setInterval(() => {
                setTimeLeft(prev => {
                    if (prev <= 1) {
                        stopTimer();
                        playSound('end');
                        if (stage === 'focus' || stage === 'flow') setStage('evaluate');
                        if (stage === 'break') onClose();
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }

        return () => stopTimer();
    }, [stage, stopTimer, onClose, playSound]);

    const handleStartFocus = () => {
        playSound('start');
        const durationInSeconds = focusDuration * 60;
        setTimeLeft(durationInSeconds);
        setTotalFocusTime(durationInSeconds);
        setStage('focus');
    };

    const handleEvaluation = (level: string) => {
        if (!isCompleted) {
            onComplete();
            setIsCompleted(true);
        }

        if (level === 'flow') {
            setStage('flowSetup');
        } else {
            handleStopAndBreak();
        }
    };
    
    const handleStartFlow = (minutes: number) => {
        const seconds = minutes * 60;
        playSound('start');
        setTotalFocusTime(prev => prev + seconds);
        setCurrentFlowDuration(seconds);
        setTimeLeft(seconds);
        setStage('flow');
    };

    const handleStopAndBreak = () => {
        stopTimer();
        playSound('start');
        setTimeLeft(5 * 60);
        setStage('break');
    };

    const formatTime = (totalSeconds: number) => {
        const minutes = String(Math.floor(totalSeconds / 60)).padStart(2, '0');
        const seconds = String(totalSeconds % 60).padStart(2, '0');
        return `${minutes}:${seconds}`;
    };

    if (!isOpen) return null;

    const renderContent = () => {
        switch (stage) {
            case 'setup':
                return (
                    <>
                        <h2 className="text-2xl font-bold text-cloud-white text-center">Ustaw sesję skupienia</h2>
                        <p className="text-system-grey mt-2 text-center">Na ile minut chcesz się w pełni skoncentrować?</p>
                        <div className="my-8 text-center">
                            <span className="text-7xl font-bold text-electric-500 tabular-nums">{focusDuration}</span>
                            <span className="text-2xl text-system-grey ml-2">min</span>
                        </div>
                        <input
                            type="range"
                            min="5"
                            max="60"
                            step="5"
                            value={focusDuration}
                            onChange={(e) => setFocusDuration(Number(e.target.value))}
                            className="w-full h-3 bg-space-800 rounded-lg appearance-none cursor-pointer range-slider"
                        />
                         <div className="mt-8">
                            <button onClick={handleStartFocus} className="w-full bg-electric-500 text-cloud-white font-bold py-3 px-4 rounded-lg shadow-md hover:bg-electric-600 transition-all duration-200 hover:scale-105 active:scale-95">
                                Rozpocznij skupienie
                            </button>
                        </div>
                    </>
                );
            case 'focus':
            case 'break':
            case 'flow':
                 const totalDuration = stage === 'focus' ? focusDuration * 60 : stage === 'flow' ? currentFlowDuration : 300;
                 const radius = 100;
                 const circumference = 2 * Math.PI * radius;
                 const strokeDashoffset = circumference - (timeLeft / totalDuration) * circumference;
                return (
                    <div className="flex flex-col items-center">
                        <h2 className="text-2xl font-bold text-cloud-white text-center">
                            {stage === 'focus' && 'Czas na skupienie'}
                            {stage === 'break' && 'Zrób sobie przerwę'}
                            {stage === 'flow' && 'Jesteś w stanie flow!'}
                        </h2>
                        <div className="relative my-8 w-64 h-64">
                            <svg className="w-full h-full" viewBox="0 0 220 220">
                                <circle cx="110" cy="110" r={radius} className="stroke-current text-space-800" strokeWidth="15" fill="transparent" />
                                <circle
                                    cx="110"
                                    cy="110"
                                    r={radius}
                                    className="stroke-current text-electric-500"
                                    strokeWidth="15"
                                    fill="transparent"
                                    strokeDasharray={circumference}
                                    strokeDashoffset={strokeDashoffset}
                                    strokeLinecap="round"
                                    transform="rotate(-90 110 110)"
                                    style={{ transition: 'stroke-dashoffset 1s linear' }}
                                />
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className="text-6xl font-bold text-cloud-white tabular-nums">
                                    {formatTime(timeLeft)}
                                </span>
                                {stage === 'flow' && 
                                    <p className="text-system-grey mt-1 text-sm">
                                        Łącznie: {formatTime(totalFocusTime)}
                                    </p>
                                }
                            </div>
                        </div>
                        {stage === 'flow' || stage === 'focus' ? (
                            <button onClick={handleStopAndBreak} className="w-full bg-alert-orange text-space-950 font-bold py-3 px-4 rounded-lg shadow-md hover:bg-alert-orange/90 transition-all duration-200">
                                Zrób przerwę
                            </button>
                        ) : (
                             <button onClick={onClose} className="w-full bg-danger-red/80 text-cloud-white font-bold py-3 px-4 rounded-lg shadow-md hover:bg-danger-red transition-all duration-200">
                                Zakończ
                            </button>
                        )}
                    </div>
                );
            case 'evaluate':
                return (
                    <>
                        <h2 className="text-2xl font-bold text-cloud-white text-center">Sesja zakończona!</h2>
                        <p className="text-system-grey mt-2 text-center">Jak oceniasz swój poziom skupienia?</p>
                        <p className="text-sm text-cloud-white font-semibold text-center mt-4">
                            Całkowity czas skupienia: <span className="font-bold text-electric-500">{formatTime(totalFocusTime)}</span>
                        </p>
                        <div className="mt-6 flex flex-col gap-3">
                            {FOCUS_LEVELS.map(level => (
                                <button
                                    key={level.key}
                                    onClick={() => handleEvaluation(level.key)}
                                    className={`w-full ${level.color} text-space-950 font-bold py-3 px-4 rounded-lg shadow-md hover:opacity-90 transition-opacity`}
                                >
                                    {level.label}
                                </button>
                            ))}
                        </div>
                    </>
                );
            case 'flowSetup':
                return (
                     <>
                        <h2 className="text-2xl font-bold text-cloud-white text-center">Jesteś w stanie flow!</h2>
                        <p className="text-system-grey mt-2 text-center">
                            Skupiasz się już: <span className="font-bold text-cloud-white">{formatTime(totalFocusTime)}</span>
                        </p>
                        <p className="text-cloud-white font-semibold mt-4 text-center">Na ile minut chcesz kontynuować?</p>
                        <div className="mt-6 flex flex-col gap-3">
                            {[5, 10, 15].map(minutes => (
                                <button
                                    key={minutes}
                                    onClick={() => handleStartFlow(minutes)}
                                    className="w-full bg-electric-500 text-cloud-white font-bold py-3 px-4 rounded-lg shadow-md hover:bg-electric-600 transition"
                                >
                                    + {minutes} minut
                                </button>
                            ))}
                        </div>
                         <div className="mt-4">
                            <button onClick={handleStopAndBreak} className="w-full bg-space-800 text-system-grey font-bold py-2 px-4 rounded-lg hover:bg-space-700 transition">
                                Zrób przerwę
                            </button>
                        </div>
                    </>
                )
        }
    };

    return (
        <div 
            className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4"
            onClick={onClose}
        >
            <div 
                className="bg-space-900 rounded-xl shadow-2xl w-full max-w-sm p-6 relative animate-fade-in-up"
                onClick={(e) => e.stopPropagation()}
            >
                <button 
                    onClick={onClose} 
                    className="absolute top-4 right-4 text-system-grey hover:text-cloud-white transition"
                    aria-label="Zamknij"
                >
                    <XMarkIcon className="h-6 w-6" />
                </button>
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
                .range-slider::-webkit-slider-thumb {
                    -webkit-appearance: none;
                    appearance: none;
                    width: 24px;
                    height: 24px;
                    background: #F4F6F8;
                    cursor: pointer;
                    border-radius: 50%;
                    margin-top: -8px;
                }
                .range-slider::-moz-range-thumb {
                    width: 24px;
                    height: 24px;
                    background: #F4F6F8;
                    cursor: pointer;
                    border-radius: 50%;
                }
            `}</style>
        </div>
    );
};
