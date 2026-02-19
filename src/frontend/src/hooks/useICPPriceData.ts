import { useQuery } from '@tanstack/react-query';

interface PriceDataPoint {
  timestamp: number;
  price: number;
}

interface CoinGeckoPriceResponse {
  'internet-computer': {
    usd: number;
  };
}

interface CoinGeckoMarketChartResponse {
  prices: [number, number][];
}

export function useCurrentICPPrice() {
  return useQuery<number>({
    queryKey: ['icp-price'],
    queryFn: async () => {
      try {
        // Use CoinGecko API for current ICP price
        const response = await fetch(
          'https://api.coingecko.com/api/v3/simple/price?ids=internet-computer&vs_currencies=usd'
        );
        
        if (!response.ok) {
          throw new Error('Failed to fetch price from CoinGecko');
        }
        
        const data: CoinGeckoPriceResponse = await response.json();
        return data['internet-computer']?.usd || 0;
      } catch (error) {
        console.error('Error fetching ICP price from CoinGecko:', error);
        // Return fallback price
        return 8.5;
      }
    },
    refetchInterval: 30000, // Refetch every 30 seconds
    staleTime: 20000,
  });
}

export function useHistoricalPriceData(days: number) {
  return useQuery<PriceDataPoint[]>({
    queryKey: ['icp-price-history', days],
    queryFn: async () => {
      try {
        // Use CoinGecko market chart API for historical data
        const response = await fetch(
          `https://api.coingecko.com/api/v3/coins/internet-computer/market_chart?vs_currency=usd&days=${days}`
        );
        
        if (!response.ok) {
          throw new Error('Failed to fetch historical data from CoinGecko');
        }
        
        const data: CoinGeckoMarketChartResponse = await response.json();
        
        if (!data.prices || data.prices.length === 0) {
          throw new Error('No price data available');
        }
        
        // Convert CoinGecko format [timestamp, price] to our format
        return data.prices.map(([timestamp, price]) => ({
          timestamp,
          price,
        }));
      } catch (error) {
        console.error('Error fetching historical price data from CoinGecko:', error);
        // Return synthetic data as fallback
        return generateSyntheticPriceData(days);
      }
    },
    refetchInterval: 300000, // Refetch every 5 minutes
    staleTime: 240000,
  });
}

// Generate synthetic price data for demo purposes when API is unavailable
function generateSyntheticPriceData(days: number): PriceDataPoint[] {
  const basePrice = 8.5; // Base ICP price
  const volatility = 0.15; // 15% volatility
  const now = Date.now();
  const interval = days === 1 ? 30 * 60 * 1000 : 
                  days <= 7 ? 4 * 60 * 60 * 1000 : 
                  days <= 30 ? 12 * 60 * 60 * 1000 : 
                  24 * 60 * 60 * 1000;
  
  const numPoints = Math.floor((days * 24 * 60 * 60 * 1000) / interval);
  const points: PriceDataPoint[] = [];
  
  let currentPrice = basePrice;
  
  for (let i = 0; i < numPoints; i++) {
    const timestamp = now - (numPoints - i) * interval;
    
    // Random walk with mean reversion
    const change = (Math.random() - 0.5) * volatility * basePrice;
    const meanReversion = (basePrice - currentPrice) * 0.1;
    currentPrice += change + meanReversion;
    
    points.push({
      timestamp,
      price: currentPrice,
    });
  }
  
  return points;
}
