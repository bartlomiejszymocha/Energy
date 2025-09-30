import React from 'react';
import type { EnergyLog, CompletedActionLog, ActionItem } from '../types';
import { XMarkIcon, ArrowPathCircularIcon, BoltIcon, BreathingIcon } from './icons/LucideIcons';
// import { ACTION_LIBRARY } from '../constants/actions'; // Usunięto - używamy tylko Google Sheets
import { useSheetsActionsOptimized } from '../hooks/useSheetsActionsOptimized';
import { IconRenderer } from './IconRenderer';

const RATING_CONFIG: { [key: number]: { color: string; label: string } } = {
    1: { color: 'bg-danger-red', label: 'Bardzo nisko' },
    2: { color: 'bg-alert-orange', label: 'Nisko' },
    3: { color: 'bg-warning-yellow', label: 'Średnio' },
    4: { color: 'bg-success-green/80', label: 'Wysoko' },
    5: { color: 'bg-success-green', label: 'Bardzo wysoko' },
};

const renderSummaryIcon = (type: ActionItem['type']) => {
    switch (type) {
        case 'Protokół Ruchowy':
        case 'Protokuł Ruchowy': // obsługa błędu ortograficznego
            return <BoltIcon className="h-4 w-4 text-gray-600 dark:text-system-grey" />;
        case 'Technika oddechowa':
        case 'Technika Oddechowa': // obsługa różnej wielkości liter
            return <BreathingIcon className="h-4 w-4 text-gray-600 dark:text-system-grey" />;
        case 'Reset Energetyczny':
        default:
            return <ArrowPathCircularIcon className="h-4 w-4 text-gray-600 dark:text-system-grey" />;
    }
};

interface DaySummaryCardProps {
    logs: EnergyLog[];
    completedActions: CompletedActionLog[];
    onRemoveCompletedAction: (logId: string) => void;
    onRemoveLog: (logId: string) => void;
}

export const DaySummaryCard: React.FC<DaySummaryCardProps> = ({ logs, completedActions, onRemoveCompletedAction, onRemoveLog }) => {
    const { actions: sheetsActions } = useSheetsActionsOptimized();
    const sortedLogs = [...logs].sort((a, b) => a.timestamp - b.timestamp);
    const sortedActions = [...completedActions].sort((a, b) => a.timestamp - b.timestamp);

    return (
        <div className="p-4 sm:p-6">
            {sortedLogs.length === 0 && sortedActions.length === 0 ? (
                <p className="text-gray-600 dark:text-system-grey text-center py-4">Brak aktywności tego dnia.</p>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 sm:gap-x-6">
                    {/* Energy Logs Column */}
                    <div>
                        <h4 className="font-bold text-gray-600 dark:text-system-grey mb-2 text-sm uppercase tracking-wider">Wpisy Energii</h4>
                        {sortedLogs.length > 0 ? (
                            <div className="space-y-3">
                                {sortedLogs.map(log => (
                                    <div key={log.id} className="group relative flex items-start gap-3 p-3 bg-gray-100 dark:bg-space-800 rounded-lg border border-gray-200 dark:border-transparent">
                                        {log.rating ? (
                                            <div className={`w-4 h-4 rounded-full flex-shrink-0 flex items-center justify-center font-bold text-xs text-white ${RATING_CONFIG[log.rating].color}`}>
                                                {log.rating}
                                            </div>
                                        ) : (
                                            <div className="w-4 h-4 rounded-full flex-shrink-0 flex items-center justify-center bg-gray-400 dark:bg-space-700 text-xs">
                                                📝
                                            </div>
                                        )}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-start gap-2">
                                                <p className="text-gray-900 dark:text-cloud-white text-sm break-all">{log.note || <span className="text-gray-500 dark:text-system-grey/70">Brak notatki</span>}</p>
                                                <span className="text-xs text-gray-500 dark:text-system-grey flex-shrink-0 whitespace-nowrap">
                                                    {new Date(log.timestamp).toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => onRemoveLog(log.id)}
                                            className="absolute top-1/2 right-2 -translate-y-1/2 p-1 rounded-full bg-gray-200 dark:bg-space-700 text-gray-600 dark:text-system-grey hover:bg-danger-red hover:text-white opacity-0 group-hover:opacity-100 transition-opacity"
                                            aria-label={`Usuń wpis`}
                                        >
                                            <XMarkIcon className="h-4 w-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        ) : (
                             <p className="text-gray-600 dark:text-system-grey text-sm mt-4 p-3 bg-gray-100 dark:bg-space-800 rounded-lg border border-gray-200 dark:border-transparent">Brak wpisów.</p>
                        )}
                    </div>
                    
                    {/* Completed Actions Column */}
                    <div className="mt-6 sm:mt-0">
                        <h4 className="font-bold text-gray-600 dark:text-system-grey mb-2 text-sm uppercase tracking-wider">Wykonane Akcje</h4>
                        {sortedActions.length > 0 ? (
                            <div className="space-y-2">
                                {sortedActions.map(actionLog => {
                                    // Używamy tylko akcji z Google Sheets
                                    const allActions = sheetsActions;
                                    const actionDetails = allActions.find(a => a.id === actionLog.actionId);
                                    if (!actionDetails) return null;
                                    return (
                                        <div key={actionLog.id} className="group relative flex items-center gap-3 p-2.5 bg-gray-100 dark:bg-space-800 rounded-lg border border-gray-200 dark:border-transparent">
                                             <div className="w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center bg-gray-200 dark:bg-space-700">
                                                <IconRenderer 
                                                    icon={actionDetails.icon} 
                                                    className="text-lg" 
                                                    fallback={renderSummaryIcon(actionDetails.type)}
                                                />
                                             </div>
                                             <div className="flex-1 min-w-0 flex justify-between items-center">
                                                <p className="text-gray-900 dark:text-cloud-white text-sm truncate pr-2">{actionDetails.title}</p>
                                                <span className="text-xs text-gray-500 dark:text-system-grey flex-shrink-0">
                                                    {new Date(actionLog.timestamp).toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                             </div>
                                             <button
                                                onClick={() => onRemoveCompletedAction(actionLog.id)}
                                                className="absolute top-1/2 right-2 -translate-y-1/2 p-1 rounded-full bg-gray-200 dark:bg-space-700 text-gray-600 dark:text-system-grey hover:bg-danger-red hover:text-white opacity-0 group-hover:opacity-100 transition-opacity"
                                                aria-label={`Usuń wpis ${actionDetails.title}`}
                                             >
                                                <XMarkIcon className="h-4 w-4" />
                                             </button>
                                        </div>
                                    )
                                })}
                            </div>
                        ) : (
                            <p className="text-gray-600 dark:text-system-grey text-sm mt-4 p-3 bg-gray-100 dark:bg-space-800 rounded-lg border border-gray-200 dark:border-transparent">Brak wykonanych akcji.</p>
                        )}
                    </div>
                </div>
            )}
            <style>{`
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
                    background: #373A43; /* space-700 */
                }
                .dark .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: #23252C; /* space-800 */
                }
            `}</style>
        </div>
    );
};