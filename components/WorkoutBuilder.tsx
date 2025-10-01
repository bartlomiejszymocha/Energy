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
    const { exercises, loading: exercisesLoading } = useSheetsExercises();
    const { refresh: refreshActions } = useSheetsActionsOptimized();
    
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
                rules: 'priv' as const, // Admin-only
                triggerTags: ['admin-created']
            };

            // Save to Google Sheets via API
            const response = await fetch('/api/add-action', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(actionData)
            });

            if (response.ok) {
                await refreshActions();
                alert('Trening został zapisany pomyślnie!');
                onClose();
            } else {
                throw new Error('Błąd podczas zapisywania treningu');
            }
        } catch (error) {
            console.error('Error saving workout:', error);
            alert('Błąd podczas zapisywania treningu');
        }
    };

    if (exercisesLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-gray-600 dark:text-system-grey">Ładowanie ćwiczeń...</div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto p-6 space-y-6">
            {/* Header */}
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

            {/* Workout Metadata */}
            <div className="bg-white dark:bg-space-900 rounded-xl shadow-lg p-6 space-y-4">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-cloud-white">
                    Informacje o treningu
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-system-grey mb-2">
                            Tytuł treningu *
                        </label>
                        <input
                            type="text"
                            value={workoutTitle}
                            onChange={(e) => setWorkoutTitle(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-white/20 rounded-lg bg-white dark:bg-space-800 text-gray-900 dark:text-cloud-white"
                            placeholder="np. Poranny Kickstarter"
                        />
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-system-grey mb-2">
                            Typ akcji
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
                        <label className="block text-sm font-medium text-gray-700 dark:text-system-grey mb-2">
                            Czas trwania (minuty)
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
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-system-grey mb-2">
                            Ikona
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
                
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-system-grey mb-2">
                        Opis treningu
                    </label>
                    <textarea
                        value={workoutDescription}
                        onChange={(e) => setWorkoutDescription(e.target.value)}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-white/20 rounded-lg bg-white dark:bg-space-800 text-gray-900 dark:text-cloud-white"
                        placeholder="Opisz trening, jego cel i korzyści..."
                    />
                </div>
            </div>

            {/* Add Exercise/Rest */}
            <div className="bg-white dark:bg-space-900 rounded-xl shadow-lg p-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-cloud-white mb-4">
                    Dodaj ćwiczenie lub przerwę
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-system-grey mb-2">
                            Wybierz ćwiczenie
                        </label>
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
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-system-grey mb-2">
                            Czas ćwiczenia (sekundy)
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
                        <label className="block text-sm font-medium text-gray-700 dark:text-system-grey mb-2">
                            Czas przerwy (sekundy)
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
                
                <div className="flex gap-3">
                    <button
                        onClick={addExerciseStep}
                        disabled={!selectedExerciseId}
                        className="flex items-center gap-2 px-4 py-2 bg-electric-500 text-white rounded-lg hover:bg-electric-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        <PlusIcon className="h-4 w-4" />
                        Dodaj ćwiczenie
                    </button>
                    
                    <button
                        onClick={addRestStep}
                        className="flex items-center gap-2 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                    >
                        <ClockIcon className="h-4 w-4" />
                        Dodaj przerwę
                    </button>
                </div>
            </div>

            {/* Workout Steps */}
            {workoutSteps.length > 0 && (
                <div className="bg-white dark:bg-space-900 rounded-xl shadow-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-cloud-white">
                            Plan treningu ({workoutSteps.length} kroków)
                        </h2>
                        <div className="text-sm text-gray-600 dark:text-system-grey">
                            Całkowity czas: {Math.round(calculateTotalDuration() / 60)} min
                        </div>
                    </div>
                    
                    <div className="space-y-2">
                        {workoutSteps.map((step, index) => (
                            <div
                                key={step.id}
                                className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-space-800 rounded-lg"
                            >
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
                                </div>
                                
                                <div className="flex-1">
                                    {step.type === 'exercise' ? (
                                        <div className="flex items-center gap-2">
                                            <PlayIcon className="h-4 w-4 text-green-500" />
                                            <span className="font-medium">
                                                {exercises[step.exerciseId]?.name || 'Nieznane ćwiczenie'}
                                            </span>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-2">
                                            <ClockIcon className="h-4 w-4 text-blue-500" />
                                            <span className="font-medium">Odpoczynek</span>
                                        </div>
                                    )}
                                </div>
                                
                                <div className="text-sm text-gray-600 dark:text-system-grey">
                                    {step.duration} sek
                                </div>
                                
                                <button
                                    onClick={() => removeStep(step.id)}
                                    className="p-1 text-red-400 hover:text-red-600 transition-colors"
                                >
                                    <TrashIcon className="h-4 w-4" />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Save Button */}
            <div className="flex justify-end gap-3">
                <button
                    onClick={onClose}
                    className="px-6 py-2 text-gray-600 dark:text-system-grey hover:text-gray-900 dark:hover:text-cloud-white transition-colors"
                >
                    Anuluj
                </button>
                
                <button
                    onClick={saveWorkout}
                    disabled={!workoutTitle.trim() || workoutSteps.length === 0}
                    className="flex items-center gap-2 px-6 py-2 bg-electric-500 text-white rounded-lg hover:bg-electric-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    <SaveIcon className="h-4 w-4" />
                    Zapisz trening
                </button>
            </div>
        </div>
    );
};
