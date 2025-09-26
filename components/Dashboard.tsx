import React, { useState, useMemo } from 'react';
import type { EnergyLog, CompletedActionLog, ActionItem } from '../types';
import { EnergyChart } from './EnergyChart';
import { PlusIcon, QuestionMarkCircleIcon, TrashIcon, ArrowPathCircularIcon, BoltIcon, BreathingIcon, XMarkIcon, ArrowsPointingOutIcon, ArchiveBoxIcon } from './icons/Icons';
import { ACTION_LIBRARY } from '../constants/actions';

const RATING_CONFIG: { [key: number]: { color: string; label: string } } = {
    1: { color: 'bg-danger-red', label: 'Bardzo nisko' },
    2: { color: 'bg-alert-orange', label: 'Nisko' },
    3: { color: 'bg-warning-yellow', label: 'Średnio' },
    4: { color: 'bg-success-green/80', label: 'Wysoko' },
    5: { color: 'bg-success-green', label: 'Bardzo wysoko' },
};

const DailySummary: React.FC<{ 
    logs: EnergyLog[]; 
    completedActions: CompletedActionLog[];
    onCopySummary: () => void;
    isCopied: boolean;
    onResetDataClick: () => void;
    onRemoveCompletedAction: (logId: string) => void;
    onRemoveLog: (logId: string) => void;
    onOpenModal: () => void;
    onShowHistory: () => void;
}> = ({ logs, completedActions, onCopySummary, isCopied, onResetDataClick, onRemoveCompletedAction, onRemoveLog, onOpenModal, onShowHistory }) => {
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

    const handleCardClick = () => {
        if (typeof window !== 'undefined' && window.innerWidth < 1024) { // 'lg' breakpoint
            onOpenModal();
        }
    };
    
    const renderSummaryIcon = (type: ActionItem['type']) => {
        switch (type) {
            case 'Protokół Ruchowy':
                return <BoltIcon className="h-5 w-5 text-system-grey" />;
            case 'Technika oddechowa':
                return <BreathingIcon className="h-5 w-5 text-system-grey" />;
            case 'Reset Energetyczny':
            default:
                return <ArrowPathCircularIcon className="h-5 w-5 text-system-grey" />;
        }
    };

    return (
        <div 
            className="bg-space-900 rounded-xl shadow-lg p-4 sm:p-6 lg:h-full flex flex-col cursor-pointer lg:cursor-default"
            onClick={handleCardClick}
        >
            <div className="flex items-center justify-between gap-3 mb-4 flex-shrink-0">
                 <div className="flex items-center gap-3">
                    <span className="text-2xl">🏆</span>
                    <h3 className="text-lg font-medium text-cloud-white/80">Podsumowanie</h3>
                 </div>
                 <div className="flex items-center gap-2">
                    <button
                        onClick={(e) => { e.stopPropagation(); onOpenModal(); }}
                        className="hidden lg:flex bg-space-800 hover:bg-space-700 text-cloud-white font-bold p-2 rounded-lg shadow-lg transition-all duration-200 hover:scale-105 active:scale-95 items-center"
                        title="Powiększ podsumowanie"
                    >
                        <ArrowsPointingOutIcon className="h-5 w-5" />
                    </button>
                    <button
                        onClick={(e) => { e.stopPropagation(); onResetDataClick(); }}
                        className="bg-space-800 hover:bg-danger-red/20 text-danger-red/80 font-bold p-2 rounded-lg shadow-lg transition-all duration-200 hover:scale-105 active:scale-95 flex items-center gap-2 text-sm"
                        title="Resetuj wszystkie dane"
                    >
                        <TrashIcon className="h-5 w-5" />
                    </button>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            if (isCopied) return;
                            onCopySummary();
                        }}
                        className={`font-bold py-2 px-3 rounded-lg shadow-lg transition-all duration-200 hover:scale-105 active:scale-95 flex items-center justify-center text-sm
                            ${isCopied ? 'bg-success-green text-cloud-white cursor-default' : 'bg-space-800 hover:bg-space-700 text-cloud-white'}`
                        }
                        title="Kopiuj Podsumowanie Dnia"
                    >
                        <span className="hidden sm:inline">
                            {isCopied ? 'Skopiowano!' : 'Kopiuj'}
                        </span>
                        <span className="sm:hidden">
                            Kopiuj
                        </span>
                    </button>
                 </div>
            </div>

            {/* Mobile Prompt */}
            <div className="flex-grow flex items-center justify-center text-center lg:hidden">
                <p className="text-system-grey">Kliknij, żeby zobaczyć podsumowanie dnia.</p>
            </div>
            
            {/* Desktop Content */}
            {todayLogs.length === 0 && todayCompletedActions.length === 0 ? (
                <div className="hidden lg:flex flex-grow items-center justify-center">
                    <p className="text-system-grey text-center">Brak dzisiejszej aktywności.</p>
                </div>
            ) : (
                <div className="hidden lg:block h-80 lg:h-auto lg:max-h-[26rem] overflow-y-auto space-y-4 pr-2 custom-scrollbar">
                    {todayLogs.length > 0 && (
                        <div>
                            <h4 className="font-bold text-system-grey mb-2 text-sm uppercase tracking-wider">Wpisy Energii</h4>
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
                                            <div className="flex justify-between items-start">
                                                <p className="text-cloud-white text-sm break-words flex-1 pr-2">{log.note || <span className="text-system-grey/70">Brak notatki</span>}</p>
                                                <span className="text-xs text-system-grey flex-shrink-0">
                                                    {new Date(log.timestamp).toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </div>
                                            {log.tags && log.tags.length > 0 && (
                                                <div className="flex flex-wrap gap-1.5 mt-2">
                                                    {log.tags.map(tag => (
                                                        <span key={tag} className="px-2 py-0.5 text-xs rounded-full bg-space-700 text-system-grey">
                                                            {tag}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); onRemoveLog(log.id); }}
                                            className="absolute top-1/2 right-2 -translate-y-1/2 p-1 rounded-full bg-space-700 text-system-grey hover:bg-danger-red hover:text-cloud-white opacity-0 group-hover:opacity-100 transition-opacity"
                                            aria-label={`Usuń wpis`}
                                        >
                                            <XMarkIcon className="h-4 w-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                    {todayCompletedActions.length > 0 && (
                        <div className={todayLogs.length > 0 ? 'pt-4' : ''}>
                            <h4 className="font-bold text-system-grey mb-2 text-sm uppercase tracking-wider">Wykonane Akcje</h4>
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
                                                onClick={(e) => { e.stopPropagation(); onRemoveCompletedAction(actionLog.id); }}
                                                className="absolute top-1/2 right-2 -translate-y-1/2 p-1 rounded-full bg-space-700 text-system-grey hover:bg-danger-red hover:text-cloud-white opacity-0 group-hover:opacity-100 transition-opacity"
                                                aria-label={`Usuń wpis ${actionDetails.title}`}
                                             >
                                                <XMarkIcon className="h-4 w-4" />
                                             </button>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    )}
                </div>
            )}
            <div className="mt-auto pt-4 flex-shrink-0">
                <button 
                    onClick={(e) => { e.stopPropagation(); onShowHistory(); }}
                    className="w-full text-center text-sm font-semibold text-electric-500 hover:text-electric-600 bg-electric-500/10 hover:bg-electric-500/20 py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                    <ArchiveBoxIcon className="h-5 w-5" />
                    <span>Zobacz historię</span>
                </button>
            </div>
        </div>
    );
};

interface DashboardProps {
    logs: EnergyLog[];
    completedActions: CompletedActionLog[];
    onLogEnergyClick: () => void;
    onInstructionsClick: () => void;
    onResetDataClick: () => void;
    onRemoveCompletedAction: (logId: string) => void;
    onRemoveLog: (logId: string) => void;
    onOpenSummaryModal: () => void;
    onShowHistory: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ logs, completedActions, onLogEnergyClick, onInstructionsClick, onResetDataClick, onRemoveCompletedAction, onRemoveLog, onOpenSummaryModal, onShowHistory }) => {
    const [isCopied, setIsCopied] = useState(false);

    const handleCopySummary = async () => {
        const today = new Date();
        const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
        const endOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59, 999).getTime();

        const todayLogs = logs.filter(log => log.timestamp >= startOfToday && log.timestamp <= endOfToday);
        const todayCompletedActions = completedActions.filter(log => log.timestamp >= startOfToday && log.timestamp <= endOfToday);
        
        const dateFormatter = new Intl.DateTimeFormat('pl-PL', { year: 'numeric', month: 'long', day: 'numeric' });
        const timeFormatter = new Intl.DateTimeFormat('pl-PL', { hour: '2-digit', minute: '2-digit' });

        let summary = `**Podsumowanie Energii - ${dateFormatter.format(today)}**\n\n`;

        if (todayLogs.length > 0) {
            summary += "**📝 Wpisy Energii:**\n";
            todayLogs.sort((a, b) => a.timestamp - b.timestamp).forEach(log => {
                const ratingText = log.rating ? `Ocena: ${log.rating}/5` : 'Notatka';
                summary += `- ${timeFormatter.format(new Date(log.timestamp))} | ${ratingText} ${log.note ? `| ${log.note}` : ''}\n`;
            });
        } else {
            summary += "**📝 Wpisy Energii:**\n- Brak wpisów energii na dziś.\n";
        }

        summary += "\n";

        if (todayCompletedActions.length > 0) {
            summary += "**⚡ Wykonane Akcje:**\n";
            todayCompletedActions.sort((a, b) => a.timestamp - b.timestamp).forEach(actionLog => {
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


    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="bg-space-900 rounded-xl shadow-lg p-4 sm:p-6 lg:col-span-2 flex flex-col">
                    <div className="flex flex-col gap-4 mb-4 sm:flex-row sm:justify-between sm:items-start">
                        <h3 className="text-lg font-medium text-cloud-white/80 text-left">📊 Wykres energii na dziś</h3>
                        <div className="flex items-center justify-center flex-wrap gap-2">
                             <button
                                onClick={onInstructionsClick}
                                className="bg-space-800 hover:bg-space-700 text-cloud-white font-bold py-2 px-3 rounded-lg shadow-lg transition-transform duration-200 hover:scale-105 active:scale-95 text-sm flex items-center gap-2"
                            >
                                <span className="sm:hidden">Zacznij tutaj!</span>
                                <span className="hidden sm:inline">
                                    Jak korzystać z Resetuj ENERGIĘ?
                                </span>
                            </button>
                            <button
                                onClick={onLogEnergyClick}
                                className="bg-alert-orange hover:bg-alert-orange/90 text-space-950 font-bold py-2 px-3 rounded-lg shadow-lg transition-all duration-200 hover:scale-105 active:scale-95 flex items-center gap-2 text-sm"
                            >
                                <PlusIcon className="h-5 w-5" />
                                <span>
                                    Dodaj wpis
                                    <span className="hidden sm:inline font-normal text-space-950/80">&nbsp;(⌘+K)</span>
                                </span>
                            </button>
                        </div>
                    </div>
                    <div className="flex-grow h-52 sm:h-72">
                        <EnergyChart logs={logs} completedActions={completedActions} />
                    </div>
                    <div className="flex items-center justify-center gap-4 text-xs text-system-grey pt-4 flex-shrink-0 flex-wrap">
                        <div className="flex items-center gap-2">
                            <BoltIcon className="h-4 w-4 text-system-grey" />
                            <span>Ruch</span>
                        </div>
                         <div className="flex items-center gap-2">
                            <BreathingIcon className="h-4 w-4 text-system-grey" />
                            <span>Oddech</span>
                        </div>
                         <div className="flex items-center gap-2">
                            <ArrowPathCircularIcon className="h-4 w-4 text-system-grey" />
                            <span>Reset</span>
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-1">
                    <DailySummary 
                      logs={logs} 
                      completedActions={completedActions}
                      onCopySummary={handleCopySummary}
                      isCopied={isCopied}
                      onResetDataClick={onResetDataClick}
                      onRemoveCompletedAction={onRemoveCompletedAction}
                      onRemoveLog={onRemoveLog}
                      onOpenModal={onOpenSummaryModal}
                      onShowHistory={onShowHistory}
                    />
                </div>
            </div>
            
             <style>{`
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