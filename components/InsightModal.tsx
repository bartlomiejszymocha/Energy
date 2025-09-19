

import React from 'react';
import type { Insight, ActionItem } from '../types';
import { XMarkIcon, SparklesIcon, ArrowPathIcon } from './icons/Icons';
import { ActionCard } from './ActionCard';

interface InsightModalProps {
  isLoading: boolean;
  insight: Insight | null;
  recommendedAction: ActionItem | null;
  error: string | null;
  onClose: () => void;
  onPlayVideo?: (url: string) => void;
}

export const InsightModal: React.FC<InsightModalProps> = ({
  isLoading,
  insight,
  recommendedAction,
  error,
  onClose,
  onPlayVideo,
}) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
      <div className="bg-space-900 rounded-xl shadow-2xl w-full max-w-lg p-6 sm:p-8 relative animate-fade-in-up">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-system-grey hover:text-cloud-white transition"
        >
          <XMarkIcon className="h-6 w-6" />
        </button>

        <div className="flex flex-col items-center text-center">
            <div className="p-3 bg-electric-500/20 rounded-full mb-4">
                <SparklesIcon className="h-8 w-8 text-electric-500" />
            </div>
            <h2 className="text-2xl font-bold text-cloud-white mb-2">Analiza Dnia</h2>
            
            {isLoading && (
                <div className="flex flex-col items-center justify-center min-h-[200px]">
                    <ArrowPathIcon className="h-12 w-12 text-electric-500 animate-spin" />
                    <p className="text-system-grey mt-4">Analizuję Twoje wzorce...</p>
                </div>
            )}
            
            {error && (
                <div className="min-h-[200px] flex flex-col items-center justify-center">
                    <p className="text-danger-red">{error}</p>
                    <button
                        onClick={onClose}
                        className="mt-4 bg-electric-500 text-cloud-white font-bold py-2 px-4 rounded-lg shadow-md hover:bg-electric-600 transition-colors"
                    >
                        Zamknij
                    </button>
                </div>
            )}

            {!isLoading && insight && (
                <div className="w-full">
                    <p className="text-cloud-white whitespace-pre-wrap my-6 text-left">{insight.summary}</p>
                    
                    {recommendedAction && (
                        <div className="text-left w-full mt-6 border-t border-space-700 pt-6">
                            <h3 className="text-lg font-semibold text-cloud-white mb-4">Rekomendacja dla Ciebie:</h3>
                            <ActionCard 
                                action={recommendedAction} 
                                isCompact={true} 
                                onPlayVideo={onPlayVideo} 
                            />
                        </div>
                    )}
                </div>
            )}
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