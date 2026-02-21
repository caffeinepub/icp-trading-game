import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useWinners } from '@/hooks/useWinners';
import { useGameMode } from '@/contexts/GameModeContext';
import { Loader2, Trophy } from 'lucide-react';
import { useActor } from '@/hooks/useActor';
import type { UserProfile } from '../types/game';

export default function WinnersSection() {
  const { gameMode } = useGameMode();
  const { data: winners, isLoading } = useWinners(gameMode);
  const { actor } = useActor();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Historical Winners</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!winners || winners.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Historical Winners</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground py-8">
            No winners yet for this game mode
          </p>
        </CardContent>
      </Card>
    );
  }

  const formatDate = (timestamp: bigint) => {
    const date = new Date(Number(timestamp) / 1000000);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-yellow-500" />
          Historical Winners
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Player</TableHead>
                <TableHead className="text-right">Final Value</TableHead>
                <TableHead className="text-right">Profit/Loss</TableHead>
                <TableHead className="text-right">Reset Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {winners.map((winner, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">
                    {winner.winner.toString().slice(0, 8)}...
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    ${winner.finalPortfolioValue.toFixed(2)}
                  </TableCell>
                  <TableCell className={`text-right font-mono font-semibold ${
                    winner.profitLoss >= 0 ? 'text-emerald-500' : 'text-red-500'
                  }`}>
                    {winner.profitLoss >= 0 ? '+' : ''}${winner.profitLoss.toFixed(2)}
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground">
                    {formatDate(winner.timestamp)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
