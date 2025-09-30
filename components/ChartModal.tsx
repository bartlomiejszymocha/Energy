import React, { useMemo } from 'react';
import { XMarkIcon, ActivityIcon, ZapIcon, FileTextIcon } from './icons/LucideIcons';
import { EnergyChart } from './EnergyChart';
import type { EnergyLog, CompletedActionLog } from '../types';
import { useSheetsActionsOptimized } from '../hooks/useSheetsActionsOptimized';
import { IconRenderer } from './IconRenderer';

const RATING_CONFIG: { [key: number]: { color: string; label: string } } = {
    1: { color: 'bg-danger-red', label: 'Przetrwanie' },
    2: { color: 'bg-alert-orange', label: 'Autopilot' },
    3: { color: 'bg-warning-yellow', label: 'Stabilnie' },
    4: { color: 'bg-success-green', label: 'Fokus' },
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
    
    if (!isOpen) return null;

    const today = new Date();
    const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
    const endOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59, 999).getTime();
    const todayLogs = logs.filter(l => l.timestamp >= startOfToday && l.timestamp <= endOfToday);
    const todayActions = completedActions.filter(a => a.timestamp >= startOfToday && a.timestamp <= endOfToday);

    // Połącz wszystkie wydarzenia i posortuj chronologicznie
    const allEvents = useMemo(() => {
        const events: Array<{ timestamp: number; type: 'log' | 'action'; data: any }> = [
            ...todayLogs.map(log => ({ timestamp: log.timestamp, type: 'log' as const, data: log })),
            ...todayActions.map(action => ({ timestamp: action.timestamp, type: 'action' as const, data: action }))
        ];
        return events.sort((a, b) => a.timestamp - b.timestamp);
    }, [todayLogs, todayActions]);

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
                                    <div className="w-3 h-3 rounded-full bg-electric-500 border border-gray-300 dark:border-white/40"></div>
                                    <span className="text-xs text-gray-600 dark:text-system-grey">Poziom energii</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full bg-success-green border border-gray-300 dark:border-white/40"></div>
                                    <span className="text-xs text-gray-600 dark:text-system-grey">Posiłek</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full bg-alert-orange border border-gray-300 dark:border-white/40"></div>
                                    <span className="text-xs text-gray-600 dark:text-system-grey">Notatka</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <ZapIcon className="h-3.5 w-3.5 text-alert-orange" />
                                    <span className="text-xs text-gray-600 dark:text-system-grey">Akcja</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    {/* Lista wydarzeń */}
                    <div className="w-full lg:w-80 flex flex-col border-t lg:border-t-0 lg:border-l border-gray-200 dark:border-space-700 pt-4 lg:pt-0 lg:pl-6">
                        <h3 className="text-sm font-semibold text-gray-700 dark:text-cloud-white mb-4">
                            Dzisiejsze wydarzenia ({allEvents.length})
                        </h3>
                        <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2 pr-2">
                            {allEvents.length === 0 ? (
                                <p className="text-gray-500 dark:text-system-grey text-sm text-center py-8">
                                    Brak wydarzeń na dziś
                                </p>
                            ) : (
                                allEvents.map((event, idx) => {
                                    const time = new Date(event.timestamp).toLocaleTimeString('pl-PL', { 
                                        hour: '2-digit', 
                                        minute: '2-digit' 
                                    });
                                    
                                    if (event.type === 'log') {
                                        const log = event.data as EnergyLog;
                                        return (
                                            <div key={`log-${idx}`} className="flex items-start gap-2 p-2 bg-gray-50 dark:bg-space-800 rounded-lg">
                                                {log.rating ? (
                                                    <div className={`w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center font-bold text-xs text-white ${log.meal ? 'bg-success-green' : RATING_CONFIG[log.rating].color}`}>
                                                        {log.meal ? '🍽️' : log.rating}
                                                    </div>
                                                ) : log.meal ? (
                                                    <div className="w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center bg-success-green text-xs">
                                                        🍽️
                                                    </div>
                                                ) : (
                                                    <div className="w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center bg-alert-orange">
                                                        <FileTextIcon className="h-3.5 w-3.5 text-white" />
                                                    </div>
                                                )}
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-start justify-between gap-2">
                                                        <div className="flex-1">
                                                            {log.rating && (
                                                                <p className="text-xs font-semibold text-gray-900 dark:text-cloud-white">
                                                                    Energia: {log.rating}/5
                                                                </p>
                                                            )}
                                                            {log.meal && (
                                                                <p className="text-xs font-semibold text-green-600 dark:text-green-400">
                                                                    Posiłek
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
                                    } else {
                                        const action = event.data as CompletedActionLog;
                                        const actionDetails = sheetsActions.find(a => a.id === action.actionId);
                                        if (!actionDetails) return null;
                                        
                                        return (
                                            <div key={`action-${idx}`} className="flex items-start gap-2 p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-500/30">
                                                <div className="w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center bg-purple-100 dark:bg-purple-900/40 text-sm">
                                                    <IconRenderer 
                                                        icon={actionDetails.icon} 
                                                        className="text-base" 
                                                        fallback={<span>⚡</span>}
                                                    />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-start justify-between gap-2">
                                                        <div className="flex-1">
                                                            <p className="text-xs font-semibold text-purple-900 dark:text-purple-300">
                                                                {actionDetails.title}
                                                            </p>
                                                            <p className="text-xs text-purple-700 dark:text-purple-400/70 mt-0.5">
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
                                    }
                                })
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
