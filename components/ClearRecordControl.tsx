import React, { useState } from 'react';
import { BestTimeRecord } from '../types.ts';
import { TrashIcon } from './icons.tsx';

interface ClearRecordControlProps {
    bestTime: BestTimeRecord | null;
    onClearCurrent: () => void;
    onClearAll: () => void;
}

const ClearRecordControl: React.FC<ClearRecordControlProps> = ({ bestTime, onClearCurrent, onClearAll }) => {
    const [isMenuVisible, setIsMenuVisible] = useState(false);
    const hasRecord = bestTime !== null;

    const handleClearCurrent = () => {
        onClearCurrent();
        setIsMenuVisible(false);
    };

    const handleClearAll = () => {
        onClearAll();
        setIsMenuVisible(false);
    };

    return (
        <div 
            className="relative"
            onMouseEnter={() => hasRecord && setIsMenuVisible(true)}
            onMouseLeave={() => setIsMenuVisible(false)}
        >
            <button
                disabled={!hasRecord}
                aria-haspopup="true"
                aria-expanded={isMenuVisible}
                title={hasRecord ? 'Clear records' : 'No record to clear'}
                className={`p-1 rounded-md transition-colors duration-300 ${
                    hasRecord 
                        ? 'text-slate-400 hover:text-red-400 focus:text-red-400 focus:outline-none focus:ring-2 focus:ring-red-500' 
                        : 'text-slate-600 cursor-not-allowed'
                }`}
            >
                <TrashIcon className="w-5 h-5" />
            </button>
            
            <div 
                className={`absolute top-full right-0 mt-1 bg-slate-700 rounded-md shadow-lg p-2 flex flex-col gap-2 w-48 z-10 origin-top-right transition-all duration-100 ease-out
                ${isMenuVisible && hasRecord ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'}`}
            >
                <button onClick={handleClearCurrent} className="text-left text-sm w-full px-3 py-1.5 rounded hover:bg-slate-600 transition-colors">Clear for this mode</button>
                <button onClick={handleClearAll} className="text-left text-sm w-full px-3 py-1.5 rounded hover:bg-red-500/50 text-red-400 hover:text-white transition-colors">Clear all records</button>
            </div>
        </div>
    );
};

export default ClearRecordControl;
