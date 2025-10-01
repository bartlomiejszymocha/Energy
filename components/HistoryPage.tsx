import React, { useState, useMemo, useEffect } from 'react';
import type { EnergyLog, CompletedActionLog } from '../types';
import { EnergyChart } from './EnergyChart';
import { DaySummaryCard } from './DaySummaryCard';
import { HistoryDaySelector } from './HistoryDaySelector';
import { ArrowLeftIcon } from './icons/LucideIcons';

interface HistoryPageProps {
    logs: EnergyLog[];
    completedActions: CompletedActionLog[];
    onBack: () => void;
    onRemoveCompletedAction: (logId: string) => void;
    onRemoveLog: (logId: string) => void;
}

const getStartOfDay = (timestamp: number) => {
    const date = new Date(timestamp);
    date.setHours(0, 0, 0, 0);
    return date.getTime();
};

export const HistoryPage: React.FC<HistoryPageProps> = ({ logs, completedActions, onBack, onRemoveCompletedAction, onRemoveLog }) => {
    
    const groupedByDay = useMemo(() => {
        const allEvents = [...logs, ...completedActions];
        const groups = new Map<number, { logs: EnergyLog[], completedActions: CompletedActionLog[] }>();

        allEvents.forEach(event => {
            const dayStart = getStartOfDay(event.timestamp);
            if (!groups.has(dayStart)) {
                groups.set(dayStart, { logs: [], completedActions: [] });
            }
        });
        
        logs.forEach(log => {
            const dayStart = getStartOfDay(log.timestamp);
            groups.get(dayStart)!.logs.push(log);
        });

        completedActions.forEach(action => {
            const dayStart = getStartOfDay(action.timestamp);
            groups.get(dayStart)!.completedActions.push(action);
        });
        
        return groups;
    }, [logs, completedActions]);

    const availableDays = useMemo(() => {
        // FIX: Explicitly type `a` and `b` as numbers to resolve a type inference issue with the sort method.
        return Array.from(groupedByDay.keys()).sort((a: number, b: number) => b - a);
    }, [groupedByDay]);
    
    const [selectedDayTimestamp, setSelectedDayTimestamp] = useState<number | null>(availableDays[0] || null);

    useEffect(() => {
        if (!selectedDayTimestamp && availableDays.length > 0) {
            setSelectedDayTimestamp(availableDays[0]);
        }
    }, [availableDays, selectedDayTimestamp]);

    const selectedDayData = useMemo(() => {
        if (!selectedDayTimestamp) return { logs: [], completedActions: [] };
        return groupedByDay.get(selectedDayTimestamp) || { logs: [], completedActions: [] };
    }, [selectedDayTimestamp, groupedByDay]);
    
    const selectedDateFormatted = useMemo(() => {
        if (!selectedDayTimestamp) return "Wybierz dzień";
        const date = new Date(selectedDayTimestamp);
        const today = new Date();
        const yesterday = new Date();
        yesterday.setDate(today.getDate() - 1);
        if (date.toDateString() === today.toDateString()) return "Dziś";
        if (date.toDateString() === yesterday.toDateString()) return "Wczoraj";
        return new Intl.DateTimeFormat('pl-PL', { day: 'numeric', month: 'long', year: 'numeric' }).format(date);
    }, [selectedDayTimestamp]);


    return (
        <div className="animate-fade-in-up">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-cloud-white">Historia Aktywności</h1>
                <button
                    onClick={onBack}
                    className="flex items-center gap-2 bg-gray-200 dark:bg-space-800 text-gray-700 dark:text-cloud-white font-bold py-2 px-4 rounded-lg shadow-md hover:bg-gray-300 dark:hover:bg-space-700 transition-colors"
                >
                    <ArrowLeftIcon className="h-5 w-5" />
                    <span>Wróć</span>
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 md:items-start">
                {/* Left Sidebar for Day Selection */}
                <div className="md:col-span-1 md:sticky md:top-6">
                    <HistoryDaySelector
                        availableDays={availableDays}
                        selectedDay={selectedDayTimestamp}
                        onSelectDay={setSelectedDayTimestamp}
                    />
                </div>

                {/* Main Content Area */}
                <div className="md:col-span-3 space-y-6">
                    {selectedDayTimestamp ? (
                        <>
                            {/* Chart at the top */}
                            <div className="bg-white dark:bg-space-900 rounded-xl shadow-lg p-4 sm:p-6 border border-gray-200 dark:border-transparent">
                                <h3 className="text-lg font-medium text-gray-700 dark:text-cloud-white/80 mb-4">
                                    Wykres energii - <span className="text-electric-500 font-semibold">{selectedDateFormatted}</span>
                                </h3>
                                <div className="h-72">
                                    <EnergyChart logs={selectedDayData.logs} completedActions={selectedDayData.completedActions} />
                                </div>
                            </div>

                            {/* Summary at the bottom */}
                            <div className="bg-white dark:bg-space-900 rounded-xl shadow-lg border border-gray-200 dark:border-transparent">
                                <DaySummaryCard
                                    logs={selectedDayData.logs}
                                    completedActions={selectedDayData.completedActions}
                                    onRemoveLog={onRemoveLog}
                                    onRemoveCompletedAction={onRemoveCompletedAction}
                                />
                            </div>
                        </>
                    ) : (
                        <div className="md:col-span-3 bg-white dark:bg-space-900 rounded-xl shadow-lg p-6 flex items-center justify-center h-full border border-gray-200 dark:border-transparent">
                            <p className="text-gray-600 dark:text-system-grey text-center">Wybierz dzień z listy, aby zobaczyć jego historię.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
