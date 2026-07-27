import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Camera, Sparkles, Globe2, Building2, Users, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PillChip, SquircleIcon, LiveDot } from "./primitives";
import { cn } from "@/lib/utils";

type Persona = "creator" | "brand";

const personaContent = {
  creator: {
    benefits: [
      { icon: Camera, title: "Free luxury stays", desc: "Trade content for nights at vetted properties." },
      { icon: Sparkles, title: "Brand collabs that pay", desc: "Paid campaigns from hospitality brands you love." },
      { icon: Globe2, title: "47 countries & growing", desc: "Discover collabs everywhere you travel." },
    ],
    cta: "Join as a creator",
    secondary: "Browse opportunities",
    secondaryRoute: "/marketplace",
  },
  brand: {
    benefits: [
      { icon: Building2, title: "Vetted creators only", desc: "Real audiences, verified metrics, zero noise." },
      { icon: Users, title: "Fill empty nights", desc: "Trade off-peak inventory for perpetual content." },
      { icon: TrendingUp, title: "Own the content forever", desc: "Full usage rights baked into every collab." },
    ],
    cta: "List your property",
    secondary: "See how it works",
    secondaryRoute: "/for-hosts",
  },
};

export const EditorialHero = () => {
  const navigate = useNavigate();
  const [persona, setPersona] = useState<Persona>("creator");
  const content = personaContent[persona];

  return (
    <section className="relative bg-background pt-28 pb-20 md:pt-36 md:pb-28">
      <div className="max-w-6xl mx-auto px-6 lg:px-8">
        {/* Top stat pill */}
        <div className="flex justify-center mb-10">
          <PillChip variant="mint">
            <LiveDot />
            <span className="font-semibold">254 opportunities</span>
            <span className="text-muted-foreground">·</span>
            <span>19 new today</span>
          </PillChip>
        </div>

        {/* Headline */}
        <h1 className="font-serif text-center text-5xl md:text-7xl lg:text-[5.5rem] leading-[1.05] tracking-tight text-foreground mb-8">
          The feed for{" "}
          <em className="text-brand-green not-italic font-serif italic">
            hospitality collabs
          </em>
        </h1>

        {/* Subhead */}
        <p className="text-center text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
          New stays, brand deals and creator collabs drop daily. Be the first to apply.
        </p>

        {/* Persona toggle */}
        <div className="flex justify-center mb-12">
          <div className="inline-flex items-center bg-muted rounded-full p-1 border border-border">
            {(["creator", "brand"] as Persona[]).map((p) => (
              <button
                key={p}
                onClick={() => setPersona(p)}
                className={cn(
                  "px-5 py-2 text-sm font-medium rounded-full transition-all",
                  persona === p
                    ? "bg-foreground text-background shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {p === "creator" ? "I'm a creator" : "I'm a hospitality brand"}
              </button>
            ))}
          </div>
        </div>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-20">
          <Button
            size="lg"
            onClick={() => navigate("/auth")}
            className="rounded-full bg-brand-green hover:bg-brand-green/90 text-white h-12 px-7 text-base font-medium group"
          >
            {content.cta}
            <ArrowRight className="ml-1 w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Button>
          <Button
            size="lg"
            variant="ghost"
            onClick={() => navigate(content.secondaryRoute)}
            className="rounded-full h-12 px-6 text-base font-medium text-foreground hover:bg-muted"
          >
            {content.secondary}
          </Button>
        </div>

        {/* Three benefits */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-10">
          {content.benefits.map((b) => (
            <div key={b.title} className="flex flex-col items-start gap-4">
              <SquircleIcon size="lg">
                <b.icon className="w-6 h-6" strokeWidth={1.75} />
              </SquircleIcon>
              <div>
                <h3 className="font-serif text-xl text-foreground mb-1.5">{b.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{b.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
