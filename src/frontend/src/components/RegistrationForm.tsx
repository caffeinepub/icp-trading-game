import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, UserPlus, AlertCircle } from 'lucide-react';
import { useRegisterUser } from '../hooks/useQueries';

interface RegistrationFormProps {
  onSuccess: (displayName: string) => void;
  onCancel?: () => void;
}

export default function RegistrationForm({ onSuccess, onCancel }: RegistrationFormProps) {
  const [displayName, setDisplayName] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);
  const registerMutation = useRegisterUser();

  const validateDisplayName = (name: string): string | null => {
    if (!name.trim()) {
      return 'Display name is required';
    }
    if (name.trim().length < 2) {
      return 'Display name must be at least 2 characters';
    }
    if (name.trim().length > 50) {
      return 'Display name must be less than 50 characters';
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const error = validateDisplayName(displayName);
    if (error) {
      setValidationError(error);
      return;
    }

    setValidationError(null);
    
    try {
      await registerMutation.mutateAsync(displayName.trim());
      onSuccess(displayName.trim());
    } catch (error: any) {
      console.error('Registration error:', error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setDisplayName(value);
    if (validationError) {
      setValidationError(null);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex justify-center mb-4">
            <div className="h-12 w-12 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
              <UserPlus className="h-6 w-6 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl text-center">Welcome to ICP Trading Game</CardTitle>
          <CardDescription className="text-center">
            Create your account to start trading with $10,000 virtual balance
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="displayName">Display Name</Label>
              <Input
                id="displayName"
                type="text"
                placeholder="Enter your display name"
                value={displayName}
                onChange={handleInputChange}
                disabled={registerMutation.isPending}
                maxLength={50}
                autoFocus
              />
              {validationError && (
                <p className="text-sm text-destructive">{validationError}</p>
              )}
            </div>

            {registerMutation.isError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  {registerMutation.error instanceof Error
                    ? registerMutation.error.message
                    : 'Failed to create account. Please try again.'}
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
          <CardFooter className="flex gap-2">
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={registerMutation.isPending}
                className="flex-1"
              >
                Cancel
              </Button>
            )}
            <Button
              type="submit"
              disabled={registerMutation.isPending || !displayName.trim()}
              className="flex-1"
            >
              {registerMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating Account...
                </>
              ) : (
                'Create Account'
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
