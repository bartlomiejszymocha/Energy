import React from 'react';
import { XMarkIcon, ExclamationTriangleIcon } from './icons/LucideIcons';

interface ResetDataModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
}

export const ResetDataModal: React.FC<ResetDataModalProps> = ({ isOpen, onClose, onConfirm }) => {

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
                className="bg-space-900 border border-white/10 rounded-xl shadow-2xl w-full max-w-md p-6 relative animate-fade-in-up"
                onClick={(e) => e.stopPropagation()}
            >
                <button 
                    onClick={onClose} 
                    className="absolute top-4 right-4 text-system-grey hover:text-cloud-white transition p-1 rounded-full hover:bg-space-800"
                    aria-label="Zamknij"
                >
                    <XMarkIcon className="h-6 w-6" />
                </button>
                
                <div className="text-center">
                    <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-danger-red/10 border border-danger-red/20 mb-4">
                        <ExclamationTriangleIcon className="h-7 w-7 text-danger-red" aria-hidden="true" />
                    </div>
                    <h2 className="text-2xl font-bold text-cloud-white">Czy na pewno?</h2>
                    <p className="text-system-grey mt-2">
                        Spowoduje to trwałe usunięcie wszystkich Twoich danych, w tym wpisów energii, ukończonych akcji i ulubionych. Tej operacji nie można cofnąć.
                    </p>
                </div>
                
                <div className="mt-8 flex flex-col sm:flex-row-reverse gap-3">
                    <button
                        onClick={onConfirm}
                        className="w-full sm:w-auto flex-1 bg-danger-red text-cloud-white font-bold py-2.5 px-4 rounded-lg shadow-md hover:bg-danger-red/80 transition-all duration-200 hover:scale-105 active:scale-95 "
                    >
                        Potwierdź i usuń
                    </button>
                    <button
                        onClick={onClose}
                        className="w-full sm:w-auto flex-1 bg-white/10 border border-white/20 text-cloud-white font-bold py-2.5 px-4 rounded-lg shadow-md hover:bg-white/20 hover:border-white/40 transition-all duration-200 hover:scale-105 active:scale-95 "
                    >
                        Anuluj
                    </button>
                </div>
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