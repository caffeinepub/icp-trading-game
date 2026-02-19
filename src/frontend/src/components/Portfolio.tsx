import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { usePortfolio } from '@/hooks/usePortfolio';
import { useIsCallerAdmin } from '@/hooks/useQueries';
import { useTradingActions } from '@/hooks/useTradingActions';
import { Wallet, TrendingUp, DollarSign, RotateCcw, Target, TrendingDown } from 'lucide-react';

export default function Portfolio() {
  const { portfolio, isLoading, error } = usePortfolio();
  const { data: isAdmin = false, isLoading: isLoadingAdmin } = useIsCallerAdmin();
  const { resetAccount, isResetting } = useTradingActions();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleReset = async () => {
    const success = await resetAccount();
    if (success) {
      setIsDialogOpen(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-32" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error || !portfolio) {
    return (
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <p>Failed to load portfolio. Please try again.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const profitLossPercent = (portfolio.profitLoss / 10000) * 100;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cash Balance</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${portfolio.cashBalance.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground mt-1">Available for trading</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">ICP Holdings</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{portfolio.icpBalance.toFixed(4)} ICP</div>
            <p className="text-xs text-muted-foreground mt-1">
              ≈ ${portfolio.icpValue.toFixed(2)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Margin Locked</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${portfolio.totalMarginLocked.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground mt-1">In leveraged positions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unrealized P&L</CardTitle>
            {portfolio.totalUnrealizedPnL >= 0 ? (
              <TrendingUp className="h-4 w-4 text-emerald-500" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-500" />
            )}
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-bold ${
                portfolio.totalUnrealizedPnL >= 0 ? 'text-emerald-500' : 'text-red-500'
              }`}
            >
              {portfolio.totalUnrealizedPnL >= 0 ? '+' : ''}${portfolio.totalUnrealizedPnL.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">From open positions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Portfolio Value</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${portfolio.totalValue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Cash + ICP + Margin + Unrealized P&L
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Profit/Loss</CardTitle>
            {portfolio.profitLoss >= 0 ? (
              <TrendingUp className="h-4 w-4 text-emerald-500" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-500" />
            )}
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-bold ${
                portfolio.profitLoss >= 0 ? 'text-emerald-500' : 'text-red-500'
              }`}
            >
              {portfolio.profitLoss >= 0 ? '+' : ''}${portfolio.profitLoss.toFixed(2)}
            </div>
            <p
              className={`text-xs mt-1 ${
                portfolio.profitLoss >= 0 ? 'text-emerald-500' : 'text-red-500'
              }`}
            >
              {portfolio.profitLoss >= 0 ? '+' : ''}
              {profitLossPercent.toFixed(2)}% from $10,000 start
            </p>
          </CardContent>
        </Card>
      </div>

      {isAdmin && !isLoadingAdmin && (
        <Card className="border-amber-500/50">
          <CardHeader>
            <CardTitle className="text-amber-500">Admin Controls</CardTitle>
          </CardHeader>
          <CardContent>
            <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <AlertDialogTrigger asChild>
                <Button variant="outline" className="w-full">
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Reset Account
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Reset Account?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will reset your account to the initial state with $10,000 cash balance.
                    All ICP holdings and positions will be cleared. This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleReset} disabled={isResetting}>
                    {isResetting ? 'Resetting...' : 'Reset Account'}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
