import React from 'react';
import type { ActionItem } from '../types';
import { ClockIcon, VideoCameraIcon, ChevronDownIcon, CheckCircleIcon, CircleIcon, StarIcon, ArrowPathCircularIcon, BoltIcon, ArrowsPointingOutIcon, BreathingIcon } from './icons/Icons';
import { BreathingTimer } from './BreathingTimer';

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

const getCardBgClass = (type: ActionItem['type']): string => {
    // All cards now use glassmorphism design for consistency
    return 'bg-white/5 border border-white/10 backdrop-blur-sm';
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
    }
    
    const handleOpenModal = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (onOpenBreathingModal) {
            onOpenBreathingModal(action);
        }
    };

    const handleStopBreathingAndCollapse = () => {
        onToggleExpand(action.id);
    };

    const titleColor = isCompletedToday ? 'text-success-green' : 'text-cloud-white';
    const cardBgClass = getCardBgClass(action.type);
    const borderClass = isCompletedToday
        ? 'border-2 border-success-green'
        : ''; // Default border is now handled by getCardBgClass
        
    const renderTypeIcon = () => {
        switch (action.type) {
            case 'Protokół Ruchowy':
                return <BoltIcon className="h-4 w-4 text-system-grey" />;
            case 'Technika oddechowa':
                return <BreathingIcon className="h-4 w-4 text-system-grey" />;
            case 'Reset Energetyczny':
            default:
                return <ArrowPathCircularIcon className="h-4 w-4 text-system-grey" />;
        }
    };

    return (
        <div className={`${cardBgClass} ${borderClass} rounded-xl shadow-lg flex flex-col transition-all duration-300 hover:bg-white/10 hover:border-white/20`}>
            {/* Clickable Header */}
            <div className="p-4 cursor-pointer" onClick={() => onToggleExpand(action.id)}>
                <div className="flex justify-between items-start gap-3 min-h-14">
                    <div className="flex items-center gap-3 flex-grow min-w-0">
                        {action.icon && <span className="text-2xl">{action.icon}</span>}
                        <h4 className={`font-bold text-lg transition-colors duration-300 ${titleColor}`}>{action.title}</h4>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                         {action.workout && onPlayAction && (
                            <button 
                                onClick={handlePlayAction} 
                                className="p-1.5 rounded-full text-system-grey bg-white/5 hover:bg-electric-500 hover:text-cloud-white transition-all duration-200" 
                                aria-label="Rozpocznij trening"
                                title="Rozpocznij trening"
                            >
                                <BoltIcon className="h-5 w-5" />
                            </button>
                        )}
                         {onToggleFavorite && (
                            <button onClick={handleToggleFavorite} className="p-1.5 rounded-full text-system-grey bg-white/5 hover:bg-warning-yellow/10 hover:text-warning-yellow transition-all duration-200" aria-label="Oznacz jako ulubione">
                                <StarIcon className={`h-5 w-5 ${isFavorite ? 'fill-current text-warning-yellow' : ''}`} />
                            </button>
                         )}
                         {completionCount > 0 && (
                            <div 
                              className="bg-alert-orange text-space-950 text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center shadow-lg"
                              aria-label={`Wykonano ${completionCount} razy`}
                            >
                                x{completionCount}
                            </div>
                        )}
                         {onComplete && (
                            <button onClick={handleComplete} className="p-1 rounded-full text-system-grey bg-white/5 hover:bg-success-green/10 hover:text-success-green transition-all duration-200" aria-label="Oznacz jako wykonane">
                                {isCompletedToday ? <CheckCircleIcon className="h-6 w-6 text-success-green" /> : <CircleIcon className="h-6 w-6" />}
                            </button>
                        )}
                        <div className="transition-transform duration-300" style={{ transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)' }}>
                            <ChevronDownIcon className="h-6 w-6 text-system-grey" />
                        </div>
                    </div>
                </div>
                 <div className="flex items-center gap-2 text-sm mt-1 text-system-grey">
                    {renderTypeIcon()}
                    <span>{action.type}</span>
                    <span className="text-system-grey/50">|</span>
                    <ClockIcon className="h-4 w-4" />
                    <span>{action.duration} min</span>
                </div>
            </div>

            {/* Expanded Content - Performance Optimized */}
            <div className={`grid transition-[grid-template-rows] duration-300 ease-in-out ${isExpanded ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
                <div className="overflow-hidden">
                    <div className="px-4 pb-4">
                        <div className={`pt-2 border-t border-white/10`}>

                            {action.breathingPattern && isExpanded && (
                                <div className="relative">
                                    <BreathingTimer
                                      isExpanded={isExpanded}
                                      pattern={action.breathingPattern}
                                      onStopClick={handleStopBreathingAndCollapse}
                                    />
                                    <button
                                      onClick={handleOpenModal}
                                      className="absolute top-2 right-2 flex items-center gap-1.5 rounded-md bg-white/10 border border-white/20 px-2 py-1 text-xs text-cloud-white/80 hover:bg-white/20 hover:text-cloud-white hover:border-white/40 transition-all z-10 backdrop-blur-sm"
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
                </div>
            </div>
        </div>
    );
};