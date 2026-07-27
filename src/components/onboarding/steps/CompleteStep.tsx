import React, { useEffect } from 'react';
import { OnboardingStep } from '../OnboardingStep';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Star, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

interface CompleteStepProps {
  currentStep: number;
  totalSteps: number;
  onPrevious: () => void;
  badges: Array<{
    id: string;
    name: string;
    description: string;
    icon: string;
    earned_at: string;
  }>;
}

const nextSteps = [
  {
    title: "Browse Properties",
    description: "Explore amazing properties and start applying",
    action: "marketplace",
    icon: "🏡"
  },
  {
    title: "Complete Your Profile",
    description: "Add more details to attract hosts",
    action: "profile",
    icon: "👤"
  },
  {
    title: "Upgrade Your Plan",
    description: "Get more applications and premium features",
    action: "subscription",
    icon: "⭐"
  }
];

export const CompleteStep: React.FC<CompleteStepProps> = ({
  currentStep,
  totalSteps,
  onPrevious,
  badges
}) => {
  const navigate = useNavigate();

  // Confetti effect on mount
  useEffect(() => {
    // Simple confetti effect could be added here
  }, []);

  const handleNavigation = (action: string) => {
    switch (action) {
      case 'marketplace':
        navigate('/marketplace');
        break;
      case 'profile':
        navigate('/profile');
        break;
      case 'subscription':
        navigate('/subscription');
        break;
      default:
        navigate('/marketplace');
    }
  };

  return (
    <OnboardingStep
      title="Congratulations! You're Ready! 🎉"
      description="Your onboarding is complete! You've earned some awesome badges and unlocked all platform features."
      currentStep={currentStep}
      totalSteps={totalSteps}
      onPrevious={onPrevious}
      nextLabel="Start Exploring"
      onNext={() => handleNavigation('marketplace')}
    >
      <div className="space-y-6">
        {/* Success Animation */}
        <div className="text-center space-y-4">
          <div className="relative">
            <div className="w-24 h-24 mx-auto bg-gradient-to-r from-primary to-primary/60 rounded-full flex items-center justify-center animate-scale-in">
              <CheckCircle className="w-12 h-12 text-primary-foreground" />
            </div>
            {/* Floating icons animation */}
            <div className="absolute -top-2 -right-2 animate-bounce">
              <Star className="w-6 h-6 text-yellow-500" />
            </div>
          </div>
          
          <div className="space-y-2">
            <h3 className="text-xl font-bold text-foreground">
              Welcome to the Community!
            </h3>
            <p className="text-muted-foreground">
              You're now ready to start collaborating with amazing hosts worldwide.
            </p>
          </div>
        </div>

        {/* Earned Badges */}
        {badges.length > 0 && (
          <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
            <CardContent className="p-4 space-y-4">
              <div className="text-center">
                <h4 className="font-semibold text-foreground mb-2">🏆 Badges Earned</h4>
                <div className="flex flex-wrap justify-center gap-2">
                  {badges.slice(0, 6).map((badge) => (
                    <Badge key={badge.id} variant="secondary" className="px-3 py-1">
                      <span className="mr-1">{badge.icon}</span>
                      {badge.name}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Next Steps */}
        <div className="space-y-4">
          <h4 className="font-semibold text-foreground text-center">What's Next?</h4>
          <div className="grid gap-3">
            {nextSteps.map((step, index) => (
              <Card 
                key={index} 
                className="border-border/50 hover:border-primary/50 transition-colors cursor-pointer"
                onClick={() => handleNavigation(step.action)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{step.icon}</span>
                      <div>
                        <h5 className="font-medium">{step.title}</h5>
                        <p className="text-sm text-muted-foreground">{step.description}</p>
                      </div>
                    </div>
                    <ArrowRight className="w-5 h-5 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex gap-3 pt-4">
          <Button 
            variant="outline" 
            className="flex-1"
            onClick={() => handleNavigation('profile')}
          >
            View Profile
          </Button>
          <Button 
            className="flex-1"
            onClick={() => handleNavigation('marketplace')}
          >
            Start Exploring
          </Button>
        </div>
      </div>
    </OnboardingStep>
  );
};