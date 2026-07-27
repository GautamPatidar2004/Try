import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Instagram, CheckCircle2, Loader2, RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

interface InstagramOAuthConnectProps {
  influencerId: string;
  connectedAccount?: any;
  onConnected: () => void;
}

export const InstagramOAuthConnect = ({ 
  influencerId, 
  connectedAccount,
  onConnected 
}: InstagramOAuthConnectProps) => {
  const [connecting, setConnecting] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [oauthError, setOauthError] = useState<string | null>(null);
  const { toast } = useToast();

  // Check for OAuth errors in URL params
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const error = params.get('error');
    
    if (error) {
      const errorMessages: Record<string, string> = {
        'token_exchange_failed': 'Failed to exchange authorization code. Please try again.',
        'no_facebook_page': 'No Facebook Page found. Please create a Facebook Page and link your Instagram Business Account to it.',
        'no_instagram_business': 'No Instagram Business Account found. Please convert your Instagram account to a Business or Creator account and link it to your Facebook Page.',
        'profile_fetch_failed': 'Failed to fetch Instagram profile. Please check your permissions and try again.',
        'database_error': 'Failed to save account data. Please try again.',
      };
      
      setOauthError(errorMessages[error] || 'An unexpected error occurred during authentication.');
      
      // Clear error from URL
      window.history.replaceState({}, '', window.location.pathname + '?tab=analytics');
    }
  }, []);

  const handleConnect = async () => {
    setConnecting(true);
    try {
      const { data, error } = await supabase.functions.invoke('connect-meta-analytics', {
        body: { 
          userId: influencerId,
          action: 'initiate'
        }
      });

      if (error) throw error;

      if (data?.authUrl) {
        // Redirect to Instagram authorization
        window.location.href = data.authUrl;
      }
    } catch (error: any) {
      console.error('Error initiating Instagram OAuth:', error);
      toast({
        title: "Connection Failed",
        description: error.message || "Failed to connect Instagram account",
        variant: "destructive",
      });
      setConnecting(false);
    }
  };

  const handleSync = async () => {
    setSyncing(true);
    try {
      const { error } = await supabase.functions.invoke('sync-meta-analytics', {
        body: { 
          userId: influencerId,
          platform: 'instagram'
        }
      });

      if (error) throw error;

      toast({
        title: "Synced Successfully",
        description: "Your Instagram analytics have been updated",
      });
      
      onConnected();
    } catch (error: any) {
      console.error('Error syncing Instagram:', error);
      toast({
        title: "Sync Failed",
        description: error.message || "Failed to sync Instagram data",
        variant: "destructive",
      });
    } finally {
      setSyncing(false);
    }
  };

  const handleDisconnect = async () => {
    try {
      const { error } = await supabase.functions.invoke('connect-meta-analytics', {
        body: { 
          userId: influencerId,
          platform: 'instagram',
          action: 'disconnect'
        }
      });

      if (error) throw error;

      toast({
        title: "Disconnected",
        description: "Instagram account has been disconnected",
      });
      
      onConnected();
    } catch (error: any) {
      console.error('Error disconnecting Instagram:', error);
      toast({
        title: "Error",
        description: "Failed to disconnect Instagram account",
        variant: "destructive",
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
              <Instagram className="w-8 h-8 text-pink-600" />
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold">Instagram</h3>
                  <Badge variant="default" className="bg-green-600">
                    <CheckCircle2 className="w-3 h-3 mr-1" />
                    OAuth Verified
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">@{connectedAccount.username}</p>
                <p className="text-sm font-medium text-foreground">
                  {connectedAccount.follower_count?.toLocaleString()} followers
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Last synced: {lastSync}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleSync}
                disabled={syncing}
              >
                {syncing ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4 mr-1" />
                    Sync Now
                  </>
                )}
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleDisconnect}
              >
                Disconnect
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-blue-200 bg-blue-50/50">
      <CardContent className="p-6">
        {oauthError && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {oauthError}
              {oauthError.includes('Facebook Page') && (
                <div className="mt-2">
                  <a 
                    href="https://www.facebook.com/pages/create" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="underline hover:no-underline"
                  >
                    Create a Facebook Page
                  </a>
                </div>
              )}
              {oauthError.includes('Business Account') && (
                <div className="mt-2">
                  <a 
                    href="https://help.instagram.com/502981923235522" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="underline hover:no-underline"
                  >
                    Convert to Business Account
                  </a>
                </div>
              )}
            </AlertDescription>
          </Alert>
        )}
        <div className="flex items-start gap-4">
          <Instagram className="w-12 h-12 text-pink-600 flex-shrink-0" />
          <div className="flex-1">
            <h3 className="font-semibold text-lg mb-2">Connect Instagram</h3>
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
                Access detailed analytics dashboard
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
                No manual updates needed
              </li>
            </ul>
            <Button 
              onClick={handleConnect}
              disabled={connecting}
              className="bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700"
            >
              {connecting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Connecting...
                </>
              ) : (
                <>
                  <Instagram className="w-4 h-4 mr-2" />
                  Connect with Instagram
                </>
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
