import React, { useState, useEffect, useRef } from 'react';
import { GameState, UserPreferences } from './types.ts';
import { useGameEngine } from './hooks/useGameEngine.ts';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts.ts';
import ResultsModal, { ResultsModalRef } from './components/ResultsModal.tsx';
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
  const resultsModalRef = useRef<ResultsModalRef>(null);

  useKeyboardShortcuts({
    gameState: game.gameState,
    isHelpVisible,
    isPreferencesModalVisible,
    isSeedModalVisible,
    onStartGame: game.startGame,
    onRestartGame: game.startGame,
    onQuitGame: game.quitGame,
    onCopyResults: () => resultsModalRef.current?.handleCopy(),
    onShowHelp: () => setIsHelpVisible(true),
    onShowPreferences: () => setIsPreferencesModalVisible(true),
    onShowSeedModal: () => setIsSeedModalVisible(true),
  });
  
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
          ref={resultsModalRef}
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