import React from 'react';
import { XMarkIcon, ExclamationTriangleIcon } from './icons/Icons';

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
            className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4"
            onClick={onClose}
        >
            <div 
                className="bg-space-900 rounded-xl shadow-2xl w-full max-w-md p-6 relative animate-fade-in-up"
                onClick={(e) => e.stopPropagation()}
            >
                <button 
                    onClick={onClose} 
                    className="absolute top-4 right-4 text-system-grey hover:text-cloud-white transition"
                    aria-label="Zamknij"
                >
                    <XMarkIcon className="h-6 w-6" />
                </button>
                
                <div className="text-center">
                    <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-danger-red/10 mb-4">
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
                        className="w-full sm:w-auto flex-1 bg-danger-red text-cloud-white font-bold py-2.5 px-4 rounded-lg shadow-md hover:bg-danger-red/80 transition-colors"
                    >
                        Potwierdź i usuń
                    </button>
                    <button
                        onClick={onClose}
                        className="w-full sm:w-auto flex-1 bg-space-800 text-cloud-white font-bold py-2.5 px-4 rounded-lg shadow-md hover:bg-space-700 transition-colors"
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