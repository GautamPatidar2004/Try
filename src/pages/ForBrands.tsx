import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Briefcase, Target, BarChart3, Zap, Users, TrendingUp, Sparkles, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useReferralCapture } from "@/hooks/useReferralCapture";
import { SEO, generateBreadcrumbSchema } from "@/components/SEO";
import { PillChip, SquircleIcon } from "@/components/landing/editorial/primitives";

const ForBrands = () => {
  const navigate = useNavigate();
  useReferralCapture();

  const benefits = [
    { icon: Target, title: "Targeted Audience Reach", description: "Access creators with engaged audiences in travel, lifestyle, and hospitality" },
    { icon: Sparkles, title: "Authentic Content", description: "Get genuine, relatable content that resonates with modern consumers" },
    { icon: BarChart3, title: "Performance Tracking", description: "Real-time analytics and ROI measurement for every campaign" },
    { icon: Zap, title: "Flexible Campaigns", description: "From product placements to full brand activations, you control the scope" },
  ];

  const campaignTypes = [
    { title: "Restaurant Partnerships", description: "Food creators showcase your venue and menu to millions of food enthusiasts", reach: "2.5M+ avg reach" },
    { title: "Experience Sponsorships", description: "Partner with travel creators for destination marketing and tourism", reach: "3.2M+ avg reach" },
    { title: "Product Placements", description: "Natural product integration in authentic lifestyle content", reach: "1.8M+ avg reach" },
    { title: "Brand Activations", description: "Large-scale campaigns with multiple creators for maximum impact", reach: "10M+ potential reach" },
  ];

  const caseStudies = [
    { brand: "LA Restaurant Group", result: "2.1M reach through 8 creator partnerships", metric: "+45% reservations" },
    { brand: "Boutique Hotel Chain", result: "15 successful campaigns in 6 months", metric: "+60% brand awareness" },
  ];

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Home", url: "/" },
    { name: "For Brands", url: "/for-brands" }
  ]);

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="For Brands - Partner with Travel Influencers"
        description="Launch authentic influencer marketing campaigns with verified travel and lifestyle creators. Reach millions through strategic brand partnerships."
        canonical="/for-brands"
        keywords="influencer marketing, hospitality marketing, brand partnerships, restaurant marketing, travel influencers"
        schema={breadcrumbSchema}
      />
      <Navigation />

      {/* Hero */}
      <section className="relative bg-background pt-28 pb-20">
        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <PillChip className="mb-6">
              <Briefcase className="w-3.5 h-3.5" />
              For Brands & Restaurants
            </PillChip>

            <h1 className="font-serif text-5xl md:text-6xl tracking-tight leading-[1.05] mb-6">
              Amplify your brand through{" "}
              <em className="not-italic italic text-brand-green">authentic creator partnerships</em>
            </h1>

            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Connect with 100+ verified content creators to reach engaged audiences.
              From restaurants to product launches—create campaigns that drive real results.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                size="lg"
                className="rounded-full bg-brand-green hover:bg-brand-green/90 text-white h-12 px-7"
                onClick={() => navigate('/auth')}
              >
                Launch your first campaign
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="lg"
                className="rounded-full h-12 px-7"
                onClick={() => navigate('/marketplace')}
              >
                Browse creators
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-24 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <p className="text-xs font-semibold tracking-[0.2em] uppercase text-muted-foreground mb-3">Why us</p>
            <h2 className="font-serif text-4xl md:text-5xl tracking-tight">
              Why brands <em className="not-italic italic text-brand-green">trust Hostfluencer</em>
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

      {/* Campaign Types */}
      <section className="py-24 bg-brand-green/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <p className="text-xs font-semibold tracking-[0.2em] uppercase text-muted-foreground mb-3">Campaigns</p>
            <h2 className="font-serif text-4xl md:text-5xl tracking-tight">
              Campaign <em className="not-italic italic text-brand-green">types</em>
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {campaignTypes.map((type, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.15 }}
                className="p-8 rounded-3xl border border-border bg-card hover:border-brand-green/40 transition-colors"
              >
                <h3 className="font-serif text-2xl mb-3">{type.title}</h3>
                <p className="text-muted-foreground mb-5">{type.description}</p>
                <PillChip>
                  <TrendingUp className="w-3.5 h-3.5" />
                  {type.reach}
                </PillChip>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Case Studies */}
      <section className="py-24 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <p className="text-xs font-semibold tracking-[0.2em] uppercase text-muted-foreground mb-3">Results</p>
            <h2 className="font-serif text-4xl md:text-5xl tracking-tight">
              Success <em className="not-italic italic text-brand-green">stories</em>
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
            {caseStudies.map((study, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2 }}
                className="p-8 rounded-3xl bg-foreground text-background"
              >
                <Users className="w-10 h-10 mb-5 opacity-80" />
                <h3 className="font-serif text-2xl mb-2">{study.brand}</h3>
                <p className="text-base mb-4 opacity-80">{study.result}</p>
                <div className="font-serif text-3xl text-brand-green">{study.metric}</div>
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
              Ready to elevate your{" "}
              <em className="not-italic italic text-brand-green">brand?</em>
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              Join leading brands using creator partnerships to reach millions
            </p>
            <Button
              size="lg"
              className="rounded-full bg-brand-green hover:bg-brand-green/90 text-white h-12 px-7"
              onClick={() => navigate('/auth')}
            >
              Start your campaign
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default ForBrands;
