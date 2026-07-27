import React from 'react';
import { OnboardingStep } from '../OnboardingStep';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Sparkles, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

interface RestaurantLaunchStepProps {
  onNext: () => void;
  onPrevious: () => void;
}

export const RestaurantLaunchStep: React.FC<RestaurantLaunchStepProps> = ({
  onNext,
  onPrevious,
}) => {
  const navigate = useNavigate();

  const handleGoLive = async () => {
    // Send welcome email (non-blocking)
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.functions.invoke('send-welcome-email', {
          body: { user_id: user.id }
        });
      }
    } catch (emailError) {
      console.error('Welcome email failed (non-blocking):', emailError);
    }

    await onNext();
    navigate('/marketplace');
  };

  return (
    <OnboardingStep
      title="🎉 You're Ready to Go Live!"
      description="Your restaurant will be listed immediately after clicking the button below"
      currentStep={2}
      totalSteps={2}
      onPrevious={onPrevious}
    >
      <div className="space-y-8">
        {/* What's Included */}
        <div className="bg-gradient-to-r from-green-500/10 to-blue-500/10 p-6 rounded-lg border border-green-500/20">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-green-500/20 rounded-full">
              <Sparkles className="w-6 h-6 text-green-500" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-lg mb-2">Auto-Listing Enabled</h3>
              <p className="text-sm text-muted-foreground">
                We've set up smart defaults so you can start receiving collaboration requests immediately. 
                You can customize everything from your dashboard later.
              </p>
            </div>
          </div>
        </div>

        {/* What's Set Up */}
        <div className="space-y-3">
          <h3 className="font-semibold">What's Ready For You:</h3>
          <div className="space-y-2">
            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
              <CheckCircle2 className="w-5 h-5 text-green-500" />
              <span className="text-sm">Restaurant profile created</span>
            </div>
            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
              <CheckCircle2 className="w-5 h-5 text-green-500" />
              <span className="text-sm">Default operating hours (Mon-Sun)</span>
            </div>
            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
              <CheckCircle2 className="w-5 h-5 text-green-500" />
              <span className="text-sm">Booking slots ready for creators</span>
            </div>
            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
              <CheckCircle2 className="w-5 h-5 text-green-500" />
              <span className="text-sm">Free meal collaboration enabled</span>
            </div>
          </div>
        </div>

        {/* Customize Later */}
        <div className="bg-muted/30 p-6 rounded-lg space-y-3">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-muted-foreground" />
            <h3 className="font-semibold">Customize Anytime</h3>
          </div>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <span className="text-primary mt-0.5">•</span>
              <span>Add cuisine types, dietary options, and ambiance tags</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-0.5">•</span>
              <span>Upload menu items and restaurant photos</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-0.5">•</span>
              <span>Adjust operating hours and booking slots</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-0.5">•</span>
              <span>Set minimum follower requirements</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-0.5">•</span>
              <span>Upload verification documents for a verified badge</span>
            </li>
          </ul>
        </div>

        {/* Primary Action */}
        <div className="flex justify-center pt-4">
          <Button onClick={handleGoLive} size="lg" className="px-8 gap-2">
            <Sparkles className="w-5 h-5" />
            Go Live & Start Collaborating
          </Button>
        </div>
      </div>
    </OnboardingStep>
  );
};
