import React, { useState, useEffect, useCallback, useRef } from 'react';
import { BoardState, GameState, UserPreferences, BestTimeRecord } from './types.ts';
import { createInitialBoard, generateSolvableBoard, areBoardsEqual, toggleCellAndNeighbors, createSeededPRNG } from './utils/board.ts';
import { getBestTime, saveBestTime, clearBestTime, clearAllBestTimes, getUserPreferences, saveUserPreferences } from './utils/storage.ts';
import Board from './components/Board.tsx';
import TimerDisplay from './components/TimerDisplay.tsx';
import ResultsModal from './components/ResultsModal.tsx';
import FailureModal from './components/FailureModal.tsx';
import HelpModal from './components/HelpModal.tsx';
import PreferencesModal from './components/PreferencesModal.tsx';
import SeedModal from './components/SeedModal.tsx';
import { PlayIcon, TimerIcon, RestartIcon, StopIcon, QuestionMarkCircleIcon, TrashIcon, CogIcon, KeyIcon, GithubIcon } from './components/icons.tsx';

const NUM_BOARDS = 3;
const HARD_MODE_IDLE_SECONDS = 10;

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(GameState.IDLE);
  
  // Game config state
  const [isRandomMode, setIsRandomMode] = useState<boolean>(false);
  const [isHardMode, setIsHardMode] = useState<boolean>(false);
  const [isHelpVisible, setIsHelpVisible] = useState<boolean>(false);
  const [bestTime, setBestTime] = useState<BestTimeRecord | null>(null);
  const [isClearMenuVisible, setIsClearMenuVisible] = useState<boolean>(false);
  const [preferences, setPreferences] = useState<UserPreferences>(() => getUserPreferences());
  const [countdownValue, setCountdownValue] = useState<number>(preferences.countdownSeconds);
  const [isPreferencesModalVisible, setIsPreferencesModalVisible] = useState<boolean>(false);
  const [seed, setSeed] = useState<string>(''); // User-defined seed
  const [isSeedModalVisible, setIsSeedModalVisible] = useState<boolean>(false);
  
  // Game instance state
  const [activeGameSeed, setActiveGameSeed] = useState<string>(''); // Seed for the current game instance
  const [isUserSeeded, setIsUserSeeded] = useState<boolean>(false); // Was the seed user-provided?
  const [targetBoards, setTargetBoards] = useState<BoardState[]>([]);
  const [playerBoards, setPlayerBoards] = useState<BoardState[]>(() => Array(NUM_BOARDS).fill(createInitialBoard(false)));
  const [boardSolved, setBoardSolved] = useState<boolean[]>(Array(NUM_BOARDS).fill(false));
  const [boardTimers, setBoardTimers] = useState<number[]>(Array(NUM_BOARDS).fill(0));
  const [boardClicks, setBoardClicks] = useState<number[]>(Array(NUM_BOARDS).fill(0));
  const [lastInteractionTime, setLastInteractionTime] = useState<number[]>([]);
  const [failureReason, setFailureReason] = useState<string>('');
  
  const lastUpdateTimeRef = useRef<number>(0);
  const previousBestTimeRef = useRef<BestTimeRecord | null>(null);

  const resetForNewGame = useCallback(() => {
    setTargetBoards([]);
    setPlayerBoards(Array(NUM_BOARDS).fill(createInitialBoard(false)));
    setBoardSolved(Array(NUM_BOARDS).fill(false));
    setBoardTimers(Array(NUM_BOARDS).fill(0));
    setBoardClicks(Array(NUM_BOARDS).fill(0));
    setFailureReason('');
    setLastInteractionTime([]);
    setActiveGameSeed('');
    setIsUserSeeded(false);
  }, []);

  const startGame = useCallback(() => {
    previousBestTimeRef.current = getBestTime({ isRandom: isRandomMode, isHard: isHardMode });
    resetForNewGame();

    // Every game gets a seed. Use the user-defined one if it exists, otherwise generate one.
    const isUserProvided = !!seed;
    const gameSeed = seed || Math.random().toString(36).substring(2, 10).toUpperCase();
    setActiveGameSeed(gameSeed);
    setIsUserSeeded(isUserProvided);

    const prng = createSeededPRNG(gameSeed);

    const newTargetBoards = Array(NUM_BOARDS).fill(null).map(() => generateSolvableBoard(prng));
    setTargetBoards(newTargetBoards);

    if (isRandomMode) {
      const newPlayerBoards = Array(NUM_BOARDS).fill(null).map((_, i) => {
        let pBoard;
        do {
          pBoard = generateSolvableBoard(prng);
        } while (areBoardsEqual(pBoard, newTargetBoards[i]));
        return pBoard;
      });
      setPlayerBoards(newPlayerBoards);
    } else {
      setPlayerBoards(Array(NUM_BOARDS).fill(createInitialBoard(false)));
    }
    
    if (preferences.countdownSeconds > 0) {
      setCountdownValue(preferences.countdownSeconds);
      setGameState(GameState.COUNTDOWN);
    } else {
      setGameState(GameState.PLAYING);
      if (isHardMode) {
        setLastInteractionTime(Array(NUM_BOARDS).fill(performance.now()));
      }
    }
  }, [isRandomMode, isHardMode, resetForNewGame, preferences, seed]);
  
  const handleQuit = useCallback(() => {
      setGameState(GameState.IDLE);
      resetForNewGame();
  }, [resetForNewGame]);
  
  const handleSavePreferences = (newPrefs: UserPreferences) => {
    setPreferences(newPrefs);
    saveUserPreferences(newPrefs);
  };

  const updateBestTimeDisplay = useCallback(() => {
      const record = getBestTime({ isRandom: isRandomMode, isHard: isHardMode });
      setBestTime(record);
  }, [isRandomMode, isHardMode]);

  const handleClearCurrentRecord = () => {
    clearBestTime({ isRandom: isRandomMode, isHard: isHardMode });
    updateBestTimeDisplay();
    setIsClearMenuVisible(false);
  }
  
  const handleClearAllRecords = () => {
    clearAllBestTimes();
    updateBestTimeDisplay();
    setIsClearMenuVisible(false);
  }

  // Effect to load best time for selected modes when on the idle screen
  useEffect(() => {
    if (gameState === GameState.IDLE) {
      updateBestTimeDisplay();
    }
  }, [isRandomMode, isHardMode, gameState, updateBestTimeDisplay]);

  // Countdown timer effect
  useEffect(() => {
    if (gameState !== GameState.COUNTDOWN) {
      return;
    }

    const timerId = setInterval(() => {
      setCountdownValue(prev => {
        const nextValue = prev - 1;
        if (nextValue === 0) {
          clearInterval(timerId);
          if (isHardMode) {
            setLastInteractionTime(Array(NUM_BOARDS).fill(performance.now()));
          }
          setGameState(GameState.PLAYING);
        }
        return nextValue;
      });
    }, 1000);

    return () => {
      clearInterval(timerId);
    };
  }, [gameState, isHardMode]);


  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameState === GameState.IDLE && e.code === 'Space' && !isHelpVisible && !isClearMenuVisible && !isPreferencesModalVisible && !isSeedModalVisible) {
        e.preventDefault();
        startGame();
      }
      if (gameState === GameState.PLAYING || gameState === GameState.COUNTDOWN) {
        if (e.key.toLowerCase() === 'r') {
          e.preventDefault();
          startGame(); // Restart
        }
        if (e.key.toLowerCase() === 'q') {
          e.preventDefault();
          handleQuit();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState, startGame, handleQuit, isHelpVisible, isClearMenuVisible, isPreferencesModalVisible, isSeedModalVisible]);
  
  const handleCellClick = useCallback((boardIndex: number, row: number, col: number) => {
    if (gameState !== GameState.PLAYING || boardSolved[boardIndex]) {
      return;
    }

    if (isHardMode) {
        setLastInteractionTime(prev => {
            const newTimes = [...prev];
            newTimes[boardIndex] = performance.now();
            return newTimes;
        });
    }

    setBoardClicks(prev => {
      const newClicks = [...prev];
      newClicks[boardIndex]++;
      return newClicks;
    });

    setPlayerBoards(prevBoards => {
      const newBoards = [...prevBoards];
      newBoards[boardIndex] = toggleCellAndNeighbors(newBoards[boardIndex], row, col);
      return newBoards;
    });
  }, [gameState, boardSolved, isHardMode]);

  useEffect(() => {
    if (gameState !== GameState.PLAYING) return;

    const newSolvedBoards = [...boardSolved];
    let changed = false;

    playerBoards.forEach((pBoard, i) => {
        if (!newSolvedBoards[i] && areBoardsEqual(pBoard, targetBoards[i])) {
            newSolvedBoards[i] = true;
            changed = true;
        }
    });

    if (changed) {
        setBoardSolved(newSolvedBoards);
    }
    
    if (newSolvedBoards.every(s => s)) {
        setGameState(GameState.FINISHED);
        const totalSolveTime = boardTimers.reduce((sum, time) => sum + time, 0);
        // Save the record with the specific seed used for this game instance.
        saveBestTime(totalSolveTime, { isRandom: isRandomMode, isHard: isHardMode }, activeGameSeed, isUserSeeded);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playerBoards, targetBoards, gameState, boardSolved, boardTimers, isRandomMode, isHardMode, activeGameSeed, isUserSeeded]);

  useEffect(() => {
    let animationFrameId: number;
    if (gameState === GameState.PLAYING) {
      lastUpdateTimeRef.current = performance.now();
      const tick = (now: number) => {
        const delta = now - lastUpdateTimeRef.current;
        lastUpdateTimeRef.current = now;

        setBoardTimers(prevTimers => 
          prevTimers.map((time, i) => boardSolved[i] ? time : time + delta)
        );

        if (isHardMode) {
            const idleTimeLimit = HARD_MODE_IDLE_SECONDS * 1000;
            for(let i = 0; i < NUM_BOARDS; i++) {
                if (!boardSolved[i] && (now - lastInteractionTime[i] > idleTimeLimit)) {
                    setFailureReason(`Board ${i + 1} was idle for over ${HARD_MODE_IDLE_SECONDS} seconds.`);
                    setGameState(GameState.FAILED);
                    return; // Stop the loop
                }
            }
        }

        animationFrameId = requestAnimationFrame(tick);
      };
      animationFrameId = requestAnimationFrame(tick);
    }
    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [gameState, boardSolved, isHardMode, lastInteractionTime]);
  
  const totalTime = boardTimers.reduce((sum, time) => sum + time, 0);
  const animationClass = preferences.showAnimations ? 'animate-fade-in' : '';

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8">
      <style>{`
        .form-checkbox { appearance: none; padding: 0; print-color-adjust: exact; display: inline-block; vertical-align: middle; background-origin: border-box; user-select: none; flex-shrink: 0; height: 1.25rem; width: 1.25rem; color: #2563eb; background-color: #fff; border-color: #6b7280; border-width: 1px; border-radius: 0.375rem; }
        .form-checkbox:checked { background-image: url("data:image/svg+xml,%3csvg viewBox='0 0 16 16' fill='white' xmlns='http://www.w3.org/2000/svg'%3e%3cpath d='M12.207 4.793a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0l-2-2a1 1 0 011.414-1.414L6.5 9.086l4.293-4.293a1 1 0 011.414 0z'/%3e%3c/svg%3e"); border-color: transparent; background-size: 100% 100%; background-position: center; background-repeat: no-repeat; }
        .form-checkbox.text-cyan-400:checked { background-color: #22d3ee; }
        .form-checkbox.text-red-500:checked { background-color: #ef4444; }
        .form-select {
            background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%2394a3b8' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e");
            background-position: right 0.5rem center;
            background-repeat: no-repeat;
            background-size: 1.5em 1.5em;
            padding-right: 2.5rem;
            -webkit-appearance: none;
            -moz-appearance: none;
            appearance: none;
            print-color-adjust: exact;
        }
        .animate-fade-in { animation: fade-in 0.3s ease-out forwards; }
        @keyframes fade-in { from { opacity: 0; transform: scale(0.98); } to { opacity: 1; transform: scale(1); } }
        @keyframes countdown-pulse {
            0% { transform: scale(1); opacity: 1; }
            80% { transform: scale(1.5); opacity: 0; }
            100% { transform: scale(1.5); opacity: 0; }
        }
      `}</style>
      <header className="text-center mb-6 sm:mb-8 md:mb-10">
        <h1 className="text-4xl sm:text-5xl font-bold text-white mb-1">LightsUp</h1>
        <h2 className="text-xl sm:text-2xl font-light text-yellow-400">Competitive</h2>
      </header>

      {gameState === GameState.IDLE && (
        <div className={`flex flex-col items-center justify-center text-center p-8 sm:p-10 bg-slate-800/50 rounded-2xl shadow-xl ${animationClass} relative`}>
          <div className="absolute top-4 right-4 flex items-center gap-2">
            <button onClick={() => setIsSeedModalVisible(true)} className="text-slate-400 hover:text-yellow-400 transition-colors" aria-label="Set Seed">
                <KeyIcon className="w-7 h-7" />
            </button>
            <button onClick={() => setIsPreferencesModalVisible(true)} className="text-slate-400 hover:text-yellow-400 transition-colors" aria-label="Settings">
                <CogIcon className="w-7 h-7" />
            </button>
            <button onClick={() => setIsHelpVisible(true)} className="text-slate-400 hover:text-yellow-400 transition-colors" aria-label="Help">
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
              <input type="checkbox" checked={isRandomMode} onChange={(e) => setIsRandomMode(e.target.checked)} className="form-checkbox bg-slate-700 border-slate-600 text-cyan-400 focus:ring-cyan-400 focus:ring-offset-slate-900" />
              Random Start
            </label>
            <label className="flex items-center gap-2 cursor-pointer text-slate-300 hover:text-white transition-colors" title="Game over if a board is idle for 10s">
              <input type="checkbox" checked={isHardMode} onChange={(e) => setIsHardMode(e.target.checked)} className="form-checkbox bg-slate-700 border-slate-600 text-red-500 focus:ring-red-500 focus:ring-offset-slate-900" />
              Hard Mode
            </label>
          </div>
          
          <div className="relative bg-slate-900/50 rounded-lg py-2 px-4 mb-8 w-64 text-center">
              <div className="flex items-center justify-center gap-3">
                  <div className="flex-1 text-center">
                      <p className="text-xs text-slate-400 uppercase font-semibold">Best Time</p>
                      {bestTime ? <TimerDisplay timeInMs={bestTime.time} className="text-white"/> : <span className="font-mono text-2xl text-slate-500">-:--.--</span>}
                  </div>
                  {bestTime && (
                      <button onClick={() => setIsClearMenuVisible(v => !v)} className="text-slate-500 hover:text-red-400 transition-colors p-1" title="Clear records">
                          <TrashIcon className="w-5 h-5" />
                      </button>
                  )}
              </div>
               {bestTime && bestTime.seed && (
                <div className="mt-1">
                  <p className="text-xs text-slate-500">
                      Seed: <span className={`font-mono truncate ${bestTime.isUserProvidedSeed ? 'text-yellow-400/70' : 'text-slate-400'}`} title={bestTime.seed}>{bestTime.seed}</span>
                  </p>
                </div>
              )}
              {isClearMenuVisible && (
                  <div className="absolute top-full mt-2 right-0 bg-slate-700 rounded-md shadow-lg p-2 flex flex-col gap-2 w-48 z-10">
                      <button onClick={handleClearCurrentRecord} className="text-left text-sm w-full px-3 py-1.5 rounded hover:bg-slate-600">Clear for this mode</button>
                      <button onClick={handleClearAllRecords} className="text-left text-sm w-full px-3 py-1.5 rounded hover:bg-red-500/50 text-red-400 hover:text-white">Clear all records</button>
                  </div>
              )}
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

          <a
            href="https://github.com/kyometori/lightsup-competitive"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-8 flex items-center gap-2 text-slate-500 hover:text-slate-300 transition-colors"
            aria-label="View source code on GitHub"
          >
            <GithubIcon className="w-5 h-5" />
            <span>Source Code</span>
          </a>
        </div>
      )}
      
      {gameState !== GameState.IDLE && (
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
            {isRandomMode && <span className="bg-cyan-500/20 text-cyan-300 text-xs font-semibold px-3 py-1 rounded-full">Random Start</span>}
            {isHardMode && <span className="bg-red-500/20 text-red-300 text-xs font-semibold px-3 py-1 rounded-full">Hard Mode</span>}
            {seed && <span className="bg-purple-500/20 text-purple-300 text-xs font-semibold px-3 py-1 rounded-full truncate max-w-[150px]" title={seed}>Seed: {seed}</span>}
          </div>

          <div className="flex justify-center items-center gap-4">
              <button onClick={startGame} className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors px-4 py-2 rounded-lg bg-slate-800/50 hover:bg-slate-700/80">
                  <RestartIcon className="w-5 h-5" />
                  Restart (R)
              </button>
              <button onClick={handleQuit} className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors px-4 py-2 rounded-lg bg-slate-800/50 hover:bg-slate-700/80">
                  <StopIcon className="w-5 h-5" />
                  Quit (Q)
              </button>
          </div>

          <section aria-labelledby="player-heading">
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
      )}
      
      {gameState === GameState.COUNTDOWN && (
        <div className={`fixed inset-0 bg-slate-900/80 flex items-center justify-center z-40 ${animationClass}`}>
          <div className="text-9xl font-bold text-white" style={preferences.showAnimations ? { animation: 'countdown-pulse 1s ease-out infinite' } : {}}>
              {countdownValue}
          </div>
        </div>
      )}

      {gameState === GameState.FINISHED && (
        <ResultsModal 
          finalTimes={boardTimers}
          totalClicks={boardClicks}
          onRestart={startGame}
          onQuit={handleQuit}
          gameModes={{ isRandom: isRandomMode, isHard: isHardMode }}
          previousBestTime={previousBestTimeRef.current}
          preferences={preferences}
          seed={activeGameSeed}
          isUserProvidedSeed={isUserSeeded}
        />
      )}
      {gameState === GameState.FAILED && (
        <FailureModal
          reason={failureReason}
          onRestart={startGame}
          onQuit={handleQuit}
          preferences={preferences}
        />
      )}
      {isHelpVisible && <HelpModal onClose={() => setIsHelpVisible(false)} preferences={preferences} />}
      {isPreferencesModalVisible && <PreferencesModal initialPreferences={preferences} onSave={handleSavePreferences} onClose={() => setIsPreferencesModalVisible(false)} />}
      {isSeedModalVisible && <SeedModal initialSeed={seed} onSave={setSeed} onClose={() => setIsSeedModalVisible(false)} preferences={preferences} />}
    </div>
  );
};

export default App;
