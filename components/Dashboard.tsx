import React, { useState } from 'react';
import type { EnergyLog, ActionItem, CompletedActionLog } from '../types';
import { EnergyChart } from './EnergyChart';
import { DocumentMagnifyingGlassIcon } from './icons/Icons';
import { ACTION_LIBRARY } from '../constants/actions';
import { ActionCard } from './ActionCard';

interface DashboardProps {
    logs: EnergyLog[];
    completedActions: CompletedActionLog[];
    addLog: (rating: number, note: string) => void;
    onAnalyzeDay: (date: Date) => void;
    addCompletedAction: (actionId: string) => void;
    completedActionIds: Set<string>;
    onPlayVideo: (url: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ logs, completedActions, addLog, onAnalyzeDay, addCompletedAction, completedActionIds, onPlayVideo }) => {
    const [selectedRating, setSelectedRating] = useState<number | null>(null);
    const [note, setNote] = useState('');
    const [recommendations, setRecommendations] = useState<ActionItem[]>([]);

    const handleSaveLog = () => {
        if (selectedRating === null) return;

        addLog(selectedRating, note);

        if (selectedRating <= 3) {
            const energyResets = ACTION_LIBRARY.filter(
                action => action.type === 'Reset Energetyczny'
            );
            const movementProtocols = ACTION_LIBRARY.filter(
                action => action.type === 'Protokół Ruchowy'
            );
            
            const shuffledResets = energyResets.sort(() => 0.5 - Math.random());
            const shuffledProtocols = movementProtocols.sort(() => 0.5 - Math.random());
            
            const finalRecommendations = [
                ...shuffledResets.slice(0, 2),
                ...shuffledProtocols.slice(0, 1),
            ];

            // Shuffle final list to not always have protocol last
            setRecommendations(finalRecommendations.sort(() => 0.5 - Math.random()));

        } else {
            setRecommendations([]);
        }

        // Reset form
        setSelectedRating(null);
        setNote('');
    };

    const RATING_CONFIG: { [key: number]: { color: string; label: string } } = {
        1: { color: 'bg-danger-red', label: 'Bardzo nisko' },
        2: { color: 'bg-alert-orange', label: 'Nisko' },
        3: { color: 'bg-warning-yellow', label: 'Średnio' },
        4: { color: 'bg-success-green/80', label: 'Wysoko' },
        5: { color: 'bg-success-green', label: 'Bardzo wysoko' },
    };


    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Logging Form */}
            <div className="lg:col-span-2 bg-space-900 rounded-xl shadow-lg p-6 order-1">
                <h2 className="text-2xl font-bold text-cloud-white text-center mb-2">Jak Twoja energia teraz?</h2>
                <p className="text-center text-system-grey mb-6">Oceń swój obecny poziom, aby śledzić wzorce.</p>
                
                <div className="flex justify-center items-center gap-3 sm:gap-4 mb-6">
                    {[1, 2, 3, 4, 5].map(level => (
                         <button
                            key={level}
                            onClick={() => setSelectedRating(level)}
                            className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full text-xl font-bold transition-all duration-200 flex items-center justify-center
                                ${selectedRating === level ? `text-space-950 ${RATING_CONFIG[level].color} scale-110 shadow-lg` : 'bg-space-800 text-system-grey hover:bg-space-700'}`}
                        >
                            {level}
                        </button>
                    ))}
                </div>
                
                {selectedRating !== null && (
                    <div className="animate-fade-in-up space-y-6">
                        {RATING_CONFIG[selectedRating] && <p className="text-center font-semibold mb-2" style={{color: `var(--tw-color-opacity, 1) solid ${RATING_CONFIG[selectedRating].color.replace('bg-','')}`}}>{RATING_CONFIG[selectedRating].label}</p>}
                         <div>
                            <label htmlFor="note" className="block text-md font-medium text-cloud-white text-center mb-3">Dodaj notatkę (opcjonalnie)</label>
                            <textarea
                                id="note"
                                value={note}
                                onChange={(e) => setNote(e.target.value)}
                                placeholder="np. Ciężkie spotkanie, zjadłem duży lunch..."
                                className="w-full bg-space-800 text-cloud-white p-3 rounded-lg border border-space-700 focus:ring-2 focus:ring-electric-500 focus:border-electric-500 transition"
                                rows={2}
                            />
                        </div>

                        <div className="pt-2">
                            <button
                                onClick={handleSaveLog}
                                className="w-full bg-electric-500 text-cloud-white font-bold py-3 px-4 rounded-lg shadow-md hover:bg-electric-600 transition-colors"
                            >
                                Zapisz Ocenę
                            </button>
                        </div>
                    </div>
                )}
            </div>
            
            {/* CTA Card */}
            <div className="bg-alert-orange rounded-xl shadow-lg p-6 flex flex-col items-center justify-center text-center order-last lg:order-2 lg:row-start-1 lg:col-start-3">
                 <h3 className="text-xl font-bold text-cloud-white">Chcesz współpracować 1:1?</h3>
                 <p className="text-cloud-white/90 mt-2 text-sm">Zidentyfikuj wzorce i osiągnij mistrzostwo w zarządzaniu energią.</p>
                 <button className="mt-4 bg-cloud-white text-alert-orange font-bold py-2 px-4 rounded-full shadow-md hover:bg-gray-100 transition-colors">
                    Zarezerwuj Konsultację
                 </button>
            </div>

            {/* Recommendations Section */}
            {recommendations.length > 0 && (
                <div className="animate-fade-in-up lg:col-span-3 order-3">
                    <div className="bg-space-900 rounded-xl shadow-lg p-6">
                        <h3 className="text-2xl font-bold text-cloud-white mb-4">⚡ Na ratunek! Szybkie resety dla Ciebie:</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {recommendations.map(action => (
                                <ActionCard 
                                    key={action.id} 
                                    action={action} 
                                    isCompact={true}
                                    onActionComplete={addCompletedAction}
                                    isCompleted={completedActionIds.has(action.id)}
                                    onPlayVideo={onPlayVideo}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            )}
            
            {/* Chart */}
            <div className="bg-space-900 rounded-xl shadow-lg p-4 sm:p-6 lg:col-span-3 order-4">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium text-cloud-white/80">Wykres energii na dziś</h3>
                     <button
                        onClick={() => onAnalyzeDay(new Date())}
                        className="bg-electric-500 hover:bg-electric-600 text-cloud-white font-bold py-2 px-3 rounded-lg shadow-lg transition-transform hover:scale-105 flex items-center gap-2 text-sm"
                        title="Analizuj Mój Dzień"
                    >
                        <DocumentMagnifyingGlassIcon className="h-5 w-5" />
                        <span className="hidden sm:inline">Analizuj Dzień</span>
                    </button>
                </div>
                <div className="h-64 sm:h-72">
                    <EnergyChart logs={logs} completedActions={completedActions} />
                </div>
            </div>
             <style>{`
                @keyframes fade-in-up {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in-up {
                    animation: fade-in-up 0.4s ease-out forwards;
                }
            `}</style>
        </div>
    );
};