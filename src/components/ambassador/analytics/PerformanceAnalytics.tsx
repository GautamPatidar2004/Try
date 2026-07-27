import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAmbassadorAnalytics, DateRange } from "@/hooks/useAmbassadorAnalytics";
import { ChannelPerformance } from "./ChannelPerformance";
import { SmartInsights } from "./SmartInsights";
import { EarningsBreakdown } from "./EarningsBreakdown";
import { ClicksTimeline } from "./ClicksTimeline";
import { MousePointerClick, Users, TrendingUp, DollarSign, Loader2 } from "lucide-react";

export const PerformanceAnalytics = () => {
  const [dateRange, setDateRange] = useState<DateRange>('30d');
  const { analytics, isLoading } = useAmbassadorAnalytics(dateRange);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with date selector */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Performance Analytics</h2>
          <p className="text-muted-foreground">Track your referral performance and earnings</p>
        </div>
        <Select value={dateRange} onValueChange={(v) => setDateRange(v as DateRange)}>
          <SelectTrigger className="w-[140px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">Last 7 days</SelectItem>
            <SelectItem value="30d">Last 30 days</SelectItem>
            <SelectItem value="90d">Last 90 days</SelectItem>
            <SelectItem value="all">All time</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Summary Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Clicks</CardTitle>
            <MousePointerClick className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalClicks.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Link clicks tracked</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversions</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalConversions}</div>
            <p className="text-xs text-muted-foreground">Successful signups</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.conversionRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">Click to signup</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${analytics.totalEarnings.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              ${analytics.avgEarningsPerReferral.toFixed(0)} avg per referral
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Smart Insights */}
      <SmartInsights insights={analytics.insights} />

      {/* Detailed Analytics Tabs */}
      <Tabs defaultValue="channels" className="space-y-4">
        <TabsList>
          <TabsTrigger value="channels">Channels</TabsTrigger>
          <TabsTrigger value="timeline">Activity</TabsTrigger>
          <TabsTrigger value="earnings">Earnings</TabsTrigger>
        </TabsList>

        <TabsContent value="channels" className="space-y-4">
          <ChannelPerformance 
            channelStats={analytics.clicksByChannel} 
            deviceStats={analytics.deviceBreakdown}
            totalClicks={analytics.totalClicks}
          />
        </TabsContent>

        <TabsContent value="timeline" className="space-y-4">
          <ClicksTimeline data={analytics.clicksOverTime} />
        </TabsContent>

        <TabsContent value="earnings" className="space-y-4">
          <EarningsBreakdown 
            earningsData={analytics.earningsOverTime}
            totalEarnings={analytics.totalEarnings}
            avgPerReferral={analytics.avgEarningsPerReferral}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};
