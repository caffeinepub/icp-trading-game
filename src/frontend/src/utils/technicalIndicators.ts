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

/**
 * Calculate RSI (Relative Strength Index)
 * @param prices Array of price values
 * @param period RSI period (typically 14)
 * @returns Array of RSI results
 */
export function calculateRSI(prices: number[], period: number = 14): RSIResult[] {
  if (prices.length < period + 1) {
    return prices.map((_, index) => ({
      timestamp: Date.now() - (prices.length - index) * 60000,
      value: 50,
    }));
  }

  const results: RSIResult[] = [];
  const gains: number[] = [];
  const losses: number[] = [];

  // Calculate price changes
  for (let i = 1; i < prices.length; i++) {
    const change = prices[i] - prices[i - 1];
    gains.push(change > 0 ? change : 0);
    losses.push(change < 0 ? Math.abs(change) : 0);
  }

  // Calculate initial average gain and loss
  let avgGain = gains.slice(0, period).reduce((a, b) => a + b, 0) / period;
  let avgLoss = losses.slice(0, period).reduce((a, b) => a + b, 0) / period;

  // First RSI value
  const firstRS = avgLoss === 0 ? 100 : avgGain / avgLoss;
  const firstRSI = 100 - 100 / (1 + firstRS);

  // Fill initial values with 50 (neutral)
  for (let i = 0; i < period; i++) {
    results.push({
      timestamp: Date.now() - (prices.length - i) * 60000,
      value: 50,
    });
  }

  results.push({
    timestamp: Date.now() - (prices.length - period) * 60000,
    value: firstRSI,
  });

  // Calculate subsequent RSI values using smoothed averages
  for (let i = period; i < gains.length; i++) {
    avgGain = (avgGain * (period - 1) + gains[i]) / period;
    avgLoss = (avgLoss * (period - 1) + losses[i]) / period;

    const rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
    const rsi = 100 - 100 / (1 + rs);

    results.push({
      timestamp: Date.now() - (prices.length - i - 1) * 60000,
      value: rsi,
    });
  }

  return results;
}

/**
 * Calculate MACD (Moving Average Convergence Divergence)
 * @param prices Array of price values
 * @param fastPeriod Fast EMA period (typically 12)
 * @param slowPeriod Slow EMA period (typically 26)
 * @param signalPeriod Signal line period (typically 9)
 * @returns Array of MACD results
 */
export function calculateMACD(
  prices: number[],
  fastPeriod: number = 12,
  slowPeriod: number = 26,
  signalPeriod: number = 9
): MACDResult[] {
  if (prices.length < slowPeriod) {
    return prices.map((_, index) => ({
      timestamp: Date.now() - (prices.length - index) * 60000,
      macdLine: 0,
      signalLine: 0,
      histogram: 0,
    }));
  }

  const fastEMA = calculateEMA(prices, fastPeriod);
  const slowEMA = calculateEMA(prices, slowPeriod);

  // Calculate MACD line
  const macdLine = fastEMA.map((fast, i) => fast - slowEMA[i]);

  // Calculate signal line (EMA of MACD line)
  const signalLine = calculateEMA(macdLine, signalPeriod);

  // Calculate histogram
  const results: MACDResult[] = macdLine.map((macd, i) => ({
    timestamp: Date.now() - (prices.length - i) * 60000,
    macdLine: macd,
    signalLine: signalLine[i],
    histogram: macd - signalLine[i],
  }));

  return results;
}

/**
 * Calculate SMA (Simple Moving Average)
 * @param prices Array of price values
 * @param period Moving average period
 * @returns Array of SMA values
 */
export function calculateSMA(prices: number[], period: number): number[] {
  const result: number[] = [];

  for (let i = 0; i < prices.length; i++) {
    if (i < period - 1) {
      result.push(NaN);
    } else {
      const sum = prices.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0);
      result.push(sum / period);
    }
  }

  return result;
}

/**
 * Calculate EMA (Exponential Moving Average)
 * @param prices Array of price values
 * @param period EMA period
 * @returns Array of EMA values
 */
export function calculateEMA(prices: number[], period: number): number[] {
  if (prices.length === 0) return [];

  const k = 2 / (period + 1);
  const ema: number[] = [];

  // Start with SMA for the first value
  const firstSMA = prices.slice(0, period).reduce((a, b) => a + b, 0) / period;
  ema.push(firstSMA);

  // Calculate EMA for subsequent values
  for (let i = period; i < prices.length; i++) {
    const value = prices[i] * k + ema[ema.length - 1] * (1 - k);
    ema.push(value);
  }

  // Fill initial values with NaN
  const result = new Array(period - 1).fill(NaN).concat(ema);

  return result;
}
