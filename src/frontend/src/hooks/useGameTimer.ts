import { useState, useEffect } from 'react';
import { GameMode } from '../backend';

interface TimeRemaining {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  totalSeconds: number;
}

function getNextResetTime(mode: GameMode): Date {
  const now = new Date();
  let nextReset = new Date();

  switch (mode) {
    case GameMode.daily:
      // Next midnight UTC
      nextReset.setUTCHours(24, 0, 0, 0);
      break;
    case GameMode.weekly:
      // Next Monday at midnight UTC
      const daysUntilMonday = (8 - now.getUTCDay()) % 7 || 7;
      nextReset.setUTCDate(now.getUTCDate() + daysUntilMonday);
      nextReset.setUTCHours(0, 0, 0, 0);
      break;
    case GameMode.monthly:
      // First day of next month at midnight UTC
      nextReset.setUTCMonth(now.getUTCMonth() + 1, 1);
      nextReset.setUTCHours(0, 0, 0, 0);
      break;
    case GameMode.yearly:
      // January 1st of next year at midnight UTC
      nextReset.setUTCFullYear(now.getUTCFullYear() + 1, 0, 1);
      nextReset.setUTCHours(0, 0, 0, 0);
      break;
  }

  return nextReset;
}

function calculateTimeRemaining(targetDate: Date): TimeRemaining {
  const now = new Date();
  const totalSeconds = Math.max(0, Math.floor((targetDate.getTime() - now.getTime()) / 1000));

  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return { days, hours, minutes, seconds, totalSeconds };
}

export function useGameTimer(mode: GameMode): TimeRemaining {
  const [timeRemaining, setTimeRemaining] = useState<TimeRemaining>(() => {
    const nextReset = getNextResetTime(mode);
    return calculateTimeRemaining(nextReset);
  });

  useEffect(() => {
    const nextReset = getNextResetTime(mode);
    
    const updateTimer = () => {
      const remaining = calculateTimeRemaining(nextReset);
      setTimeRemaining(remaining);

      // If timer expired, recalculate next reset
      if (remaining.totalSeconds === 0) {
        const newNextReset = getNextResetTime(mode);
        setTimeRemaining(calculateTimeRemaining(newNextReset));
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [mode]);

  return timeRemaining;
}
