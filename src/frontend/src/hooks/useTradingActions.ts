import { useState } from 'react';
import { useActor } from './useActor';
import { useCurrentICPPrice } from './useICPPriceData';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useGameMode } from '@/contexts/GameModeContext';

export function useTradingActions() {
  const { actor } = useActor();
  const { gameMode } = useGameMode();
  const { data: currentPrice = 0, isLoading: isLoadingPrice } = useCurrentICPPrice();
  const [isBuying, setIsBuying] = useState(false);
  const [isSelling, setIsSelling] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const queryClient = useQueryClient();

  const buyICP = async (amount: number): Promise<boolean> => {
    if (!actor) {
      toast.error('Not connected');
      return false;
    }

    if (currentPrice <= 0) {
      toast.error('Price data not available');
      return false;
    }

    setIsBuying(true);
    try {
      await actor.buyICP(gameMode, amount, currentPrice);
      toast.success(`Successfully bought ${amount.toFixed(4)} ICP for $${(amount * currentPrice).toFixed(2)}`);
      
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['leaderboard', gameMode] });
      
      return true;
    } catch (error) {
      let errorMessage = 'Failed to buy ICP';
      if (error instanceof Error) {
        if (error.message.includes('Insufficient funds')) {
          errorMessage = 'Insufficient funds. You don\'t have enough cash to complete this purchase.';
        } else {
          errorMessage = error.message;
        }
      }
      toast.error(errorMessage);
      return false;
    } finally {
      setIsBuying(false);
    }
  };

  const sellICP = async (amount: number): Promise<boolean> => {
    if (!actor) {
      toast.error('Not connected');
      return false;
    }

    if (currentPrice <= 0) {
      toast.error('Price data not available');
      return false;
    }

    setIsSelling(true);
    try {
      await actor.sellICP(gameMode, amount, currentPrice);
      toast.success(`Successfully sold ${amount.toFixed(4)} ICP for $${(amount * currentPrice).toFixed(2)}`);
      
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['leaderboard', gameMode] });
      
      return true;
    } catch (error) {
      let errorMessage = 'Failed to sell ICP';
      if (error instanceof Error) {
        if (error.message.includes('Insufficient ICP balance')) {
          errorMessage = 'Insufficient ICP. You don\'t have enough ICP to complete this sale.';
        } else {
          errorMessage = error.message;
        }
      }
      toast.error(errorMessage);
      return false;
    } finally {
      setIsSelling(false);
    }
  };

  const resetAccount = async (): Promise<boolean> => {
    if (!actor) {
      toast.error('Not connected');
      return false;
    }

    setIsResetting(true);
    try {
      await actor.resetAccount(gameMode);
      toast.success('Account reset successfully! Cash balance: $10,000.00, ICP holdings: 0');
      
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['leaderboard', gameMode] });
      
      return true;
    } catch (error) {
      let errorMessage = 'Failed to reset account';
      if (error instanceof Error) {
        if (error.message.includes('Unauthorized')) {
          errorMessage = 'Unauthorized: Only admins can reset accounts.';
        } else {
          errorMessage = error.message;
        }
      }
      toast.error(errorMessage);
      return false;
    } finally {
      setIsResetting(false);
    }
  };

  return {
    currentPrice,
    isLoadingPrice,
    buyICP,
    sellICP,
    resetAccount,
    isBuying,
    isSelling,
    isResetting,
  };
}
