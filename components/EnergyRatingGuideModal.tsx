import React from 'react';
import { XMarkIcon } from './icons/LucideIcons';

interface EnergyRatingGuideModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const RatingLevel: React.FC<{ 
    level: number; 
    title: string; 
    color: string;
    feeling: string;
    capable: string;
    action: string;
    actionDesc: string;
}> = ({ level, title, color, feeling, capable, action, actionDesc }) => (
    <div className="border-l-4 pl-4 py-3" style={{ borderColor: color }}>
        <div className="flex items-center gap-3 mb-2">
            <div 
                className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm"
                style={{ backgroundColor: color }}
            >
                {level}
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-cloud-white">{title}</h3>
        </div>
        
        <div className="space-y-2 text-sm">
            <div>
                <p className="font-semibold text-gray-800 dark:text-cloud-white/90">Jak się czujesz?</p>
                <p className="text-gray-600 dark:text-system-grey">{feeling}</p>
            </div>
            
            <div>
                <p className="font-semibold text-gray-800 dark:text-cloud-white/90">Na co masz energię?</p>
                <p className="text-gray-600 dark:text-system-grey">{capable}</p>
            </div>
            
            <div>
                <p className="font-semibold text-gray-800 dark:text-cloud-white/90" style={{ color }}>
                    Kluczowe działanie: {action}
                </p>
                <p className="text-gray-600 dark:text-system-grey">{actionDesc}</p>
            </div>
        </div>
    </div>
);

