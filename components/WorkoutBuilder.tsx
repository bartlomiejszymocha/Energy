import React, { useState, useMemo, useCallback } from 'react';
import { useSheetsExercises } from '../hooks/useSheetsExercises';
import { useSheetsActionsOptimized } from '../hooks/useSheetsActionsOptimized';
import type { Exercise, WorkoutStep, ActionItem, ActionType } from '../types';
import { PlusIcon, TrashIcon, SaveIcon, PlayIcon, ClockIcon, SettingsIcon } from './icons/LucideIcons';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
    useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface WorkoutBuilderProps {
    onClose: () => void;
}

interface WorkoutStepBuilder {
    id: string;
    type: 'exercise';
    exerciseId: string;
    duration: number;
}

// Sortable Exercise Item Component
interface SortableExerciseItemProps {
    step: WorkoutStepBuilder;
    index: number;
    exercises: { [key: string]: Exercise };
    restDuration: number;
    onMoveUp: (stepId: string) => void;
    onMoveDown: (stepId: string) => void;
    onRemove: (stepId: string) => void;
    isFirst: boolean;
    isLast: boolean;
}

const SortableExerciseItem: React.FC<SortableExerciseItemProps> = ({
    step,
    index,
    exercises,
    restDuration,
    onMoveUp,
    onMoveDown,
    onRemove,
    isFirst,
    isLast,
}) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: step.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className="bg-white dark:bg-space-900 rounded-lg border border-gray-100 dark:border-space-800 p-3"
        >
            <div className="flex items-center gap-3">
                {/* Drag Handle */}
                <div
                    {...attributes}
                    {...listeners}
                    className="w-6 h-6 flex items-center justify-center cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    title="Przeciągnij aby zmienić kolejność"
                >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                    </svg>
                </div>

                {/* Exercise Icon */}
                <div className="w-10 h-10 bg-gray-50 dark:bg-space-800 rounded-md flex items-center justify-center flex-shrink-0">
                    <PlayIcon className="h-4 w-4 text-gray-500 dark:text-system-grey" />
                </div>
                
                {/* Exercise Details */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="font-medium text-gray-900 dark:text-cloud-white text-sm truncate">
                            {exercises[step.exerciseId]?.name || 'Nieznane ćwiczenie'}
                        </h3>
                        <div className="flex items-center gap-1 ml-2">
                            <button
                                onClick={() => onMoveUp(step.id)}
                                disabled={isFirst}
                                className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30 rounded hover:bg-gray-100 dark:hover:bg-space-800"
                                title="Przenieś w górę"
                            >
                                ↑
                            </button>
                            <button
                                onClick={() => onMoveDown(step.id)}
                                disabled={isLast}
                                className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30 rounded hover:bg-gray-100 dark:hover:bg-space-800"
                                title="Przenieś w dół"
                            >
                                ↓
                            </button>
                            <button
                                onClick={() => onRemove(step.id)}
                                className="p-1 text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors rounded"
                                title="Usuń ćwiczenie"
                            >
                                <TrashIcon className="h-3 w-3" />
                            </button>
                        </div>
                    </div>
                    
                    {/* Exercise Info - Compact */}
                    <div className="flex items-center gap-4 text-xs text-gray-600 dark:text-system-grey">
                        <span>Czas: {step.duration}s</span>
                        <span>Przerwa: {restDuration}s</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export const WorkoutBuilder: React.FC<WorkoutBuilderProps> = ({ onClose }) => {
    const { exercises, loading: exercisesLoading, error: exercisesError } = useSheetsExercises();
    const { actions, refresh: refreshActions } = useSheetsActionsOptimized();
    
    // Drag and Drop sensors
    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );
    
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

    // Drag and Drop handler
    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (active.id !== over?.id) {
            setWorkoutSteps((items) => {
                const oldIndex = items.findIndex(item => item.id === active.id);
                const newIndex = items.findIndex(item => item.id === over?.id);

                return arrayMove(items, oldIndex, newIndex);
            });
        }
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
            // Convert builder steps to WorkoutStep format with automatic rest periods
            const workoutStepsFormatted: WorkoutStep[] = [];
            workoutSteps.forEach((step, index) => {
                // Add exercise
                workoutStepsFormatted.push({
                    type: 'exercise',
                    exerciseId: step.exerciseId,
                    duration: step.duration
                });
                
                // Add rest period after each exercise (except the last one)
                if (index < workoutSteps.length - 1) {
                    workoutStepsFormatted.push({
                        type: 'rest',
                        duration: restDuration
                    });
                }
            });

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
                
                // Convert workout steps to workout string format with automatic rest periods
                const workoutStringParts: string[] = [];
                workoutSteps.forEach((step, index) => {
                    workoutStringParts.push(`${step.exerciseId} ${step.duration}`);
                    if (index < workoutSteps.length - 1) {
                        workoutStringParts.push(`R ${restDuration}`);
                    }
                });
                const workoutString = workoutStringParts.join(', ');
                
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
            <div className="bg-white dark:bg-space-900 border-b border-gray-100 dark:border-space-800 px-8 py-3">
                <div className="flex items-center justify-between max-w-6xl mx-auto">
                    <div className="flex items-center gap-2">
                        <SettingsIcon className="h-5 w-5 text-electric-500" />
                        <h1 className="text-xl font-semibold text-gray-900 dark:text-cloud-white">
                            Tworzenie treningu
                        </h1>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 dark:text-system-grey hover:text-gray-600 dark:hover:text-cloud-white transition-colors p-1"
                    >
                        ✕
                    </button>
                </div>
            </div>

            {/* Main Content - Two Column Layout */}
            <div className="flex h-[calc(100vh-80px)] max-w-6xl mx-auto">
                {/* Left Column - Metadata */}
                <div className="w-1/3 bg-white dark:bg-space-900 border-r border-gray-100 dark:border-space-800 p-8 overflow-y-auto">
                    <div className="space-y-8">
                        {/* Workout Title */}
                        <div>
                            <h2 className="text-2xl font-semibold text-gray-900 dark:text-cloud-white mb-4">
                                Nazwij swój trening
                            </h2>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-system-grey mb-2">
                                    Opis
                                </label>
                                <textarea
                                    value={workoutDescription}
                                    onChange={(e) => setWorkoutDescription(e.target.value)}
                                    rows={3}
                                    className="w-full px-3 py-2 border border-gray-200 dark:border-space-700 rounded-md bg-white dark:bg-space-800 text-gray-900 dark:text-cloud-white resize-none focus:ring-2 focus:ring-electric-500/20 focus:border-electric-500"
                                    placeholder="Dodaj opis treningu"
                                />
                            </div>
                        </div>

                        {/* Workout Settings */}
                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-system-grey mb-2">
                                    Tytuł
                                </label>
                                <input
                                    type="text"
                                    value={workoutTitle}
                                    onChange={(e) => setWorkoutTitle(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-200 dark:border-space-700 rounded-md bg-white dark:bg-space-800 text-gray-900 dark:text-cloud-white focus:ring-2 focus:ring-electric-500/20 focus:border-electric-500"
                                    placeholder="Nazwa treningu"
                                />
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-system-grey mb-2">
                                        Typ
                                    </label>
                                    <select
                                        value={workoutType}
                                        onChange={(e) => setWorkoutType(e.target.value as ActionType)}
                                        className="w-full px-3 py-2 border border-gray-200 dark:border-space-700 rounded-md bg-white dark:bg-space-800 text-gray-900 dark:text-cloud-white focus:ring-2 focus:ring-electric-500/20 focus:border-electric-500"
                                    >
                                        <option value="Protokół Ruchowy">Protokół Ruchowy</option>
                                        <option value="Reset Energetyczny">Reset Energetyczny</option>
                                    </select>
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-system-grey mb-2">
                                        Czas (min)
                                    </label>
                                    <input
                                        type="number"
                                        value={workoutDuration}
                                        onChange={(e) => setWorkoutDuration(parseInt(e.target.value) || 15)}
                                        min="1"
                                        max="60"
                                        className="w-full px-3 py-2 border border-gray-200 dark:border-space-700 rounded-md bg-white dark:bg-space-800 text-gray-900 dark:text-cloud-white focus:ring-2 focus:ring-electric-500/20 focus:border-electric-500"
                                    />
                                </div>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-system-grey mb-2">
                                    Ikona
                                </label>
                                <input
                                    type="text"
                                    value={workoutIcon}
                                    onChange={(e) => setWorkoutIcon(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-200 dark:border-space-700 rounded-md bg-white dark:bg-space-800 text-gray-900 dark:text-cloud-white focus:ring-2 focus:ring-electric-500/20 focus:border-electric-500"
                                    placeholder="⚡"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column - Builder */}
                <div className="w-2/3 bg-gray-50 dark:bg-space-950 p-8 pb-24 overflow-y-auto">
                    <div className="space-y-6">
                        {/* Add Exercise Section */}
                        <div className="bg-white dark:bg-space-900 rounded-lg border border-gray-100 dark:border-space-800 p-4">
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 dark:text-system-grey mb-2">
                                    Wybierz ćwiczenie
                                </label>
                                <select
                                    value={selectedExerciseId}
                                    onChange={(e) => setSelectedExerciseId(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-200 dark:border-space-700 rounded-md bg-white dark:bg-space-800 text-gray-900 dark:text-cloud-white focus:ring-2 focus:ring-electric-500/20 focus:border-electric-500"
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
                                    <label className="block text-sm font-medium text-gray-700 dark:text-system-grey mb-2">
                                        Czas ćwiczenia (sek)
                                    </label>
                                    <input
                                        type="number"
                                        value={exerciseDuration}
                                        onChange={(e) => setExerciseDuration(parseInt(e.target.value) || 30)}
                                        min="5"
                                        max="300"
                                        className="w-full px-3 py-2 border border-gray-200 dark:border-space-700 rounded-md bg-white dark:bg-space-800 text-gray-900 dark:text-cloud-white focus:ring-2 focus:ring-electric-500/20 focus:border-electric-500"
                                    />
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-system-grey mb-2">
                                        Przerwa między (sek)
                                    </label>
                                    <input
                                        type="number"
                                        value={restDuration}
                                        onChange={(e) => setRestDuration(parseInt(e.target.value) || 15)}
                                        min="5"
                                        max="120"
                                        className="w-full px-3 py-2 border border-gray-200 dark:border-space-700 rounded-md bg-white dark:bg-space-800 text-gray-900 dark:text-cloud-white focus:ring-2 focus:ring-electric-500/20 focus:border-electric-500"
                                    />
                                </div>
                            </div>
                            
                            <button
                                onClick={addExerciseStep}
                                disabled={!selectedExerciseId}
                                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-electric-500 text-white rounded-md hover:bg-electric-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                            >
                                <PlusIcon className="h-4 w-4" />
                                Dodaj ćwiczenie
                            </button>
                        </div>

                        {/* Workout Steps - Drag and Drop */}
                        {workoutSteps.length > 0 && (
                            <DndContext
                                sensors={sensors}
                                collisionDetection={closestCenter}
                                onDragEnd={handleDragEnd}
                            >
                                <SortableContext
                                    items={workoutSteps.map(step => step.id)}
                                    strategy={verticalListSortingStrategy}
                                >
                                    <div className="space-y-3">
                                        {workoutSteps.map((step, index) => (
                                            <SortableExerciseItem
                                                key={step.id}
                                                step={step}
                                                index={index}
                                                exercises={exercises}
                                                restDuration={restDuration}
                                                onMoveUp={moveStep}
                                                onMoveDown={moveStep}
                                                onRemove={removeStep}
                                                isFirst={index === 0}
                                                isLast={index === workoutSteps.length - 1}
                                            />
                                        ))}
                                    </div>
                                </SortableContext>
                            </DndContext>
                        )}
                    </div>
                </div>
            </div>

            {/* Save Button - Fixed at bottom */}
            <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-space-900 border-t border-gray-100 dark:border-space-800 px-8 py-4">
                <div className="flex justify-end gap-3 max-w-6xl mx-auto">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 text-gray-500 dark:text-system-grey hover:text-gray-700 dark:hover:text-cloud-white transition-colors font-medium"
                    >
                        Anuluj
                    </button>
                    
                    <button
                        onClick={saveWorkout}
                        disabled={!workoutTitle.trim() || workoutSteps.length === 0}
                        className="flex items-center gap-2 px-6 py-2 bg-electric-500 text-white rounded-md hover:bg-electric-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                    >
                        <SaveIcon className="h-4 w-4" />
                        Zapisz trening
                    </button>
                </div>
            </div>
        </div>
    );
};
