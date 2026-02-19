import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { useGameMode } from '@/contexts/GameModeContext';
import { toast } from 'sonner';

export function useLeverageActions() {
  const { actor } = useActor();
  const { gameMode } = useGameMode();
  const queryClient = useQueryClient();

  const openLongMutation = useMutation({
    mutationFn: async ({ amountICP, price, leverage }: { amountICP: number; price: number; leverage: number }) => {
      if (!actor) throw new Error('Actor not initialized');
      await actor.openLongPosition(gameMode, amountICP, price, leverage);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['portfolio'] });
      queryClient.invalidateQueries({ queryKey: ['positions'] });
      queryClient.invalidateQueries({ queryKey: ['account'] });
      toast.success('Long position opened successfully');
    },
    onError: (error: Error) => {
      console.error('Error opening long position:', error);
      toast.error(error.message || 'Failed to open long position');
    },
  });

  const openShortMutation = useMutation({
    mutationFn: async ({ amountICP, price, leverage }: { amountICP: number; price: number; leverage: number }) => {
      if (!actor) throw new Error('Actor not initialized');
      await actor.openShortPosition(gameMode, amountICP, price, leverage);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['portfolio'] });
      queryClient.invalidateQueries({ queryKey: ['positions'] });
      queryClient.invalidateQueries({ queryKey: ['account'] });
      toast.success('Short position opened successfully');
    },
    onError: (error: Error) => {
      console.error('Error opening short position:', error);
      toast.error(error.message || 'Failed to open short position');
    },
  });

  const closePositionMutation = useMutation({
    mutationFn: async ({ positionIndex, currentPrice }: { positionIndex: number; currentPrice: number }) => {
      if (!actor) throw new Error('Actor not initialized');
      await actor.closePosition(gameMode, BigInt(positionIndex), currentPrice);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['portfolio'] });
      queryClient.invalidateQueries({ queryKey: ['positions'] });
      queryClient.invalidateQueries({ queryKey: ['account'] });
      toast.success('Position closed successfully');
    },
    onError: (error: Error) => {
      console.error('Error closing position:', error);
      toast.error(error.message || 'Failed to close position');
    },
  });

  return {
    openLong: (amountICP: number, price: number, leverage: number) => 
      openLongMutation.mutateAsync({ amountICP, price, leverage }),
    openShort: (amountICP: number, price: number, leverage: number) => 
      openShortMutation.mutateAsync({ amountICP, price, leverage }),
    closePosition: (positionIndex: number, currentPrice: number) => 
      closePositionMutation.mutateAsync({ positionIndex, currentPrice }),
    isOpeningLong: openLongMutation.isPending,
    isOpeningShort: openShortMutation.isPending,
    isClosing: closePositionMutation.isPending,
  };
}
