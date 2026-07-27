import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { RefreshCw } from 'lucide-react';
import { useState } from 'react';

interface SyncBadgesButtonProps {
  userId: string;
  onSyncComplete: () => void;
}

export const SyncBadgesButton = ({ userId, onSyncComplete }: SyncBadgesButtonProps) => {
  const [isSyncing, setIsSyncing] = useState(false);

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      const { data, error } = await supabase.rpc('sync_user_badges', {
        p_user_id: userId
      });

      if (error) throw error;

      const result = data as {
        badges_awarded: number;
        total_points: number;
        applications: number;
        content_posts: number;
        social_accounts: number;
        collaborations: number;
        reviews: number;
      };

      if (result.badges_awarded > 0) {
        toast.success(`🎉 Synced! ${result.badges_awarded} badges awarded with ${result.total_points} total points!`);
      } else {
        toast.info('All badges are up to date!');
      }

      onSyncComplete();
    } catch (error) {
      console.error('Error syncing badges:', error);
      toast.error('Failed to sync badges');
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <Button
      onClick={handleSync}
      disabled={isSyncing}
      variant="outline"
      size="sm"
      className="gap-2"
    >
      <RefreshCw className={`h-4 w-4 ${isSyncing ? 'animate-spin' : ''}`} />
      {isSyncing ? 'Syncing...' : 'Sync Badges'}
    </Button>
  );
};
