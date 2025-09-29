import React from 'react';
import { BreathingTimer } from './BreathingTimer';
import { XMarkIcon } from './icons/LucideIcons';
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
            className="bg-black/80"
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                width: '100vw',
                height: '100vh',
                zIndex: 999999,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '1rem'
            }}
            onClick={onClose}
        >
            <div 
                className="bg-white dark:bg-space-900 border border-gray-200 dark:border-white/10 rounded-xl shadow-2xl w-full max-w-sm p-6 relative animate-fade-in-up"
                onClick={(e) => e.stopPropagation()}
            >
                <button 
                    onClick={onClose} 
                    className="absolute top-4 right-4 text-gray-600 dark:text-system-grey hover:text-gray-900 dark:hover:text-cloud-white transition p-1 rounded-full hover:bg-gray-100 dark:hover:bg-space-800"
                    aria-label="Zamknij"
                >
                    <XMarkIcon className="h-6 w-6" />
                </button>
                <h2 className="text-xl font-bold text-gray-900 dark:text-cloud-white text-center mb-4">{action.title}</h2>
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