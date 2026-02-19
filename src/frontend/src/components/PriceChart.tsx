import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useHistoricalPriceData } from '@/hooks/useICPPriceData';
import { usePositions } from '@/hooks/usePositions';
import { usePortfolio } from '@/hooks/usePortfolio';
import { useTrendlines } from '@/hooks/useTrendlines';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { format } from 'date-fns';
import { PositionType } from '@/backend';
import RSIChart from './RSIChart';
import MACDChart from './MACDChart';
import MovingAverageToggles from './MovingAverageToggles';
import TrendlineDrawingTool from './TrendlineDrawingTool';
import { calculateRSI, calculateMACD, calculateMAWithTimestamps } from '@/utils/technicalIndicators';

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
  const [enabledMAs, setEnabledMAs] = useState({
    ma20: false,
    ma50: false,
    ma100: false,
    ma200: false,
  });
  
  const { data: priceData = [], isLoading, error } = useHistoricalPriceData(TIMEFRAME_DAYS[timeframe]);
  const { data: positions = [] } = usePositions();
  const { portfolio } = usePortfolio();
  const { trendlines, addTrendline, removeTrendline, clearAllTrendlines } = useTrendlines();

  // Calculate technical indicators
  const indicators = useMemo(() => {
    if (priceData.length === 0) return { rsi: [], macd: [], ma20: [], ma50: [], ma100: [], ma200: [] };
    
    const prices = priceData.map(d => d.price);
    
    // Calculate RSI
    const rsiValues = calculateRSI(prices, 14);
    const rsi = rsiValues.map(r => ({
      timestamp: priceData[r.timestamp + 1]?.timestamp || 0,
      value: r.value,
    }));
    
    // Calculate MACD
    const macdValues = calculateMACD(prices, 12, 26, 9);
    const macd = macdValues.map(m => ({
      timestamp: priceData[m.timestamp]?.timestamp || 0,
      macdLine: m.macdLine,
      signalLine: m.signalLine,
      histogram: m.histogram,
    }));
    
    // Calculate Moving Averages
    const ma20 = calculateMAWithTimestamps(priceData, 20);
    const ma50 = calculateMAWithTimestamps(priceData, 50);
    const ma100 = calculateMAWithTimestamps(priceData, 100);
    const ma200 = calculateMAWithTimestamps(priceData, 200);
    
    return { rsi, macd, ma20, ma50, ma100, ma200 };
  }, [priceData]);

  // Merge MA data with price data for chart
  const chartData = useMemo(() => {
    return priceData.map(point => {
      const data: any = { ...point };
      
      if (enabledMAs.ma20) {
        const ma20Point = indicators.ma20.find(m => m.timestamp === point.timestamp);
        if (ma20Point) data.ma20 = ma20Point.value;
      }
      if (enabledMAs.ma50) {
        const ma50Point = indicators.ma50.find(m => m.timestamp === point.timestamp);
        if (ma50Point) data.ma50 = ma50Point.value;
      }
      if (enabledMAs.ma100) {
        const ma100Point = indicators.ma100.find(m => m.timestamp === point.timestamp);
        if (ma100Point) data.ma100 = ma100Point.value;
      }
      if (enabledMAs.ma200) {
        const ma200Point = indicators.ma200.find(m => m.timestamp === point.timestamp);
        if (ma200Point) data.ma200 = ma200Point.value;
      }
      
      return data;
    });
  }, [priceData, indicators, enabledMAs]);

  const handleToggleMA = (ma: 'ma20' | 'ma50' | 'ma100' | 'ma200') => {
    setEnabledMAs(prev => ({ ...prev, [ma]: !prev[ma] }));
  };

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
        <div className="space-y-4">
          {/* Moving Average Toggles */}
          <MovingAverageToggles enabled={enabledMAs} onToggle={handleToggleMA} />
          
          {/* Trendline Drawing Tool */}
          <TrendlineDrawingTool
            trendlines={trendlines}
            onAddTrendline={addTrendline}
            onRemoveTrendline={removeTrendline}
            onClearAll={clearAllTrendlines}
            chartData={priceData}
            width={1000}
            height={400}
          />
          
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
              <LineChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
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
                            {enabledMAs.ma20 && data.ma20 && (
                              <div className="flex justify-between gap-4">
                                <span className="text-muted-foreground">MA20:</span>
                                <span className="font-mono font-medium">${data.ma20.toFixed(2)}</span>
                              </div>
                            )}
                            {enabledMAs.ma50 && data.ma50 && (
                              <div className="flex justify-between gap-4">
                                <span className="text-muted-foreground">MA50:</span>
                                <span className="font-mono font-medium">${data.ma50.toFixed(2)}</span>
                              </div>
                            )}
                            {enabledMAs.ma100 && data.ma100 && (
                              <div className="flex justify-between gap-4">
                                <span className="text-muted-foreground">MA100:</span>
                                <span className="font-mono font-medium">${data.ma100.toFixed(2)}</span>
                              </div>
                            )}
                            {enabledMAs.ma200 && data.ma200 && (
                              <div className="flex justify-between gap-4">
                                <span className="text-muted-foreground">MA200:</span>
                                <span className="font-mono font-medium">${data.ma200.toFixed(2)}</span>
                              </div>
                            )}
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

                {/* Moving Average Lines */}
                {enabledMAs.ma20 && (
                  <Line
                    type="monotone"
                    dataKey="ma20"
                    stroke="oklch(0.75 0.15 85)"
                    strokeWidth={1.5}
                    dot={false}
                    isAnimationActive={false}
                    strokeDasharray="3 3"
                  />
                )}
                {enabledMAs.ma50 && (
                  <Line
                    type="monotone"
                    dataKey="ma50"
                    stroke="oklch(0.70 0.18 200)"
                    strokeWidth={1.5}
                    dot={false}
                    isAnimationActive={false}
                    strokeDasharray="3 3"
                  />
                )}
                {enabledMAs.ma100 && (
                  <Line
                    type="monotone"
                    dataKey="ma100"
                    stroke="oklch(0.65 0.20 320)"
                    strokeWidth={1.5}
                    dot={false}
                    isAnimationActive={false}
                    strokeDasharray="3 3"
                  />
                )}
                {enabledMAs.ma200 && (
                  <Line
                    type="monotone"
                    dataKey="ma200"
                    stroke="oklch(0.70 0.20 40)"
                    strokeWidth={1.5}
                    dot={false}
                    isAnimationActive={false}
                    strokeDasharray="3 3"
                  />
                )}

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
          
          {/* RSI Indicator */}
          <RSIChart data={indicators.rsi} timeframe={timeframe} />
          
          {/* MACD Indicator */}
          <MACDChart data={indicators.macd} timeframe={timeframe} />
        </div>
      </CardContent>
    </Card>
  );
}
