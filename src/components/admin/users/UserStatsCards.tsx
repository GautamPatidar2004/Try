import { Card, CardContent } from "@/components/ui/card";
import { Users, UserCheck, UserX, TrendingUp } from "lucide-react";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: number | string;
  icon: LucideIcon;
  trend?: number;
  description?: string;
}

const StatCard = ({ title, value, icon: Icon, trend, description }: StatCardProps) => (
  <Card>
    <CardContent className="pt-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <div className="flex items-baseline gap-2">
            <p className="text-2xl font-bold">{value}</p>
            {trend !== undefined && (
              <span
                className={`text-xs font-medium ${
                  trend >= 0 ? "text-green-600" : "text-red-600"
                }`}
              >
                {trend >= 0 ? "+" : ""}
                {trend}%
              </span>
            )}
          </div>
          {description && (
            <p className="text-xs text-muted-foreground mt-1">{description}</p>
          )}
        </div>
        <div className="p-3 bg-primary/10 rounded-full">
          <Icon className="w-6 h-6 text-primary" />
        </div>
      </div>
    </CardContent>
  </Card>
);

interface UserStatsCardsProps {
  totalUsers: number;
  activeUsers: number;
  inactiveUsers: number;
  avgEngagement: number;
}

export const UserStatsCards = ({
  totalUsers,
  activeUsers,
  inactiveUsers,
  avgEngagement,
}: UserStatsCardsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <StatCard
        title="Total Users"
        value={totalUsers}
        icon={Users}
        description="All registered users"
      />
      <StatCard
        title="Active Users"
        value={activeUsers}
        icon={UserCheck}
        trend={12}
        description="Currently active"
      />
      <StatCard
        title="Inactive Users"
        value={inactiveUsers}
        icon={UserX}
        description="Deactivated accounts"
      />
      <StatCard
        title="Avg Engagement"
        value={avgEngagement.toFixed(1)}
        icon={TrendingUp}
        trend={8}
        description="Engagement score"
      />
    </div>
  );
};
