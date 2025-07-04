import React from 'react';
import { BoardState } from '../types.ts';
import { CheckCircleIcon } from './icons.tsx';

interface BoardProps {
  boardState: BoardState;
  isTarget?: boolean;
  isSolved?: boolean;
  onCellClick?: (row: number, col: number) => void;
  size?: 'small' | 'large';
  showAnimations?: boolean;
}

const Board: React.FC<BoardProps> = ({ boardState, isTarget = false, isSolved = false, onCellClick, size = 'large', showAnimations = true }) => {
  const isSmall = size === 'small';

  const baseCellClass = isSmall 
    ? "w-7 h-7 sm:w-8 sm:h-8 rounded"
    : "w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-lg";
  
  const gapClass = isSmall ? 'gap-1' : 'gap-2';
  const checkIconClass = isSmall ? 'w-10 h-10' : 'w-20 h-20';
  
  const onClass = isTarget ? "bg-cyan-400" : "bg-yellow-400 shadow-[0_0_15px] shadow-yellow-400/60";
  const offClass = "bg-slate-700";

  const interactionClasses = isTarget || isSolved
    ? 'cursor-default'
    : 'cursor-pointer' + (showAnimations ? ' hover:scale-105 active:scale-95' : '');
  
  const transitionClass = showAnimations ? 'transition-all duration-200' : '';

  return (
    <div className="relative">
      <div className={`grid grid-cols-5 ${gapClass} p-2 rounded-lg bg-slate-800/50 shadow-lg ${isSolved ? 'opacity-50' : ''}`}>
        {boardState.map((row, rIndex) =>
          row.map((cell, cIndex) => (
            <button
              key={`${rIndex}-${cIndex}`}
              aria-label={`cell ${rIndex}-${cIndex}`}
              disabled={isTarget || isSolved}
              onClick={() => onCellClick && onCellClick(rIndex, cIndex)}
              className={`${baseCellClass} ${cell ? onClass : offClass} ${interactionClasses} ${transitionClass}`}
            />
          ))
        )}
      </div>
      {isSolved && (
        <div className="absolute inset-0 flex items-center justify-center bg-green-500/30 rounded-lg pointer-events-none">
          <CheckCircleIcon className={`${checkIconClass} text-white/90`} />
        </div>
      )}
    </div>
  );
};

export default Board;