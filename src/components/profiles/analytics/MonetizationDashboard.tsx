import { useROIMetrics } from '@/hooks/useROIMetrics';
import { ROIDemonstrator } from './ROIDemonstrator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { DollarSign, TrendingUp, Target, Briefcase } from 'lucide-react';
import { useAccountValue } from '@/hooks/useAccountValue';

interface MonetizationDashboardProps {
  userId: string;
}

export const MonetizationDashboard = ({ userId }: MonetizationDashboardProps) => {
  const { data, isLoading } = useAccountValue(userId);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-32" />
        ))}
      </div>
    );
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="glass-effect hover-lift">
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 rounded-xl bg-primary/10">
                <DollarSign className="w-5 h-5 text-primary" />
              </div>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Value Per Post</p>
              <p className="text-2xl font-bold">{formatCurrency(data?.valuePerPost || 0)}</p>
              <p className="text-xs text-muted-foreground mt-1">Average rate</p>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-effect hover-lift">
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 rounded-xl bg-green-500/10">
                <TrendingUp className="w-5 h-5 text-green-500" />
              </div>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Monthly Potential</p>
              <p className="text-2xl font-bold">{formatCurrency(data?.monthlyValue || 0)}</p>
              <p className="text-xs text-muted-foreground mt-1">Based on 12 posts/month</p>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-effect hover-lift">
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 rounded-xl bg-purple-500/10">
                <Target className="w-5 h-5 text-purple-500" />
              </div>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Annual Potential</p>
              <p className="text-2xl font-bold">{formatCurrency(data?.annualValue || 0)}</p>
              <p className="text-xs text-muted-foreground mt-1">Yearly earning potential</p>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-effect hover-lift">
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 rounded-xl bg-blue-500/10">
                <Briefcase className="w-5 h-5 text-blue-500" />
              </div>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Collaborations</p>
              <p className="text-2xl font-bold">{data?.collaborationCount || 0}</p>
              <p className="text-xs text-muted-foreground mt-1">Active partnerships</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="glass-effect">
        <CardHeader>
          <CardTitle>Platform Value Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data?.platformValues?.map((platform: any) => (
              <div key={platform.platform} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                <div>
                  <p className="font-semibold capitalize">{platform.platform}</p>
                  <p className="text-sm text-muted-foreground">
                    {platform.followers.toLocaleString()} followers
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold">{formatCurrency(platform.valuePerPost)}</p>
                  <p className="text-xs text-muted-foreground">per post</p>
                </div>
              </div>
            ))}
          </div>

          {(!data?.platformValues || data.platformValues.length === 0) && (
            <div className="text-center py-12 text-muted-foreground">
              Connect your social accounts to see platform value breakdown
            </div>
          )}
        </CardContent>
      </Card>

      {/* Account Value Calculator */}
      <Card className="glass-effect">
        <CardHeader>
          <CardTitle>Account Value Calculator</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Your account value is estimated based on:
          </p>
          <ul className="space-y-2 text-sm">
            <li className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2" />
              <span>Follower counts across all platforms</span>
            </li>
            <li className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2" />
              <span>Average engagement rates (likes, comments, shares)</span>
            </li>
            <li className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2" />
              <span>Content type performance (photos, videos, stories)</span>
            </li>
            <li className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2" />
              <span>Industry benchmarks and market rates</span>
            </li>
          </ul>
        </CardContent>
      </Card>

      {/* Past Collaboration ROI */}
      <div className="space-y-4">
        <div>
          <h3 className="text-xl font-semibold">Past Collaboration ROI</h3>
          <p className="text-sm text-muted-foreground">
            Demonstrate the value you've delivered to past partners
          </p>
        </div>
        <ROIDemonstrator userId={userId} />
      </div>
    </div>
  );
};