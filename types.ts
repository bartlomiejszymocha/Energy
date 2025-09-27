import type React from 'react';

export interface EnergyLog {
  id: string;
  timestamp: number;
  rating?: number; // 1-5
  note?: string;
  tags?: string[];
}

export type ActionType = 'Reset Energetyczny' | 'Protokół Ruchowy' | 'Technika oddechowa';

export interface Exercise {
  name: string;
  videoUrl?: string;
  note?: string;
}

export type WorkoutStep = {
  type: 'exercise';
  exerciseId: string;
  duration: number; // in seconds
} | {
  type: 'rest';
  duration: number; // in seconds
};

export type EnrichedWorkoutStep = ({
  type: 'exercise';
  exerciseId: string;
} & Exercise & { duration: number }) | {
  type: 'rest';
  name: string;
  duration: number;
};


export interface ActionItem {
  id:string;
  triggerTags: string[];
  type: ActionType;
  duration: number; // in minutes
  title: string;
  content: string;
  videoUrl?: string;
  icon?: string;
  breathingPattern?: '478' | '4784';
  workout?: WorkoutStep[];
  // used in Workout modal to inject close handler
  onClose?: () => void;
}

export interface CompletedActionLog {
  id: string;
  timestamp: number;
  actionId: string;
}

export type Tag = string;

// FIX: Added missing UserSettings and Theme types.
export type Theme = 'light' | 'dark';

export interface UserSettings {
  name: string;
  theme: Theme;
}

// Chart types
export interface ChartPoint {
  timestamp: number;
  rating: number;
  isAction: boolean;
  isNoteOnly: boolean;
  note?: string;
  title?: string;
  icon?: string;
}