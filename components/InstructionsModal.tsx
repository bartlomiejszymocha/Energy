import React from 'react';
import { XMarkIcon } from './icons/Icons';

interface InstructionsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const InstructionStep: React.FC<{ number: number, title: string, children: React.ReactNode }> = ({ number, title, children }) => (
    <div>
        <h3 className="text-lg font-bold flex items-center gap-3">
            <span className="bg-electric-500 text-cloud-white w-7 h-7 rounded-full flex items-center justify-center font-mono shadow-lg backdrop-blur-sm">{number}</span>
            <span className="text-electric-500/90">{title}</span>
        </h3>
        <p className="text-system-grey mt-2 pl-10 text-sm">
            {children}
        </p>
    </div>
);

export const InstructionsModal: React.FC<InstructionsModalProps> = ({ isOpen, onClose }) => {
    if (!isOpen) {
        return null;
    }

    return (
        <div 
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={onClose}
        >
            <div 
                className="bg-white/5 border border-white/10 rounded-xl shadow-2xl w-full max-w-sm sm:max-w-lg p-4 sm:p-6 relative animate-fade-in-up backdrop-blur-sm"
                onClick={(e) => e.stopPropagation()}
            >
                <button 
                    onClick={onClose} 
                    className="absolute top-4 right-4 text-system-grey hover:text-cloud-white transition p-1 rounded-full hover:bg-white/10 backdrop-blur-sm"
                    aria-label="Zamknij instrukcję"
                >
                    <XMarkIcon className="h-6 w-6" />
                </button>
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-cloud-white">Jak korzystać z Energy Playbook?</h2>
                    <p className="text-system-grey mt-1">Szybki przewodnik po kluczowych funkcjach.</p>
                </div>
                
                {/* Desktop/Tablet Instructions */}
                <div className="mt-8 space-y-6 hidden sm:block">
                    <InstructionStep number={1} title="Oceń energię i zbuduj nawyk">
                        <>
                            Regularnie (3-5 razy dziennie) oceniaj swoją energię w skali 1-5. Użyj dzwonka (🔔), aby ustawić przypomnienia i utrwalić nawyk.
                            Możesz też szybko dodać wpis, używając skrótu <kbd>⌘</kbd>+<kbd>K</kbd> (Mac) lub <kbd>Ctrl</kbd>+<kbd>K</kbd> (Windows).
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
                        className="w-full sm:w-auto bg-electric-500 text-cloud-white font-bold py-2 px-8 rounded-lg shadow-md hover:bg-electric-600 transition-all duration-200 hover:scale-105 active:scale-95 backdrop-blur-sm"
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