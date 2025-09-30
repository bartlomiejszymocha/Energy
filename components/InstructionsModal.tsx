import React from 'react';
import { XMarkIcon } from './icons/LucideIcons';

interface InstructionsModalProps {
    isOpen: boolean;
    onClose: () => void;
    onOpenGuide?: () => void;
}

const InstructionStep: React.FC<{ number: number, title: string, children: React.ReactNode }> = ({ number, title, children }) => (
    <div>
        <h3 className="text-lg font-bold flex items-center gap-3">
            <span className="bg-electric-500 text-white w-7 h-7 rounded-full flex items-center justify-center font-mono shadow-lg ">{number}</span>
            <span className="text-electric-600 dark:text-electric-500/90">{title}</span>
        </h3>
        <p className="text-gray-600 dark:text-system-grey mt-2 pl-10 text-sm">
            {children}
        </p>
    </div>
);

export const InstructionsModal: React.FC<InstructionsModalProps> = ({ isOpen, onClose, onOpenGuide }) => {

    if (!isOpen) {
        return null;
    }

    return (
        <div 
            className="bg-black/80"
            onClick={onClose}
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
        >
            <div 
                className="bg-white dark:bg-space-900 border border-gray-200 dark:border-white/10 rounded-xl shadow-2xl w-full max-w-sm sm:max-w-lg p-4 sm:p-6 relative animate-fade-in-up"
                onClick={(e) => e.stopPropagation()}
            >
                <button 
                    onClick={onClose} 
                    className="absolute top-4 right-4 text-gray-600 dark:text-system-grey hover:text-gray-900 dark:hover:text-cloud-white transition p-1 rounded-full hover:bg-gray-100 dark:hover:bg-space-800"
                    aria-label="Zamknij instrukcję"
                >
                    <XMarkIcon className="h-6 w-6" />
                </button>
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-cloud-white">Jak korzystać z Energy Playbook?</h2>
                    <p className="text-gray-600 dark:text-system-grey mt-1">Szybki przewodnik po kluczowych funkcjach.</p>
                </div>
                
                {/* Desktop/Tablet Instructions */}
                <div className="mt-8 space-y-6 hidden sm:block">
                    <InstructionStep number={1} title="Oceń energię i zbuduj nawyk">
                        <>
                            Regularnie (3-5 razy dziennie) oceniaj swoją energię w skali 1-5. Użyj dzwonka (🔔), aby ustawić przypomnienia i utrwalić nawyk.
                            Możesz też szybko dodać wpis, używając skrótu <kbd>⌘</kbd>+<kbd>K</kbd> (Mac) lub <kbd>Ctrl</kbd>+<kbd>K</kbd> (Windows).
                            {onOpenGuide && (
                                <>
                                    {' '}
                                    <button
                                        onClick={(e) => {
                                            e.preventDefault();
                                            onOpenGuide();
                                            onClose();
                                        }}
                                        className="text-electric-500 hover:text-electric-600 dark:text-electric-400 dark:hover:text-electric-500 underline font-semibold transition-colors"
                                    >
                                        Zobacz szczegółowy przewodnik po 5 poziomach energii
                                    </button>
                                </>
                            )}
                        </>
                    </InstructionStep>
                    
                    <InstructionStep number={2} title="Czujesz spadek energii?">
                        Użyj <strong>Narzędziownika</strong>. Protokoły ruchowe to gotowe treningi wideo, a ćwiczenia oddechowe mają wbudowany timer, który poprowadzi Cię przez cały proces. Pamiętaj, że każdą aktywność możesz wykonać wielokrotnie w ciągu dnia.
                    </InstructionStep>

                    <InstructionStep number={3} title="Obserwuj wzorce">
                         Analizuj <strong>Wykres</strong> i <strong>Podsumowanie</strong>, aby zobaczyć, jak wykonane akcje wpływają na Twój poziom energii i odkrywać wzorce.
                    </InstructionStep>

                    <InstructionStep number={4} title="Używaj ulubionych">
                        Oznaczaj najczęściej używane akcje gwiazdką (⭐), aby mieć do nich szybki dostęp w panelu <strong>Ulubionych</strong>.
                    </InstructionStep>
                </div>

                {/* Mobile Instructions */}
                <div className="mt-8 space-y-5 block sm:hidden">
                    <InstructionStep number={1} title="Oceń energię i zbuduj nawyk">
                       <>
                            Regularnie (3-5 razy dziennie) oceniaj swoją energię w skali 1-5.
                            Szybko dodaj wpis skrótem <kbd>⌘</kbd>+<kbd>K</kbd> / <kbd>Ctrl</kbd>+<kbd>K</kbd>.
                            {onOpenGuide && (
                                <>
                                    {' '}
                                    <button
                                        onClick={(e) => {
                                            e.preventDefault();
                                            onOpenGuide();
                                            onClose();
                                        }}
                                        className="text-electric-500 hover:text-electric-600 dark:text-electric-400 dark:hover:text-electric-500 underline font-semibold transition-colors"
                                    >
                                        Zobacz przewodnik po poziomach energii
                                    </button>
                                </>
                            )}
                       </>
                    </InstructionStep>
                    
                    <InstructionStep number={2} title="Czujesz spadek energii?">
                       Użyj <strong>Narzędziownika</strong>. Protokoły to gotowe wideo, a oddech ma wbudowany timer, który Cię poprowadzi. Każdą aktywność możesz wykonać wielokrotnie.
                    </InstructionStep>

                    <InstructionStep number={3} title="Obserwuj wzorce">
                         Analizuj <strong>Wykres</strong> i <strong>Podsumowanie</strong>, by odkrywać, co na Ciebie wpływa.
                    </InstructionStep>

                    <InstructionStep number={4} title="Używaj ulubionych">
                        Oznaczaj akcje gwiazdką (⭐), by mieć je zawsze pod ręką.
                    </InstructionStep>
                </div>
                
                <div className="mt-8 text-center">
                    <button
                        onClick={onClose}
                        className="w-full sm:w-auto bg-electric-500 text-white font-bold py-2 px-8 rounded-lg shadow-md hover:bg-electric-600 transition-all duration-200 hover:scale-105 active:scale-95 "
                    >
                        Zrozumiałem
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