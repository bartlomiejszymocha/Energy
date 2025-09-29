import { useState, useEffect, useCallback, useRef } from 'react';
import type { Exercise } from '../types';

interface UseSheetsExercisesReturn {
  exercises: Record<string, Exercise>;
  loading: boolean;
  error: string | null;
  lastUpdated: Date | null;
  refresh: () => Promise<void>;
  isOnline: boolean;
}

export const useSheetsExercises = (): UseSheetsExercisesReturn => {
  const [exercises, setExercises] = useState<Record<string, Exercise>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  
  const retryCount = useRef(0);
  const maxRetries = 3;
  const retryDelay = useRef(1000);

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

  const fetchExercises = useCallback(async (isRetry = false) => {
    if (!isOnline && !isRetry) {
      console.log('Offline - skipping exercise fetch');
      return;
    }

    try {
      if (!isRetry) {
        setLoading(true);
        setError(null);
      }

      // Check if localhost (development) - use static fallback
      const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
      
      if (isLocalhost) {
        console.log('🔍 Development mode - using empty exercise library fallback');
        setExercises({});
        setLastUpdated(new Date());
        setError(null);
        setLoading(false);
        return;
      }

      // Production: use working API endpoint
      const apiEndpoint = 'https://www.resetujenergie.pl/api/sheets-to-exercises';
      
      const response = await fetch(apiEndpoint, {
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: Record<string, Exercise> = await response.json();
      
      console.log('Exercises API Response:', data);
      
      setExercises(data);
      setLastUpdated(new Date());
      setError(null);
      retryCount.current = 0;
      retryDelay.current = 1000;

      console.log(`Fetched ${Object.keys(data).length} exercises from Sheets API`);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      
      if (retryCount.current < maxRetries) {
        retryCount.current++;
        console.log(`Retry ${retryCount.current}/${maxRetries} after ${retryDelay.current}ms`);
        
        setTimeout(() => {
          fetchExercises(true);
        }, retryDelay.current);
        
        retryDelay.current *= 2; // Exponential backoff
      } else {
        setError(errorMessage);
        console.error("Failed to fetch exercises from Sheets API:", err);
        // Fallback to empty library on error
        setExercises({});
      }
    } finally {
      setLoading(false);
    }
  }, [isOnline]);

  // Automatyczne odświeżanie
  useEffect(() => {
    fetchExercises();

    // Odśwież co 5 minut
    const interval = setInterval(() => {
      if (isOnline) {
        fetchExercises();
      }
    }, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [fetchExercises, isOnline]);

  // Odśwież gdy wracasz online
  useEffect(() => {
    if (isOnline && Object.keys(exercises).length === 0) {
      fetchExercises();
    }
  }, [isOnline, exercises, fetchExercises]);

  const refresh = useCallback(async () => {
    retryCount.current = 0;
    retryDelay.current = 1000;
    await fetchExercises();
  }, [fetchExercises]);

  return { 
    exercises, 
    loading, 
    error, 
    lastUpdated, 
    refresh, 
    isOnline 
  };
};