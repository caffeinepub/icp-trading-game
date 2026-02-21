import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';

function parseBackendError(error: any): string {
  const errorMessage = error?.message || String(error);
  
  // Check for insufficient balance errors first (most specific)
  if (errorMessage.includes('Insufficient cash balance')) {
    return 'Insufficient cash balance for this purchase.';
  }
  
  if (errorMessage.includes('Insufficient ICP balance')) {
    return 'Insufficient ICP balance for this sale.';
  }
  
  // Check for specific registration/authorization errors
  // Only show registration error if backend explicitly mentions "registered users"
  if (errorMessage.includes('Only registered users can')) {
    return 'You must complete registration before trading. Please refresh the page.';
  }
  
  // Generic authorization errors (should not happen for registered users)
  if (errorMessage.includes('Unauthorized') && errorMessage.includes('Only users can')) {
    return 'Account access error. Please try again in a moment.';
  }
  
  // Connection/actor errors
  if (errorMessage.includes('Connection not ready') || errorMessage.includes('Actor not available')) {
    return errorMessage;
  }
  
  // Generic error fallback
  return errorMessage || 'Transaction failed. Please try again.';
}

export function useBuyICP() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (amountUSD: number) => {
      if (!actor) throw new Error('Connection not ready. Please wait a moment.');
      
      // Call buyICP directly - the backend will handle authorization
      // and account creation via getOrCreateAccount internally
      await actor.buyICP(amountUSD);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['balance'] });
      queryClient.invalidateQueries({ queryKey: ['portfolio'] });
      queryClient.invalidateQueries({ queryKey: ['transactionHistory'] });
    },
    onError: (error: any) => {
      console.error('Buy ICP error:', error);
      // Error will be handled by the component via the mutation error state
    },
    retry: false, // Don't retry on authorization errors
  });
}

export function useSellICP() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (amountICP: number) => {
      if (!actor) throw new Error('Connection not ready. Please wait a moment.');
      
      // Call sellICP directly - the backend will handle authorization
      // and account creation via getOrCreateAccount internally
      await actor.sellICP(amountICP);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['balance'] });
      queryClient.invalidateQueries({ queryKey: ['portfolio'] });
      queryClient.invalidateQueries({ queryKey: ['transactionHistory'] });
    },
    onError: (error: any) => {
      console.error('Sell ICP error:', error);
      // Error will be handled by the component via the mutation error state
    },
    retry: false, // Don't retry on authorization errors
  });
}

// Export the error parser for use in components
export { parseBackendError };
