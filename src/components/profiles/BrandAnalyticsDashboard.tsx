import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  BarChart3, 
  Eye, 
  Users, 
  TrendingUp, 
  Megaphone,
  CheckCircle,
  Clock
} from "lucide-react";

interface BrandAnalyticsDashboardProps {
  profile: any;
}

const BrandAnalyticsDashboard = ({ profile }: BrandAnalyticsDashboardProps) => {
  const { data: analytics, isLoading } = useQuery({
    queryKey: ['brand-analytics', profile?.id],
    queryFn: async () => {
      // Get all campaigns
      const { data: campaigns } = await supabase
        .from('brand_campaigns')
        .select('id, status, views_count, applications_count, spots_filled, created_at')
        .eq('created_by', profile?.id);

      if (!campaigns) return null;

      const campaignIds = campaigns.map(c => c.id);

      // Get applications stats
      const { data: applications } = await supabase
        .from('brand_campaign_applications')
        .select('status, created_at')
        .in('campaign_id', campaignIds);

      // Calculate metrics
      const totalCampaigns = campaigns.length;
      const activeCampaigns = campaigns.filter(c => c.status === 'open').length;
      const totalViews = campaigns.reduce((sum, c) => sum + (c.views_count || 0), 0);
      const totalApplications = applications?.length || 0;
      const acceptedApplications = applications?.filter(a => a.status === 'accepted').length || 0;
      const pendingApplications = applications?.filter(a => a.status === 'pending').length || 0;
      const conversionRate = totalApplications > 0 
        ? ((acceptedApplications / totalApplications) * 100).toFixed(1) 
        : '0';

      return {
        totalCampaigns,
        activeCampaigns,
        totalViews,
        totalApplications,
        acceptedApplications,
        pendingApplications,
        conversionRate,
        campaigns: campaigns.slice(0, 5), // Last 5 campaigns for detail
      };
    },
    enabled: !!profile?.id,
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-32" />)}
        </div>
        <Skeleton className="h-64" />
      </div>
    );
  }

  const statCards = [
    {
      title: "Total Views",
      value: analytics?.totalViews?.toLocaleString() || '0',
      icon: Eye,
      description: "Across all campaigns",
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Total Applications",
      value: analytics?.totalApplications || 0,
      icon: Users,
      description: `${analytics?.pendingApplications || 0} pending`,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      title: "Active Collaborations",
      value: analytics?.acceptedApplications || 0,
      icon: CheckCircle,
      description: "Currently working with",
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "Conversion Rate",
      value: `${analytics?.conversionRate || 0}%`,
      icon: TrendingUp,
      description: "Application to collaboration",
      color: "text-orange-600",
      bgColor: "bg-orange-50",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Analytics Dashboard</h2>
        <p className="text-muted-foreground">Track your campaign performance and creator engagement</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Campaign Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Megaphone className="h-5 w-5" />
              Campaign Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <span className="text-sm font-medium">Total Campaigns</span>
                <span className="text-lg font-bold">{analytics?.totalCampaigns || 0}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <span className="text-sm font-medium text-green-700">Active Campaigns</span>
                <span className="text-lg font-bold text-green-700">{analytics?.activeCampaigns || 0}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <span className="text-sm font-medium text-foreground/80">Completed</span>
                <span className="text-lg font-bold text-foreground/80">
                  {(analytics?.totalCampaigns || 0) - (analytics?.activeCampaigns || 0)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Application Pipeline
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-yellow-600" />
                  <span className="text-sm font-medium text-yellow-700">Pending Review</span>
                </div>
                <span className="text-lg font-bold text-yellow-700">{analytics?.pendingApplications || 0}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium text-green-700">Accepted</span>
                </div>
                <span className="text-lg font-bold text-green-700">{analytics?.acceptedApplications || 0}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <span className="text-sm font-medium">Total Received</span>
                <span className="text-lg font-bold">{analytics?.totalApplications || 0}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Campaigns Performance */}
      {analytics?.campaigns && analytics.campaigns.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Campaign Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analytics.campaigns.map((campaign: any) => (
                <div key={campaign.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${campaign.status === 'open' ? 'bg-green-500' : 'bg-gray-400'}`} />
                    <span className="font-medium truncate max-w-[200px]">Campaign</span>
                  </div>
                  <div className="flex items-center gap-6 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Eye className="h-3 w-3" />
                      {campaign.views_count || 0}
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      {campaign.applications_count || 0}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default BrandAnalyticsDashboard;
