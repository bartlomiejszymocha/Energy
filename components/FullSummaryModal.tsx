import React, { useMemo, useState } from 'react';
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

export const FullSummaryModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    logs: EnergyLog[];
    completedActions: CompletedActionLog[];
    onRemoveCompletedAction: (logId: string) => void;
    onRemoveLog: (logId: string) => void;
}> = ({ isOpen, onClose, logs, completedActions, onRemoveCompletedAction, onRemoveLog }) => {
    const [isCopied, setIsCopied] = useState(false);

    const { todayLogs, todayCompletedActions } = useMemo(() => {
        const today = new Date();
        const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
        const endOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59, 999).getTime();

        const todayLogs = logs.filter(log => log.timestamp >= startOfToday && log.timestamp <= endOfToday)
            .sort((a, b) => a.timestamp - b.timestamp);
        
        const todayCompletedActions = completedActions.filter(log => log.timestamp >= startOfToday && log.timestamp <= endOfToday)
            .sort((a, b) => a.timestamp - b.timestamp);

        return { todayLogs, todayCompletedActions };
    }, [logs, completedActions]);
    
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

    const handleCopySummary = async () => {
        const today = new Date();
        const dateFormatter = new Intl.DateTimeFormat('pl-PL', { year: 'numeric', month: 'long', day: 'numeric' });
        const timeFormatter = new Intl.DateTimeFormat('pl-PL', { hour: '2-digit', minute: '2-digit' });

        let summary = `**Podsumowanie Energii - ${dateFormatter.format(today)}**\n\n`;

        if (todayLogs.length > 0) {
            summary += "**📝 Wpisy Energii:**\n";
            todayLogs.forEach(log => {
                const ratingText = log.rating ? `Ocena: ${log.rating}/5` : 'Notatka';
                summary += `- ${timeFormatter.format(new Date(log.timestamp))} | ${ratingText} ${log.note ? `| ${log.note}` : ''}\n`;
            });
        } else {
            summary += "**📝 Wpisy Energii:**\n- Brak wpisów energii na dziś.\n";
        }

        summary += "\n";

        if (todayCompletedActions.length > 0) {
            summary += "**⚡ Wykonane Akcje:**\n";
            todayCompletedActions.forEach(actionLog => {
                const actionDetails = ACTION_LIBRARY.find(a => a.id === actionLog.actionId);
                const title = actionDetails ? actionDetails.title : 'Nieznana akcja';
                summary += `- ${timeFormatter.format(new Date(actionLog.timestamp))} | Akcja: ${title}\n`;
            });
        } else {
            summary += "**⚡ Wykonane Akcje:**\n- Brak wykonanych akcji na dziś.\n";
        }

        try {
            await navigator.clipboard.writeText(summary);
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 2500);
        } catch (err) {
            console.error('Błąd podczas kopiowania do schowka: ', err);
        }
    };
    
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-start sm:items-center justify-center z-[60] p-4 pt-10 sm:pt-4 animate-fade-in" onClick={onClose}>
            <div 
                className="bg-space-900 rounded-xl shadow-2xl w-full max-w-md sm:max-w-4xl flex flex-col max-h-[85vh]"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center justify-between p-4 border-b border-space-700 flex-shrink-0">
                     <h2 className="text-xl font-bold text-cloud-white">
                        <span className="sm:hidden">Pełne Podsumowanie</span>
                        <span className="hidden sm:inline">Pełne podsumowanie dzisiejszego dnia</span>
                     </h2>
                     <div className="flex items-center gap-2">
                        <button
                            onClick={() => {
                                if (isCopied) return;
                                handleCopySummary();
                            }}
                            className={`font-bold py-2 px-3 rounded-lg shadow-lg transition-all duration-200 text-sm ${isCopied ? 'bg-success-green text-cloud-white cursor-default' : 'bg-space-800 hover:bg-space-700 text-cloud-white'}`}
                            title="Kopiuj Podsumowanie Dnia"
                        >
                            {isCopied ? 'Skopiowano!' : 'Kopiuj'}
                        </button>
                        <button onClick={onClose} className="text-system-grey hover:text-cloud-white transition" aria-label="Zamknij">
                            <XMarkIcon className="h-6 w-6" />
                        </button>
                     </div>
                </div>
                <div className="overflow-y-auto p-4 sm:p-6 custom-scrollbar">
                     {todayLogs.length === 0 && todayCompletedActions.length === 0 ? (
                        <p className="text-system-grey text-center py-4">Brak dzisiejszej aktywności.</p>
                    ) : (
                        <div className="grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:gap-x-6">
                            {/* Energy Logs Column */}
                            <div>
                                <h4 className="font-bold text-system-grey mb-2 text-sm uppercase tracking-wider">Wpisy Energii</h4>
                                {todayLogs.length > 0 ? (
                                    <div className="space-y-3">
                                        {todayLogs.map(log => (
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
                            <div>
                                <h4 className="font-bold text-system-grey mb-2 text-sm uppercase tracking-wider">Wykonane Akcje</h4>
                                {todayCompletedActions.length > 0 ? (
                                    <div className="space-y-2">
                                        {todayCompletedActions.map(actionLog => {
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
                </div>
            </div>
             <style>{`
                @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
                .animate-fade-in { animation: fade-in 0.3s ease-out forwards; }
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #24324E; /* dark mode scrollbar */
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: #35456A;
                }
            `}</style>
        </div>
    );
};