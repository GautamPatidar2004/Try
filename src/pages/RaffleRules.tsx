import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { SEO } from '@/components/SEO';

const RaffleRules = () => {
  const navigate = useNavigate();

  return (
    <>
      <SEO 
        title="Giveaway Terms & Conditions" 
        description="Official rules and terms for the Hostfluencer Siesta Key Villa Giveaway. Read eligibility requirements, prize details, and legal terms."
        keywords="giveaway rules, contest terms, raffle conditions"
      />

      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-12 max-w-4xl">
          <Button
            variant="ghost"
            onClick={() => navigate('/giveaway')}
            className="mb-6"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Giveaway
          </Button>

          <div className="space-y-8 bg-card border rounded-2xl p-8 md:p-12">
            <div className="space-y-4">
              <h1 className="text-3xl md:text-4xl font-bold">
                Giveaway Official Rules
              </h1>
              <p className="text-muted-foreground">
                Siesta Key Villa 3-Night Stay Giveaway
              </p>
              <p className="text-sm text-muted-foreground">
                Effective Date: October 20, 2025
              </p>
            </div>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold">1. Eligibility</h2>
              <div className="space-y-2 text-muted-foreground">
                <p>
                  This giveaway is open to legal residents of the United States who are 18 years of age or older at the time of entry.
                </p>
                <p>
                  Employees, officers, and directors of Hostfluencer, and their immediate family members and household members, are not eligible to participate.
                </p>
                <p>
                  Void where prohibited by law. All federal, state, and local laws and regulations apply.
                </p>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold">2. Entry Period</h2>
              <div className="space-y-2 text-muted-foreground">
                <p>
                  The giveaway begins on October 20, 2025 and ends on October 31, 2025 at 11:59 PM EST.
                </p>
                <p>
                  All entries must be received by the end of the Entry Period to be eligible.
                </p>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold">3. How to Enter</h2>
              <div className="space-y-3 text-muted-foreground">
                <p className="font-medium text-foreground">Instagram Entry Method:</p>
                <ol className="list-decimal list-inside space-y-2 ml-4">
                  <li>Follow @Hostfluencer on Instagram</li>
                  <li>Like the official giveaway post</li>
                  <li>Tag 2 friends in the comments of the giveaway post</li>
                  <li>Optional Bonus: Share the post to your Instagram story and tag @Hostfluencer for an additional entry</li>
                </ol>

                <p className="font-medium text-foreground pt-4">Website Bonus Entry Method:</p>
                <ol className="list-decimal list-inside space-y-2 ml-4">
                  <li>Visit hostfluencer.com/giveaway</li>
                  <li>Complete the entry form with accurate information</li>
                  <li>Agree to the official rules and terms</li>
                </ol>

                <p className="pt-4">
                  <strong>No Purchase Necessary:</strong> A purchase is not required to enter or win.
                </p>
                <p>
                  Limit one (1) entry per person via each entry method. Multiple entries from the same person will be disqualified.
                </p>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold">4. Prize Details</h2>
              <div className="space-y-2 text-muted-foreground">
                <p className="font-medium text-foreground">Grand Prize:</p>
                <p>
                  One (1) winner will receive a three (3) night stay at a Siesta Key, Florida villa property.
                </p>
                <p className="font-medium text-foreground pt-4">Prize Includes:</p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>3-night accommodation</li>
                  <li>Taxes and cleaning fees</li>
                  <li>Standard amenities as listed on the property</li>
                </ul>

                <p className="font-medium text-foreground pt-4">Prize Does NOT Include:</p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Travel to/from the property</li>
                  <li>Meals or personal expenses</li>
                  <li>Additional nights beyond the 3-night stay</li>
                  <li>Any damages or incidental charges</li>
                </ul>

                <p className="pt-4">
                  Approximate Retail Value (ARV): $1,500
                </p>
                <p>
                  The prize must be redeemed within 90 days of winner notification. Subject to availability and blackout dates (major holidays, peak season dates as determined by property owner).
                </p>
                <p>
                  Prize is non-transferable, non-exchangeable, and has no cash value. Winner must sign a liability waiver and prize acceptance form.
                </p>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold">5. Winner Selection</h2>
              <div className="space-y-2 text-muted-foreground">
                <p>
                  One (1) winner will be selected at random from all eligible entries received during the Entry Period.
                </p>
                <p>
                  The winner will be announced on October 31, 2025 via Instagram Live on the @Hostfluencer account.
                </p>
                <p>
                  The winner will be contacted via Instagram direct message and/or email within 48 hours of the announcement.
                </p>
                <p>
                  Winner must respond within 48 hours of notification to claim the prize. If the winner does not respond within 48 hours, an alternate winner will be selected.
                </p>
                <p>
                  Odds of winning depend on the number of eligible entries received.
                </p>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold">6. Winner Requirements</h2>
              <div className="space-y-2 text-muted-foreground">
                <p>
                  Winner must provide valid identification and proof of eligibility.
                </p>
                <p>
                  Winner will be required to sign and return an Affidavit of Eligibility, Liability Release, and (where legal) Publicity Release within seven (7) days of notification.
                </p>
                <p>
                  Winner is responsible for all taxes associated with prize acceptance, including any applicable federal, state, and local taxes.
                </p>
                <p>
                  Winner must comply with all property rules and regulations during their stay.
                </p>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold">7. General Conditions</h2>
              <div className="space-y-2 text-muted-foreground">
                <p>
                  By entering, participants agree to be bound by these Official Rules and the decisions of the Sponsor, which are final and binding in all respects.
                </p>
                <p>
                  Sponsor reserves the right to disqualify any entrant who violates these rules, tampers with the entry process, or acts in an unsportsmanlike or disruptive manner.
                </p>
                <p>
                  Sponsor reserves the right to cancel, modify, or suspend the giveaway if fraud, technical failures, or any other factor impairs the integrity of the giveaway.
                </p>
                <p>
                  This promotion is in no way sponsored, endorsed, administered by, or associated with Instagram, Facebook, or Meta Platforms, Inc.
                </p>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold">8. Privacy & Data Use</h2>
              <div className="space-y-2 text-muted-foreground">
                <p>
                  Information collected from entrants will be used solely for the purpose of administering this giveaway and may be used for future marketing communications from Hostfluencer.
                </p>
                <p>
                  Entrants may opt out of marketing communications at any time.
                </p>
                <p>
                  By entering, participants consent to the use of their name, voice, and likeness for promotional purposes without additional compensation, where permitted by law.
                </p>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold">9. Limitation of Liability</h2>
              <div className="space-y-2 text-muted-foreground">
                <p>
                  Sponsor is not responsible for lost, late, incomplete, damaged, stolen, misdirected, or illegible entries.
                </p>
                <p>
                  Sponsor is not responsible for technical, hardware, or software malfunctions, lost or unavailable network connections, or failed, incorrect, inaccurate, incomplete, or delayed electronic communications.
                </p>
                <p>
                  By accepting the prize, winner agrees to release and hold harmless Sponsor, its affiliates, and their respective officers, directors, employees, and agents from any and all liability for any injuries, loss, or damage of any kind arising from or in connection with the giveaway or acceptance, possession, or use of the prize.
                </p>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold">10. Governing Law</h2>
              <div className="space-y-2 text-muted-foreground">
                <p>
                  This giveaway is governed by the laws of the United States and the State of Florida, without regard to conflict of law principles.
                </p>
                <p>
                  Any disputes arising from this giveaway shall be resolved in the appropriate courts of Florida.
                </p>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold">11. Sponsor Information</h2>
              <div className="space-y-2 text-muted-foreground">
                <p>
                  This giveaway is sponsored by Hostfluencer.
                </p>
                <p>
                  For questions regarding this giveaway, please contact us through our website at hostfluencer.com/contact.
                </p>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold">12. Winner's List</h2>
              <div className="space-y-2 text-muted-foreground">
                <p>
                  For the name of the winner, visit hostfluencer.com/giveaway after November 1, 2025, or send a self-addressed stamped envelope to: Hostfluencer Giveaway Winner, [Address to be provided].
                </p>
              </div>
            </section>

            <div className="pt-8 border-t">
              <p className="text-sm text-muted-foreground">
                Last Updated: October 20, 2025
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                © 2025 Hostfluencer. All rights reserved.
              </p>
            </div>
          </div>

          <div className="mt-8 text-center">
            <Button onClick={() => navigate('/giveaway')} size="lg">
              Back to Giveaway
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};

export default RaffleRules;
