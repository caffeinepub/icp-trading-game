import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { usePositions } from '@/hooks/usePositions';
import { useLeverageActions } from '@/hooks/useLeverageActions';
import { useCurrentICPPrice } from '@/hooks/useICPPriceData';
import { TrendingUp, TrendingDown, X } from 'lucide-react';
import { PositionType } from '@/backend';

export default function Positions() {
  const { data: positions = [], isLoading, error } = usePositions();
  const { closePosition, isClosing } = useLeverageActions();
  const { data: currentPrice = 0 } = useCurrentICPPrice();

  const handleClosePosition = async (positionIndex: number) => {
    try {
      await closePosition(positionIndex, currentPrice);
    } catch (error) {
      // Error is handled by the mutation
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto">
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-48" />
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto">
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <p>Failed to load positions. Please try again.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Active Leveraged Positions</CardTitle>
          <p className="text-sm text-muted-foreground">
            Your open leveraged long and short positions
          </p>
        </CardHeader>
        <CardContent>
          {positions.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">
              <p>No active positions. Open a leveraged position to get started.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>Leverage</TableHead>
                    <TableHead className="text-right">Entry Price</TableHead>
                    <TableHead className="text-right">Current Price</TableHead>
                    <TableHead className="text-right">ICP Amount</TableHead>
                    <TableHead className="text-right">Margin</TableHead>
                    <TableHead className="text-right">Unrealized P&L</TableHead>
                    <TableHead className="text-right">Liquidation Price</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {positions.map((position, index) => {
                    const isLong = position.positionType === PositionType.long_;
                    const pnlPositive = position.unrealizedPnL >= 0;
                    
                    return (
                      <TableRow key={index}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {isLong ? (
                              <>
                                <TrendingUp className="h-4 w-4 text-emerald-500" />
                                <span className="font-medium text-emerald-500">Long</span>
                              </>
                            ) : (
                              <>
                                <TrendingDown className="h-4 w-4 text-red-500" />
                                <span className="font-medium text-red-500">Short</span>
                              </>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="font-medium">{position.leverage}x</span>
                        </TableCell>
                        <TableCell className="text-right font-mono">
                          ${position.entryPrice.toFixed(2)}
                        </TableCell>
                        <TableCell className="text-right font-mono">
                          ${currentPrice.toFixed(2)}
                        </TableCell>
                        <TableCell className="text-right font-mono">
                          {position.amountICP.toFixed(4)} ICP
                        </TableCell>
                        <TableCell className="text-right font-mono">
                          ${position.margin.toFixed(2)}
                        </TableCell>
                        <TableCell className="text-right">
                          <span className={`font-semibold ${pnlPositive ? 'text-emerald-500' : 'text-red-500'}`}>
                            {pnlPositive ? '+' : ''}${position.unrealizedPnL.toFixed(2)}
                          </span>
                        </TableCell>
                        <TableCell className="text-right font-mono">
                          <span className="text-orange-500 font-medium">
                            ${position.liquidationPrice.toFixed(2)}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleClosePosition(index)}
                            disabled={isClosing}
                            className="h-8 w-8 p-0"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
