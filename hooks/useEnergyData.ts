
import { useState, useEffect, useCallback } from 'react';
import { db } from '../firebase';
import { 
    collection, 
    query, 
    onSnapshot, 
    addDoc, 
    deleteDoc, 
    doc,
    setDoc,
    updateDoc,
    arrayUnion,
    arrayRemove,
    writeBatch,
    getDocs,
    Timestamp
} from 'firebase/firestore';
import type { EnergyLog, CompletedActionLog } from '../types';

// FIX: Add missing SyncState type for SyncStatus component.
export type SyncState = 'idle' | 'syncing' | 'success' | 'error';

// Local Storage Keys
const LS_LOGS_KEY = 'energy_os_logs_anonymous';
const LS_ACTIONS_KEY = 'energy_os_actions_anonymous';
const LS_FAVORITES_KEY = 'energy_os_favorites_anonymous';

// Firestore collection names
const USERS_COLLECTION = 'users';
const LOGS_COLLECTION = 'logs';
const ACTIONS_COLLECTION = 'completedActions';

const getFromLocalStorage = <T>(key: string, defaultValue: T): T => {
    try {
        const item = window.localStorage.getItem(key);
        return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
        console.warn(`Error reading from localStorage key “${key}”:`, error);
        return defaultValue;
    }
};

