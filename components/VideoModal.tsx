import React from 'react';
import { XMarkIcon, CheckCircleIcon } from './icons/LucideIcons';
import type { ActionItem } from '../types';

interface VideoModalProps {
  action: ActionItem;
  onClose: () => void;
  onMarkComplete: () => void;
}

export const VideoModal: React.FC<VideoModalProps> = ({ action, onClose, onMarkComplete }) => {

  return (
    <div 
      className="bg-black bg-opacity-80"
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
        className="w-full max-w-5xl animate-fade-in-up flex flex-col gap-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Video container with close button */}
        <div className="relative aspect-video bg-black rounded-xl overflow-hidden shadow-2xl">
          <iframe
            className="w-full h-full"
            src={action.videoUrl}
            title="Video player"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          ></iframe>
          <button 
            onClick={onClose} 
            className="absolute top-3 right-3 text-cloud-white bg-black/50 rounded-full p-2 hover:bg-black/70 transition-all duration-200 hover:scale-110 z-10"
            aria-label="Zamknij wideo"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Action button container */}
        <div className="flex justify-center">
            <button
                onClick={onMarkComplete}
                className="w-full sm:w-auto flex items-center justify-center gap-2 bg-success-green text-cloud-white font-bold py-3 px-8 rounded-lg shadow-lg hover:bg-success-green/90 transition-all duration-200 hover:scale-105 active:scale-95"
            >
                <CheckCircleIcon className="h-6 w-6" />
                <span>Zrobione!</span>
            </button>
        </div>
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