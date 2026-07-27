import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface OnboardingStepProps {
  title: string;
  description: string;
  children: React.ReactNode;
  currentStep: number;
  totalSteps: number;
  onNext?: () => void;
  onPrevious?: () => void;
  nextLabel?: string;
  previousLabel?: string;
  nextDisabled?: boolean;
  className?: string;
}

export const OnboardingStep: React.FC<OnboardingStepProps> = ({
  title,
  description,
  children,
  currentStep,
  totalSteps,
  onNext,
  onPrevious,
  nextLabel = "Continue",
  previousLabel = "Back",
  nextDisabled = false,
  className
}) => {
  const isFirstStep = currentStep === 1;
  const isLastStep = currentStep === totalSteps;

  return (
    <Card className={cn("w-full max-w-2xl mx-auto animate-fade-in", className)}>
      <CardHeader className="text-center space-y-4">
        <div className="space-y-2">
          <CardTitle className="text-2xl font-bold">{title}</CardTitle>
          <CardDescription className="text-base">{description}</CardDescription>
        </div>
        
        {/* Step indicator */}
        <div className="flex items-center justify-center space-x-2">
          <div className="text-sm text-muted-foreground">
            Step {currentStep} of {totalSteps}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Step Content */}
        <div className="min-h-[200px] flex flex-col justify-center">
          {children}
        </div>

        {/* Navigation Buttons */}
        <div className="flex flex-col-reverse sm:flex-row justify-between gap-3 pt-6 border-t">
          <Button
            variant="outline"
            onClick={onPrevious}
            disabled={isFirstStep}
            className="min-w-[100px] min-h-[44px]"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            {previousLabel}
          </Button>

          <Button
            onClick={onNext}
            disabled={nextDisabled}
            className="min-w-[100px] min-h-[44px]"
          >
            {nextLabel}
            {!isLastStep && <ArrowRight className="w-4 h-4 ml-2" />}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};