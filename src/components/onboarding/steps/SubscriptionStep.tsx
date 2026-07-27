import React from 'react';
import { OnboardingStep } from '../OnboardingStep';
import { PricingPlans } from '@/components/subscription/PricingPlans';
import { useSubscription } from '@/hooks/useSubscription';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle, Star, Building2, Sparkles } from 'lucide-react';

interface SubscriptionStepProps {
  currentStep: number;
  totalSteps: number;
  onNext: () => void;
  onPrevious: () => void;
}

export const SubscriptionStep: React.FC<SubscriptionStepProps> = ({
  currentStep,
  totalSteps,
  onNext,
  onPrevious
}) => {
  const { subscriptionStatus, loading, userTypeCategory } = useSubscription();

  // Demand-side users (hosts, brands, restaurants) - FREE access, auto-pass
  if (userTypeCategory === 'demand') {
    return (
      <OnboardingStep
        title="You're All Set! 🎉"
        description="Full platform access is free for hosts and businesses."
        currentStep={currentStep}
        totalSteps={totalSteps}
        onNext={onNext}
        onPrevious={onPrevious}
        nextLabel="Continue Setup"
      >
        <div className="text-center space-y-6">
          <div className="w-20 h-20 mx-auto bg-gradient-to-r from-primary to-primary/60 rounded-full flex items-center justify-center">
            <Sparkles className="w-10 h-10 text-primary-foreground" />
          </div>
          
          <div className="space-y-2">
            <h3 className="text-xl font-semibold text-foreground">
              Free Access Activated!
            </h3>
            <p className="text-muted-foreground">
              As a host or business, you have full free access to all platform features.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
            <div className="flex items-start gap-2 p-3 rounded-lg bg-primary/5">
              <CheckCircle className="w-4 h-4 text-primary mt-0.5 shrink-0" />
              <span className="text-sm">Unlimited property listings</span>
            </div>
            <div className="flex items-start gap-2 p-3 rounded-lg bg-primary/5">
              <CheckCircle className="w-4 h-4 text-primary mt-0.5 shrink-0" />
              <span className="text-sm">Launch creator campaigns</span>
            </div>
            <div className="flex items-start gap-2 p-3 rounded-lg bg-primary/5">
              <CheckCircle className="w-4 h-4 text-primary mt-0.5 shrink-0" />
              <span className="text-sm">Message creators directly</span>
            </div>
            <div className="flex items-start gap-2 p-3 rounded-lg bg-primary/5">
              <CheckCircle className="w-4 h-4 text-primary mt-0.5 shrink-0" />
              <span className="text-sm">Full analytics dashboard</span>
            </div>
          </div>

          <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-center gap-2">
                <Building2 className="w-5 h-5 text-primary" />
                <span className="text-sm font-medium">
                  Business Free Plan Active
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </OnboardingStep>
    );
  }

  // If already subscribed, show success and allow to continue
  if (subscriptionStatus?.hasActiveSubscription) {
    return (
      <OnboardingStep
        title="You're All Set! ⭐"
        description="Your subscription is active and ready to go."
        currentStep={currentStep}
        totalSteps={totalSteps}
        onNext={onNext}
        onPrevious={onPrevious}
        nextLabel="Continue Setup"
      >
        <div className="text-center space-y-6">
          <div className="w-20 h-20 mx-auto bg-gradient-to-r from-primary to-primary/60 rounded-full flex items-center justify-center">
            <CheckCircle className="w-10 h-10 text-primary-foreground" />
          </div>
          
          <div className="space-y-2">
            <h3 className="text-xl font-semibold text-foreground">
              Subscription Active!
            </h3>
            <p className="text-muted-foreground">
              You have access to all premium features. Let's continue setting up your profile.
            </p>
          </div>

          <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-center gap-2">
                <Star className="w-5 h-5 text-primary" />
                <span className="text-sm font-medium">
                  Premium Plan Active
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </OnboardingStep>
    );
  }

  return (
    <OnboardingStep
      title="Choose Your Plan 🌟"
      description="Start free or unlock premium features with Pro or Elite."
      currentStep={currentStep}
      totalSteps={totalSteps}
      onNext={onNext}
      onPrevious={onPrevious}
      nextLabel="Continue"
    >
      <div className="space-y-6">
        {/* Free starter emphasis */}
        <div className="text-center bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg p-4 border border-primary/20">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Star className="w-5 h-5 text-primary" />
            <span className="font-semibold text-primary">Start Free Forever</span>
          </div>
          <p className="text-sm text-muted-foreground">
            Get started with our free Starter plan, or upgrade for advanced analytics and monetization tools.
          </p>
        </div>

        {/* Pricing Plans */}
        <div className="py-2">
          <PricingPlans forcedCategory="supply" compact />
        </div>

        {/* Skip Information */}
        <div className="text-center p-4 bg-secondary/50 rounded-lg">
          <p className="text-sm text-muted-foreground">
            💡 You can change your plan anytime from your profile settings.
          </p>
        </div>
      </div>
    </OnboardingStep>
  );
};