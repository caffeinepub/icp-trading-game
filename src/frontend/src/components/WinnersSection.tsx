import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useWinners } from '@/hooks/useWinners';
import { useGameMode } from '@/contexts/GameModeContext';
import { Trophy, TrendingUp, TrendingDown } from 'lucide-react';
import { useActor } from '@/hooks/useActor';
import { useQuery } from '@tanstack/react-query';
import type { UserProfile } from '../backend';

export default function WinnersSection() {
  const { gameMode } = useGameMode();
  const { data: winners, isLoading, error } = useWinners(gameMode);
  const { actor } = useActor();

  // Fetch user profiles for winners
  const { data: profiles } = useQuery({
    queryKey: ['winnerProfiles', winners?.map(w => w.winner.toString())],
    queryFn: async () => {
      if (!actor || !winners || winners.length === 0) return {};
      
      const profileMap: Record<string, UserProfile | null> = {};
      await Promise.all(
        winners.map(async (winner) => {
          try {
            const profile = await actor.getUserProfile(winner.winner);
            profileMap[winner.winner.toString()] = profile;
          } catch {
            profileMap[winner.winner.toString()] = null;
          }
        })
      );
      return profileMap;
    },
    enabled: !!actor && !!winners && winners.length > 0,
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          <p>Failed to load winners history.</p>
        </CardContent>
      </Card>
    );
  }

  if (!winners || winners.length === 0) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-amber-500" />
            <CardTitle className="text-lg">Past Winners</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="py-8 text-center text-muted-foreground">
            <p>No winners yet for this game mode.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Sort winners by timestamp (most recent first)
  const sortedWinners = [...winners].sort((a, b) => Number(b.timestamp - a.timestamp));

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-amber-500" />
          <CardTitle className="text-lg">Past Winners</CardTitle>
        </div>
        <p className="text-sm text-muted-foreground">
          Historical winners for this game mode
        </p>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Winner</TableHead>
              <TableHead className="text-right">Final Value</TableHead>
              <TableHead className="text-right">P&L</TableHead>
              <TableHead className="text-right">Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedWinners.map((winner, index) => {
              const profitLoss = winner.profitLoss;
              const profitLossPercent = (profitLoss / 10000) * 100;
              const date = new Date(Number(winner.timestamp) / 1000000); // Convert nanoseconds to milliseconds
              const principalStr = winner.winner.toString();
              const profile = profiles?.[principalStr];

              return (
                <TableRow key={`${principalStr}-${winner.timestamp}`}>
                  <TableCell>
                    {profile?.name ? (
                      <div className="flex flex-col">
                        <span className="font-medium">{profile.name}</span>
                        <code className="text-xs text-muted-foreground">
                          {principalStr.slice(0, 8)}...{principalStr.slice(-6)}
                        </code>
                      </div>
                    ) : (
                      <code className="text-xs bg-muted px-2 py-1 rounded">
                        {principalStr.slice(0, 8)}...{principalStr.slice(-6)}
                      </code>
                    )}
                  </TableCell>
                  <TableCell className="text-right font-semibold">
                    ${winner.finalPortfolioValue.toFixed(2)}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      {profitLoss >= 0 ? (
                        <TrendingUp className="h-4 w-4 text-emerald-500" />
                      ) : (
                        <TrendingDown className="h-4 w-4 text-red-500" />
                      )}
                      <div>
                        <div
                          className={`font-semibold ${
                            profitLoss >= 0 ? 'text-emerald-500' : 'text-red-500'
                          }`}
                        >
                          {profitLoss >= 0 ? '+' : ''}${profitLoss.toFixed(2)}
                        </div>
                        <div
                          className={`text-xs ${
                            profitLoss >= 0 ? 'text-emerald-500' : 'text-red-500'
                          }`}
                        >
                          {profitLoss >= 0 ? '+' : ''}
                          {profitLossPercent.toFixed(2)}%
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-right text-sm text-muted-foreground">
                    {date.toLocaleDateString()}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
