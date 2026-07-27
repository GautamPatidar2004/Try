import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowUp, Printer } from "lucide-react";
import Footer from "@/components/Footer";
import { SEO } from "@/components/SEO";

const TermsOfService = () => {
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
        title="Terms of Service - Hostfluencer"
        description="Read the Terms of Service governing your use of the Hostfluencer platform. Understand your rights and responsibilities as a user."
        canonical="/terms-of-service"
        noIndex={false}
      />
      {/* Header */}
      <div className="bg-card border-b border-border">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">Hostfluencer – Terms of Service</h1>
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
              <a href="#section-1" className="text-brand-green hover:underline">1. Platform Purpose</a>
              <a href="#section-2" className="text-brand-green hover:underline">2. Eligibility</a>
              <a href="#section-3" className="text-brand-green hover:underline">3. Account Registration</a>
              <a href="#section-4" className="text-brand-green hover:underline">4. User Responsibilities</a>
              <a href="#section-5" className="text-brand-green hover:underline">5. Host–Creator Engagement Terms</a>
              <a href="#section-6" className="text-brand-green hover:underline">6. Payments, Fees & Charges</a>
              <a href="#section-7" className="text-brand-green hover:underline">7. Content Rights & Licensing</a>
              <a href="#section-8" className="text-brand-green hover:underline">8. Platform IP & Technology</a>
              <a href="#section-9" className="text-brand-green hover:underline">9. Confidentiality & Non-Circumvention</a>
              <a href="#section-10" className="text-brand-green hover:underline">10. Disclaimers</a>
              <a href="#section-11" className="text-brand-green hover:underline">11. Limitation of Liability</a>
              <a href="#section-12" className="text-brand-green hover:underline">12. Indemnification</a>
              <a href="#section-13" className="text-brand-green hover:underline">13. Term & Termination</a>
              <a href="#section-14" className="text-brand-green hover:underline">14. Governing Law & Dispute Resolution</a>
              <a href="#section-15" className="text-brand-green hover:underline">15. Modifications to Terms</a>
              <a href="#section-16" className="text-brand-green hover:underline">16. Contact Information</a>
            </div>
          </CardContent>
        </Card>

        {/* Terms Content */}
        <Card>
          <CardContent className="p-8 prose prose-gray dark:prose-invert max-w-none">
            <div className="space-y-8">
              {/* Introduction */}
              <div>
                <p className="text-lg leading-relaxed mb-6">
                  These Terms of Service ("Terms") constitute a legally binding agreement between you and Hostfluencer, Inc. ("Hostfluencer", "we", "our", or "us"), a subsidiary of LVL Holding Inc., governing your access to and use of the Hostfluencer platform, including our website(s), mobile application(s), communications systems, and related services (collectively, the "Platform").
                </p>
                <p className="leading-relaxed mb-6">
                  Hostfluencer operates as a technology marketplace that connects property owners and managers (including but not limited to Airbnb hosts, vacation rental managers, boutique hotels, and hotel brands, collectively "Hosts") with digital content creators (including UGC influencers, social media influencers, photographers, videographers, and other creative professionals, collectively "Creators").
                </p>
                <p className="leading-relaxed">
                  By accessing or using the Platform, you confirm that you have read, understood, and agreed to these Terms and our Privacy Policy. If you do not accept these Terms, you may not access or use the Platform.
                </p>
              </div>

              {/* Section 1 */}
              <section id="section-1">
                <h2 className="text-2xl font-bold text-foreground mb-4">1. PLATFORM PURPOSE</h2>
                <p className="leading-relaxed mb-4">
                  Hostfluencer facilitates discovery, negotiation, and delivery of collaborations between Hosts and Creators. These collaborations may include:
                </p>
                <p className="leading-relaxed mb-2">
                  <strong>Content-for-stay exchanges:</strong> Creators receive a free stay in exchange for producing specific media deliverables.
                </p>
                <p className="leading-relaxed mb-2">
                  <strong>Paid campaigns:</strong> Hosts pay Creators for content, services, or amplification.
                </p>
                <p className="leading-relaxed mb-4">
                  <strong>Monetized stays:</strong> Creators book accommodations and are charged standard nightly rates, optionally inclusive of content requirements.
                </p>
                <p className="leading-relaxed">
                  Hostfluencer is not a party to any agreement between Host and Creator. We provide tools for communication, payment, and campaign management, but we do not control or guarantee the outcome of any agreement, stay, or creative output.
                </p>
              </section>

              {/* Section 2 */}
              <section id="section-2">
                <h2 className="text-2xl font-bold text-foreground mb-4">2. ELIGIBILITY</h2>
                <p className="leading-relaxed mb-4">To register for an account or use the Platform, you must:</p>
                <ul className="list-disc pl-6 space-y-2 mb-4">
                  <li>Be at least 18 years old;</li>
                  <li>Have the legal capacity to enter into contracts;</li>
                  <li>Provide true and accurate account information;</li>
                  <li>Not be barred from using the Platform under applicable law.</li>
                </ul>
                <p className="leading-relaxed">
                  Accounts may not be shared or transferred without written authorization from Hostfluencer.
                </p>
              </section>

              {/* Section 3 */}
              <section id="section-3">
                <h2 className="text-2xl font-bold text-foreground mb-4">3. ACCOUNT REGISTRATION</h2>
                <p className="leading-relaxed mb-4">There are two user types on the Platform:</p>
                <p className="leading-relaxed mb-2">
                  <strong>Hosts:</strong> Individuals or businesses listing accommodations and seeking promotional content.
                </p>
                <p className="leading-relaxed mb-4">
                  <strong>Creators:</strong> Individuals or agencies providing user-generated content or promotional services.
                </p>
                <p className="leading-relaxed mb-4">You are responsible for:</p>
                <ul className="list-disc pl-6 space-y-2 mb-4">
                  <li>Maintaining the confidentiality of your account credentials;</li>
                  <li>Ensuring that your profile (bio, property listing, portfolio, links, etc.) is accurate and lawful;</li>
                  <li>Complying with all applicable laws, regulations, and policies.</li>
                </ul>
                <p className="leading-relaxed">
                  Hostfluencer reserves the right to reject, suspend, or terminate accounts at its sole discretion, with or without notice.
                </p>
              </section>

              {/* Section 4 */}
              <section id="section-4">
                <h2 className="text-2xl font-bold text-foreground mb-4">4. USER RESPONSIBILITIES</h2>
                <p className="leading-relaxed mb-4">All users agree not to:</p>
                <ul className="list-disc pl-6 space-y-2 mb-4">
                  <li>Impersonate others or misrepresent your affiliation;</li>
                  <li>Post fraudulent, misleading, or unauthorized content;</li>
                  <li>Circumvent the Platform by initiating off-platform deals to avoid fees;</li>
                  <li>Upload or request unlawful, explicit, defamatory, or harmful content;</li>
                  <li>Use the Platform to facilitate illegal transactions, including tax evasion or fraudulent chargebacks.</li>
                </ul>
                <p className="leading-relaxed">
                  Violations may result in removal, suspension, or permanent ban from the Platform and referral to legal authorities if applicable.
                </p>
              </section>

              {/* Section 5 */}
              <section id="section-5">
                <h2 className="text-2xl font-bold text-foreground mb-4">5. HOST–CREATOR ENGAGEMENT TERMS</h2>
                <h3 className="text-xl font-semibold text-foreground mb-3">5.1 Booking & Campaign Terms</h3>
                <p className="leading-relaxed mb-4">Each engagement (free stay, paid stay, or content deal) must clearly include:</p>
                <ul className="list-disc pl-6 space-y-2 mb-4">
                  <li>Start and end dates</li>
                  <li>Location and property details</li>
                  <li>Deliverables and usage rights</li>
                  <li>Payment terms and compensation (if applicable)</li>
                  <li>Delivery timelines and review rights</li>
                </ul>
                <p className="leading-relaxed mb-4">
                  Hostfluencer may offer templates or campaign tracking tools but is not responsible for enforcing agreement terms unless explicitly contracted for white-glove campaign services.
                </p>
                <h3 className="text-xl font-semibold text-foreground mb-3">5.2 Cancellations</h3>
                <p className="leading-relaxed mb-4">Both Hosts and Creators are expected to honor scheduled commitments.</p>
                <p className="leading-relaxed mb-2">Creators who cancel last-minute or fail to deliver content may be removed from the Platform.</p>
                <p className="leading-relaxed">Hosts who cancel booked stays without valid cause may face account restrictions or public feedback consequences.</p>
              </section>

              {/* Section 6 */}
              <section id="section-6">
                <h2 className="text-2xl font-bold text-foreground mb-4">6. PAYMENTS, FEES & CHARGES</h2>
                <h3 className="text-xl font-semibold text-foreground mb-3">6.1 Payment Processing</h3>
                <p className="leading-relaxed mb-4">
                  Hostfluencer uses third-party payment processors (e.g., Stripe) to facilitate transactions. By using the Platform, you agree to their terms and authorize Hostfluencer to initiate charges or payouts.
                </p>
                <h3 className="text-xl font-semibold text-foreground mb-3">6.2 Platform Fees</h3>
                <p className="leading-relaxed mb-4">Fees vary by plan and usage tier;</p>
                <p className="leading-relaxed mb-2"><strong>Free Plan:</strong> $0/month, limited functionality.</p>
                <p className="leading-relaxed mb-2"><strong>Pro Plan:</strong> $49/month, up to 5 properties, access to verified Creators.</p>
                <p className="leading-relaxed mb-6"><strong>Premium Plan:</strong> $199/month, unlimited listings, priority services, AI insights.</p>
                <p className="leading-relaxed mb-4">
                  Transaction fees may apply (e.g., processing or service fee per booking or content delivery). Fees are non-refundable unless expressly stated.
                </p>
                <h3 className="text-xl font-semibold text-foreground mb-3">6.3 Disputes</h3>
                <p className="leading-relaxed">
                  Payment disputes must be submitted through Hostfluencer's support team within 7 days of transaction. Hostfluencer will investigate but does not guarantee resolution, particularly where disputes are based on subjective satisfaction (e.g., content quality, engagement levels).
                </p>
              </section>

              {/* Section 7 */}
              <section id="section-7">
                <h2 className="text-2xl font-bold text-foreground mb-4">7. CONTENT RIGHTS & LICENSING</h2>
                <h3 className="text-xl font-semibold text-foreground mb-3">7.1 Creator Content Ownership</h3>
                <p className="leading-relaxed mb-4">
                  All content (videos, photos, reels, stories, blog posts, etc.) created by Creators is their intellectual property unless a separate agreement states otherwise.
                </p>
                <p className="leading-relaxed mb-4">By uploading content to the Platform or delivering it to Hosts, Creators grant:</p>
                <p className="leading-relaxed mb-2">
                  <strong>Hosts:</strong> a limited, non-exclusive, royalty-free, perpetual license to use the content for marketing, booking, and promotional purposes related to the property listed, unless otherwise limited in writing.
                </p>
                <p className="leading-relaxed mb-4">
                  <strong>Hostfluencer and LVL Holding Inc.:</strong> a non-exclusive license to display, reproduce, and promote the content in marketing materials, product showcases, investor presentations, case studies, and across its owned digital properties and subsidiaries.
                </p>
                <h3 className="text-xl font-semibold text-foreground mb-3">7.2 Host Responsibilities</h3>
                <p className="leading-relaxed mb-4">Hosts must:</p>
                <ul className="list-disc pl-6 space-y-2 mb-4">
                  <li>Respect the licensing terms of content delivered;</li>
                  <li>Not sell or sublicense Creator content without explicit written permission;</li>
                  <li>Provide accurate property visuals and descriptions to prevent misrepresentation.</li>
                </ul>
                <p className="leading-relaxed">
                  Hosts assume all liability for unauthorized use or distribution of Creator content beyond agreed rights.
                </p>
              </section>

              {/* Section 8 */}
              <section id="section-8">
                <h2 className="text-2xl font-bold text-foreground mb-4">8. PLATFORM IP & TECHNOLOGY</h2>
                <p className="leading-relaxed mb-4">Hostfluencer and LVL Holding Inc. retain all ownership and rights to:</p>
                <ul className="list-disc pl-6 space-y-2 mb-4">
                  <li>The Platform's design, features, and technology;</li>
                  <li>All user interface elements, AI tools, algorithms, branding, and backend systems;</li>
                  <li>Data and analytics derived from Platform usage (aggregated and anonymized).</li>
                </ul>
                <p className="leading-relaxed">
                  Users may not copy, reverse-engineer, scrape, or extract data from the Platform for commercial use.
                </p>
              </section>

              {/* Section 9 */}
              <section id="section-9">
                <h2 className="text-2xl font-bold text-foreground mb-4">9. CONFIDENTIALITY & NON-CIRCUMVENTION</h2>
                <p className="leading-relaxed mb-4">
                  All proposals, campaign structures, and private communications on the Platform are confidential. Users may not:
                </p>
                <ul className="list-disc pl-6 space-y-2 mb-4">
                  <li>Solicit or engage other users outside of the Platform to bypass fees;</li>
                  <li>Share confidential pricing or usage metrics;</li>
                  <li>Clone the model, campaigns, or user data for competitive purposes.</li>
                </ul>
                <p className="leading-relaxed">
                  Violation may result in permanent removal and legal action, including injunctive relief.
                </p>
              </section>

              {/* Section 10 */}
              <section id="section-10">
                <h2 className="text-2xl font-bold text-foreground mb-4">10. DISCLAIMERS</h2>
                <p className="leading-relaxed mb-4">
                  Hostfluencer is a technology facilitator and does not verify the identity, qualifications, background, or legal compliance of Hosts or Creators.
                </p>
                <ul className="list-disc pl-6 space-y-2 mb-4">
                  <li>We do not guarantee content quality, campaign results, booking satisfaction, or influencer reach.</li>
                  <li>All use of the Platform is at your own risk.</li>
                  <li>We disclaim all warranties, express or implied, including fitness for a particular purpose, merchantability, or non-infringement.</li>
                </ul>
              </section>

              {/* Section 11 */}
              <section id="section-11">
                <h2 className="text-2xl font-bold text-foreground mb-4">11. LIMITATION OF LIABILITY</h2>
                <p className="leading-relaxed mb-4">To the fullest extent permitted by law:</p>
                <ul className="list-disc pl-6 space-y-2 mb-4">
                  <li>Hostfluencer shall not be liable for any indirect, incidental, consequential, special, exemplary, or punitive damages;</li>
                  <li>Our aggregate liability under these Terms shall not exceed the greater of: (i) total fees paid to Hostfluencer in the six (6) months preceding the claim; or (ii) one hundred U.S. dollars ($100).</li>
                </ul>
              </section>

              {/* Section 12 */}
              <section id="section-12">
                <h2 className="text-2xl font-bold text-foreground mb-4">12. INDEMNIFICATION</h2>
                <p className="leading-relaxed mb-4">
                  You agree to indemnify and hold harmless Hostfluencer, LVL Holding Inc., and their officers, directors, affiliates, partners, and employees from any claim, liability, loss, damage, or expense arising from:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Your use of the Platform;</li>
                  <li>Your violation of these Terms;</li>
                  <li>Any content you provide or agreements you enter into with other users.</li>
                </ul>
              </section>

              {/* Section 13 */}
              <section id="section-13">
                <h2 className="text-2xl font-bold text-foreground mb-4">13. TERM & TERMINATION</h2>
                <p className="leading-relaxed mb-4">
                  These Terms are effective until terminated. You may terminate your account at any time. Hostfluencer reserves the right to terminate or suspend your access without notice for any violation of these Terms.
                </p>
                <p className="leading-relaxed mb-4">Upon termination:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>You will lose access to your account and data;</li>
                  <li>Licensing rights previously granted will survive;</li>
                  <li>Hostfluencer may retain and use content created on the Platform for legal and promotional purposes.</li>
                </ul>
              </section>

              {/* Section 14 */}
              <section id="section-14">
                <h2 className="text-2xl font-bold text-foreground mb-4">14. GOVERNING LAW & DISPUTE RESOLUTION</h2>
                <p className="leading-relaxed mb-4">
                  These Terms are governed by the laws of the State of Delaware, without regard to its conflict of law provisions.
                </p>
                <p className="leading-relaxed mb-4">
                  Any disputes will be resolved via binding arbitration under the rules of the American Arbitration Association. You waive the right to a trial by jury and to participate in class actions.
                </p>
                <p className="leading-relaxed">
                  Venue for arbitration shall be [Insert City, Delaware or California]. Judgment on the award may be entered in any court with jurisdiction.
                </p>
              </section>

              {/* Section 15 */}
              <section id="section-15">
                <h2 className="text-2xl font-bold text-foreground mb-4">15. MODIFICATIONS TO TERMS</h2>
                <p className="leading-relaxed">
                  Hostfluencer may update these Terms from time to time. If changes are material, we will notify you via email or prominent notice on the Platform. Continued use after the changes constitute your acceptance of the new Terms.
                </p>
              </section>

              {/* Section 16 */}
              <section id="section-16">
                <h2 className="text-2xl font-bold text-foreground mb-4">16. CONTACT INFORMATION</h2>
                <p className="leading-relaxed mb-4">For questions or concerns about these Terms, please contact:</p>
                <div className="bg-muted p-4 rounded-lg">
                  <p className="font-semibold mb-2">Hostfluencer, Inc.</p>
                  <p className="text-sm text-muted-foreground mb-1">A Subsidiary of LVL Holding Inc.</p>
                  <p className="text-sm text-muted-foreground mb-1">1401 Pennsylvania Ave, Wilmington DE 19806</p>
                  <p className="text-sm text-muted-foreground">Email: Support@lvlholding.co</p>
                </div>
                <p className="leading-relaxed mt-6 font-medium">
                  By using the Hostfluencer Platform, you agree to abide by these Terms in full.
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

export default TermsOfService;
