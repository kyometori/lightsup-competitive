import React, { useState, useEffect } from 'react';
import { GameState, UserPreferences } from './types.ts';
import { useGameEngine } from './hooks/useGameEngine.ts';
import ResultsModal from './components/ResultsModal.tsx';
import FailureModal from './components/FailureModal.tsx';
import HelpModal from './components/HelpModal.tsx';
import PreferencesModal from './components/PreferencesModal.tsx';
import SeedModal from './components/SeedModal.tsx';
import IdleScene from './scenes/IdleScene.tsx';
import GameScene from './scenes/GameScene.tsx';
import CountdownScene from './scenes/CountdownScene.tsx';
import { GithubIcon } from './components/icons.tsx';

const App: React.FC = () => {
  const game = useGameEngine();
  const [isHelpVisible, setIsHelpVisible] = useState<boolean>(false);
  const [isPreferencesModalVisible, setIsPreferencesModalVisible] = useState<boolean>(false);
  const [isSeedModalVisible, setIsSeedModalVisible] = useState<boolean>(false);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Escape key closes any open modal. This has top priority.
      if (e.code === 'Escape') {
        if (isHelpVisible) {
          e.preventDefault();
          setIsHelpVisible(false);
        }
        if (isPreferencesModalVisible) {
          e.preventDefault();
          setIsPreferencesModalVisible(false);
        }
        if (isSeedModalVisible) {
          e.preventDefault();
          setIsSeedModalVisible(false);
        }
        return;
      }

      // Don't trigger shortcuts if a text input/select is focused.
      // This is crucial for the Seed Modal input and Preferences select.
      const activeElement = document.activeElement;
      const isInputFocused = activeElement?.tagName === 'INPUT' || activeElement?.tagName === 'SELECT';
      if (isInputFocused) {
        return;
      }

      // Don't trigger other shortcuts if a modal is already open.
      const isModalOpen = isHelpVisible || isPreferencesModalVisible || isSeedModalVisible;
      if (isModalOpen) return;
      
      // Game state specific shortcuts
      switch (game.gameState) {
        case GameState.IDLE:
          if (e.code === 'Space') {
            e.preventDefault();
            game.startGame();
          } else if (e.code === 'KeyH') {
            e.preventDefault();
            setIsHelpVisible(true);
          } else if (e.code === 'KeyP') {
            e.preventDefault();
            setIsPreferencesModalVisible(true);
          } else if (e.code === 'KeyS') {
            e.preventDefault();
            setIsSeedModalVisible(true);
          }
          break;
        case GameState.PLAYING:
        case GameState.COUNTDOWN:
          if (e.code === 'KeyR') {
            e.preventDefault();
            game.startGame(); // Restart
          } else if (e.code === 'KeyQ') {
            e.preventDefault();
            game.quitGame();
          }
          break;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [game, isHelpVisible, isPreferencesModalVisible, isSeedModalVisible]);
  
  const handleSavePreferences = (newPrefs: UserPreferences) => {
    game.setPreferences(newPrefs);
    setIsPreferencesModalVisible(false);
  };
  
  const handleSaveSeed = (newSeed: string) => {
    game.setSeed(newSeed);
    setIsSeedModalVisible(false);
  };

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

      {game.gameState === GameState.IDLE ? (
        <IdleScene
          gameModes={game.gameModes}
          setGameModes={game.setGameModes}
          bestTime={game.bestTime}
          startGame={game.startGame}
          seed={game.seed}
          onShowHelp={() => setIsHelpVisible(true)}
          onShowPreferences={() => setIsPreferencesModalVisible(true)}
          onShowSeedModal={() => setIsSeedModalVisible(true)}
          onClearCurrentRecord={game.clearBestTimeForCurrentMode}
          onClearAllRecords={game.clearAllBestTimes}
          showAnimations={game.preferences.showAnimations}
        />
      ) : (
        <GameScene
          game={game}
        />
      )}

      {game.gameState === GameState.COUNTDOWN && (
        <CountdownScene
          countdownValue={game.countdownValue}
          showAnimations={game.preferences.showAnimations}
        />
      )}

      {game.gameState === GameState.FINISHED && (
        <ResultsModal 
          finalTimes={game.boardTimers}
          totalClicks={game.boardClicks}
          onRestart={game.startGame}
          onQuit={game.quitGame}
          gameModes={game.gameModes}
          previousBestTime={game.previousBestTime}
          preferences={game.preferences}
          seed={game.activeGameSeed}
          isUserProvidedSeed={game.isUserSeeded}
        />
      )}
      {game.gameState === GameState.FAILED && (
        <FailureModal
          reason={game.failureReason}
          onRestart={game.startGame}
          onQuit={game.quitGame}
          preferences={game.preferences}
        />
      )}
      {isHelpVisible && <HelpModal onClose={() => setIsHelpVisible(false)} preferences={game.preferences} />}
      {isPreferencesModalVisible && <PreferencesModal initialPreferences={game.preferences} onSave={handleSavePreferences} onClose={() => setIsPreferencesModalVisible(false)} />}
      {isSeedModalVisible && <SeedModal initialSeed={game.seed} onSave={handleSaveSeed} onClose={() => setIsSeedModalVisible(false)} preferences={game.preferences} />}
    
      {game.gameState === GameState.IDLE && (
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
      )}
    </div>
  );
};

export default App;