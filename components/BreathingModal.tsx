import React from 'react';
import { BreathingTimer } from './BreathingTimer';
import { XMarkIcon } from './icons/Icons';
import type { ActionItem } from '../types';

interface BreathingModalProps {
    isOpen: boolean;
    onClose: () => void;
    action: ActionItem;
    onComplete: () => void;
}

export const BreathingModal: React.FC<BreathingModalProps> = ({ isOpen, onClose, action, onComplete }) => {
    if (!isOpen) {
        return null;
    }

    return (
        <div 
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={onClose}
        >
            <div 
                className="bg-white/5 border border-white/10 rounded-xl shadow-2xl w-full max-w-sm p-6 relative animate-fade-in-up backdrop-blur-sm"
                onClick={(e) => e.stopPropagation()}
            >
                <button 
                    onClick={onClose} 
                    className="absolute top-4 right-4 text-system-grey hover:text-cloud-white transition p-1 rounded-full hover:bg-white/10 backdrop-blur-sm"
                    aria-label="Zamknij"
                >
                    <XMarkIcon className="h-6 w-6" />
                </button>
                <h2 className="text-xl font-bold text-cloud-white text-center mb-4">{action.title}</h2>
                {/* When modal is open, timer is always "expanded" */}
                {action.breathingPattern && (
                    <BreathingTimer 
                        isExpanded={true} 
                        size="large" 
                        pattern={action.breathingPattern} 
                        onStopClick={onClose}
                        onCompleteClick={onComplete}
                    />
                )}
            </div>
             <style>{`
                @keyframes fade-in-up {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in-up {
                    animation: fade-in-up 0.3s ease-out forwards;
                }
            `}</style>
        </div>
    );
};