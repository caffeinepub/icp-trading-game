import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { toast } from 'sonner';

export function useLeverageActions() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  const openLongPosition = useMutation({
    mutationFn: async ({ amountICP, currentPrice, leverage }: { amountICP: number; currentPrice: number; leverage: number }) => {
      if (!actor) throw new Error('Actor not initialized');
      
      // Backend doesn't support leverage trading yet
      toast.error('Leverage trading not yet implemented in backend');
      throw new Error('Leverage trading not yet implemented');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['positions'] });
      queryClient.invalidateQueries({ queryKey: ['portfolio'] });
      queryClient.invalidateQueries({ queryKey: ['transactionHistory'] });
      toast.success('Long position opened successfully');
    },
    onError: (error: Error) => {
      console.error('Failed to open long position:', error);
    },
  });

  const openShortPosition = useMutation({
    mutationFn: async ({ amountICP, currentPrice, leverage }: { amountICP: number; currentPrice: number; leverage: number }) => {
      if (!actor) throw new Error('Actor not initialized');
      
      // Backend doesn't support leverage trading yet
      toast.error('Leverage trading not yet implemented in backend');
      throw new Error('Leverage trading not yet implemented');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['positions'] });
      queryClient.invalidateQueries({ queryKey: ['portfolio'] });
      queryClient.invalidateQueries({ queryKey: ['transactionHistory'] });
      toast.success('Short position opened successfully');
    },
    onError: (error: Error) => {
      console.error('Failed to open short position:', error);
    },
  });

  const closePosition = useMutation({
    mutationFn: async (positionIndex: number) => {
      if (!actor) throw new Error('Actor not initialized');
      
      // Backend doesn't support leverage trading yet
      toast.error('Leverage trading not yet implemented in backend');
      throw new Error('Leverage trading not yet implemented');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['positions'] });
      queryClient.invalidateQueries({ queryKey: ['portfolio'] });
      queryClient.invalidateQueries({ queryKey: ['transactionHistory'] });
      toast.success('Position closed successfully');
    },
    onError: (error: Error) => {
      console.error('Failed to close position:', error);
    },
  });

  return {
    openLongPosition: (amountICP: number, currentPrice: number, leverage: number) => 
      openLongPosition.mutateAsync({ amountICP, currentPrice, leverage }),
    openShortPosition: (amountICP: number, currentPrice: number, leverage: number) => 
      openShortPosition.mutateAsync({ amountICP, currentPrice, leverage }),
    closePosition: (positionIndex: number) => closePosition.mutateAsync(positionIndex),
    isOpening: openLongPosition.isPending || openShortPosition.isPending,
    isClosing: closePosition.isPending,
  };
}
