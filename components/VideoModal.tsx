import React from 'react';
import { XMarkIcon } from './icons/Icons';

interface VideoModalProps {
  videoUrl: string;
  onClose: () => void;
}

export const VideoModal: React.FC<VideoModalProps> = ({ videoUrl, onClose }) => {
  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-[100] p-4"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-5xl animate-fade-in-up"
        onClick={(e) => e.stopPropagation()}
      >
        <button 
          onClick={onClose} 
          className="absolute -top-10 right-0 text-cloud-white bg-space-800/50 rounded-full p-1.5 hover:bg-space-700/70 transition z-10"
          aria-label="Zamknij wideo"
        >
          <XMarkIcon className="h-6 w-6" />
        </button>
        <div className="aspect-video bg-black rounded-xl overflow-hidden">
          <iframe
            className="w-full h-full"
            src={videoUrl}
            title="Video player"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          ></iframe>
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