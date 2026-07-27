import React, { useState } from 'react';
import { OnboardingUserTypeSelection } from '@/components/onboarding/OnboardingUserTypeSelection';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';
import { SEO } from '@/components/SEO';

const OnboardingStartPage = () => {
  const [showError, setShowError] = useState(false);

  // Show error message if page doesn't load within 5 seconds
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setShowError(true);
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="relative">
      <SEO 
        title="Get Started" 
        description="Choose your account type to get started on Hostfluencer."
        noIndex={true}
      />
      <OnboardingUserTypeSelection />
      
      {/* Sign-in link for returning users */}
      <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-auto sm:bottom-6 sm:w-full flex justify-center pointer-events-none z-10">
        <div className="bg-background/95 backdrop-blur-sm border border-border/50 rounded-full px-4 py-2 shadow-lg pointer-events-auto">
          <p className="text-sm text-muted-foreground">
            Already have an account?{' '}
            <Button
              variant="link"
              className="p-0 h-auto text-primary font-medium"
              onClick={() => window.location.href = '/auth'}
            >
              Sign in
            </Button>
          </p>
        </div>
      </div>
      
      {showError && (
        <div className="fixed bottom-20 sm:bottom-4 right-4 left-4 sm:left-auto bg-destructive/90 text-destructive-foreground p-4 rounded-lg shadow-lg max-w-md mx-auto sm:mx-0">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="font-semibold">Having trouble loading?</p>
              <p className="text-sm mt-1 opacity-90">Try refreshing the page or clearing your browser cache.</p>
              <Button
                variant="outline"
                size="sm"
                className="mt-2 bg-background hover:bg-background/80 min-h-[44px]"
                onClick={() => window.location.href = '/auth'}
              >
                Return to Login
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OnboardingStartPage;
