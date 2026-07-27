import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Instagram, Link2, RefreshCw, Unlink } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface ConnectMetaButtonProps {
  userId: string;
  isConnected: boolean;
  lastSyncAt?: string;
  onConnect: () => void;
}

export const ConnectMetaButton = ({
  userId,
  isConnected,
  lastSyncAt,
  onConnect,
}: ConnectMetaButtonProps) => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleConnect = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('connect-meta-analytics/initiate', {
        body: { userId },
      });

      if (error) throw error;

      // Open OAuth flow in current window
      window.location.href = data.authUrl;
    } catch (error) {
      console.error('Error connecting:', error);
      toast({
        title: "Connection Failed",
        description: "Could not connect to Instagram. Please try again.",
        variant: "destructive",
      });
      setLoading(false);
    }
  };

  const handleDisconnect = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.functions.invoke('connect-meta-analytics/disconnect', {
        body: { userId, platform: 'instagram' },
      });

      if (error) throw error;

      toast({
        title: "Disconnected",
        description: "Instagram account has been disconnected.",
      });
      
      onConnect();
    } catch (error) {
      console.error('Error disconnecting:', error);
      toast({
        title: "Disconnect Failed",
        description: "Could not disconnect Instagram. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSync = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('sync-meta-analytics', {
        body: { userId, platform: 'instagram' },
      });

      if (error) throw error;

      toast({
        title: "Sync Complete",
        description: "Your Instagram analytics have been updated.",
      });
      
      onConnect();
    } catch (error) {
      console.error('Error syncing:', error);
      toast({
        title: "Sync Failed",
        description: error.message || "Could not sync analytics.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Instagram className="w-8 h-8 text-pink-500" />
          <div>
            <h3 className="font-semibold">Instagram Analytics</h3>
            <p className="text-sm text-muted-foreground">
              {isConnected
                ? lastSyncAt
                  ? `Last synced: ${new Date(lastSyncAt).toLocaleDateString()}`
                  : 'Connected'
                : 'Connect to sync your Instagram analytics'}
            </p>
          </div>
        </div>
        
        <div className="flex gap-2">
          {isConnected ? (
            <>
              <Button onClick={handleSync} disabled={loading} variant="outline">
                <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Sync Now
              </Button>
              <Button onClick={handleDisconnect} disabled={loading} variant="ghost">
                <Unlink className="w-4 h-4 mr-2" />
                Disconnect
              </Button>
            </>
          ) : (
            <Button onClick={handleConnect} disabled={loading}>
              <Link2 className="w-4 h-4 mr-2" />
              Connect
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
};
