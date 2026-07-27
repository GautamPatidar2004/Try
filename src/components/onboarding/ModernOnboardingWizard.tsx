import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useOnboarding } from '@/hooks/useOnboarding';
import { useSubscription } from '@/hooks/useSubscription';
import { toast } from 'sonner';
import { BadgeEarned } from './BadgeEarned';
import { WelcomeAndSetupStep } from './steps/WelcomeAndSetupStep';
import { PlanAndConnectStep } from './steps/PlanAndConnectStep';
import { PersonalizeAndLaunchStep } from './steps/PersonalizeAndLaunchStep';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const ModernOnboardingWizard: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user, isReady } = useAuth();
  const { refetchSubscriptionStatus, subscriptionStatus } = useSubscription();
  const {
    progress,
    badges,
    loading,
    stepping,
    newlyEarnedBadge,
    updateStep,
    initializeOnboarding,
    getCompletionPercentage,
    dismissBadgeCelebration,
    setLocalStep
  } = useOnboarding(user?.id ?? null);

  const [points, setPoints] = useState(0);
  const initializedRef = useRef(false);
  const stripeReturnHandledRef = useRef(false);

  // Redirect if not authenticated
  useEffect(() => {
    if (isReady && !user) {
      navigate('/auth');
    }
  }, [isReady, user, navigate]);

  // Initialize onboarding once
  useEffect(() => {
    if (user && !loading && !progress && !initializedRef.current) {
      initializedRef.current = true;
      initializeOnboarding();
    }
  }, [user, loading, progress, initializeOnboarding]);

  // Handle return from Stripe Checkout (success / canceled)
  useEffect(() => {
    if (!user || stripeReturnHandledRef.current) return;
    const status = searchParams.get('status');
    if (status !== 'success' && status !== 'canceled') return;

    stripeReturnHandledRef.current = true;

    const clearParams = () => {
      const next = new URLSearchParams(searchParams);
      next.delete('status');
      next.delete('session_id');
      setSearchParams(next, { replace: true });
      try { localStorage.removeItem('pending_subscription_checkout'); } catch {}
    };

    if (status === 'canceled') {
      toast.info('Payment canceled', {
        description: 'No worries — pick another plan or try again when you’re ready.'
      });
      clearParams();
      return;
    }

    // status === 'success' — verify subscription
    const toastId = toast.loading('Verifying your payment…');
    let attempts = 0;
    const maxAttempts = 6; // ~12s total

    const verify = async () => {
      attempts++;
      try {
        await refetchSubscriptionStatus();
      } catch (e) {
        console.error('Subscription refetch failed', e);
      }
    };

    const interval = setInterval(async () => {
      await verify();
      if (subscriptionStatus?.hasActiveSubscription) {
        clearInterval(interval);
        toast.success('Payment confirmed! 🎉', { id: toastId, description: 'Your plan is now active.' });
        clearParams();
        // Advance to step 3
        if ((progress?.current_step ?? 1) < 3) {
          updateStep(3, {});
        }
      } else if (attempts >= maxAttempts) {
        clearInterval(interval);
        toast.warning('Payment is processing', {
          id: toastId,
          description: 'It can take a few seconds. Refresh if your plan doesn’t appear shortly.'
        });
        clearParams();
      }
    }, 2000);

    // Kick off immediately
    verify();

    return () => clearInterval(interval);
  }, [user, searchParams, setSearchParams, refetchSubscriptionStatus, subscriptionStatus?.hasActiveSubscription, progress?.current_step, updateStep]);

  // React to active subscription confirmation independently of the timer
  useEffect(() => {
    if (subscriptionStatus?.hasActiveSubscription) {
      try { localStorage.removeItem('pending_subscription_checkout'); } catch {}
    }
  }, [subscriptionStatus?.hasActiveSubscription]);

  // Calculate points based on progress
  useEffect(() => {
    const currentPoints = Math.floor(getCompletionPercentage() / 100 * 300) + (badges.length * 50);
    setPoints(currentPoints);
  }, [getCompletionPercentage, badges.length]);

  if (!isReady || loading || !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-muted-foreground">Preparing your journey...</p>
        </div>
      </div>
    );
  }

  const currentStep = progress?.current_step || 1;
  const totalSteps = 3;

  const handleNext = async () => {
    if (stepping) return; // Prevent double-click

    const nextStepAction = () => {
      if (currentStep < totalSteps) {
        setPoints(prev => prev + 50);
      } else {
        navigate('/marketplace');
      }
    };

    if (currentStep < totalSteps) {
      await updateStep(currentStep + 1, {}, nextStepAction);
    } else {
      nextStepAction();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setLocalStep(currentStep - 1);
    }
  };

  const handleExit = () => {
    navigate('/marketplace');
  };

  const stepLabels = ['Welcome & Setup', 'Plan & Connect', 'Personalize & Launch'];

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <WelcomeAndSetupStep
            userId={user.id}
            onNext={handleNext}
            points={points}
            setPoints={setPoints}
          />
        );
      case 2:
        return (
          <PlanAndConnectStep
            userId={user.id}
            onNext={handleNext}
            onPrevious={handlePrevious}
            points={points}
            setPoints={setPoints}
          />
        );
      case 3:
        return (
          <PersonalizeAndLaunchStep
            userId={user.id}
            onPrevious={handlePrevious}
            badges={badges}
            points={points}
          />
        );
      default:
        return (
          <WelcomeAndSetupStep
            userId={user.id}
            onNext={handleNext}
            points={points}
            setPoints={setPoints}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Modern Header */}
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-8">
          <Button
            variant="ghost"
            onClick={handleExit}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Exit Setup
          </Button>
          
          <div className="flex items-center gap-2 sm:gap-4">
            <div className="flex items-center gap-1.5 sm:gap-2 bg-primary/10 px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-full">
              <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary" />
              <span className="font-semibold text-primary text-sm sm:text-base">{points} pts</span>
            </div>
            {badges.length > 0 && (
              <div className="flex items-center gap-1.5 sm:gap-2 bg-yellow-500/10 px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-full">
                <span className="text-yellow-600 text-sm sm:text-base">🏆</span>
                <span className="font-semibold text-yellow-700 text-sm sm:text-base">{badges.length}</span>
              </div>
            )}
          </div>
        </div>

        {/* Modern Progress */}
        <div className="mb-12 space-y-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              Creator Setup
            </h1>
            <span className="text-sm text-muted-foreground">
              Step {currentStep} of {totalSteps}
            </span>
          </div>
          
          <Progress value={getCompletionPercentage()} className="h-2" />
          
          <div className="flex justify-between">
            {stepLabels.map((label, index) => (
              <div
                key={index}
                className={`flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm ${
                  index + 1 <= currentStep
                    ? 'text-primary font-medium'
                    : 'text-muted-foreground'
                }`}
              >
                <div
                  className={`w-2 h-2 rounded-full flex-shrink-0 ${
                    index + 1 <= currentStep ? 'bg-primary' : 'bg-muted'
                  }`}
                />
                <span className="hidden sm:inline">{label}</span>
                <span className="sm:hidden">{index + 1}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Step Content with Animation */}
        <div className="flex justify-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="w-full max-w-2xl"
            >
              {renderCurrentStep()}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Badge Celebration Modal */}
        <BadgeEarned
          badge={newlyEarnedBadge}
          onDismiss={dismissBadgeCelebration}
        />
      </div>
    </div>
  );
};
