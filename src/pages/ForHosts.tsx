import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Home, TrendingUp, Shield, BarChart3, Camera, Sparkles, Users, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useReferralCapture } from "@/hooks/useReferralCapture";
import { SEO, generateBreadcrumbSchema } from "@/components/SEO";
import { PillChip, SquircleIcon } from "@/components/landing/editorial/primitives";

const ForHosts = () => {
  const navigate = useNavigate();
  useReferralCapture();

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Home", url: "/" },
    { name: "For Hosts", url: "/for-hosts" }
  ]);

  const benefits = [
    { icon: Camera, title: "50+ Content Assets", description: "Get professional photos, videos, and reels from every collaboration" },
    { icon: TrendingUp, title: "Full Content Ownership", description: "You own all content forever with full commercial rights" },
    { icon: Shield, title: "One Empty Night", description: "Trade an off-peak night for $4,500+ worth of professional content" },
    { icon: Users, title: "12-24 Month Lifespan", description: "Use the same content across all marketing channels for years" },
  ];

  const howItWorks = [
    { step: "01", title: "List Your Property", description: "Create your listing with details about your space and content needs" },
    { step: "02", title: "Get Matched", description: "Our AI matches you with creators whose style fits your property" },
    { step: "03", title: "Host & Create", description: "Host the creator for one night while they produce 50+ content pieces" },
    { step: "04", title: "Own Forever", description: "Receive your content library with full ownership and commercial rights" },
  ];

  const features = [
    { icon: Home, title: "Unlimited Listings", tier: "Pro+" },
    { icon: BarChart3, title: "Performance Analytics", tier: "All Tiers" },
    { icon: Shield, title: "Creator Vetting", tier: "All Tiers" },
    { icon: Sparkles, title: "Campaign Management", tier: "Elite" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="For Hosts - Build Your Property's Content Library"
        description="The easiest way to build a professional content library for your vacation rental. Trade one empty night for 50+ marketing assets you own forever."
        canonical="/for-hosts"
        keywords="vacation rental content, property marketing, UGC content, professional photos, host marketing, content library"
        schema={breadcrumbSchema}
      />
      <Navigation />

      {/* Hero Section */}
      <section className="relative bg-background pt-28 pb-20">
        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <PillChip className="mb-6">
              <Home className="w-3.5 h-3.5" />
              For Property Owners & Hosts
            </PillChip>

            <h1 className="font-serif text-5xl md:text-6xl tracking-tight leading-[1.05] mb-6">
              Build a perpetual{" "}
              <em className="not-italic italic text-brand-green">content library</em>{" "}
              for your property
            </h1>

            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              The easiest way to build a professional content library without hiring photographers,
              videographers, or UGC creators. Trade one empty night for $4,500+ in content.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                size="lg"
                className="rounded-full bg-brand-green hover:bg-brand-green/90 text-white h-12 px-7"
                onClick={() => navigate('/auth')}
              >
                List your property free
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="lg"
                className="rounded-full h-12 px-7"
                onClick={() => navigate('/pricing')}
              >
                View pricing
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Benefits Grid */}
      <section className="py-24 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <p className="text-xs font-semibold tracking-[0.2em] uppercase text-muted-foreground mb-3">Benefits</p>
            <h2 className="font-serif text-4xl md:text-5xl tracking-tight">
              Why property owners <em className="not-italic italic text-brand-green">choose us</em>
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((benefit, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="p-7 rounded-3xl border border-border bg-card hover:border-brand-green/40 transition-colors"
              >
                <SquircleIcon className="mb-5">
                  <benefit.icon className="w-5 h-5" />
                </SquircleIcon>
                <h3 className="font-serif text-xl mb-2">{benefit.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{benefit.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 bg-brand-green/5">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <p className="text-xs font-semibold tracking-[0.2em] uppercase text-muted-foreground mb-3">Process</p>
            <h2 className="font-serif text-4xl md:text-5xl tracking-tight">
              How it <em className="not-italic italic text-brand-green">works</em>
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {howItWorks.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.15 }}
                className="flex flex-col items-start text-left"
              >
                <SquircleIcon size="lg" className="mb-5">
                  {item.step}
                </SquircleIcon>
                <h3 className="font-serif text-xl mb-2">{item.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <p className="text-xs font-semibold tracking-[0.2em] uppercase text-muted-foreground mb-3">Features</p>
            <h2 className="font-serif text-4xl md:text-5xl tracking-tight">
              Powerful features <em className="not-italic italic text-brand-green">for hosts</em>
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="p-7 rounded-3xl border border-border bg-card hover:border-brand-green/40 transition-colors"
              >
                <SquircleIcon className="mb-4">
                  <feature.icon className="w-5 h-5" />
                </SquircleIcon>
                <h3 className="font-serif text-lg mb-3">{feature.title}</h3>
                <PillChip>{feature.tier}</PillChip>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 bg-background">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="font-serif text-4xl md:text-5xl tracking-tight mb-6 leading-[1.1]">
              Trade empty nights for a year's worth of{" "}
              <em className="not-italic italic text-brand-green">content</em>
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              Join 150+ property owners already building their content libraries through creator collaborations
            </p>
            <Button
              size="lg"
              className="rounded-full bg-brand-green hover:bg-brand-green/90 text-white h-12 px-7"
              onClick={() => navigate('/auth')}
            >
              Get started free
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default ForHosts;
