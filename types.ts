export interface EnergyLog {
  id: string;
  timestamp: number;
  rating: number; // 1-5
  note?: string;
}

export type ActionType = 'Reset Energetyczny' | 'Protokół Ruchowy';

export interface ActionItem {
  id: string;
  triggerTags: string[];
  type: ActionType;
  duration: number; // in minutes
  title: string;
  content: string;
  videoUrl?: string;
}

export interface Insight {
  summary: string;
  recommendedActionId: string | null;
}

export type AppView = 'dashboard' | 'actionHub';

export interface CompletedActionLog {
  id: string;
  timestamp: number;
  actionId: string;
}

// FIX: Export the Tag type alias for string to resolve import errors.
export type Tag = string;
