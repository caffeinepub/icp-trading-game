import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useTransactionHistory } from '@/hooks/useTransactionHistory';
import { Loader2, TrendingUp, TrendingDown } from 'lucide-react';
import { TransactionType } from '@/backend';

export default function TransactionHistory() {
  const { transactions, isLoading } = useTransactionHistory();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (transactions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <p className="text-muted-foreground">No transactions yet</p>
            <p className="text-sm text-muted-foreground mt-2">
              Your buy and sell transactions will appear here
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const formatDate = (timestamp: bigint) => {
    const date = new Date(Number(timestamp) / 1000000);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Transaction History</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead>Date & Time</TableHead>
                <TableHead className="text-right">ICP Amount</TableHead>
                <TableHead className="text-right">Price</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead className="text-right">Cash Balance</TableHead>
                <TableHead className="text-right">ICP Balance</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.map((tx, index) => {
                const isBuy = tx.transactionType === TransactionType.buy;
                const total = tx.icpAmount * tx.price;
                
                return (
                  <TableRow key={index}>
                    <TableCell>
                      <Badge
                        variant={isBuy ? 'default' : 'secondary'}
                        className={isBuy ? 'bg-emerald-500 hover:bg-emerald-600' : 'bg-red-500 hover:bg-red-600'}
                      >
                        {isBuy ? (
                          <TrendingUp className="h-3 w-3 mr-1" />
                        ) : (
                          <TrendingDown className="h-3 w-3 mr-1" />
                        )}
                        {isBuy ? 'Buy' : 'Sell'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDate(tx.timestamp)}
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      {tx.icpAmount.toFixed(4)} ICP
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      ${tx.price.toFixed(2)}
                    </TableCell>
                    <TableCell className="text-right font-mono font-semibold">
                      ${total.toFixed(2)}
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      ${tx.cashBalanceAfter.toFixed(2)}
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      {tx.icpBalanceAfter.toFixed(4)} ICP
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
