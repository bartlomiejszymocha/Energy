import React, { useState } from 'react';
import type { ActionItem } from '../types';
import { ClockIcon, VideoCameraIcon, ChevronDownIcon, ChevronUpIcon, CheckCircleIcon } from './icons/Icons';

interface ActionCardProps {
    action: ActionItem;
    isCompact?: boolean;
    onActionComplete?: (actionId: string) => void;
    isCompleted?: boolean;
    onPlayVideo?: (url: string) => void;
}

export const ActionCard: React.FC<ActionCardProps> = ({ action, isCompact = false, onActionComplete, isCompleted, onPlayVideo }) => {
    const [isExpanded, setIsExpanded] = useState(!isCompact);

    const handleComplete = () => {
        if (onActionComplete && !isCompleted) {
            onActionComplete(action.id);
        }
    };
    
    const handlePlayVideo = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (onPlayVideo && action.videoUrl) {
            onPlayVideo(action.videoUrl);
        }
    }

    const cardBaseClasses = 'rounded-lg shadow-md border-l-4 transition-all duration-300';
    const cardStateClasses = isCompleted
        ? 'bg-success-green/10 border-success-green'
        : 'bg-space-800 border-space-700';

    return (
        <div className={`${cardBaseClasses} ${cardStateClasses}`}>
            <div className="p-4 cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
                <div className="flex justify-between items-start">
                    <div className="pr-4">
                        <h4 className="font-bold text-cloud-white text-lg">{action.title}</h4>
                        <div className="flex items-center gap-2 text-sm text-system-grey mt-1">
                             {action.type === 'Reset Energetyczny' ? '⚡' : '💪'}
                            <span>{action.type}</span>
                            <span className="text-system-grey/50">|</span>
                            <ClockIcon className="h-4 w-4" />
                            <span>{action.duration} min</span>
                        </div>
                    </div>
                    <div className="flex-shrink-0">
                        {isExpanded ? <ChevronUpIcon className="h-6 w-6 text-system-grey" /> : <ChevronDownIcon className="h-6 w-6 text-system-grey" />}
                    </div>
                </div>

                {isExpanded && (
                    <div className="mt-4 text-system-grey text-sm whitespace-pre-wrap animate-fade-in-up">
                        {action.content}
                    </div>
                )}
            </div>
            
            {(isExpanded && (action.videoUrl || onActionComplete)) && (
                <div className="border-t border-space-700 p-4 flex items-center justify-between gap-2">
                    {action.videoUrl && onPlayVideo ? (
                        <button 
                            onClick={handlePlayVideo}
                            className="flex items-center gap-2 text-sm font-semibold text-electric-500 hover:text-electric-500/80 transition"
                        >
                            <VideoCameraIcon className="h-5 w-5" />
                            Obejrzyj wideo
                        </button>
                    ) : <div />} {/* empty div for spacing */}

                    {onActionComplete && (
                        <button
                            onClick={handleComplete}
                            disabled={isCompleted}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                                isCompleted
                                    ? 'bg-success-green/20 text-success-green cursor-default'
                                    : 'bg-electric-500 text-cloud-white hover:bg-electric-600'
                            }`}
                        >
                            {isCompleted ? (
                                <>
                                    <CheckCircleIcon className="h-5 w-5" />
                                    Wykonano
                                </>
                            ) : 'Oznacz jako wykonane'}
                        </button>
                    )}
                </div>
            )}
             <style>{`
                @keyframes fade-in-up {
                    from { opacity: 0; transform: translateY(5px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in-up {
                    animation: fade-in-up 0.3s ease-out forwards;
                }
            `}</style>
        </div>
    );
};