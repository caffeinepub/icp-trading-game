import { useQuery } from '@tanstack/react-query';

type Timeframe = '1' | '7' | '30' | '90' | '180';

interface PriceDataPoint {
  timestamp: number;
  price: number;
}

export function useICPPriceData(timeframe: Timeframe) {
  return useQuery<PriceDataPoint[]>({
    queryKey: ['icp-price', timeframe],
    queryFn: async () => {
      const days = timeframe;
      const url = `https://api.coingecko.com/api/v3/coins/internet-computer/market_chart?vs_currency=usd&days=${days}`;
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Failed to fetch price data');
      }
      
      const data = await response.json();
      
      // Transform the data into our format
      return data.prices.map(([timestamp, price]: [number, number]) => ({
        timestamp,
        price,
      }));
    },
    staleTime: 60000, // Consider data fresh for 1 minute
    refetchInterval: 60000, // Refetch every minute
  });
}

export function useCurrentICPPrice() {
  return useQuery<number>({
    queryKey: ['icp-current-price'],
    queryFn: async () => {
      const url = 'https://api.coingecko.com/api/v3/simple/price?ids=internet-computer&vs_currencies=usd';
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Failed to fetch current price');
      }
      
      const data = await response.json();
      return data['internet-computer']?.usd || 0;
    },
    staleTime: 30000, // Consider data fresh for 30 seconds
    refetchInterval: 30000, // Refetch every 30 seconds
  });
}
