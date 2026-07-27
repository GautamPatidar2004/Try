import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Check, Crown, Zap, Star, Sparkles, Building2, Rocket, Users, BadgeCheck, Megaphone, Target } from 'lucide-react';
import { useSubscription, SubscriptionPlan } from '@/hooks/useSubscription';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';

interface PricingCardProps {
  plan: SubscriptionPlan;
  billingInterval: 'monthly' | 'yearly';
  isCurrentPlan?: boolean;
  onSelectPlan: (planId: string, interval: 'monthly' | 'yearly') => void;
  loading?: boolean;
  index: number;
  compact?: boolean;
}

const PricingCard: React.FC<PricingCardProps> = ({ 
  plan, 
  billingInterval, 
  isCurrentPlan, 
  onSelectPlan, 
  loading,
  index,
  compact = false
}) => {
  const price = billingInterval === 'yearly' ? plan.price_yearly : plan.price_monthly;
  const monthlyPrice = billingInterval === 'yearly' ? plan.price_yearly / 12 : plan.price_monthly;
  const yearlyDiscount = plan.price_yearly && plan.price_monthly ? 
    Math.round((1 - (plan.price_yearly / 12) / plan.price_monthly) * 100) : 0;

  const getPlanIcon = () => {
    const name = plan.name.toLowerCase();
    if (name.includes('starter')) return <Zap className="h-5 w-5" />;
    if (name.includes('growth') || name.includes('pro')) return <Rocket className="h-5 w-5" />;
    if (name.includes('scale') || name.includes('premium') || name.includes('elite')) return <Crown className="h-5 w-5" />;
    return <Sparkles className="h-5 w-5" />;
  };

  const hasFreeTrial = Boolean(plan.trial_days && plan.trial_days > 0);
  const isPopular = plan.name.toLowerCase().includes('growth') || plan.name.toLowerCase().includes('pro');
  const isFree = plan.price_monthly === 0;

  // Get tier-specific features based on plan type
  const getTierFeatures = () => {
    const features: string[] = [];
    
    if (plan.user_type_category === 'demand') {
      // Demand-side features (hosts, brands, restaurants)
      if (plan.max_listings === -1) {
        features.push('Unlimited property listings');
      } else if (plan.max_listings) {
        features.push(`${plan.max_listings} property listing${plan.max_listings > 1 ? 's' : ''}`);
      }
      
      if (plan.max_campaigns === -1) {
        features.push('Unlimited campaigns');
      } else if (plan.max_campaigns) {
        features.push(`${plan.max_campaigns} active campaign${plan.max_campaigns > 1 ? 's' : ''}`);
      }
      
      if (plan.max_outbound_invites_per_month === -1) {
        features.push('Unlimited creator invites');
      } else if (plan.max_outbound_invites_per_month) {
        features.push(`${plan.max_outbound_invites_per_month} creator invites/month`);
      }
      
      if (plan.has_ai_matching) features.push('AI-powered creator matching');
      if (plan.team_seats > 1) features.push(`${plan.team_seats} team seats`);
      if (plan.has_advanced_analytics) features.push('Advanced analytics dashboard');
      
    } else {
      // Supply-side features (creators)
      if (plan.max_pitches_per_month === -1) {
        features.push('Unlimited pitches/month');
      } else if (plan.max_pitches_per_month) {
        features.push(`${plan.max_pitches_per_month} pitches/month`);
      }
      
      if (plan.has_verified_badge) features.push('Verified creator badge');
      if (plan.has_media_kit) features.push('Professional media kit');
      if (plan.marketplace_boosts_per_month > 0) {
        features.push(`${plan.marketplace_boosts_per_month} profile boosts/month`);
      }
      if (plan.search_priority > 1) features.push(`Priority search ranking (${plan.search_priority}x)`);
      if (plan.has_advanced_analytics) features.push('Advanced analytics');
    }
    
    return features;
  };

  const tierFeatures = getTierFeatures();

  // Filter out plan.features that duplicate tier-generated features
  const getFilteredPlanFeatures = () => {
    const dynamicKeywords = [
      'pitch', 'verified', 'media kit', 'boost', 'search priority', 
      'analytics', 'support', 'featured', 'portfolio', 'profile'
    ];
    
    return plan.features.filter(feature => {
      const lowerFeature = feature.toLowerCase();
      // Keep features that don't overlap with dynamic ones
      return !dynamicKeywords.some(keyword => lowerFeature.includes(keyword));
    });
  };

  const filteredPlanFeatures = getFilteredPlanFeatures();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="h-full"
    >
      <Card className={`
        relative overflow-hidden h-full flex flex-col
        transition-all duration-300
        backdrop-blur-sm bg-card/50 border-border/50
        ${isPopular 
          ? compact 
            ? 'shadow-xl shadow-primary/20 border-primary/40 border-2' 
            : 'shadow-2xl shadow-primary/20 border-primary/30'
          : 'shadow-lg hover:shadow-xl'
        }
        ${isCurrentPlan ? 'ring-2 ring-primary' : ''}
        ${!compact ? 'hover:-translate-y-2' : ''}
      `}>
        {isPopular && (
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-primary/5 pointer-events-none" />
        )}

        {isPopular && (
          <div className={`absolute top-0 left-0 right-0 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground text-center ${compact ? 'py-1.5 text-xs' : 'py-2.5 text-sm'} font-semibold flex items-center justify-center gap-1.5 shadow-lg`}>
            <Sparkles className={`${compact ? 'w-3 h-3' : 'w-4 h-4'} animate-pulse`} />
            Most Popular
            <Sparkles className={`${compact ? 'w-3 h-3' : 'w-4 h-4'} animate-pulse`} />
          </div>
        )}

        {hasFreeTrial && !isPopular && plan.price_monthly > 0 && (
          <div className={`absolute top-0 left-0 right-0 bg-gradient-to-r from-green-500 to-green-600 text-white text-center ${compact ? 'py-1 text-xs' : 'py-2 text-sm'} font-medium shadow-md`}>
            {plan.trial_days}-Day Free Trial
          </div>
        )}
        
        <CardHeader className={`relative z-10 ${compact ? 'p-4 pb-2' : ''} ${isPopular ? (compact ? 'pt-10' : 'pt-16') : hasFreeTrial && plan.price_monthly > 0 ? (compact ? 'pt-8' : 'pt-12') : ''}`}>
          <div className={`flex items-center ${compact ? 'gap-2 mb-1' : 'gap-3 mb-2'}`}>
            <div className={`
              ${compact ? 'p-1.5' : 'p-2.5'} rounded-xl shadow-lg
              ${isPopular 
                ? 'bg-gradient-to-br from-primary to-primary/80 text-primary-foreground' 
                : 'bg-gradient-to-br from-muted to-muted-foreground/20 text-muted-foreground'
              }
            `}>
              {React.cloneElement(getPlanIcon(), { className: compact ? 'h-4 w-4' : 'h-5 w-5' })}
            </div>
            <div>
              <CardTitle className={`${compact ? 'text-lg' : 'text-2xl'} font-bold`}>{plan.name}</CardTitle>
              {isCurrentPlan && (
                <Badge variant="secondary" className={compact ? 'mt-0.5 text-xs' : 'mt-1.5'}>
                  Current Plan
                </Badge>
              )}
            </div>
          </div>
          {!compact && <CardDescription className="text-sm leading-relaxed">{plan.description}</CardDescription>}
          
          <div className={compact ? 'pt-2' : 'pt-6'}>
            <motion.div 
              key={`${billingInterval}-${plan.id}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className={`flex items-baseline ${compact ? 'gap-1' : 'gap-2'}`}
            >
              {isFree ? (
                <>
                  <span className={`${compact ? 'text-2xl' : 'text-5xl'} font-bold text-primary`}>
                    Free
                  </span>
                  <span className={`text-muted-foreground ${compact ? 'text-sm' : 'text-lg'}`}>forever</span>
                </>
              ) : (
                <>
                  <span className={`${compact ? 'text-2xl' : 'text-5xl'} font-bold ${isPopular ? 'text-primary' : ''}`}>
                    ${(monthlyPrice / 100).toFixed(2)}
                  </span>
                  <span className={`text-muted-foreground ${compact ? 'text-sm' : 'text-lg'}`}>/month</span>
                </>
              )}
            </motion.div>
            {billingInterval === 'yearly' && yearlyDiscount > 0 && plan.price_monthly > 0 && (
              <div className={`flex items-center gap-2 ${compact ? 'mt-1' : 'mt-2'}`}>
                <span className={`${compact ? 'text-xs' : 'text-sm'} text-muted-foreground line-through`}>
                  ${(plan.price_monthly / 100).toFixed(2)}/month
                </span>
                <Badge className={`bg-primary text-primary-foreground border-0 ${compact ? 'text-xs py-0' : ''}`}>
                  Save {yearlyDiscount}%
                </Badge>
              </div>
            )}
          </div>
        </CardHeader>

        <CardContent className={`flex-1 ${compact ? 'p-4 pt-2' : ''}`}>
          <ul className={compact ? 'space-y-2' : 'space-y-3.5'}>
            {/* Tier-specific features first */}
            {(compact ? tierFeatures.slice(0, 4) : tierFeatures).map((feature, idx) => (
              <motion.li 
                key={`tier-${idx}`}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 + idx * 0.05 }}
                className={`flex items-start ${compact ? 'gap-2' : 'gap-3'}`}
              >
                <div className={`
                  rounded-full ${compact ? 'p-0.5' : 'p-1'} mt-0.5 shrink-0
                  ${isPopular ? 'bg-primary/20' : 'bg-green-50 dark:bg-green-950'}
                `}>
                  <Check className={`${compact ? 'h-3 w-3' : 'h-3.5 w-3.5'} ${isPopular ? 'text-primary' : 'text-green-600'}`} />
                </div>
                <span className={`${compact ? 'text-xs' : 'text-sm'} leading-relaxed font-medium`}>{feature}</span>
              </motion.li>
            ))}
            
            {/* General features from plan - hide in compact mode, filter duplicates */}
            {!compact && filteredPlanFeatures.map((feature, idx) => (
              <motion.li 
                key={`general-${idx}`}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 + (tierFeatures.length + idx) * 0.05 }}
                className="flex items-start gap-3"
              >
                <div className={`
                  rounded-full p-1 mt-0.5 shrink-0
                  ${isPopular ? 'bg-primary/20' : 'bg-green-50 dark:bg-green-950'}
                `}>
                  <Check className={`h-3.5 w-3.5 ${isPopular ? 'text-primary' : 'text-green-600'}`} />
                </div>
                <span className="text-sm leading-relaxed">{feature}</span>
              </motion.li>
            ))}
          </ul>
        </CardContent>

        <CardFooter className={compact ? 'p-4 pt-2' : 'pt-6'}>
          <Button
            className={`
              w-full ${compact ? 'min-h-[36px] text-sm' : 'min-h-[48px]'} font-semibold transition-all duration-300
              ${isPopular 
                ? 'bg-primary hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/30 text-primary-foreground border-0' 
                : isCurrentPlan
                  ? 'border-primary/50'
                  : ''
              }
            `}
            variant={isCurrentPlan ? "outline" : isFree ? "outline" : "default"}
            disabled={isCurrentPlan || loading}
            onClick={() => onSelectPlan(plan.id, billingInterval)}
          >
            {loading ? (
              'Processing...'
            ) : isCurrentPlan ? (
              'Current Plan'
            ) : isFree ? (
              compact ? 'Start Free' : 'Get Started Free'
            ) : hasFreeTrial ? (
              compact ? `${plan.trial_days}-Day Trial` : `Start ${plan.trial_days}-Day Free Trial`
            ) : (
              compact ? 'Select' : `Choose ${plan.name}`
            )}
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
};

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

const StaticPricingCard: React.FC<{
  plan: StaticPlan;
  billingInterval: 'monthly' | 'yearly';
  index: number;
  compact?: boolean;
  onSelectPlan?: () => void;
  loading?: boolean;
  isCurrentPlan?: boolean;
}> = ({ plan, billingInterval, index, compact = false, onSelectPlan, loading = false, isCurrentPlan = false }) => {
  const price = billingInterval === 'yearly' ? plan.price_yearly : plan.price_monthly;
  const monthlyPrice = billingInterval === 'yearly' ? plan.price_yearly / 12 : plan.price_monthly;
  const yearlyDiscount = plan.price_yearly && plan.price_monthly ? 
    Math.round((1 - (plan.price_yearly / 12) / plan.price_monthly) * 100) : 0;

  const isPopular = plan.highlighted;

  const getPlanIcon = () => {
    const name = plan.name.toLowerCase();
    if (name.includes('entry') || name.includes('check-in')) return <Zap className="h-5 w-5" />;
    if (name.includes('growth') || name.includes('stay')) return <Rocket className="h-5 w-5" />;
    if (name.includes('scale') || name.includes('owner')) return <Crown className="h-5 w-5" />;
    return <Sparkles className="h-5 w-5" />;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="h-full"
    >
      <Card className={`
        relative overflow-hidden h-full flex flex-col
        transition-all duration-300
        backdrop-blur-sm bg-card/50 border-border/50
        ${isPopular 
          ? compact 
            ? 'shadow-xl shadow-primary/20 border-primary/40 border-2' 
            : 'shadow-2xl shadow-primary/20 border-primary/30'
          : 'shadow-lg hover:shadow-xl'
        }
        ${isCurrentPlan ? 'ring-2 ring-primary' : ''}
        ${!compact ? 'hover:-translate-y-2' : ''}
      `}>
        {isPopular && (
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-primary/5 pointer-events-none" />
        )}

        {isPopular && (
          <div className={`absolute top-0 left-0 right-0 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground text-center ${compact ? 'py-1.5 text-xs' : 'py-2.5 text-sm'} font-semibold flex items-center justify-center gap-1.5 shadow-lg`}>
            <Sparkles className={`${compact ? 'w-3 h-3' : 'w-4 h-4'} animate-pulse`} />
            Most Popular
            <Sparkles className={`${compact ? 'w-3 h-3' : 'w-4 h-4'} animate-pulse`} />
          </div>
        )}
        
        <CardHeader className={`relative z-10 ${compact ? 'p-4 pb-2' : ''} ${isPopular ? (compact ? 'pt-10' : 'pt-16') : ''}`}>
          <div className={`flex items-center ${compact ? 'gap-2 mb-1' : 'gap-3 mb-2'}`}>
            <div className={`
              ${compact ? 'p-1.5' : 'p-2.5'} rounded-xl shadow-lg
              ${isPopular 
                ? 'bg-gradient-to-br from-primary to-primary/80 text-primary-foreground' 
                : 'bg-gradient-to-br from-muted to-muted-foreground/20 text-muted-foreground'
              }
            `}>
              {React.cloneElement(getPlanIcon(), { className: compact ? 'h-4 w-4' : 'h-5 w-5' })}
            </div>
            <div>
              <CardTitle className={`${compact ? 'text-lg' : 'text-2xl'} font-bold`}>{plan.name}</CardTitle>
              {isCurrentPlan && (
                <Badge variant="secondary" className={compact ? 'mt-0.5 text-xs' : 'mt-1.5'}>
                  Current Plan
                </Badge>
              )}
            </div>
          </div>
          {!compact && <CardDescription className="text-sm leading-relaxed">{plan.description}</CardDescription>}
          
          <div className={compact ? 'pt-2' : 'pt-6'}>
            <motion.div 
              key={`${billingInterval}-${plan.id}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className={`flex items-baseline ${compact ? 'gap-1' : 'gap-2'}`}
            >
              <span className={`${compact ? 'text-2xl' : 'text-5xl'} font-bold ${isPopular ? 'text-primary' : ''}`}>
                ${billingInterval === 'yearly' ? (plan.price_yearly / 12).toFixed(0) : plan.price_monthly}
              </span>
              <span className={`text-muted-foreground ${compact ? 'text-sm' : 'text-lg'}`}>/month</span>
            </motion.div>
            {billingInterval === 'yearly' && (
              <div className={`flex items-center gap-2 ${compact ? 'mt-1' : 'mt-2'}`}>
                <span className={`${compact ? 'text-xs' : 'text-sm'} text-muted-foreground`}>
                  Billed ${plan.price_yearly}/year
                </span>
                {yearlyDiscount > 0 && (
                  <Badge className={`bg-primary text-primary-foreground border-0 ${compact ? 'text-xs py-0' : ''}`}>
                    Save {yearlyDiscount}%
                  </Badge>
                )}
              </div>
            )}
          </div>
        </CardHeader>

        <CardContent className={`flex-1 ${compact ? 'p-4 pt-2' : ''}`}>
          <ul className={compact ? 'space-y-2' : 'space-y-3.5'}>
            {plan.features.map((feature, idx) => (
              <motion.li 
                key={idx}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 + idx * 0.05 }}
                className={`flex items-start ${compact ? 'gap-2' : 'gap-3'}`}
              >
                <div className={`
                  rounded-full ${compact ? 'p-0.5' : 'p-1'} mt-0.5 shrink-0
                  ${isPopular ? 'bg-primary/20' : 'bg-green-50 dark:bg-green-950'}
                `}>
                  <Check className={`${compact ? 'h-3 w-3' : 'h-3.5 w-3.5'} ${isPopular ? 'text-primary' : 'text-green-600'}`} />
                </div>
                <span className={`${compact ? 'text-xs' : 'text-sm'} leading-relaxed font-medium`}>{feature}</span>
              </motion.li>
            ))}
          </ul>
        </CardContent>

        <CardFooter className={compact ? 'p-4 pt-2' : 'pt-6'}>
          <Button
            className={`
              w-full ${compact ? 'min-h-[36px] text-sm' : 'min-h-[48px]'} font-semibold transition-all duration-300
              ${isPopular 
                ? 'bg-primary hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/30 text-primary-foreground border-0' 
                : isCurrentPlan
                  ? 'border-primary/50'
                  : ''
              }
            `}
            variant={isCurrentPlan ? "outline" : isPopular ? "default" : "outline"}
            disabled={isCurrentPlan || loading}
            onClick={onSelectPlan}
          >
            {loading ? (
              'Processing...'
            ) : isCurrentPlan ? (
              'Current Plan'
            ) : (
              isPopular ? 'Get Started' : 'Choose Plan'
            )}
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
};

