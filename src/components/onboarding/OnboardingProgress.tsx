import React from 'react';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, Circle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface OnboardingProgressProps {
  currentStep: number;
  completedSteps: number[];
  totalSteps: number;
  completionPercentage: number;
}

const stepLabels = [
  'Welcome',
  'Subscribe',
  'Profile',
  'Social',
  'Preferences', 
  'Complete'
];

export const OnboardingProgress: React.FC<OnboardingProgressProps> = ({
  currentStep,
  completedSteps,
  totalSteps,
  completionPercentage
}) => {
  return (
    <div className="w-full space-y-6">
      {/* Overall Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Overall Progress</span>
          <span className="font-medium">{completionPercentage}%</span>
        </div>
        <Progress value={completionPercentage} className="h-2" />
      </div>

      {/* Step Indicators */}
      <div className="flex justify-between items-center">
        {stepLabels.slice(0, totalSteps).map((label, index) => {
          const stepNumber = index + 1;
          const isCompleted = completedSteps.includes(stepNumber);
          const isCurrent = stepNumber === currentStep;
          const isPast = stepNumber < currentStep;

          return (
            <div key={stepNumber} className="flex flex-col items-center space-y-2">
              <div className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300",
                isCompleted 
                  ? "bg-primary border-primary text-primary-foreground" 
                  : isCurrent
                  ? "border-primary text-primary bg-primary/10"
                  : isPast
                  ? "border-primary/50 text-primary/50"
                  : "border-border text-muted-foreground"
              )}>
                {isCompleted ? (
                  <CheckCircle className="w-5 h-5" />
                ) : (
                  <Circle className={cn(
                    "w-5 h-5",
                    isCurrent && "fill-current"
                  )} />
                )}
              </div>
              <span className={cn(
                "text-xs font-medium transition-colors",
                isCompleted || isCurrent
                  ? "text-foreground"
                  : "text-muted-foreground"
              )}>
                {label}
              </span>
            </div>
          );
        })}
      </div>

      {/* Connection Lines */}
      <div className="relative -mt-8 mb-8">
        <div className="absolute top-5 left-5 right-5 h-0.5 bg-border" />
        <div 
          className="absolute top-5 left-5 h-0.5 bg-primary transition-all duration-500"
          style={{ 
            width: `calc(${(completedSteps.length / (totalSteps - 1)) * 100}% - 2.5rem)` 
          }}
        />
      </div>
    </div>
  );
};