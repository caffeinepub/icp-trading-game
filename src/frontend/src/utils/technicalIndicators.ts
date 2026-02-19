// Technical indicator calculation utilities

export interface RSIResult {
  timestamp: number;
  value: number;
}

export interface MACDResult {
  timestamp: number;
  macdLine: number;
  signalLine: number;
  histogram: number;
}

export interface MAResult {
  timestamp: number;
  value: number;
}

/**
 * Calculate Simple Moving Average (SMA)
 */
export function calculateSMA(prices: number[], period: number): number[] {
  if (prices.length < period) return [];
  
  const sma: number[] = [];
  
  for (let i = period - 1; i < prices.length; i++) {
    const sum = prices.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0);
    sma.push(sum / period);
  }
  
  return sma;
}

/**
 * Calculate Exponential Moving Average (EMA)
 */
export function calculateEMA(prices: number[], period: number): number[] {
  if (prices.length < period) return [];
  
  const ema: number[] = [];
  const multiplier = 2 / (period + 1);
  
  // Start with SMA for the first value
  const sma = prices.slice(0, period).reduce((a, b) => a + b, 0) / period;
  ema.push(sma);
  
  // Calculate EMA for remaining values
  for (let i = period; i < prices.length; i++) {
    const value = (prices[i] - ema[ema.length - 1]) * multiplier + ema[ema.length - 1];
    ema.push(value);
  }
  
  return ema;
}

/**
 * Calculate Relative Strength Index (RSI)
 */
export function calculateRSI(prices: number[], period: number = 14): RSIResult[] {
  if (prices.length < period + 1) return [];
  
  const rsi: RSIResult[] = [];
  const changes: number[] = [];
  
  // Calculate price changes
  for (let i = 1; i < prices.length; i++) {
    changes.push(prices[i] - prices[i - 1]);
  }
  
  // Calculate initial average gain and loss
  let avgGain = 0;
  let avgLoss = 0;
  
  for (let i = 0; i < period; i++) {
    if (changes[i] > 0) {
      avgGain += changes[i];
    } else {
      avgLoss += Math.abs(changes[i]);
    }
  }
  
  avgGain /= period;
  avgLoss /= period;
  
  // Calculate RSI for each point
  for (let i = period; i < changes.length; i++) {
    const rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
    const rsiValue = 100 - (100 / (1 + rs));
    
    rsi.push({
      timestamp: i,
      value: rsiValue,
    });
    
    // Update average gain and loss using smoothing
    const change = changes[i];
    const gain = change > 0 ? change : 0;
    const loss = change < 0 ? Math.abs(change) : 0;
    
    avgGain = (avgGain * (period - 1) + gain) / period;
    avgLoss = (avgLoss * (period - 1) + loss) / period;
  }
  
  return rsi;
}

/**
 * Calculate MACD (Moving Average Convergence Divergence)
 */
export function calculateMACD(
  prices: number[],
  fastPeriod: number = 12,
  slowPeriod: number = 26,
  signalPeriod: number = 9
): MACDResult[] {
  if (prices.length < slowPeriod + signalPeriod) return [];
  
  // Calculate fast and slow EMAs
  const fastEMA = calculateEMA(prices, fastPeriod);
  const slowEMA = calculateEMA(prices, slowPeriod);
  
  // Calculate MACD line (fast EMA - slow EMA)
  const macdLine: number[] = [];
  const startIndex = slowPeriod - fastPeriod;
  
  for (let i = 0; i < slowEMA.length; i++) {
    macdLine.push(fastEMA[i + startIndex] - slowEMA[i]);
  }
  
  // Calculate signal line (EMA of MACD line)
  const signalLine = calculateEMA(macdLine, signalPeriod);
  
  // Calculate histogram (MACD - Signal)
  const results: MACDResult[] = [];
  const histogramStartIndex = signalPeriod - 1;
  
  for (let i = 0; i < signalLine.length; i++) {
    const macdValue = macdLine[i + histogramStartIndex];
    const signalValue = signalLine[i];
    
    results.push({
      timestamp: i + slowPeriod + signalPeriod - 2,
      macdLine: macdValue,
      signalLine: signalValue,
      histogram: macdValue - signalValue,
    });
  }
  
  return results;
}

/**
 * Calculate Moving Average with timestamps
 */
export function calculateMAWithTimestamps(
  data: Array<{ timestamp: number; price: number }>,
  period: number
): MAResult[] {
  if (data.length < period) return [];
  
  const prices = data.map(d => d.price);
  const smaValues = calculateSMA(prices, period);
  
  return smaValues.map((value, index) => ({
    timestamp: data[index + period - 1].timestamp,
    value,
  }));
}
