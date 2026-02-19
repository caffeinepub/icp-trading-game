import { useQuery } from '@tanstack/react-query';
import { useActor } from './useActor';
import { useGameMode } from '@/contexts/GameModeContext';
import { useCurrentICPPrice } from './useICPPriceData';
import { useInternetIdentity } from './useInternetIdentity';
import { usePositions } from './usePositions';

export interface Portfolio {
  cashBalance: number;
  icpBalance: number;
  icpValue: number;
  totalMarginLocked: number;
  totalUnrealizedPnL: number;
  totalValue: number;
  profitLoss: number;
}

export function usePortfolio() {
  const { actor, isFetching: actorFetching } = useActor();
  const { gameMode } = useGameMode();
  const { data: currentPrice = 0 } = useCurrentICPPrice();
  const { identity } = useInternetIdentity();
  const { data: positions = [] } = usePositions();

  const query = useQuery<Portfolio | null>({
    queryKey: ['portfolio', gameMode, currentPrice, positions.length],
    queryFn: async () => {
      if (!actor || !identity) return null;
      
      const principal = identity.getPrincipal();
      const account = await actor.getAccount(gameMode, principal);
      
      if (!account) return null;

      const icpValue = account.icpBalance * currentPrice;
      
      // Calculate total margin locked and unrealized P&L from positions
      const totalMarginLocked = positions.reduce((sum, pos) => sum + pos.margin, 0);
      const totalUnrealizedPnL = positions.reduce((sum, pos) => sum + pos.unrealizedPnL, 0);
      
      // Total portfolio value includes cash, ICP value, margin locked, and unrealized P&L
      const totalValue = account.cashBalance + icpValue + totalMarginLocked + totalUnrealizedPnL;
      const profitLoss = totalValue - 10000;

      return {
        cashBalance: account.cashBalance,
        icpBalance: account.icpBalance,
        icpValue,
        totalMarginLocked,
        totalUnrealizedPnL,
        totalValue,
        profitLoss,
      };
    },
    enabled: !!actor && !actorFetching && !!identity,
    refetchInterval: 30000,
  });

  return {
    portfolio: query.data,
    isLoading: actorFetching || query.isLoading,
    error: query.error,
  };
}
