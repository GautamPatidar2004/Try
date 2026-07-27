import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Check, Sparkles, Zap, Rocket, Crown, ArrowLeft, ExternalLink } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useSubscription } from '@/hooks/useSubscription';

interface BrandPlanDisplay {
  /** Stable name key used to match against subscription_plans.name */
  nameKey: string;
  name: string;
  description: string;
  price_monthly: number;
  price_yearly: number;
  features: string[];
  highlighted?: boolean;
}

const brandPlans: BrandPlanDisplay[] = [
  {
    nameKey: 'Entry',
    name: 'Entry',
    description: 'For growing brands starting with creator partnerships',
    price_monthly: 199,
    price_yearly: 1900,
    features: [
      '5 active campaigns',
      'Access to vetted creators',
      'Standard creator matching',
      'Basic analytics',
      '1 team seat',
    ],
    highlighted: false,
  },
  {
    nameKey: 'Growth',
    name: 'Growth',
    description: 'For active brands scaling their campaigns',
    price_monthly: 499,
    price_yearly: 4750,
    features: [
      'Unlimited active campaigns',
      'AI-powered creator matching',
      'Advanced analytics dashboard',
      '3 team seats',
      'Priority support',
    ],
    highlighted: true,
  },
  {
    nameKey: 'Scale',
    name: 'Scale',
    description: 'For large brands requiring dedicated support and advanced tooling',
    price_monthly: 999,
    price_yearly: 9500,
    features: [
      'Everything in Growth',
      'Dedicated campaign manager',
      'Custom creator onboarding',
      'Unlimited team seats',
      '24/7 Premium support',
    ],
    highlighted: false,
  },
];

