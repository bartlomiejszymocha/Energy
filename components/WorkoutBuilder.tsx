import React, { useState, useMemo, useCallback } from 'react';
import { useSheetsExercises } from '../hooks/useSheetsExercises';
import { useSheetsActionsOptimized } from '../hooks/useSheetsActionsOptimized';
import type { Exercise, WorkoutStep, ActionItem, ActionType } from '../types';
import { PlusIcon, TrashIcon, SaveIcon, PlayIcon, ClockIcon, SettingsIcon, FileTextIcon, TimerIcon, ZapIcon, TargetIcon, EditIcon, MoveIcon, XIcon } from './icons/LucideIcons';
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
    restDuration: number; // Individual rest duration for each exercise
}

// Sortable Exercise Item Component
interface SortableExerciseItemProps {
    step: WorkoutStepBuilder;
    index: number;
    exercises: { [key: string]: Exercise };
    onMoveUp: (stepId: string) => void;
    onMoveDown: (stepId: string) => void;
    onRemove: (stepId: string) => void;
    onUpdateRestDuration: (stepId: string, restDuration: number) => void;
    isFirst: boolean;
    isLast: boolean;
}

const SortableExerciseItem: React.FC<SortableExerciseItemProps> = ({
    step,
    index,
    exercises,
    onMoveUp,
    onMoveDown,
    onRemove,
    onUpdateRestDuration,
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
            className="backdrop-blur-xl bg-white/60 dark:bg-space-900/60 rounded-2xl border border-white/30 dark:border-space-700/30 p-4 shadow-lg hover:shadow-xl transition-all duration-200"
        >
            <div className="flex items-center gap-4">
                {/* Drag Handle */}
                <div
                    {...attributes}
                    {...listeners}
                    className="w-8 h-8 flex items-center justify-center cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-white/50 dark:hover:bg-space-800/50 transition-all duration-200"
                    title="Przeciągnij aby zmienić kolejność"
                >
                    <MoveIcon className="w-4 h-4" />
                </div>

                {/* Exercise Icon */}
                <div className="w-12 h-12 bg-gradient-to-r from-green-500/20 to-emerald-500/20 dark:from-green-500/10 dark:to-emerald-500/10 rounded-xl flex items-center justify-center flex-shrink-0 backdrop-blur-sm">
                    <PlayIcon className="h-5 w-5 text-green-500" />
                </div>
                
                {/* Exercise Details */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="font-semibold text-gray-900 dark:text-cloud-white text-base truncate">
                            {exercises[step.exerciseId]?.name || 'Nieznane ćwiczenie'}
                        </h3>
                        <div className="flex items-center gap-1 ml-2">
                            <button
                                onClick={() => onMoveUp(step.id)}
                                disabled={isFirst}
                                className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-30 rounded-lg hover:bg-white/50 dark:hover:bg-space-800/50 transition-all duration-200"
                                title="Przenieś w górę"
                            >
                                ↑
                            </button>
                            <button
                                onClick={() => onMoveDown(step.id)}
                                disabled={isLast}
                                className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-30 rounded-lg hover:bg-white/50 dark:hover:bg-space-800/50 transition-all duration-200"
                                title="Przenieś w dół"
                            >
                                ↓
                            </button>
                            <button
                                onClick={() => onRemove(step.id)}
                                className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50/50 dark:hover:bg-red-900/20 transition-all duration-200 rounded-lg"
                                title="Usuń ćwiczenie"
                            >
                                <TrashIcon className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                    
                    {/* Exercise Info - Enhanced */}
                    <div className="flex items-center gap-6 text-sm text-gray-600 dark:text-system-grey">
                        <div className="flex items-center gap-1">
                            <TimerIcon className="h-4 w-4" />
                            <span>{step.duration}s</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <ClockIcon className="h-4 w-4" />
                            <input
                                type="number"
                                value={step.restDuration}
                                onChange={(e) => onUpdateRestDuration(step.id, parseInt(e.target.value) || 15)}
                                min="5"
                                max="120"
                                className="w-16 px-2 py-1 text-xs border border-white/30 dark:border-space-700/50 rounded-md bg-white/50 dark:bg-space-800/50 backdrop-blur-sm text-gray-900 dark:text-cloud-white focus:ring-1 focus:ring-electric-500/30 focus:border-electric-500/50 transition-all duration-200"
                            />
                            <span>s</span>
                        </div>
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
            duration: exerciseDuration,
            restDuration: restDuration
        };
        
        setWorkoutSteps(prev => [...prev, newStep]);
        setSelectedExerciseId('');
    };


    const removeStep = (stepId: string) => {
        setWorkoutSteps(prev => prev.filter(step => step.id !== stepId));
    };

    const updateStepRestDuration = (stepId: string, newRestDuration: number) => {
        setWorkoutSteps(prev => prev.map(step => 
            step.id === stepId 
                ? { ...step, restDuration: newRestDuration }
                : step
        ));
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
            // Convert builder steps to WorkoutStep format with individual rest periods
            const workoutStepsFormatted: WorkoutStep[] = [];
            workoutSteps.forEach((step, index) => {
                // Add exercise
                workoutStepsFormatted.push({
                    type: 'exercise',
                    exerciseId: step.exerciseId,
                    duration: step.duration
                });
                
                // Add rest period after each exercise (except the last one) using individual rest duration
                if (index < workoutSteps.length - 1) {
                    workoutStepsFormatted.push({
                        type: 'rest',
                        duration: step.restDuration
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
                
                // Convert workout steps to workout string format with individual rest periods
                const workoutStringParts: string[] = [];
                workoutSteps.forEach((step, index) => {
                    workoutStringParts.push(`${step.exerciseId} ${step.duration}`);
                    if (index < workoutSteps.length - 1) {
                        workoutStringParts.push(`R ${step.restDuration}`);
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
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 dark:from-space-950 dark:via-space-900 dark:to-space-800">
            {/* Header */}
            <div className="backdrop-blur-xl bg-white/80 dark:bg-space-900/80 border-b border-white/20 dark:border-space-700/50 px-4 md:px-8 py-3 shadow-lg">
                <div className="flex items-center justify-between w-full max-w-4xl mx-auto">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-gradient-to-r from-electric-500/20 to-blue-500/20 backdrop-blur-sm">
                            <SettingsIcon className="h-5 w-5 text-electric-500" />
                        </div>
                        <h1 className="text-lg md:text-xl font-semibold text-gray-900 dark:text-cloud-white">
                            Tworzenie treningu
                        </h1>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-lg text-gray-400 dark:text-system-grey hover:text-gray-600 dark:hover:text-cloud-white hover:bg-white/50 dark:hover:bg-space-800/50 transition-all duration-200"
                    >
                        <XIcon className="h-5 w-5" />
                    </button>
                </div>
            </div>

            {/* Main Content - Single Scroll Layout */}
            <div className="flex-1 overflow-y-auto">
                <div className="flex flex-col md:flex-row min-h-full">
                    {/* Left Column - Metadata - Sticky to left on desktop */}
                    <div className="w-full md:w-80 md:flex-shrink-0 backdrop-blur-xl bg-white/70 dark:bg-space-900/70 border-b md:border-b-0 md:border-r border-white/20 dark:border-space-700/30 p-4 md:p-8 shadow-xl">
                        <div className="space-y-6 md:space-y-8">
                        {/* Workout Title */}
                        <div>
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 rounded-lg bg-gradient-to-r from-purple-500/20 to-pink-500/20 backdrop-blur-sm">
                                    <EditIcon className="h-5 w-5 text-purple-500" />
                                </div>
                                <input
                                    type="text"
                                    value={workoutTitle}
                                    onChange={(e) => setWorkoutTitle(e.target.value)}
                                    className="flex-1 text-xl md:text-2xl font-semibold text-gray-900 dark:text-cloud-white bg-transparent border-none outline-none focus:ring-2 focus:ring-purple-500/30 rounded-lg px-2 py-1 min-w-0"
                                    placeholder="Nazwij swój trening"
                                />
                            </div>
                                <div className="space-y-4 md:space-y-6">
                                    <div>
                                        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-system-grey mb-2">
                                            <FileTextIcon className="h-4 w-4" />
                                            Opis
                                        </label>
                                        <textarea
                                            value={workoutDescription}
                                            onChange={(e) => setWorkoutDescription(e.target.value)}
                                            rows={3}
                                            className="w-full px-4 py-3 border border-white/30 dark:border-space-700/50 rounded-xl bg-white/50 dark:bg-space-800/50 backdrop-blur-sm text-gray-900 dark:text-cloud-white resize-none focus:ring-2 focus:ring-electric-500/30 focus:border-electric-500/50 transition-all duration-200"
                                            placeholder="Dodaj opis treningu"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Workout Settings */}
                            <div className="space-y-4 md:space-y-6">
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-system-grey mb-2">
                                            <SettingsIcon className="h-4 w-4" />
                                            Typ
                                        </label>
                                        <select
                                            value={workoutType}
                                            onChange={(e) => setWorkoutType(e.target.value as ActionType)}
                                            className="w-full px-4 py-3 border border-white/30 dark:border-space-700/50 rounded-xl bg-white/50 dark:bg-space-800/50 backdrop-blur-sm text-gray-900 dark:text-cloud-white focus:ring-2 focus:ring-electric-500/30 focus:border-electric-500/50 transition-all duration-200"
                                        >
                                            <option value="Protokół Ruchowy">Protokół Ruchowy</option>
                                            <option value="Reset Energetyczny">Reset Energetyczny</option>
                                        </select>
                                    </div>
                                    
                                    <div>
                                        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-system-grey mb-2">
                                            <TimerIcon className="h-4 w-4" />
                                            Czas (min)
                                        </label>
                                        <input
                                            type="number"
                                            value={workoutDuration}
                                            onChange={(e) => setWorkoutDuration(parseInt(e.target.value) || 15)}
                                            min="1"
                                            max="60"
                                            className="w-full px-4 py-3 border border-white/30 dark:border-space-700/50 rounded-xl bg-white/50 dark:bg-space-800/50 backdrop-blur-sm text-gray-900 dark:text-cloud-white focus:ring-2 focus:ring-electric-500/30 focus:border-electric-500/50 transition-all duration-200"
                                        />
                                    </div>
                                </div>
                                
                                <div>
                                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-system-grey mb-2">
                                        <ZapIcon className="h-4 w-4" />
                                        Ikona
                                    </label>
                                    <input
                                        type="text"
                                        value={workoutIcon}
                                        onChange={(e) => setWorkoutIcon(e.target.value)}
                                        className="w-full px-4 py-3 border border-white/30 dark:border-space-700/50 rounded-xl bg-white/50 dark:bg-space-800/50 backdrop-blur-sm text-gray-900 dark:text-cloud-white focus:ring-2 focus:ring-electric-500/30 focus:border-electric-500/50 transition-all duration-200"
                                        placeholder="⚡"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Builder - Centered */}
                    <div className="w-full md:flex-1 p-4 md:p-8 pb-24">
                        <div className="w-full max-w-4xl mx-auto">
                        <div className="space-y-6">
                        {/* Add Exercise Section */}
                        <div className="backdrop-blur-xl bg-white/60 dark:bg-space-900/60 rounded-2xl border border-white/30 dark:border-space-700/30 p-6 shadow-xl">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2 rounded-lg bg-gradient-to-r from-blue-500/20 to-cyan-500/20 backdrop-blur-sm">
                                    <PlusIcon className="h-5 w-5 text-blue-500" />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-cloud-white">
                                    Dodaj ćwiczenie
                                </h3>
                            </div>
                            
                            <div className="mb-6">
                                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-system-grey mb-3">
                                    <TargetIcon className="h-4 w-4" />
                                    Wybierz ćwiczenie
                                </label>
                                <select
                                    value={selectedExerciseId}
                                    onChange={(e) => setSelectedExerciseId(e.target.value)}
                                    className="w-full px-4 py-3 border border-white/30 dark:border-space-700/50 rounded-xl bg-white/50 dark:bg-space-800/50 backdrop-blur-sm text-gray-900 dark:text-cloud-white focus:ring-2 focus:ring-electric-500/30 focus:border-electric-500/50 transition-all duration-200"
                                >
                                    <option value="">-- Wybierz ćwiczenie --</option>
                                    {exercisesArray.map(exercise => (
                                        <option key={exercise.id} value={exercise.id}>
                                            {exercise.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4 mb-6">
                                <div>
                                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-system-grey mb-3">
                                        <TimerIcon className="h-4 w-4" />
                                        Czas ćwiczenia (sek)
                                    </label>
                                    <input
                                        type="number"
                                        value={exerciseDuration}
                                        onChange={(e) => setExerciseDuration(parseInt(e.target.value) || 30)}
                                        min="5"
                                        max="300"
                                        className="w-full px-4 py-3 border border-white/30 dark:border-space-700/50 rounded-xl bg-white/50 dark:bg-space-800/50 backdrop-blur-sm text-gray-900 dark:text-cloud-white focus:ring-2 focus:ring-electric-500/30 focus:border-electric-500/50 transition-all duration-200"
                                    />
                                </div>
                                
                                <div>
                                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-system-grey mb-3">
                                        <ClockIcon className="h-4 w-4" />
                                        Domyślna przerwa (sek)
                                    </label>
                                    <input
                                        type="number"
                                        value={restDuration}
                                        onChange={(e) => setRestDuration(parseInt(e.target.value) || 15)}
                                        min="5"
                                        max="120"
                                        className="w-full px-4 py-3 border border-white/30 dark:border-space-700/50 rounded-xl bg-white/50 dark:bg-space-800/50 backdrop-blur-sm text-gray-900 dark:text-cloud-white focus:ring-2 focus:ring-electric-500/30 focus:border-electric-500/50 transition-all duration-200"
                                    />
                                </div>
                            </div>
                            
                            <button
                                onClick={addExerciseStep}
                                disabled={!selectedExerciseId}
                                className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-electric-500 to-blue-500 text-white rounded-xl hover:from-electric-600 hover:to-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
                            >
                                <PlusIcon className="h-5 w-5" />
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
                                                onMoveUp={moveStep}
                                                onMoveDown={moveStep}
                                                onRemove={removeStep}
                                                onUpdateRestDuration={updateStepRestDuration}
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
                </div>
            </div>

            {/* Save Button - Fixed at bottom */}
            <div className="fixed bottom-0 left-0 right-0 backdrop-blur-xl bg-white/80 dark:bg-space-900/80 border-t border-white/20 dark:border-space-700/50 px-4 md:px-8 py-4 shadow-2xl">
                <div className="flex justify-end gap-3 w-full max-w-4xl mx-auto md:ml-80">
                    <button
                        onClick={onClose}
                        className="px-6 py-3 text-gray-500 dark:text-system-grey hover:text-gray-700 dark:hover:text-cloud-white hover:bg-white/50 dark:hover:bg-space-800/50 transition-all duration-200 font-medium text-sm md:text-base rounded-xl backdrop-blur-sm"
                    >
                        Anuluj
                    </button>
                    
                    <button
                        onClick={saveWorkout}
                        disabled={!workoutTitle.trim() || workoutSteps.length === 0}
                        className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-electric-500 to-blue-500 text-white rounded-xl hover:from-electric-600 hover:to-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium text-sm md:text-base shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
                    >
                        <SaveIcon className="h-4 w-4" />
                        Zapisz trening
                    </button>
                </div>
            </div>
        </div>
    );
};
