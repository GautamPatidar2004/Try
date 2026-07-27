import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ReactNode } from 'react';

interface BadgeTooltipProps {
  children: ReactNode;
  badgeName: string;
  description: string;
  currentProgress?: number;
  targetProgress?: number;
  isEarned: boolean;
}

export const BadgeTooltip = ({
  children,
  badgeName,
  description,
  currentProgress,
  targetProgress,
  isEarned
}: BadgeTooltipProps) => {
  if (isEarned) {
    return <>{children}</>;
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          {children}
        </TooltipTrigger>
        <TooltipContent className="max-w-xs">
          <div className="space-y-2">
            <p className="font-semibold">{badgeName}</p>
            <p className="text-sm text-muted-foreground">{description}</p>
            {currentProgress !== undefined && targetProgress !== undefined && (
              <p className="text-xs text-primary font-medium">
                Progress: {currentProgress}/{targetProgress}
              </p>
            )}
            <p className="text-xs text-muted-foreground italic">
              💡 Click to get started
            </p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
