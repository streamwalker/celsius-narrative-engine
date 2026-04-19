import { Link } from 'react-router-dom';
import { LegalFooter } from '@/components/LegalFooter';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <Link to="/">
          <Button variant="ghost" size="sm" className="mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Home
          </Button>
        </Link>

        <h1 className="text-3xl font-bold mb-2 font-mono tracking-tight">Privacy Policy</h1>
        <p className="text-muted-foreground mb-8">Last updated: March 9, 2026</p>

        <div className="prose prose-invert max-w-none space-y-6 text-sm text-foreground/90 leading-relaxed">

          <section>
            <h2 className="text-xl font-semibold text-foreground mt-8 mb-3">1. Data Controller</h2>
            <p>Celsius Inc. ("Company," "we," "us") is the data controller for personal data processed through the Celsius platform. Our Data Protection Officer can be reached at dpo@celsius.io. Our EU representative can be contacted at eu-representative@celsius.io.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mt-8 mb-3">2. Data We Collect</h2>
            <p><strong>Account Data:</strong> Email address, name, hashed password, account preferences, profile information you provide.</p>
            <p><strong>Usage Data:</strong> IP address, browser type and version, operating system, referral URLs, pages visited, time spent on pages, click patterns, feature usage analytics.</p>
            <p><strong>Content Data:</strong> Scripts, character profiles, generated images, project data, and any other content you create or upload through the Service.</p>
            <p><strong>Payment Data:</strong> Billing address, payment method details (processed by PCI-DSS Level 1 compliant payment processors — we do not store complete card numbers).</p>
            <p><strong>Communications Data:</strong> Support tickets, feedback, survey responses, and correspondence with us.</p>
            <p><strong>Device Data:</strong> Device identifiers, screen resolution, language preferences, time zone settings.</p>
            <p><strong>Cookie Data:</strong> As described in our <Link to="/cookies" className="text-primary hover:underline">Cookie Policy</Link>.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mt-8 mb-3">3. Lawful Basis for Processing (GDPR Article 6)</h2>
            <p>We process your personal data on the following legal bases:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Contract Performance (Art. 6(1)(b)):</strong> Processing necessary to perform our contract with you (providing the Service, managing your account).</li>
              <li><strong>Legitimate Interests (Art. 6(1)(f)):</strong> Analytics, security monitoring, fraud prevention, service improvement, where our interests do not override your fundamental rights.</li>
              <li><strong>Consent (Art. 6(1)(a)):</strong> Marketing communications, non-essential cookies, optional data processing. You may withdraw consent at any time.</li>
              <li><strong>Legal Obligation (Art. 6(1)(c)):</strong> Tax records, regulatory compliance, responding to lawful requests from public authorities.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mt-8 mb-3">4. How We Use Your Data</h2>
            <p>We use collected data to: provide and maintain the Service; process transactions; send transactional emails; provide customer support; analyze usage patterns and improve the Service; detect, prevent, and address technical issues and security threats; comply with legal obligations; enforce our terms and policies; and, with your consent, send marketing communications.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mt-8 mb-3">5. Data Retention</h2>
            <p><strong>Account Data:</strong> Retained for the duration of your account plus 30 days after deletion request.</p>
            <p><strong>Usage & Analytics Data:</strong> Retained for 26 months, then anonymized or deleted.</p>
            <p><strong>Content Data:</strong> Retained for the duration of your account. Deleted within 30 days of account deletion.</p>
            <p><strong>Payment Records:</strong> Retained for 7 years as required by tax and financial regulations.</p>
            <p><strong>Security Logs:</strong> Retained for 12 months for security and fraud prevention purposes.</p>
            <p><strong>Backup Data:</strong> Purged from backup systems within 90 days of primary deletion.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mt-8 mb-3">6. Your Rights (GDPR Articles 15-22)</h2>
            <p>Under the GDPR and applicable data protection laws, you have the right to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Access (Art. 15):</strong> Request a copy of the personal data we hold about you.</li>
              <li><strong>Rectification (Art. 16):</strong> Request correction of inaccurate or incomplete personal data.</li>
              <li><strong>Erasure (Art. 17):</strong> Request deletion of your personal data ("right to be forgotten").</li>
              <li><strong>Restriction (Art. 18):</strong> Request restriction of processing of your personal data.</li>
              <li><strong>Portability (Art. 20):</strong> Receive your personal data in a structured, commonly used, machine-readable format (JSON or CSV).</li>
              <li><strong>Objection (Art. 21):</strong> Object to processing based on legitimate interests or direct marketing.</li>
              <li><strong>Automated Decision-Making (Art. 22):</strong> Not be subject to decisions based solely on automated processing that produces legal or similarly significant effects.</li>
            </ul>
            <p>To exercise these rights, contact dpo@celsius.io. We will respond within 30 days (extendable by 60 days for complex requests). You also have the right to lodge a complaint with your local supervisory authority.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mt-8 mb-3">7. International Data Transfers</h2>
            <p>Your data may be transferred to and processed in the United States and other countries. We ensure adequate protection through: (a) EU Standard Contractual Clauses (SCCs) adopted by the European Commission; (b) data processing agreements with all sub-processors; (c) encryption in transit (TLS 1.3) and at rest (AES-256); and (d) annual assessments of the legal framework in recipient countries. We do not transfer data to countries without adequate protections unless appropriate safeguards are in place.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mt-8 mb-3">8. Data Breach Notification</h2>
            <p>In the event of a personal data breach, we will: (a) notify the relevant supervisory authority within 72 hours of becoming aware of the breach, as required by GDPR Article 33; (b) notify affected individuals without undue delay if the breach is likely to result in a high risk to their rights and freedoms, as required by GDPR Article 34; and (c) document all breaches, including their effects and remedial actions taken.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mt-8 mb-3">9. Children's Privacy</h2>
            <p>The Service is not directed to individuals under 16 years of age. We do not knowingly collect personal information from children under 16. If we learn that we have collected personal information from a child under 16, we will promptly delete such information. If you are a parent or guardian and believe your child has provided us with personal information, please contact us at privacy@celsius.io.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mt-8 mb-3">10. California Privacy Rights (CCPA/CPRA)</h2>
            <p>California residents have additional rights including: the right to know what personal information is collected, used, shared, or sold; the right to delete personal information; the right to opt out of the sale or sharing of personal information; the right to non-discrimination for exercising privacy rights; and the right to correct inaccurate personal information. We do not sell personal information. To exercise these rights, contact privacy@celsius.io.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mt-8 mb-3">11. Third-Party Services</h2>
            <p>We use the following categories of third-party services: cloud infrastructure providers, payment processors, analytics services, email delivery services, and AI model providers. All third-party processors are bound by data processing agreements and are required to maintain appropriate security measures. A list of current sub-processors is available upon request.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mt-8 mb-3">12. Contact</h2>
            <p>Data Protection Officer: dpo@celsius.io</p>
            <p>Privacy inquiries: privacy@celsius.io</p>
            <p>Celsius Inc., 1209 Orange Street, Wilmington, DE 19801, United States</p>
          </section>

        </div>
      </div>
      <LegalFooter />
    </div>
  );
};

