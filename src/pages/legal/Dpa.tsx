import { Link } from 'react-router-dom';
import { LegalFooter } from '@/components/LegalFooter';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function Dpa() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <Link to="/">
          <Button variant="ghost" size="sm" className="mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Home
          </Button>
        </Link>

        <h1 className="text-3xl font-bold mb-2 font-mono tracking-tight">Data Processing Agreement</h1>
        <p className="text-muted-foreground mb-8">Last updated: March 9, 2026 | Pursuant to GDPR Article 28</p>

        <div className="prose prose-invert max-w-none space-y-6 text-sm text-foreground/90 leading-relaxed">

          <section>
            <h2 className="text-xl font-semibold text-foreground mt-8 mb-3">1. Scope & Applicability</h2>
            <p>This Data Processing Agreement ("DPA") forms part of the Terms of Service between Celsius Inc. ("Processor") and the entity or individual ("Controller") using the Celsius platform. This DPA applies to all processing of personal data by the Processor on behalf of the Controller in connection with the Service, as required by Article 28 of the General Data Protection Regulation (EU) 2016/679 ("GDPR") and equivalent provisions under applicable data protection laws.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mt-8 mb-3">2. Definitions</h2>
            <p>"Personal Data," "Processing," "Data Subject," "Controller," "Processor," and "Sub-processor" have the meanings given in the GDPR. "Service" means the Celsius platform and related services. "Standard Contractual Clauses" or "SCCs" means the standard contractual clauses for the transfer of personal data approved by the European Commission.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mt-8 mb-3">3. Processing Details</h2>
            <p><strong>Subject matter:</strong> Provision of the Celsius comic creation and character management platform.</p>
            <p><strong>Duration:</strong> The term of the Controller's use of the Service.</p>
            <p><strong>Nature and purpose:</strong> Storage, retrieval, and processing of User Content and account data to provide the Service's features including script formatting, image generation, character management, and project collaboration.</p>
            <p><strong>Categories of data subjects:</strong> Users (individuals who create accounts), collaborators, and any individuals whose personal data is included in User Content.</p>
            <p><strong>Types of personal data:</strong> Email addresses, names, account preferences, IP addresses, usage data, User Content (scripts, character profiles, images), and payment information.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mt-8 mb-3">4. Processor Obligations</h2>
            <p>The Processor shall: (a) process Personal Data only on documented instructions from the Controller, including transfers to third countries, unless required by Union or Member State law; (b) ensure that persons authorized to process Personal Data have committed to confidentiality; (c) implement appropriate technical and organizational security measures as described in Section 6; (d) engage sub-processors only with prior specific or general written authorization of the Controller; (e) assist the Controller in fulfilling data subject rights requests; (f) assist the Controller in ensuring compliance with obligations related to security, breach notification, DPIAs, and prior consultation; (g) at the Controller's choice, delete or return all Personal Data upon termination and delete existing copies unless required by law; and (h) make available all information necessary to demonstrate compliance and allow for audits.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mt-8 mb-3">5. Sub-processors</h2>
            <p>The Controller grants general authorization for the Processor to engage sub-processors. The Processor shall: (a) maintain a current list of sub-processors, available upon request; (b) notify the Controller of any intended changes to sub-processors at least 30 days in advance; (c) impose data protection obligations no less protective than those in this DPA on each sub-processor; and (d) remain liable for the acts and omissions of its sub-processors.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mt-8 mb-3">6. Security Measures</h2>
            <p>The Processor implements the following technical and organizational measures: encryption at rest (AES-256) and in transit (TLS 1.3); network segmentation and firewall protection; multi-factor authentication for system access; regular vulnerability scanning and annual penetration testing; access logging and monitoring; employee security training; incident response procedures; backup and disaster recovery plans; and physical security controls at data center facilities.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mt-8 mb-3">7. Data Breach Notification</h2>
            <p>The Processor shall notify the Controller without undue delay after becoming aware of a personal data breach, and in any event within 48 hours. The notification shall include: the nature of the breach; categories and approximate number of data subjects affected; likely consequences; and measures taken or proposed to address the breach.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mt-8 mb-3">8. International Transfers</h2>
            <p>Where Personal Data is transferred outside the EEA, the Processor shall ensure appropriate safeguards are in place, including EU Standard Contractual Clauses (Module Two: Controller to Processor, or Module Three: Processor to Processor as applicable), supplementary measures where required by the CJEU Schrems II decision, and transfer impact assessments.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mt-8 mb-3">9. Audits</h2>
            <p>The Processor shall make available to the Controller all information necessary to demonstrate compliance with this DPA. The Controller may conduct audits, including inspections, either directly or through a mandated auditor, subject to reasonable advance notice (at least 30 days) and during normal business hours. The Processor may charge reasonable fees for audit support beyond the first annual audit.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mt-8 mb-3">10. Contact</h2>
            <p>For questions about this DPA or to request the current sub-processor list: dpo@celsius.io</p>
          </section>

        </div>
      </div>
      <LegalFooter />
    </div>
  );
};

