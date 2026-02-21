import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';

function parseBackendError(error: any): string {
  const errorMessage = error?.message || String(error);
  
  // Check for authorization/registration errors
  if (errorMessage.includes('Unauthorized') || errorMessage.includes('Only users can')) {
    return 'Account setup required. Please wait a moment and try again.';
  }
  
  // Check for insufficient balance errors
  if (errorMessage.includes('Insufficient cash balance')) {
    return 'Insufficient cash balance for this purchase.';
  }
  
  if (errorMessage.includes('Insufficient ICP balance')) {
    return 'Insufficient ICP balance for this sale.';
  }
  
  // Generic error
  return errorMessage || 'Transaction failed. Please try again.';
}

export function useBuyICP() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (amountUSD: number) => {
      if (!actor) throw new Error('Connection not ready. Please wait a moment.');
      
      // Ensure account exists before trading
      try {
        await actor.getOrCreateAccount();
      } catch (error: any) {
        throw new Error(parseBackendError(error));
      }
      
      await actor.buyICP(amountUSD);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['balance'] });
      queryClient.invalidateQueries({ queryKey: ['portfolio'] });
      queryClient.invalidateQueries({ queryKey: ['transactionHistory'] });
    },
    onError: (error: any) => {
      console.error('Buy ICP error:', error);
    },
    retry: 1,
    retryDelay: 1000,
  });
}

export function useSellICP() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (amountICP: number) => {
      if (!actor) throw new Error('Connection not ready. Please wait a moment.');
      
      // Ensure account exists before trading
      try {
        await actor.getOrCreateAccount();
      } catch (error: any) {
        throw new Error(parseBackendError(error));
      }
      
      await actor.sellICP(amountICP);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['balance'] });
      queryClient.invalidateQueries({ queryKey: ['portfolio'] });
      queryClient.invalidateQueries({ queryKey: ['transactionHistory'] });
    },
    onError: (error: any) => {
      console.error('Sell ICP error:', error);
    },
    retry: 1,
    retryDelay: 1000,
  });
}
