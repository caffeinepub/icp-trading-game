import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useTradingActions } from '@/hooks/useTradingActions';
import { Loader2, ArrowLeftRight } from 'lucide-react';
import { usePortfolio } from '@/hooks/usePortfolio';

type InputMode = 'icp' | 'dollar';

export default function TradingPanel() {
  const [buyAmount, setBuyAmount] = useState('');
  const [sellAmount, setSellAmount] = useState('');
  const [buyInputMode, setBuyInputMode] = useState<InputMode>('icp');
  const [sellInputMode, setSellInputMode] = useState<InputMode>('icp');
  const { currentPrice, isLoadingPrice, buyICP, sellICP, isBuying, isSelling } = useTradingActions();
  const { portfolio } = usePortfolio();

  const handleBuy = async () => {
    let icpAmount: number;
    
    if (buyInputMode === 'dollar') {
      const dollarAmount = parseFloat(buyAmount);
      if (isNaN(dollarAmount) || dollarAmount <= 0 || currentPrice <= 0) return;
      icpAmount = dollarAmount / currentPrice;
    } else {
      icpAmount = parseFloat(buyAmount);
      if (isNaN(icpAmount) || icpAmount <= 0) return;
    }
    
    const success = await buyICP(icpAmount);
    if (success) {
      setBuyAmount('');
    }
  };

  const handleSell = async () => {
    let icpAmount: number;
    
    if (sellInputMode === 'dollar') {
      const dollarAmount = parseFloat(sellAmount);
      if (isNaN(dollarAmount) || dollarAmount <= 0 || currentPrice <= 0) return;
      icpAmount = dollarAmount / currentPrice;
    } else {
      icpAmount = parseFloat(sellAmount);
      if (isNaN(icpAmount) || icpAmount <= 0) return;
    }
    
    const success = await sellICP(icpAmount);
    if (success) {
      setSellAmount('');
    }
  };

  const toggleBuyInputMode = () => {
    setBuyInputMode(prev => prev === 'icp' ? 'dollar' : 'icp');
    setBuyAmount('');
  };

  const toggleSellInputMode = () => {
    setSellInputMode(prev => prev === 'icp' ? 'dollar' : 'icp');
    setSellAmount('');
  };

  const handleBuyMax = () => {
    if (!portfolio || portfolio.cashBalance <= 0 || currentPrice <= 0) return;
    
    if (buyInputMode === 'dollar') {
      // In dollar mode, set to full cash balance
      setBuyAmount(portfolio.cashBalance.toFixed(2));
    } else {
      // In ICP mode, calculate max ICP purchasable
      const maxICP = portfolio.cashBalance / currentPrice;
      setBuyAmount(maxICP.toFixed(4));
    }
  };

  const handleSellMax = () => {
    if (!portfolio || portfolio.icpBalance <= 0 || currentPrice <= 0) return;
    
    if (sellInputMode === 'dollar') {
      // In dollar mode, calculate dollar value of all ICP
      const dollarValue = portfolio.icpBalance * currentPrice;
      setSellAmount(dollarValue.toFixed(2));
    } else {
      // In ICP mode, set to full ICP balance
      setSellAmount(portfolio.icpBalance.toFixed(4));
    }
  };

  // Calculate display values for buy tab
  let buyICPAmount = 0;
  let buyCost = 0;
  
  if (buyInputMode === 'dollar') {
    const dollarAmount = parseFloat(buyAmount) || 0;
    buyICPAmount = currentPrice > 0 ? dollarAmount / currentPrice : 0;
    buyCost = dollarAmount;
  } else {
    buyICPAmount = parseFloat(buyAmount) || 0;
    buyCost = buyICPAmount * currentPrice;
  }

  // Calculate display values for sell tab
  let sellICPAmount = 0;
  let sellProceeds = 0;
  
  if (sellInputMode === 'dollar') {
    const dollarAmount = parseFloat(sellAmount) || 0;
    sellICPAmount = currentPrice > 0 ? dollarAmount / currentPrice : 0;
    sellProceeds = dollarAmount;
  } else {
    sellICPAmount = parseFloat(sellAmount) || 0;
    sellProceeds = sellICPAmount * currentPrice;
  }

  // Validation
  const canBuy = buyAmount && buyICPAmount > 0 && !isBuying && !isLoadingPrice && 
                 (!portfolio || buyCost <= portfolio.cashBalance);
  const canSell = sellAmount && sellICPAmount > 0 && !isSelling && !isLoadingPrice &&
                  (!portfolio || sellICPAmount <= portfolio.icpBalance);

  const canBuyMax = portfolio && portfolio.cashBalance > 0 && currentPrice > 0 && !isBuying;
  const canSellMax = portfolio && portfolio.icpBalance > 0 && currentPrice > 0 && !isSelling;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Trade ICP</CardTitle>
        {!isLoadingPrice && (
          <p className="text-sm text-muted-foreground">
            Current Price: <span className="font-semibold text-foreground">${currentPrice.toFixed(2)}</span>
          </p>
        )}
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="buy">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="buy">Buy</TabsTrigger>
            <TabsTrigger value="sell">Sell</TabsTrigger>
          </TabsList>

          <TabsContent value="buy" className="space-y-4">
            {portfolio && (
              <div className="rounded-lg bg-muted/50 p-3 text-sm">
                <p className="text-muted-foreground">
                  Available Cash: <span className="font-semibold text-foreground">${portfolio.cashBalance.toFixed(2)}</span>
                </p>
              </div>
            )}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="buy-amount">
                  {buyInputMode === 'icp' ? 'Amount (ICP)' : 'Amount (USD)'}
                </Label>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleBuyInputMode}
                  className="h-6 px-2 text-xs"
                >
                  <ArrowLeftRight className="h-3 w-3 mr-1" />
                  {buyInputMode === 'icp' ? 'Switch to $' : 'Switch to ICP'}
                </Button>
              </div>
              <div className="flex gap-2">
                <Input
                  id="buy-amount"
                  type="number"
                  placeholder="0.00"
                  value={buyAmount}
                  onChange={(e) => setBuyAmount(e.target.value)}
                  min="0"
                  step="0.01"
                  className="flex-1"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleBuyMax}
                  disabled={!canBuyMax}
                  className="px-4"
                >
                  MAX
                </Button>
              </div>
              {buyAmount && parseFloat(buyAmount) > 0 && (
                <div className="space-y-1 text-sm text-muted-foreground">
                  {buyInputMode === 'dollar' ? (
                    <>
                      <p>
                        ICP Amount: <span className="font-semibold text-foreground">{buyICPAmount.toFixed(4)} ICP</span>
                      </p>
                      <p>
                        Cost: <span className="font-semibold text-foreground">${buyCost.toFixed(2)}</span>
                      </p>
                    </>
                  ) : (
                    <p>
                      Cost: <span className="font-semibold text-foreground">${buyCost.toFixed(2)}</span>
                    </p>
                  )}
                  {portfolio && buyCost > portfolio.cashBalance && (
                    <p className="text-red-500 text-xs">
                      Insufficient funds (Available: ${portfolio.cashBalance.toFixed(2)})
                    </p>
                  )}
                </div>
              )}
            </div>
            <Button
              onClick={handleBuy}
              disabled={!canBuy}
              className="w-full"
            >
              {isBuying && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Buy ICP
            </Button>
          </TabsContent>

          <TabsContent value="sell" className="space-y-4">
            {portfolio && (
              <div className="rounded-lg bg-muted/50 p-3 text-sm">
                <p className="text-muted-foreground">
                  Available ICP to Sell: <span className="font-semibold text-foreground">{portfolio.icpBalance.toFixed(4)} ICP</span>
                </p>
              </div>
            )}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="sell-amount">
                  {sellInputMode === 'icp' ? 'Amount (ICP)' : 'Amount (USD)'}
                </Label>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleSellInputMode}
                  className="h-6 px-2 text-xs"
                >
                  <ArrowLeftRight className="h-3 w-3 mr-1" />
                  {sellInputMode === 'icp' ? 'Switch to $' : 'Switch to ICP'}
                </Button>
              </div>
              <div className="flex gap-2">
                <Input
                  id="sell-amount"
                  type="number"
                  placeholder="0.00"
                  value={sellAmount}
                  onChange={(e) => setSellAmount(e.target.value)}
                  min="0"
                  step="0.01"
                  className="flex-1"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSellMax}
                  disabled={!canSellMax}
                  className="px-4"
                >
                  MAX
                </Button>
              </div>
              {sellAmount && parseFloat(sellAmount) > 0 && (
                <div className="space-y-1 text-sm text-muted-foreground">
                  {sellInputMode === 'dollar' ? (
                    <>
                      <p>
                        ICP Amount: <span className="font-semibold text-foreground">{sellICPAmount.toFixed(4)} ICP</span>
                      </p>
                      <p>
                        Proceeds: <span className="font-semibold text-foreground">${sellProceeds.toFixed(2)}</span>
                      </p>
                    </>
                  ) : (
                    <p>
                      Proceeds: <span className="font-semibold text-foreground">${sellProceeds.toFixed(2)}</span>
                    </p>
                  )}
                  {portfolio && sellICPAmount > portfolio.icpBalance && (
                    <p className="text-red-500 text-xs">
                      Insufficient ICP (Available: {portfolio.icpBalance.toFixed(4)} ICP)
                    </p>
                  )}
                </div>
              )}
            </div>
            <Button
              onClick={handleSell}
              disabled={!canSell}
              className="w-full"
              variant="secondary"
            >
              {isSelling && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Sell ICP
            </Button>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
