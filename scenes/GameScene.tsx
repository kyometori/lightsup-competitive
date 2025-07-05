import React from 'react';
import Board from '../components/Board.tsx';
import TimerDisplay from '../components/TimerDisplay.tsx';
import { RestartIcon, StopIcon, TimerIcon } from '../components/icons.tsx';
import { useGameEngine } from '../hooks/useGameEngine.ts';

interface GameSceneProps {
  game: ReturnType<typeof useGameEngine>;
}

const GameScene: React.FC<GameSceneProps> = ({ game }) => {
  const {
    preferences,
    gameModes,
    targetBoards,
    playerBoards,
    boardSolved,
    boardTimers,
    boardClicks,
    seed,
    handleCellClick,
    startGame,
    quitGame
  } = game;

  const animationClass = preferences.showAnimations ? 'animate-fade-in' : '';
  const totalTime = boardTimers.reduce((sum, time) => sum + time, 0);

  return (
    <main className={`w-full max-w-7xl mx-auto flex flex-col gap-6 ${animationClass}`}>
      <section aria-labelledby="target-heading">
        <h3 id="target-heading" className="text-center text-slate-400 uppercase tracking-widest text-sm mb-3">Target Patterns</h3>
        <div className="flex justify-center items-start gap-4 sm:gap-6 md:gap-8 flex-wrap">
          {targetBoards.map((board, i) => <Board key={`target-${i}`} boardState={board} isTarget size="small" />)}
        </div>
      </section>
      
      {(preferences.showTimers || preferences.showMoveStats) && (
        <section aria-label="Timers and stats" className="flex justify-around items-center bg-slate-800/50 rounded-xl p-4 max-w-4xl mx-auto w-full shadow-lg min-h-[96px]">
          {boardTimers.map((time, i) => (
            <div key={`timer-${i}`} className="text-center w-32">
              <p className={`text-sm uppercase font-semibold ${boardSolved[i] ? 'text-green-400' : 'text-slate-400'}`}>
                Board {i + 1}
              </p>
              {preferences.showTimers ? (
                <TimerDisplay timeInMs={time} className={`${boardSolved[i] ? 'text-green-400' : 'text-white'}`} />
              ) : <div className="h-[36px]" /> }
              {preferences.showMoveStats ? (
                <p className="text-xs text-slate-500">{boardClicks[i]} Clicks</p>
              ) : <div className="h-[16px]" /> }
            </div>
          ))}
          <div className="border-l border-slate-700 h-16 mx-2 sm:mx-4"></div>
          <div className="text-center w-32">
              <p className="text-sm uppercase font-semibold text-yellow-400 flex items-center justify-center gap-1.5"><TimerIcon className="w-4 h-4"/>Total</p>
                {preferences.showTimers ? (
                  <TimerDisplay timeInMs={totalTime} className="text-yellow-400" />
                ) : <div className="h-[36px]" />}
          </div>
        </section>
      )}

      <div className="flex justify-center items-center gap-2 -mb-2 flex-wrap">
        {gameModes.isRandom && <span className="bg-cyan-500/20 text-cyan-300 text-xs font-semibold px-3 py-1 rounded-full">Random Start</span>}
        {gameModes.isHard && <span className="bg-red-500/20 text-red-300 text-xs font-semibold px-3 py-1 rounded-full">Hard Mode</span>}
        {seed && <span className="bg-purple-500/20 text-purple-300 text-xs font-semibold px-3 py-1 rounded-full truncate max-w-[150px]" title={seed}>Seed: {seed}</span>}
      </div>

      <div className="flex justify-center items-center gap-4">
          <button onClick={startGame} className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors px-4 py-2 rounded-lg bg-slate-800/50 hover:bg-slate-700/80">
              <RestartIcon className="w-5 h-5" />
              Restart (R)
          </button>
          <button onClick={quitGame} className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors px-4 py-2 rounded-lg bg-slate-800/50 hover:bg-slate-700/80">
              <StopIcon className="w-5 h-5" />
              Quit (Q)
          </button>
      </div>

      <section aria-labelledby="player-heading">
        <h2 id="player-heading" className="sr-only">Your Boards</h2>
        <div className="flex justify-center items-start gap-4 sm:gap-6 md:gap-8 flex-wrap">
          {playerBoards.map((board, i) => (
            <Board 
              key={`player-${i}`} 
              boardState={board} 
              isSolved={boardSolved[i]}
              onCellClick={(r, c) => handleCellClick(i, r, c)} 
              showAnimations={preferences.showAnimations}
            />
          ))}
        </div>
      </section>
    </main>
  );
};

export default GameScene;
