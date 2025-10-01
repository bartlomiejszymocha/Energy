import React, { useMemo, useState } from 'react';
import { XMarkIcon, ActivityIcon, ZapIcon, FileTextIcon, ChevronDownIcon } from './icons/LucideIcons';
import { EnergyChart } from './EnergyChart';
import type { EnergyLog, CompletedActionLog } from '../types';
import { useSheetsActionsOptimized } from '../hooks/useSheetsActionsOptimized';
import { IconRenderer } from './IconRenderer';

const RATING_CONFIG: { [key: number]: { color: string; label: string } } = {
    1: { color: 'bg-danger-red', label: 'Przetrwanie' },
    2: { color: 'bg-alert-orange', label: 'Autopilot' },
    3: { color: 'bg-warning-yellow', label: 'Stabilnie' },
    4: { color: 'bg-success-green', label: 'Focus' },
    5: { color: 'bg-cyan-500', label: 'Flow' },
};

interface ChartModalProps {
    isOpen: boolean;
    onClose: () => void;
    logs: EnergyLog[];
    completedActions: CompletedActionLog[];
}

export const ChartModal: React.FC<ChartModalProps> = ({ isOpen, onClose, logs, completedActions }) => {
    const { actions: sheetsActions } = useSheetsActionsOptimized();
    const [isEnergyExpanded, setIsEnergyExpanded] = useState(true);
    const [isMealsExpanded, setIsMealsExpanded] = useState(true);
    const [isActionsExpanded, setIsActionsExpanded] = useState(true);
    
    if (!isOpen) return null;

    const today = new Date();
    const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
    const endOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59, 999).getTime();
    const todayLogs = logs.filter(l => l.timestamp >= startOfToday && l.timestamp <= endOfToday);
    const todayActions = completedActions.filter(a => a.timestamp >= startOfToday && a.timestamp <= endOfToday);

    // Połącz wszystkie wydarzenia i posortuj chronologicznie
    const categorizedEvents = useMemo(() => {
        const energyLogs = todayLogs.filter(log => !log.meal && log.rating).sort((a, b) => b.timestamp - a.timestamp);
        const meals = todayLogs.filter(log => log.meal).sort((a, b) => b.timestamp - a.timestamp);
        const notes = todayLogs.filter(log => !log.meal && !log.rating).sort((a, b) => b.timestamp - a.timestamp);
        const actions = todayActions.sort((a, b) => b.timestamp - a.timestamp);
        
        return { energyLogs, meals, notes, actions };
    }, [todayLogs, todayActions]);
    
    const totalCount = categorizedEvents.energyLogs.length + categorizedEvents.meals.length + categorizedEvents.notes.length + categorizedEvents.actions.length;

    return (
        <div 
            className="bg-black bg-opacity-70 animate-fade-in" 
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
                className="bg-white dark:bg-space-900 rounded-xl shadow-2xl w-[95vw] h-[90vh] flex flex-col border border-gray-200 dark:border-transparent"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 dark:border-space-700 flex-shrink-0">
                    <div className="flex items-center gap-3">
                        <ActivityIcon className="h-6 w-6 sm:h-7 sm:w-7 text-electric-500" />
                        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-cloud-white">
                            Wykres energii
                        </h2>
                    </div>
                    <button 
                        onClick={onClose} 
                        className="text-gray-600 dark:text-system-grey hover:text-gray-900 dark:hover:text-cloud-white transition" 
                        aria-label="Zamknij"
                    >
                        <XMarkIcon className="h-6 w-6" />
                    </button>
                </div>
                
                <div className="flex-1 p-4 sm:p-6 overflow-hidden flex flex-col lg:flex-row gap-6">
                    {/* Wykres */}
                    <div className="flex-1 flex flex-col min-w-0">
                        <div className="flex-1 min-h-0">
                            <EnergyChart logs={todayLogs} completedActions={todayActions} />
                        </div>
                        
                        {/* Legenda */}
                        <div className="mt-6 pt-4 border-t border-gray-200 dark:border-space-700">
                            <h3 className="text-sm font-semibold text-gray-700 dark:text-cloud-white mb-3 text-center">Legenda:</h3>
                            <div className="flex items-center justify-center flex-wrap gap-4 sm:gap-6">
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full bg-gray-700 dark:bg-gray-300 border border-gray-300 dark:border-white/40"></div>
                                    <span className="text-xs text-gray-600 dark:text-system-grey">Poziom energii</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full bg-blue-500 border border-gray-300 dark:border-white/40"></div>
                                    <span className="text-xs text-gray-600 dark:text-system-grey">Posiłek</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full bg-alert-orange border border-gray-300 dark:border-white/40"></div>
                                    <span className="text-xs text-gray-600 dark:text-system-grey">Notatka</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full bg-success-green border border-gray-300 dark:border-white/40"></div>
                                    <span className="text-xs text-gray-600 dark:text-system-grey">Akcja</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    {/* Lista wydarzeń */}
                    <div className="w-full lg:w-80 flex flex-col border-t lg:border-t-0 lg:border-l border-gray-200 dark:border-space-700 pt-4 lg:pt-0 lg:pl-6">
                        <h3 className="text-sm font-semibold text-gray-700 dark:text-cloud-white mb-4">
                            Dzisiejsze wydarzenia ({totalCount})
                        </h3>
                        <div className="flex-1 overflow-y-auto custom-scrollbar space-y-4 pr-2">
                            {totalCount === 0 ? (
                                <p className="text-gray-500 dark:text-system-grey text-sm text-center py-8">
                                    Brak wydarzeń na dziś
                                </p>
                            ) : (
                                <>
                                    {/* Wpisy energii */}
                                    {categorizedEvents.energyLogs.length > 0 && (
                                        <div>
                                            <div className="flex items-center gap-2 mb-2">
                                                <button
                                                    onClick={() => setIsEnergyExpanded(!isEnergyExpanded)}
                                                    className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-space-700 transition-colors"
                                                    title={isEnergyExpanded ? "Zwiń" : "Rozwiń"}
                                                >
                                                    <ChevronDownIcon className={`h-3.5 w-3.5 text-gray-500 dark:text-system-grey transition-transform ${isEnergyExpanded ? 'rotate-180' : 'rotate-0'}`} />
                                                </button>
                                                <h4 className="text-[10px] font-bold text-gray-600 dark:text-system-grey uppercase tracking-wider">
                                                    Wpisy energii ({categorizedEvents.energyLogs.length})
                                                </h4>
                                            </div>
                                            {isEnergyExpanded && (
                                            <div className="space-y-2">
                                                {categorizedEvents.energyLogs.map((log, idx) => {
                                                    const time = new Date(log.timestamp).toLocaleTimeString('pl-PL', { 
                                                        hour: '2-digit', 
                                                        minute: '2-digit' 
                                                    });
                                                    return (
                                                    <div key={`energy-${idx}`} className="flex items-start gap-2 p-2 bg-gray-50 dark:bg-space-800 rounded-lg">
                                                        <div className={`w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center font-bold text-xs text-white ${RATING_CONFIG[log.rating!].color}`}>
                                                            {log.rating}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-start justify-between gap-2">
                                                                <div className="flex-1">
                                                                    <p className="text-xs font-semibold text-gray-900 dark:text-cloud-white">
                                                                        {RATING_CONFIG[log.rating!].label}
                                                                    </p>
                                                                    {log.note && (
                                                                        <p className="text-xs text-gray-600 dark:text-system-grey mt-0.5 line-clamp-2">
                                                                            {log.note}
                                                                        </p>
                                                                    )}
                                                                </div>
                                                                <span className="text-xs text-gray-500 dark:text-system-grey/70 flex-shrink-0">
                                                                    {time}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    );
                                                })}
                                            </div>
                                            )}
                                        </div>
                                    )}
                                    
                                    {/* Posiłki */}
                                    {categorizedEvents.meals.length > 0 && (
                                        <div>
                                            <div className="flex items-center gap-2 mb-2">
                                                <button
                                                    onClick={() => setIsMealsExpanded(!isMealsExpanded)}
                                                    className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-space-700 transition-colors"
                                                    title={isMealsExpanded ? "Zwiń" : "Rozwiń"}
                                                >
                                                    <ChevronDownIcon className={`h-3.5 w-3.5 text-gray-500 dark:text-system-grey transition-transform ${isMealsExpanded ? 'rotate-180' : 'rotate-0'}`} />
                                                </button>
                                                <h4 className="text-[10px] font-bold text-gray-600 dark:text-system-grey uppercase tracking-wider">
                                                    Posiłki ({categorizedEvents.meals.length})
                                                </h4>
                                            </div>
                                            {isMealsExpanded && (
                                            <div className="space-y-2">
                                                {categorizedEvents.meals.map((log, idx) => {
                                                    const time = new Date(log.timestamp).toLocaleTimeString('pl-PL', { 
                                                        hour: '2-digit', 
                                                        minute: '2-digit' 
                                                    });
                                                    return (
                                                        <div key={`meal-${idx}`} className="flex items-start gap-2 p-2 bg-gray-50 dark:bg-space-800 rounded-lg">
                                                            <div className="w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center bg-success-green text-xs">
                                                                🍽️
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <div className="flex items-start justify-between gap-2">
                                                                    <div className="flex-1">
                                                                        <p className="text-xs font-semibold text-green-600 dark:text-green-400">
                                                                            Posiłek
                                                                        </p>
                                                                        {log.rating && (
                                                                            <p className="text-xs text-gray-600 dark:text-system-grey mt-0.5">
                                                                                {RATING_CONFIG[log.rating].label}
                                                                            </p>
                                                                        )}
                                                                        {log.note && (
                                                                            <p className="text-xs text-gray-600 dark:text-system-grey mt-0.5 line-clamp-2">
                                                                                {log.note}
                                                                            </p>
                                                                        )}
                                                                    </div>
                                                                    <span className="text-xs text-gray-500 dark:text-system-grey/70 flex-shrink-0">
                                                                        {time}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                            )}
                                        </div>
                                    )}
                                    
                                    {/* Wykonane akcje */}
                                    {categorizedEvents.actions.length > 0 && (
                                        <div>
                                            <div className="flex items-center gap-2 mb-2">
                                                <button
                                                    onClick={() => setIsActionsExpanded(!isActionsExpanded)}
                                                    className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-space-700 transition-colors"
                                                    title={isActionsExpanded ? "Zwiń" : "Rozwiń"}
                                                >
                                                    <ChevronDownIcon className={`h-3.5 w-3.5 text-gray-500 dark:text-system-grey transition-transform ${isActionsExpanded ? 'rotate-180' : 'rotate-0'}`} />
                                                </button>
                                                <h4 className="text-[10px] font-bold text-gray-600 dark:text-system-grey uppercase tracking-wider">
                                                    Wykonane akcje ({categorizedEvents.actions.length})
                                                </h4>
                                            </div>
                                            {isActionsExpanded && (
                                            <div className="space-y-2">
                                                {categorizedEvents.actions.map((action, idx) => {
                                                    const time = new Date(action.timestamp).toLocaleTimeString('pl-PL', { 
                                                        hour: '2-digit', 
                                                        minute: '2-digit' 
                                                    });
                                                    const actionDetails = sheetsActions.find(a => a.id === action.actionId);
                                                    if (!actionDetails) return null;
                                                    
                                                    return (
                                                        <div key={`action-${idx}`} className="flex items-start gap-2 p-2 bg-gray-50 dark:bg-space-800 rounded-lg">
                                                            <div className="w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center bg-gray-200 dark:bg-space-700 text-sm">
                                                                <IconRenderer 
                                                                    icon={actionDetails.icon} 
                                                                    className="text-base" 
                                                                    fallback={<span>⚡</span>}
                                                                />
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <div className="flex items-start justify-between gap-2">
                                                                    <div className="flex-1">
                                                                        <p className="text-xs font-semibold text-gray-900 dark:text-cloud-white">
                                                                            {actionDetails.title}
                                                                        </p>
                                                                        <p className="text-xs text-gray-600 dark:text-system-grey mt-0.5">
                                                                            {actionDetails.type}
                                                                        </p>
                                                                    </div>
                                                                    <span className="text-xs text-gray-500 dark:text-system-grey/70 flex-shrink-0">
                                                                        {time}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                            )}
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            
            <style>{`
                @keyframes fade-in { 
                    from { opacity: 0; } 
                    to { opacity: 1; } 
                }
                .animate-fade-in { 
                    animation: fade-in 0.3s ease-out forwards; 
                }
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #D1D5DB;
                    border-radius: 3px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: #9CA3AF;
                }
                .dark .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #373A43;
                }
                .dark .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: #23252C;
                }
            `}</style>
        </div>
    );
};
