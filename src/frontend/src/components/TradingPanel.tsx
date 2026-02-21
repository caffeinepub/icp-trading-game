import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useBuyICP, useSellICP, parseBackendError } from '../hooks/useTradingActions';
import { usePortfolio } from '../hooks/usePortfolio';
import { useICPPriceData } from '../hooks/useICPPriceData';
import { Loader2, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function TradingPanel() {
  const [inputMode, setInputMode] = useState<'usd' | 'icp'>('usd');
  const [usdAmount, setUsdAmount] = useState('');
  const [icpAmount, setIcpAmount] = useState('');

  const { data: priceData } = useICPPriceData('1h');
  const currentPrice = priceData?.currentPrice || 0;
  
  const { data: portfolio, isLoading: portfolioLoading, error: portfolioError } = usePortfolio();
  const buyMutation = useBuyICP();
  const sellMutation = useSellICP();

  const handleUsdChange = (value: string) => {
    setUsdAmount(value);
    if (value && currentPrice > 0) {
      const icp = parseFloat(value) / currentPrice;
      setIcpAmount(icp.toFixed(6));
    } else {
      setIcpAmount('');
    }
  };

  const handleIcpChange = (value: string) => {
    setIcpAmount(value);
    if (value && currentPrice > 0) {
      const usd = parseFloat(value) * currentPrice;
      setUsdAmount(usd.toFixed(2));
    } else {
      setUsdAmount('');
    }
  };

  const handleBuy = async () => {
    if (!usdAmount || parseFloat(usdAmount) <= 0) return;
    
    try {
      await buyMutation.mutateAsync(parseFloat(usdAmount));
      toast.success('ICP purchased successfully', {
        icon: <CheckCircle2 className="h-4 w-4" />,
      });
      setUsdAmount('');
      setIcpAmount('');
    } catch (error: any) {
      console.error('Buy failed:', error);
      const errorMessage = parseBackendError(error);
      
      // Show appropriate error message based on error type
      if (errorMessage.includes('registration') || errorMessage.includes('registered')) {
        toast.error('Registration Required', {
          icon: <AlertCircle className="h-4 w-4" />,
          description: errorMessage,
          duration: 5000,
        });
      } else if (errorMessage.includes('Insufficient')) {
        toast.error('Insufficient Balance', {
          icon: <XCircle className="h-4 w-4" />,
          description: errorMessage,
        });
      } else {
        toast.error('Transaction Failed', {
          icon: <XCircle className="h-4 w-4" />,
          description: errorMessage,
        });
      }
    }
  };

  const handleSell = async () => {
    if (!icpAmount || parseFloat(icpAmount) <= 0) return;
    
    try {
      await sellMutation.mutateAsync(parseFloat(icpAmount));
      toast.success('ICP sold successfully', {
        icon: <CheckCircle2 className="h-4 w-4" />,
      });
      setUsdAmount('');
      setIcpAmount('');
    } catch (error: any) {
      console.error('Sell failed:', error);
      const errorMessage = parseBackendError(error);
      
      // Show appropriate error message based on error type
      if (errorMessage.includes('registration') || errorMessage.includes('registered')) {
        toast.error('Registration Required', {
          icon: <AlertCircle className="h-4 w-4" />,
          description: errorMessage,
          duration: 5000,
        });
      } else if (errorMessage.includes('Insufficient')) {
        toast.error('Insufficient Balance', {
          icon: <XCircle className="h-4 w-4" />,
          description: errorMessage,
        });
      } else {
        toast.error('Transaction Failed', {
          icon: <XCircle className="h-4 w-4" />,
          description: errorMessage,
        });
      }
    }
  };

  const isBuying = buyMutation.isPending;
  const isSelling = sellMutation.isPending;

  // Show error state if portfolio fails to load
  if (portfolioError) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Trade ICP</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 space-y-4">
            <AlertCircle className="h-12 w-12 text-muted-foreground" />
            <div className="text-center space-y-2">
              <p className="text-sm font-medium">Account Initialization</p>
              <p className="text-xs text-muted-foreground">
                Setting up your trading account. Please wait a moment...
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.location.reload()}
            >
              Refresh Page
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Trade ICP</span>
          <span className="text-sm font-normal text-muted-foreground">
            ${currentPrice.toFixed(2)}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="buy" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="buy">Buy</TabsTrigger>
            <TabsTrigger value="sell">Sell</TabsTrigger>
          </TabsList>

          <TabsContent value="buy" className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Amount</label>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant={inputMode === 'usd' ? 'default' : 'outline'}
                    onClick={() => setInputMode('usd')}
                  >
                    USD
                  </Button>
                  <Button
                    size="sm"
                    variant={inputMode === 'icp' ? 'default' : 'outline'}
                    onClick={() => setInputMode('icp')}
                  >
                    ICP
                  </Button>
                </div>
              </div>

              {inputMode === 'usd' ? (
                <div className="space-y-2">
                  <Input
                    type="number"
                    placeholder="0.00"
                    value={usdAmount}
                    onChange={(e) => handleUsdChange(e.target.value)}
                    disabled={isBuying}
                  />
                  {icpAmount && (
                    <p className="text-sm text-muted-foreground">
                      ≈ {icpAmount} ICP
                    </p>
                  )}
                </div>
              ) : (
                <div className="space-y-2">
                  <Input
                    type="number"
                    placeholder="0.000000"
                    value={icpAmount}
                    onChange={(e) => handleIcpChange(e.target.value)}
                    disabled={isBuying}
                  />
                  {usdAmount && (
                    <p className="text-sm text-muted-foreground">
                      ≈ ${usdAmount}
                    </p>
                  )}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Available Cash:</span>
                <span className="font-medium">
                  {portfolioLoading ? (
                    <Loader2 className="h-3 w-3 animate-spin inline" />
                  ) : (
                    `$${portfolio?.cashBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                  )}
                </span>
              </div>
            </div>

            <Button
              className="w-full"
              onClick={handleBuy}
              disabled={!usdAmount || parseFloat(usdAmount) <= 0 || isBuying || portfolioLoading}
            >
              {isBuying ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Buying...
                </>
              ) : (
                'Buy ICP'
              )}
            </Button>
          </TabsContent>

          <TabsContent value="sell" className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Amount</label>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant={inputMode === 'usd' ? 'default' : 'outline'}
                    onClick={() => setInputMode('usd')}
                  >
                    USD
                  </Button>
                  <Button
                    size="sm"
                    variant={inputMode === 'icp' ? 'default' : 'outline'}
                    onClick={() => setInputMode('icp')}
                  >
                    ICP
                  </Button>
                </div>
              </div>

              {inputMode === 'usd' ? (
                <div className="space-y-2">
                  <Input
                    type="number"
                    placeholder="0.00"
                    value={usdAmount}
                    onChange={(e) => handleUsdChange(e.target.value)}
                    disabled={isSelling}
                  />
                  {icpAmount && (
                    <p className="text-sm text-muted-foreground">
                      ≈ {icpAmount} ICP
                    </p>
                  )}
                </div>
              ) : (
                <div className="space-y-2">
                  <Input
                    type="number"
                    placeholder="0.000000"
                    value={icpAmount}
                    onChange={(e) => handleIcpChange(e.target.value)}
                    disabled={isSelling}
                  />
                  {usdAmount && (
                    <p className="text-sm text-muted-foreground">
                      ≈ ${usdAmount}
                    </p>
                  )}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Available ICP:</span>
                <span className="font-medium">
                  {portfolioLoading ? (
                    <Loader2 className="h-3 w-3 animate-spin inline" />
                  ) : (
                    `${portfolio?.icpHoldings.toLocaleString('en-US', { minimumFractionDigits: 6, maximumFractionDigits: 6 })} ICP`
                  )}
                </span>
              </div>
            </div>

            <Button
              className="w-full"
              variant="destructive"
              onClick={handleSell}
              disabled={!icpAmount || parseFloat(icpAmount) <= 0 || isSelling || portfolioLoading}
            >
              {isSelling ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Selling...
                </>
              ) : (
                'Sell ICP'
              )}
            </Button>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
