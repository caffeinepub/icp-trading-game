import { useState, useEffect } from 'react';
import { GameMode } from '../types/game';

interface TimeRemaining {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  total: number;
}

export function useGameTimer(gameMode: GameMode): TimeRemaining {
  const [timeRemaining, setTimeRemaining] = useState<TimeRemaining>(() => 
    calculateTimeRemaining(gameMode)
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeRemaining(calculateTimeRemaining(gameMode));
    }, 1000);

    return () => clearInterval(interval);
  }, [gameMode]);

  return timeRemaining;
}

function calculateTimeRemaining(gameMode: GameMode): TimeRemaining {
  const now = new Date();
  let nextReset: Date;

  switch (gameMode) {
    case GameMode.daily:
      nextReset = new Date(now);
      nextReset.setUTCHours(24, 0, 0, 0);
      break;
    case GameMode.weekly:
      nextReset = new Date(now);
      const daysUntilMonday = (8 - now.getUTCDay()) % 7 || 7;
      nextReset.setUTCDate(now.getUTCDate() + daysUntilMonday);
      nextReset.setUTCHours(0, 0, 0, 0);
      break;
    case GameMode.monthly:
      nextReset = new Date(now);
      nextReset.setUTCMonth(now.getUTCMonth() + 1, 1);
      nextReset.setUTCHours(0, 0, 0, 0);
      break;
    case GameMode.yearly:
      nextReset = new Date(now);
      nextReset.setUTCFullYear(now.getUTCFullYear() + 1, 0, 1);
      nextReset.setUTCHours(0, 0, 0, 0);
      break;
    default:
      nextReset = new Date(now);
      nextReset.setUTCHours(24, 0, 0, 0);
  }

  const total = Math.max(0, nextReset.getTime() - now.getTime());
  const seconds = Math.floor((total / 1000) % 60);
  const minutes = Math.floor((total / 1000 / 60) % 60);
  const hours = Math.floor((total / (1000 * 60 * 60)) % 24);
  const days = Math.floor(total / (1000 * 60 * 60 * 24));

  return { days, hours, minutes, seconds, total };
}
