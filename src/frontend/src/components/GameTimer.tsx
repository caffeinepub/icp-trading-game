import { Card } from '@/components/ui/card';
import { useGameMode } from '@/contexts/GameModeContext';
import { useGameTimer } from '@/hooks/useGameTimer';
import { Timer } from 'lucide-react';

export default function GameTimer() {
  const { gameMode } = useGameMode();
  const { days, hours, minutes, seconds } = useGameTimer(gameMode);

  const formatNumber = (num: number) => num.toString().padStart(2, '0');

  return (
    <Card className="p-4">
      <div className="flex items-center gap-3">
        <Timer className="h-5 w-5 text-muted-foreground" />
        <div className="flex-1">
          <div className="text-xs text-muted-foreground mb-1">Time Until Reset</div>
          <div className="flex items-center gap-2 font-mono text-lg font-semibold">
            {days > 0 && (
              <>
                <span>{days}d</span>
                <span className="text-muted-foreground">:</span>
              </>
            )}
            <span>{formatNumber(hours)}</span>
            <span className="text-muted-foreground">:</span>
            <span>{formatNumber(minutes)}</span>
            <span className="text-muted-foreground">:</span>
            <span>{formatNumber(seconds)}</span>
          </div>
        </div>
      </div>
    </Card>
  );
}
