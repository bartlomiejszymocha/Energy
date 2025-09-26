import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import type { EnrichedWorkoutStep } from '../types';

export const useWorkoutEngine = (steps: EnrichedWorkoutStep[]) => {
    const [currentStepIndex, setCurrentStepIndex] = useState(0);
    const [isPaused, setIsPaused] = useState(true);
    const [timeLeftInStep, setTimeLeftInStep] = useState(steps[0]?.duration || 0);

    const timerRef = useRef<number | null>(null);
    const audioContextRef = useRef<AudioContext | null>(null);
    
    // Initialize AudioContext on first interaction
    useEffect(() => {
        if (!audioContextRef.current) {
            try {
                audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
            } catch (e) { console.error("Web Audio API is not supported."); }
        }
        return () => {
             if(audioContextRef.current && audioContextRef.current.state !== 'closed') {
                audioContextRef.current.close().catch(e => console.error("Audio context close failed:", e));
            }
        }
    }, []);

    const playSound = useCallback((type: 'start' | 'end_countdown') => {
        if (!audioContextRef.current) return;
        const context = audioContextRef.current;
        if (context.state === 'suspended') {
            context.resume().catch(e => console.error("Audio context resume failed:", e));
        }

        const oscillator = context.createOscillator();
        const gainNode = context.createGain();
        oscillator.connect(gainNode);
        gainNode.connect(context.destination);

        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(type === 'start' ? 880 : 440, context.currentTime);
        gainNode.gain.setValueAtTime(0, context.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.2, context.currentTime + 0.01);
        gainNode.gain.linearRampToValueAtTime(0, context.currentTime + 0.1);

        oscillator.start(context.currentTime);
        oscillator.stop(context.currentTime + 0.1);
    }, []);

    const totalWorkoutTime = useMemo(() => steps.reduce((sum, step) => sum + step.duration, 0), [steps]);
    
    const isFinished = currentStepIndex >= steps.length;
    const currentStep = steps[currentStepIndex];

    const stopTimer = useCallback(() => {
        if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }
    }, []);

    const advanceToNextStep = useCallback(() => {
        playSound('start');
        if (currentStepIndex < steps.length - 1) {
            setCurrentStepIndex(prev => prev + 1);
        } else {
            setCurrentStepIndex(steps.length); // End of workout
        }
    }, [currentStepIndex, steps.length, playSound]);

    useEffect(() => {
        if (!isFinished) {
            setTimeLeftInStep(steps[currentStepIndex].duration);
        } else {
            stopTimer();
        }
    }, [currentStepIndex, steps, isFinished, stopTimer]);

    useEffect(() => {
        if (isPaused || isFinished) {
            stopTimer();
            return;
        }

        timerRef.current = window.setInterval(() => {
            setTimeLeftInStep(prev => {
                if (prev <= 1) {
                    advanceToNextStep();
                    return 0;
                }
                 if (prev <= 4 && prev > 1) {
                     playSound('end_countdown');
                }
                return prev - 1;
            });
        }, 1000);

        return () => stopTimer();
    }, [isPaused, isFinished, advanceToNextStep, playSound, stopTimer]);
    
    const play = () => {
        if (!isFinished) {
            setIsPaused(false);
            playSound('start');
        }
    };
    const pause = () => setIsPaused(true);

    const skipToNext = () => {
        if (!isFinished) {
            advanceToNextStep();
        }
    };
    
    const skipToPrevious = () => {
        if (currentStepIndex > 0) {
            playSound('start');
            setCurrentStepIndex(prev => prev - 1);
        }
    };

    const timeElapsedInPastSteps = useMemo(() => 
        steps.slice(0, currentStepIndex).reduce((sum, step) => sum + step.duration, 0),
    [steps, currentStepIndex]);
    
    const timeElapsedInCurrentStep = (currentStep?.duration || 0) - timeLeftInStep;
    const totalTimeElapsed = timeElapsedInPastSteps + timeElapsedInCurrentStep;
    const totalTimeRemaining = totalWorkoutTime - totalTimeElapsed;

    const totalExerciseCount = useMemo(() => 
        steps.filter(step => step.type === 'exercise').length
    , [steps]);

    const currentExerciseIndex = useMemo(() => {
        if (isFinished) return totalExerciseCount;
        return steps
            .slice(0, currentStepIndex + 1)
            .filter(step => step.type === 'exercise')
            .length;
    }, [steps, currentStepIndex, isFinished, totalExerciseCount]);

    return {
        currentStep,
        timeLeftInStep,
        isPaused,
        isFinished,
        play,
        pause,
        skipToNext,
        skipToPrevious,
        totalTimeRemaining: Math.max(0, totalTimeRemaining),
        progressPercentage: timeLeftInStep / (currentStep?.duration || 1),
        currentStepInfo: {
            number: currentExerciseIndex,
            total: totalExerciseCount,
        },
        nextStep: steps[currentStepIndex + 1] || null
    };
};