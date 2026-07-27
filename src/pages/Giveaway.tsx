import { useRef } from 'react';
import { GiveawayHero } from '@/components/giveaway/GiveawayHero';
import { EntryForm } from '@/components/giveaway/EntryForm';
import { PrizeShowcase } from '@/components/giveaway/PrizeShowcase';
import { CountdownTimer } from '@/components/giveaway/CountdownTimer';
import { SocialProof } from '@/components/giveaway/SocialProof';
import { Button } from '@/components/ui/button';
import { Instagram, Share2, ExternalLink } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { SEO } from '@/components/SEO';

const Giveaway = () => {
  const formRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const scrollToForm = () => {
    formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleShare = async (platform: string) => {
    const url = 'https://hostfluencer.com/giveaway';
    const text = "🌴 I just entered to win a 3-night stay at @Hostfluencer's Siesta Key villa! Enter now at hostfluencer.com/giveaway 🏖️";

    switch (platform) {
      case 'instagram':
        window.open('https://www.instagram.com/hostfluencer/', '_blank');
        toast({
          title: "Opening Instagram",
          description: "Follow @Hostfluencer and engage with our giveaway post!",
        });
        break;
      case 'copy':
        await navigator.clipboard.writeText(`${text} ${url}`);
        toast({
          title: "Link Copied!",
          description: "Share it with your friends!",
        });
        break;
      default:
        break;
    }
  };

  return (
    <>
      <SEO 
        title="Win a 3-Night Stay at Siesta Key Villa" 
        description="Enter to win a luxury 3-night stay at our Siesta Key paradise villa. Free entry, US residents 18+. Winner announced 10/31 via Instagram Live."
        keywords="giveaway, vacation rental, siesta key, free stay, contest"
      />

      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-12 space-y-16">
          {/* Hero Section */}
          <section>
            <GiveawayHero onEnterClick={scrollToForm} />
          </section>

          {/* Countdown Section */}
          <section className="space-y-6">
            <h2 className="text-2xl md:text-3xl font-bold text-center">Time Remaining</h2>
            <CountdownTimer />
          </section>

          {/* How to Enter Section */}
          <section className="space-y-6">
            <div className="text-center space-y-4">
              <h2 className="text-2xl md:text-3xl font-bold">How to Enter</h2>
              <p className="text-muted-foreground">Multiple ways to increase your chances!</p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Instagram Entry */}
              <div className="bg-card border rounded-2xl p-6 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-primary/10 rounded-lg">
                    <Instagram className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold">Instagram Entry</h3>
                </div>
                
                <ol className="space-y-3 text-muted-foreground">
                  <li className="flex gap-3">
                    <span className="font-bold text-primary">1.</span>
                    <span>Follow @Hostfluencer</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="font-bold text-primary">2.</span>
                    <span>Like our giveaway post</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="font-bold text-primary">3.</span>
                    <span>Tag 2 friends in the comments</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="font-bold text-primary">Bonus:</span>
                    <span>Share to your story & tag us for an extra entry!</span>
                  </li>
                </ol>

                <Button 
                  className="w-full" 
                  variant="outline"
                  onClick={() => handleShare('instagram')}
                >
                  <Instagram className="mr-2 h-4 w-4" />
                  Go to Instagram
                </Button>
              </div>

              {/* Website Entry */}
              <div className="bg-card border rounded-2xl p-6 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-accent/10 rounded-lg">
                    <ExternalLink className="h-6 w-6 text-accent" />
                  </div>
                  <h3 className="text-xl font-semibold">Website Bonus Entry</h3>
                </div>
                
                <p className="text-muted-foreground">
                  Get an exclusive bonus entry by signing up through our website form below. 
                  This gives you an additional chance to win on top of your Instagram entry!
                </p>

                <Button 
                  className="w-full"
                  onClick={scrollToForm}
                >
                  Enter Now
                </Button>
              </div>
            </div>
          </section>

          {/* Prize Showcase */}
          <section>
            <PrizeShowcase />
          </section>

          {/* Entry Form */}
          <section ref={formRef}>
            <EntryForm />
          </section>

          {/* Social Proof */}
          <section className="text-center">
            <SocialProof />
          </section>

          {/* Share Section */}
          <section className="bg-muted/50 rounded-2xl p-8 text-center space-y-6">
            <h2 className="text-2xl font-bold">Spread the Word!</h2>
            <p className="text-muted-foreground">Share this giveaway with your friends</p>
            
            <div className="flex gap-4 justify-center flex-wrap">
              <Button
                variant="outline"
                size="lg"
                onClick={() => handleShare('instagram')}
              >
                <Instagram className="mr-2 h-5 w-5" />
                Instagram
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => handleShare('copy')}
              >
                <Share2 className="mr-2 h-5 w-5" />
                Copy Link
              </Button>
            </div>
          </section>

          {/* Footer Info */}
          <section className="text-center text-sm text-muted-foreground space-y-2">
            <p>🗓️ Giveaway ends 10/31 at 11:59 PM EST</p>
            <p>🏆 Winner announced 10/31 via Instagram Live</p>
            <p>
              📋 See full{' '}
              <a href="/raffle-rules" className="text-primary hover:underline">
                terms and conditions
              </a>
            </p>
            <p className="pt-4">
              This giveaway is not sponsored, endorsed, or administered by Instagram. 
              US residents 18+ only.
            </p>
          </section>
        </div>
      </div>
    </>
  );
};

export default Giveaway;
