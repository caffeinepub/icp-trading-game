import { useQuery } from '@tanstack/react-query';
import { useActor } from './useActor';
import { useICPPriceData } from './useICPPriceData';
import { useGameMode } from '@/contexts/GameModeContext';

export interface LeaderboardEntry {
  principal: string;
  name: string;
  totalValue: number;
  profitLoss: number;
  profitLossPercentage: number;
  rank: number;
}

export function useLeaderboard() {
  const { actor, isFetching: actorFetching } = useActor();
  const { gameMode } = useGameMode();
  const { data: priceData } = useICPPriceData('1h');
  const currentPrice = priceData?.currentPrice || 0;

  const query = useQuery<LeaderboardEntry[]>({
    queryKey: ['leaderboard', gameMode, currentPrice],
    queryFn: async () => {
      if (!actor) return [];
      
      try {
        // Backend doesn't support leaderboard yet
        // Return empty array for now
        return [];
      } catch (error) {
        console.error('Failed to fetch leaderboard:', error);
        return [];
      }
    },
    enabled: !!actor && !actorFetching && currentPrice > 0,
    refetchInterval: 30000,
  });

  return {
    leaderboard: query.data || [],
    isLoading: actorFetching || query.isLoading,
    error: query.error,
  };
}
