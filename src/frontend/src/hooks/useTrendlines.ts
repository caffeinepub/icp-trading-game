import { useState } from 'react';

export interface Trendline {
  id: string;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
}

export function useTrendlines() {
  const [trendlines, setTrendlines] = useState<Trendline[]>([]);

  const addTrendline = (trendline: Omit<Trendline, 'id'>) => {
    const newTrendline: Trendline = {
      ...trendline,
      id: `trendline-${Date.now()}-${Math.random()}`,
    };
    setTrendlines(prev => [...prev, newTrendline]);
  };

  const removeTrendline = (id: string) => {
    setTrendlines(prev => prev.filter(t => t.id !== id));
  };

  const clearAllTrendlines = () => {
    setTrendlines([]);
  };

  return {
    trendlines,
    addTrendline,
    removeTrendline,
    clearAllTrendlines,
  };
}
