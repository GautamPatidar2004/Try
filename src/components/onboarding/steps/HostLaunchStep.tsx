import React, { useState } from 'react';
import { User } from '@supabase/supabase-js';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Rocket, ArrowLeft, CheckCircle, Users, Home, Star } from 'lucide-react';

interface HostLaunchStepProps {
  user: User | null;
  onNext: (data: any) => void;
  onPrevious: () => void;
  onExit: () => void;
  currentStep: number;
  totalSteps: number;
}

export const HostLaunchStep: React.FC<HostLaunchStepProps> = ({
  user,
  onNext,
  onPrevious,
  onExit,
  currentStep,
  totalSteps
}) => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleLaunch = async () => {
    setLoading(true);
    try {
      // Send welcome email (non-blocking)
      if (user) {
        try {
          const { supabase } = await import('@/integrations/supabase/client');
          await supabase.functions.invoke('send-welcome-email', {
            body: { user_id: user.id }
          });
        } catch (emailError) {
          console.error('Welcome email failed (non-blocking):', emailError);
        }
      }

      toast({
        title: "Welcome to Hostfluencer!",
        description: "Your host profile is now live. Start connecting with content creators!",
      });

      // Complete onboarding
      onNext({ completed: true });
    } catch (error: any) {
      console.error('Error completing onboarding:', error);
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const features = [
    {
      icon: Users,
      title: "Connect with Creators",
      description: "Browse and connect with content creators who align with your brand"
    },
    {
      icon: Home,
      title: "List Your Properties",
      description: "Add your properties and start receiving collaboration requests"
    },
    {
      icon: Star,
      title: "Build Your Reputation",
      description: "Earn reviews and build trust with the creator community"
    }
  ];

  return (
    <div className="max-w-2xl mx-auto">
      <Card className="border-0 shadow-xl bg-background/80 backdrop-blur-sm">
        <CardHeader className="text-center pb-6">
          <div className="flex justify-center mb-4">
            <div className="p-3 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white">
              <Rocket className="w-8 h-8" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">Ready to Launch!</CardTitle>
          <p className="text-muted-foreground">
            Your host profile is all set up. Here's what you can do next:
          </p>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="space-y-4">
            {features.map((feature, index) => (
              <div key={index} className="flex items-start space-x-4 p-4 rounded-lg bg-muted/50">
                <div className="p-2 rounded-lg bg-primary/10">
                  <feature.icon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-semibold">{feature.title}</h4>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-6 h-6 text-green-600" />
              <div>
                <h4 className="font-semibold text-green-800">Profile Complete!</h4>
                <p className="text-sm text-green-700">
                  You're now ready to start collaborating with content creators on Hostfluencer.
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-between pt-4">
            <Button
              variant="outline"
              onClick={onPrevious}
              disabled={loading}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Previous
            </Button>
            <Button
              onClick={handleLaunch}
              disabled={loading}
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Launching...
                </>
              ) : (
                <>
                  Launch My Profile
                  <Rocket className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};