import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { GameMode } from '../types/game';

interface GameModeContextType {
  gameMode: GameMode;
  setGameMode: (mode: GameMode) => void;
}

const GameModeContext = createContext<GameModeContextType | undefined>(undefined);

const STORAGE_KEY = 'icp-trading-game-mode';

export function GameModeProvider({ children }: { children: ReactNode }) {
  const [gameMode, setGameModeState] = useState<GameMode>(() => {
    // Initialize from localStorage
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored && Object.values(GameMode).includes(stored as GameMode)) {
        return stored as GameMode;
      }
    }
    return GameMode.daily;
  });

  const setGameMode = (mode: GameMode) => {
    setGameModeState(mode);
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, mode);
    }
  };

  return (
    <GameModeContext.Provider value={{ gameMode, setGameMode }}>
      {children}
    </GameModeContext.Provider>
  );
}

export function useGameMode() {
  const context = useContext(GameModeContext);
  if (context === undefined) {
    throw new Error('useGameMode must be used within a GameModeProvider');
  }
  return context;
}
