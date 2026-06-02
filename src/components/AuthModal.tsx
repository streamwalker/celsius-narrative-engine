import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { lovable } from '@/integrations/lovable';
import { toast } from 'sonner';
import { Loader2, AlertCircle, CheckCircle2, MailWarning } from 'lucide-react';

type ConfirmationStatus = {
  phase: 'error' | 'resending' | 'sent' | 'resend_failed';
  errorCode?: string;
  errorMessage: string;
  errorStatus?: number;
  resendError?: string;
  resendCode?: string;
  resendStatus?: number;
  resentAt?: string;
};

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function AuthModal({ isOpen, onClose, onSuccess }: AuthModalProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [eulaAccepted, setEulaAccepted] = useState(false);
  const [confirmation, setConfirmation] = useState<ConfirmationStatus | null>(null);

  const resendConfirmation = async (targetEmail: string) => {
    setConfirmation((prev) =>
      prev ? { ...prev, phase: 'resending', resendError: undefined, resendCode: undefined, resendStatus: undefined } : prev,
    );
    const { error: resendError } = await supabase.auth.resend({
      type: 'signup',
      email: targetEmail,
      options: { emailRedirectTo: `${window.location.origin}/` },
    });

    if (resendError) {
      setConfirmation((prev) =>
        prev
          ? {
              ...prev,
              phase: 'resend_failed',
              resendError: resendError.message,
              resendCode: (resendError as any)?.code,
              resendStatus: (resendError as any)?.status,
            }
          : prev,
      );
      toast.error(`Resend failed: ${resendError.message}`);
    } else {
      setConfirmation((prev) =>
        prev ? { ...prev, phase: 'sent', resentAt: new Date().toLocaleTimeString() } : prev,
      );
      toast.success('Confirmation email resent.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isLogin && !eulaAccepted) {
      toast.error('You must accept the Terms of Service to create an account.');
      return;
    }

    setIsLoading(true);
    setConfirmation(null);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success('Welcome back!');
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: `${window.location.origin}/` },
        });
        if (error) throw error;
        toast.success('Account created! Please check your email to verify your account.');
      }
      onSuccess?.();
      onClose();
    } catch (error: any) {
      const errorCode = error?.code || error?.name;
      const errorMessage = error?.message || 'Authentication failed';
      const errorStatus = error?.status;

      if (
        isLogin &&
        email &&
        (errorCode === 'email_not_confirmed' || errorMessage.toLowerCase().includes('email not confirmed'))
      ) {
        setConfirmation({
          phase: 'resending',
          errorCode,
          errorMessage,
          errorStatus,
        });
        await resendConfirmation(email);
        return;
      }

      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMagicLink = async () => {
    if (!email) {
      toast.error('Enter your email above first.');
      return;
    }
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: `${window.location.origin}/` },
      });
      if (error) throw error;
      toast.success('Magic link sent! Check your email.');
    } catch (error: any) {
      toast.error(error.message || 'Failed to send magic link');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display tracking-wider text-2xl">
            {isLogin ? 'Welcome Back' : 'Create Account'}
          </DialogTitle>
        </DialogHeader>

        {confirmation && (
          <Alert variant={confirmation.phase === 'sent' ? 'default' : 'destructive'} className="mb-2">
            <div className="flex items-start gap-2">
              {confirmation.phase === 'sent' ? (
                <CheckCircle2 className="h-4 w-4 mt-0.5" />
              ) : confirmation.phase === 'resending' ? (
                <Loader2 className="h-4 w-4 mt-0.5 animate-spin" />
              ) : confirmation.phase === 'resend_failed' ? (
                <AlertCircle className="h-4 w-4 mt-0.5" />
              ) : (
                <MailWarning className="h-4 w-4 mt-0.5" />
              )}
              <div className="flex-1 space-y-1.5">
                <AlertTitle className="text-sm">
                  {confirmation.phase === 'sent'
                    ? 'Confirmation email resent'
                    : confirmation.phase === 'resending'
                      ? 'Resending confirmation email…'
                      : confirmation.phase === 'resend_failed'
                        ? 'Could not resend confirmation email'
                        : 'Email not confirmed'}
                </AlertTitle>
                <AlertDescription className="text-xs space-y-1">
                  <div>
                    <span className="font-medium">Sign-in error:</span> {confirmation.errorMessage}
                    {confirmation.errorCode && (
                      <> · <code className="font-mono">{confirmation.errorCode}</code></>
                    )}
                    {confirmation.errorStatus && <> · HTTP {confirmation.errorStatus}</>}
                  </div>
                  {confirmation.phase === 'sent' && (
                    <div>
                      A fresh confirmation link was sent to <span className="font-medium">{email}</span>
                      {confirmation.resentAt && <> at {confirmation.resentAt}</>}. Check your inbox and spam folder.
                    </div>
                  )}
                  {confirmation.phase === 'resend_failed' && confirmation.resendError && (
                    <div>
                      <span className="font-medium">Resend error:</span> {confirmation.resendError}
                      {confirmation.resendCode && (
                        <> · <code className="font-mono">{confirmation.resendCode}</code></>
                      )}
                      {confirmation.resendStatus && <> · HTTP {confirmation.resendStatus}</>}
                    </div>
                  )}
                  {(confirmation.phase === 'sent' || confirmation.phase === 'resend_failed') && (
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="mt-1 h-7 text-xs"
                      disabled={isLoading}
                      onClick={() => resendConfirmation(email)}
                    >
                      Resend again
                    </Button>
                  )}
                </AlertDescription>
              </div>
            </div>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="auth-email">Email</Label>
            <Input
              id="auth-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
              autoComplete="email"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="auth-password">Password</Label>
            <Input
              id="auth-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              minLength={6}
              required
              autoComplete={isLogin ? 'current-password' : 'new-password'}
            />
          </div>

          {!isLogin && (
            <div className="flex items-start gap-2">
              <Checkbox
                id="auth-eula"
                checked={eulaAccepted}
                onCheckedChange={(checked) => setEulaAccepted(checked === true)}
                className="mt-0.5"
              />
              <label htmlFor="auth-eula" className="text-xs text-muted-foreground leading-tight">
                I have read and agree to the{' '}
                <Link to="/terms" className="text-primary hover:underline" target="_blank">
                  Terms of Service
                </Link>
                ,{' '}
                <Link to="/privacy" className="text-primary hover:underline" target="_blank">
                  Privacy Policy
                </Link>
                , and{' '}
                <Link to="/acceptable-use" className="text-primary hover:underline" target="_blank">
                  Acceptable Use Policy
                </Link>
                .
              </label>
            </div>
          )}

          <Button type="submit" variant="hero" className="w-full" disabled={isLoading || (!isLogin && !eulaAccepted)}>
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : isLogin ? (
              'Sign In'
            ) : (
              'Create Account'
            )}
          </Button>

          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={handleMagicLink}
            disabled={isLoading || !email}
          >
            Or send magic link
          </Button>

          {isLogin && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="w-full text-xs"
              disabled={isLoading || !email}
              onClick={async () => {
                if (!email) {
                  toast.error('Enter your email above first.');
                  return;
                }
                setIsLoading(true);
                if (!confirmation) {
                  setConfirmation({
                    phase: 'resending',
                    errorCode: 'manual_resend',
                    errorMessage: 'Manual resend requested by user.',
                  });
                }
                await resendConfirmation(email);
                setIsLoading(false);
              }}
            >
              Resend confirmation email
            </Button>
          )}
        </form>

        <div className="text-center text-sm text-muted-foreground">
          {isLogin ? "Don't have an account?" : 'Already have an account?'}
          <button
            type="button"
            onClick={() => {
              setIsLogin(!isLogin);
              setEulaAccepted(false);
            }}
            className="ml-1 text-primary hover:underline"
          >
            {isLogin ? 'Sign up' : 'Sign in'}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
