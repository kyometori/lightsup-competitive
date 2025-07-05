import React from 'react';
import { GameModes, BestTimeRecord } from '../types.ts';
import TimerDisplay from '../components/TimerDisplay.tsx';
import { PlayIcon, QuestionMarkCircleIcon, CogIcon, KeyIcon } from '../components/icons.tsx';
import ClearRecordControl from '../components/ClearRecordControl.tsx';

interface IdleSceneProps {
    gameModes: GameModes;
    setGameModes: {
        setIsRandomMode: (value: boolean) => void;
        setIsHardMode: (value: boolean) => void;
    };
    bestTime: BestTimeRecord | null;
    startGame: () => void;
    seed: string;
    onShowHelp: () => void;
    onShowPreferences: () => void;
    onShowSeedModal: () => void;
    onClearCurrentRecord: () => void;
    onClearAllRecords: () => void;
    showAnimations: boolean;
}

const IdleScene: React.FC<IdleSceneProps> = ({
    gameModes,
    setGameModes,
    bestTime,
    startGame,
    seed,
    onShowHelp,
    onShowPreferences,
    onShowSeedModal,
    onClearCurrentRecord,
    onClearAllRecords,
    showAnimations
}) => {
    const animationClass = showAnimations ? 'animate-fade-in' : '';
    
    return (
        <div className={`flex flex-col items-center justify-center text-center p-8 sm:p-10 bg-slate-800/50 rounded-2xl shadow-xl ${animationClass} relative`}>
            <div className="absolute top-4 right-4 flex items-center gap-2">
                <button onClick={onShowSeedModal} className="text-slate-400 hover:text-yellow-400 transition-colors" aria-label="Set Seed (S)" title="Set Seed (S)">
                    <KeyIcon className="w-7 h-7" />
                </button>
                <button onClick={onShowPreferences} className="text-slate-400 hover:text-yellow-400 transition-colors" aria-label="Settings (P)" title="Settings (P)">
                    <CogIcon className="w-7 h-7" />
                </button>
                <button onClick={onShowHelp} className="text-slate-400 hover:text-yellow-400 transition-colors" aria-label="Help (H)" title="Help (H)">
                    <QuestionMarkCircleIcon className="w-7 h-7" />
                </button>
            </div>
            <h3 className="text-2xl font-bold mb-4">Ready to play?</h3>
            <p className="text-slate-400 max-w-md mb-6">
                Recreate the target patterns. Click a tile to flip it and its neighbors.
            </p>

            <div className="flex items-center justify-center gap-6 mb-6" role="group" aria-labelledby="game-modes-label">
                <span id="game-modes-label" className="sr-only">Game modes</span>
                <label className="flex items-center gap-2 cursor-pointer text-slate-300 hover:text-white transition-colors" title="Start with randomly scrambled boards">
                    <input type="checkbox" checked={gameModes.isRandom} onChange={(e) => { setGameModes.setIsRandomMode(e.target.checked); e.currentTarget.blur(); }} className="form-checkbox bg-slate-700 border-slate-600 text-cyan-400 focus:ring-cyan-400 focus:ring-offset-slate-900" />
                    Random Start
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-slate-300 hover:text-white transition-colors" title="Game over if a board is idle for 10s">
                    <input type="checkbox" checked={gameModes.isHard} onChange={(e) => { setGameModes.setIsHardMode(e.target.checked); e.currentTarget.blur(); }} className="form-checkbox bg-slate-700 border-slate-600 text-red-500 focus:ring-red-500 focus:ring-offset-slate-900" />
                    Hard Mode
                </label>
            </div>

            <div className="relative bg-slate-900/60 rounded-xl p-4 mb-8 w-72 text-center shadow-lg border border-slate-700/50">
                <div className="flex justify-between items-center mb-1">
                    <p className="text-sm text-slate-400 uppercase font-semibold">Best Time</p>
                    <ClearRecordControl 
                        bestTime={bestTime}
                        onClearCurrent={onClearCurrentRecord}
                        onClearAll={onClearAllRecords}
                    />
                </div>
                
                {bestTime ? (
                    <TimerDisplay timeInMs={bestTime.time} className="text-white text-3xl block" />
                ) : (
                    <span className="font-mono text-3xl text-slate-500 block">-:--.--</span>
                )}

                <div className="mt-2 pt-2 border-t border-slate-700/50 h-[38px] flex items-center justify-center">
                    {bestTime?.seed && (
                        <p className="text-xs text-slate-400 flex items-center justify-center gap-1.5">
                            <KeyIcon className="w-3.5 h-3.5" />
                            Seed: <span className={`font-mono truncate ${bestTime.isUserProvidedSeed ? 'text-yellow-400/80' : 'text-slate-400/80'}`} title={bestTime.seed}>{bestTime.seed}</span>
                        </p>
                    )}
                </div>
            </div>

            {seed && (
                <div className="text-center -mt-6 mb-6">
                    <p className="text-xs text-slate-400">Seed: <span className="font-mono text-yellow-400/80 truncate" title={seed}>{seed}</span></p>
                </div>
            )}

            <button
                onClick={startGame}
                className="flex items-center gap-3 bg-yellow-400 text-slate-900 font-bold py-3 px-8 rounded-full text-xl hover:bg-yellow-300 transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-yellow-400/50"
            >
                <PlayIcon className="w-6 h-6" />
                Start Game <span className="text-slate-900/60 font-mono text-sm">(Spacebar)</span>
            </button>
        </div>
    );
};

export default IdleScene;