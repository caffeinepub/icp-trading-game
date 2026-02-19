import { useGetLeaderboard } from './useQueries';
import { useCurrentICPPrice } from './useICPPriceData';
import { useGameMode } from '@/contexts/GameModeContext';

interface LeaderboardEntry {
  principal: string;
  cashBalance: number;
  icpBalance: number;
  totalValue: number;
  profitLoss: number;
}

export function useLeaderboard() {
  const { gameMode } = useGameMode();
  const { data: leaderboard, isLoading: isLoadingLeaderboard, error } = useGetLeaderboard(gameMode);
  const { data: currentPrice = 0, isLoading: isLoadingPrice } = useCurrentICPPrice();

  const isLoading = isLoadingLeaderboard || isLoadingPrice;

  if (isLoading || error || !leaderboard) {
    return { leaderboard: null, isLoading, error };
  }

  // Calculate total value and profit/loss for each player
  const processedLeaderboard: LeaderboardEntry[] = leaderboard.map(([principal, account]) => {
    const totalValue = account.cashBalance + (account.icpBalance * currentPrice);
    const profitLoss = totalValue - 10000;

    return {
      principal: principal.toString(),
      cashBalance: account.cashBalance,
      icpBalance: account.icpBalance,
      totalValue,
      profitLoss,
    };
  });

  // Sort by profit/loss in descending order
  processedLeaderboard.sort((a, b) => b.profitLoss - a.profitLoss);

  return { leaderboard: processedLeaderboard, isLoading: false, error: null };
}
