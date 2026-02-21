import { useQuery } from '@tanstack/react-query';
import { useActor } from './useActor';
import { useGameMode } from '@/contexts/GameModeContext';
import { useInternetIdentity } from './useInternetIdentity';
import { LedgerTransaction } from '@/backend';

export type Transaction = LedgerTransaction;

export function useTransactionHistory() {
  const { actor, isFetching: actorFetching } = useActor();
  const { gameMode } = useGameMode();
  const { identity } = useInternetIdentity();

  const query = useQuery<Transaction[]>({
    queryKey: ['transactionHistory', gameMode],
    queryFn: async () => {
      if (!actor || !identity) return [];
      
      try {
        // Fetch real transaction history from backend
        const transactions = await actor.getTransactionHistory();
        return transactions;
      } catch (error) {
        console.error('Failed to fetch transaction history:', error);
        return [];
      }
    },
    enabled: !!actor && !actorFetching && !!identity,
    refetchInterval: 30000,
  });

  return {
    transactions: query.data || [],
    isLoading: actorFetching || query.isLoading,
    error: query.error,
  };
}
