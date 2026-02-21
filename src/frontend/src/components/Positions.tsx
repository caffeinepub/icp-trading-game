import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { usePositions } from '@/hooks/usePositions';
import { useLeverageActions } from '@/hooks/useLeverageActions';
import { Loader2, TrendingUp, TrendingDown, AlertTriangle } from 'lucide-react';
import { useActor } from '@/hooks/useActor';

export default function Positions() {
  const { positions, isLoading } = usePositions();
  const { closePosition, isClosing } = useLeverageActions();
  const { actor, isFetching } = useActor();
  
  // Compute initialization state from actor availability
  const isInitializing = !actor || isFetching;

  const handleClosePosition = async (index: number) => {
    await closePosition(index);
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Open Positions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (positions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Open Positions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <p className="text-muted-foreground">No open positions</p>
            <p className="text-sm text-muted-foreground mt-2">
              Open a leveraged position from the trading panel
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Open Positions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead>Leverage</TableHead>
                <TableHead>Entry Price</TableHead>
                <TableHead>Current Price</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Margin</TableHead>
                <TableHead>P&L</TableHead>
                <TableHead>Liquidation</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {positions.map((position, index) => {
                const isLong = position.positionType === 'long';
                const isProfitable = position.unrealizedPnL >= 0;
                const nearLiquidation = isLong
                  ? position.currentPrice <= position.liquidationPrice * 1.1
                  : position.currentPrice >= position.liquidationPrice * 0.9;

                return (
                  <TableRow key={index}>
                    <TableCell>
                      <Badge
                        variant={isLong ? 'default' : 'secondary'}
                        className={isLong ? 'bg-emerald-500 hover:bg-emerald-600' : 'bg-red-500 hover:bg-red-600'}
                      >
                        {isLong ? (
                          <TrendingUp className="h-3 w-3 mr-1" />
                        ) : (
                          <TrendingDown className="h-3 w-3 mr-1" />
                        )}
                        {isLong ? 'Long' : 'Short'}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium">{position.leverage}x</TableCell>
                    <TableCell>${position.entryPrice.toFixed(2)}</TableCell>
                    <TableCell>${position.currentPrice.toFixed(2)}</TableCell>
                    <TableCell>{position.amountICP.toFixed(4)} ICP</TableCell>
                    <TableCell>${position.margin.toFixed(2)}</TableCell>
                    <TableCell>
                      <span className={`font-semibold ${isProfitable ? 'text-emerald-500' : 'text-red-500'}`}>
                        {isProfitable ? '+' : ''}${position.unrealizedPnL.toFixed(2)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {nearLiquidation && <AlertTriangle className="h-4 w-4 text-yellow-500" />}
                        ${position.liquidationPrice.toFixed(2)}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleClosePosition(index)}
                        disabled={isClosing || isInitializing}
                      >
                        {isClosing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Close
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
