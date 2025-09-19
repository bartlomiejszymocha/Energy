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
        className="bg-space-900 rounded-xl shadow-2xl w-full max-w-3xl relative animate-fade-in-up aspect-video"
        onClick={(e) => e.stopPropagation()} // Prevent closing modal when clicking on the video container
      >
        <button 
          onClick={onClose} 
          className="absolute -top-3 -right-3 text-cloud-white bg-space-800 rounded-full p-1.5 hover:bg-space-700 transition z-10"
          aria-label="Zamknij wideo"
        >
          <XMarkIcon className="h-6 w-6" />
        </button>
        <iframe
          className="w-full h-full rounded-xl"
          src={videoUrl}
          title="Video player"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        ></iframe>
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