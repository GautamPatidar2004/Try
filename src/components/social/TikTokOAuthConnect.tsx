import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle2, Loader2, RefreshCw, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface TikTokOAuthConnectProps {
  influencerId: string;
  connectedAccount?: any;
  onConnected: () => void;
}

const TikTokIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1v-3.52a6.37 6.37 0 0 0-.79-.05A6.34 6.34 0 0 0 3.15 15.2a6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.34-6.34V8.56a8.28 8.28 0 0 0 4.76 1.5V6.69h-1z"/>
  </svg>
);

export const TikTokOAuthConnect = ({
  influencerId,
  connectedAccount,
  onConnected,
}: TikTokOAuthConnectProps) => {
  const [connecting, setConnecting] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [oauthError, setOauthError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const error = params.get('error');

    if (error?.startsWith('tiktok_')) {
      const errorMessages: Record<string, string> = {
        'tiktok_token_exchange_failed': 'Failed to exchange authorization code. Please try again.',
        'tiktok_profile_fetch_failed': 'Failed to fetch TikTok profile. Please check your permissions and try again.',
        'tiktok_scope_not_authorized': 'TikTok did not grant the required permissions (scope). Please re-connect and accept all permissions, or contact support if your app is not approved for analytics scopes.',
        'tiktok_database_error': 'Failed to save account data. Please try again.',
        'tiktok_access_denied': 'You denied access to your TikTok account.',
      };

      setOauthError(errorMessages[error] || 'An unexpected error occurred during TikTok authentication.');
      window.history.replaceState({}, '', window.location.pathname + '?tab=analytics');
    }
  }, []);

  const handleConnect = async () => {
    const inIframe = (() => {
      try {
        return window.self !== window.top;
      } catch {
        return true;
      }
    })();

    setConnecting(true);
    try {
      const { data, error } = await supabase.functions.invoke('connect-tiktok-analytics', {
        body: {
          userId: influencerId,
          action: 'initiate',
          returnTo: `${window.location.origin}/profile?tab=analytics`,
        },
      });

      if (error) throw error;

      if (data?.authUrl) {
        if (inIframe) {
          const popup = window.open(
            data.authUrl,
            'tiktok_oauth',
            'width=500,height=650,noopener,noreferrer'
          );

          if (!popup) {
            toast({
              title: 'Popup blocked',
              description: 'Please allow popups to connect your TikTok account.',
              variant: 'destructive',
            });
            return;
          }

          toast({
            title: 'Finish connecting in the popup',
            description: 'Once complete, come back here and click refresh/sync if needed.',
          });
        } else {
          window.location.href = data.authUrl;
        }
      }
    } catch (error: any) {
      console.error('Error initiating TikTok OAuth:', error);
      toast({
        title: 'Connection Failed',
        description: error.message || 'Failed to connect TikTok account',
        variant: 'destructive',
      });
    } finally {
      setConnecting(false);
    }
  };

  const handleSync = async () => {
    setSyncing(true);
    try {
      const { error } = await supabase.functions.invoke('sync-tiktok-analytics', {
        body: { userId: influencerId },
      });

      if (error) throw error;

      toast({
        title: 'Synced Successfully',
        description: 'Your TikTok analytics have been updated',
      });

      onConnected();
    } catch (error: any) {
      console.error('Error syncing TikTok:', error);
      toast({
        title: 'Sync Failed',
        description: error.message || 'Failed to sync TikTok data',
        variant: 'destructive',
      });
    } finally {
      setSyncing(false);
    }
  };

  const handleDisconnect = async () => {
    try {
      const { error } = await supabase.functions.invoke('connect-tiktok-analytics', {
        body: { userId: influencerId, action: 'disconnect' },
      });

      if (error) throw error;

      toast({
        title: 'Disconnected',
        description: 'TikTok account has been disconnected',
      });

      onConnected();
    } catch (error: any) {
      console.error('Error disconnecting TikTok:', error);
      toast({
        title: 'Error',
        description: 'Failed to disconnect TikTok account',
        variant: 'destructive',
      });
    }
  };

  if (connectedAccount) {
    const lastSync = connectedAccount.last_sync_at
      ? new Date(connectedAccount.last_sync_at).toLocaleString()
      : 'Never';

    return (
      <Card className="border-green-200 bg-green-50/50">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <TikTokIcon className="w-8 h-8" />
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold">TikTok</h3>
                  <Badge variant="default" className="bg-green-600">
                    <CheckCircle2 className="w-3 h-3 mr-1" />
                    OAuth Verified
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">@{connectedAccount.username}</p>
                <p className="text-sm font-medium text-foreground">
                  {connectedAccount.follower_count?.toLocaleString()} followers
                </p>
                <p className="text-xs text-muted-foreground mt-1">Last synced: {lastSync}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" onClick={handleSync} disabled={syncing}>
                {syncing ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4 mr-1" />
                    Sync Now
                  </>
                )}
              </Button>
              <Button variant="destructive" size="sm" onClick={handleDisconnect}>
                Disconnect
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border bg-muted/30">
      <CardContent className="p-6">
        {oauthError && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{oauthError}</AlertDescription>
          </Alert>
        )}
        <div className="flex items-start gap-4">
          <TikTokIcon className="w-12 h-12 flex-shrink-0" />
          <div className="flex-1">
            <h3 className="font-semibold text-lg mb-2">Connect TikTok</h3>
            <p className="text-sm text-muted-foreground mb-3">
              Get verified follower counts and automatic analytics sync
            </p>
            <ul className="text-sm text-muted-foreground space-y-2 mb-4">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
                Automatically sync follower counts
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
                Show verified badge on your profile
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
                Track likes, videos, and engagement
              </li>
            </ul>
            <Button
              onClick={handleConnect}
              disabled={connecting}
              className="bg-black hover:bg-black/80 text-white"
            >
              {connecting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Connecting...
                </>
              ) : (
                <>
                  <TikTokIcon className="w-4 h-4 mr-2" />
                  Connect with TikTok
                </>
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