export const BrandOnboarding = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState(1); // 1 = plan selection, 2 = confirm + checkout
  const [billingInterval, setBillingInterval] = useState<'monthly' | 'yearly'>('monthly');
  const [selectedPlan, setSelectedPlan] = useState<BrandPlanDisplay | null>(null);
  /** Real UUID from subscription_plans keyed by nameKey */
  const [planIdMap, setPlanIdMap] = useState<Record<string, string>>({});
  const [planIdsLoading, setPlanIdsLoading] = useState(true);

  const navigate = useNavigate();
  const { toast } = useToast();
  const { createSubscription, loading: subscriptionLoading } = useSubscription();

  // Authenticate
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { navigate('/auth'); return; }
      setUser(user);
      setLoading(false);
    };
    checkAuth();
  }, [navigate]);

  // Fetch real UUIDs from subscription_plans for demand category
  useEffect(() => {
    const fetchPlanIds = async () => {
      setPlanIdsLoading(true);
      try {
        const { data, error } = await supabase
          .from('subscription_plans')
          .select('id, name')
          .eq('user_type_category', 'demand')
          .eq('is_active', true);

        if (error) throw error;

        const map: Record<string, string> = {};
        for (const plan of data || []) {
          // Match by exact name (e.g. "Entry", "Growth", "Scale")
          map[plan.name] = plan.id;
        }
        setPlanIdMap(map);
      } catch (err) {
        console.error('Failed to load subscription plans:', err);
        toast({
          title: 'Error loading plans',
          description: 'Could not load subscription plans. Please refresh.',
          variant: 'destructive',
        });
      } finally {
        setPlanIdsLoading(false);
      }
    };
    fetchPlanIds();
  }, [toast]);

  const handleSelectPlan = (plan: BrandPlanDisplay) => {
    setSelectedPlan(plan);
    setStep(2);
  };

  const handleSubscribe = async () => {
    if (!user || !selectedPlan) return;

    const realPlanId = planIdMap[selectedPlan.nameKey];
    if (!realPlanId) {
      toast({
        title: 'Plan unavailable',
        description: `The ${selectedPlan.name} plan could not be found. Please contact support.`,
        variant: 'destructive',
      });
      return;
    }

    try {
      // Upsert brand profile first so isProfileComplete() passes after checkout redirect
      const { error: brandError } = await supabase
        .from('brands')
        .upsert({
          user_id: user.id,
          company_name: 'My Brand',
          brand_name: 'My Brand',
          industry: 'Other',
          description: 'A growing brand on Hostfluencer.',
          budget_range: 'under_5k',
          contact_email: user.email || '',
          updated_at: new Date().toISOString(),
        }, { onConflict: 'user_id' });

      if (brandError) throw brandError;

      // createSubscription fetches plan from DB, creates Stripe Checkout session,
      // and redirects window.location.href to Stripe-hosted checkout.
      await createSubscription(realPlanId, billingInterval, '/marketplace');
    } catch (err: any) {
      toast({
        title: 'Checkout error',
        description: err.message || 'Failed to start checkout. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const getPlanIcon = (name: string) => {
    if (name === 'Entry') return <Zap className="h-5 w-5" />;
    if (name === 'Growth') return <Rocket className="h-5 w-5" />;
    return <Crown className="h-5 w-5" />;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 py-12">
      <div className="container max-w-5xl mx-auto px-4">
        {step === 1 ? (
          <div className="space-y-8">
            <div className="text-center max-w-3xl mx-auto space-y-4">
              <Badge className="bg-primary/10 text-primary hover:bg-primary/20 border-0 text-sm py-1 px-3">
                Step 1 of 2
              </Badge>
              <h1 className="text-4xl font-serif tracking-tight text-foreground sm:text-5xl">
                Choose Your Brand Plan
              </h1>
              <p className="text-xl text-muted-foreground">
                Select the plan that fits your campaign scale and team requirements
              </p>

              {/* Billing Toggle */}
              <div className="flex items-center justify-center gap-3 pt-4">
                <span className={`text-sm font-medium transition-colors ${billingInterval === 'monthly' ? 'text-foreground' : 'text-muted-foreground'}`}>
                  Monthly
                </span>
                <button
                  onClick={() => setBillingInterval(billingInterval === 'monthly' ? 'yearly' : 'monthly')}
                  className={`
                    relative inline-flex h-8 w-14 items-center rounded-full 
                    transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2
                    ${billingInterval === 'yearly' ? 'bg-primary' : 'bg-muted'}
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
                  <Badge className="bg-primary text-primary-foreground border-0 shadow-md">
                    Save 20%
                  </Badge>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {brandPlans.map((plan) => {
                const price = billingInterval === 'yearly' ? plan.price_yearly : plan.price_monthly;
                const monthlyEquivalent = billingInterval === 'yearly' ? Math.round(plan.price_yearly / 12) : plan.price_monthly;
                const isPopular = plan.highlighted;
                const hasPlanId = !!planIdMap[plan.nameKey];

                return (
                  <Card
                    key={plan.nameKey}
                    className={`relative overflow-hidden h-full flex flex-col transition-all duration-300 hover:-translate-y-1 ${
                      isPopular
                        ? 'shadow-xl border-primary/40 border-2'
                        : 'shadow-lg border-border/50'
                    }`}
                  >
                    {isPopular && (
                      <div className="absolute top-0 left-0 right-0 bg-primary text-primary-foreground text-center py-1.5 text-xs font-semibold flex items-center justify-center gap-1">
                        <Sparkles className="w-3.5 h-3.5" />
                        Most Popular
                      </div>
                    )}
                    <CardHeader className={`pt-8 ${isPopular ? 'pt-10' : ''}`}>
                      <div className="flex items-center gap-2 mb-2">
                        <div className="p-2 rounded-lg bg-primary/10 text-primary">
                          {getPlanIcon(plan.name)}
                        </div>
                        <CardTitle className="text-xl font-bold">{plan.name}</CardTitle>
                      </div>
                      <CardDescription className="text-sm min-h-[40px]">{plan.description}</CardDescription>

                      <div className="pt-4 flex items-baseline gap-1">
                        <span className="text-3xl font-bold">${monthlyEquivalent}</span>
                        <span className="text-muted-foreground text-sm">/month</span>
                      </div>
                      {billingInterval === 'yearly' && (
                        <div className="text-xs text-muted-foreground mt-1">
                          Billed annually (${price}/year)
                        </div>
                      )}
                    </CardHeader>
                    <CardContent className="flex-1 pb-6">
                      <ul className="space-y-3">
                        {plan.features.map((feature, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-sm">
                            <Check className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                    <CardFooter className="pt-0">
                      <Button
                        className="w-full font-semibold"
                        variant={isPopular ? 'default' : 'outline'}
                        onClick={() => handleSelectPlan(plan)}
                        disabled={planIdsLoading || !hasPlanId}
                      >
                        {planIdsLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Continue'}
                      </Button>
                    </CardFooter>
                  </Card>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="max-w-md mx-auto space-y-6">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setStep(1);
                  setSelectedPlan(null);
                }}
                className="text-muted-foreground"
              >
                <ArrowLeft className="w-4 h-4 mr-1" />
                Change Plan
              </Button>
            </div>

            <Card className="border-primary/20 shadow-2xl">
              <CardHeader className="text-center pb-4">
                <Badge className="bg-primary/10 text-primary hover:bg-primary/20 border-0 text-sm py-1 px-3 mx-auto w-fit mb-3">
                  Step 2 of 2
                </Badge>
                <CardTitle className="text-2xl font-bold flex items-center justify-center gap-2">
                  <ExternalLink className="w-5 h-5 text-primary" />
                  Confirm & Subscribe
                </CardTitle>
                <CardDescription>
                  You'll be redirected to Stripe's secure checkout to complete your subscription
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Plan Summary */}
                {selectedPlan && (
                  <div className="bg-primary/5 rounded-lg p-4 border border-primary/10 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-foreground">{selectedPlan.name} Plan</span>
                      <span className="text-sm bg-primary/20 text-primary font-medium px-2 py-0.5 rounded-full capitalize">
                        {billingInterval}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">{selectedPlan.description}</p>
                    <div className="border-t border-primary/10 pt-2 flex justify-between items-baseline">
                      <span className="text-sm font-medium">Total Price:</span>
                      <div>
                        <span className="text-lg font-bold">
                          ${billingInterval === 'yearly' ? selectedPlan.price_yearly : selectedPlan.price_monthly}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {billingInterval === 'yearly' ? '/year' : '/month'}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                <div className="bg-muted/40 rounded-lg p-3 text-xs text-muted-foreground text-center space-y-1">
                  <p className="font-medium text-foreground">🔒 Secured by Stripe</p>
                  <p>Your payment is processed securely. You can cancel any time from the billing portal.</p>
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  className="w-full font-bold py-6 text-base"
                  onClick={handleSubscribe}
                  disabled={subscriptionLoading || !selectedPlan}
                >
                  {subscriptionLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin mr-2" />
                      Redirecting to Checkout...
                    </>
                  ) : (
                    <>
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Subscribe with Stripe
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};
