import React from 'react';
import TimerDisplay from './TimerDisplay.tsx';
import { GameModes, UserPreferences, BestTimeRecord } from '../types.ts';
import { TrophyIcon, KeyIcon } from './icons.tsx';

interface ResultsModalProps {
  finalTimes: number[];
  totalClicks: number[];
  onRestart: () => void;
  onQuit: () => void;
  gameModes: GameModes;
  previousBestTime: BestTimeRecord | null;
  preferences: UserPreferences;
  seed: string;
  isUserProvidedSeed: boolean;
}

const ResultsModal: React.FC<ResultsModalProps> = ({ finalTimes, totalClicks, onRestart, onQuit, gameModes, previousBestTime, preferences, seed, isUserProvidedSeed }) => {
  const totalTime = finalTimes.reduce((sum, time) => sum + time, 0);
  const grandTotalClicks = totalClicks.reduce((sum, clicks) => sum + clicks, 0);

  const isNewRecord = previousBestTime === null || totalTime < previousBestTime.time;
  const timeDifference = previousBestTime !== null ? previousBestTime.time - totalTime : 0;
  const animationClass = preferences.showAnimations ? 'animate-fade-in' : '';

  return (
    <div className={`fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50 ${animationClass}`}>
      <div className="bg-slate-800 rounded-2xl shadow-2xl p-8 w-full max-w-md text-center border border-slate-700">
        <h2 className="text-4xl font-bold text-yellow-400 mb-2">Finished!</h2>
        <p className="text-slate-400 mb-6">Congratulations on solving all puzzles.</p>

        <div className="bg-slate-900/50 p-6 rounded-lg mb-8">
            {preferences.showTimers && isNewRecord && (
                <div className={`flex items-center justify-center gap-2 text-green-400 font-bold mb-2 ${preferences.showAnimations ? 'animate-pulse' : ''}`}>
                    <TrophyIcon className="w-6 h-6" />
                    <span>New Record!</span>
                </div>
            )}
            {preferences.showTimers && (
              <>
                <p className="text-slate-400 text-sm uppercase font-semibold">Total Time</p>
                <div className="flex justify-center items-baseline gap-2">
                  <TimerDisplay timeInMs={totalTime} className="text-5xl text-white font-bold my-1" />
                  {isNewRecord && timeDifference > 0 && previousBestTime !== null && (
                    <span className="text-green-400 font-mono">-<TimerDisplay timeInMs={timeDifference} className="text-lg" /></span>
                  )}
                </div>
              </>
            )}
            {preferences.showMoveStats && <p className="text-slate-400 text-sm mt-1">Total Clicks: {grandTotalClicks}</p>}
            
            <div className="flex justify-center items-center gap-2 mt-4">
                {gameModes.isRandom && <span className="bg-cyan-500/20 text-cyan-300 text-xs font-semibold px-3 py-1 rounded-full">Random Start</span>}
                {gameModes.isHard && <span className="bg-red-500/20 text-red-300 text-xs font-semibold px-3 py-1 rounded-full">Hard Mode</span>}
            </div>
             {seed && (
                <div className="flex items-center justify-center gap-2 mt-3 text-slate-400">
                    <KeyIcon className="w-4 h-4" />
                    <p className="text-xs">Seed: <span className={`font-mono ${isUserProvidedSeed ? 'text-yellow-400/80' : 'text-slate-400'}`}>{seed}</span></p>
                </div>
            )}
        </div>

        {(preferences.showTimers || preferences.showMoveStats) && (
            <div className="space-y-4 text-left mb-8">
                {finalTimes.map((time, index) => (
                    <div key={index} className="flex justify-between items-center bg-slate-700/50 p-3 rounded-md">
                        <span className="text-slate-300">Board {index + 1}</span>
                        <div className="flex items-center gap-4">
                            {preferences.showMoveStats && <span className="text-slate-400 text-sm">{totalClicks[index]} clicks</span>}
                            {preferences.showTimers && <TimerDisplay timeInMs={time} className="text-xl text-white" />}
                        </div>
                    </div>
                ))}
            </div>
        )}
        
        <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={onQuit}
              className="w-full bg-slate-700 text-slate-200 font-bold py-3 px-6 rounded-lg text-lg hover:bg-slate-600 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 focus:ring-offset-slate-800"
            >
              Quit
            </button>
            <button
              onClick={onRestart}
              className="w-full bg-yellow-400 text-slate-900 font-bold py-3 px-6 rounded-lg text-lg hover:bg-yellow-300 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-offset-2 focus:ring-offset-slate-800"
            >
              Play Again
            </button>
        </div>
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

export default ResultsModal;