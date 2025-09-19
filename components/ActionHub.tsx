import React, { useMemo, useState } from 'react';
import { ACTION_LIBRARY } from '../constants/actions';
import { ActionCard } from './ActionCard';
import type { ActionType } from '../types';
import { BoltIcon, SparklesIcon } from './icons/Icons';

interface ActionHubProps {
  addCompletedAction: (actionId: string) => void;
  completedActionIds: Set<string>;
  onPlayVideo: (url: string) => void;
}

export const ActionHub: React.FC<ActionHubProps> = ({ addCompletedAction, completedActionIds, onPlayVideo }) => {
  const [filter, setFilter] = useState<ActionType | 'all'>('all');

  const filteredActions = useMemo(() => {
    if (filter === 'all') {
      return ACTION_LIBRARY;
    }
    return ACTION_LIBRARY.filter(action => action.type === filter);
  }, [filter]);

  const buttonClasses = "px-4 py-2 rounded-full font-medium transition-colors duration-200 flex items-center gap-2 whitespace-nowrap";
  const activeClasses = "bg-space-700 text-cloud-white";
  const inactiveClasses = "bg-space-800 text-system-grey hover:bg-space-700";

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-cloud-white mb-2">Narzędziownik energetyczny</h1>
        <p className="text-lg text-system-grey">Wszystkie dostępne resety i protokoły, aby zarządzać swoją energią.</p>
      </div>

      <div className="flex items-center justify-center flex-wrap gap-2 sm:gap-4 bg-space-900 p-2 rounded-xl">
        <button onClick={() => setFilter('all')} className={`${buttonClasses} ${filter === 'all' ? activeClasses : inactiveClasses}`}>
          Wszystko
        </button>
        <button onClick={() => setFilter('Reset Energetyczny')} className={`${buttonClasses} ${filter === 'Reset Energetyczny' ? activeClasses : inactiveClasses}`}>
           <SparklesIcon className="h-5 w-5 text-electric-500" />
           Resety Energetyczne
        </button>
        <button onClick={() => setFilter('Protokół Ruchowy')} className={`${buttonClasses} ${filter === 'Protokół Ruchowy' ? activeClasses : inactiveClasses}`}>
           <BoltIcon className="h-5 w-5 text-electric-500" />
           Protokoły Ruchowe
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-start">
        {filteredActions.map(action => (
            <ActionCard 
              key={action.id}
              action={action} 
              onActionComplete={addCompletedAction}
              isCompleted={completedActionIds.has(action.id)}
              onPlayVideo={onPlayVideo}
              isCompact={true}
            />
        ))}
      </div>
    </div>
  );
};