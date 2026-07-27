import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Megaphone, Send, Users, TrendingUp, ArrowDown } from "lucide-react";
import { useCommunications } from "@/hooks/useCommunications";

export const EnhancedCommunicationStats = () => {
  const { stats, campaigns } = useCommunications();

  // Calculate funnel data from campaigns
  const sentCampaigns = campaigns?.filter((c) => c.status === "sent") || [];
  const totalSent = sentCampaigns.reduce((s, c) => s + (c.total_recipients || 0), 0);
  const totalDelivered = sentCampaigns.reduce((s, c) => s + (c.successful_deliveries || 0), 0);
  // Estimated open/click rates (placeholder since we don't track these yet)
  const estimatedOpened = Math.round(totalDelivered * 0.45);
  const estimatedClicked = Math.round(estimatedOpened * 0.12);

  const funnelSteps = [
    { label: "Sent", value: totalSent, color: "bg-blue-500" },
    { label: "Delivered", value: totalDelivered, color: "bg-green-500" },
    { label: "Est. Opened", value: estimatedOpened, color: "bg-amber-500" },
    { label: "Est. Clicked", value: estimatedClicked, color: "bg-purple-500" },
  ];

  const maxValue = Math.max(totalSent, 1);

  // Recent campaign performance trend
  const recentCampaigns = sentCampaigns.slice(0, 8).reverse();

  const statCards = [
    { title: "Total Campaigns", value: stats?.totalCampaigns || 0, icon: Megaphone, description: "All time" },
    { title: "Sent Campaigns", value: stats?.sentCampaigns || 0, icon: Send, description: "Successfully sent" },
    { title: "Total Recipients", value: stats?.totalRecipients || 0, icon: Users, description: "Users reached" },
    { title: "Delivery Rate", value: `${(stats?.deliveryRate || 0).toFixed(1)}%`, icon: TrendingUp, description: "Success rate" },
  ];

  return (
    <div className="space-y-6">
      {/* Top Stats */}
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

      <div className="grid gap-4 md:grid-cols-2">
        {/* Funnel Visualization */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Campaign Funnel</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {funnelSteps.map((step, idx) => {
              const width = maxValue > 0 ? Math.max((step.value / maxValue) * 100, 8) : 8;
              const rate = idx > 0 && funnelSteps[idx - 1].value > 0
                ? ((step.value / funnelSteps[idx - 1].value) * 100).toFixed(0)
                : null;
              return (
                <div key={step.label}>
                  {idx > 0 && (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground ml-2 my-1">
                      <ArrowDown className="h-3 w-3" />
                      {rate}% conversion
                    </div>
                  )}
                  <div className="flex items-center gap-3">
                    <span className="text-sm w-24 text-right text-muted-foreground">{step.label}</span>
                    <div className="flex-1 h-8 bg-muted rounded-md overflow-hidden">
                      <div
                        className={`h-full ${step.color} rounded-md flex items-center px-2 transition-all`}
                        style={{ width: `${width}%` }}
                      >
                        <span className="text-xs font-medium text-white">{step.value.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Delivery Rate Trend */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Recent Campaign Performance</CardTitle>
          </CardHeader>
          <CardContent>
            {recentCampaigns.length > 0 ? (
              <div className="space-y-2">
                {recentCampaigns.map((campaign) => {
                  const rate = campaign.total_recipients > 0
                    ? (campaign.successful_deliveries / campaign.total_recipients) * 100
                    : 0;
                  return (
                    <div key={campaign.id} className="flex items-center gap-3">
                      <span className="text-xs w-28 truncate text-muted-foreground">{campaign.name}</span>
                      <div className="flex-1 h-5 bg-muted rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${rate >= 80 ? "bg-green-500" : rate >= 50 ? "bg-amber-500" : "bg-red-500"}`}
                          style={{ width: `${Math.max(rate, 3)}%` }}
                        />
                      </div>
                      <span className="text-xs font-medium w-12 text-right">{rate.toFixed(0)}%</span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">No sent campaigns yet</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
