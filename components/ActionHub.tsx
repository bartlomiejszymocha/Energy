
import React, { useState, useMemo } from 'react';
import type { ActionItem, ActionType } from '../types';
import { ActionCard } from './ActionCard';
import { ACTION_LIBRARY } from '../constants/actions';
import { ArrowPathCircularIcon, BoltIcon, BreathingIcon, StarIcon } from './icons/Icons';

interface ActionHubProps {
    onCompleteAction: (actionId: string) => void;
    completionCounts: Map<string, number>;
    onPlayAction: (action: ActionItem) => void;
    favoriteActionIds: Set<string>;
    onToggleFavorite: (actionId: string) => void;
    onOpenBreathingModal: (action: ActionItem) => void;
    todayCompletedActionIds: Set<string>;
}

type FilterType = 'all' | 'reset' | 'movement' | 'breath' | 'favorites';

export const ActionHub: React.FC<ActionHubProps> = ({ 
    onCompleteAction, 
    completionCounts, 
    onPlayAction, 
    favoriteActionIds, 
    onToggleFavorite,
    onOpenBreathingModal,
    todayCompletedActionIds
}) => {
    const [duration, setDuration] = useState(15);
    const [filter, setFilter] = useState<FilterType>('all');
    const [expandedActionId, setExpandedActionId] = useState<string | null>(null);

    const handleToggleExpand = (actionId: string) => {
        setExpandedActionId(prevId => (prevId === actionId ? null : actionId));
    };

    const filteredActions = useMemo(() => {
        const actualDuration = isNaN(duration) || duration < 1 ? 1 : duration > 15 ? 15 : duration;
        const filtered = ACTION_LIBRARY.filter(action => {
            if (action.duration > actualDuration) {
                return false;
            }
            
            switch (filter) {
                case 'reset':
                    return action.type === 'Reset Energetyczny';
                case 'movement':
                    return action.type === 'Protokół Ruchowy';
                case 'breath':
                    return action.type === 'Technika oddechowa';
                case 'favorites':
                    return favoriteActionIds.has(action.id);
                case 'all':
                default:
                    return true;
            }
        });

        if (filter === 'all') {
            const typeOrder: { [key in ActionType]: number } = {
                'Protokół Ruchowy': 1,
                'Technika oddechowa': 2,
                'Reset Energetyczny': 3,
            };
            return filtered.sort((a, b) => typeOrder[a.type] - typeOrder[b.type]);
        }

        return filtered;

    }, [duration, filter]);
    
    const filterButtons = [
        { key: 'all' as FilterType, label: 'Wszystko', icon: null },
        { key: 'movement' as FilterType, label: 'Ruch', icon: BoltIcon },
        { key: 'breath' as FilterType, label: 'Oddech', icon: BreathingIcon },
        { key: 'reset' as FilterType, label: 'Reset', icon: ArrowPathCircularIcon },
        { key: 'favorites' as FilterType, label: 'Ulubione', icon: StarIcon },
    ];

    const handleDurationInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = parseInt(e.target.value, 10);
        setDuration(isNaN(value) ? 0 : value); // Allow temporary invalid state for typing
    };

    const handleDurationInputBlur = () => {
        if (isNaN(duration) || duration < 1) {
            setDuration(1);
        } else if (duration > 15) {
            setDuration(15);
        }
    };

    const progressPercentage = isNaN(duration) ? 100 : ((Math.max(1, Math.min(15, duration)) - 1) / 14) * 100;

    return (
        <div className="space-y-6 pt-4 sm:pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                <div className="text-center md:text-left">
                    <h2 className="text-2xl md:text-3xl font-bold text-cloud-white">
                        <span role="img" aria-label="Toolbox" className="mr-3">🧰</span>
                        Narzędziownik energetyczny
                    </h2>
                    <p className="text-cloud-white/80 mt-2 max-w-md mx-auto md:mx-0">
                        Wszystkie dostępne protokoły ruchowe, techniki oddechowe i resety energetyczne.
                        {favoriteActionIds.size === 0 && (
                            <> Dodaj do ulubionych (klikając ⭐) te, których używasz najczęściej.</>
                        )}
                    </p>
                </div>
                
                <div className="w-full max-w-lg mx-auto md:max-w-none">
                    <div className="flex flex-col items-center md:items-start w-full">
                        <div className="w-full text-center md:text-left mb-1">
                             <div className="flex items-center justify-center md:justify-start gap-2">
                                <span className="text-cloud-white/80">Ile masz czasu?</span>
                                 <div className="text-lg font-bold text-electric-500 flex items-center gap-1.5">
                                    <input
                                        type="number"
                                        min="1"
                                        max="15"
                                        value={duration === 0 ? '' : duration}
                                        onChange={handleDurationInputChange}
                                        onBlur={handleDurationInputBlur}
                                        className="tabular-nums w-[4ch] bg-transparent p-1 border-0 text-lg font-bold text-electric-500 focus:outline-none focus:ring-1 focus:ring-electric-500 focus:bg-space-800 rounded-md text-center"
                                    />
                                    <span>min</span>
                                    <span>⏱️</span>
                                 </div>
                             </div>
                        </div>
                        <div className="w-full relative py-2">
                             <div className="absolute top-1/2 left-0 right-0 w-full grid grid-cols-15 px-1 h-2 -translate-y-1/2" aria-hidden="true">
                                {Array.from({ length: 15 }).map((_, i) => (
                                    <div key={i} className="flex justify-center items-center">
                                        <div className="h-full w-px bg-space-700/70"></div>
                                    </div>
                                ))}
                            </div>
                             <input
                                type="range"
                                min="1"
                                max="15"
                                step="1"
                                value={duration}
                                onChange={(e) => setDuration(Number(e.target.value))}
                                onBlur={handleDurationInputBlur}
                                className="w-full h-3 bg-transparent appearance-none cursor-pointer range-slider relative z-10"
                                style={{ '--value': `${progressPercentage}%` } as React.CSSProperties}
                            />
                        </div>
                    </div>
                </div>
            </div>
            
            <style>{`
                /* Grid for ticks */
                .grid-cols-15 {
                    grid-template-columns: repeat(15, minmax(0, 1fr));
                }
                .range-slider {
                    -webkit-appearance: none;
                    appearance: none;
                }
                
                /* Track Styles */
                .range-slider::-webkit-slider-runnable-track {
                    width: 100%;
                    height: 8px;
                    cursor: pointer;
                    background: linear-gradient(to right, #007AFF var(--value), #24324E var(--value));
                    border-radius: 9999px;
                }
                .range-slider::-moz-range-track {
                    width: 100%;
                    height: 8px;
                    cursor: pointer;
                    background: linear-gradient(to right, #007AFF var(--value), #24324E var(--value));
                    border-radius: 9999px;
                }
                
                /* Thumb Styles */
                .range-slider::-webkit-slider-thumb {
                    -webkit-appearance: none;
                    appearance: none;
                    width: 24px;
                    height: 24px;
                    background: #F4F6F8;
                    border-radius: 50%;
                    box-shadow: 0 0 12px #007AFF;
                    transition: transform 0.2s ease-in-out;
                    cursor: pointer;
                    margin-top: -8px; /* Center thumb on track */
                }
                .range-slider:active::-webkit-slider-thumb {
                    transform: scale(1.15);
                }
                .range-slider::-moz-range-thumb {
                    width: 24px;
                    height: 24px;
                    background: #F4F6F8;
                    border-radius: 50%;
                    border: none;
                    box-shadow: 0 0 12px #007AFF;
                    transition: transform 0.2s ease-in-out;
                    cursor: pointer;
                }
                 .range-slider:active::-moz-range-thumb {
                    transform: scale(1.15);
                }
                /* Hide number input arrows */
                input[type=number]::-webkit-inner-spin-button,
                input[type=number]::-webkit-outer-spin-button {
                    -webkit-appearance: none;
                    margin: 0;
                }
                input[type=number] {
                    -moz-appearance: textfield;
                }
            `}</style>

            {/* ActionHub with modern glassmorphism styling */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-2 backdrop-blur-sm">
                <div className="flex items-center justify-center gap-1 md:gap-2 flex-wrap">
                    {filterButtons.map(({ key, label, icon: Icon }) => (
                         <button 
                            key={key}
                            onClick={() => setFilter(key)}
                            className={`px-1.5 md:px-4 py-1.5 md:py-2 rounded-lg text-xs md:text-sm font-bold flex items-center gap-1 md:gap-2 transition-all duration-200 ${filter === key ? 'bg-electric-500 text-cloud-white' : 'bg-white/5 border border-white/10 text-system-grey hover:bg-white/10 hover:border-white/20 backdrop-blur-sm'}`}
                        >
                            {Icon && <Icon className="h-3.5 w-3.5 md:h-5 md:w-5" />}
                            <span className="hidden sm:inline">{label}</span>
                            <span className="sm:hidden">{label.split(' ')[0]}</span>
                        </button>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 items-start">
                {filteredActions.length > 0 ? (
                    filteredActions.map(action => (
                        <ActionCard 
                            key={action.id} 
                            action={action}
                            onComplete={onCompleteAction}
                            completionCount={completionCounts.get(action.id) || 0}
                            onPlayAction={onPlayAction}
                            isFavorite={favoriteActionIds.has(action.id)}
                            onToggleFavorite={onToggleFavorite}
                            onOpenBreathingModal={action.breathingPattern ? onOpenBreathingModal : undefined}
                            isExpanded={expandedActionId === action.id}
                            onToggleExpand={handleToggleExpand}
                            isCompletedToday={todayCompletedActionIds.has(action.id)}
                        />
                    ))
                ) : (
                    <div className="col-span-full text-center py-10">
                        <p className="text-system-grey">Brak akcji spełniających wybrane kryteria.</p>
                    </div>
                )}
            </div>
        </div>
    );
};