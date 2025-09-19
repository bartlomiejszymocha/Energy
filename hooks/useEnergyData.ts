import { useState, useEffect, useCallback } from 'react';
import type { EnergyLog, CompletedActionLog } from '../types';

const LOGS_STORAGE_KEY = 'energy_os_logs';
const COMPLETED_ACTIONS_STORAGE_KEY = 'energy_os_completed_actions';

const getInitialLogs = (): EnergyLog[] => {
  try {
    const item = window.localStorage.getItem(LOGS_STORAGE_KEY);
    if (item) {
      return JSON.parse(item);
    }
  } catch (error) {
    console.warn('Error reading logs from localStorage', error);
  }
  
  // Pre-populate with some data for demo purposes
  const demoLogs: EnergyLog[] = [];
  const now = new Date();
  
  for (let i = 6; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(now.getDate() - i);

    const morningRating = Math.floor(Math.random() * 2) + 4; // 4-5
    const middayRating = Math.floor(Math.random() * 2) + 2; // 2-3
    const morningNote = 'Dobry start dnia!';
    const middayNote = i % 2 === 0 ? 'Ciężkie spotkanie z klientem.' : 'Czuję się senny po lunchu.';

    if (i > 0) { // For all previous days, add both logs unconditionally
        const morningTime = new Date(date);
        morningTime.setHours(8, 0, 0, 0);
        demoLogs.push({
            id: `demo_morning_${i}`,
            timestamp: morningTime.getTime(),
            rating: morningRating,
            note: morningNote,
        });

        const middayTime = new Date(date);
        middayTime.setHours(14, 0, 0, 0);
        demoLogs.push({
            id: `demo_midday_${i}`,
            timestamp: middayTime.getTime(),
            rating: middayRating,
            note: middayNote
        });

    } else { // For today, only add logs if the time has passed
        const currentHour = now.getHours();

        if (currentHour >= 8) {
            const morningTime = new Date(date);
            morningTime.setHours(8, 0, 0, 0);
            demoLogs.push({
                id: `demo_morning_${i}`,
                timestamp: morningTime.getTime(),
                rating: morningRating,
                note: morningNote,
            });
        }

        if (currentHour >= 14) {
            const middayTime = new Date(date);
            middayTime.setHours(14, 0, 0, 0);
            demoLogs.push({
                id: `demo_midday_${i}`,
                timestamp: middayTime.getTime(),
                rating: middayRating,
                note: middayNote
            });
        }
    }
  }
  
  return demoLogs;
};

const getInitialCompletedActions = (): CompletedActionLog[] => {
    try {
        const item = window.localStorage.getItem(COMPLETED_ACTIONS_STORAGE_KEY);
        return item ? JSON.parse(item) : [];
    } catch (error) {
        console.warn('Error reading completed actions from localStorage', error);
        return [];
    }
};


export const useEnergyData = () => {
  const [logs, setLogs] = useState<EnergyLog[]>(getInitialLogs);
  const [completedActions, setCompletedActions] = useState<CompletedActionLog[]>(getInitialCompletedActions);


  useEffect(() => {
    try {
      window.localStorage.setItem(LOGS_STORAGE_KEY, JSON.stringify(logs));
    } catch (error) {
      console.warn('Error writing logs to localStorage', error);
    }
  }, [logs]);

  useEffect(() => {
    try {
        window.localStorage.setItem(COMPLETED_ACTIONS_STORAGE_KEY, JSON.stringify(completedActions));
    } catch (error) {
        console.warn('Error writing completed actions to localStorage', error);
    }
  }, [completedActions]);


  const addLog = useCallback((rating: number, note: string) => {
    const newLog: EnergyLog = {
      id: new Date().toISOString(),
      timestamp: Date.now(),
      rating,
    };
    if (note) {
        newLog.note = note;
    }
    setLogs((prevLogs) => [...prevLogs, newLog]);
  }, []);

  const getLogsForDate = useCallback((date: Date): EnergyLog[] => {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    return logs.filter(log => log.timestamp >= startOfDay.getTime() && log.timestamp <= endOfDay.getTime());
  }, [logs]);

  const addCompletedAction = useCallback((actionId: string) => {
    const newCompletedAction: CompletedActionLog = {
        id: new Date().toISOString(),
        timestamp: Date.now(),
        actionId,
    };
    setCompletedActions((prev) => [...prev, newCompletedAction]);
  }, []);

  const getCompletedActionsForDate = useCallback((date: Date): CompletedActionLog[] => {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    return completedActions.filter(log => log.timestamp >= startOfDay.getTime() && log.timestamp <= endOfDay.getTime());
  }, [completedActions]);


  return { logs, addLog, getLogsForDate, completedActions, addCompletedAction, getCompletedActionsForDate };
};