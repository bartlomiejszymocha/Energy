import React, { useState, useEffect, useRef } from 'react';

const PATTERNS = {
  '478': {
    idle: { instruction: 'Gotowy?', duration: 0, next: 'inhale', scale: 'scale-100', transition: 'duration-500' },
    inhale: { instruction: 'Wdech', duration: 4, next: 'hold', scale: 'scale-110', transition: 'duration-[4000ms]' },
    hold: { instruction: 'Wstrzymaj', duration: 7, next: 'exhale', scale: 'scale-110', transition: 'duration-500' },
    exhale: { instruction: 'Wydech', duration: 8, next: 'inhale', scale: 'scale-90', transition: 'duration-[8000ms]' },
  },
  '4784': {
    idle: { instruction: 'Gotowy?', duration: 0, next: 'inhale', scale: 'scale-100', transition: 'duration-500' },
    inhale: { instruction: 'Wdech', duration: 4, next: 'hold_full', scale: 'scale-110', transition: 'duration-[4000ms]' },
    hold_full: { instruction: 'Wstrzymaj', duration: 7, next: 'exhale', scale: 'scale-110', transition: 'duration-500' },
    exhale: { instruction: 'Wydech', duration: 8, next: 'hold_empty', scale: 'scale-90', transition: 'duration-[8000ms]' },
    hold_empty: { instruction: 'Wstrzymaj', duration: 4, next: 'inhale', scale: 'scale-90', transition: 'duration-500' },
  }
};

type PhaseKey = keyof (typeof PATTERNS)['478'] | keyof (typeof PATTERNS)['4784'];

interface BreathingTimerProps {
    isExpanded: boolean;
    size?: 'normal' | 'large';
    pattern: '478' | '4784';
    onStopClick?: () => void;
    onCompleteClick?: () => void;
}

