import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { useKongSwapMetrics } from '@/hooks/useKongSwapMetrics';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';
import { TrendingUp, TrendingDown, Activity, Droplets, BookOpen, BarChart3 } from 'lucide-react';

interface TradingMetricsProps {
  days?: number;
}

export default function TradingMetrics({ days = 7 }: TradingMetricsProps) {
  const { data: metrics, isLoading, error } = useKongSwapMetrics(days);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[300px] w-full" />
        </CardContent>
      </Card>
    );
  }

  if (error || !metrics) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Trading Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center text-muted-foreground">
            <p>Failed to load metrics data.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const totalVolume = metrics.volume.reduce((sum, v) => sum + v.volumeUSD, 0);
  const avgDailyVolume = totalVolume / (metrics.volume.length || 1);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          Kong Swap Trading Tools
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="volume">Volume</TabsTrigger>
            <TabsTrigger value="liquidity">Liquidity</TabsTrigger>
            <TabsTrigger value="orderbook">Order Book</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {/* Technical Indicators */}
              {metrics.indicators && (
                <>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Activity className="h-3 w-3" />
                      <span>RSI (14)</span>
                    </div>
                    <div className="text-lg font-bold font-mono">
                      {metrics.indicators.rsi.toFixed(1)}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {metrics.indicators.rsi > 70 ? 'Overbought' : 
                       metrics.indicators.rsi < 30 ? 'Oversold' : 'Neutral'}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <TrendingUp className="h-3 w-3" />
                      <span>Volatility</span>
                    </div>
                    <div className="text-lg font-bold font-mono">
                      {metrics.indicators.volatility.toFixed(1)}%
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {metrics.indicators.volatility > 20 ? 'High' : 
                       metrics.indicators.volatility > 10 ? 'Medium' : 'Low'}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="text-xs text-muted-foreground">MA (7D)</div>
                    <div className="text-lg font-bold font-mono">
                      ${metrics.indicators.movingAverage7d.toFixed(2)}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="text-xs text-muted-foreground">MA (30D)</div>
                    <div className="text-lg font-bold font-mono">
                      ${metrics.indicators.movingAverage30d.toFixed(2)}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-4 pt-4 border-t">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <BarChart3 className="h-3 w-3" />
                  <span>Avg Daily Volume</span>
                </div>
                <div className="text-lg font-bold font-mono">
                  ${(avgDailyVolume / 1000000).toFixed(2)}M
                </div>
              </div>

              {metrics.liquidity && (
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Droplets className="h-3 w-3" />
                    <span>TVL</span>
                  </div>
                  <div className="text-lg font-bold font-mono">
                    ${(metrics.liquidity.tvl / 1000000).toFixed(2)}M
                  </div>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="volume">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <div className="text-xs text-muted-foreground">Total Volume ({days}D)</div>
                  <div className="text-xl font-bold font-mono">
                    ${(totalVolume / 1000000).toFixed(2)}M
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="text-xs text-muted-foreground">Avg Daily Volume</div>
                  <div className="text-xl font-bold font-mono">
                    ${(avgDailyVolume / 1000000).toFixed(2)}M
                  </div>
                </div>
              </div>

              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={metrics.volume}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis
                    dataKey="timestamp"
                    tickFormatter={(timestamp) => format(new Date(timestamp), 'MMM d')}
                    className="text-xs"
                  />
                  <YAxis
                    tickFormatter={(value) => `$${(value / 1000000).toFixed(1)}M`}
                    className="text-xs"
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length > 0) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-background/95 backdrop-blur-sm border rounded-lg p-3 shadow-lg">
                            <p className="text-xs text-muted-foreground mb-1">
                              {format(new Date(data.timestamp), 'MMM d, yyyy')}
                            </p>
                            <p className="text-sm font-mono font-medium">
                              ${(data.volumeUSD / 1000000).toFixed(2)}M
                            </p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar dataKey="volumeUSD" fill="oklch(var(--chart-1))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>

          <TabsContent value="liquidity">
            {metrics.liquidity && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Droplets className="h-3 w-3" />
                      <span>Total Liquidity</span>
                    </div>
                    <div className="text-xl font-bold font-mono">
                      ${(metrics.liquidity.totalLiquidityUSD / 1000000).toFixed(2)}M
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {(metrics.liquidity.totalLiquidity / 1000).toFixed(0)}K ICP
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="text-xs text-muted-foreground">Pool Depth</div>
                    <div className="text-xl font-bold font-mono">
                      {(metrics.liquidity.poolDepth / 1000).toFixed(0)}K ICP
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="text-xs text-muted-foreground">TVL</div>
                    <div className="text-xl font-bold font-mono">
                      ${(metrics.liquidity.tvl / 1000000).toFixed(2)}M
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="text-xs text-muted-foreground">Liquidity Ratio</div>
                    <div className="text-xl font-bold font-mono">
                      {((metrics.liquidity.totalLiquidity / metrics.liquidity.poolDepth) * 100).toFixed(1)}%
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <p className="text-xs text-muted-foreground">
                    Liquidity metrics from Kong Swap pools. Higher liquidity typically means lower slippage and better trade execution.
                  </p>
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="orderbook">
            {metrics.orderBook && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Order Book Depth</span>
                  </div>
                  <div className="text-sm">
                    <span className="text-muted-foreground">Spread: </span>
                    <span className="font-mono font-medium">${metrics.orderBook.spread.toFixed(3)}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Asks (Sell Orders) */}
                  <div className="space-y-2">
                    <div className="text-xs font-medium text-red-500 flex items-center gap-1">
                      <TrendingDown className="h-3 w-3" />
                      Asks (Sell)
                    </div>
                    <div className="space-y-1">
                      {metrics.orderBook.asks.slice(0, 5).reverse().map((ask, i) => (
                        <div key={i} className="flex justify-between text-xs font-mono">
                          <span className="text-red-500">${ask.price.toFixed(2)}</span>
                          <span className="text-muted-foreground">{ask.amount.toFixed(0)}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Bids (Buy Orders) */}
                  <div className="space-y-2">
                    <div className="text-xs font-medium text-emerald-500 flex items-center gap-1">
                      <TrendingUp className="h-3 w-3" />
                      Bids (Buy)
                    </div>
                    <div className="space-y-1">
                      {metrics.orderBook.bids.slice(0, 5).map((bid, i) => (
                        <div key={i} className="flex justify-between text-xs font-mono">
                          <span className="text-emerald-500">${bid.price.toFixed(2)}</span>
                          <span className="text-muted-foreground">{bid.amount.toFixed(0)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <p className="text-xs text-muted-foreground">
                    Real-time order book data from Kong Swap. Shows the top 5 bid and ask orders.
                  </p>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
