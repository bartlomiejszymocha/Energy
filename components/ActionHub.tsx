
import React, { useState, useMemo } from 'react';
import type { ActionItem, ActionType } from '../types';
import { ActionCard } from './ActionCard';
// import { ACTION_LIBRARY } from '../constants/actions'; // Usunięto - używamy tylko Google Sheets
import { useSheetsActionsOptimized } from '../hooks/useSheetsActionsOptimized';
import { useUserPermissions } from '../hooks/useUserPermissions';
import { ArrowPathCircularIcon, BoltIcon, BreathingIcon, StarIcon, CogIcon, WrenchIcon, ZapIcon, BoxIcon, LayoutGridIcon, GridIcon, BriefcaseIcon } from './icons/LucideIcons';

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
    // Hook do pobierania danych z Google Sheets przez Vercel API
    const { actions: sheetsActions, loading: sheetsLoading, error: sheetsError, refresh: refreshSheets } = useSheetsActionsOptimized();
    // Hook do sprawdzania uprawnień użytkownika
    const { canViewAction, isLoading: permissionsLoading, role } = useUserPermissions();
    const [duration, setDuration] = useState(15);
    const [filter, setFilter] = useState<FilterType>('all');
    const [expandedActionId, setExpandedActionId] = useState<string | null>(null);

    const handleToggleExpand = (actionId: string) => {
        setExpandedActionId(prevId => (prevId === actionId ? null : actionId));
    };

    // Reset expanded card when filter changes
    React.useEffect(() => {
        setExpandedActionId(null);
    }, [filter]);

    const filteredActions = useMemo(() => {
        const actualDuration = isNaN(duration) || duration < 1 ? 1 : duration > 15 ? 15 : duration;
        
        // Używamy tylko akcji z Google Sheets
        const actionsSource = sheetsActions;
        
        const filtered = actionsSource.filter(action => {
            // 1. Check permissions first
            const hasPermission = canViewAction(action.rules || 'public');
            
            if (!hasPermission) {
                return false;
            }
            
            // 2. Check duration
            if (action.duration > actualDuration) {
                return false;
            }
            
            switch (filter) {
                case 'reset':
                    return action.type === 'Reset Energetyczny';
                case 'movement':
                    return ['Protokół Ruchowy', 'Protokuł Ruchowy'].includes(action.type);
                case 'breath':
                    return ['Technika oddechowa', 'Technika Oddechowa'].includes(action.type);
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
                'Protokuł Ruchowy': 1,
                'Technika oddechowa': 2,
                'Technika Oddechowa': 2,
                'Reset Energetyczny': 3,
            };
            return filtered.sort((a, b) => typeOrder[a.type] - typeOrder[b.type]);
        }

        return filtered;

    }, [duration, filter, sheetsActions, sheetsLoading, sheetsError, favoriteActionIds, canViewAction, permissionsLoading, role]);
    
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
        <div className="space-y-6 pt-0 sm:pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                <div className="text-center md:text-left md:pl-4">
                    <div className="flex items-start justify-center md:justify-start gap-3">
                        <GridIcon className="h-6 w-6 md:h-8 md:w-8 text-electric-500 flex-shrink-0" />
                        <div>
                            <div className="flex items-center justify-center md:justify-start gap-3">
                                <h2 className="text-[21.6px] md:text-3xl font-bold text-gray-900 dark:text-cloud-white">
                                    Narzędziownik energetyczny
                                </h2>
                                {(sheetsLoading || permissionsLoading) && (
                                    <div className="flex items-center gap-1 text-sm text-electric-500">
                                        <ArrowPathCircularIcon className="h-4 w-4 animate-spin" />
                                        <span>{permissionsLoading ? 'Sprawdzanie uprawnień...' : 'Synchronizacja...'}</span>
                                    </div>
                                )}
                                {sheetsError && (
                                    <button
                                        onClick={refreshSheets}
                                        className="flex items-center gap-1 text-sm text-danger-red hover:text-danger-red/80 transition"
                                        title="Błąd synchronizacji - kliknij aby odświeżyć"
                                    >
                                        <ArrowPathCircularIcon className="h-4 w-4" />
                                        <span>Błąd</span>
                                    </button>
                                )}
                            </div>
                    <p className="text-[12.6px] sm:text-[14.4px] text-gray-600 dark:text-cloud-white/80 mt-2 max-w-md mx-auto md:mx-0">
                        Gotowe protokoły do natychmiastowego użycia - ruch, oddech i regeneracja.
                        {favoriteActionIds.size === 0 && (
                            <> Oznacz gwiazdką ⭐ swoje ulubione.</>
                        )}
                    </p>
                        </div>
                    </div>
                </div>
                
                <div className="w-full max-w-lg mx-auto md:max-w-none px-2 sm:px-0 md:pr-4">
                    <div className="flex flex-col items-center md:items-start w-full">
                        <div className="w-full text-center md:text-left mb-1">
                             <div className="flex items-center justify-center md:justify-start gap-2">
                                <span className="text-gray-600 dark:text-cloud-white/80">Ile masz czasu?</span>
                                 <div className="text-lg font-bold text-electric-500 flex items-center gap-1.5">
                                    <input
                                        type="number"
                                        min="1"
                                        max="15"
                                        value={duration === 0 ? '' : duration}
                                        onChange={handleDurationInputChange}
                                        onBlur={handleDurationInputBlur}
                                        className="tabular-nums w-[4ch] bg-transparent p-1 border-0 text-lg font-bold text-electric-500 focus:outline-none focus:ring-1 focus:ring-electric-500 focus:bg-gray-100 dark:focus:bg-space-800 rounded-md text-center"
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
            <div className="bg-gray-100 dark:bg-space-950 border border-gray-200 dark:border-white/10 rounded-xl p-1">
                <div className="flex items-center justify-center gap-0.5 md:gap-2 flex-wrap">
                    {filterButtons.map(({ key, label, icon: Icon }) => (
                         <button 
                            key={key}
                            onClick={() => setFilter(key)}
                            className={`px-1 md:px-4 py-2 md:py-2 rounded-lg text-xs md:text-sm font-semibold flex items-center justify-center gap-1 md:gap-2 transition-all duration-200 flex-1 md:flex-none backdrop-blur-sm ${filter === key ? 'text-electric-500 hover:text-electric-600 bg-electric-500/10 hover:bg-electric-500/20 border border-electric-500/20 hover:border-electric-500/40' : 'bg-white dark:bg-space-900 border border-gray-200 dark:border-white/10 text-gray-600 dark:text-system-grey hover:bg-gray-100 dark:hover:bg-space-700 hover:border-gray-300 dark:hover:border-white/20'}`}
                        >
                            {Icon && <Icon className="h-3 w-3 md:h-4 md:w-4" />}
                            <span className="hidden sm:inline">{label}</span>
                            <span className="sm:hidden">{label.split(' ')[0]}</span>
                        </button>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 items-start">
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
                        <p className="text-gray-600 dark:text-system-grey">Brak akcji spełniających wybrane kryteria.</p>
                    </div>
                )}
            </div>
        </div>
    );
};