export const useEnergyData = (uid: string | null) => {
  const [logs, setLogs] = useState<EnergyLog[]>([]);
  const [completedActions, setCompletedActions] = useState<CompletedActionLog[]>([]);
  const [favoriteActions, setFavoriteActions] = useState<Set<string>>(new Set());
  const [streak, setStreak] = useState(0);

  // Effect to handle data loading from either Firestore or LocalStorage
  useEffect(() => {
    if (uid) {
        // AUTHENTICATED USER: Use Firestore
        const userDocRef = doc(db, USERS_COLLECTION, uid);
        const unsubscribeUser = onSnapshot(userDocRef, (docSnap) => {
            if (docSnap.exists()) {
                const userData = docSnap.data();
                setFavoriteActions(new Set(userData.favoriteActions || []));
            } else {
                setDoc(userDocRef, { favoriteActions: [] });
            }
        });

        const logsQuery = query(collection(db, USERS_COLLECTION, uid, LOGS_COLLECTION));
        const unsubscribeLogs = onSnapshot(logsQuery, (querySnapshot) => {
            const userLogs: EnergyLog[] = querySnapshot.docs.map(d => ({
                id: d.id,
                ...(d.data() as Omit<EnergyLog, 'id' | 'timestamp'> & { timestamp: Timestamp }),
                timestamp: (d.data().timestamp as Timestamp).toMillis(),
            }));
            setLogs(userLogs.sort((a, b) => a.timestamp - b.timestamp));
        });

        const actionsQuery = query(collection(db, USERS_COLLECTION, uid, ACTIONS_COLLECTION));
        const unsubscribeActions = onSnapshot(actionsQuery, (querySnapshot) => {
            const userActions: CompletedActionLog[] = querySnapshot.docs.map(d => ({
                id: d.id,
                ...(d.data() as Omit<CompletedActionLog, 'id' | 'timestamp'> & { timestamp: Timestamp }),
                timestamp: (d.data().timestamp as Timestamp).toMillis(),
            }));
            setCompletedActions(userActions);
        });

        return () => {
            unsubscribeUser();
            unsubscribeLogs();
            unsubscribeActions();
        };
    } else {
        // ANONYMOUS USER: Use LocalStorage
        const localLogs = getFromLocalStorage<EnergyLog[]>(LS_LOGS_KEY, []);
        const localActions = getFromLocalStorage<CompletedActionLog[]>(LS_ACTIONS_KEY, []);
        const localFavorites = getFromLocalStorage<string[]>(LS_FAVORITES_KEY, []);
        
        setLogs(localLogs.sort((a, b) => a.timestamp - b.timestamp));
        setCompletedActions(localActions);
        setFavoriteActions(new Set(localFavorites));
    }
  }, [uid]);

  const calculateStreak = (actions: CompletedActionLog[]): number => {
    if (actions.length === 0) return 0;
    const uniqueDays = [...new Set(actions.map(action => new Date(action.timestamp).toDateString()))]
        .map(dateString => new Date(dateString).getTime()).sort((a, b) => b - a);
    if (uniqueDays.length === 0) return 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    const mostRecentActionDay = new Date(uniqueDays[0]);
    mostRecentActionDay.setHours(0, 0, 0, 0);
    if (mostRecentActionDay.getTime() < yesterday.getTime()) return 0;
    let streak = 0;
    let currentDay = new Date(mostRecentActionDay);
    for (const dayTime of uniqueDays) {
        const actionDay = new Date(dayTime);
        if (actionDay.getTime() === currentDay.getTime()) {
            streak++;
            currentDay.setDate(currentDay.getDate() - 1);
        } else {
            break;
        }
    }
    return streak;
  };

  useEffect(() => {
    setStreak(calculateStreak(completedActions));
  }, [completedActions]);

  const addLog = useCallback(async (rating: number | undefined, note: string, tags: string[], timestamp: number) => {
    const logData = { rating, note, tags, timestamp };
    const trimmedNote = note.trim();
    const logToWrite: { timestamp: Timestamp; tags: string[]; note?: string; rating?: number } = {
      timestamp: Timestamp.fromMillis(timestamp),
      tags,
    };
    if (trimmedNote.length > 0) logToWrite.note = trimmedNote;
    if (typeof rating === 'number' && rating > 0) logToWrite.rating = rating;

    if (uid) {
        await addDoc(collection(db, USERS_COLLECTION, uid, LOGS_COLLECTION), logToWrite);
    } else {
        const newLog: EnergyLog = { id: `local-${Date.now()}`, ...logData };
        setLogs(prev => {
            const updated = [...prev, newLog];
            localStorage.setItem(LS_LOGS_KEY, JSON.stringify(updated));
            return updated;
        });
    }
  }, [uid]);

  const removeLog = useCallback(async (logId: string) => {
    if (uid) {
        await deleteDoc(doc(db, USERS_COLLECTION, uid, LOGS_COLLECTION, logId));
    } else {
        setLogs(prev => {
            const updated = prev.filter(log => log.id !== logId);
            localStorage.setItem(LS_LOGS_KEY, JSON.stringify(updated));
            return updated;
        });
    }
  }, [uid]);

  const addCompletedAction = useCallback(async (actionId: string) => {
    if (uid) {
        await addDoc(collection(db, USERS_COLLECTION, uid, ACTIONS_COLLECTION), { actionId, timestamp: Timestamp.now() });
    } else {
        const newAction: CompletedActionLog = { id: `local-${Date.now()}`, actionId, timestamp: Date.now() };
        setCompletedActions(prev => {
            const updated = [...prev, newAction];
            localStorage.setItem(LS_ACTIONS_KEY, JSON.stringify(updated));
            return updated;
        });
    }
  }, [uid]);

  const removeCompletedAction = useCallback(async (logId: string) => {
    if (uid) {
        await deleteDoc(doc(db, USERS_COLLECTION, uid, ACTIONS_COLLECTION, logId));
    } else {
        setCompletedActions(prev => {
            const updated = prev.filter(a => a.id !== logId);
            localStorage.setItem(LS_ACTIONS_KEY, JSON.stringify(updated));
            return updated;
        });
    }
  }, [uid]);
  
  const addFavoriteAction = useCallback(async (actionId: string) => {
    if (uid) {
        await updateDoc(doc(db, USERS_COLLECTION, uid), { favoriteActions: arrayUnion(actionId) });
    } else {
        setFavoriteActions(prev => {
            const updated = new Set(prev).add(actionId);
            localStorage.setItem(LS_FAVORITES_KEY, JSON.stringify(Array.from(updated)));
            return updated;
        });
    }
  }, [uid]);

  const removeFavoriteAction = useCallback(async (actionId: string) => {
    if (uid) {
        await updateDoc(doc(db, USERS_COLLECTION, uid), { favoriteActions: arrayRemove(actionId) });
    } else {
        setFavoriteActions(prev => {
            const updated = new Set(prev);
            updated.delete(actionId);
            localStorage.setItem(LS_FAVORITES_KEY, JSON.stringify(Array.from(updated)));
            return updated;
        });
    }
  }, [uid]);

  const resetAllData = useCallback(async () => {
    if (uid) {
        const batch = writeBatch(db);
        const logsSnapshot = await getDocs(query(collection(db, USERS_COLLECTION, uid, LOGS_COLLECTION)));
        logsSnapshot.forEach(doc => batch.delete(doc.ref));
        const actionsSnapshot = await getDocs(query(collection(db, USERS_COLLECTION, uid, ACTIONS_COLLECTION)));
        actionsSnapshot.forEach(doc => batch.delete(doc.ref));
        batch.update(doc(db, USERS_COLLECTION, uid), { favoriteActions: [] });
        await batch.commit();
    } else {
        localStorage.removeItem(LS_LOGS_KEY);
        localStorage.removeItem(LS_ACTIONS_KEY);
        localStorage.removeItem(LS_FAVORITES_KEY);
        setLogs([]);
        setCompletedActions([]);
        setFavoriteActions(new Set());
    }
  }, [uid]);

  const migrateLocalToFirestore = useCallback(async (newUid: string) => {
    const localLogs = getFromLocalStorage<EnergyLog[]>(LS_LOGS_KEY, []);
    const localActions = getFromLocalStorage<CompletedActionLog[]>(LS_ACTIONS_KEY, []);
    const localFavorites = getFromLocalStorage<string[]>(LS_FAVORITES_KEY, []);

    if (!localLogs.length && !localActions.length && !localFavorites.length) {
        return; // Nothing to migrate
    }

    const batch = writeBatch(db);

    // Migrate logs
    localLogs.forEach(log => {
        const { id, ...logData } = log;
        const docRef = doc(collection(db, USERS_COLLECTION, newUid, LOGS_COLLECTION));
        batch.set(docRef, { ...logData, timestamp: Timestamp.fromMillis(log.timestamp) });
    });

    // Migrate completed actions
    localActions.forEach(action => {
        const { id, ...actionData } = action;
        const docRef = doc(collection(db, USERS_COLLECTION, newUid, ACTIONS_COLLECTION));
        batch.set(docRef, { ...actionData, timestamp: Timestamp.fromMillis(action.timestamp) });
    });

    // Migrate favorites
    if (localFavorites.length > 0) {
        const userDocRef = doc(db, USERS_COLLECTION, newUid);
        batch.set(userDocRef, { favoriteActions: localFavorites }, { merge: true });
    }
    
    await batch.commit();

    // Clear local storage after successful migration
    localStorage.removeItem(LS_LOGS_KEY);
    localStorage.removeItem(LS_ACTIONS_KEY);
    localStorage.removeItem(LS_FAVORITES_KEY);
  }, []);

  return { 
      logs, addLog, removeLog,
      completedActions, addCompletedAction, removeCompletedAction,
      favoriteActions, addFavoriteAction, removeFavoriteAction,
      streak,
      resetAllData,
      migrateLocalToFirestore
  };
};
