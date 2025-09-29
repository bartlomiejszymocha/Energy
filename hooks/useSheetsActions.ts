import { useState, useEffect } from 'react';
import type { ActionItem } from '../types';

interface UseSheetsActionsReturn {
  actions: ActionItem[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export const useSheetsActions = (): UseSheetsActionsReturn => {
  const [actions, setActions] = useState<ActionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchActions = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/sheets-to-actions');
      
      if (!response.ok) {
        throw new Error('Failed to fetch actions');
      }
      
      const data = await response.json();
      setActions(data.actions);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      console.error('Error fetching actions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActions();
  }, []);

  return {
    actions,
    loading,
    error,
    refetch: fetchActions
  };
};