interface PricingPlansProps {
  forcedCategory?: 'demand' | 'supply';
  compact?: boolean;
  onPlanSelected?: () => void;
  returnUrl?: string;
}

export const PricingPlans: React.FC<PricingPlansProps> = ({ forcedCategory, compact = false, onPlanSelected, returnUrl }) => {
  const { 
    subscriptionPlans, 
    subscriptionStatus, 
    createSubscription, 
    actionLoading,
    userTypeCategory,
    fetchSubscriptionPlans
  } = useSubscription();
  
  const [billingInterval, setBillingInterval] = React.useState<'monthly' | 'yearly'>('monthly');
  const [hasAutoTriggered, setHasAutoTriggered] = React.useState(false);
  const [selectingPlanId, setSelectingPlanId] = React.useState<string | null>(null);

  // Only show creator (supply) plans - business/host access is now free
  const currentPlans = subscriptionPlans.filter(p => p.user_type_category === 'supply');

  const handleSelectPlan = async (planId: string, interval: 'monthly' | 'yearly') => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      const returnUrl = `/pricing?plan=${planId}&interval=${interval}`;
      window.location.href = `/auth?returnTo=${encodeURIComponent(returnUrl)}`;
      return;
    }
    
    setSelectingPlanId(planId);
    try {
      // Persist a pending checkout marker so the app can detect "in-progress" payments
      // if the user closes the tab before Stripe redirects back.
      try {
        localStorage.setItem('pending_subscription_checkout', JSON.stringify({
          planId,
          interval,
          timestamp: Date.now()
        }));
      } catch (e) {
        // localStorage may be unavailable (private mode); non-fatal
      }

      const response = await createSubscription(planId, interval, returnUrl);
      
      if (response && response.isFree) {
        try { localStorage.removeItem('pending_subscription_checkout'); } catch {}
        onPlanSelected?.();
      } else {
        onPlanSelected?.();
      }
    } catch (error) {
      try { localStorage.removeItem('pending_subscription_checkout'); } catch {}
      console.error('Error selecting plan:', error);
    } finally {
      setSelectingPlanId(null);
    }
  };

  // Check URL parameters and auto-trigger plan selection after auth
  React.useEffect(() => {
    if (hasAutoTriggered || subscriptionPlans.length === 0) return;
    
    const urlParams = new URLSearchParams(window.location.search);
    const planId = urlParams.get('plan');
    const interval = urlParams.get('interval') as 'monthly' | 'yearly' | null;
    
    if (planId && interval) {
      setHasAutoTriggered(true);
      window.history.replaceState({}, '', '/pricing');
      setBillingInterval(interval);
      
      const selectedPlan = subscriptionPlans.find(p => p.id === planId);
      if (selectedPlan) {
        handleSelectPlan(planId, interval);
      }
    }
  }, [subscriptionPlans, hasAutoTriggered]);

  if (forcedCategory === 'supply') {
    return (
      <div className={compact ? 'w-full' : 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'}>
        {/* Billing Toggle */}
        <div className={`flex items-center justify-center gap-3 ${compact ? 'mb-4' : 'mb-12'}`}>
          <span className={`${compact ? 'text-xs' : 'text-sm'} font-medium transition-colors ${billingInterval === 'monthly' ? 'text-foreground' : 'text-muted-foreground'}`}>
            Monthly
          </span>
          <button
            onClick={() => setBillingInterval(billingInterval === 'monthly' ? 'yearly' : 'monthly')}
            className={`
              relative inline-flex ${compact ? 'h-6 w-11' : 'h-8 w-14'} items-center rounded-full 
              transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2
              ${billingInterval === 'yearly' 
                ? 'bg-primary shadow-lg shadow-primary/30' 
                : 'bg-muted'
              }
            `}
          >
            <span
              className={`
                inline-block ${compact ? 'h-4 w-4' : 'h-6 w-6'} transform rounded-full bg-white shadow-md
                transition-transform duration-300
                ${billingInterval === 'yearly' ? (compact ? 'translate-x-6' : 'translate-x-7') : 'translate-x-1'}
              `}
            />
          </button>
          <span className={`${compact ? 'text-xs' : 'text-sm'} font-medium transition-colors ${billingInterval === 'yearly' ? 'text-foreground' : 'text-muted-foreground'}`}>
            Yearly
          </span>
          {billingInterval === 'yearly' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <Badge className={`bg-primary text-primary-foreground border-0 shadow-md ${compact ? 'text-xs py-0' : ''}`}>
                Save 20%
              </Badge>
            </motion.div>
          )}
        </div>

        {/* Description - hide in compact mode */}
        {!compact && (
          <div className="text-center mb-8">
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Choose the perfect plan to grow your creator career. Pitch to properties, get verified, and unlock advanced features.
            </p>
          </div>
        )}

        {/* Pricing Cards */}
        <div className={`
          ${compact 
            ? 'flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory -mx-2 px-2' 
            : 'grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-6 lg:gap-8 mb-12'
          }
        `}>
          {currentPlans.map((plan, index) => (
            <div 
              key={plan.id} 
              className={compact ? 'flex-shrink-0 w-[280px] snap-center' : ''}
            >
              <PricingCard
                plan={plan}
                billingInterval={billingInterval}
                isCurrentPlan={subscriptionStatus?.plan?.name === plan.name}
                onSelectPlan={handleSelectPlan}
                loading={selectingPlanId === plan.id}
                index={index}
                compact={compact}
              />
            </div>
          ))}
        </div>

        {/* Current Subscription Info - hide in compact mode */}
        {!compact && subscriptionStatus?.hasActiveSubscription && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-12 text-center"
          >
            <Card className="max-w-md mx-auto backdrop-blur-sm bg-card/50 border-border/50">
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground mb-2">
                  <span className="font-semibold text-foreground">Current subscription:</span> {subscriptionStatus.plan?.name} plan
                </p>
                {subscriptionStatus.currentPeriodEnd && (
                  <p className="text-sm text-muted-foreground">
                    Renews on {new Date(subscriptionStatus.currentPeriodEnd).toLocaleDateString()}
                  </p>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    );
  }

  // Brand and Host plans static rendering with tabs
  return (
    <div className={compact ? 'w-full' : 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'}>
      {/* Billing Toggle */}
      <div className={`flex items-center justify-center gap-3 ${compact ? 'mb-4' : 'mb-12'}`}>
        <span className={`${compact ? 'text-xs' : 'text-sm'} font-medium transition-colors ${billingInterval === 'monthly' ? 'text-foreground' : 'text-muted-foreground'}`}>
          Monthly
        </span>
        <button
          onClick={() => setBillingInterval(billingInterval === 'monthly' ? 'yearly' : 'monthly')}
          className={`
            relative inline-flex ${compact ? 'h-6 w-11' : 'h-8 w-14'} items-center rounded-full 
            transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2
            ${billingInterval === 'yearly' 
              ? 'bg-primary shadow-lg shadow-primary/30' 
              : 'bg-muted'
            }
          `}
        >
          <span
            className={`
              inline-block ${compact ? 'h-4 w-4' : 'h-6 w-6'} transform rounded-full bg-white shadow-md
              transition-transform duration-300
              ${billingInterval === 'yearly' ? (compact ? 'translate-x-6' : 'translate-x-7') : 'translate-x-1'}
            `}
          />
        </button>
        <span className={`${compact ? 'text-xs' : 'text-sm'} font-medium transition-colors ${billingInterval === 'yearly' ? 'text-foreground' : 'text-muted-foreground'}`}>
          Yearly
        </span>
        {billingInterval === 'yearly' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <Badge className={`bg-primary text-primary-foreground border-0 shadow-md ${compact ? 'text-xs py-0' : ''}`}>
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
          <div className={`
            ${compact 
              ? 'flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory -mx-2 px-2' 
              : 'grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-6 lg:gap-8 mb-12'
            }
          `}>
            {brandPlansStatic.map((plan, index) => {
              const dbPlan = subscriptionPlans.find(p => p.name.toLowerCase() === plan.name.toLowerCase());
              return (
                <div 
                  key={plan.id} 
                  className={compact ? 'flex-shrink-0 w-[280px] snap-center' : ''}
                >
                  <StaticPricingCard
                    plan={plan}
                    billingInterval={billingInterval}
                    index={index}
                    compact={compact}
                    onSelectPlan={() => {
                      if (dbPlan) {
                        handleSelectPlan(dbPlan.id, billingInterval);
                      } else {
                        console.error('Database plan not found for static plan:', plan.name);
                      }
                    }}
                    loading={dbPlan ? selectingPlanId === dbPlan.id : false}
                    isCurrentPlan={dbPlan ? subscriptionStatus?.plan?.name.toLowerCase() === dbPlan.name.toLowerCase() : false}
                  />
                </div>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="host">
          <div className={`
            ${compact 
              ? 'flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory -mx-2 px-2' 
              : 'grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-6 lg:gap-8 mb-12'
            }
          `}>
            {hostPlansStatic.map((plan, index) => {
              const dbPlan = subscriptionPlans.find(p => p.name.toLowerCase() === plan.name.toLowerCase());
              return (
                <div 
                  key={plan.id} 
                  className={compact ? 'flex-shrink-0 w-[280px] snap-center' : ''}
                >
                  <StaticPricingCard
                    plan={plan}
                    billingInterval={billingInterval}
                    index={index}
                    compact={compact}
                    onSelectPlan={() => {
                      if (dbPlan) {
                        handleSelectPlan(dbPlan.id, billingInterval);
                      } else {
                        console.error('Database plan not found for static plan:', plan.name);
                      }
                    }}
                    loading={dbPlan ? selectingPlanId === dbPlan.id : false}
                    isCurrentPlan={dbPlan ? subscriptionStatus?.plan?.name.toLowerCase() === dbPlan.name.toLowerCase() : false}
                  />
                </div>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
