import React from 'react';
import type { ActionItem } from '../types';
import { ClockIcon, VideoCameraIcon, ChevronDownIcon, CheckCircleIcon, CircleIcon, StarIcon, ArrowPathCircularIcon, BoltIcon, ArrowsPointingOutIcon, BreathingIcon } from './icons/LucideIcons';
import { BreathingTimer } from './BreathingTimer';
import { IconRenderer } from './IconRenderer';

interface ActionCardProps {
    action: ActionItem;
    onComplete?: (actionId: string) => void;
    completionCount?: number;
    onPlayAction?: (action: ActionItem) => void;
    isFavorite?: boolean;
    onToggleFavorite?: (actionId: string) => void;
    onOpenBreathingModal?: (action: ActionItem) => void;
    isExpanded: boolean;
    onToggleExpand: (actionId: string) => void;
    isCompletedToday: boolean;
}

const getCardBgClass = (type: ActionItem['type'], isCompletedToday: boolean = false): string => {
    // All cards now use glassmorphism design for consistency
    const baseClass = 'bg-white dark:bg-space-850'; // Custom card color for dark mode
    const borderClass = isCompletedToday 
        ? 'border-2 border-success-green dark:border-success-green' 
        : 'border border-gray-200 dark:border-white/10';
    return `${baseClass} ${borderClass}`;
};


