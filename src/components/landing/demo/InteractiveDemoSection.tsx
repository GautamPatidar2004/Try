import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";
import { CreatorDemoExperience } from "./CreatorDemoExperience";
import { HostDemoExperience } from "./HostDemoExperience";

export const InteractiveDemoSection = () => {
  const [activeMode, setActiveMode] = useState<'creator' | 'host'>('creator');

  return (
    <section className="py-20 bg-gradient-to-b from-background via-primary/5 to-background">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-4">
            <Sparkles className="w-4 h-4" />
            <span className="text-sm font-medium">Interactive Demo</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Experience the Platform
          </h2>
          <p className="text-lg text-muted-foreground">
            Try it yourself! Explore how creators find opportunities or how partners manage collaborations.
            <br />
            <span className="text-sm">No signup required to explore</span>
          </p>
        </div>

        {/* Mode Toggle */}
        <div className="flex justify-center mb-6 sm:mb-10">
          <div className="flex flex-col sm:flex-row gap-2 p-1 rounded-lg bg-muted w-full sm:w-auto">
            <Button
              variant={activeMode === 'creator' ? 'default' : 'ghost'}
              onClick={() => setActiveMode('creator')}
              className="rounded-md w-full sm:w-auto"
            >
              Creator Experience
            </Button>
            <Button
              variant={activeMode === 'host' ? 'default' : 'ghost'}
              onClick={() => setActiveMode('host')}
              className="rounded-md w-full sm:w-auto"
            >
              Host Experience
            </Button>
          </div>
        </div>

        {/* Demo Experience */}
        <div className="bg-background/50 backdrop-blur-sm rounded-2xl border shadow-lg p-4 sm:p-6 md:p-8">
          {activeMode === 'creator' ? (
            <div>
              <div className="mb-6">
                <h3 className="text-2xl font-semibold mb-2">Browse Properties, Restaurants & Brand Deals</h3>
                <p className="text-muted-foreground">
                  Explore stunning properties, dining experiences, and brand partnerships. View details and submit your collaboration proposal.
                </p>
              </div>
              <CreatorDemoExperience />
            </div>
          ) : (
            <div>
              <div className="mb-6">
                <h3 className="text-2xl font-semibold mb-2">Manage Your Listings & Applications</h3>
                <p className="text-muted-foreground">
                  View your performance across properties, restaurants, or brand campaigns and review applications from talented creators.
                </p>
              </div>
              <HostDemoExperience />
            </div>
          )}
        </div>

        <p className="text-center text-sm text-muted-foreground mt-6">
          This is a demo experience. Sign up to access the full platform with real opportunities and creators.
        </p>
      </div>
    </section>
  );
};
