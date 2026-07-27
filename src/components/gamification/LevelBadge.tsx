import React from 'react';
import { usePoints } from '@/hooks/usePoints';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface LevelBadgeProps {
  userId: string;
  size?: 'sm' | 'md' | 'lg';
}

export const LevelBadge: React.FC<LevelBadgeProps> = ({ userId, size = 'md' }) => {
  const { points, loading, getLevelIcon } = usePoints(userId);

  if (loading || !points) return null;

  const sizeClasses = {
    sm: 'h-8 w-8 text-base',
    md: 'h-10 w-10 text-lg',
    lg: 'h-12 w-12 text-xl',
  };

  const textSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="inline-flex items-center gap-2 cursor-help">
            <div
              className={`${sizeClasses[size]} rounded-full bg-gradient-to-br from-primary/20 to-primary/5 border-2 border-primary/30 flex items-center justify-center`}
            >
              <span>{getLevelIcon(points.current_level)}</span>
            </div>
            <div className="flex flex-col">
              <span className={`font-semibold leading-tight ${textSizeClasses[size]}`}>
                {points.current_level}
              </span>
              <span className="text-xs text-muted-foreground leading-tight">
                {points.total_points.toLocaleString()} pts
              </span>
            </div>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <div className="text-sm">
            <p className="font-semibold mb-1">{points.current_level}</p>
            <p className="text-muted-foreground">
              {points.total_points.toLocaleString()} total points
            </p>
            {points.points_to_next_level > 0 && (
              <p className="text-xs mt-1">
                {points.points_to_next_level.toLocaleString()} points to next level
              </p>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
