import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

const COOKIE_CONSENT_KEY = 'celsius-cookie-consent';

type ConsentStatus = 'accepted' | 'rejected' | 'essential-only' | null;

export function CookieConsentBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(COOKIE_CONSENT_KEY) as ConsentStatus;
    if (!stored) {
      setVisible(true);
    }
  }, []);

  const record = (status: Exclude<ConsentStatus, null>) => {
    localStorage.setItem(COOKIE_CONSENT_KEY, status);
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[100] p-4">
      <div className="max-w-3xl mx-auto bg-card border border-border rounded-lg shadow-lg p-4 sm:p-6">
        <div className="flex items-start justify-between gap-4 mb-3">
          <p className="text-sm text-foreground/90">
            We use cookies to provide essential functionality, analyze usage, and improve your experience. Read our{' '}
            <Link to="/cookies" className="text-primary hover:underline">
              Cookie Policy
            </Link>{' '}
            and{' '}
            <Link to="/privacy" className="text-primary hover:underline">
              Privacy Policy
            </Link>{' '}
            for details.
          </p>
          <button
            onClick={() => record('rejected')}
            className="text-muted-foreground hover:text-foreground shrink-0"
            aria-label="Dismiss"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button size="sm" onClick={() => record('accepted')}>
            Accept All
          </Button>
          <Button size="sm" variant="outline" onClick={() => record('essential-only')}>
            Essential Only
          </Button>
          <Button size="sm" variant="ghost" onClick={() => record('rejected')}>
            Reject All
          </Button>
        </div>
      </div>
    </div>
  );
}
