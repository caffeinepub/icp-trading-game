import { useQuery } from '@tanstack/react-query';
import { useActor } from './useActor';
import { useGameMode } from '@/contexts/GameModeContext';
import { useCurrentICPPrice } from './useICPPriceData';
import { LeveragedPosition, PositionType } from '@/backend';

interface PositionWithPnL extends LeveragedPosition {
  unrealizedPnL: number;
}

export function usePositions() {
  const { actor, isFetching: actorFetching } = useActor();
  const { gameMode } = useGameMode();
  const { data: currentPrice = 0 } = useCurrentICPPrice();

  return useQuery<PositionWithPnL[]>({
    queryKey: ['positions', gameMode, currentPrice],
    queryFn: async () => {
      if (!actor) return [];
      
      const positions = await actor.getOpenPositions(gameMode);
      
      // Calculate unrealized P&L for each position
      return positions.map(position => {
        const isLong = position.positionType === PositionType.long_;
        
        const priceDifference = isLong 
          ? currentPrice - position.entryPrice 
          : position.entryPrice - currentPrice;
        
        const unrealizedPnL = priceDifference * position.amountICP * position.leverage;
        
        return {
          ...position,
          unrealizedPnL,
        };
      });
    },
    enabled: !!actor && !actorFetching && currentPrice > 0,
    refetchInterval: 10000, // Refetch every 10 seconds for real-time P&L updates
  });
}
