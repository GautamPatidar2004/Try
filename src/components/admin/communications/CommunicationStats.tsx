import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Megaphone, Send, Users, TrendingUp } from "lucide-react";
import { useCommunications } from "@/hooks/useCommunications";

export const CommunicationStats = () => {
  const { stats } = useCommunications();

  const statCards = [
    {
      title: "Total Campaigns",
      value: stats?.totalCampaigns || 0,
      icon: Megaphone,
      description: "All time",
    },
    {
      title: "Sent Campaigns",
      value: stats?.sentCampaigns || 0,
      icon: Send,
      description: "Successfully delivered",
    },
    {
      title: "Total Recipients",
      value: stats?.totalRecipients || 0,
      icon: Users,
      description: "Users reached",
    },
    {
      title: "Delivery Rate",
      value: `${(stats?.deliveryRate || 0).toFixed(1)}%`,
      icon: TrendingUp,
      description: "Success rate",
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {statCards.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.description}</p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
