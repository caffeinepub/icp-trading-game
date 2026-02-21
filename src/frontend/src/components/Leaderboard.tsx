import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useLeaderboard } from '@/hooks/useLeaderboard';
import { Trophy, TrendingUp, TrendingDown } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import WinnersSection from './WinnersSection';
import { useGameMode } from '@/contexts/GameModeContext';

export default function Leaderboard() {
  const { leaderboard, isLoading, error } = useLeaderboard();
  const { gameMode } = useGameMode();

  const getGameModeLabel = () => {
    switch (gameMode) {
      case 'daily': return 'Daily';
      case 'weekly': return 'Weekly';
      case 'monthly': return 'Monthly';
      case 'yearly': return 'Yearly';
      default: return 'Current';
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-48" />
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <p>Failed to load leaderboard. Please try again.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Trophy className="h-6 w-6 text-amber-500" />
            <CardTitle>{getGameModeLabel()} Leaderboard</CardTitle>
          </div>
          <p className="text-sm text-muted-foreground">
            Top traders ranked by profit/loss in this game mode
          </p>
        </CardHeader>
        <CardContent>
          {!leaderboard || leaderboard.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">
              <p>No traders yet. Be the first to start trading!</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16">Rank</TableHead>
                  <TableHead>Trader</TableHead>
                  <TableHead className="text-right">Portfolio Value</TableHead>
                  <TableHead className="text-right">P&L</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {leaderboard.map((entry, index) => {
                  const profitLoss = entry.profitLoss;
                  const profitLossPercent = entry.profitLossPercentage;
                  
                  return (
                    <TableRow key={entry.principal}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {index === 0 && <Trophy className="h-4 w-4 text-amber-500" />}
                          {index === 1 && <Trophy className="h-4 w-4 text-slate-400" />}
                          {index === 2 && <Trophy className="h-4 w-4 text-amber-700" />}
                          <span className="font-semibold">{entry.rank}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          {entry.name && <span className="font-medium">{entry.name}</span>}
                          <code className="text-xs bg-muted px-2 py-1 rounded">
                            {entry.principal.slice(0, 8)}...{entry.principal.slice(-6)}
                          </code>
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-semibold">
                        ${entry.totalValue.toFixed(2)}
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
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <WinnersSection />
    </div>
  );
}
