import React from "react";
import { motion } from "framer-motion";
import { Check, ArrowRight, Zap, Rocket, Crown, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useProductAnalytics } from "@/hooks/useProductAnalytics";

interface StaticPlan {
  id: string;
  name: string;
  description: string;
  price_monthly: number;
  price_yearly: number;
  features: string[];
  highlighted?: boolean;
}

const brandPlansStatic: StaticPlan[] = [
  {
    id: "brand-entry",
    name: "Entry",
    description: "For growing brands starting with creator partnerships",
    price_monthly: 199,
    price_yearly: 1900,
    features: [
      "5 active campaigns",
      "Access to vetted creators",
      "Standard creator matching",
      "Basic analytics",
      "1 team seat"
    ],
    highlighted: false
  },
  {
    id: "brand-growth",
    name: "Growth",
    description: "For active brands scaling their campaigns",
    price_monthly: 499,
    price_yearly: 4750,
    features: [
      "Unlimited active campaigns",
      "AI-powered creator matching",
      "Advanced analytics dashboard",
      "3 team seats",
      "Priority support"
    ],
    highlighted: true
  },
  {
    id: "brand-scale",
    name: "Scale",
    description: "For large brands requiring dedicated support and advanced tooling",
    price_monthly: 999,
    price_yearly: 9500,
    features: [
      "Everything in Growth",
      "Dedicated campaign manager",
      "Custom creator onboarding",
      "Unlimited team seats",
      "24/7 Premium support"
    ],
    highlighted: false
  }
];

const hostPlansStatic: StaticPlan[] = [
  {
    id: "host-check-in",
    name: "Check-in",
    description: "For individual hosts getting started with content collaborations",
    price_monthly: 299,
    price_yearly: 2871,
    features: [
      "1 property listing",
      "10 creator pitches/month",
      "Verified property badge",
      "Basic performance stats",
      "Standard support"
    ],
    highlighted: false
  },
  {
    id: "host-extended-stay",
    name: "Extended Stay",
    description: "For hosts looking to scale their content library across multiple spaces",
    price_monthly: 599,
    price_yearly: 5751,
    features: [
      "Up to 5 property listings",
      "Unlimited creator pitches",
      "AI-powered matching priority",
      "Advanced analytics",
      "Priority support"
    ],
    highlighted: true
  },
  {
    id: "host-owner",
    name: "Owner",
    description: "For professional hosts and property managers with larger portfolios",
    price_monthly: 1099,
    price_yearly: 10551,
    features: [
      "Unlimited property listings",
      "Unlimited creator pitches",
      "Featured property placements",
      "Dedicated account manager",
      "Premium support"
    ],
    highlighted: false
  }
];

