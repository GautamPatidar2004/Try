import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, CheckCircle, XCircle, Clock } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const PlatformHealthMetrics = () => {
  const { data: health, isLoading } = useQuery({
    queryKey: ['platform-health'],
    queryFn: async () => {
      // Application success rate
      const { data: applications } = await supabase
        .from('applications')
        .select('status');

      const totalApps = applications?.length || 0;
      const successfulApps = applications?.filter(a => a.status === 'accepted').length || 0;
      const applicationSuccessRate = totalApps > 0 ? (successfulApps / totalApps) * 100 : 0;

      // Content delivery rate
      const { data: contentPosts } = await supabase
        .from('content_posts')
        .select('delivery_status');

      const totalPosts = contentPosts?.length || 0;
      const deliveredPosts = contentPosts?.filter(p => p.delivery_status === 'published').length || 0;
      const contentDeliveryRate = totalPosts > 0 ? (deliveredPosts / totalPosts) * 100 : 0;

      // Active collaborations
      const { count: activeCollaborations } = await supabase
        .from('collaboration_agreements')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active');

      return {
        applicationSuccessRate,
        contentDeliveryRate,
        activeCollaborations: activeCollaborations || 0,
        systemStatus: 'operational',
      };
    },
  });

  if (isLoading) {
    return <div className="text-center py-8">Loading platform health...</div>;
  }

  const getHealthColor = (rate: number) => {
    if (rate >= 90) return 'text-green-600';
    if (rate >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getHealthIcon = (rate: number) => {
    if (rate >= 90) return <CheckCircle className="w-5 h-5 text-green-600" />;
    if (rate >= 70) return <Clock className="w-5 h-5 text-yellow-600" />;
    return <XCircle className="w-5 h-5 text-red-600" />;
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Status</CardTitle>
            <Activity className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold capitalize">{health?.systemStatus}</div>
            <p className="text-xs text-muted-foreground">All systems operational</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Application Success</CardTitle>
            {getHealthIcon(health?.applicationSuccessRate || 0)}
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getHealthColor(health?.applicationSuccessRate || 0)}`}>
              {health?.applicationSuccessRate.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">Success rate</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Content Delivery</CardTitle>
            {getHealthIcon(health?.contentDeliveryRate || 0)}
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getHealthColor(health?.contentDeliveryRate || 0)}`}>
              {health?.contentDeliveryRate.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">Delivery rate</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Collaborations</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{health?.activeCollaborations}</div>
            <p className="text-xs text-muted-foreground">Currently active</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Health Indicators</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Application Success Rate</span>
                <span className={`text-sm font-bold ${getHealthColor(health?.applicationSuccessRate || 0)}`}>
                  {health?.applicationSuccessRate.toFixed(1)}%
                </span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div 
                  className={`rounded-full h-2 transition-all ${
                    (health?.applicationSuccessRate || 0) >= 90 ? 'bg-green-600' :
                    (health?.applicationSuccessRate || 0) >= 70 ? 'bg-yellow-600' :
                    'bg-red-600'
                  }`}
                  style={{ width: `${health?.applicationSuccessRate}%` }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Content Delivery Rate</span>
                <span className={`text-sm font-bold ${getHealthColor(health?.contentDeliveryRate || 0)}`}>
                  {health?.contentDeliveryRate.toFixed(1)}%
                </span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div 
                  className={`rounded-full h-2 transition-all ${
                    (health?.contentDeliveryRate || 0) >= 90 ? 'bg-green-600' :
                    (health?.contentDeliveryRate || 0) >= 70 ? 'bg-yellow-600' :
                    'bg-red-600'
                  }`}
                  style={{ width: `${health?.contentDeliveryRate}%` }}
                ></div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
