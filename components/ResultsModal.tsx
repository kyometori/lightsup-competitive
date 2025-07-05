import React, { useState, useRef, useImperativeHandle, forwardRef } from 'react';
import * as htmlToImage from 'html-to-image';
import TimerDisplay from './TimerDisplay.tsx';
import { GameModes, UserPreferences, BestTimeRecord } from '../types.ts';
import { TrophyIcon, KeyIcon, ClipboardIcon } from './icons.tsx';

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

export interface ResultsModalRef {
    handleCopy: () => void;
}

const ResultsModal = forwardRef<ResultsModalRef, ResultsModalProps>(({ finalTimes, totalClicks, onRestart, onQuit, gameModes, previousBestTime, preferences, seed, isUserProvidedSeed }, ref) => {
  const totalTime = finalTimes.reduce((sum, time) => sum + time, 0);
  const grandTotalClicks = totalClicks.reduce((sum, clicks) => sum + clicks, 0);
  const resultCardRef = useRef<HTMLDivElement>(null);
  const [copyButtonText, setCopyButtonText] = useState('Copy Results');

  const isNewRecord = previousBestTime === null || totalTime < previousBestTime.time;
  const timeDifference = previousBestTime !== null ? previousBestTime.time - totalTime : 0;
  const animationClass = preferences.showAnimations ? 'animate-fade-in' : '';

  const handleCopy = async () => {
    if (!resultCardRef.current) return;
    setCopyButtonText('Copying...');
    try {
        const dataUrl = await htmlToImage.toPng(resultCardRef.current, {
            quality: 0.98,
            pixelRatio: 2, // For higher resolution
            style: {
                margin: '0', // Ensure no default margins interfere
            }
        });
        const blob = await (await fetch(dataUrl)).blob();
        
        await navigator.clipboard.write([
            new ClipboardItem({ 'image/png': blob })
        ]);
        
        setCopyButtonText('Copied!');
        setTimeout(() => setCopyButtonText('Copy Results'), 2000);

    } catch (err) {
        console.error('Failed to copy results image:', err);
        setCopyButtonText('Failed!');
        setTimeout(() => setCopyButtonText('Copy Results'), 2000);
    }
  };

  useImperativeHandle(ref, () => ({
    handleCopy,
  }));

  return (
    <div className={`fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50 ${animationClass}`}>
      <div className="bg-slate-800 rounded-2xl shadow-2xl w-full max-w-md text-center border border-slate-700">
        <div ref={resultCardRef} className="p-6 bg-slate-900 rounded-t-2xl">
            {/* Header */}
            <div className="text-center mb-4">
                <h2 className="text-2xl font-bold text-yellow-400">LightsUp Competitive</h2>
                <p className="text-slate-400 font-medium">Race Results</p>
            </div>
            {/* Main Score */}
            <div className="bg-slate-800 p-4 rounded-lg text-center mb-4 shadow-inner">
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
                        <TimerDisplay timeInMs={totalTime} className="text-4xl text-white font-bold my-1" />
                        {isNewRecord && timeDifference > 0 && previousBestTime !== null && (
                            <span className="text-green-400 font-mono">-<TimerDisplay timeInMs={timeDifference} className="text-lg" /></span>
                        )}
                    </div>
                  </>
                )}
                {preferences.showMoveStats && <p className="text-slate-400 text-sm mt-1">Total Clicks: {grandTotalClicks}</p>}
            </div>

            {/* Board Details */}
            {(preferences.showTimers || preferences.showMoveStats) && (
                <div className="space-y-2 text-left mb-4">
                    {finalTimes.map((time, index) => (
                        <div key={index} className="flex justify-between items-center bg-slate-800/50 p-2.5 rounded-md">
                            <span className="font-semibold text-slate-300">Board {index + 1}</span>
                            <div className="flex items-center gap-4">
                                {preferences.showMoveStats && <span className="text-slate-400 text-sm">{totalClicks[index]} clicks</span>}
                                {preferences.showTimers && <TimerDisplay timeInMs={time} className="text-lg text-white" />}
                            </div>
                        </div>
                    ))}
                </div>
            )}
            
            {/* Game Info Footer */}
            <div className="border-t border-slate-700 pt-4 text-center">
                 <div className="flex justify-center items-center gap-2 mb-2">
                    {gameModes.isRandom && <span className="bg-cyan-500/20 text-cyan-300 text-xs font-semibold px-3 py-1 rounded-full">Random Start</span>}
                    {gameModes.isHard && <span className="bg-red-500/20 text-red-300 text-xs font-semibold px-3 py-1 rounded-full">Hard Mode</span>}
                </div>
                {seed && (
                    <div className="flex items-center justify-center gap-2 text-slate-500">
                        <KeyIcon className="w-4 h-4" />
                        <p className="text-xs">Seed: <span className={`font-mono ${isUserProvidedSeed ? 'text-yellow-400/80' : 'text-slate-400'}`}>{seed}</span></p>
                    </div>
                )}
            </div>
        </div>
        
        <div className="p-6 bg-slate-800 rounded-b-2xl flex flex-col gap-4">
            <button
                onClick={handleCopy}
                className="w-full flex items-center justify-center gap-2 bg-slate-700 text-slate-200 font-bold py-3 px-6 rounded-lg text-lg hover:bg-slate-600 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 focus:ring-offset-slate-800"
            >
              <ClipboardIcon className="w-6 h-6"/>
              {copyButtonText} (C)
            </button>
            <div className="flex flex-col sm:flex-row gap-4">
                 <button
                  onClick={onQuit}
                  className="w-full bg-slate-700 text-slate-200 font-bold py-3 px-6 rounded-lg text-lg hover:bg-slate-600 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 focus:ring-offset-slate-800"
                >
                  Quit (Q)
                </button>
                <button
                  onClick={onRestart}
                  className="w-full bg-yellow-400 text-slate-900 font-bold py-3 px-6 rounded-lg text-lg hover:bg-yellow-300 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-offset-2 focus:ring-offset-slate-800"
                >
                  Play Again (R)
                </button>
            </div>
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
});

export default ResultsModal;