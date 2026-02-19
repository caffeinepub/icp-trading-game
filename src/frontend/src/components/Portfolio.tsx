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
import { Wallet, TrendingUp, DollarSign, RotateCcw } from 'lucide-react';

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
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  if (error) {
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

  if (!portfolio) {
    return (
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <p>No portfolio data available. Start trading to see your portfolio.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const profitLoss = portfolio.totalValue - 10000;
  const profitLossPercent = (profitLoss / 10000) * 100;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="grid md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cash Balance</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${portfolio.cashBalance.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground mt-1">Available to trade</p>
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
            <CardTitle className="text-sm font-medium">Total Value</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${portfolio.totalValue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground mt-1">Portfolio value</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Profit & Loss</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Starting Balance</span>
              <span className="font-semibold">$10,000.00</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Current Value</span>
              <span className="font-semibold">${portfolio.totalValue.toFixed(2)}</span>
            </div>
            <div className="border-t pt-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Net P&L</span>
                <div className="text-right">
                  <div
                    className={`text-xl font-bold ${
                      profitLoss >= 0 ? 'text-emerald-500' : 'text-red-500'
                    }`}
                  >
                    {profitLoss >= 0 ? '+' : ''}${profitLoss.toFixed(2)}
                  </div>
                  <div
                    className={`text-sm ${
                      profitLoss >= 0 ? 'text-emerald-500' : 'text-red-500'
                    }`}
                  >
                    {profitLoss >= 0 ? '+' : ''}
                    {profitLossPercent.toFixed(2)}%
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {isAdmin && !isLoadingAdmin && (
        <Card className="border-destructive/50">
          <CardHeader>
            <CardTitle className="text-destructive">Admin Controls</CardTitle>
          </CardHeader>
          <CardContent>
            <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" disabled={isResetting}>
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Reset Account
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will reset your account to $10,000 cash and 0 ICP. This action cannot be undone.
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
