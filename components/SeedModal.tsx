import React, { useState, useCallback, useEffect } from 'react';
import { UserPreferences } from '../types.ts';
import { StopIcon, RestartIcon, TrashIcon } from './icons.tsx';
import ModalWrapper from './ModalWrapper.tsx';

interface SeedModalProps {
  initialSeed: string;
  onSave: (newSeed: string) => void;
  onClose: () => void;
  preferences: UserPreferences;
}

const SeedModal: React.FC<SeedModalProps> = ({ initialSeed, onSave, onClose, preferences }) => {
  const [seed, setSeed] = useState(initialSeed);

  const handleSave = useCallback(() => {
    onSave(seed);
  }, [onSave, seed]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Allows submitting by pressing Enter anywhere in the modal
      if (e.key === 'Enter') {
        e.preventDefault();
        handleSave();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleSave]);

  const handleGenerateRandom = (e: React.MouseEvent<HTMLButtonElement>) => {
    const randomSeed = Math.random().toString(36).substring(2, 10).toUpperCase();
    setSeed(randomSeed);
    e.currentTarget.blur();
  };

  const handleClear = (e: React.MouseEvent<HTMLButtonElement>) => {
      setSeed('');
      e.currentTarget.blur();
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSave();
  };

  return (
    <ModalWrapper onClose={onClose} showAnimations={preferences.showAnimations}>
      <form onSubmit={handleSubmit} className="bg-slate-800 rounded-2xl shadow-2xl p-8 w-full max-w-md text-left border border-slate-700 relative">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors"
          aria-label="Close seed menu"
        >
          <StopIcon className="w-8 h-8" />
        </button>

        <h2 className="text-3xl font-bold text-yellow-400 mb-4">Competition Seed</h2>
        <p className="text-slate-400 mb-6">
          Use a seed to generate the same set of puzzles every time. Perfect for competing with friends! Leave it blank for a random game.
        </p>

        <div className="space-y-4">
            <div>
                <label htmlFor="seed-input" className="block text-sm font-medium text-slate-300 mb-1">
                    Game Seed
                </label>
                <div className="flex gap-2">
                    <input
                        id="seed-input"
                        type="text"
                        value={seed}
                        onChange={(e) => setSeed(e.target.value.toUpperCase())}
                        placeholder="Enter a seed..."
                        className="flex-grow bg-slate-900 border border-slate-600 text-slate-200 rounded-md py-2 px-3 focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 outline-none font-mono uppercase"
                        autoFocus
                    />
                    <button
                        type="button"
                        onClick={handleClear}
                        className="p-2 bg-slate-700/80 text-slate-300 hover:text-white hover:bg-slate-700 rounded-md transition-colors"
                        title="Clear seed"
                        aria-label="Clear seed"
                    >
                        <TrashIcon className="w-6 h-6" />
                    </button>
                </div>
            </div>
            <button
                type="button"
                onClick={handleGenerateRandom}
                className="w-full flex items-center justify-center gap-2 bg-slate-700/50 text-slate-200 font-semibold py-2 px-4 rounded-lg hover:bg-slate-700 transition-colors"
            >
                <RestartIcon className="w-5 h-5"/>
                Generate Random Seed
            </button>
        </div>

        <button
          type="submit"
          className="mt-8 w-full bg-yellow-400 text-slate-900 font-bold py-3 px-6 rounded-lg text-lg hover:bg-yellow-300 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-offset-2 focus:ring-offset-slate-800"
        >
          Use This Seed
        </button>
      </form>
    </ModalWrapper>
  );
};

export default SeedModal;