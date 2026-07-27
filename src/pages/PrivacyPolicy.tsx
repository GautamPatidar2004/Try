import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowUp, Printer } from "lucide-react";
import Footer from "@/components/Footer";
import { SEO } from "@/components/SEO";

const PrivacyPolicy = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Privacy Policy - Hostfluencer"
        description="Learn how Hostfluencer collects, uses, and protects your personal information. Our commitment to your privacy and data security."
        canonical="/privacy-policy"
        noIndex={false}
      />
      {/* Header */}
      <div className="bg-card border-b border-border">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">Hostfluencer – Privacy Policy</h1>
              <p className="text-muted-foreground">Effective Date: 6/30/25 | Last Updated: 6/30/25</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handlePrint} className="hidden md:flex">
                <Printer className="w-4 h-4 mr-2" />
                Print
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Table of Contents */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Card className="mb-8">
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold mb-4">Table of Contents</h2>
            <div className="grid md:grid-cols-2 gap-2 text-sm">
              <a href="#section-1" className="text-brand-green hover:underline">1. Information We Collect</a>
              <a href="#section-2" className="text-brand-green hover:underline">2. How We Use Your Information</a>
              <a href="#section-3" className="text-brand-green hover:underline">3. Sharing and Disclosure of Information</a>
              <a href="#section-4" className="text-brand-green hover:underline">4. Data Storage, Transfers & Security</a>
              <a href="#section-5" className="text-brand-green hover:underline">5. Your Rights & Choices</a>
              <a href="#section-6" className="text-brand-green hover:underline">6. Children's Privacy</a>
              <a href="#section-7" className="text-brand-green hover:underline">7. Cookies & Tracking</a>
              <a href="#section-8" className="text-brand-green hover:underline">8. Third-Party Links</a>
              <a href="#section-9" className="text-brand-green hover:underline">9. GDPR & CCPA Compliance</a>
              <a href="#section-10" className="text-brand-green hover:underline">10. Changes to This Policy</a>
              <a href="#section-11" className="text-brand-green hover:underline">11. Contact Information</a>
            </div>
          </CardContent>
        </Card>

        {/* Privacy Policy Content */}
        <Card>
          <CardContent className="p-8 prose prose-gray dark:prose-invert max-w-none">
            <div className="space-y-8">
              {/* Introduction */}
              <div>
                <p className="text-lg leading-relaxed mb-6">
                  This Privacy Policy ("Policy") describes how Hostfluencer, Inc. ("Hostfluencer", "we", "us", or "our"), a subsidiary of LVL Holding Inc., collects, uses, stores, protects, and discloses your personal information when you visit or use our website, platform, mobile application, and any associated services (collectively, the "Platform").
                </p>
                <p className="leading-relaxed">
                  By accessing or using the Platform, you agree to the collection and use of information in accordance with this Policy. If you do not agree, please do not access or use our services.
                </p>
              </div>

              {/* Section 1 */}
              <section id="section-1">
                <h2 className="text-2xl font-bold text-foreground mb-4">1. INFORMATION WE COLLECT</h2>
                <p className="leading-relaxed mb-4">We collect personal, usage, and technical information in several ways:</p>
                
                <h3 className="text-xl font-semibold text-foreground mb-3">1.1 Information You Provide Directly</h3>
                <p className="leading-relaxed mb-2"><strong>Account Registration Data:</strong> Full name, email address, username, password, business name (if applicable), and role (Host or Creator).</p>
                <p className="leading-relaxed mb-2"><strong>Profile Information:</strong> Profile pictures, bios, links to social media accounts, audience size, engagement metrics, and portfolio content.</p>
                <p className="leading-relaxed mb-2"><strong>Payment & Financial Info:</strong> Credit card details, PayPal or Stripe credentials, tax identification numbers (e.g., W-9/W-8BEN), and billing addresses.</p>
                <p className="leading-relaxed mb-2"><strong>Communications:</strong> Messages, inquiries, feedback, and support tickets.</p>
                <p className="leading-relaxed mb-4"><strong>Uploads:</strong> Photos, videos, captions, and other content submitted for collaboration purposes.</p>
                
                <h3 className="text-xl font-semibold text-foreground mb-3">1.2 Information Collected Automatically</h3>
                <p className="leading-relaxed mb-2"><strong>Device Information:</strong> IP address, browser type, operating system, language settings, and device ID.</p>
                <p className="leading-relaxed mb-2"><strong>Usage Data:</strong> Pages viewed, buttons clicked, session duration, referral source, and navigation behavior.</p>
                <p className="leading-relaxed mb-4"><strong>Cookies & Tracking Technologies:</strong> We use cookies, pixels, and local storage to personalize user experience and analyze site traffic. You can control cookie preferences via your browser.</p>
                
                <h3 className="text-xl font-semibold text-foreground mb-3">1.3 Information from Third Parties</h3>
                <p className="leading-relaxed mb-2"><strong>Social Media Integrations:</strong> If you connect your Instagram, TikTok, Facebook, or YouTube accounts, we may pull your public engagement data (e.g., followers, likes, comments).</p>
                <p className="leading-relaxed mb-2"><strong>Payment Providers:</strong> We receive limited transaction and verification data from Stripe, PayPal, or similar platforms.</p>
                <p className="leading-relaxed"><strong>Marketing Partners:</strong> Campaign attribution data and engagement metrics from ads or affiliate programs.</p>
              </section>

              {/* Section 2 */}
              <section id="section-2">
                <h2 className="text-2xl font-bold text-foreground mb-4">2. HOW WE USE YOUR INFORMATION</h2>
                <p className="leading-relaxed mb-4">We use the information we collect to:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Provide, maintain, and improve the Platform;</li>
                  <li>Match Hosts and Creators based on preferences, location, or campaign fit;</li>
                  <li>Facilitate bookings, transactions, and contracts;</li>
                  <li>Enable content delivery, campaign tracking, and licensing management;</li>
                  <li>Offer customer support and resolve disputes;</li>
                  <li>Send transactional communications (e.g., receipts, confirmations);</li>
                  <li>Market new services, features, or updates (with consent);</li>
                  <li>Detect fraud, enforce our Terms of Service, and ensure Platform security;</li>
                  <li>Comply with legal obligations, such as tax reporting and law enforcement requests.</li>
                </ul>
              </section>

              {/* Section 3 */}
              <section id="section-3">
                <h2 className="text-2xl font-bold text-foreground mb-4">3. SHARING AND DISCLOSURE OF INFORMATION</h2>
                <p className="leading-relaxed mb-4">We do not sell your personal information. However, we may share data in the following scenarios:</p>
                
                <h3 className="text-xl font-semibold text-foreground mb-3">3.1 With Other Users</h3>
                <p className="leading-relaxed mb-2">When you publish a profile, submit a listing, or accept a campaign, your relevant profile information (e.g., portfolio, bio, stats) is visible to others.</p>
                <p className="leading-relaxed mb-4">Creators who agree to collaborations may have deliverables and bios shared with Hosts and vice versa.</p>
                
                <h3 className="text-xl font-semibold text-foreground mb-3">3.2 With Service Providers</h3>
                <p className="leading-relaxed mb-4">We engage trusted third-party service providers for:</p>
                <ul className="list-disc pl-6 space-y-2 mb-4">
                  <li>Payment processing (e.g., Stripe, PayPal)</li>
                  <li>Cloud hosting (e.g., AWS)</li>
                  <li>Email communications (e.g., SendGrid)</li>
                  <li>Analytics (e.g., Google Analytics, Mixpanel)</li>
                  <li>Customer support (e.g., Intercom or Zendesk)</li>
                </ul>
                <p className="leading-relaxed mb-4">These providers may access data solely to perform tasks on our behalf and are contractually obligated to protect it.</p>
                
                <h3 className="text-xl font-semibold text-foreground mb-3">3.3 With Legal Authorities</h3>
                <p className="leading-relaxed mb-4">We may disclose personal data if required by law, legal process, or governmental request, or if necessary to enforce our rights or defend against legal claims.</p>
                
                <h3 className="text-xl font-semibold text-foreground mb-3">3.4 In Case of Merger or Acquisition</h3>
                <p className="leading-relaxed">If Hostfluencer or any brand under LVL Holding Inc. is acquired, merged, sold, or undergoes a restructuring, your data may be transferred as part of the transaction, subject to the commitments of this Privacy Policy.</p>
              </section>

              {/* Section 4 */}
              <section id="section-4">
                <h2 className="text-2xl font-bold text-foreground mb-4">4. DATA STORAGE, TRANSFERS & SECURITY</h2>
                
                <h3 className="text-xl font-semibold text-foreground mb-3">4.1 Storage Location</h3>
                <p className="leading-relaxed mb-4">Data is stored securely on cloud infrastructure located in the United States and other jurisdictions where our providers operate.</p>
                
                <h3 className="text-xl font-semibold text-foreground mb-3">4.2 International Transfers</h3>
                <p className="leading-relaxed mb-4">If you reside outside the U.S., your data may be transferred to the United States for processing. We rely on standard contractual clauses and appropriate safeguards where applicable (e.g., under GDPR).</p>
                
                <h3 className="text-xl font-semibold text-foreground mb-3">4.3 Data Retention</h3>
                <p className="leading-relaxed mb-4">We retain user data for as long as necessary to fulfill the purposes outlined in this Policy, including:</p>
                <p className="leading-relaxed mb-2"><strong>Account and transaction data:</strong> Retained for legal/tax obligations.</p>
                <p className="leading-relaxed mb-2"><strong>Creator content and licensing:</strong> Retained per agreed usage rights.</p>
                <p className="leading-relaxed mb-4"><strong>Analytics and engagement:</strong> Aggregated and anonymized after [X] months.</p>
                <p className="leading-relaxed mb-4">You may request deletion at any time, subject to exceptions under applicable law.</p>
                
                <h3 className="text-xl font-semibold text-foreground mb-3">4.4 Security Measures</h3>
                <p className="leading-relaxed mb-4">We implement administrative, technical, and physical safeguards to protect your data. These include:</p>
                <ul className="list-disc pl-6 space-y-2 mb-4">
                  <li>SSL encryption</li>
                  <li>Role-based access control (RBAC)</li>
                  <li>Two-factor authentication</li>
                  <li>Regular penetration testing and data audits</li>
                </ul>
                <p className="leading-relaxed">Despite these measures, no platform is 100% secure. Use of the Platform is at your own risk.</p>
              </section>

              {/* Section 5 */}
              <section id="section-5">
                <h2 className="text-2xl font-bold text-foreground mb-4">5. YOUR RIGHTS & CHOICES</h2>
                
                <h3 className="text-xl font-semibold text-foreground mb-3">5.1 Access, Edit, or Delete Your Data</h3>
                <p className="leading-relaxed mb-4">You can update your account data at any time via your profile dashboard or by contacting support.</p>
                <p className="leading-relaxed mb-4">You may request:</p>
                <ul className="list-disc pl-6 space-y-2 mb-4">
                  <li>A copy of your personal data (data portability)</li>
                  <li>Correction of inaccurate information</li>
                  <li>Deletion of your data (subject to legal limitations)</li>
                  <li>Restriction or objection to certain uses (e.g., marketing)</li>
                </ul>
                
                <h3 className="text-xl font-semibold text-foreground mb-3">5.2 Email & Notification Preferences</h3>
                <p className="leading-relaxed mb-4">You can opt out of non-essential emails by:</p>
                <ul className="list-disc pl-6 space-y-2 mb-4">
                  <li>Clicking "Unsubscribe" in marketing emails</li>
                  <li>Adjusting notification settings in your account</li>
                </ul>
                <p className="leading-relaxed">Transactional emails (e.g., booking confirmations) will still be sent as necessary.</p>
              </section>

              {/* Section 6 */}
              <section id="section-6">
                <h2 className="text-2xl font-bold text-foreground mb-4">6. CHILDREN'S PRIVACY</h2>
                <p className="leading-relaxed">The Platform is not intended for individuals under the age of 18. We do not knowingly collect or solicit personal information from minors. If we discover such data has been collected, we will delete it immediately.</p>
              </section>

              {/* Section 7 */}
              <section id="section-7">
                <h2 className="text-2xl font-bold text-foreground mb-4">7. COOKIES & TRACKING</h2>
                <p className="leading-relaxed mb-4">We use cookies and similar technologies to:</p>
                <ul className="list-disc pl-6 space-y-2 mb-4">
                  <li>Remember your login and preferences;</li>
                  <li>Track engagement and usage;</li>
                  <li>Serve targeted advertising.</li>
                </ul>
                <p className="leading-relaxed">You can manage cookie settings via your browser. Disabling cookies may impact Platform functionality.</p>
              </section>

              {/* Section 8 */}
              <section id="section-8">
                <h2 className="text-2xl font-bold text-foreground mb-4">8. THIRD-PARTY LINKS</h2>
                <p className="leading-relaxed">The Platform may contain links to third-party websites or platforms (e.g., Instagram, YouTube). We are not responsible for their privacy practices. Please review their privacy policies before interacting.</p>
              </section>

              {/* Section 9 */}
              <section id="section-9">
                <h2 className="text-2xl font-bold text-foreground mb-4">9. GDPR & CCPA COMPLIANCE</h2>
                
                <h3 className="text-xl font-semibold text-foreground mb-3">9.1 For EU/EEA Residents (GDPR)</h3>
                <p className="leading-relaxed mb-4">You have the right to:</p>
                <ul className="list-disc pl-6 space-y-2 mb-4">
                  <li>Be informed of data usage;</li>
                  <li>Access, correct, delete, or port your personal data;</li>
                  <li>Object to or restrict certain processing activities;</li>
                  <li>File a complaint with your local Data Protection Authority.</li>
                </ul>
                <p className="leading-relaxed mb-4">Legal bases for processing include performance of contract, consent, legal obligations, and legitimate interests.</p>
                <p className="leading-relaxed mb-4">To exercise your rights, email: privacy@hostfluencer.com</p>
                
                <h3 className="text-xl font-semibold text-foreground mb-3">9.2 For California Residents (CCPA)</h3>
                <p className="leading-relaxed mb-4">You have the right to:</p>
                <ul className="list-disc pl-6 space-y-2 mb-4">
                  <li>Know what personal data we collect;</li>
                  <li>Request deletion of your data;</li>
                  <li>Opt out of data "sales" (we do not sell data);</li>
                  <li>Not be discriminated against for exercising your rights.</li>
                </ul>
                <p className="leading-relaxed">To submit a request, email: privacy@hostfluencer.com</p>
              </section>

              {/* Section 10 */}
              <section id="section-10">
                <h2 className="text-2xl font-bold text-foreground mb-4">10. CHANGES TO THIS POLICY</h2>
                <p className="leading-relaxed">We may revise this Privacy Policy from time to time. If we make material changes, we'll notify you via email or platform notice. Your continued use of the Platform constitutes acceptance of the updated Policy.</p>
              </section>

              {/* Section 11 */}
              <section id="section-11">
                <h2 className="text-2xl font-bold text-foreground mb-4">11. CONTACT INFORMATION</h2>
                <p className="leading-relaxed mb-4">If you have questions or requests regarding this Privacy Policy, please contact:</p>
                <div className="bg-muted p-4 rounded-lg">
                  <p className="font-semibold mb-2">Hostfluencer, Inc.</p>
                  <p className="text-sm text-muted-foreground mb-1">A Subsidiary of LVL Holding Inc.</p>
                  <p className="text-sm text-muted-foreground mb-1">1401 Pennsylvania Ave, Wilmington DE 19806</p>
                  <p className="text-sm text-muted-foreground">Email: privacy@hostfluencer.com</p>
                </div>
                <p className="leading-relaxed mt-6 font-medium">
                  By using Hostfluencer, you consent to this Privacy Policy and the practices described herein.
                </p>
              </section>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Back to Top Button */}
      <div className="fixed bottom-8 right-8">
        <Button
          onClick={scrollToTop}
          className="rounded-full w-12 h-12 bg-brand-green hover:bg-brand-green/90 text-white shadow-lg"
        >
          <ArrowUp className="w-5 h-5" />
        </Button>
      </div>

      <Footer />
    </div>
  );
};

export default PrivacyPolicy;
