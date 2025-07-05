import { useState, useEffect, useCallback, useRef } from 'react';
import { BoardState, GameState, UserPreferences, BestTimeRecord, GameModes } from '../types.ts';
import { createInitialBoard, generateSolvableBoard, areBoardsEqual, toggleCellAndNeighbors, createSeededPRNG } from '../utils/board.ts';
import { getBestTime, saveBestTime, clearBestTime, clearAllBestTimes, getUserPreferences, saveUserPreferences } from '../utils/storage.ts';

const NUM_BOARDS = 3;
const HARD_MODE_IDLE_SECONDS = 10;

export const useGameEngine = () => {
  const [gameState, setGameState] = useState<GameState>(GameState.IDLE);
  
  // Game config state
  const [gameModes, setGameModes] = useState<GameModes>({ isRandom: false, isHard: false });
  const [bestTime, setBestTime] = useState<BestTimeRecord | null>(null);
  const [preferences, setPreferences] = useState<UserPreferences>(() => getUserPreferences());
  const [seed, setSeed] = useState<string>(''); // User-defined seed
  
  // Game instance state
  const [activeGameSeed, setActiveGameSeed] = useState<string>(''); // Seed for the current game instance
  const [isUserSeeded, setIsUserSeeded] = useState<boolean>(false); // Was the seed user-provided?
  const [targetBoards, setTargetBoards] = useState<BoardState[]>([]);
  const [playerBoards, setPlayerBoards] = useState<BoardState[]>(() => Array(NUM_BOARDS).fill(createInitialBoard(false)));
  const [boardSolved, setBoardSolved] = useState<boolean[]>(Array(NUM_BOARDS).fill(false));
  const [boardTimers, setBoardTimers] = useState<number[]>(Array(NUM_BOARDS).fill(0));
  const [finalBoardTimers, setFinalBoardTimers] = useState<number[] | null>(null);
  const [boardClicks, setBoardClicks] = useState<number[]>(Array(NUM_BOARDS).fill(0));
  const [lastInteractionTime, setLastInteractionTime] = useState<number[]>([]);
  const [failureReason, setFailureReason] = useState<string>('');
  const [countdownValue, setCountdownValue] = useState<number>(preferences.countdownSeconds);

  const lastUpdateTimeRef = useRef<number>(0);
  const previousBestTimeRef = useRef<BestTimeRecord | null>(null);

  const resetForNewGame = useCallback(() => {
    setTargetBoards([]);
    setPlayerBoards(Array(NUM_BOARDS).fill(createInitialBoard(false)));
    setBoardSolved(Array(NUM_BOARDS).fill(false));
    setBoardTimers(Array(NUM_BOARDS).fill(0));
    setFinalBoardTimers(null);
    setBoardClicks(Array(NUM_BOARDS).fill(0));
    setFailureReason('');
    setLastInteractionTime([]);
    setActiveGameSeed('');
    setIsUserSeeded(false);
  }, []);

  const startGame = useCallback(() => {
    previousBestTimeRef.current = getBestTime(gameModes);
    resetForNewGame();

    const isUserProvided = !!seed;
    const gameSeed = seed || Math.random().toString(36).substring(2, 10).toUpperCase();
    setActiveGameSeed(gameSeed);
    setIsUserSeeded(isUserProvided);

    const prng = createSeededPRNG(gameSeed);
    const newTargetBoards = Array(NUM_BOARDS).fill(null).map(() => generateSolvableBoard(prng));
    setTargetBoards(newTargetBoards);

    if (gameModes.isRandom) {
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
      if (gameModes.isHard) {
        setLastInteractionTime(Array(NUM_BOARDS).fill(performance.now()));
      }
    }
  }, [gameModes, resetForNewGame, preferences, seed]);
  
  const quitGame = useCallback(() => {
      setGameState(GameState.IDLE);
      resetForNewGame();
  }, [resetForNewGame]);
  
  const handleSavePreferences = (newPrefs: UserPreferences) => {
    setPreferences(newPrefs);
    saveUserPreferences(newPrefs);
  };

  const updateBestTimeDisplay = useCallback(() => {
      const record = getBestTime(gameModes);
      setBestTime(record);
  }, [gameModes]);

  const handleClearCurrentRecord = () => {
    clearBestTime(gameModes);
    updateBestTimeDisplay();
  }
  
  const handleClearAllRecords = () => {
    clearAllBestTimes();
    updateBestTimeDisplay();
  }

  useEffect(() => {
    if (gameState === GameState.IDLE) {
      updateBestTimeDisplay();
    }
  }, [gameModes, gameState, updateBestTimeDisplay]);

  useEffect(() => {
    if (gameState !== GameState.COUNTDOWN) return;
    const timerId = setInterval(() => {
      setCountdownValue(prev => {
        const nextValue = prev - 1;
        if (nextValue === 0) {
          clearInterval(timerId);
          if (gameModes.isHard) {
            setLastInteractionTime(Array(NUM_BOARDS).fill(performance.now()));
          }
          setGameState(GameState.PLAYING);
        }
        return nextValue;
      });
    }, 1000);
    return () => clearInterval(timerId);
  }, [gameState, gameModes.isHard]);
  
  const handleCellClick = useCallback((boardIndex: number, row: number, col: number) => {
    if (gameState !== GameState.PLAYING || boardSolved[boardIndex]) return;

    if (gameModes.isHard) {
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
  }, [gameState, boardSolved, gameModes.isHard]);

  useEffect(() => {
    if (gameState !== GameState.PLAYING) return;

    const newSolvedBoards = playerBoards.map((pBoard, i) => {
      return boardSolved[i] || areBoardsEqual(pBoard, targetBoards[i]);
    });

    const changed = newSolvedBoards.some((s, i) => s !== boardSolved[i]);
    if (changed) {
        setBoardSolved(newSolvedBoards);
    }
    
    if (newSolvedBoards.every(s => s)) {
        setFinalBoardTimers(boardTimers);
        setGameState(GameState.FINISHED);
    }
  }, [playerBoards, targetBoards, gameState, boardSolved, boardTimers]);

  useEffect(() => {
    if (gameState === GameState.FINISHED && finalBoardTimers) {
      const totalSolveTime = finalBoardTimers.reduce((sum, time) => sum + time, 0);
      saveBestTime(totalSolveTime, gameModes, activeGameSeed, isUserSeeded);
    }
  }, [gameState, finalBoardTimers, gameModes, activeGameSeed, isUserSeeded]);

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

        if (gameModes.isHard) {
            const idleTimeLimit = HARD_MODE_IDLE_SECONDS * 1000;
            for(let i = 0; i < NUM_BOARDS; i++) {
                if (!boardSolved[i] && (now - lastInteractionTime[i] > idleTimeLimit)) {
                    setFailureReason(`Board ${i + 1} was idle for over ${HARD_MODE_IDLE_SECONDS} seconds.`);
                    setGameState(GameState.FAILED);
                    return;
                }
            }
        }
        animationFrameId = requestAnimationFrame(tick);
      };
      animationFrameId = requestAnimationFrame(tick);
    }
    return () => cancelAnimationFrame(animationFrameId);
  }, [gameState, boardSolved, gameModes.isHard, lastInteractionTime]);
  
  return {
    gameState,
    gameModes,
    preferences,
    seed,
    activeGameSeed,
    isUserSeeded,
    targetBoards,
    playerBoards,
    boardSolved,
    boardTimers: finalBoardTimers ?? boardTimers,
    boardClicks,
    failureReason,
    countdownValue,
    bestTime,
    previousBestTime: previousBestTimeRef.current,
    startGame,
    quitGame,
    handleCellClick,
    setGameModes: {
      setIsRandomMode: (value: boolean) => setGameModes(p => ({ ...p, isRandom: value })),
      setIsHardMode: (value: boolean) => setGameModes(p => ({ ...p, isHard: value })),
    },
    setPreferences: handleSavePreferences,
    setSeed,
    clearBestTimeForCurrentMode: handleClearCurrentRecord,
    clearAllBestTimes: handleClearAllRecords,
  };
};