import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine } from 'recharts';
import { format } from 'date-fns';

interface RSIChartProps {
  data: Array<{ timestamp: number; value: number }>;
  timeframe: string;
}

export default function RSIChart({ data, timeframe }: RSIChartProps) {
  if (data.length === 0) return null;

  return (
    <div className="mt-4">
      <div className="text-sm font-semibold mb-2 text-muted-foreground">RSI (14)</div>
      <ResponsiveContainer width="100%" height={150}>
        <LineChart data={data} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
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
          <YAxis
            domain={[0, 100]}
            ticks={[0, 30, 50, 70, 100]}
            className="text-xs"
          />
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length > 0) {
                const data = payload[0].payload;
                return (
                  <div className="bg-background/95 backdrop-blur-sm border rounded-lg p-2 shadow-lg">
                    <p className="text-xs text-muted-foreground mb-1">
                      {format(new Date(data.timestamp), 'MMM d, HH:mm')}
                    </p>
                    <div className="text-xs">
                      <span className="text-muted-foreground">RSI: </span>
                      <span className="font-mono font-medium">{data.value.toFixed(2)}</span>
                    </div>
                  </div>
                );
              }
              return null;
            }}
          />
          
          {/* Oversold line at 30 */}
          <ReferenceLine
            y={30}
            stroke="oklch(var(--chart-4))"
            strokeDasharray="3 3"
            strokeWidth={1}
            label={{
              value: 'Oversold',
              position: 'right',
              fill: 'oklch(var(--chart-4))',
              fontSize: 10,
            }}
          />
          
          {/* Overbought line at 70 */}
          <ReferenceLine
            y={70}
            stroke="oklch(var(--destructive))"
            strokeDasharray="3 3"
            strokeWidth={1}
            label={{
              value: 'Overbought',
              position: 'right',
              fill: 'oklch(var(--destructive))',
              fontSize: 10,
            }}
          />
          
          {/* RSI Line */}
          <Line
            type="monotone"
            dataKey="value"
            stroke="oklch(var(--chart-2))"
            strokeWidth={2}
            dot={false}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
