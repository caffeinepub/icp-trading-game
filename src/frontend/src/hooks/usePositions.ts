import { useQuery } from '@tanstack/react-query';
import { useActor } from './useActor';
import { useICPPriceData } from './useICPPriceData';
import { useGameMode } from '@/contexts/GameModeContext';
import { useInternetIdentity } from './useInternetIdentity';

export interface Position {
  positionType: 'long' | 'short';
  leverage: number;
  entryPrice: number;
  amountICP: number;
  margin: number;
  openedAt: bigint;
  isOpen: boolean;
  liquidationPrice: number;
  unrealizedPnL: number;
  currentPrice: number;
}

export function usePositions() {
  const { actor, isFetching: actorFetching } = useActor();
  const { gameMode } = useGameMode();
  const { data: priceData } = useICPPriceData('1h');
  const currentPrice = priceData?.currentPrice || 0;
  const { identity } = useInternetIdentity();

  const query = useQuery<Position[]>({
    queryKey: ['positions', gameMode, currentPrice],
    queryFn: async () => {
      if (!actor || !identity) return [];
      
      try {
        // Backend doesn't support leverage positions yet
        // Return empty array for now
        return [];
      } catch (error) {
        console.error('Failed to fetch positions:', error);
        return [];
      }
    },
    enabled: !!actor && !actorFetching && !!identity && currentPrice > 0,
    refetchInterval: 10000,
  });

  return {
    positions: query.data || [],
    isLoading: actorFetching || query.isLoading,
    error: query.error,
  };
}
