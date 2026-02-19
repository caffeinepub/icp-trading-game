import { Button } from '@/components/ui/button';

interface MovingAverageTogglesProps {
  enabled: {
    ma20: boolean;
    ma50: boolean;
    ma100: boolean;
    ma200: boolean;
  };
  onToggle: (ma: 'ma20' | 'ma50' | 'ma100' | 'ma200') => void;
}

const MA_COLORS = {
  ma20: 'oklch(0.75 0.15 85)',  // Yellow
  ma50: 'oklch(0.70 0.18 200)', // Cyan
  ma100: 'oklch(0.65 0.20 320)', // Magenta
  ma200: 'oklch(0.70 0.20 40)',  // Orange
};

export default function MovingAverageToggles({ enabled, onToggle }: MovingAverageTogglesProps) {
  return (
    <div className="flex gap-2 flex-wrap">
      <span className="text-xs text-muted-foreground self-center mr-1">Moving Averages:</span>
      
      <Button
        variant={enabled.ma20 ? 'default' : 'outline'}
        size="sm"
        onClick={() => onToggle('ma20')}
        className="h-7 text-xs"
        style={enabled.ma20 ? { backgroundColor: MA_COLORS.ma20, color: 'oklch(0.10 0 0)' } : {}}
      >
        MA20
      </Button>
      
      <Button
        variant={enabled.ma50 ? 'default' : 'outline'}
        size="sm"
        onClick={() => onToggle('ma50')}
        className="h-7 text-xs"
        style={enabled.ma50 ? { backgroundColor: MA_COLORS.ma50, color: 'oklch(0.10 0 0)' } : {}}
      >
        MA50
      </Button>
      
      <Button
        variant={enabled.ma100 ? 'default' : 'outline'}
        size="sm"
        onClick={() => onToggle('ma100')}
        className="h-7 text-xs"
        style={enabled.ma100 ? { backgroundColor: MA_COLORS.ma100, color: 'oklch(0.10 0 0)' } : {}}
      >
        MA100
      </Button>
      
      <Button
        variant={enabled.ma200 ? 'default' : 'outline'}
        size="sm"
        onClick={() => onToggle('ma200')}
        className="h-7 text-xs"
        style={enabled.ma200 ? { backgroundColor: MA_COLORS.ma200, color: 'oklch(0.10 0 0)' } : {}}
      >
        MA200
      </Button>
    </div>
  );
}
