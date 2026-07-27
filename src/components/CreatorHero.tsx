import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { PillChip, LiveDot } from "@/components/landing/editorial/primitives";
import FeaturedCreatorRotator from "@/components/FeaturedCreatorRotator";

const CreatorHero = () => {
  const navigate = useNavigate();

  return (
    <section className="relative bg-background pt-28 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-8">
            <PillChip>
              <LiveDot />
              For Creators
            </PillChip>
            <div className="space-y-6">
              <h1 className="font-serif text-5xl md:text-6xl tracking-tight text-foreground leading-[1.05]">
                Turn your{" "}
                <em className="not-italic italic text-brand-green">content</em>
                <br />into travel
              </h1>
              <p className="text-xl text-muted-foreground max-w-xl">
                Connect with amazing hosts worldwide, create authentic content, and get free accommodation while traveling to incredible destinations.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                size="lg"
                className="rounded-full bg-brand-green hover:bg-brand-green/90 text-white h-12 px-7"
                onClick={() => navigate('/auth')}
              >
                Start creating
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="lg"
                className="rounded-full h-12 px-7"
                onClick={() => navigate('/marketplace')}
              >
                Browse properties
              </Button>
            </div>
          </div>

          {/* Right Content - Featured Creator */}
          <FeaturedCreatorRotator />
        </div>
      </div>
    </section>
  );
};

export default CreatorHero;
