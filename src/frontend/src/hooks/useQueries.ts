import { useQuery } from '@tanstack/react-query';
import { useActor } from './useActor';
import { GameMode } from '../backend';

export function useGetLeaderboard(gameMode: GameMode) {
  const { actor, isFetching } = useActor();

  return useQuery({
    queryKey: ['leaderboard', gameMode],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getLeaderboard(gameMode);
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 30000, // Refetch every 30 seconds
  });
}

export function useIsCallerAdmin() {
  const { actor, isFetching } = useActor();

  return useQuery({
    queryKey: ['isCallerAdmin'],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !isFetching,
    retry: false,
  });
}
