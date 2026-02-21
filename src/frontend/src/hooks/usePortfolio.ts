import { useQuery } from '@tanstack/react-query';
import { useActor } from './useActor';
import { useICPPriceData } from './useICPPriceData';

export function usePortfolio() {
  const { actor, isFetching: actorFetching } = useActor();
  const { data: priceData } = useICPPriceData('1h');
  const currentPrice = priceData?.currentPrice || 0;

  return useQuery({
    queryKey: ['portfolio'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      
      try {
        const account = await actor.getOrCreateAccount();
        
        const icpValue = account.icpBalance * currentPrice;
        const totalValue = account.cashBalance + icpValue;
        const realizedPnL = totalValue - 10000;

        return {
          cashBalance: account.cashBalance,
          icpHoldings: account.icpBalance,
          icpValue,
          totalValue,
          realizedPnL,
        };
      } catch (error: any) {
        console.error('Portfolio fetch error:', error);
        throw error;
      }
    },
    enabled: !!actor && !actorFetching && currentPrice > 0,
    refetchInterval: 10000,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 5000),
  });
}
