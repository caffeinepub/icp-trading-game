import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, TrendingUp } from 'lucide-react';

interface RegistrationSuccessProps {
  displayName: string;
  onContinue: () => void;
}

export default function RegistrationSuccess({ displayName, onContinue }: RegistrationSuccessProps) {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex justify-center mb-4">
            <div className="h-16 w-16 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
              <CheckCircle2 className="h-8 w-8 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl text-center">Welcome, {displayName}!</CardTitle>
          <CardDescription className="text-center">
            Your account has been created successfully
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-muted rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Starting Balance</span>
              <span className="text-lg font-bold text-emerald-500">$10,000</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <TrendingUp className="h-4 w-4" />
              <span>Ready to start trading ICP</span>
            </div>
          </div>
          <div className="text-sm text-muted-foreground text-center">
            Compete across multiple game modes and climb the leaderboard!
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={onContinue} className="w-full" size="lg">
            Start Trading
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
