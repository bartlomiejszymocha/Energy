import React, { useMemo, useEffect } from 'react';
import type { User } from 'firebase/auth';
import type { ActionItem, EnrichedWorkoutStep, Exercise, WorkoutStep } from '../types';
import { useWorkoutEngine } from '../hooks/useWorkoutEngine';
import { XMarkIcon, PlayIcon, PauseIcon, ChevronLeftIcon, ChevronRightIcon, CheckCircleIcon } from './icons/LucideIcons';
import { IconRenderer } from './IconRenderer';


const formatTime = (totalSeconds: number) => {
    const minutes = String(Math.floor(totalSeconds / 60)).padStart(2, '0');
    const seconds = String(totalSeconds % 60).padStart(2, '0');
    return `${minutes}:${seconds}`;
};

// --- Dumb Presentational Components ---

const ExerciseView: React.FC<{
    engine: ReturnType<typeof useWorkoutEngine>;
    action: ActionItem;
}> = ({ engine, action }) => {
    const { 
        currentStep, timeLeftInStep, isPaused, progressPercentage, 
        play, pause, skipToPrevious, skipToNext, 
        totalTimeRemaining, currentStepInfo, nextStep 
    } = engine;

    if (currentStep.type !== 'exercise') return null;
    
    const getNextStepText = () => {
        if (!nextStep) {
            return "Koniec treningu";
        }
        if (nextStep.type === 'rest') {
            return `Odpoczynek - ${nextStep.duration} sek.`;
        }
        return nextStep.name;
    };

    return (
        <div className="flex flex-col h-full">
            <header className="flex flex-col gap-4 items-center justify-between pb-4 border-b border-gray-200 dark:border-space-700/50 flex-shrink-0">
                <div className="w-full flex items-start justify-between">
                    <div>
                        <div className="flex items-center gap-3">
                            <IconRenderer icon={action.icon} className="text-2xl -mt-1" />
                            <h1 className="text-xl font-bold text-gray-900 dark:text-cloud-white">{action.title}</h1>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-system-grey mt-1.5">
                            <span>Ćwiczenie {currentStepInfo.number} z {currentStepInfo.total}</span>
                             <span className="opacity-50">•</span>
                            <span>Pozostało: <span className="font-mono tabular-nums">{formatTime(totalTimeRemaining)}</span></span>
                        </div>
                    </div>
                    <button onClick={() => { pause(); action.onClose?.(); }} className="text-gray-600 dark:text-system-grey hover:text-gray-900 dark:hover:text-cloud-white transition p-1 rounded-full hover:bg-gray-100 dark:hover:bg-white/10 " aria-label="Zamknij trening">
                        <XMarkIcon className="h-6 w-6" />
                    </button>
                </div>
                <div className="w-full flex items-center gap-2">
                    {Array.from({ length: currentStepInfo.total }).map((_, index) => {
                         const isCompleted = index < currentStepInfo.number - 1;
                         const isCurrent = index === currentStepInfo.number - 1;
                         return(
                            <div
                                key={index}
                                className={`flex-1 h-1.5 rounded-full transition-colors duration-300 ${
                                    isCompleted ? 'bg-electric-500' : (isCurrent ? 'bg-electric-500/50' : 'bg-gray-300 dark:bg-space-700')
                                }`}
                            >
                              {isCurrent && (
                                <div className="h-full rounded-full bg-electric-500" style={{ width: `${(1 - progressPercentage) * 100}%`, transition: 'width 1s linear' }} />
                              )}
                            </div>
                        );
                    })}
                </div>
            </header>
            
            <main className="flex-grow flex flex-col items-center justify-start pt-2 overflow-y-auto custom-scrollbar">
                <div className="w-full aspect-video relative bg-black rounded-lg overflow-hidden shadow-lg mb-3 flex-shrink-0">
                    {currentStep.videoUrl ? (
                        <div className="w-full h-full relative">
                            <iframe
                                key={currentStep.videoUrl}
                                className={`w-full h-full transition-opacity duration-300 ${isPaused ? 'opacity-0' : 'opacity-100'}`}
                                src={currentStep.videoUrl}
                                title={currentStep.name}
                                frameBorder="0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                            ></iframe>
                             {isPaused && (
                                <div className="absolute inset-0 bg-black/60 flex items-center justify-center ">
                                    <button onClick={play} className="text-white/80 hover:text-white transition-colors" aria-label="Wznów trening">
                                        <PlayIcon className="h-20 w-20" />
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-space-800 p-4 border border-gray-200 dark:border-transparent">
                             <p className="text-xl text-gray-600 dark:text-system-grey text-center">{currentStep.name}</p>
                        </div>
                    )}
                </div>

                <div className="text-center my-3 flex-shrink-0">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-cloud-white">{currentStep.name}</h2>
                    <p className="font-mono text-xl text-gray-600 dark:text-system-grey mt-1 tabular-nums">{formatTime(timeLeftInStep)}</p>
                    {currentStep.note && (
                        <p className="text-sm text-gray-600 dark:text-system-grey mt-2 max-w-md mx-auto leading-relaxed">
                            {currentStep.note}
                        </p>
                    )}
                </div>

                <div className="flex items-center justify-center gap-6 my-3 flex-shrink-0">
                    <button
                        onClick={skipToPrevious}
                        disabled={currentStepInfo.number === 1}
                        className="p-3 rounded-full bg-gray-100 dark:bg-white/10 border border-gray-200 dark:border-white/20 text-gray-700 dark:text-cloud-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-200 dark:hover:bg-white/20 hover:border-gray-300 dark:hover:border-white/40 transition-all duration-200 "
                    >
                        <ChevronLeftIcon className="h-7 w-7" />
                    </button>
                    
                    <div className="relative w-24 h-24">
                        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 120 120">
                            <circle cx="60" cy="60" r="54" fill="none" stroke="currentColor" strokeWidth="6" className="text-gray-300 dark:text-space-800" />
                            <circle
                                cx="60"
                                cy="60"
                                r="54"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="6"
                                strokeLinecap="round"
                                strokeDasharray="339.292"
                                strokeDashoffset={339.292 * (1 - progressPercentage)}
                                className="text-electric-500"
                                style={{ transition: 'stroke-dashoffset 1s linear' }}
                            />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <button
                                onClick={isPaused ? play : pause}
                                className="w-20 h-20 rounded-full bg-gray-100 dark:bg-white/10 border border-gray-200 dark:border-white/20 text-gray-700 dark:text-cloud-white shadow-lg transform hover:scale-105 hover:bg-gray-200 dark:hover:bg-white/20 hover:border-gray-300 dark:hover:border-white/40 transition-all duration-200 active:scale-95 flex items-center justify-center "
                            >
                                {isPaused ? <PlayIcon className="h-10 w-10 ml-1" /> : <PauseIcon className="h-10 w-10" />}
                            </button>
                        </div>
                    </div>

                    <button
                        onClick={skipToNext}
                        className="p-3 rounded-full bg-gray-100 dark:bg-white/10 border border-gray-200 dark:border-white/20 text-gray-700 dark:text-cloud-white hover:bg-gray-200 dark:hover:bg-white/20 hover:border-gray-300 dark:hover:border-white/40 transition-all duration-200 "
                    >
                        <ChevronRightIcon className="h-7 w-7" />
                    </button>
                </div>
            </main>
            <footer className="w-full text-center pt-4 mt-auto flex-shrink-0 h-10">
                <p className="text-sm text-gray-600 dark:text-system-grey animate-fade-in-up">
                    Następne: <span className="font-semibold text-gray-900 dark:text-cloud-white/80">{getNextStepText()}</span>
                </p>
            </footer>
        </div>
    );
};

const RestView: React.FC<{
    engine: ReturnType<typeof useWorkoutEngine>;
    action: ActionItem;
}> = ({ engine, action }) => {
    const { timeLeftInStep, progressPercentage, skipToNext, nextStep, isPaused, play, pause } = engine;

    return (
        <div className="grid grid-rows-[auto_1fr_auto] h-full w-full">
            <header className="row-start-1 w-full flex flex-col gap-4 pb-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <IconRenderer icon={action.icon} className="text-2xl -mt-1" />
                        <h1 className="text-xl font-bold text-gray-900 dark:text-cloud-white">{action.title}</h1>
                    </div>
                    <button onClick={() => { action.onClose?.(); }} className="text-gray-600 dark:text-system-grey hover:text-gray-900 dark:hover:text-cloud-white transition p-1 rounded-full hover:bg-gray-100 dark:hover:bg-white/10 " aria-label="Zamknij trening">
                        <XMarkIcon className="h-6 w-6" />
                    </button>
                </div>
                <div className="pt-4 border-t border-gray-200 dark:border-white/10">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-cloud-white text-center">Odpoczynek</h2>
                </div>
            </header>
            <div className="row-start-2 flex items-center justify-center gap-8 w-full py-4">
                <div className="relative w-48 h-48">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 120 120">
                        <circle cx="60" cy="60" r="54" fill="none" stroke="currentColor" strokeWidth="4" className="text-gray-300 dark:text-space-800" />
                        <circle
                            cx="60"
                            cy="60"
                            r="54"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="4"
                            strokeLinecap="round"
                            strokeDasharray="339.292"
                            strokeDashoffset={339.292 * (1 - progressPercentage)}
                            className="text-alert-orange"
                            style={{ transition: 'stroke-dashoffset 1s linear' }}
                        />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <button
                            onClick={isPaused ? play : pause}
                            className="w-full h-full rounded-full flex items-center justify-center transition-all duration-200 hover:scale-105 bg-gray-100 dark:bg-white/5 "
                            aria-label={isPaused ? "Wznów przerwę" : "Wstrzymaj przerwę"}
                        >
                           {isPaused ?
                                <PlayIcon className="h-16 w-16 text-gray-700 dark:text-cloud-white" /> :
                                <span className="text-5xl font-mono font-bold text-gray-700 dark:text-cloud-white tabular-nums">
                                    {formatTime(timeLeftInStep)}
                                </span>
                           }
                        </button>
                    </div>
                </div>
            </div>
            <div className="row-start-3 text-center w-full max-w-xs mx-auto pb-2">
                {nextStep && nextStep.type === 'exercise' && (
                    <div className="bg-gray-100 dark:bg-space-800/50 rounded-lg p-4 w-full mb-4 border border-gray-200 dark:border-transparent">
                        <p className="text-xs text-gray-600 dark:text-system-grey uppercase tracking-wider">Następnie:</p>
                        <p className="text-lg font-bold text-gray-900 dark:text-cloud-white mt-1">{nextStep.name} - {nextStep.duration} sek.</p>
                    </div>
                )}
                <button
                    onClick={skipToNext}
                    className="w-full text-center text-sm font-semibold text-electric-500 hover:text-electric-600 transition-colors"
                >
                    Pomiń przerwę i kontynuuj
                </button>
            </div>
        </div>
    );
};

const CompletionView: React.FC<{ onFinish: () => void }> = ({ onFinish }) => (
    <div className="flex-grow flex flex-col items-center justify-center text-center py-8">
        <div className="animate-fade-in-up">
            <CheckCircleIcon className="h-24 w-24 text-success-green mx-auto" />
            <h2 className="text-3xl font-bold text-gray-900 dark:text-cloud-white mt-4">Trening ukończony!</h2>
            <p className="text-gray-600 dark:text-system-grey mt-2">Dobra robota!</p>
            <button
                onClick={onFinish}
                className="mt-8 w-full max-w-xs bg-electric-500 text-white font-bold py-3 px-6 rounded-lg shadow-lg hover:bg-electric-600 transition-all duration-200 "
            >
                Zakończ
            </button>
        </div>
    </div>
);


// --- Main Modal Component ---

interface WorkoutModalProps {
    user: User | null;
    action: ActionItem;
    onClose: () => void;
    onComplete: () => void;
    exerciseLibrary: Record<string, Exercise>;
}

export const WorkoutModal: React.FC<WorkoutModalProps> = ({ action, onClose, onComplete, exerciseLibrary }) => {
    console.log('🏋️ WorkoutModal opened for action:', action.name, 'with workout:', action.workout);
    
    const workoutPlaylist = useMemo((): EnrichedWorkoutStep[] => {
        if (!action.workout) return [];

        // Parse workout string to array if it's a string
        let workoutSteps: WorkoutStep[] = [];
        
        if (typeof action.workout === 'string') {
            console.log('🔍 Parsing workout string for action:', action.name, ':', action.workout);
            // Parse string format: "ex005 60, R 30, ex002 45, R 30, ex003 60"
            const parts = action.workout.split(',').map(part => part.trim());
            console.log('🔍 Workout parts:', parts);
            workoutSteps = parts.map(part => {
                // Check for rest patterns: "R", "R 20", "R20", "rest", "rest 30", etc.
                const restMatch = part.match(/^r(?:est)?\s*(\d+)?$/i);
                if (restMatch) {
                    const duration = restMatch[1] ? parseInt(restMatch[1]) : 30; // Default 30s if no duration
                    return {
                        type: 'rest' as const,
                        duration,
                        name: 'Odpoczynek'
                    };
                } else {
                    // Parse exercise format: "ex005 60" or "ex005 (60s)"
                    const match = part.match(/(ex\d+)\s*\(?(\d+)/);
                    if (match) {
                        const exerciseId = match[1];
                        const duration = parseInt(match[2]);
                        return {
                            type: 'exercise' as const,
                            exerciseId,
                            duration,
                            name: exerciseId
                        };
                    }
                    // Fallback for unrecognized format
                    return {
                        type: 'exercise' as const,
                        exerciseId: 'ex001',
                        duration: 60,
                        name: 'Ćwiczenie'
                    };
                }
            });
        } else if (Array.isArray(action.workout)) {
            console.log('🔍 Workout is already array:', action.workout);
            workoutSteps = action.workout;
        } else {
            console.log('🔍 Unknown workout type:', typeof action.workout, action.workout);
        }

        console.log('🔍 Final workoutSteps:', workoutSteps);
        return workoutSteps.map(step => {
            if (step.type === 'exercise') {
                const exerciseDetails = exerciseLibrary[step.exerciseId];
                 if (!exerciseDetails) {
                    console.warn(`Exercise with id "${step.exerciseId}" not found in library.`);
                    return null;
                }
                return {
                    ...step,
                    ...exerciseDetails,
                    name: exerciseDetails.name || 'Nieznane ćwiczenie',
                };
            }
            // 'rest' step
            return {
                ...step,
                name: 'Odpoczynek',
            };
        }).filter(Boolean) as EnrichedWorkoutStep[];
    }, [action.workout, exerciseLibrary, action.name]);

    const engine = useWorkoutEngine(workoutPlaylist);
    
    if (workoutPlaylist.length === 0) {
        return (
             <div className="fixed top-0 left-0 right-0 bottom-0 bg-black/80  flex items-center justify-center z-[100] p-4" onClick={onClose}>
                <div className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl shadow-2xl w-full max-w-lg p-6 relative animate-fade-in-up text-center " onClick={e => e.stopPropagation()}>
                    <p className="text-gray-900 dark:text-cloud-white">Nie znaleziono ćwiczeń dla tej akcji.</p>
                     <button onClick={onClose} className="mt-4 bg-electric-500 hover:bg-electric-600 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-200">Zamknij</button>
                </div>
             </div>
        );
    }
    
    // Pass onClose to the action prop for ExerciseView to use
    const enrichedAction = {...action, onClose};

    const renderContent = () => {
        if (engine.isFinished) {
            return <CompletionView onFinish={onComplete} />;
        }
        if (engine.currentStep.type === 'exercise') {
            return <ExerciseView engine={engine} action={enrichedAction} />;
        }
        if (engine.currentStep.type === 'rest') {
            return <RestView engine={engine} action={action} />;
        }
        return null;
    };

    return (
        <div className="fixed top-0 left-0 right-0 bottom-0 bg-black/80 flex items-center justify-center z-[100] p-4" onClick={() => { engine.pause(); onClose(); }}>
            <div 
                className="bg-white dark:bg-space-900 border border-gray-200 dark:border-white/10 rounded-2xl shadow-2xl w-full max-w-lg p-4 sm:p-6 relative animate-fade-in-up flex flex-col h-[85vh] min-h-[600px] max-h-[95vh] overflow-y-auto"
                onClick={e => e.stopPropagation()}
            >
                <div className="flex-1 flex flex-col min-h-0">
                    {renderContent()}
                </div>
            </div>
             <style>{`
                @keyframes fade-in-up {
                    from { opacity: 0; transform: translateY(20px) scale(0.95); }
                    to { opacity: 1; transform: translateY(0) scale(1); }
                }
                .animate-fade-in-up {
                    animation: fade-in-up 0.3s ease-out forwards;
                }
                 .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #D1D5DB; /* light mode scrollbar */
                    border-radius: 3px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: #9CA3AF;
                }
                .dark .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #24324E; /* dark mode scrollbar */
                }
                .dark .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: #35456A;
                }
            `}</style>
        </div>
    );
};