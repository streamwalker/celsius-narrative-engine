import { Link } from 'react-router-dom';
import { LegalFooter } from '@/components/LegalFooter';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function CookiesPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <Link to="/">
          <Button variant="ghost" size="sm" className="mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Home
          </Button>
        </Link>

        <h1 className="text-3xl font-bold mb-2 font-mono tracking-tight">Cookie Policy</h1>
        <p className="text-muted-foreground mb-8">Last updated: March 9, 2026</p>

        <div className="prose prose-invert max-w-none space-y-6 text-sm text-foreground/90 leading-relaxed">

          <section>
            <h2 className="text-xl font-semibold text-foreground mt-8 mb-3">1. What Are Cookies</h2>
            <p>Cookies are small text files stored on your device when you visit a website. They help the website remember your preferences, analyze traffic patterns, and improve your experience. We also use similar technologies such as local storage, session storage, and pixel tags.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mt-8 mb-3">2. Cookie Categories</h2>
            <p><strong>Strictly Necessary Cookies:</strong> Essential for the Service to function. These include authentication tokens, session identifiers, CSRF protection tokens, and cookie consent preferences. These cannot be disabled.</p>
            <p><strong>Functional Cookies:</strong> Remember your preferences such as language, theme, and UI settings. These enhance your experience but are not strictly necessary.</p>
            <p><strong>Analytics Cookies:</strong> Help us understand how users interact with the Service, which pages are visited most, and where errors occur. Data is anonymized and aggregated.</p>
            <p><strong>Performance Cookies:</strong> Monitor Service performance, page load times, and error rates to help us optimize the user experience.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mt-8 mb-3">3. Third-Party Cookies</h2>
            <p>We may use third-party cookies from analytics providers and infrastructure services. These third parties are bound by their own privacy policies and our data processing agreements. We do not allow third-party advertising cookies.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mt-8 mb-3">4. Managing Cookies</h2>
            <p>You can manage your cookie preferences through our cookie consent banner that appears on your first visit. You can also modify your preferences at any time in your browser settings. Note that disabling strictly necessary cookies may impair the functionality of the Service.</p>
            <p>Most browsers allow you to: view what cookies are set and delete individual or all cookies; block third-party cookies; block cookies from specific sites; block all cookies; and clear all cookies when you close the browser.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mt-8 mb-3">5. Cookie Retention</h2>
            <p><strong>Session Cookies:</strong> Deleted when you close your browser.</p>
            <p><strong>Persistent Cookies:</strong> Retained for up to 12 months, depending on the cookie's purpose.</p>
            <p><strong>Authentication Cookies:</strong> Retained for the duration of your session or up to 30 days if "remember me" is selected.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mt-8 mb-3">6. Updates to This Policy</h2>
            <p>We may update this Cookie Policy from time to time. Changes will be posted on this page with an updated revision date. Material changes will be communicated through the cookie consent banner.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mt-8 mb-3">7. Contact</h2>
            <p>For questions about our use of cookies, contact privacy@celsius.io.</p>
          </section>

        </div>
      </div>
      <LegalFooter />
    </div>
  );
};

