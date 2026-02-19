import { useQuery } from '@tanstack/react-query';
import { useActor } from './useActor';
import { GameMode, Winner } from '../backend';

export function useWinners(gameMode: GameMode) {
  const { actor, isFetching } = useActor();

  return useQuery<Winner[]>({
    queryKey: ['winners', gameMode],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getWinners(gameMode);
    },
    enabled: !!actor && !isFetching,
  });
}
