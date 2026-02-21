import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { useICPPriceData } from '../hooks/useICPPriceData';
import { calculateRSI, calculateMACD, calculateSMA } from '../utils/technicalIndicators';
import RSIChart from './RSIChart';
import MACDChart from './MACDChart';
import { Button } from '@/components/ui/button';

export default function PriceChart() {
  const { data: priceData, isLoading } = useICPPriceData('24h');
  const [showMA20, setShowMA20] = useState(true);
  const [showMA50, setShowMA50] = useState(true);
  const [showMA100, setShowMA100] = useState(false);
  const [showMA200, setShowMA200] = useState(false);

  if (isLoading || !priceData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>ICP Price Chart</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Loading chart...</p>
        </CardContent>
      </Card>
    );
  }

  const chartData = priceData.priceHistory.map((point) => ({
    timestamp: point.timestamp,
    price: point.price,
    date: new Date(point.timestamp).toLocaleTimeString(),
  }));

  const prices = priceData.priceHistory.map(p => p.price);
  const rsiResults = calculateRSI(prices, 14);
  const macdResults = calculateMACD(prices);
  const ma20 = calculateSMA(prices, 20);
  const ma50 = calculateSMA(prices, 50);
  const ma100 = calculateSMA(prices, 100);
  const ma200 = calculateSMA(prices, 200);

  const chartDataWithIndicators = chartData.map((point, index) => ({
    ...point,
    ma20: ma20[index],
    ma50: ma50[index],
    ma100: ma100[index],
    ma200: ma200[index],
  }));

  // Prepare RSI data
  const rsiData = chartData.map((point, index) => ({
    timestamp: point.timestamp,
    value: rsiResults[index]?.value || 50,
  }));

  // Prepare MACD data
  const macdData = chartData.map((point, index) => {
    const macdResult = macdResults[index];
    return {
      timestamp: point.timestamp,
      macdLine: macdResult?.macdLine || 0,
      signalLine: macdResult?.signalLine || 0,
      histogram: macdResult?.histogram || 0,
    };
  });

  const currentPrice = priceData.currentPrice;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>ICP Price Chart</CardTitle>
            <div className="text-right">
              <p className="text-2xl font-bold">${currentPrice.toFixed(2)}</p>
              <p className="text-sm text-muted-foreground">Current Price</p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 mb-4">
            <Button
              size="sm"
              variant={showMA20 ? 'default' : 'outline'}
              onClick={() => setShowMA20(!showMA20)}
            >
              MA20
            </Button>
            <Button
              size="sm"
              variant={showMA50 ? 'default' : 'outline'}
              onClick={() => setShowMA50(!showMA50)}
            >
              MA50
            </Button>
            <Button
              size="sm"
              variant={showMA100 ? 'default' : 'outline'}
              onClick={() => setShowMA100(!showMA100)}
            >
              MA100
            </Button>
            <Button
              size="sm"
              variant={showMA200 ? 'default' : 'outline'}
              onClick={() => setShowMA200(!showMA200)}
            >
              MA200
            </Button>
          </div>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={chartDataWithIndicators}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis
                dataKey="date"
                stroke="hsl(var(--muted-foreground))"
                tick={{ fontSize: 12 }}
              />
              <YAxis
                stroke="hsl(var(--muted-foreground))"
                tick={{ fontSize: 12 }}
                domain={['auto', 'auto']}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                }}
              />
              <ReferenceLine y={currentPrice} stroke="hsl(var(--primary))" strokeDasharray="3 3" />
              <Line
                type="monotone"
                dataKey="price"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                dot={false}
              />
              {showMA20 && (
                <Line
                  type="monotone"
                  dataKey="ma20"
                  stroke="#3b82f6"
                  strokeWidth={1}
                  dot={false}
                  strokeDasharray="5 5"
                />
              )}
              {showMA50 && (
                <Line
                  type="monotone"
                  dataKey="ma50"
                  stroke="#8b5cf6"
                  strokeWidth={1}
                  dot={false}
                  strokeDasharray="5 5"
                />
              )}
              {showMA100 && (
                <Line
                  type="monotone"
                  dataKey="ma100"
                  stroke="#f59e0b"
                  strokeWidth={1}
                  dot={false}
                  strokeDasharray="5 5"
                />
              )}
              {showMA200 && (
                <Line
                  type="monotone"
                  dataKey="ma200"
                  stroke="#ef4444"
                  strokeWidth={1}
                  dot={false}
                  strokeDasharray="5 5"
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <RSIChart data={rsiData} timeframe="24h" />
      <MACDChart data={macdData} timeframe="24h" />
    </div>
  );
}
