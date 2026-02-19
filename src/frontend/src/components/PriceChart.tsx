import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useHistoricalPriceData } from '@/hooks/useICPPriceData';
import { usePositions } from '@/hooks/usePositions';
import { usePortfolio } from '@/hooks/usePortfolio';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { format } from 'date-fns';
import { PositionType } from '@/backend';

type Timeframe = '24H' | '7D' | '30D' | '90D' | '180D';

const TIMEFRAME_DAYS: Record<Timeframe, number> = {
  '24H': 1,
  '7D': 7,
  '30D': 30,
  '90D': 90,
  '180D': 180,
};

export default function PriceChart() {
  const [timeframe, setTimeframe] = useState<Timeframe>('7D');
  const { data: priceData = [], isLoading, error } = useHistoricalPriceData(TIMEFRAME_DAYS[timeframe]);
  const { data: positions = [] } = usePositions();
  const { portfolio } = usePortfolio();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-8 w-48" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[400px] w-full" />
        </CardContent>
      </Card>
    );
  }

  if (error || priceData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>ICP Price Chart</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[400px] flex items-center justify-center text-muted-foreground">
            <p>Failed to load price data. Please try again.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const currentPrice = priceData[priceData.length - 1]?.price || 0;
  const firstPrice = priceData[0]?.price || 0;
  const priceChange = currentPrice - firstPrice;
  const priceChangePercent = firstPrice > 0 ? (priceChange / firstPrice) * 100 : 0;

  // Calculate margin statistics
  const totalMarginLocked = portfolio?.totalMarginLocked || 0;
  const availableMargin = portfolio?.cashBalance || 0;
  const totalPortfolioValue = portfolio?.totalValue || 10000;
  const marginUsagePercent = totalPortfolioValue > 0 ? (totalMarginLocked / totalPortfolioValue) * 100 : 0;

  // Find closest liquidation price
  const liquidationPrices = positions
    .map(pos => ({
      price: pos.liquidationPrice,
      type: pos.positionType === PositionType.long_ ? 'long' : 'short',
    }))
    .sort((a, b) => Math.abs(a.price - currentPrice) - Math.abs(b.price - currentPrice));

  const closestLiquidation = liquidationPrices[0];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle>ICP Price Chart</CardTitle>
            <div className="flex items-baseline gap-3 mt-2">
              <span className="text-2xl font-bold">${currentPrice.toFixed(2)}</span>
              <span className={`text-sm font-medium ${priceChange >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                {priceChange >= 0 ? '+' : ''}${priceChange.toFixed(2)} ({priceChange >= 0 ? '+' : ''}{priceChangePercent.toFixed(2)}%)
              </span>
            </div>
          </div>
          <div className="flex gap-2">
            {(Object.keys(TIMEFRAME_DAYS) as Timeframe[]).map((tf) => (
              <Button
                key={tf}
                variant={timeframe === tf ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTimeframe(tf)}
              >
                {tf}
              </Button>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="relative">
          {/* Margin Statistics Overlay */}
          {positions.length > 0 && (
            <div className="absolute top-2 left-2 z-10 bg-background/95 backdrop-blur-sm border rounded-lg p-3 text-xs space-y-1 shadow-lg">
              <div className="font-semibold text-foreground mb-2">Margin Statistics</div>
              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground">Margin Locked:</span>
                <span className="font-mono font-medium">${totalMarginLocked.toFixed(2)}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground">Available Cash:</span>
                <span className="font-mono font-medium">${availableMargin.toFixed(2)}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground">Margin Usage:</span>
                <span className="font-mono font-medium">{marginUsagePercent.toFixed(1)}%</span>
              </div>
              {closestLiquidation && (
                <div className="flex justify-between gap-4 pt-1 border-t">
                  <span className="text-muted-foreground">Nearest Liquidation:</span>
                  <span className="font-mono font-medium text-orange-500">
                    ${closestLiquidation.price.toFixed(2)}
                  </span>
                </div>
              )}
            </div>
          )}

          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={priceData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
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
                domain={['dataMin - 0.5', 'dataMax + 0.5']}
                tickFormatter={(value) => `$${value.toFixed(2)}`}
                className="text-xs"
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length > 0) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-background/95 backdrop-blur-sm border rounded-lg p-3 shadow-lg">
                        <p className="text-xs text-muted-foreground mb-2">
                          {format(new Date(data.timestamp), 'MMM d, yyyy HH:mm')}
                        </p>
                        <div className="space-y-1 text-xs">
                          <div className="flex justify-between gap-4">
                            <span className="text-muted-foreground">Price:</span>
                            <span className="font-mono font-medium">${data.price.toFixed(2)}</span>
                          </div>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              
              {/* Price Line */}
              <Line
                type="monotone"
                dataKey="price"
                stroke="oklch(var(--chart-1))"
                strokeWidth={2}
                dot={false}
                isAnimationActive={false}
              />

              {/* Liquidation price lines */}
              {positions.map((position, index) => {
                const isLong = position.positionType === PositionType.long_;
                return (
                  <ReferenceLine
                    key={`liq-${index}`}
                    y={position.liquidationPrice}
                    stroke={isLong ? 'oklch(var(--destructive))' : 'oklch(var(--chart-5))'}
                    strokeDasharray="5 5"
                    strokeWidth={2}
                    label={{
                      value: `Liq: $${position.liquidationPrice.toFixed(2)} (${isLong ? 'Long' : 'Short'})`,
                      position: 'right',
                      fill: isLong ? 'oklch(var(--destructive))' : 'oklch(var(--chart-5))',
                      fontSize: 11,
                    }}
                  />
                );
              })}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
