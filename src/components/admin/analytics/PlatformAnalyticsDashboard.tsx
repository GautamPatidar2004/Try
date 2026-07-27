import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Download, TrendingUp, Users, DollarSign, Activity, Zap, Target, Globe, BarChart3 } from "lucide-react";
import { Sparkles, UsersRound } from "lucide-react";
import { DateRange, usePlatformAnalytics } from "@/hooks/usePlatformAnalytics";
import { RevenueMetrics } from "./RevenueMetrics";
import { UserGrowthMetrics } from "./UserGrowthMetrics";
import { ConversionFunnels } from "./ConversionFunnels";
import { GeographicMetrics } from "./GeographicMetrics";
import { PlatformHealthMetrics } from "./PlatformHealthMetrics";
import { KPIDashboard } from "./KPIDashboard";
import { CreatorInsightsMetrics } from "./CreatorInsightsMetrics";
import { AudienceSegments } from "./AudienceSegments";
import { EnhancedGeographicMetrics } from "./EnhancedGeographicMetrics";
import { ProductEventsDashboard } from "./ProductEventsDashboard";

export const PlatformAnalyticsDashboard = () => {
  const [dateRange, setDateRange] = useState<DateRange>('30d');
  const { data: analytics, isLoading } = usePlatformAnalytics(dateRange);

  const handleExport = () => {
    if (!analytics) return;
    const rows = [
      ['Metric', 'Value'],
      ['MRR', analytics.revenue.mrr],
      ['ARR', analytics.revenue.arr],
      ['Period Revenue', analytics.revenue.periodRevenue],
      ['Previous Period Revenue', analytics.revenue.previousPeriodRevenue],
      ['Lifetime Revenue', analytics.revenue.lifetimeRevenue],
      ['Platform Fees (period)', analytics.revenue.platformFees],
      ['Revenue Growth %', analytics.revenue.growth],
      ['Paid Active Subscriptions', analytics.subscriptions.paidActive],
      ['Trialing Subscriptions', analytics.subscriptions.trialing],
      ['Canceled Subscriptions', analytics.subscriptions.canceled],
      ['Active Collaborations', analytics.collaborations.active],
      ['Pending Collaborations', analytics.collaborations.pending],
      ['Completed Collaborations', analytics.collaborations.completed],
      ['Cancelled Collaborations', analytics.collaborations.cancelled],
      ['Total Signed Agreements', analytics.collaborations.total],
      ['Total Opportunities', analytics.opportunities?.total ?? 0],
      ['Active Opportunities', analytics.opportunities?.active ?? 0],
      ['Pending Opportunities', analytics.opportunities?.pending ?? 0],
      ['Active Stays', analytics.opportunities?.stays.active ?? 0],
      ['Open Brand Deals', analytics.opportunities?.brandDeals.open ?? 0],
      ['Pending Brand Deals', analytics.opportunities?.brandDeals.pending ?? 0],
      ['Total Users', analytics.users.total],
      ['Active Users', analytics.users.active],
      ['New Signups', analytics.users.newSignups],
      ['User Growth %', analytics.users.growth],
      ['Day 1 Retention %', analytics.retention.day1],
      ['Day 7 Retention %', analytics.retention.day7],
      ['Day 30 Retention %', analytics.retention.day30],
      ['Churn Rate %', analytics.retention.churnRate],
      ['Signup to Application %', analytics.conversion.signupToApplication],
      ['Application to Collaboration %', analytics.conversion.applicationToCollaboration],
      ['Free to Paid %', analytics.conversion.freeToPaid],
      ['Application Success Rate %', analytics.kpis.applicationSuccessRate],
      ['Content Delivery Rate %', analytics.kpis.contentDeliveryRate],
      ['Average Rating', analytics.kpis.avgRating],
      ['Avg Time to Collaboration (days)', analytics.kpis.avgTimeToCollaborationDays],
    ];
    const csv = rows.map(r => r.map(c => `"${c}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `platform-analytics-${dateRange}-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold">Platform Analytics</h2>
            <p className="text-muted-foreground">Comprehensive platform insights and metrics</p>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-2">
                <div className="h-4 bg-muted rounded w-24"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-muted rounded w-32"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 overflow-x-hidden">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Platform Analytics</h2>
          <p className="text-muted-foreground">Comprehensive platform insights and metrics</p>
        </div>
        <div className="flex gap-2">
          <Select value={dateRange} onValueChange={(value) => setDateRange(value as DateRange)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={handleExport} variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Quick Stats Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue (period)</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${(analytics?.revenue.periodRevenue ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-muted-foreground">
              {(analytics?.revenue.growth ?? 0) >= 0 ? '+' : ''}{(analytics?.revenue.growth ?? 0).toFixed(1)}% vs previous period
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Lifetime: ${(analytics?.revenue.lifetimeRevenue ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">MRR / ARR</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${(analytics?.revenue.mrr ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-muted-foreground">
              ARR ${(analytics?.revenue.arr ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} · {analytics?.subscriptions.paidActive ?? 0} paid · {analytics?.subscriptions.trialing ?? 0} trialing
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(analytics?.users.total ?? 0).toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              +{analytics?.users.newSignups ?? 0} new this period · {(analytics?.users.growth ?? 0) >= 0 ? '+' : ''}{(analytics?.users.growth ?? 0).toFixed(1)}%
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Opportunities</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics?.opportunities?.total ?? 0}</div>
            <p className="text-xs text-muted-foreground">
              {analytics?.opportunities?.stays.active ?? 0} stays · {analytics?.opportunities?.brandDeals.open ?? 0} open brand deals · {analytics?.opportunities?.brandDeals.pending ?? 0} pending
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Signed agreements: {analytics?.collaborations.total ?? 0} ({analytics?.collaborations.pending ?? 0} pending · {analytics?.collaborations.past ?? 0} past)
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics Tabs */}
      <Tabs defaultValue="revenue" className="space-y-4">
        <div className="w-full overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        <TabsList className="inline-flex w-max">
          <TabsTrigger value="revenue">
            <DollarSign className="w-4 h-4 mr-2" />
            Revenue
          </TabsTrigger>
          <TabsTrigger value="users">
            <Users className="w-4 h-4 mr-2" />
            Users
          </TabsTrigger>
          <TabsTrigger value="events">
            <BarChart3 className="w-4 h-4 mr-2" />
            Events
          </TabsTrigger>
          <TabsTrigger value="kpis">
            <Target className="w-4 h-4 mr-2" />
            KPIs
          </TabsTrigger>
          <TabsTrigger value="funnels">
            <TrendingUp className="w-4 h-4 mr-2" />
            Funnels
          </TabsTrigger>
          <TabsTrigger value="health">
            <Activity className="w-4 h-4 mr-2" />
            Health
          </TabsTrigger>
          <TabsTrigger value="geography">
            <Globe className="w-4 h-4 mr-2" />
            Geography
          </TabsTrigger>
          <TabsTrigger value="creators">
            <Sparkles className="w-4 h-4 mr-2" />
            Creators
          </TabsTrigger>
          <TabsTrigger value="segments">
            <UsersRound className="w-4 h-4 mr-2" />
            Segments
          </TabsTrigger>
        </TabsList>
        </div>

        <TabsContent value="revenue" className="space-y-4">
          <RevenueMetrics />
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          <UserGrowthMetrics />
        </TabsContent>

        <TabsContent value="events" className="space-y-4">
          <ProductEventsDashboard dateRange={dateRange} />
        </TabsContent>

        <TabsContent value="kpis" className="space-y-4">
          <KPIDashboard />
        </TabsContent>

        <TabsContent value="funnels" className="space-y-4">
          <ConversionFunnels />
        </TabsContent>

        <TabsContent value="health" className="space-y-4">
          <PlatformHealthMetrics />
        </TabsContent>

        <TabsContent value="geography" className="space-y-4">
           <EnhancedGeographicMetrics />
         </TabsContent>
 
         <TabsContent value="creators" className="space-y-4">
           <CreatorInsightsMetrics />
         </TabsContent>
 
         <TabsContent value="segments" className="space-y-4">
           <AudienceSegments />
        </TabsContent>
      </Tabs>
    </div>
  );
};
