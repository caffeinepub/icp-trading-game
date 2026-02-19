import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useICPPriceData } from '@/hooks/useICPPriceData';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown } from 'lucide-react';

type Timeframe = '1' | '7' | '30' | '90' | '180';

const timeframes: { value: Timeframe; label: string }[] = [
  { value: '1', label: '24H' },
  { value: '7', label: '7D' },
  { value: '30', label: '30D' },
  { value: '90', label: '90D' },
  { value: '180', label: '180D' },
];

export default function PriceChart() {
  const [selectedTimeframe, setSelectedTimeframe] = useState<Timeframe>('7');
  const { data, isLoading, error } = useICPPriceData(selectedTimeframe);

  const formatPrice = (value: number) => {
    return `$${value.toFixed(2)}`;
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    if (selectedTimeframe === '1') {
      return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    }
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const priceChange = data && data.length > 1 
    ? ((data[data.length - 1].price - data[0].price) / data[0].price) * 100 
    : 0;

  const currentPrice = data && data.length > 0 ? data[data.length - 1].price : 0;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-2xl">ICP Price Chart</CardTitle>
            {!isLoading && data && (
              <div className="mt-2 space-y-1">
                <p className="text-3xl font-bold">{formatPrice(currentPrice)}</p>
                <div className="flex items-center gap-2">
                  {priceChange >= 0 ? (
                    <TrendingUp className="h-4 w-4 text-emerald-500" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-red-500" />
                  )}
                  <span
                    className={`text-sm font-medium ${
                      priceChange >= 0 ? 'text-emerald-500' : 'text-red-500'
                    }`}
                  >
                    {priceChange >= 0 ? '+' : ''}
                    {priceChange.toFixed(2)}%
                  </span>
                </div>
              </div>
            )}
          </div>
          <div className="flex gap-1">
            {timeframes.map((tf) => (
              <Button
                key={tf.value}
                variant={selectedTimeframe === tf.value ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedTimeframe(tf.value)}
              >
                {tf.label}
              </Button>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading && (
          <div className="space-y-3">
            <Skeleton className="h-[300px] w-full" />
          </div>
        )}
        {error && (
          <div className="h-[300px] flex items-center justify-center text-muted-foreground">
            <p>Failed to load price data. Please try again.</p>
          </div>
        )}
        {!isLoading && !error && data && (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="oklch(var(--border))" />
              <XAxis
                dataKey="timestamp"
                tickFormatter={formatDate}
                stroke="oklch(var(--muted-foreground))"
                style={{ fontSize: '12px' }}
              />
              <YAxis
                tickFormatter={formatPrice}
                stroke="oklch(var(--muted-foreground))"
                style={{ fontSize: '12px' }}
                domain={['auto', 'auto']}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'oklch(var(--card))',
                  border: '1px solid oklch(var(--border))',
                  borderRadius: '8px',
                }}
                labelFormatter={formatDate}
                formatter={(value: number) => [formatPrice(value), 'Price']}
              />
              <Line
                type="monotone"
                dataKey="price"
                stroke="oklch(var(--chart-1))"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
