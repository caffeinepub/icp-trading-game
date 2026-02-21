import { useQuery } from '@tanstack/react-query';
import { useActor } from './useActor';
import { GameMode, Winner } from '../types/game';

export function useWinners(gameMode: GameMode) {
  const { actor, isFetching } = useActor();

  return useQuery<Winner[]>({
    queryKey: ['winners', gameMode],
    queryFn: async () => {
      if (!actor) return [];
      // Backend function not yet implemented
      return [];
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 60000,
  });
}