export const PricingPreview = () => {
  const navigate = useNavigate();
  const { trackMarketingCta } = useProductAnalytics();
  const [billingInterval, setBillingInterval] = React.useState<'monthly' | 'yearly'>('monthly');

  const handlePricingClick = (tierName: string) => {
    trackMarketingCta({ cta_name: `Pricing - ${tierName}`, page: 'landing_pricing_preview' });
    navigate('/pricing');
  };

  const handleViewFullPricing = () => {
    trackMarketingCta({ cta_name: 'View Full Pricing', page: 'landing_pricing_preview' });
    navigate('/pricing');
  };

  const getPlanIcon = (name: string) => {
    const lowerName = name.toLowerCase();
    if (lowerName.includes('entry') || lowerName.includes('check-in')) return <Zap className="h-5 w-5" />;
    if (lowerName.includes('growth') || lowerName.includes('stay')) return <Rocket className="h-5 w-5" />;
    if (lowerName.includes('scale') || lowerName.includes('owner')) return <Crown className="h-5 w-5" />;
    return <Sparkles className="h-5 w-5" />;
  };

  const renderCards = (plans: StaticPlan[]) => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 mb-8 sm:mb-12">
      {plans.map((tier, index) => {
        const isPopular = tier.highlighted;
        const price = billingInterval === 'yearly' ? (tier.price_yearly / 12).toFixed(0) : tier.price_monthly;
        const yearlyDiscount = tier.price_yearly && tier.price_monthly ? 
          Math.round((1 - (tier.price_yearly / 12) / tier.price_monthly) * 100) : 0;

        return (
          <motion.div
            key={tier.id}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1 }}
            className={`relative p-6 sm:p-8 rounded-2xl flex flex-col justify-between transition-all duration-300 border-2 ${
              isPopular
                ? "bg-primary text-primary-foreground shadow-2xl md:scale-105 border-primary"
                : "bg-card border-border hover:border-primary/30"
            }`}
          >
            {isPopular && (
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-yellow-400 text-yellow-900 text-sm font-bold rounded-full flex items-center gap-1 shadow-md">
                <Sparkles className="w-3.5 h-3.5 animate-pulse" />
                Most Popular
              </div>
            )}

            <div>
              <div className="flex items-center gap-2.5 mb-3">
                <div className={`p-2 rounded-xl ${
                  isPopular 
                    ? "bg-primary-foreground/20 text-primary-foreground" 
                    : "bg-muted text-muted-foreground"
                }`}>
                  {getPlanIcon(tier.name)}
                </div>
                <h3 className={`text-2xl font-bold ${isPopular ? "text-primary-foreground" : "text-foreground"}`}>
                  {tier.name}
                </h3>
              </div>

              <p className={`text-sm mb-4 leading-relaxed ${isPopular ? "text-primary-foreground/90" : "text-muted-foreground"}`}>
                {tier.description}
              </p>

              <div className="mb-4 sm:mb-6">
                <span className={`text-3xl sm:text-4xl md:text-5xl font-bold ${isPopular ? "text-primary-foreground" : "text-foreground"}`}>
                  ${price}
                </span>
                <span className={isPopular ? "text-primary-foreground/80" : "text-muted-foreground"}>
                  /mo
                </span>
                {billingInterval === 'yearly' && (
                  <div className={`text-xs mt-1.5 ${isPopular ? "text-primary-foreground/80" : "text-muted-foreground"}`}>
                    Billed ${tier.price_yearly}/year
                    {yearlyDiscount > 0 && (
                      <span className={`ml-2 px-1.5 py-0.5 rounded-full text-[10px] font-semibold ${
                        isPopular ? "bg-primary-foreground/20 text-primary-foreground" : "bg-primary/10 text-primary"
                      }`}>
                        Save {yearlyDiscount}%
                      </span>
                    )}
                  </div>
                )}
              </div>

              <ul className="space-y-3 mb-8">
                {tier.features.map((feature, i) => (
                  <li key={i} className="flex items-start">
                    <Check className={`w-5 h-5 mr-3 flex-shrink-0 mt-0.5 ${
                      isPopular ? "text-primary-foreground" : "text-primary"
                    }`} />
                    <span className={`text-sm ${isPopular ? "text-primary-foreground/90" : "text-muted-foreground"}`}>
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <Button
              onClick={() => handlePricingClick(tier.name)}
              className={`w-full h-12 font-semibold ${
                isPopular
                  ? "bg-primary-foreground text-primary hover:bg-primary-foreground/95"
                  : "bg-primary text-primary-foreground hover:bg-primary/95"
              }`}
            >
              Choose {tier.name}
            </Button>
          </motion.div>
        );
      })}
    </div>
  );

  return (
    <section className="py-12 sm:py-16 md:py-24 bg-gradient-to-br from-muted/50 to-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-8 sm:mb-12"
        >
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
            Subscription Plans
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Choose the perfect plan to scale your collaborations.
          </p>
        </motion.div>

        {/* Billing Toggle */}
        <div className="flex items-center justify-center gap-3 mb-8 sm:mb-12">
          <span className={`text-sm font-medium transition-colors ${billingInterval === 'monthly' ? 'text-foreground' : 'text-muted-foreground'}`}>
            Monthly
          </span>
          <button
            onClick={() => setBillingInterval(billingInterval === 'monthly' ? 'yearly' : 'monthly')}
            className={`
              relative inline-flex h-8 w-14 items-center rounded-full 
              transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2
              ${billingInterval === 'yearly' 
                ? 'bg-primary shadow-lg shadow-primary/30' 
                : 'bg-muted'
              }
            `}
          >
            <span
              className={`
                inline-block h-6 w-6 transform rounded-full bg-white shadow-md
                transition-transform duration-300
                ${billingInterval === 'yearly' ? 'translate-x-7' : 'translate-x-1'}
              `}
            />
          </button>
          <span className={`text-sm font-medium transition-colors ${billingInterval === 'yearly' ? 'text-foreground' : 'text-muted-foreground'}`}>
            Yearly
          </span>
          {billingInterval === 'yearly' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <Badge className="bg-primary text-primary-foreground border-0 shadow-md">
                Save 20%
              </Badge>
            </motion.div>
          )}
        </div>

        <Tabs defaultValue="brand" className="w-full">
          <div className="flex justify-center mb-8 sm:mb-12">
            <TabsList className="grid w-full max-w-md grid-cols-2">
              <TabsTrigger value="brand" className="font-semibold">Brand Plans</TabsTrigger>
              <TabsTrigger value="host" className="font-semibold">Host Plans</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="brand">
            {renderCards(brandPlansStatic)}
          </TabsContent>

          <TabsContent value="host">
            {renderCards(hostPlansStatic)}
          </TabsContent>
        </Tabs>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mt-8 sm:mt-12"
        >
          <Button
            variant="outline"
            size="lg"
            onClick={handleViewFullPricing}
            className="h-12 px-8 border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground font-semibold"
          >
            View Full Pricing Details
            <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
        </motion.div>
      </div>
    </section>
  );
};
