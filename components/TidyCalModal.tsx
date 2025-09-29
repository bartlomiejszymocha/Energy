import React from 'react';
import { XMarkIcon } from './icons/LucideIcons';

interface TidyCalModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const TidyCalModal: React.FC<TidyCalModalProps> = ({ isOpen, onClose }) => {
    if (!isOpen) {
        return null;
    }

    const tidyCalUrl = "https://tidycal.com/bartlomiejszymocha/strategiczna-konsultacja";

    return (
        <div 
            className="fixed inset-0 bg-black bg-opacity-80 z-[100] flex items-center justify-center p-4"
            onClick={onClose}
        >
            <div 
                className="bg-space-950 rounded-xl shadow-2xl relative w-full h-[85vh] max-w-md md:max-w-2xl lg:max-w-4xl animate-fade-in-up"
                onClick={(e) => e.stopPropagation()}
            >
                <button 
                    onClick={onClose} 
                    className="absolute top-2 right-2 text-cloud-white bg-black/50 rounded-full p-1.5 hover:bg-black/70 transition z-20"
                    aria-label="Zamknij"
                >
                    <XMarkIcon className="h-6 w-6" />
                </button>
                <iframe
                    src={tidyCalUrl}
                    className="w-full h-full rounded-xl"
                    frameBorder="0"
                    title="TidyCal Booking"
                    allow="autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                ></iframe>
            </div>
            <style>{`
                @keyframes fade-in-up {
                    from { opacity: 0; transform: translateY(20px) scale(0.95); }
                    to { opacity: 1; transform: translateY(0) scale(1); }
                }
                .animate-fade-in-up {
                    animation: fade-in-up 0.3s ease-out forwards;
                }
            `}</style>
        </div>
    );
};
