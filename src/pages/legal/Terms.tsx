import { Link } from 'react-router-dom';
import { LegalFooter } from '@/components/LegalFooter';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <Link to="/">
          <Button variant="ghost" size="sm" className="mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Home
          </Button>
        </Link>

        <h1 className="text-3xl font-bold mb-2 font-mono tracking-tight">Celsius — Terms of Service & End-User License Agreement</h1>
        <p className="text-muted-foreground mb-8">Last updated: March 9, 2026</p>

        <ScrollArea className="h-auto">
          <div className="prose prose-invert max-w-none space-y-6 text-sm text-foreground/90 leading-relaxed">

            <section>
              <h2 className="text-xl font-semibold text-foreground mt-8 mb-3">1. Agreement to Terms</h2>
              <p>By accessing or using the Celsius platform ("Service"), operated by Celsius Inc. ("Company," "we," "us," or "our"), you ("User," "you," or "your") agree to be bound by these Terms of Service and End-User License Agreement (collectively, the "Agreement"). If you do not agree to all of the terms and conditions of this Agreement, you must not access or use the Service.</p>
              <p>This Agreement constitutes a legally binding contract between you and the Company. By creating an account, accessing the Service, or clicking "I Agree," you acknowledge that you have read, understood, and agree to be bound by this Agreement, our Privacy Policy, Acceptable Use Policy, Cookie Policy, and all other policies incorporated herein by reference.</p>
              <p>We reserve the right to modify these terms at any time. Material changes will be communicated via email or in-app notification at least 30 days before they take effect. Your continued use of the Service after such notification constitutes acceptance of the modified terms.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mt-8 mb-3">2. Eligibility</h2>
              <p>You must be at least 16 years of age to use the Service. If you are between 16 and 18 years of age, you may only use the Service with the consent of a parent or legal guardian who agrees to be bound by this Agreement. The Service is not directed to children under 16 years of age, and we do not knowingly collect personal information from children under 16 in compliance with COPPA and GDPR-K provisions.</p>
              <p>By using the Service, you represent and warrant that: (a) you have the legal capacity to enter into this Agreement; (b) you are not located in a country that is subject to a government embargo; (c) you are not on any government list of prohibited or restricted parties; and (d) your use of the Service will comply with all applicable local, state, national, and international laws, rules, and regulations.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mt-8 mb-3">3. License Grant</h2>
              <p>Subject to your compliance with this Agreement, the Company grants you a limited, non-exclusive, non-transferable, non-sublicensable, revocable license to access and use the Service for your personal or internal business purposes. This license does not include: (a) resale or commercial redistribution of the Service; (b) modification, reverse engineering, decompilation, or disassembly of any part of the Service; (c) any use of data mining, robots, spiders, scraping, or similar automated data gathering tools; (d) downloading or copying of account information for the benefit of another party; or (e) any use of the Service other than for its intended purpose.</p>
              <p>All rights not expressly granted in this Agreement are reserved by the Company. The Service, including all content, features, and functionality, is owned by the Company and is protected by copyright, trademark, patent, trade secret, and other intellectual property laws.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mt-8 mb-3">4. User Content & Intellectual Property</h2>
              <p><strong>4.1 Your Content.</strong> You retain all ownership rights in the content you create, upload, or submit through the Service ("User Content"). By submitting User Content, you grant the Company a worldwide, non-exclusive, royalty-free, sublicensable, and transferable license to use, reproduce, distribute, prepare derivative works of, display, and perform your User Content solely in connection with operating, developing, providing, promoting, and improving the Service, and researching and developing new features and services.</p>
              <p><strong>4.2 Content Representations.</strong> You represent and warrant that: (a) you own or have the necessary rights, licenses, consents, and permissions to use and authorize the Company to use your User Content; (b) your User Content does not infringe, misappropriate, or violate a third party's intellectual property rights, publicity or privacy rights, or result in the violation of any applicable law or regulation; and (c) your User Content does not contain any material that is defamatory, obscene, indecent, abusive, offensive, harassing, violent, hateful, inflammatory, or otherwise objectionable.</p>
              <p><strong>4.3 AI-Generated Content.</strong> Content generated through the Service's AI features ("Generated Content") is subject to the following terms: (a) you may use Generated Content for personal and commercial purposes, subject to applicable law; (b) you acknowledge that similar or identical content may be generated for other users; (c) you are responsible for reviewing Generated Content for accuracy and appropriateness before use; and (d) the Company makes no representations regarding the intellectual property ownership of Generated Content under applicable law.</p>
              <p><strong>4.4 Content Removal.</strong> The Company reserves the right, but has no obligation, to monitor, review, or remove User Content at our sole discretion and without notice, for any reason, including content that we believe violates this Agreement, our policies, or applicable law.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mt-8 mb-3">5. Prohibited Conduct</h2>
              <p>You agree not to: (a) use the Service for any illegal purpose or in violation of any applicable law; (b) harass, threaten, demean, embarrass, bully, or otherwise harm any other user; (c) upload viruses, malware, or other malicious code; (d) interfere with or disrupt the Service or servers or networks connected to the Service; (e) attempt to gain unauthorized access to any portion of the Service or any other accounts, systems, or networks; (f) use the Service to generate content that promotes violence, hatred, discrimination, or harm against individuals or groups; (g) impersonate any person or entity, or falsely state or misrepresent your affiliation with a person or entity; (h) use the Service to send unsolicited commercial communications (spam); (i) collect or store personal data about other users without their consent; (j) circumvent, disable, or otherwise interfere with any security-related features of the Service; (k) use the Service to create competing products or services; or (l) use automated means to access the Service except through interfaces expressly provided by the Company.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mt-8 mb-3">6. Account Security</h2>
              <p>You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You agree to: (a) immediately notify the Company of any unauthorized use of your account or any other breach of security; (b) ensure that you log out from your account at the end of each session; and (c) not share your account credentials with any third party. The Company will not be liable for any loss or damage arising from your failure to comply with this section.</p>
              <p>We implement industry-standard security measures including encryption at rest (AES-256), encryption in transit (TLS 1.3), multi-factor authentication options, regular security audits, and automated vulnerability scanning in accordance with our SOC 2 Type II and ISO 27001 certified security practices.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mt-8 mb-3">7. Payment Terms</h2>
              <p>Certain features of the Service may be offered on a subscription or pay-per-use basis. By subscribing to a paid plan, you agree to pay all fees associated with your selected plan. Fees are non-refundable except as required by applicable law or as explicitly stated in our refund policy. The Company reserves the right to change pricing with 30 days' prior notice. All payment processing is handled by PCI-DSS Level 1 compliant payment processors. The Company does not store complete credit card numbers or CVV codes on its servers.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mt-8 mb-3">8. Privacy & Data Protection</h2>
              <p>Our collection and use of personal information in connection with the Service is described in our <Link to="/privacy" className="text-primary hover:underline">Privacy Policy</Link>. By using the Service, you acknowledge that you have read and understood our Privacy Policy. We process personal data in accordance with the General Data Protection Regulation (GDPR), the California Consumer Privacy Act (CCPA), and all other applicable data protection laws. For enterprise customers processing personal data through the Service, a <Link to="/dpa" className="text-primary hover:underline">Data Processing Agreement</Link> is available.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mt-8 mb-3">9. Disclaimer of Warranties</h2>
              <p>THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, WHETHER EXPRESS, IMPLIED, STATUTORY, OR OTHERWISE, INCLUDING BUT NOT LIMITED TO IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, TITLE, AND NON-INFRINGEMENT. THE COMPANY DOES NOT WARRANT THAT THE SERVICE WILL BE UNINTERRUPTED, TIMELY, SECURE, OR ERROR-FREE, OR THAT ANY DEFECTS WILL BE CORRECTED. THE COMPANY MAKES NO WARRANTY REGARDING THE QUALITY, ACCURACY, TIMELINESS, TRUTHFULNESS, COMPLETENESS, OR RELIABILITY OF THE SERVICE OR ANY CONTENT, INCLUDING AI-GENERATED CONTENT.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mt-8 mb-3">10. Limitation of Liability</h2>
              <p>TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, IN NO EVENT SHALL THE COMPANY, ITS AFFILIATES, DIRECTORS, EMPLOYEES, AGENTS, OR LICENSORS BE LIABLE FOR ANY INDIRECT, PUNITIVE, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR EXEMPLARY DAMAGES, INCLUDING BUT NOT LIMITED TO DAMAGES FOR LOSS OF PROFITS, GOODWILL, USE, DATA, OR OTHER INTANGIBLE LOSSES, ARISING OUT OF OR RELATING TO THE USE OF, OR INABILITY TO USE, THE SERVICE. IN NO EVENT SHALL THE COMPANY'S TOTAL LIABILITY TO YOU FOR ALL CLAIMS ARISING FROM OR RELATING TO THE SERVICE EXCEED THE AMOUNT YOU HAVE PAID TO THE COMPANY IN THE TWELVE (12) MONTHS IMMEDIATELY PRECEDING THE EVENT GIVING RISE TO THE CLAIM, OR ONE HUNDRED DOLLARS ($100), WHICHEVER IS GREATER.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mt-8 mb-3">11. Indemnification</h2>
              <p>You agree to indemnify, defend, and hold harmless the Company, its affiliates, and their respective officers, directors, employees, agents, licensors, and suppliers from and against all claims, losses, expenses, damages, and costs, including reasonable attorneys' fees, arising from or relating to: (a) your use of the Service; (b) your violation of this Agreement; (c) your User Content; (d) your violation of any rights of a third party; or (e) your violation of any applicable law, rule, or regulation.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mt-8 mb-3">12. Dispute Resolution & Arbitration</h2>
              <p><strong>12.1 Informal Resolution.</strong> Before filing any formal dispute, you agree to first contact us at legal@celsius.io to attempt informal resolution. We will attempt to resolve any dispute informally within 60 days.</p>
              <p><strong>12.2 Binding Arbitration.</strong> Any dispute, claim, or controversy arising out of or relating to this Agreement that cannot be resolved informally shall be resolved by binding arbitration administered by the American Arbitration Association ("AAA") in accordance with its Commercial Arbitration Rules. The arbitration shall be conducted in the English language and shall take place in Delaware, United States, or remotely at your election.</p>
              <p><strong>12.3 Class Action Waiver.</strong> YOU AND THE COMPANY AGREE THAT EACH PARTY MAY BRING CLAIMS AGAINST THE OTHER ONLY IN YOUR OR ITS INDIVIDUAL CAPACITY, AND NOT AS A PLAINTIFF OR CLASS MEMBER IN ANY PURPORTED CLASS OR REPRESENTATIVE PROCEEDING.</p>
              <p><strong>12.4 Exceptions.</strong> Nothing in this section shall prevent either party from seeking injunctive or other equitable relief in a court of competent jurisdiction for the protection of intellectual property rights.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mt-8 mb-3">13. Governing Law</h2>
              <p>This Agreement shall be governed by and construed in accordance with the laws of the State of Delaware, United States, without regard to its conflict of law provisions. For users in the European Union, nothing in this Agreement affects your rights under mandatory consumer protection laws of your country of residence.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mt-8 mb-3">14. Termination</h2>
              <p>We may terminate or suspend your account and access to the Service immediately, without prior notice or liability, for any reason, including if you breach this Agreement. Upon termination: (a) your license to use the Service will immediately cease; (b) you must cease all use of the Service; (c) we may delete your account and all associated data after a 30-day grace period during which you may export your data; and (d) all provisions of this Agreement that by their nature should survive termination shall survive, including ownership provisions, warranty disclaimers, indemnity, and limitations of liability.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mt-8 mb-3">15. Modifications to the Service</h2>
              <p>The Company reserves the right to modify, suspend, or discontinue the Service (or any part thereof) at any time, with or without notice. We will use commercially reasonable efforts to provide 30 days' advance notice of any material changes to the Service. The Company shall not be liable to you or any third party for any modification, suspension, or discontinuance of the Service.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mt-8 mb-3">16. Severability</h2>
              <p>If any provision of this Agreement is held to be invalid, illegal, or unenforceable, the remaining provisions shall continue in full force and effect. The invalid or unenforceable provision shall be modified to the minimum extent necessary to make it valid and enforceable while preserving the original intent of the parties.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mt-8 mb-3">17. Entire Agreement</h2>
              <p>This Agreement, together with the Privacy Policy, Cookie Policy, Acceptable Use Policy, and Data Processing Agreement, constitutes the entire agreement between you and the Company regarding the Service and supersedes all prior and contemporaneous understandings, agreements, representations, and warranties, whether written or oral, regarding the Service.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mt-8 mb-3">18. Contact Information</h2>
              <p>For questions about these Terms, please contact us at:</p>
              <ul className="list-none space-y-1 mt-2">
                <li>Email: legal@celsius.io</li>
                <li>Address: Celsius Inc., 1209 Orange Street, Wilmington, DE 19801, United States</li>
                <li>Data Protection Officer: dpo@celsius.io</li>
              </ul>
            </section>

          </div>
        </ScrollArea>
      </div>
      <LegalFooter />
    </div>
  );
};

