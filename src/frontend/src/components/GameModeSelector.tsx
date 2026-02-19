import { Button } from '@/components/ui/button';
import { useGameMode } from '@/contexts/GameModeContext';
import { GameMode } from '../backend';
import { Clock } from 'lucide-react';

export default function GameModeSelector() {
  const { gameMode, setGameMode } = useGameMode();

  const modes = [
    { value: GameMode.daily, label: '24h', description: 'Daily' },
    { value: GameMode.weekly, label: '7d', description: 'Weekly' },
    { value: GameMode.monthly, label: '30d', description: 'Monthly' },
    { value: GameMode.yearly, label: '1y', description: 'Yearly' },
  ];

  return (
    <div className="flex items-center gap-3 flex-wrap">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Clock className="h-4 w-4" />
        <span className="font-medium">Game Mode:</span>
      </div>
      <div className="flex gap-2">
        {modes.map((mode) => (
          <Button
            key={mode.value}
            variant={gameMode === mode.value ? 'default' : 'outline'}
            size="sm"
            onClick={() => setGameMode(mode.value)}
            className="min-w-[60px]"
          >
            {mode.label}
          </Button>
        ))}
      </div>
    </div>
  );
}
