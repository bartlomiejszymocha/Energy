import React, { useState, useMemo } from 'react';
import { useSheetsActionsOptimized } from '../hooks/useSheetsActionsOptimized';
import type { ActionItem } from '../types';
import { EditIcon, TrashIcon, EyeIcon, EyeOffIcon, SaveIcon, XIcon, SettingsIcon, ArrowLeftIcon, PlayIcon, ClockIcon, TargetIcon } from './icons/LucideIcons';
import { WorkoutBuilder } from './WorkoutBuilder';

interface WorkoutManagerProps {
    onClose: () => void;
}

export const WorkoutManager: React.FC<WorkoutManagerProps> = ({ onClose }) => {
    const { actions, loading, refresh } = useSheetsActionsOptimized();
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editForm, setEditForm] = useState<Partial<ActionItem>>({});
    const [filter, setFilter] = useState<'all' | 'admin' | 'public' | 'pro'>('all');
    const [editingWorkoutId, setEditingWorkoutId] = useState<string | null>(null);

    // Filter actions based on rules
    const filteredActions = useMemo(() => {
        if (filter === 'all') return actions;
        return actions.filter(action => action.rules === filter);
    }, [actions, filter]);

    // Get admin-created workouts (including dev-created)
    const adminWorkouts = useMemo(() => {
        return filteredActions.filter(action => 
            action.triggerTags?.includes('admin-created') || 
            action.triggerTags?.includes('dev-created') ||
            action.rules === 'admin'
        );
    }, [filteredActions]);

    const startEdit = (action: ActionItem) => {
        setEditingId(action.id);
        setEditForm({
            title: action.title,
            content: action.content,
            type: action.type,
            duration: action.duration,
            icon: action.icon,
            rules: action.rules
        });
    };

    const startWorkoutEdit = (action: ActionItem) => {
        setEditingWorkoutId(action.id);
    };

    const cancelEdit = () => {
        setEditingId(null);
        setEditForm({});
    };

    const saveEdit = async () => {
        if (!editingId) return;

        try {
            // In development mode, update localStorage
            const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
            
            if (isLocalhost) {
                const savedActions = JSON.parse(localStorage.getItem('dev-actions') || '[]');
                const updatedActions = savedActions.map((action: ActionItem) => 
                    action.id === editingId ? { ...action, ...editForm } : action
                );
                localStorage.setItem('dev-actions', JSON.stringify(updatedActions));
                console.log('✅ Workout updated in localStorage');
            } else {
                // TODO: Implement API call to update workout in Google Sheets
                console.log('🔍 Production update not implemented yet');
            }

            await refresh();
            setEditingId(null);
            setEditForm({});
            alert('Trening został zaktualizowany!');
        } catch (error) {
            console.error('Error updating workout:', error);
            alert('Błąd podczas aktualizacji treningu');
        }
    };

    const deleteWorkout = async (actionId: string, actionTitle: string) => {
        if (!confirm(`Czy na pewno chcesz usunąć trening "${actionTitle}"?`)) {
            return;
        }

        try {
            // In development mode, remove from localStorage
            const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
            
            if (isLocalhost) {
                const savedActions = JSON.parse(localStorage.getItem('dev-actions') || '[]');
                const updatedActions = savedActions.filter((action: ActionItem) => action.id !== actionId);
                localStorage.setItem('dev-actions', JSON.stringify(updatedActions));
                console.log('✅ Workout deleted from localStorage');
            } else {
                // TODO: Implement API call to delete workout from Google Sheets
                console.log('🔍 Production delete not implemented yet');
            }

            await refresh();
            alert('Trening został usunięty!');
        } catch (error) {
            console.error('Error deleting workout:', error);
            alert('Błąd podczas usuwania treningu');
        }
    };

    const toggleVisibility = async (action: ActionItem) => {
        const newRules = action.rules === 'admin' ? 'public' : 'admin';
        
        try {
            // In development mode, update localStorage
            const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
            
            if (isLocalhost) {
                const savedActions = JSON.parse(localStorage.getItem('dev-actions') || '[]');
                const updatedActions = savedActions.map((savedAction: ActionItem) => 
                    savedAction.id === action.id ? { ...savedAction, rules: newRules } : savedAction
                );
                localStorage.setItem('dev-actions', JSON.stringify(updatedActions));
                console.log('✅ Workout visibility updated in localStorage');
            } else {
                // TODO: Implement API call to update workout visibility in Google Sheets
                console.log('🔍 Production visibility update not implemented yet');
            }

            await refresh();
            alert(`Trening jest teraz ${newRules === 'admin' ? 'prywatny' : 'publiczny'}!`);
        } catch (error) {
            console.error('Error updating workout visibility:', error);
            alert('Błąd podczas aktualizacji widoczności treningu');
        }
    };

    // Show WorkoutBuilder for editing
    if (editingWorkoutId) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-space-950">
                <WorkoutBuilder onClose={() => setEditingWorkoutId(null)} />
            </div>
        );
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-gray-600 dark:text-system-grey">Ładowanie treningów...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 dark:from-space-950 dark:via-space-900 dark:to-space-800">
            <div className="max-w-6xl mx-auto p-6 space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-gradient-to-r from-electric-500/20 to-blue-500/20 backdrop-blur-sm">
                            <SettingsIcon className="h-6 w-6 text-electric-500" />
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-cloud-white">
                            Zarządzaj treningami
                        </h1>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-lg text-gray-400 dark:text-system-grey hover:text-gray-600 dark:hover:text-cloud-white hover:bg-white/50 dark:hover:bg-space-800/50 transition-all duration-200"
                    >
                        <XIcon className="h-5 w-5" />
                    </button>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="backdrop-blur-xl bg-white/60 dark:bg-space-900/60 rounded-2xl border border-white/30 dark:border-space-700/30 p-4 text-center shadow-xl">
                        <div className="text-2xl font-bold text-electric-500">{adminWorkouts.length}</div>
                        <div className="text-sm text-gray-600 dark:text-system-grey">Twoje treningi</div>
                    </div>
                    <div className="backdrop-blur-xl bg-white/60 dark:bg-space-900/60 rounded-2xl border border-white/30 dark:border-space-700/30 p-4 text-center shadow-xl">
                        <div className="text-2xl font-bold text-blue-500">
                            {adminWorkouts.filter(a => a.rules === 'public').length}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-system-grey">Publiczne</div>
                    </div>
                    <div className="backdrop-blur-xl bg-white/60 dark:bg-space-900/60 rounded-2xl border border-white/30 dark:border-space-700/30 p-4 text-center shadow-xl">
                        <div className="text-2xl font-bold text-orange-500">
                            {adminWorkouts.filter(a => a.rules === 'admin').length}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-system-grey">Prywatne</div>
                    </div>
                    <div className="backdrop-blur-xl bg-white/60 dark:bg-space-900/60 rounded-2xl border border-white/30 dark:border-space-700/30 p-4 text-center shadow-xl">
                        <div className="text-2xl font-bold text-green-500">
                            {adminWorkouts.filter(a => a.workout && a.workout.length > 0).length}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-system-grey">Z treningiem</div>
                    </div>
                </div>

                {/* Filters */}
                <div className="backdrop-blur-xl bg-white/60 dark:bg-space-900/60 rounded-2xl border border-white/30 dark:border-space-700/30 p-4 shadow-xl">
                    <div className="flex items-center gap-4">
                        <span className="text-sm font-medium text-gray-700 dark:text-system-grey">Filtruj:</span>
                        <div className="flex gap-2">
                            {(['all', 'admin', 'public', 'pro'] as const).map(rule => (
                                <button
                                    key={rule}
                                    onClick={() => setFilter(rule)}
                                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                                        filter === rule
                                            ? 'bg-gradient-to-r from-electric-500 to-blue-500 text-white shadow-lg'
                                            : 'bg-white/50 dark:bg-space-800/50 text-gray-600 dark:text-system-grey hover:bg-white/70 dark:hover:bg-space-700/70 backdrop-blur-sm'
                                    }`}
                                >
                                    {rule === 'all' ? 'Wszystkie' : 
                                     rule === 'admin' ? 'Prywatne' :
                                     rule === 'public' ? 'Publiczne' : 'Pro'}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Workouts List */}
                <div className="backdrop-blur-xl bg-white/60 dark:bg-space-900/60 rounded-2xl border border-white/30 dark:border-space-700/30 p-6 shadow-xl">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 rounded-lg bg-gradient-to-r from-green-500/20 to-emerald-500/20 backdrop-blur-sm">
                            <PlayIcon className="h-5 w-5 text-green-500" />
                        </div>
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-cloud-white">
                            Twoje treningi ({adminWorkouts.length})
                        </h2>
                    </div>
                
                {adminWorkouts.length === 0 ? (
                    <div className="text-center py-8">
                        <div className="text-gray-500 dark:text-system-grey mb-2">
                            Brak treningów do wyświetlenia
                        </div>
                        <div className="text-sm text-gray-400 dark:text-system-grey/70">
                            Stwórz pierwszy trening, aby go tutaj zobaczyć
                        </div>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {adminWorkouts.map(action => (
                            <div
                                key={action.id}
                                className="backdrop-blur-xl bg-white/40 dark:bg-space-900/40 rounded-2xl border border-white/20 dark:border-space-700/20 p-4 hover:bg-white/60 dark:hover:bg-space-900/60 transition-all duration-200 shadow-lg hover:shadow-xl"
                            >
                                {editingId === action.id ? (
                                    // Edit Mode
                                    <div className="space-y-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-system-grey mb-1">
                                                    Tytuł
                                                </label>
                                                <input
                                                    type="text"
                                                    value={editForm.title || ''}
                                                    onChange={(e) => setEditForm(prev => ({ ...prev, title: e.target.value }))}
                                                    className="w-full px-3 py-2 border border-gray-300 dark:border-white/20 rounded-lg bg-white dark:bg-space-800 text-gray-900 dark:text-cloud-white"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-system-grey mb-1">
                                                    Typ
                                                </label>
                                                <select
                                                    value={editForm.type || ''}
                                                    onChange={(e) => setEditForm(prev => ({ ...prev, type: e.target.value as any }))}
                                                    className="w-full px-3 py-2 border border-gray-300 dark:border-white/20 rounded-lg bg-white dark:bg-space-800 text-gray-900 dark:text-cloud-white"
                                                >
                                                    <option value="Protokół Ruchowy">Protokół Ruchowy</option>
                                                    <option value="Reset Energetyczny">Reset Energetyczny</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-system-grey mb-1">
                                                    Czas (min)
                                                </label>
                                                <input
                                                    type="number"
                                                    value={editForm.duration || ''}
                                                    onChange={(e) => setEditForm(prev => ({ ...prev, duration: parseInt(e.target.value) || 15 }))}
                                                    className="w-full px-3 py-2 border border-gray-300 dark:border-white/20 rounded-lg bg-white dark:bg-space-800 text-gray-900 dark:text-cloud-white"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-system-grey mb-1">
                                                    Ikona
                                                </label>
                                                <input
                                                    type="text"
                                                    value={editForm.icon || ''}
                                                    onChange={(e) => setEditForm(prev => ({ ...prev, icon: e.target.value }))}
                                                    className="w-full px-3 py-2 border border-gray-300 dark:border-white/20 rounded-lg bg-white dark:bg-space-800 text-gray-900 dark:text-cloud-white"
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-system-grey mb-1">
                                                Opis
                                            </label>
                                            <textarea
                                                value={editForm.content || ''}
                                                onChange={(e) => setEditForm(prev => ({ ...prev, content: e.target.value }))}
                                                rows={2}
                                                className="w-full px-3 py-2 border border-gray-300 dark:border-white/20 rounded-lg bg-white dark:bg-space-800 text-gray-900 dark:text-cloud-white"
                                            />
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={saveEdit}
                                                className="flex items-center gap-2 px-4 py-2 bg-electric-500 text-white rounded-lg hover:bg-electric-600 transition-colors"
                                            >
                                                <SaveIcon className="h-4 w-4" />
                                                Zapisz
                                            </button>
                                            <button
                                                onClick={cancelEdit}
                                                className="flex items-center gap-2 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                                            >
                                                <XIcon className="h-4 w-4" />
                                                Anuluj
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    // View Mode
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="text-2xl">{action.icon}</div>
                                            <div>
                                                <h3 className="font-semibold text-gray-900 dark:text-cloud-white">
                                                    {action.title}
                                                </h3>
                                                <p className="text-sm text-gray-600 dark:text-system-grey">
                                                    {action.type} • {action.duration} min
                                                </p>
                                                {action.content && (
                                                    <p className="text-sm text-gray-500 dark:text-system-grey/70 mt-1">
                                                        {action.content}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {action.workout && action.workout.length > 0 && (
                                                <button
                                                    onClick={() => startWorkoutEdit(action)}
                                                    className="p-2 text-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg transition-colors"
                                                    title="Edytuj trening"
                                                >
                                                    <PlayIcon className="h-4 w-4" />
                                                </button>
                                            )}
                                            <button
                                                onClick={() => toggleVisibility(action)}
                                                className={`p-2 rounded-lg transition-colors ${
                                                    action.rules === 'admin' 
                                                        ? 'text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-900/20' 
                                                        : 'text-green-500 hover:bg-green-50 dark:hover:bg-green-900/20'
                                                }`}
                                                title={action.rules === 'admin' ? 'Prywatny - kliknij aby udostępnić' : 'Publiczny - kliknij aby ukryć'}
                                            >
                                                {action.rules === 'admin' ? <EyeOffIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
                                            </button>
                                            <button
                                                onClick={() => startEdit(action)}
                                                className="p-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                                                title="Edytuj metadane"
                                            >
                                                <EditIcon className="h-4 w-4" />
                                            </button>
                                            <button
                                                onClick={() => deleteWorkout(action.id, action.title)}
                                                className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                                title="Usuń"
                                            >
                                                <TrashIcon className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
                </div>
            </div>
        </div>
    );
};
