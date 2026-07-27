import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface AgreementStatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: number;
    label: string;
  };
}

export const AgreementStatsCard = ({ title, value, icon: Icon, trend }: AgreementStatsCardProps) => {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold mt-2">{value}</p>
            {trend && (
              <p className="text-xs text-muted-foreground mt-1">
                {trend.value > 0 ? '+' : ''}{trend.value}% {trend.label}
              </p>
            )}
          </div>
          <Icon className="h-8 w-8 text-muted-foreground" />
        </div>
      </CardContent>
    </Card>
  );
};
