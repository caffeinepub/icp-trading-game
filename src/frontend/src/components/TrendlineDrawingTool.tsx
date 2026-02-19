import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Pencil, Trash2 } from 'lucide-react';
import { Trendline } from '@/hooks/useTrendlines';

interface TrendlineDrawingToolProps {
  trendlines: Trendline[];
  onAddTrendline: (trendline: Omit<Trendline, 'id'>) => void;
  onRemoveTrendline: (id: string) => void;
  onClearAll: () => void;
  chartData: Array<{ timestamp: number; price: number }>;
  width: number;
  height: number;
}

export default function TrendlineDrawingTool({
  trendlines,
  onAddTrendline,
  onRemoveTrendline,
  onClearAll,
  chartData,
  width,
  height,
}: TrendlineDrawingToolProps) {
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawingMode, setDrawingMode] = useState(false);
  const [currentLine, setCurrentLine] = useState<{ startX: number; startY: number; endX: number; endY: number } | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const handleMouseDown = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!drawingMode) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    setIsDrawing(true);
    setCurrentLine({ startX: x, startY: y, endX: x, endY: y });
  };

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!isDrawing || !currentLine) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    setCurrentLine({ ...currentLine, endX: x, endY: y });
  };

  const handleMouseUp = () => {
    if (!isDrawing || !currentLine) return;
    
    // Only add trendline if it has meaningful length
    const length = Math.sqrt(
      Math.pow(currentLine.endX - currentLine.startX, 2) +
      Math.pow(currentLine.endY - currentLine.startY, 2)
    );
    
    if (length > 20) {
      onAddTrendline(currentLine);
    }
    
    setIsDrawing(false);
    setCurrentLine(null);
  };

  return (
    <div className="relative">
      <div className="flex gap-2 mb-2">
        <Button
          variant={drawingMode ? 'default' : 'outline'}
          size="sm"
          onClick={() => setDrawingMode(!drawingMode)}
          className="h-7 text-xs"
        >
          <Pencil className="h-3 w-3 mr-1" />
          {drawingMode ? 'Drawing Mode ON' : 'Draw Trendlines'}
        </Button>
        
        {trendlines.length > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={onClearAll}
            className="h-7 text-xs"
          >
            <Trash2 className="h-3 w-3 mr-1" />
            Clear All
          </Button>
        )}
      </div>
      
      <svg
        ref={svgRef}
        width={width}
        height={height}
        className={`absolute top-0 left-0 pointer-events-auto ${drawingMode ? 'cursor-crosshair' : 'pointer-events-none'}`}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        style={{ zIndex: 10 }}
      >
        {/* Render existing trendlines */}
        {trendlines.map((line) => (
          <g key={line.id}>
            <line
              x1={line.startX}
              y1={line.startY}
              x2={line.endX}
              y2={line.endY}
              stroke="oklch(var(--chart-3))"
              strokeWidth={2}
              strokeDasharray="5 5"
            />
            {/* Clickable area for deletion */}
            <line
              x1={line.startX}
              y1={line.startY}
              x2={line.endX}
              y2={line.endY}
              stroke="transparent"
              strokeWidth={10}
              className="cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                onRemoveTrendline(line.id);
              }}
            />
          </g>
        ))}
        
        {/* Render current drawing line */}
        {currentLine && (
          <line
            x1={currentLine.startX}
            y1={currentLine.startY}
            x2={currentLine.endX}
            y2={currentLine.endY}
            stroke="oklch(var(--chart-3))"
            strokeWidth={2}
            strokeDasharray="5 5"
            opacity={0.7}
          />
        )}
      </svg>
    </div>
  );
}
