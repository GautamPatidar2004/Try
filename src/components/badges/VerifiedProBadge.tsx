import React from 'react';
import { BadgeCheck } from 'lucide-react';
import { cn } from '@/lib/utils';

interface VerifiedProBadgeProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const VerifiedProBadge: React.FC<VerifiedProBadgeProps> = ({ 
  size = 'md', 
  className 
}) => {
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2.5 py-1',
    lg: 'text-base px-3 py-1.5'
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  };

  return (
    <div className={cn(
      "inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-primary to-primary/80 text-primary-foreground font-semibold",
      sizeClasses[size],
      className
    )}>
      <BadgeCheck className={iconSizes[size]} />
      <span>Verified Pro</span>
    </div>
  );
};
