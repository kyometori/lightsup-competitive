import React from 'react';
import { StopIcon } from './icons.tsx';
import { UserPreferences } from '../types.ts';

interface HelpModalProps {
  onClose: () => void;
  preferences: UserPreferences;
}

const HelpModal: React.FC<HelpModalProps> = ({ onClose, preferences }) => {
  const animationClass = preferences.showAnimations ? 'animate-fade-in' : '';

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // Close the modal only if the click is on the overlay itself
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div onClick={handleOverlayClick} className={`fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50 ${animationClass}`}>
      <div className="bg-slate-800 rounded-2xl shadow-2xl p-8 w-full max-w-lg text-left border border-slate-700 relative">
        <button 
            onClick={onClose}
            className="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors"
            aria-label="Close help (Esc)"
        >
            <StopIcon className="w-8 h-8"/>
        </button>

        <h2 className="text-3xl font-bold text-yellow-400 mb-4">How to Play</h2>
        <p className="text-slate-300 mb-6">
            The goal is to make your three boards match the three target patterns at the top of the screen. Clicking a tile will flip its state (on/off) and the state of its four adjacent neighbors (up, down, left, right).
        </p>

        <h3 className="text-2xl font-bold text-cyan-400 mb-3">Game Modes</h3>
        <div className="space-y-4 mb-6">
            <div>
                <h4 className="font-semibold text-lg text-white">Random Start</h4>
                <p className="text-slate-400">
                    Instead of starting with all lights off, your boards will be randomly scrambled. This can lead to faster, or much harder, puzzles.
                </p>
            </div>
             <div>
                <h4 className="font-semibold text-lg text-white">Hard Mode</h4>
                <p className="text-slate-400">
                    A true test of speed. If you don't make a move on any unsolved board for 10 seconds, the game is over!
                </p>
            </div>
        </div>

        <h3 className="text-2xl font-bold text-cyan-400 mb-3">Shortcuts</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-slate-300">
          <div className="flex justify-between items-center border-b border-slate-700 py-1.5"><span>Start Game</span><kbd className="font-mono text-base bg-slate-700/80 px-2 py-0.5 rounded-md">Space</kbd></div>
          <div className="flex justify-between items-center border-b border-slate-700 py-1.5"><span>Restart Game</span><kbd className="font-mono text-base bg-slate-700/80 px-2 py-0.5 rounded-md">R</kbd></div>
          <div className="flex justify-between items-center border-b border-slate-700 py-1.5"><span>Quit Game</span><kbd className="font-mono text-base bg-slate-700/80 px-2 py-0.5 rounded-md">Q</kbd></div>
          <div className="flex justify-between items-center border-b border-slate-700 py-1.5"><span>Open Help</span><kbd className="font-mono text-base bg-slate-700/80 px-2 py-0.5 rounded-md">H</kbd></div>
          <div className="flex justify-between items-center border-b border-slate-700 py-1.5"><span>Open Preferences</span><kbd className="font-mono text-base bg-slate-700/80 px-2 py-0.5 rounded-md">P</kbd></div>
          <div className="flex justify-between items-center border-b border-slate-700 py-1.5"><span>Open Seed Menu</span><kbd className="font-mono text-base bg-slate-700/80 px-2 py-0.5 rounded-md">S</kbd></div>
          <div className="flex justify-between items-center border-b border-slate-700 py-1.5 sm:col-span-2"><span>Close any window</span><kbd className="font-mono text-base bg-slate-700/80 px-2 py-0.5 rounded-md">Esc</kbd></div>
        </div>

         <button
          onClick={onClose}
          className="mt-8 w-full bg-yellow-400 text-slate-900 font-bold py-3 px-6 rounded-lg text-lg hover:bg-yellow-300 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-offset-2 focus:ring-offset-slate-800"
        >
          Got it!
        </button>
      </div>
       <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-fade-in { animation: fade-in 0.3s ease-out forwards; }
      `}</style>
    </div>
  );
};

export default HelpModal;