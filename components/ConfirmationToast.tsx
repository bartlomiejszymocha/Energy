import React from 'react';
import { CheckCircleIcon } from './icons/Icons';

interface ConfirmationToastProps {
    message: string | null;
}

export const ConfirmationToast: React.FC<ConfirmationToastProps> = ({ message }) => {
    if (!message) {
        return null;
    }

    return (
        <div 
            key={Date.now()} // Use key to re-trigger animation on new message
            className="fixed top-20 right-4 sm:right-6 bg-success-green/90 backdrop-blur-sm text-cloud-white font-semibold py-2 px-4 sm:py-3 sm:px-6 rounded-full shadow-lg flex items-center gap-2 sm:gap-3 z-[100] animate-fade-in-out-quick text-sm sm:text-base"
        >
            <CheckCircleIcon className="h-5 w-5 sm:h-6 sm:w-6" />
            <span>{message}</span>
        </div>
    );
};