export const EnergyRatingGuideModal: React.FC<EnergyRatingGuideModalProps> = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    return (
        <div 
            className="bg-black bg-opacity-70"
            onClick={onClose}
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                width: '100vw',
                height: '100vh',
                zIndex: 9999999,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '1rem'
            }}
        >
            <div 
                className="bg-white dark:bg-space-900 border border-gray-200 dark:border-white/10 rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto custom-scrollbar p-6 relative animate-fade-in-up"
                onClick={(e) => e.stopPropagation()}
            >
                <button 
                    onClick={onClose} 
                    className="absolute top-4 right-4 text-gray-600 dark:text-system-grey hover:text-gray-900 dark:hover:text-cloud-white transition"
                >
                    <XMarkIcon className="h-6 w-6" />
                </button>

                <div className="text-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-cloud-white">
                        Jak oceniać swoją energię?
                    </h2>
                    <p className="text-gray-600 dark:text-system-grey mt-2">
                        Przewodnik po 5 poziomach energii i co w każdym z nich robić
                    </p>
                </div>

                <div className="space-y-6">
                    <RatingLevel
                        level={1}
                        title="Przetrwanie (Survival Mode)"
                        color="#EF4444"
                        feeling="Jesteś mentalnie i fizycznie wyczerpany. Proste decyzje wydają się paraliżujące. Dominuje uczucie przytłoczenia, chaosu i irytacji. Myśli są rozproszone, trudno jest Ci się skupić na czymkolwiek dłużej niż kilka minut."
                        capable="Wyłącznie do regeneracji. Jakakolwiek próba wykonania produktywnej pracy będzie nieefektywna i pogłębi ten stan. Nie jesteś w stanie myśleć strategicznie, kreatywnie ani nawet logicznie."
                        action="RESET"
                        actionDesc="Natychmiast przerwij wszystko. Minimum: 15-minutowa przerwa z dala od ekranów, najlepiej na zewnątrz. Optimum: Krótka drzemka (20-25 minut), medytacja lub spacer."
                    />

                    <RatingLevel
                        level={2}
                        title="Autopilot (Low Energy)"
                        color="#F97316"
                        feeling="Działasz na autopilocie. Brakuje Ci 'iskry' i proaktywności. Jesteś w stanie odpowiadać na bodźce zewnętrzne (maile, telefony, prośby), ale nie masz siły, by samemu inicjować działania. Odczuwasz mentalne zmęczenie i tendencję do odkładania ważnych rzeczy."
                        capable="Do zadań płytkich i administracyjnych: nadrabianie zaległości mailowych (odpowiadanie, nie pisanie ważnych wiadomości), porządkowanie plików, płacenie faktur, prosta praca z dokumentami."
                        action="OCZYSZCZANIE"
                        actionDesc="Wykorzystaj ten stan do 'sprzątania' swojego środowiska pracy. Odhaczanie małych, prostych zadań może dać lekki zastrzyk dopaminy i poczucie kontroli."
                    />

                    <RatingLevel
                        level={3}
                        title="Stabilnie (Steady State)"
                        color="#F59E0B"
                        feeling="Jesteś w stabilnym, neutralnym stanie. Nie czujesz ani zmęczenia, ani euforii. Jesteś w stanie realizować zaplanowane wcześniej zadania i trzymać się rutyny. To solidny, przewidywalny stan."
                        capable="Do zadań systemowych i rutynowych: realizacja standardowych procesów, spotkania operacyjne i rozmowy z zespołem, sprawdzanie postępów w projektach, wykonywanie pracy według wcześniej ustalonego planu."
                        action="EGZEKUCJA"
                        actionDesc="Skup się na konsekwentnym realizowaniu planu dnia. To jest czas na solidną, przewidywalną pracę - trzymaj się ustalonego kursu i systematycznie realizuj zaplanowane zadania."
                    />

                    <RatingLevel
                        level={4}
                        title="Fokus (Deep Work)"
                        color="#10B981"
                        feeling="Czujesz mentalną klarowność i skupienie. Masz motywację do zmierzenia się z trudnymi problemami. Jesteś proaktywny, widzisz rozwiązania, a nie tylko problemy. Czujesz, że masz kontrolę i sprawczość."
                        capable="Do zadań strategicznych i wymagających głębokiego skupienia (deep work): pisanie ofert, tworzenie strategii, programowanie, projektowanie, rozwiązywanie złożonych problemów, nagrywanie contentu."
                        action="OCHRONA"
                        actionDesc="Chroń ten stan za wszelką cenę. Wyłącz powiadomienia, zamknij niepotrzebne karty, poinformuj zespół, że jesteś niedostępny. Wykorzystaj ten stan w pełni - to idealny moment na najbardziej wymagające zadania."
                    />

                    <RatingLevel
                        level={5}
                        title="Flow (Peak Performance)"
                        color="#06B6D4"
                        feeling="Jesteś w stanie 'flow'. Czas zdaje się nie istnieć. Praca przychodzi Ci bez wysiłku, a Ty czujesz pełne zaangażowanie i satysfakcję. Twój mózg tworzy nowe, nieoczywiste połączenia. To stan najwyższej wydajności i innowacyjności."
                        capable="Do zadań generatywnych i wizjonerskich: tworzenie nowych produktów lub usług, burza mózgów nad strategią, pisanie najważniejszych tekstów (manifest marki, kluczowy artykuł), tworzenie przełomowych rozwiązań."
                        action="FINALIZACJA"
                        actionDesc="Pozwól sobie płynąć z tym stanem jak najdłużej. Nie przerywaj go. Miej pod ręką notatnik, by łapać wszystkie pomysły. Po zakończeniu świadomie zaplanuj odpoczynek - ten stan jest bardzo intensywny dla układu nerwowego."
                    />
                </div>

                <div className="mt-8 p-4 bg-electric-500/10 border border-electric-500/20 rounded-lg">
                    <p className="text-sm text-gray-700 dark:text-cloud-white font-semibold mb-2">
                        💡 Kluczowa zasada:
                    </p>
                    <p className="text-sm text-gray-600 dark:text-system-grey">
                        Nie walcz ze swoim aktualnym poziomem energii - dopasuj do niego zadania. 
                        Praca zgodna z poziomem energii jest produktywna. Praca wbrew niemu to strata czasu i energii.
                    </p>
                </div>

                <div className="mt-6 text-center">
                    <button
                        onClick={onClose}
                        className="bg-electric-500 text-white font-bold py-2 px-8 rounded-lg shadow-md hover:bg-electric-600 transition-all"
                    >
                        Rozumiem
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
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #D1D5DB;
                    border-radius: 3px;
                }
                .dark .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #373A43;
                }
            `}</style>
        </div>
    );
};
