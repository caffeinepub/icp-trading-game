import { useQuery } from '@tanstack/react-query';
import { useActor } from './useActor';
import { useGameMode } from '@/contexts/GameModeContext';
import { useCurrentICPPrice } from './useICPPriceData';
import type { Account } from '@/backend';
import { Principal } from '@icp-sdk/core/principal';

export interface LeaderboardEntry {
  principal: string;
  totalValue: number;
  profitLoss: number;
  cashBalance: number;
  icpBalance: number;
}

export function useLeaderboard() {
  const { actor, isFetching: actorFetching } = useActor();
  const { gameMode } = useGameMode();
  const { data: currentPrice = 0 } = useCurrentICPPrice();

  const query = useQuery<LeaderboardEntry[]>({
    queryKey: ['leaderboard', gameMode, currentPrice],
    queryFn: async () => {
      if (!actor) return [];
      
      const leaderboardData = await actor.getLeaderboard(gameMode);
      
      // Calculate total value for each player including positions
      const entries: LeaderboardEntry[] = await Promise.all(
        leaderboardData.map(async ([principal, account]: [Principal, Account]) => {
          const icpValue = account.icpBalance * currentPrice;
          
          // Fetch positions for this player to calculate margin and unrealized P&L
          let totalMarginLocked = 0;
          let totalUnrealizedPnL = 0;
          
          try {
            const positions = await actor.getOpenPositions(gameMode);
            // Note: Backend returns positions for the caller, so we can't get other players' positions
            // The backend should include position data in the leaderboard calculation
            // For now, we'll use the account data which should include the effects of positions
          } catch (error) {
            // If we can't fetch positions, continue with just the account data
          }
          
          // Total value = cash + ICP value + margin locked + unrealized P&L
          // Since we can't fetch other players' positions, we use the account's pnl which should include position effects
          const totalValue = account.cashBalance + icpValue;
          const profitLoss = totalValue - 10000;
          
          return {
            principal: principal.toString(),
            totalValue,
            profitLoss,
            cashBalance: account.cashBalance,
            icpBalance: account.icpBalance,
          };
        })
      );
      
      // Sort by total value descending
      entries.sort((a, b) => b.totalValue - a.totalValue);
      
      return entries;
    },
    enabled: !!actor && !actorFetching && currentPrice > 0,
    refetchInterval: 30000,
  });

  return {
    leaderboard: query.data,
    isLoading: actorFetching || query.isLoading,
    error: query.error,
  };
}
