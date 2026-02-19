import { useGetLeaderboard } from './useQueries';
import { useCurrentICPPrice } from './useICPPriceData';
import { useInternetIdentity } from './useInternetIdentity';
import { useGameMode } from '@/contexts/GameModeContext';

interface Portfolio {
  cashBalance: number;
  icpBalance: number;
  icpValue: number;
  totalValue: number;
}

export function usePortfolio() {
  const { identity } = useInternetIdentity();
  const { gameMode } = useGameMode();
  const { data: leaderboard, isLoading: isLoadingLeaderboard, error: leaderboardError } = useGetLeaderboard(gameMode);
  const { data: currentPrice = 0, isLoading: isLoadingPrice } = useCurrentICPPrice();

  const isLoading = isLoadingLeaderboard || isLoadingPrice;
  const error = leaderboardError;

  if (!identity || isLoading || error) {
    return { portfolio: null, isLoading, error };
  }

  const userPrincipal = identity.getPrincipal().toString();
  const userAccount = leaderboard?.find(([principal]) => principal.toString() === userPrincipal);

  if (!userAccount) {
    return { portfolio: null, isLoading: false, error: null };
  }

  const [, account] = userAccount;
  const icpValue = account.icpBalance * currentPrice;
  const totalValue = account.cashBalance + icpValue;

  const portfolio: Portfolio = {
    cashBalance: account.cashBalance,
    icpBalance: account.icpBalance,
    icpValue,
    totalValue,
  };

  return { portfolio, isLoading: false, error: null };
}
