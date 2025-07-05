import React from 'react';
import { BestTimeRecord } from '../types.ts';
import TimerDisplay from './TimerDisplay.tsx';
import { KeyIcon } from './icons.tsx';
import ClearRecordControl from './ClearRecordControl.tsx';

interface BestTimeDisplayProps {
    bestTime: BestTimeRecord | null;
    onClearCurrentRecord: () => void;
    onClearAllRecords: () => void;
}

const BestTimeDisplay: React.FC<BestTimeDisplayProps> = ({ bestTime, onClearCurrentRecord, onClearAllRecords }) => {
    return (
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
    );
};

export default BestTimeDisplay;
