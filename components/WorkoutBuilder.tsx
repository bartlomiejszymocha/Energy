import React, { useState, useMemo } from 'react';
import { useSheetsExercises } from '../hooks/useSheetsExercises';
import { useSheetsActionsOptimized } from '../hooks/useSheetsActionsOptimized';
import type { Exercise, WorkoutStep, ActionItem, ActionType } from '../types';
import { PlusIcon, TrashIcon, SaveIcon, PlayIcon, ClockIcon, SettingsIcon } from './icons/LucideIcons';

interface WorkoutBuilderProps {
    onClose: () => void;
}

interface WorkoutStepBuilder extends WorkoutStep {
    id: string;
}

export const WorkoutBuilder: React.FC<WorkoutBuilderProps> = ({ onClose }) => {
    const { exercises, loading: exercisesLoading, error: exercisesError } = useSheetsExercises();
    const { actions, refresh: refreshActions } = useSheetsActionsOptimized();
    
    // Workout metadata
    const [workoutTitle, setWorkoutTitle] = useState('');
    const [workoutDescription, setWorkoutDescription] = useState('');
    const [workoutType, setWorkoutType] = useState<ActionType>('Protokół Ruchowy');
    const [workoutDuration, setWorkoutDuration] = useState(15);
    const [workoutIcon, setWorkoutIcon] = useState('⚡');
    
    // Workout steps
    const [workoutSteps, setWorkoutSteps] = useState<WorkoutStepBuilder[]>([]);
    const [selectedExerciseId, setSelectedExerciseId] = useState('');
    const [exerciseDuration, setExerciseDuration] = useState(30);
    const [restDuration, setRestDuration] = useState(15);
    
    // Local actions state for development mode
    const [localActions, setLocalActions] = useState<ActionItem[]>([]);
    
    // Convert exercises to array for easier handling
    const exercisesArray = useMemo(() => 
        Object.entries(exercises).map(([id, exercise]) => ({ id, ...exercise })), 
        [exercises]
    );

    const addExerciseStep = () => {
        if (!selectedExerciseId) return;
        
        const newStep: WorkoutStepBuilder = {
            id: `exercise-${Date.now()}`,
            type: 'exercise',
            exerciseId: selectedExerciseId,
            duration: exerciseDuration
        };
        
        setWorkoutSteps(prev => [...prev, newStep]);
        setSelectedExerciseId('');
    };

    const addRestStep = () => {
        const newStep: WorkoutStepBuilder = {
            id: `rest-${Date.now()}`,
            type: 'rest',
            duration: restDuration
        };
        
        setWorkoutSteps(prev => [...prev, newStep]);
    };

    const removeStep = (stepId: string) => {
        setWorkoutSteps(prev => prev.filter(step => step.id !== stepId));
    };

    const moveStep = (stepId: string, direction: 'up' | 'down') => {
        setWorkoutSteps(prev => {
            const index = prev.findIndex(step => step.id === stepId);
            if (index === -1) return prev;
            
            const newSteps = [...prev];
            if (direction === 'up' && index > 0) {
                [newSteps[index - 1], newSteps[index]] = [newSteps[index], newSteps[index - 1]];
            } else if (direction === 'down' && index < newSteps.length - 1) {
                [newSteps[index], newSteps[index + 1]] = [newSteps[index + 1], newSteps[index]];
            }
            
            return newSteps;
        });
    };

    const calculateTotalDuration = () => {
        return workoutSteps.reduce((total, step) => total + step.duration, 0);
    };

    const saveWorkout = async () => {
        if (!workoutTitle.trim() || workoutSteps.length === 0) {
            alert('Proszę wypełnić tytuł i dodać przynajmniej jedno ćwiczenie');
            return;
        }

        try {
            // Convert builder steps to WorkoutStep format
            const workoutStepsFormatted: WorkoutStep[] = workoutSteps.map(step => ({
                type: step.type,
                ...(step.type === 'exercise' ? { exerciseId: step.exerciseId } : {}),
                duration: step.duration
            }));

            // Create action data
            const actionData = {
                title: workoutTitle,
                content: workoutDescription,
                type: workoutType,
                duration: workoutDuration,
                icon: workoutIcon,
                workout: workoutStepsFormatted,
                rules: 'admin' as const, // Admin-only
                triggerTags: ['admin-created']
            };

            // Debug: Log the data being sent
            console.log('🔍 Sending workout data:', actionData);

            // Check if we're in development mode
            const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
            
            if (isLocalhost) {
                console.log('🔍 Development mode - saving to localStorage');
                
                // Generate unique ID for the action
                const actionId = `dev-workout-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
                
                // Convert workout steps to workout string format
                const workoutString = workoutSteps.map(step => {
                    if (step.type === 'exercise') {
                        return `${step.exerciseId} ${step.duration}`;
                    } else {
                        return `R ${step.duration}`;
                    }
                }).join(', ');
                
                // Create new action
                const newAction: ActionItem = {
                    id: actionId,
                    title: workoutTitle,
                    content: workoutDescription,
                    type: workoutType,
                    duration: workoutDuration,
                    icon: workoutIcon,
                    workout: workoutStepsFormatted,
                    rules: 'admin',
                    triggerTags: ['admin-created', 'dev-created']
                };
                
                // Get existing local actions
                const existingActions = JSON.parse(localStorage.getItem('dev-actions') || '[]');
                
                // Add new action
                const updatedActions = [...existingActions, newAction];
                
                // Save to localStorage
                localStorage.setItem('dev-actions', JSON.stringify(updatedActions));
                
                console.log('✅ Workout saved to localStorage:', newAction);
                alert('Trening został zapisany pomyślnie! (Tryb deweloperski)');
                onClose();
                return;
            }

            // Save to Google Sheets via API
            const response = await fetch('/api/add-action', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(actionData)
            });

            if (response.ok) {
                const result = await response.json();
                console.log('✅ Workout saved successfully:', result);
                await refreshActions();
                alert('Trening został zapisany pomyślnie!');
                onClose();
            } else {
                const errorText = await response.text();
                console.error('❌ API Error:', response.status, errorText);
                throw new Error(`Błąd API: ${response.status} - ${errorText}`);
            }
        } catch (error) {
            console.error('❌ Error saving workout:', error);
            const errorMessage = error instanceof Error ? error.message : 'Nieznany błąd';
            alert(`Błąd podczas zapisywania treningu: ${errorMessage}`);
        }
    };

    if (exercisesLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-gray-600 dark:text-system-grey">Ładowanie ćwiczeń...</div>
            </div>
        );
    }

    if (exercisesError) {
        return (
            <div className="flex flex-col items-center justify-center h-64 space-y-4">
                <div className="text-red-600 dark:text-red-400">Błąd podczas ładowania ćwiczeń</div>
                <div className="text-sm text-gray-600 dark:text-system-grey">{exercisesError}</div>
                <button
                    onClick={() => window.location.reload()}
                    className="px-4 py-2 bg-electric-500 text-white rounded-lg hover:bg-electric-600 transition-colors"
                >
                    Odśwież stronę
                </button>
            </div>
        );
    }

    // Debug info
    console.log('🔍 WorkoutBuilder - Exercises loaded:', {
        count: Object.keys(exercises).length,
        exercises: Object.keys(exercises),
        sampleExercise: exercises[Object.keys(exercises)[0]]
    });

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-space-950">
            {/* Header */}
            <div className="bg-white dark:bg-space-900 border-b border-gray-200 dark:border-space-700 px-6 py-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <SettingsIcon className="h-6 w-6 text-electric-500" />
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-cloud-white">
                            Tworzenie treningu
                        </h1>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-600 dark:text-system-grey hover:text-gray-900 dark:hover:text-cloud-white transition-colors"
                    >
                        ✕
                    </button>
                </div>
            </div>

            {/* Main Content - Two Column Layout */}
            <div className="flex h-[calc(100vh-80px)]">
                {/* Left Column - Metadata */}
                <div className="w-1/3 bg-white dark:bg-space-900 border-r border-gray-200 dark:border-space-700 p-6 overflow-y-auto">
                    <div className="space-y-6">
                        {/* Workout Title */}
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-cloud-white mb-2">
                                Name your workout
                            </h2>
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 dark:text-system-grey uppercase tracking-wider mb-2">
                                    DESCRIPTION
                                </label>
                                <textarea
                                    value={workoutDescription}
                                    onChange={(e) => setWorkoutDescription(e.target.value)}
                                    rows={3}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-white/20 rounded-lg bg-white dark:bg-space-800 text-gray-900 dark:text-cloud-white resize-none"
                                    placeholder="Add a description"
                                />
                            </div>
                        </div>

                        {/* Workout Settings */}
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 dark:text-system-grey uppercase tracking-wider mb-2">
                                    TITLE
                                </label>
                                <input
                                    type="text"
                                    value={workoutTitle}
                                    onChange={(e) => setWorkoutTitle(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-white/20 rounded-lg bg-white dark:bg-space-800 text-gray-900 dark:text-cloud-white"
                                    placeholder="Workout name"
                                />
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 dark:text-system-grey uppercase tracking-wider mb-2">
                                        TYPE
                                    </label>
                                    <select
                                        value={workoutType}
                                        onChange={(e) => setWorkoutType(e.target.value as ActionType)}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-white/20 rounded-lg bg-white dark:bg-space-800 text-gray-900 dark:text-cloud-white"
                                    >
                                        <option value="Protokół Ruchowy">Protokół Ruchowy</option>
                                        <option value="Reset Energetyczny">Reset Energetyczny</option>
                                    </select>
                                </div>
                                
                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 dark:text-system-grey uppercase tracking-wider mb-2">
                                        DURATION
                                    </label>
                                    <input
                                        type="number"
                                        value={workoutDuration}
                                        onChange={(e) => setWorkoutDuration(parseInt(e.target.value) || 15)}
                                        min="1"
                                        max="60"
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-white/20 rounded-lg bg-white dark:bg-space-800 text-gray-900 dark:text-cloud-white"
                                    />
                                </div>
                            </div>
                            
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 dark:text-system-grey uppercase tracking-wider mb-2">
                                    ICON
                                </label>
                                <input
                                    type="text"
                                    value={workoutIcon}
                                    onChange={(e) => setWorkoutIcon(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-white/20 rounded-lg bg-white dark:bg-space-800 text-gray-900 dark:text-cloud-white"
                                    placeholder="⚡"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column - Builder */}
                <div className="w-2/3 bg-gray-50 dark:bg-space-950 p-6 pb-24 overflow-y-auto">
                    <div className="space-y-4">
                        {/* Add Exercise Section */}
                        <div className="bg-white dark:bg-space-900 rounded-xl shadow-sm p-4">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="flex-1">
                                    <div className="relative">
                                        <input
                                            type="text"
                                            placeholder="Choose Exercise"
                                            value={selectedExerciseId ? exercises[selectedExerciseId]?.name || '' : ''}
                                            readOnly
                                            className="w-full px-3 py-2 pr-10 border border-gray-300 dark:border-white/20 rounded-lg bg-white dark:bg-space-800 text-gray-900 dark:text-cloud-white cursor-pointer"
                                        />
                                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                                            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                            </svg>
                                        </div>
                                    </div>
                                </div>
                                <button
                                    onClick={addRestStep}
                                    className="px-4 py-2 bg-gray-100 dark:bg-space-800 text-gray-700 dark:text-system-grey rounded-lg hover:bg-gray-200 dark:hover:bg-space-700 transition-colors"
                                >
                                    Add Break
                                </button>
                            </div>
                            
                            {/* Exercise Dropdown */}
                            <div className="mb-4">
                                <select
                                    value={selectedExerciseId}
                                    onChange={(e) => setSelectedExerciseId(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-white/20 rounded-lg bg-white dark:bg-space-800 text-gray-900 dark:text-cloud-white"
                                >
                                    <option value="">-- Wybierz ćwiczenie --</option>
                                    {exercisesArray.map(exercise => (
                                        <option key={exercise.id} value={exercise.id}>
                                            {exercise.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 dark:text-system-grey uppercase tracking-wider mb-2">
                                        EXERCISE TIME (SEC)
                                    </label>
                                    <input
                                        type="number"
                                        value={exerciseDuration}
                                        onChange={(e) => setExerciseDuration(parseInt(e.target.value) || 30)}
                                        min="5"
                                        max="300"
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-white/20 rounded-lg bg-white dark:bg-space-800 text-gray-900 dark:text-cloud-white"
                                    />
                                </div>
                                
                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 dark:text-system-grey uppercase tracking-wider mb-2">
                                        REST TIME (SEC)
                                    </label>
                                    <input
                                        type="number"
                                        value={restDuration}
                                        onChange={(e) => setRestDuration(parseInt(e.target.value) || 15)}
                                        min="5"
                                        max="120"
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-white/20 rounded-lg bg-white dark:bg-space-800 text-gray-900 dark:text-cloud-white"
                                    />
                                </div>
                            </div>
                            
                            <button
                                onClick={addExerciseStep}
                                disabled={!selectedExerciseId}
                                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-electric-500 text-white rounded-lg hover:bg-electric-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <PlusIcon className="h-4 w-4" />
                                Add Exercise
                            </button>
                        </div>

                        {/* Workout Steps - Modern Design */}
                        {workoutSteps.length > 0 && (
                            <div className="space-y-3">
                                {workoutSteps.map((step, index) => (
                                    <div
                                        key={step.id}
                                        className="bg-white dark:bg-space-900 rounded-xl shadow-sm border border-gray-200 dark:border-space-700"
                                    >
                                        {/* Separator */}
                                        {index > 0 && (
                                            <div className="flex items-center justify-center py-2">
                                                <div className="w-8 h-0.5 bg-gray-300 dark:bg-space-600"></div>
                                            </div>
                                        )}
                                        
                                        <div className="p-4">
                                            {step.type === 'exercise' ? (
                                                <div className="flex items-start gap-4">
                                                    {/* Exercise Thumbnail */}
                                                    <div className="w-16 h-16 bg-gray-100 dark:bg-space-800 rounded-lg flex items-center justify-center flex-shrink-0">
                                                        <PlayIcon className="h-6 w-6 text-gray-600 dark:text-system-grey" />
                                                    </div>
                                                    
                                                    {/* Exercise Details */}
                                                    <div className="flex-1">
                                                        <div className="flex items-center justify-between mb-2">
                                                            <h3 className="font-semibold text-gray-900 dark:text-cloud-white text-lg">
                                                                {exercises[step.exerciseId]?.name || 'Nieznane ćwiczenie'}
                                                            </h3>
                                                            <div className="flex items-center gap-2">
                                                                <button
                                                                    onClick={() => moveStep(step.id, 'up')}
                                                                    disabled={index === 0}
                                                                    className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                                                                >
                                                                    ↑
                                                                </button>
                                                                <button
                                                                    onClick={() => moveStep(step.id, 'down')}
                                                                    disabled={index === workoutSteps.length - 1}
                                                                    className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                                                                >
                                                                    ↓
                                                                </button>
                                                                <button
                                                                    onClick={() => removeStep(step.id)}
                                                                    className="p-1 text-red-400 hover:text-red-600 transition-colors"
                                                                >
                                                                    <TrashIcon className="h-4 w-4" />
                                                                </button>
                                                            </div>
                                                        </div>
                                                        
                                                        {/* Exercise Table */}
                                                        <div className="bg-gray-50 dark:bg-space-800 rounded-lg p-3">
                                                            <div className="grid grid-cols-4 gap-4 text-xs font-medium text-gray-500 dark:text-system-grey mb-2">
                                                                <div>Set</div>
                                                                <div>Duration</div>
                                                                <div>Rest</div>
                                                                <div>Type</div>
                                                            </div>
                                                            <div className="grid grid-cols-4 gap-4 text-sm">
                                                                <div className="font-medium">1</div>
                                                                <div>{step.duration}s</div>
                                                                <div>00:00</div>
                                                                <div>Exercise</div>
                                                            </div>
                                                        </div>
                                                        
                                                        {/* Note Field */}
                                                        <div className="mt-3">
                                                            <input
                                                                type="text"
                                                                placeholder="Add note for this exercise"
                                                                className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-space-600 rounded-lg bg-white dark:bg-space-800 text-gray-900 dark:text-cloud-white"
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-4">
                                                    {/* Rest Icon */}
                                                    <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center flex-shrink-0">
                                                        <ClockIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                                                    </div>
                                                    
                                                    {/* Rest Details */}
                                                    <div className="flex-1">
                                                        <div className="flex items-center justify-between mb-2">
                                                            <h3 className="font-semibold text-gray-900 dark:text-cloud-white text-lg">
                                                                Rest Period
                                                            </h3>
                                                            <div className="flex items-center gap-2">
                                                                <button
                                                                    onClick={() => moveStep(step.id, 'up')}
                                                                    disabled={index === 0}
                                                                    className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                                                                >
                                                                    ↑
                                                                </button>
                                                                <button
                                                                    onClick={() => moveStep(step.id, 'down')}
                                                                    disabled={index === workoutSteps.length - 1}
                                                                    className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                                                                >
                                                                    ↓
                                                                </button>
                                                                <button
                                                                    onClick={() => removeStep(step.id)}
                                                                    className="p-1 text-red-400 hover:text-red-600 transition-colors"
                                                                >
                                                                    <TrashIcon className="h-4 w-4" />
                                                                </button>
                                                            </div>
                                                        </div>
                                                        
                                                        <div className="bg-blue-50 dark:bg-blue-900/10 rounded-lg p-3">
                                                            <div className="text-sm text-blue-700 dark:text-blue-300">
                                                                Duration: {step.duration} seconds
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Save Button - Fixed at bottom */}
            <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-space-900 border-t border-gray-200 dark:border-space-700 px-6 py-4">
                <div className="flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 text-gray-600 dark:text-system-grey hover:text-gray-900 dark:hover:text-cloud-white transition-colors"
                    >
                        Cancel
                    </button>
                    
                    <button
                        onClick={saveWorkout}
                        disabled={!workoutTitle.trim() || workoutSteps.length === 0}
                        className="flex items-center gap-2 px-6 py-2 bg-electric-500 text-white rounded-lg hover:bg-electric-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        <SaveIcon className="h-4 w-4" />
                        Save Workout
                    </button>
                </div>
            </div>
        </div>
    );
};
