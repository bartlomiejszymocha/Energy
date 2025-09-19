

import React, { useState } from 'react';
import { DEFAULT_TAGS } from '../constants/tags';
import type { Tag } from '../types';
import { XMarkIcon } from './icons/Icons';

interface LogEnergyModalProps {
    onClose: () => void;
    onSave: (rating: number, tags: Tag[]) => void;
}

export const LogEnergyModal: React.FC<LogEnergyModalProps> = ({ onClose, onSave }) => {
    const [rating, setRating] = useState<number>(0);
    const [selectedTags, setSelectedTags] = useState<Set<Tag>>(new Set());

    const handleTagClick = (tag: Tag) => {
        setSelectedTags(prev => {
            const newSet = new Set(prev);
            if (newSet.has(tag)) {
                newSet.delete(tag);
            } else {
                newSet.add(tag);
            }
            return newSet;
        });
    };
    
    const RATING_CONFIG: { [key: number]: { color: string; label: string } } = {
        1: { color: 'bg-danger-red', label: 'Bardzo nisko' },
        2: { color: 'bg-alert-orange', label: 'Nisko' },
        3: { color: 'bg-warning-yellow', label: 'Średnio' },
        4: { color: 'bg-success-green/80', label: 'Wysoko' },
        5: { color: 'bg-success-green', label: 'Bardzo wysoko' },
    };


    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
            <div className="bg-space-900 rounded-xl shadow-2xl w-full max-w-md p-6 relative animate-fade-in-up">
                <button onClick={onClose} className="absolute top-4 right-4 text-system-grey hover:text-cloud-white transition">
                    <XMarkIcon className="h-6 w-6" />
                </button>

                <h2 className="text-2xl font-bold text-cloud-white text-center mb-2">Jak Twoja energia?</h2>
                <p className="text-center text-system-grey mb-6">Oceń swój obecny poziom energii w skali 1-5.</p>
                
                <div className="flex justify-center items-center gap-3 sm:gap-4 mb-6">
                    {[1, 2, 3, 4, 5].map(level => (
                         <button
                            key={level}
                            onClick={() => setRating(level)}
                            className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full text-xl font-bold transition-all duration-200 flex items-center justify-center
                                ${rating === level ? `text-space-950 ${RATING_CONFIG[level].color} scale-110 shadow-lg` : 'bg-space-800 text-system-grey hover:bg-space-700'}`}
                        >
                            {level}
                        </button>
                    ))}
                </div>
                {rating > 0 && <p className="text-center font-semibold mb-6" style={{color: `var(--tw-color-opacity, 1) solid ${RATING_CONFIG[rating].color.replace('bg-','')}`}}>{RATING_CONFIG[rating].label}</p>}

                {rating > 0 && (
                    <div className="border-t border-space-700 pt-6">
                        <h3 className="text-lg font-semibold text-cloud-white text-center mb-4">Pora dnia</h3>
                        <div className="flex flex-wrap justify-center gap-2">
                            {DEFAULT_TAGS.map(tag => (
                                <button
                                    key={tag}
                                    onClick={() => handleTagClick(tag)}
                                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${selectedTags.has(tag) ? 'bg-electric-500 text-cloud-white' : 'bg-space-800 text-system-grey hover:bg-space-700'}`}
                                >
                                    {tag}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                <div className="mt-8">
                    <button
                        onClick={() => onSave(rating, Array.from(selectedTags))}
                        disabled={rating === 0}
                        className="w-full bg-electric-500 text-cloud-white font-bold py-3 px-4 rounded-lg shadow-md hover:bg-electric-600 transition-colors disabled:bg-space-700 disabled:text-system-grey/50 disabled:cursor-not-allowed"
                    >
                        Zapisz
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