import React from 'react';
import type { EnergyLog, CompletedActionLog, ActionItem } from '../types';
import { XMarkIcon, ArrowPathCircularIcon, BoltIcon, WaveIcon } from './icons/Icons';
import { ACTION_LIBRARY } from '../constants/actions';

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
            return <BoltIcon className="h-5 w-5 text-system-grey" />;
        case 'Technika oddechowa':
            return <WaveIcon className="h-5 w-5 text-system-grey" />;
        case 'Reset Energetyczny':
        default:
            return <ArrowPathCircularIcon className="h-5 w-5 text-system-grey" />;
    }
};

interface DaySummaryCardProps {
    logs: EnergyLog[];
    completedActions: CompletedActionLog[];
    onRemoveCompletedAction: (logId: string) => void;
    onRemoveLog: (logId: string) => void;
}

export const DaySummaryCard: React.FC<DaySummaryCardProps> = ({ logs, completedActions, onRemoveCompletedAction, onRemoveLog }) => {

    const sortedLogs = [...logs].sort((a, b) => a.timestamp - b.timestamp);
    const sortedActions = [...completedActions].sort((a, b) => a.timestamp - b.timestamp);

    return (
        <div className="p-4 sm:p-6">
            {sortedLogs.length === 0 && sortedActions.length === 0 ? (
                <p className="text-system-grey text-center py-4">Brak aktywności tego dnia.</p>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 sm:gap-x-6">
                    {/* Energy Logs Column */}
                    <div>
                        <h4 className="font-bold text-system-grey mb-2 text-sm uppercase tracking-wider">Wpisy Energii</h4>
                        {sortedLogs.length > 0 ? (
                            <div className="space-y-3">
                                {sortedLogs.map(log => (
                                    <div key={log.id} className="group relative flex items-start gap-3 p-3 bg-space-800 rounded-lg">
                                        {log.rating ? (
                                            <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center font-bold text-lg text-space-950 ${RATING_CONFIG[log.rating].color}`}>
                                                {log.rating}
                                            </div>
                                        ) : (
                                            <div className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center bg-space-700 text-lg">
                                                📝
                                            </div>
                                        )}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-start gap-2">
                                                <p className="text-cloud-white text-sm break-all">{log.note || <span className="text-system-grey/70">Brak notatki</span>}</p>
                                                <span className="text-xs text-system-grey flex-shrink-0 whitespace-nowrap">
                                                    {new Date(log.timestamp).toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => onRemoveLog(log.id)}
                                            className="absolute top-1/2 right-2 -translate-y-1/2 p-1 rounded-full bg-space-700 text-system-grey hover:bg-danger-red hover:text-cloud-white opacity-0 group-hover:opacity-100 transition-opacity"
                                            aria-label={`Usuń wpis`}
                                        >
                                            <XMarkIcon className="h-4 w-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        ) : (
                             <p className="text-system-grey text-sm mt-4 p-3 bg-space-800 rounded-lg">Brak wpisów.</p>
                        )}
                    </div>
                    
                    {/* Completed Actions Column */}
                    <div className="mt-6 sm:mt-0">
                        <h4 className="font-bold text-system-grey mb-2 text-sm uppercase tracking-wider">Wykonane Akcje</h4>
                        {sortedActions.length > 0 ? (
                            <div className="space-y-2">
                                {sortedActions.map(actionLog => {
                                    const actionDetails = ACTION_LIBRARY.find(a => a.id === actionLog.actionId);
                                    if (!actionDetails) return null;
                                    return (
                                        <div key={actionLog.id} className="group relative flex items-center gap-3 p-2.5 bg-space-800 rounded-lg">
                                             <div className="w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center bg-space-700 text-lg">
                                                {renderSummaryIcon(actionDetails.type)}
                                             </div>
                                             <div className="flex-1 min-w-0 flex justify-between items-center">
                                                <p className="text-cloud-white text-sm truncate pr-2">{actionDetails.title}</p>
                                                <span className="text-xs text-system-grey flex-shrink-0">
                                                    {new Date(actionLog.timestamp).toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                             </div>
                                             <button
                                                onClick={() => onRemoveCompletedAction(actionLog.id)}
                                                className="absolute top-1/2 right-2 -translate-y-1/2 p-1 rounded-full bg-space-700 text-system-grey hover:bg-danger-red hover:text-cloud-white opacity-0 group-hover:opacity-100 transition-opacity"
                                                aria-label={`Usuń wpis ${actionDetails.title}`}
                                             >
                                                <XMarkIcon className="h-4 w-4" />
                                             </button>
                                        </div>
                                    )
                                })}
                            </div>
                        ) : (
                            <p className="text-system-grey text-sm mt-4 p-3 bg-space-800 rounded-lg">Brak wykonanych akcji.</p>
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
                    background: #373A43; /* space-700 */
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: #23252C; /* space-800 */
                }
            `}</style>
        </div>
    );
};