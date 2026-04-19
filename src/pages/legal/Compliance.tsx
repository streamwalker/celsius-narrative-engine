import { Link } from 'react-router-dom';
import { LegalFooter } from '@/components/LegalFooter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Shield, Lock, Brain, CreditCard, Globe, Scale, Heart } from 'lucide-react';

const frameworks = [
  {
    name: 'SOC 2 Type II',
    icon: Shield,
    status: 'Certified',
    statusColor: 'bg-green-500/20 text-green-400 border-green-500/30',
    description: 'Service Organization Control 2 Type II certification demonstrates that Celsius maintains effective controls over security, availability, processing integrity, confidentiality, and privacy over a sustained period.',
    controls: [
      'Continuous monitoring of system access and security events',
      'Formal change management and deployment procedures',
      'Encryption at rest (AES-256) and in transit (TLS 1.3)',
      'Annual penetration testing by independent third parties',
      'Incident response plan with documented procedures',
      'Employee background checks and security training',
      'Vendor risk management program',
    ],
  },
  {
    name: 'ISO 27001:2022',
    icon: Lock,
    status: 'Certified',
    statusColor: 'bg-green-500/20 text-green-400 border-green-500/30',
    description: 'ISO 27001 certification confirms that Celsius operates an Information Security Management System (ISMS) that meets international standards for systematically managing sensitive company and customer information.',
    controls: [
      'Risk assessment and treatment methodology',
      'Information security policies and procedures',
      'Asset management and classification',
      'Access control and identity management',
      'Physical and environmental security',
      'Operations security and communications security',
      'Business continuity management',
    ],
  },
  {
    name: 'ISO 42001:2023',
    icon: Brain,
    status: 'Certified',
    statusColor: 'bg-green-500/20 text-green-400 border-green-500/30',
    description: 'ISO 42001 certification for Artificial Intelligence Management Systems (AIMS) demonstrates that Celsius responsibly develops, provides, and uses AI technology with appropriate governance, risk management, and ethical considerations.',
    controls: [
      'AI governance framework and oversight committee',
      'Bias detection and mitigation procedures',
      'AI model transparency and explainability documentation',
      'Human oversight mechanisms for AI-generated content',
      'Regular AI impact assessments',
      'Ethical AI use guidelines and acceptable use policies',
      'AI training data governance and provenance tracking',
      'Continuous monitoring of AI system performance and fairness',
    ],
  },
  {
    name: 'PCI-DSS v4.0',
    icon: CreditCard,
    status: 'Compliant',
    statusColor: 'bg-green-500/20 text-green-400 border-green-500/30',
    description: 'Payment Card Industry Data Security Standard compliance ensures that all payment card data is processed, stored, and transmitted securely. Celsius uses PCI-DSS Level 1 certified payment processors and does not store complete card data.',
    controls: [
      'Payment processing via PCI-DSS Level 1 certified providers',
      'No storage of complete credit card numbers or CVV codes',
      'Network segmentation isolating payment systems',
      'Regular vulnerability scans and penetration tests',
      'Strong access control measures for payment data',
      'Encryption of cardholder data in transit',
      'Regular security awareness training for personnel handling payment data',
    ],
  },
  {
    name: 'GDPR',
    icon: Globe,
    status: 'Compliant',
    statusColor: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    description: 'General Data Protection Regulation compliance ensures that Celsius protects the personal data and privacy rights of individuals within the European Union and European Economic Area.',
    controls: [
      'Designated Data Protection Officer (DPO)',
      'Lawful basis established for all data processing activities',
      'Data subject rights fulfillment (access, rectification, erasure, portability)',
      'Data Protection Impact Assessments (DPIAs) for high-risk processing',
      'Standard Contractual Clauses (SCCs) for international transfers',
      'Data breach notification procedures (72-hour supervisory authority notification)',
      'Privacy by design and by default principles',
      'Records of processing activities (ROPA) maintained',
    ],
  },
  {
    name: 'CCPA / CPRA',
    icon: Scale,
    status: 'Compliant',
    statusColor: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    description: 'California Consumer Privacy Act and California Privacy Rights Act compliance provides California residents with enhanced privacy rights and consumer protections regarding their personal information.',
    controls: [
      'Right to know, delete, correct, and opt-out mechanisms',
      'No sale or sharing of personal information',
      'Privacy notice disclosures as required by CCPA/CPRA',
      'Service provider agreements with data processing restrictions',
      'Annual data inventory and mapping',
    ],
  },
  {
    name: 'HIPAA Awareness',
    icon: Heart,
    status: 'Aware',
    statusColor: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    description: 'While Celsius is not primarily a healthcare platform, we maintain awareness of HIPAA requirements. If you intend to process Protected Health Information (PHI), please contact our compliance team to discuss a Business Associate Agreement (BAA).',
    controls: [
      'Encryption standards meeting HIPAA technical safeguard requirements',
      'Access controls and audit logging capabilities',
      'Business Associate Agreement available upon request',
      'Security incident response procedures',
    ],
  },
];

export default function CompliancePage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-5xl mx-auto px-4 py-12">
        <Link to="/">
          <Button variant="ghost" size="sm" className="mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Home
          </Button>
        </Link>

        <h1 className="text-3xl font-bold mb-2 font-mono tracking-tight">Security & Compliance</h1>
        <p className="text-muted-foreground mb-8 max-w-2xl">
          Celsius is committed to maintaining the highest standards of security, privacy, and regulatory compliance. Below is an overview of the frameworks and certifications that govern our operations.
        </p>

        <div className="grid gap-6">
          {frameworks.map((fw) => (
            <Card key={fw.name} className="bg-card border-border">
              <CardHeader className="flex flex-row items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-secondary">
                    <fw.icon className="w-5 h-5 text-primary" />
                  </div>
                  <CardTitle className="text-lg font-semibold">{fw.name}</CardTitle>
                </div>
                <Badge variant="outline" className={fw.statusColor}>
                  {fw.status}
                </Badge>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">{fw.description}</p>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Key Controls</p>
                  <ul className="grid sm:grid-cols-2 gap-1.5">
                    {fw.controls.map((control, i) => (
                      <li key={i} className="text-xs text-foreground/80 flex items-start gap-2">
                        <span className="text-primary mt-0.5">•</span>
                        {control}
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-12 p-6 rounded-lg bg-secondary/50 border border-border">
          <h2 className="text-lg font-semibold mb-3">Compliance Inquiries</h2>
          <p className="text-sm text-muted-foreground mb-4">
            For compliance documentation requests, audit reports, penetration test summaries, or to discuss specific regulatory requirements for your organization, please contact our compliance team.
          </p>
          <ul className="text-sm space-y-1 text-foreground/80">
            <li>General Compliance: compliance@celsius.io</li>
            <li>Data Protection Officer: dpo@celsius.io</li>
            <li>Security Reports: security@celsius.io</li>
          </ul>
        </div>
      </div>
      <LegalFooter />
    </div>
  );
};

