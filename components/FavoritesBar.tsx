import React from 'react';
import type { ActionItem } from '../types';
import { ACTION_LIBRARY } from '../constants/actions';
import { CheckCircleIcon, StarIcon } from './icons/Icons';

interface FavoritesBarProps {
    favoriteActionIds: Set<string>;
    completedActionIds: Set<string>;
    onActionClick: (action: ActionItem) => void;
}

export const FavoritesBar: React.FC<FavoritesBarProps> = ({ 
    favoriteActionIds,
    completedActionIds,
    onActionClick,
}) => {
    const favoriteActions = React.useMemo(() => {
        return ACTION_LIBRARY.filter(action => favoriteActionIds.has(action.id));
    }, [favoriteActionIds]);

    if (favoriteActions.length === 0) {
        return (
             <div className="bg-space-900 border-t border-b border-space-800 animate-fade-in-up">
                <div className="max-w-7xl mx-auto py-3 px-4 sm:px-6 lg:px-8 text-center">
                    <p className="text-sm text-system-grey flex items-center justify-center gap-2">
                        <StarIcon className="h-5 w-5 text-warning-yellow" />
                        <span>Oznacz ulubione akcje, aby mieć je zawsze pod ręką.</span>
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-space-900 border-t border-b border-space-800 animate-fade-in-up">
            <div className="max-w-7xl mx-auto py-3 px-4 sm:px-6 lg:px-8">
                <div className="flex items-center gap-4">
                    <div className="flex-shrink-0">
                        <StarIcon className="h-5 w-5 text-warning-yellow" />
                    </div>
                    <div className="flex-grow overflow-x-auto custom-scrollbar-thin">
                        <div className="flex items-center gap-3">
                            {favoriteActions.map(action => {
                                const isCompleted = completedActionIds.has(action.id);
                                const REBOOT_PREFIX = 'Energetyczny Reboot - ';
                                
                                let displayTitle = action.title;
                                if (action.title.startsWith(REBOOT_PREFIX)) {
                                    displayTitle = action.title.substring(REBOOT_PREFIX.length);
                                } else if (action.id === 'recharge_nsdr') {
                                    displayTitle = 'NSDR';
                                } else if (action.id === 'reset_breathing_478') {
                                    displayTitle = '4-7-8';
                                } else if (action.id === 'reset_breathing_4784') {
                                    displayTitle = '4-7-8-4';
                                }


                                if (isCompleted) {
                                    return (
                                        <button
                                            key={action.id}
                                            onClick={() => onActionClick(action)}
                                            className="flex-shrink-0 flex items-center gap-2 rounded-full transition-colors duration-200 group bg-success-green/20 text-success-green hover:bg-success-green/30 px-2 py-1.5"
                                            title={action.title}
                                        >
                                            <span className="text-lg">{action.icon}</span>
                                            <CheckCircleIcon className="h-5 w-5 text-success-green" />
                                        </button>
                                    );
                                } else {
                                    return (
                                        <button
                                            key={action.id}
                                            onClick={() => onActionClick(action)}
                                            className="flex-shrink-0 flex items-center gap-2 bg-space-800 rounded-full text-system-grey hover:bg-space-700 hover:text-cloud-white px-3 py-1.5 transition-colors duration-200"
                                            title={action.title}
                                        >
                                            <span className="text-lg">{action.icon}</span>
                                            <span className="text-sm font-medium whitespace-nowrap">{displayTitle}</span>
                                        </button>
                                    );
                                }
                            })}
                        </div>
                    </div>
                </div>
            </div>
            <style>{`
                .custom-scrollbar-thin::-webkit-scrollbar {
                    height: 4px;
                }
                .custom-scrollbar-thin::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar-thin::-webkit-scrollbar-thumb {
                    background: #24324E;
                    border-radius: 4px;
                }
                .custom-scrollbar-thin::-webkit-scrollbar-thumb:hover {
                    background: #35456A;
                }
                /* For Firefox */
                .custom-scrollbar-thin {
                    scrollbar-width: thin;
                    scrollbar-color: #24324E transparent;
                }
            `}</style>
        </div>
    );
};