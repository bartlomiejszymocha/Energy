import { useState, useEffect, useCallback, useRef } from 'react';
import type { ActionItem } from '../types';

interface UseSheetsActionsReturn {
  actions: ActionItem[];
  loading: boolean;
  error: string | null;
  lastUpdated: Date | null;
  refresh: () => Promise<void>;
  isOnline: boolean;
}

export const useSheetsActionsOptimized = (): UseSheetsActionsReturn => {
  const [actions, setActions] = useState<ActionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  
  const retryCount = useRef(0);
  const maxRetries = 3;
  const retryDelay = useRef(1000); // Start with 1 second

  // Sprawdź połączenie internetowe
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const fetchActions = useCallback(async (isRetry = false) => {
    if (!isOnline && !isRetry) {
      console.log('Offline - skipping fetch');
      return;
    }

    try {
      if (!isRetry) {
        setLoading(true);
        setError(null);
      }

      // Check if localhost (development) - DISABLED for testing
      const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
      
      if (isLocalhost) { // ENABLED - use different sample actions for testing
        console.log('🔍 Development mode - using static actions fallback');
        console.log('🔍 Hostname:', window.location.hostname);
        // In development, provide sample actions for testing
        const sampleActions: ActionItem[] = [
          {
            id: 'dev_action_1',
            name: 'Reboot - BrainFlow (DEV)',
            type: 'Protokół Ruchowy',
            icon: '🧠',
            description: 'Test akcji z workout string 1',
            triggerTags: ['focus', 'brain'],
            timeOfDay: ['Poranek'],
            rules: 'admin',
            workout: 'ex005 60, R 30, ex002 45, R 30, ex003 60'
          },
          {
            id: 'dev_action_2', 
            name: 'NSDR (DEV)',
            type: 'Protokół Ruchowy',
            icon: '🧘',
            description: 'Test akcji z workout string 2',
            triggerTags: ['relax', 'energy'],
            timeOfDay: ['Wieczór'],
            rules: 'public',
            workout: 'ex017 20, R 20, ex002 30, R10, ex10 40, R 10'
          },
          {
            id: 'dev_action_3',
            name: 'Stwórz coś kreatywnego (DEV)',
            type: 'Protokół Ruchowy',
            icon: '🎨',
            description: 'Test akcji z workout string 3',
            triggerTags: ['creative', 'focus'],
            timeOfDay: ['Południe'],
            rules: 'public',
            workout: 'ex003 60, R 30, ex005 45, R 30, ex007 60'
          }
        ];
        
        setActions(sampleActions);
        setLastUpdated(new Date());
        setError(null);
        setLoading(false);
        return;
      }

      // Production: use working API endpoint
      const apiEndpoint = 'https://www.resetujenergie.pl/api/sheets-to-actions-optimized';
      
      const response = await fetch(apiEndpoint, {
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: ActionItem[] = await response.json();
      
      console.log('Sheets API Response:', data);
      
      setActions(data);
      setLastUpdated(new Date());
      setError(null);
      retryCount.current = 0;
      retryDelay.current = 1000; // Reset retry delay

      console.log(`Fetched ${data.length} actions from Sheets API`);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      
      if (retryCount.current < maxRetries) {
        retryCount.current++;
        console.log(`Retry ${retryCount.current}/${maxRetries} after ${retryDelay.current}ms`);
        
        setTimeout(() => {
          fetchActions(true);
        }, retryDelay.current);
        
        retryDelay.current *= 2; // Exponential backoff
      } else {
        setError(errorMessage);
        console.error("Failed to fetch actions from Sheets API:", err);
      }
    } finally {
      setLoading(false);
    }
  }, [isOnline]);

  // Automatyczne odświeżanie
  useEffect(() => {
    fetchActions();

    // Odśwież co 5 minut
    const interval = setInterval(() => {
      if (isOnline) {
        fetchActions();
      }
    }, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [fetchActions, isOnline]);

  // Odśwież gdy wracasz online
  useEffect(() => {
    if (isOnline && actions.length === 0) {
      fetchActions();
    }
  }, [isOnline, actions.length, fetchActions]);

  const refresh = useCallback(async () => {
    retryCount.current = 0;
    retryDelay.current = 1000;
    await fetchActions();
  }, [fetchActions]);

  return { 
    actions, 
    loading, 
    error, 
    lastUpdated, 
    refresh, 
    isOnline 
  };
};
