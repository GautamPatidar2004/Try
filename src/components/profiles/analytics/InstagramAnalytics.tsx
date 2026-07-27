import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Instagram, RefreshCw, CheckCircle2, AlertCircle, ExternalLink, Eye, TrendingUp, Users, Heart } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useInstagramInsights } from '@/hooks/useInstagramInsights';
import { InstagramOAuthConnect } from '@/components/social/InstagramOAuthConnect';
import { PortfolioMetricCard } from '@/components/marketplace/portfolio/shared/PortfolioMetricCard';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { format, parseISO } from 'date-fns';

interface InstagramAnalyticsProps {
  userId: string;
}

export const InstagramAnalytics = ({ userId }: InstagramAnalyticsProps) => {
  const [days, setDays] = useState(30);
  const [syncing, setSyncing] = useState(false);
  const { toast } = useToast();

  // Fetch connected Instagram account
  const { data: socialAccount, isLoading: accountLoading, refetch: refetchAccount } = useQuery({
    queryKey: ['instagram-account', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('social_accounts')
        .select('*')
        .eq('influencer_id', userId)
        .eq('platform', 'instagram')
        .maybeSingle();

      if (error) throw error;
      return data;
    },
  });

  // Fetch Instagram insights
  const { data: insights, isLoading: insightsLoading, refetch: refetchInsights } = useInstagramInsights(userId, days);

  const handleSync = async () => {
    if (!socialAccount) return;

    setSyncing(true);
    try {
      const { error } = await supabase.functions.invoke('sync-meta-analytics', {
        body: { 
          userId: userId,
          platform: 'instagram'
        },
      });

      if (error) throw error;

      toast({
        title: 'Analytics synced',
        description: 'Your Instagram analytics have been updated.',
      });

      refetchInsights();
      refetchAccount();
    } catch (error: any) {
      console.error('Sync error:', error);
      toast({
        title: 'Sync failed',
        description: error.message || 'Failed to sync Instagram analytics.',
        variant: 'destructive',
      });
    } finally {
      setSyncing(false);
    }
  };

  // Show OAuth connect if not connected
  if (!accountLoading && !socialAccount) {
    return (
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Instagram className="h-5 w-5" />
              Connect Instagram
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Connect your Instagram Business or Creator account to view detailed analytics.
            </p>
            <InstagramOAuthConnect
              influencerId={userId}
              connectedAccount={null}
              onConnected={refetchAccount}
            />
          </CardContent>
        </Card>
      </div>
    );
  }

  // Check token expiration
  const tokenExpiresAt = socialAccount?.token_expires_at ? new Date(socialAccount.token_expires_at) : null;
  const daysUntilExpiration = tokenExpiresAt 
    ? Math.ceil((tokenExpiresAt.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    : null;
  const tokenExpiringSoon = daysUntilExpiration !== null && daysUntilExpiration < 7;
  const tokenExpired = daysUntilExpiration !== null && daysUntilExpiration <= 0;

  if (accountLoading || insightsLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-32 w-full" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-32" />)}
        </div>
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  return (
    <div className="space-y-6">
      {/* Connection Status Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Instagram className="h-6 w-6 text-pink-500" />
              <div>
                <CardTitle className="flex items-center gap-2">
                  @{socialAccount?.username}
                  {socialAccount?.is_verified && (
                    <CheckCircle2 className="h-4 w-4 text-blue-500" />
                  )}
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  {formatNumber(socialAccount?.follower_count || 0)} followers
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={tokenExpired ? 'destructive' : tokenExpiringSoon ? 'secondary' : 'default'}>
                {tokenExpired ? 'Token Expired' : tokenExpiringSoon ? `Expires in ${daysUntilExpiration} days` : 'Connected'}
              </Badge>
              <Button
                onClick={handleSync}
                disabled={syncing || tokenExpired}
                size="sm"
                variant="outline"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${syncing ? 'animate-spin' : ''}`} />
                Sync Now
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span>Last synced: {socialAccount?.last_sync_at ? format(new Date(socialAccount.last_sync_at), 'PPp') : 'Never'}</span>
            {tokenExpiringSoon && !tokenExpired && (
              <div className="flex items-center gap-2 text-orange-500">
                <AlertCircle className="h-4 w-4" />
                <span>Please reconnect your account soon</span>
              </div>
            )}
            {tokenExpired && (
              <div className="flex items-center gap-2 text-destructive">
                <AlertCircle className="h-4 w-4" />
                <span>Token expired - please reconnect</span>
              </div>
            )}
          </div>
          {tokenExpired && (
            <div className="mt-4">
              <InstagramOAuthConnect
                influencerId={userId}
                connectedAccount={socialAccount}
                onConnected={refetchAccount}
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Date Range Selector */}
      <div className="flex justify-end">
        <Select value={days.toString()} onValueChange={(value) => setDays(Number(value))}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Select time period" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">Last 7 days</SelectItem>
            <SelectItem value="30">Last 30 days</SelectItem>
            <SelectItem value="90">Last 90 days</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Performance Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <PortfolioMetricCard
          icon={TrendingUp}
          label="Total Reach"
          value={formatNumber(insights?.comparison.reach.value || 0)}
          change={Number(insights?.comparison.reach.change.toFixed(1) || 0)}
        />
        <PortfolioMetricCard
          icon={Eye}
          label="Total Interactions"
          value={formatNumber(insights?.comparison.totalInteractions.value || 0)}
          change={Number(insights?.comparison.totalInteractions.change.toFixed(1) || 0)}
        />
        <PortfolioMetricCard
          icon={Users}
          label="Profile Views"
          value={formatNumber(insights?.comparison.profileViews.value || 0)}
          change={Number(insights?.comparison.profileViews.change.toFixed(1) || 0)}
        />
        <PortfolioMetricCard
          icon={Heart}
          label="Engagement Rate"
          value={`${insights?.comparison.engagementRate.value.toFixed(2) || 0}%`}
          change={Number(insights?.comparison.engagementRate.change.toFixed(1) || 0)}
        />
      </div>

      {/* Charts */}
      {insights?.daily && insights.daily.length > 1 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Reach & Impressions Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Reach & Impressions</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={insights.daily}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={(date) => format(parseISO(date), 'MM/dd')}
                    className="text-xs"
                  />
                  <YAxis className="text-xs" />
                  <Tooltip 
                    labelFormatter={(date) => format(parseISO(date as string), 'PPP')}
                    contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))' }}
                  />
                  <Legend />
                  <Line type="monotone" dataKey="reach" stroke="hsl(var(--primary))" strokeWidth={2} name="Reach" />
                  <Line type="monotone" dataKey="impressions" stroke="hsl(var(--secondary))" strokeWidth={2} name="Impressions" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Profile Views & Website Clicks */}
          <Card>
            <CardHeader>
              <CardTitle>Profile Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={insights.daily}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={(date) => format(parseISO(date), 'MM/dd')}
                    className="text-xs"
                  />
                  <YAxis className="text-xs" />
                  <Tooltip 
                    labelFormatter={(date) => format(parseISO(date as string), 'PPP')}
                    contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))' }}
                  />
                  <Legend />
                  <Bar dataKey="profile_views" fill="hsl(var(--primary))" name="Profile Views" />
                  <Bar dataKey="website_clicks" fill="hsl(var(--accent))" name="Website Clicks" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Engagement Rate Trend */}
          <Card>
            <CardHeader>
              <CardTitle>Engagement Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={insights.daily}>
                  <defs>
                    <linearGradient id="engagementGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={(date) => format(parseISO(date), 'MM/dd')}
                    className="text-xs"
                  />
                  <YAxis className="text-xs" />
                  <Tooltip 
                    labelFormatter={(date) => format(parseISO(date as string), 'PPP')}
                    formatter={(value: number) => [`${value.toFixed(2)}%`, 'Engagement Rate']}
                    contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))' }}
                  />
                  <Area type="monotone" dataKey="engagement_rate" stroke="hsl(var(--primary))" fillOpacity={1} fill="url(#engagementGradient)" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Follower Growth */}
          <Card>
            <CardHeader>
              <CardTitle>Follower Growth</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={insights.daily}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={(date) => format(parseISO(date), 'MM/dd')}
                    className="text-xs"
                  />
                  <YAxis className="text-xs" />
                  <Tooltip 
                    labelFormatter={(date) => format(parseISO(date as string), 'PPP')}
                    contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))' }}
                  />
                  <Line type="monotone" dataKey="follower_count" stroke="hsl(var(--primary))" strokeWidth={2} name="Followers" />
                </LineChart>
              </ResponsiveContainer>
              <div className="mt-4 flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Growth in period:</span>
                <span className={`font-semibold ${insights.aggregated.followerGrowth >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {insights.aggregated.followerGrowth >= 0 ? '+' : ''}{formatNumber(insights.aggregated.followerGrowth)}
                  {' '}({insights.aggregated.followerGrowthPercent.toFixed(1)}%)
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <Card className="border-amber-200 bg-amber-50/50">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="rounded-full bg-amber-100 p-4 mb-4">
              <AlertCircle className="h-8 w-8 text-amber-600" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Building Your Analytics History</h3>
            <p className="text-muted-foreground text-center mb-2 max-w-md">
              {insights?.daily?.length === 0 
                ? "No analytics data found. Click 'Sync Now' to fetch your Instagram insights."
                : "We need at least 2 days of data to show trends. Keep syncing regularly to see your growth!"}
            </p>
            <p className="text-sm text-amber-600 mb-4">
              Charts will populate as we collect more daily data.
            </p>
            <Button onClick={handleSync} disabled={syncing} variant="outline" className="border-amber-300 hover:bg-amber-100">
              <RefreshCw className={`h-4 w-4 mr-2 ${syncing ? 'animate-spin' : ''}`} />
              Sync Analytics Now
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Recent Posts (if available) */}
      {insights?.latest?.total_posts && insights.latest.total_posts > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Recent Performance</CardTitle>
              <a
                href={`https://instagram.com/${socialAccount?.username}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-primary hover:underline flex items-center gap-1"
              >
                View on Instagram
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="text-center p-4 rounded-lg bg-muted">
                <p className="text-2xl font-bold">{insights.latest.total_posts}</p>
                <p className="text-sm text-muted-foreground">Recent Posts</p>
              </div>
              <div className="text-center p-4 rounded-lg bg-muted">
                <p className="text-2xl font-bold">{formatNumber(insights.latest.avg_engagement_per_post)}</p>
                <p className="text-sm text-muted-foreground">Avg. Engagement</p>
              </div>
              <div className="text-center p-4 rounded-lg bg-muted">
                <p className="text-2xl font-bold">{insights.latest.engagement_rate.toFixed(2)}%</p>
                <p className="text-sm text-muted-foreground">Engagement Rate</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
