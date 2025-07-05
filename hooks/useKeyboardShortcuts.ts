import { useEffect } from 'react';
import { GameState } from '../types.ts';

interface ShortcutProps {
    gameState: GameState;
    isHelpVisible: boolean;
    isPreferencesModalVisible: boolean;
    isSeedModalVisible: boolean;
    onStartGame: () => void;
    onRestartGame: () => void;
    onQuitGame: () => void;
    onCopyResults: () => void;
    onShowHelp: () => void;
    onShowPreferences: () => void;
    onShowSeedModal: () => void;
}

export const useKeyboardShortcuts = ({
    gameState,
    isHelpVisible,
    isPreferencesModalVisible,
    isSeedModalVisible,
    onStartGame,
    onRestartGame,
    onQuitGame,
    onCopyResults,
    onShowHelp,
    onShowPreferences,
    onShowSeedModal,
}: ShortcutProps) => {
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            const activeElement = document.activeElement;
            const isInputFocused = activeElement?.tagName === 'INPUT' || activeElement?.tagName === 'SELECT';
            if (isInputFocused) {
                return;
            }

            const isSubModalOpen = isHelpVisible || isPreferencesModalVisible || isSeedModalVisible;
            if (isSubModalOpen) {
                return;
            }

            switch (gameState) {
                case GameState.IDLE:
                    if (e.code === 'Space') {
                        e.preventDefault();
                        onStartGame();
                    } else if (e.code === 'KeyH') {
                        e.preventDefault();
                        onShowHelp();
                    } else if (e.code === 'KeyP') {
                        e.preventDefault();
                        onShowPreferences();
                    } else if (e.code === 'KeyS') {
                        e.preventDefault();
                        onShowSeedModal();
                    }
                    break;
                case GameState.PLAYING:
                case GameState.COUNTDOWN:
                    if (e.code === 'KeyR') {
                        e.preventDefault();
                        onRestartGame();
                    } else if (e.code === 'KeyQ') {
                        e.preventDefault();
                        onQuitGame();
                    }
                    break;
                case GameState.FINISHED:
                    if (e.code === 'KeyR') {
                        e.preventDefault();
                        onRestartGame();
                    } else if (e.code === 'KeyQ') {
                        e.preventDefault();
                        onQuitGame();
                    } else if (e.code === 'KeyC' && !e.metaKey && !e.ctrlKey) {
                        e.preventDefault();
                        onCopyResults();
                    }
                    break;
                case GameState.FAILED:
                    if (e.code === 'KeyR') {
                        e.preventDefault();
                        onRestartGame();
                    } else if (e.code === 'KeyQ') {
                        e.preventDefault();
                        onQuitGame();
                    }
                    break;
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [
        gameState,
        isHelpVisible,
        isPreferencesModalVisible,
        isSeedModalVisible,
        onStartGame,
        onRestartGame,
        onQuitGame,
        onCopyResults,
        onShowHelp,
        onShowPreferences,
        onShowSeedModal,
    ]);
};
