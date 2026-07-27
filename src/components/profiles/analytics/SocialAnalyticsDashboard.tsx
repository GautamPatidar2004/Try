import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Instagram, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle, 
  TrendingUp, 
  Users, 
  Eye, 
  Heart,
  BarChart3,
  Link2,
  Link2Off
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useQuery } from '@tanstack/react-query';
import { InstagramOAuthConnect } from '@/components/social/InstagramOAuthConnect';
import { InstagramAnalytics } from './InstagramAnalytics';
import { format } from 'date-fns';

interface SocialAnalyticsDashboardProps {
  userId: string;
}

export const SocialAnalyticsDashboard = ({ userId }: SocialAnalyticsDashboardProps) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [syncing, setSyncing] = useState(false);
  const { toast } = useToast();

  // Fetch all connected social accounts
  const { data: socialAccounts, isLoading, refetch } = useQuery({
    queryKey: ['social-accounts-analytics', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('social_accounts')
        .select('*')
        .eq('influencer_id', userId);

      if (error) throw error;
      return data || [];
    },
  });

  // Get Instagram account with OAuth
  const instagramAccount = socialAccounts?.find(
    (acc) => acc.platform === 'instagram' && acc.access_token
  );

  // Check URL params for connection status
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const connected = params.get('connected');
    const error = params.get('error');

    if (connected === 'instagram') {
      toast({
        title: 'Instagram Connected!',
        description: 'Your Instagram Business account has been successfully connected.',
      });
      refetch();
      // Clean URL
      window.history.replaceState({}, '', window.location.pathname);
    }

    if (error) {
      const errorMessages: Record<string, string> = {
        'token_exchange_failed': 'Failed to exchange authorization code. Please try again.',
        'no_facebook_page': 'No Facebook Page found. You need a Facebook Page linked to your Instagram.',
        'no_instagram_business': 'No Instagram Business Account found. Please convert to a Business or Creator account.',
        'profile_fetch_failed': 'Failed to fetch Instagram profile. Please try again.',
        'database_error': 'Failed to save account data. Please try again.',
      };

      toast({
        title: 'Connection Failed',
        description: errorMessages[error] || 'An unknown error occurred.',
        variant: 'destructive',
      });
      // Clean URL
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);

  const handleSyncAll = async () => {
    setSyncing(true);
    try {
      if (instagramAccount) {
        await supabase.functions.invoke('sync-meta-analytics', {
          body: { userId, platform: 'instagram' },
        });
      }
      toast({
        title: 'Sync Complete',
        description: 'All connected accounts have been synced.',
      });
      refetch();
    } catch (error: any) {
      toast({
        title: 'Sync Failed',
        description: error.message || 'Failed to sync analytics.',
        variant: 'destructive',
      });
    } finally {
      setSyncing(false);
    }
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  // Token status calculation
  const getTokenStatus = (account: any) => {
    if (!account?.token_expires_at) return { status: 'unknown', daysLeft: null };
    const expiresAt = new Date(account.token_expires_at);
    const daysLeft = Math.ceil((expiresAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    if (daysLeft <= 0) return { status: 'expired', daysLeft: 0 };
    if (daysLeft < 7) return { status: 'expiring', daysLeft };
    return { status: 'valid', daysLeft };
  };

  const instagramTokenStatus = instagramAccount ? getTokenStatus(instagramAccount) : null;

  return (
    <div className="space-y-6">
      {/* Dashboard Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Social Analytics</h2>
          <p className="text-muted-foreground">
            Track your performance across connected platforms
          </p>
        </div>
        <Button
          onClick={handleSyncAll}
          disabled={syncing || !instagramAccount}
          variant="outline"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${syncing ? 'animate-spin' : ''}`} />
          Sync All
        </Button>
      </div>

      {/* Platform Connection Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Instagram Status Card */}
        <Card className={instagramAccount ? 'border-pink-200 bg-pink-50/50 dark:bg-pink-950/20' : ''}>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Instagram className="h-5 w-5 text-pink-500" />
                <CardTitle className="text-lg">Instagram</CardTitle>
              </div>
              {instagramAccount ? (
                <Badge variant="default" className="bg-pink-500">
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  Connected
                </Badge>
              ) : (
                <Badge variant="secondary">
                  <Link2Off className="h-3 w-3 mr-1" />
                  Not Connected
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {instagramAccount ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">@{instagramAccount.username}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatNumber(instagramAccount.follower_count || 0)} followers
                    </p>
                  </div>
                  {instagramAccount.is_verified && (
                    <CheckCircle2 className="h-5 w-5 text-blue-500" />
                  )}
                </div>
                <div className="text-xs text-muted-foreground">
                  Last synced: {instagramAccount.last_sync_at 
                    ? format(new Date(instagramAccount.last_sync_at), 'MMM d, h:mm a')
                    : 'Never'}
                </div>
                {instagramTokenStatus?.status === 'expiring' && (
                  <div className="flex items-center gap-2 text-orange-500 text-sm">
                    <AlertCircle className="h-4 w-4" />
                    Token expires in {instagramTokenStatus.daysLeft} days
                  </div>
                )}
                {instagramTokenStatus?.status === 'expired' && (
                  <div className="flex items-center gap-2 text-destructive text-sm">
                    <AlertCircle className="h-4 w-4" />
                    Token expired - reconnect required
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  Connect your Instagram Business or Creator account to view analytics.
                </p>
                <InstagramOAuthConnect
                  influencerId={userId}
                  connectedAccount={null}
                  onConnected={refetch}
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* TikTok Status Card (Coming Soon) */}
        <Card className="opacity-60">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z"/>
                </svg>
                <CardTitle className="text-lg">TikTok</CardTitle>
              </div>
              <Badge variant="outline">Coming Soon</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              TikTok analytics integration will be available soon.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Analytics Tabs */}
      {instagramAccount && (
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="instagram" className="flex items-center gap-2">
              <Instagram className="h-4 w-4" />
              Instagram
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-6">
            {/* Quick Stats Overview */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2 text-muted-foreground mb-2">
                    <Users className="h-4 w-4" />
                    <span className="text-sm">Total Followers</span>
                  </div>
                  <p className="text-2xl font-bold">
                    {formatNumber(instagramAccount?.follower_count || 0)}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2 text-muted-foreground mb-2">
                    <TrendingUp className="h-4 w-4" />
                    <span className="text-sm">Engagement Rate</span>
                  </div>
                  <p className="text-2xl font-bold">
                    {(instagramAccount?.analytics_data as any)?.engagement_rate?.toFixed(2) || '0.00'}%
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2 text-muted-foreground mb-2">
                    <Eye className="h-4 w-4" />
                    <span className="text-sm">Avg. Reach</span>
                  </div>
                  <p className="text-2xl font-bold">
                    {formatNumber((instagramAccount?.analytics_data as any)?.reach || 0)}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2 text-muted-foreground mb-2">
                    <Heart className="h-4 w-4" />
                    <span className="text-sm">Avg. Likes</span>
                  </div>
                  <p className="text-2xl font-bold">
                    {formatNumber((instagramAccount?.analytics_data as any)?.avg_engagement_per_post || 0)}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Platform Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Connected Platforms Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {instagramAccount && (
                    <div className="flex items-center justify-between p-4 rounded-lg bg-gradient-to-r from-pink-50 to-purple-50 dark:from-pink-950/30 dark:to-purple-950/30 border border-pink-200 dark:border-pink-800">
                      <div className="flex items-center gap-3">
                        <Instagram className="h-8 w-8 text-pink-500" />
                        <div>
                          <p className="font-medium">@{instagramAccount.username}</p>
                          <p className="text-sm text-muted-foreground">
                            {formatNumber(instagramAccount.follower_count || 0)} followers • 
                            {(instagramAccount.analytics_data as any)?.media_count || 0} posts
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setActiveTab('instagram')}
                      >
                        View Details
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="instagram" className="mt-6">
            <InstagramAnalytics userId={userId} />
          </TabsContent>
        </Tabs>
      )}

      {/* Empty state when no accounts connected */}
      {!instagramAccount && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <BarChart3 className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Analytics Available</h3>
            <p className="text-muted-foreground text-center mb-4 max-w-md">
              Connect your social media accounts above to start tracking your performance metrics and insights.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
