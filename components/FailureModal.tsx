import React from 'react';
import { UserPreferences } from '../types';
import ModalWrapper from './ModalWrapper.tsx';

interface FailureModalProps {
  reason: string;
  onRestart: () => void;
  onQuit: () => void;
  preferences: UserPreferences;
}

const FailureModal: React.FC<FailureModalProps> = ({ reason, onRestart, onQuit, preferences }) => {
  return (
    <ModalWrapper showAnimations={preferences.showAnimations}>
      <div className="bg-slate-800 rounded-2xl shadow-2xl p-8 w-full max-w-md text-center border border-red-500/50">
        <h2 className="text-4xl font-bold text-red-500 mb-2">Game Over</h2>
        <p className="text-slate-300 mb-8 text-lg">{reason}</p>

        <div className="flex flex-col gap-4">
          <button
            onClick={onRestart}
            className="w-full bg-yellow-400 text-slate-900 font-bold py-3 px-6 rounded-lg text-lg hover:bg-yellow-300 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-offset-2 focus:ring-offset-slate-800"
          >
            Try Again (R)
          </button>
          <button
            onClick={onQuit}
            className="w-full bg-slate-700 text-slate-200 font-bold py-3 px-6 rounded-lg text-lg hover:bg-slate-600 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 focus:ring-offset-slate-800"
          >
            Quit (Q)
          </button>
        </div>
      </div>
    </ModalWrapper>
  );
};

export default FailureModal;