import { ResponsiveContainer, ComposedChart, Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine, Cell } from 'recharts';
import { format } from 'date-fns';

interface MACDChartProps {
  data: Array<{
    timestamp: number;
    macdLine: number;
    signalLine: number;
    histogram: number;
  }>;
  timeframe: string;
}

export default function MACDChart({ data, timeframe }: MACDChartProps) {
  if (data.length === 0) return null;

  return (
    <div className="mt-4">
      <div className="text-sm font-semibold mb-2 text-muted-foreground">MACD (12, 26, 9)</div>
      <ResponsiveContainer width="100%" height={150}>
        <ComposedChart data={data} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
          <XAxis
            dataKey="timestamp"
            tickFormatter={(timestamp) => {
              if (timeframe === '24H') {
                return format(new Date(timestamp), 'HH:mm');
              } else if (timeframe === '7D') {
                return format(new Date(timestamp), 'EEE');
              } else {
                return format(new Date(timestamp), 'MMM d');
              }
            }}
            className="text-xs"
          />
          <YAxis className="text-xs" />
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length > 0) {
                const data = payload[0].payload;
                return (
                  <div className="bg-background/95 backdrop-blur-sm border rounded-lg p-2 shadow-lg">
                    <p className="text-xs text-muted-foreground mb-1">
                      {format(new Date(data.timestamp), 'MMM d, HH:mm')}
                    </p>
                    <div className="space-y-0.5 text-xs">
                      <div className="flex justify-between gap-3">
                        <span className="text-muted-foreground">MACD:</span>
                        <span className="font-mono font-medium">{data.macdLine.toFixed(4)}</span>
                      </div>
                      <div className="flex justify-between gap-3">
                        <span className="text-muted-foreground">Signal:</span>
                        <span className="font-mono font-medium">{data.signalLine.toFixed(4)}</span>
                      </div>
                      <div className="flex justify-between gap-3">
                        <span className="text-muted-foreground">Histogram:</span>
                        <span className="font-mono font-medium">{data.histogram.toFixed(4)}</span>
                      </div>
                    </div>
                  </div>
                );
              }
              return null;
            }}
          />
          
          {/* Zero reference line */}
          <ReferenceLine y={0} stroke="oklch(var(--border))" strokeWidth={1} />
          
          {/* Histogram bars with conditional coloring */}
          <Bar
            dataKey="histogram"
            opacity={0.6}
            isAnimationActive={false}
          >
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.histogram >= 0 ? 'oklch(var(--chart-4))' : 'oklch(var(--destructive))'}
              />
            ))}
          </Bar>
          
          {/* MACD Line */}
          <Line
            type="monotone"
            dataKey="macdLine"
            stroke="oklch(var(--chart-2))"
            strokeWidth={2}
            dot={false}
            isAnimationActive={false}
          />
          
          {/* Signal Line */}
          <Line
            type="monotone"
            dataKey="signalLine"
            stroke="oklch(var(--chart-5))"
            strokeWidth={2}
            dot={false}
            isAnimationActive={false}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
