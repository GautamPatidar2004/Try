import React from 'react';
import { OnboardingStep } from '../OnboardingStep';
import { Card, CardContent } from '@/components/ui/card';
import { Star, Users, TrendingUp, Award } from 'lucide-react';

interface WelcomeStepProps {
  currentStep: number;
  totalSteps: number;
  onNext: () => void;
}

const benefits = [
  {
    icon: Star,
    title: "Premium Access",
    description: "Connect with verified hosts and premium properties"
  },
  {
    icon: Users,
    title: "Community",
    description: "Join thousands of successful content creators"
  },
  {
    icon: TrendingUp,
    title: "Growth Tools",
    description: "Analytics and insights to grow your influence"
  },
  {
    icon: Award,
    title: "Achievements",
    description: "Earn badges and unlock exclusive features"
  }
];

export const WelcomeStep: React.FC<WelcomeStepProps> = ({
  currentStep,
  totalSteps,
  onNext
}) => {
  return (
    <OnboardingStep
      title="Welcome to Your Creator Journey! 🎉"
      description="Let's get you set up for success. This quick process will unlock all platform features and help you start collaborating with amazing hosts."
      currentStep={currentStep}
      totalSteps={totalSteps}
      onNext={onNext}
      nextLabel="Let's Get Started"
      previousLabel=""
    >
      <div className="space-y-6">
        {/* Welcome Message */}
        <div className="text-center space-y-4">
          <div className="w-20 h-20 mx-auto bg-gradient-to-r from-primary to-primary/60 rounded-full flex items-center justify-center text-4xl">
            🚀
          </div>
          <p className="text-lg text-muted-foreground">
            Complete your setup to unlock amazing collaboration opportunities!
          </p>
        </div>

        {/* Benefits Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {benefits.map((benefit, index) => (
            <Card key={index} className="border-border/50 hover:border-primary/50 transition-colors">
              <CardContent className="p-4 text-center space-y-3">
                <div className="w-12 h-12 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
                  <benefit.icon className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h4 className="font-semibold">{benefit.title}</h4>
                  <p className="text-sm text-muted-foreground">{benefit.description}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Progress Incentive */}
        <div className="bg-secondary/50 rounded-lg p-4 text-center">
          <p className="text-sm font-medium text-foreground">
            🎯 Complete all steps to earn the "Collaboration Ready" badge and unlock premium features!
          </p>
        </div>
      </div>
    </OnboardingStep>
  );
};