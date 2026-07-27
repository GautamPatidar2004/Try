import { LucideIcon } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface PortfolioMetricCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  change?: number;
  tooltip?: string;
  className?: string;
}

export const PortfolioMetricCard = ({
  icon: Icon,
  label,
  value,
  change,
  tooltip,
  className
}: PortfolioMetricCardProps) => {
  return (
    <Card className={cn("p-4 hover:shadow-lg transition-all duration-200", className)}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <Icon className="h-4 w-4 text-muted-foreground" />
            <span className="text-xs uppercase tracking-wide text-muted-foreground font-medium">
              {label}
            </span>
          </div>
          <p className="text-2xl font-bold tabular-nums">{value}</p>
          {change !== undefined && (
            <p className={cn(
              "text-xs font-medium mt-1",
              change >= 0 ? "text-green-500" : "text-red-500"
            )}>
              {change >= 0 ? '+' : ''}{change}% vs last period
            </p>
          )}
        </div>
      </div>
      {tooltip && (
        <p className="text-xs text-muted-foreground mt-2 border-t pt-2">
          {tooltip}
        </p>
      )}
    </Card>
  );
};
