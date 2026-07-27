import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface GrowthIndicatorProps {
  value: number;
  showPercentage?: boolean;
}

export const GrowthIndicator = ({ value, showPercentage = true }: GrowthIndicatorProps) => {
  const isPositive = value > 0;
  const isNeutral = value === 0;
  
  const color = isNeutral ? 'text-muted-foreground' : isPositive ? 'text-green-500' : 'text-red-500';
  const Icon = isNeutral ? Minus : isPositive ? TrendingUp : TrendingDown;
  
  return (
    <div className={`flex items-center gap-1 text-sm font-medium ${color}`}>
      <Icon className="w-4 h-4" />
      {showPercentage && (
        <span>{Math.abs(value).toFixed(1)}%</span>
      )}
    </div>
  );
};