export const BreathingTimer: React.FC<BreathingTimerProps> = ({ isExpanded, size = 'normal', pattern, onStopClick, onCompleteClick }) => {
    const PHASES = PATTERNS[pattern];
    const [phase, setPhase] = useState<PhaseKey>('idle');
    const [countdown, setCountdown] = useState(PHASES.inhale.duration);
    const [isActive, setIsActive] = useState(false);
    const [elapsedTime, setElapsedTime] = useState(0);
    const intervalRef = useRef<number | null>(null);
    const stopwatchIntervalRef = useRef<number | null>(null);
    const audioContextRef = useRef<AudioContext | null>(null);

    const sizeConfig = {
        normal: {
            container: 'p-4',
            circle: 'w-32 h-32',
            instructionText: 'text-lg',
            countdownText: 'text-4xl',
            stopwatchText: 'text-lg',
            buttonContainer: 'h-10',
            buttonClasses: 'py-2 px-6',
        },
        large: {
            container: 'p-6',
            circle: 'w-48 h-48',
            instructionText: 'text-2xl',
            countdownText: 'text-7xl',
            stopwatchText: 'text-2xl',
            buttonContainer: 'h-14 mt-4',
            buttonClasses: 'py-3 px-8 text-lg',
        }
    };
    const config = sizeConfig[size];

    // Function to play a gentle beep sound
    const playBeep = () => {
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
        oscillator.frequency.setValueAtTime(880, context.currentTime); // A5 note
        gainNode.gain.setValueAtTime(0, context.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.3, context.currentTime + 0.01); // Quick fade in
        gainNode.gain.linearRampToValueAtTime(0, context.currentTime + 0.1); // Quick fade out

        oscillator.start(context.currentTime);
        oscillator.stop(context.currentTime + 0.1);
    };

    const stopTimer = () => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
        if (stopwatchIntervalRef.current) {
            clearInterval(stopwatchIntervalRef.current);
            stopwatchIntervalRef.current = null;
        }
        setIsActive(false);
        setPhase('idle');
    };
    
    const handleStopClick = () => {
        stopTimer();
        if (onStopClick) {
            onStopClick();
        }
    };

    const startTimer = () => {
        // Create AudioContext on user interaction to comply with browser policies
        if (!audioContextRef.current) {
            try {
                const win = window as unknown as { AudioContext?: typeof AudioContext; webkitAudioContext?: typeof AudioContext };
                audioContextRef.current = new (win.AudioContext || win.webkitAudioContext!)();
            } catch (e) {
                console.error("Web Audio API is not supported in this browser");
            }
        }
        
        setPhase('inhale');
        // @ts-ignore
        setCountdown(PHASES.inhale.duration - 1);
        setIsActive(true);
        playBeep(); // Play sound at the very beginning

        intervalRef.current = window.setInterval(() => {
            setCountdown(prev => prev - 1);
        }, 1000);

        // Start stopwatch
        setElapsedTime(0);
        stopwatchIntervalRef.current = window.setInterval(() => {
            setElapsedTime(prev => prev + 1);
        }, 1000);
    };

    // Main timer logic to switch phases
    useEffect(() => {
        if (!isActive) return;

        if (countdown < 0) {
            playBeep();
            const currentPhaseInfo = PHASES[phase as keyof typeof PHASES];
            const nextPhaseKey = currentPhaseInfo.next as PhaseKey;
            const nextPhaseInfo = PHASES[nextPhaseKey as keyof typeof PHASES];
            
            setPhase(nextPhaseKey);
            setCountdown(nextPhaseInfo.duration - 1);
        }
    }, [countdown, phase, isActive, PHASES]);
    
    // Stop timer if card is collapsed
    useEffect(() => {
        if (!isExpanded) {
            stopTimer();
        }
    }, [isExpanded]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
            if (stopwatchIntervalRef.current) {
                clearInterval(stopwatchIntervalRef.current);
            }
            // Close the audio context when the component unmounts
            if(audioContextRef.current && audioContextRef.current.state !== 'closed') {
                audioContextRef.current.close();
            }
        };
    }, []);

    const currentPhaseInfo = PHASES[phase as keyof typeof PHASES];
    const { instruction, scale, transition } = currentPhaseInfo;
    
    const formatTime = (totalSeconds: number) => {
        const minutes = String(Math.floor(totalSeconds / 60)).padStart(2, '0');
        const seconds = String(totalSeconds % 60).padStart(2, '0');
        return `${minutes}:${seconds}`;
    };

    return (
        <div className={`mt-4 flex flex-col items-center justify-center text-center ${size === 'normal' ? 'bg-gray-100 dark:bg-space-800 border border-gray-200 dark:border-white/10 rounded-lg' : ''} ${config.container}`}>
            <div 
                className={`relative ${config.circle} rounded-full border-4 border-electric-500 bg-white dark:bg-transparent flex items-center justify-center mb-4 transform transition-transform ease-linear ${transition} ${isActive ? scale : 'scale-100'}`}
            >
                <div className="flex flex-col items-center">
                     <span className={`${config.instructionText} font-bold text-gray-900 dark:text-cloud-white`}>{instruction}</span>
                     {isActive && (
                        <span className={`${config.countdownText} font-mono font-bold text-electric-500`}>{countdown + 1}</span>
                     )}
                </div>
            </div>
            
            <div className={`${config.buttonContainer} flex items-center justify-center`}>
                {!isActive ? (
                     <button onClick={startTimer} className={`bg-electric-500 text-white font-bold ${config.buttonClasses} rounded-full shadow-md hover:bg-electric-600 transition-all duration-200 hover:scale-105 active:scale-95`}>
                        Zacznij oddychać
                    </button>
                ) : (
                    <div className="flex items-center gap-4">
                        <button onClick={handleStopClick} className={`bg-danger-red text-white font-bold ${config.buttonClasses} rounded-full shadow-md hover:bg-danger-red/80 transition-all duration-200 hover:scale-105 active:scale-95`}>
                            Stop
                        </button>
                        {onCompleteClick && (
                             <button onClick={onCompleteClick} className={`bg-success-green text-white font-bold ${config.buttonClasses} rounded-full shadow-md hover:bg-success-green/90 transition-all duration-200 hover:scale-105 active:scale-95`}>
                                Zrobione
                            </button>
                        )}
                        <div className={`${config.stopwatchText} font-mono font-bold text-gray-600 dark:text-system-grey`} aria-live="off">
                            {formatTime(elapsedTime)}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};