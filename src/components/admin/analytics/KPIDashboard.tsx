import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Target, TrendingUp, Clock, Star } from "lucide-react";
import { usePlatformAnalytics } from "@/hooks/usePlatformAnalytics";

export const KPIDashboard = () => {
  const { data: analytics, isLoading, error } = usePlatformAnalytics('30d');

  if (isLoading) {
    return <div className="text-center py-8 text-muted-foreground">Loading KPIs...</div>;
  }

  if (error || !analytics) {
    return (
      <div className="text-center py-8 text-destructive">
        Failed to load KPIs. Please refresh and try again.
      </div>
    );
  }

  const kpis = {
    avgTimeToCollaboration: analytics.kpis.avgTimeToCollaborationDays,
    appToCollabRate: analytics.kpis.applicationSuccessRate,
    avgRating: analytics.kpis.avgRating,
    contentDeliveryRate: analytics.kpis.contentDeliveryRate,
    reviewsCount: analytics.kpis.reviewsCount,
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Time to Collaboration</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpis.avgTimeToCollaboration.toFixed(1)} days</div>
            <p className="text-xs text-muted-foreground">From application to agreement</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Application Success Rate</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpis.appToCollabRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">Accepted applications (30d)</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">User Satisfaction</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpis.avgRating.toFixed(1)} / 5.0</div>
            <p className="text-xs text-muted-foreground">Average rating ({kpis.reviewsCount} reviews)</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Content Delivery</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpis.contentDeliveryRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">Successfully delivered</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>KPI Performance Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { name: 'Application Success Rate', value: kpis.appToCollabRate, target: 50 },
              { name: 'Content Delivery Rate', value: kpis.contentDeliveryRate, target: 90 },
              { name: 'User Satisfaction', value: kpis.avgRating * 20, target: 80 },
            ].map((kpi, idx) => (
              <div key={idx}>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">{kpi.name}</span>
                  <div className="text-sm">
                    <span className="font-bold">{kpi.value.toFixed(1)}%</span>
                    <span className="text-muted-foreground"> / {kpi.target}% target</span>
                  </div>
                </div>
                <div className="w-full bg-muted rounded-full h-2 relative">
                  <div 
                    className="bg-primary rounded-full h-2 transition-all"
                    style={{ width: `${Math.min(kpi.value, 100)}%` }}
                  ></div>
                  <div 
                    className="absolute top-0 h-2 w-px bg-yellow-500"
                    style={{ left: `${kpi.target}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
