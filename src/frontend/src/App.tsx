import { useEffect, useState } from 'react';
import { useInternetIdentity } from './hooks/useInternetIdentity';
import { useActor } from './hooks/useActor';
import { useGetCallerUserProfile } from './hooks/useQueries';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { TrendingUp, LogOut, AlertCircle, Loader2 } from 'lucide-react';
import PriceChart from './components/PriceChart';
import TradingPanel from './components/TradingPanel';
import Portfolio from './components/Portfolio';
import Leaderboard from './components/Leaderboard';
import Positions from './components/Positions';
import TransactionHistory from './components/TransactionHistory';
import GameModeSelector from './components/GameModeSelector';
import GameTimer from './components/GameTimer';
import RegistrationForm from './components/RegistrationForm';
import RegistrationSuccess from './components/RegistrationSuccess';
import { Toaster } from '@/components/ui/sonner';
import { ThemeProvider } from 'next-themes';
import { GameModeProvider, useGameMode } from './contexts/GameModeContext';
import { useQueryClient } from '@tanstack/react-query';

type RegistrationState = 'checking' | 'needs-registration' | 'registration-success' | 'registered';

function AppContent() {
  const { identity, login, clear, isLoggingIn } = useInternetIdentity();
  const { actor } = useActor();
  const { gameMode } = useGameMode();
  const queryClient = useQueryClient();
  const isAuthenticated = !!identity && !identity.getPrincipal().isAnonymous();
  const [initializationError, setInitializationError] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(false);
  const [registrationState, setRegistrationState] = useState<RegistrationState>('checking');
  const [registeredDisplayName, setRegisteredDisplayName] = useState<string>('');

  const { data: userProfile, isLoading: profileLoading, isFetched } = useGetCallerUserProfile();

  // Check registration status after authentication
  useEffect(() => {
    if (isAuthenticated && !profileLoading && isFetched) {
      if (userProfile === null) {
        setRegistrationState('needs-registration');
      } else {
        setRegistrationState('registered');
      }
    } else if (isAuthenticated && profileLoading) {
      setRegistrationState('checking');
    }
  }, [isAuthenticated, userProfile, profileLoading, isFetched]);

  // Initialize account after registration is complete
  useEffect(() => {
    if (registrationState === 'registered' && isAuthenticated && actor) {
      setIsInitializing(true);
      setInitializationError(null);
      
      actor.getOrCreateAccount()
        .then(() => {
          console.log('Account initialized successfully');
          setInitializationError(null);
          queryClient.invalidateQueries({ queryKey: ['portfolio'] });
          queryClient.invalidateQueries({ queryKey: ['balance'] });
        })
        .catch((error: any) => {
          console.error('Account initialization error:', error);
          const errorMessage = error?.message || String(error);
          
          if (errorMessage.includes('Unauthorized') || errorMessage.includes('Only users can')) {
            setInitializationError('Account setup in progress. Please wait a moment...');
            setTimeout(() => {
              actor.getOrCreateAccount()
                .then(() => {
                  setInitializationError(null);
                  queryClient.invalidateQueries({ queryKey: ['portfolio'] });
                  queryClient.invalidateQueries({ queryKey: ['balance'] });
                })
                .catch(() => {
                  setInitializationError('Unable to initialize account. Please refresh the page.');
                });
            }, 2000);
          } else {
            setInitializationError('Failed to initialize account. Please try refreshing the page.');
          }
        })
        .finally(() => {
          setIsInitializing(false);
        });
    }
  }, [registrationState, isAuthenticated, actor, gameMode, queryClient]);

  const handleRegistrationSuccess = (displayName: string) => {
    setRegisteredDisplayName(displayName);
    setRegistrationState('registration-success');
  };

  const handleContinueToApp = () => {
    setRegistrationState('registered');
  };

  const handleLogout = async () => {
    await clear();
    queryClient.clear();
    setRegistrationState('checking');
    setRegisteredDisplayName('');
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="max-w-md w-full space-y-8 text-center">
          <div className="space-y-4">
            <div className="flex justify-center">
              <div className="h-16 w-16 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                <TrendingUp className="h-8 w-8 text-white" />
              </div>
            </div>
            <h1 className="text-4xl font-bold tracking-tight">ICP Trading Game</h1>
            <p className="text-lg text-muted-foreground">
              Trade virtual ICP with $10,000 starting balance. Compete across multiple game modes and prove your trading skills.
            </p>
          </div>
          <Button
            onClick={login}
            disabled={isLoggingIn}
            size="lg"
            className="w-full"
          >
            {isLoggingIn ? 'Connecting...' : 'Login to Start Trading'}
          </Button>
        </div>
      </div>
    );
  }

  // Show registration form for new users
  if (registrationState === 'needs-registration') {
    return <RegistrationForm onSuccess={handleRegistrationSuccess} />;
  }

  // Show success screen after registration
  if (registrationState === 'registration-success') {
    return (
      <RegistrationSuccess
        displayName={registeredDisplayName}
        onContinue={handleContinueToApp}
      />
    );
  }

  // Show loading while checking registration status
  if (registrationState === 'checking') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
          <p className="text-muted-foreground">Loading your account...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-tight">ICP Trading Game</h1>
                <p className="text-xs text-muted-foreground">Virtual Trading Simulator</p>
              </div>
            </div>
            <Button onClick={handleLogout} variant="outline" size="sm">
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          {(isInitializing || initializationError) && (
            <Alert variant={initializationError ? "destructive" : "default"}>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>
                {isInitializing ? 'Setting up your account...' : 'Account Setup'}
              </AlertTitle>
              <AlertDescription className="flex items-center gap-2">
                {isInitializing && <Loader2 className="h-3 w-3 animate-spin" />}
                {initializationError || 'Initializing your trading account. This will only take a moment.'}
              </AlertDescription>
            </Alert>
          )}

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <GameModeSelector />
            <GameTimer />
          </div>

          <Tabs defaultValue="trade" className="space-y-6">
            <TabsList className="grid w-full max-w-3xl mx-auto grid-cols-5">
              <TabsTrigger value="trade">Trade</TabsTrigger>
              <TabsTrigger value="positions">Positions</TabsTrigger>
              <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
              <TabsTrigger value="history">History</TabsTrigger>
              <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
            </TabsList>

            <TabsContent value="trade" className="space-y-6">
              <div className="grid lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <PriceChart />
                </div>
                <div>
                  <TradingPanel />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="positions">
              <Positions />
            </TabsContent>

            <TabsContent value="portfolio">
              <Portfolio />
            </TabsContent>

            <TabsContent value="history">
              <TransactionHistory />
            </TabsContent>

            <TabsContent value="leaderboard">
              <Leaderboard />
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <footer className="border-t border-border mt-16 py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>
            © {new Date().getFullYear()} Built with ❤️ using{' '}
            <a
              href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(
                typeof window !== 'undefined' ? window.location.hostname : 'icp-trading-game'
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-foreground transition-colors"
            >
              caffeine.ai
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}

function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
      <GameModeProvider>
        <AppContent />
      </GameModeProvider>
      <Toaster />
    </ThemeProvider>
  );
}

export default App;
