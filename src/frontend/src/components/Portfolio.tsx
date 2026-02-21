import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { usePortfolio } from '../hooks/usePortfolio';
import { TrendingUp, TrendingDown, Loader2 } from 'lucide-react';

export default function Portfolio() {
  const { data: portfolio, isLoading, isRefetching, isError } = usePortfolio();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Portfolio</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            <p>Loading portfolio...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isError || !portfolio) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Portfolio</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-destructive">Failed to load portfolio</p>
        </CardContent>
      </Card>
    );
  }

  const isProfitable = portfolio.realizedPnL >= 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Portfolio Overview</span>
          {isRefetching && (
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Cash Balance</p>
            <p className="text-2xl font-bold">
              ${portfolio.cashBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>

          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">ICP Holdings</p>
            <p className="text-2xl font-bold">
              {portfolio.icpHoldings.toLocaleString('en-US', { minimumFractionDigits: 6, maximumFractionDigits: 6 })}
            </p>
            <p className="text-xs text-muted-foreground">
              ≈ ${portfolio.icpValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>
        </div>

        <div className="border-t pt-4 space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Total Portfolio Value</span>
            <span className="text-xl font-bold">
              ${portfolio.totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Realized P&L</span>
            <span className={`text-lg font-semibold flex items-center gap-1 ${isProfitable ? 'text-emerald-500' : 'text-red-500'}`}>
              {isProfitable ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
              {isProfitable ? '+' : ''}${portfolio.realizedPnL.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