export const ActionCard: React.FC<ActionCardProps> = ({ 
    action, 
    onComplete, 
    completionCount = 0, 
    onPlayAction,
    isFavorite,
    onToggleFavorite,
    onOpenBreathingModal,
    isExpanded,
    onToggleExpand,
    isCompletedToday
}) => {

    const handleComplete = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (onComplete) {
            onComplete(action.id);
        }
    };
    
    const handleToggleFavorite = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (onToggleFavorite) {
            onToggleFavorite(action.id);
        }
    };
    
    const handlePlayAction = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (onPlayAction) {
            onPlayAction(action);
        }
    };
    
    const handleOpenModal = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (onOpenBreathingModal) {
            onOpenBreathingModal(action);
        }
    };

    const handleStopBreathingAndCollapse = () => {
        onToggleExpand(action.id);
    };

    const titleColor = isCompletedToday ? 'text-success-green' : 'text-gray-900 dark:text-cloud-white';
    const cardBgClass = getCardBgClass(action.type, isCompletedToday);
    // Border is now handled by getCardBgClass
        
    const renderTypeIcon = () => {
        switch (action.type) {
            case 'Protokół Ruchowy':
            case 'Protokuł Ruchowy':
                return <BoltIcon className="h-3.5 w-3.5 text-system-grey" />;
            case 'Technika oddechowa':
            case 'Technika Oddechowa':
                return <BreathingIcon className="h-3.5 w-3.5 text-system-grey" />;
            case 'Reset Energetyczny':
            default:
                return <ArrowPathCircularIcon className="h-3.5 w-3.5 text-system-grey" />;
        }
    };

    return (
        <div className={`${cardBgClass} rounded-xl shadow-lg flex flex-col transition-all duration-300 hover:bg-gray-50 dark:hover:bg-white/10 hover:border-gray-300 dark:hover:border-white/20`}>
            {/* Clickable Header */}
            <div className="p-4 sm:p-4 cursor-pointer" onClick={() => onToggleExpand(action.id)}>
                <div className="flex justify-between items-start gap-2 sm:gap-3 min-h-12 sm:min-h-16">
                    <div className="flex items-start gap-2 sm:gap-3 flex-grow min-w-0 pr-3 sm:pr-4">
                        <IconRenderer icon={action.icon} className="text-base sm:text-lg flex-shrink-0" />
                        <div className="flex flex-col">
                            <h4 className={`font-bold text-base sm:text-base transition-colors duration-300 ${titleColor} leading-tight break-words`}>{action.title}</h4>
                        </div>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                        {action.workout && onPlayAction && (
                            <button
                                onClick={handlePlayAction}
                                className="p-1 rounded-full text-gray-600 dark:text-system-grey bg-gray-100 dark:bg-white/5 hover:bg-electric-500 hover:text-white transition-all duration-200"
                                aria-label="Rozpocznij trening"
                                title="Rozpocznij trening"
                            >
                                <BoltIcon className="h-5 w-5" />
                            </button>
                        )}
                        {onToggleFavorite && (
                            <button onClick={handleToggleFavorite} className="p-1 rounded-full text-gray-600 dark:text-system-grey bg-gray-100 dark:bg-white/5 hover:bg-warning-yellow/10 hover:text-warning-yellow transition-all duration-200" aria-label="Oznacz jako ulubione">
                                <StarIcon className={`h-5 w-5 ${isFavorite ? 'fill-current text-warning-yellow' : ''}`} />
                            </button>
                        )}
                        {onComplete && (
                            <button onClick={handleComplete} className="p-1 rounded-full text-gray-600 dark:text-system-grey bg-gray-100 dark:bg-white/5 hover:bg-success-green/10 hover:text-success-green transition-all duration-200" aria-label="Oznacz jako wykonane">
                                {isCompletedToday ? <CheckCircleIcon className="h-6 w-6 text-success-green" /> : <CircleIcon className="h-6 w-6" />}
                            </button>
                        )}
                        <div className="transition-transform duration-300" style={{ transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)' }}>
                            <ChevronDownIcon className="h-5 w-5 text-gray-600 dark:text-system-grey" />
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-2 text-[10px] mt-0 sm:mt-1 text-system-grey">
                    {completionCount > 0 && (
                        <>
                            <span className="font-mono">
                                x{completionCount}
                            </span>
                            <span className="text-system-grey/50">|</span>
                        </>
                    )}
                    {renderTypeIcon()}
                    <span>{action.type}</span>
                    <span className="text-gray-400 dark:text-system-grey/50">|</span>
                    <ClockIcon className="h-3.5 w-3.5" />
                    <span>{action.duration} min</span>
                </div>
            </div>

            {/* Expanded Content - Simple Conditional */}
            {isExpanded && (
                <div className="px-4 pb-4">
                    <div className={`pt-2 border-t border-gray-200 dark:border-white/10`}>

                        {action.breathingPattern && (
                            <div className="relative">
                                <BreathingTimer
                                  isExpanded={isExpanded}
                                  pattern={action.breathingPattern}
                                  onStopClick={handleStopBreathingAndCollapse}
                                />
                                <button
                                  onClick={handleOpenModal}
                                  className="absolute top-2 right-2 flex items-center gap-1.5 rounded-md bg-gray-100 dark:bg-white/10 border border-gray-200 dark:border-white/20 px-2 py-1 text-xs text-gray-700 dark:text-cloud-white/80 hover:bg-gray-200 dark:hover:bg-white/20 hover:text-gray-900 dark:hover:text-cloud-white hover:border-gray-300 dark:hover:border-white/40 transition-all z-10 "
                                  aria-label="Powiększ timer oddechowy"
                                >
                                  <ArrowsPointingOutIcon className="h-4 w-4" />
                                  <span>Powiększ</span>
                                </button>
                            </div>
                        )}
                        
                        <div 
                            className={`action-content text-sm whitespace-pre-wrap text-system-grey ${action.breathingPattern ? 'mt-4' : 'mt-2'}`}
                            dangerouslySetInnerHTML={{ __html: action.content }}
                            style={{
                                // Style dla linków w opisach
                                '--link-color': '#007AFF',
                                '--link-hover': '#0056CC'
                            } as React.CSSProperties}
                        />
                        
                        {action.workout && action.workout.length > 0 && onPlayAction && (
                            <div className="mt-4">
                                <button
                                    onClick={handlePlayAction}
                                    className="w-full flex justify-center items-center gap-2 text-sm font-bold bg-electric-500 text-cloud-white py-2 px-4 rounded-full shadow-md transition-transform duration-200 hover:scale-105 hover:bg-electric-600 active:scale-95"
                                >
                                    <BoltIcon className="h-5 w-5" />
                                    Rozpocznij trening
                                </button>
                            </div>
                        )}

                        {action.videoUrl && onPlayAction && (
                            <div className="mt-4">
                                <button 
                                    onClick={handlePlayAction}
                                    className="w-full flex justify-center items-center gap-2 text-sm font-bold bg-electric-500 text-cloud-white py-2 px-4 rounded-full shadow-md transition-transform duration-200 hover:scale-105 hover:bg-electric-600 active:scale-95"
                                >
                                    <VideoCameraIcon className="h-5 w-5" />
                                    Zaczynamy! (protokół wideo)
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};