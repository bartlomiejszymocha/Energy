import React from 'react';
import type { ActionItem } from '../types';
// import { ACTION_LIBRARY } from '../constants/actions'; // Usunięto - używamy tylko Google Sheets
import { useSheetsActionsOptimized } from '../hooks/useSheetsActionsOptimized';
import { CheckCircleIcon, StarIcon } from './icons/LucideIcons';
import { IconRenderer } from './IconRenderer';

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
    const { actions: sheetsActions } = useSheetsActionsOptimized();
    
    const favoriteActions = React.useMemo(() => {
        return sheetsActions.filter(action => favoriteActionIds.has(action.id));
    }, [favoriteActionIds, sheetsActions]);

    if (favoriteActions.length === 0) {
        return (
             <div className="hidden sm:block bg-gray-100 dark:bg-space-950 border-t border-b border-gray-200 dark:border-space-800">
                <div className="max-w-7xl mx-auto py-2 px-4 sm:px-6 lg:px-8 text-center">
                    <p className="text-xs text-gray-600 dark:text-system-grey flex items-center justify-center gap-2">
                        <StarIcon className="h-4 w-4 text-warning-yellow" />
                        <span>Kliknij gwiazdkę przy akcjach, które stosujesz najczęściej - będą tutaj</span>
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="hidden sm:block bg-gray-100 dark:bg-space-950 border-t border-b border-gray-200 dark:border-space-800">
            <div className="max-w-7xl mx-auto py-2 px-4 sm:px-6 lg:px-8">
                <div className="flex items-center gap-3">
                    <div className="flex-shrink-0">
                        <StarIcon className="h-4 w-4 text-warning-yellow" />
                    </div>
                    <div className="flex-grow overflow-x-auto custom-scrollbar-thin">
                        <div className="flex items-center gap-3">
                            {favoriteActions.map(action => {
                                const isCompleted = completedActionIds.has(action.id);
                                const REBOOT_PREFIX = 'Energetyczny Reboot - ';
                                
                                let displayTitle = action.title || 'Brak tytułu';
                                if (action.title && action.title.startsWith(REBOOT_PREFIX)) {
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
                                            className="flex-shrink-0 flex items-center gap-1.5 rounded-full transition-colors duration-200 group bg-success-green/20 text-success-green hover:bg-success-green/30 px-1.5 py-1"
                                            title={action.title}
                                        >
                                            <IconRenderer icon={action.icon} className="text-base" />
                                            <CheckCircleIcon className="h-4 w-4 text-success-green" />
                                        </button>
                                    );
                                } else {
                                    return (
                                        <button
                                            key={action.id}
                                            onClick={() => onActionClick(action)}
                                            className="flex-shrink-0 flex items-center gap-1.5 bg-gray-200 dark:bg-space-800 rounded-full text-gray-700 dark:text-system-grey hover:bg-gray-300 dark:hover:bg-space-700 hover:text-gray-900 dark:hover:text-cloud-white px-2 py-1 transition-colors duration-200"
                                            title={action.title}
                                        >
                                            <IconRenderer icon={action.icon} className="text-base" />
                                            <span className="text-xs font-medium whitespace-nowrap">{displayTitle}</span>
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
                    background: #D1D5DB; /* light mode scrollbar */
                    border-radius: 4px;
                }
                .custom-scrollbar-thin::-webkit-scrollbar-thumb:hover {
                    background: #9CA3AF;
                }
                .dark .custom-scrollbar-thin::-webkit-scrollbar-thumb {
                    background: #24324E; /* dark mode scrollbar */
                }
                .dark .custom-scrollbar-thin::-webkit-scrollbar-thumb:hover {
                    background: #35456A;
                }
                /* For Firefox */
                .custom-scrollbar-thin {
                    scrollbar-width: thin;
                    scrollbar-color: #D1D5DB transparent;
                }
                .dark .custom-scrollbar-thin {
                    scrollbar-color: #24324E transparent;
                }
            `}</style>
        </div>
    );
};