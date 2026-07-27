import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { InstagramOAuthConnect } from "@/components/social/InstagramOAuthConnect";
import { TikTokOAuthConnect } from "@/components/social/TikTokOAuthConnect";
import { SocialAccount } from "@/types/social-accounts";

interface InfluencerSocialAccountsProps {
  influencerId: string;
  onUpdated: () => void;
}

const InfluencerSocialAccounts = ({ influencerId, onUpdated }: InfluencerSocialAccountsProps) => {
  const [accounts, setAccounts] = useState<SocialAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchSocialAccounts();
  }, [influencerId]);

  const fetchSocialAccounts = async () => {
    try {
      const { data, error } = await supabase
        .from('social_accounts')
        .select('*')
        .eq('influencer_id', influencerId);

      if (error) throw error;
      setAccounts(data || []);
    } catch (error) {
      console.error('Error fetching social accounts:', error);
      toast({
        title: "Error",
        description: "Failed to load social accounts",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div>Loading social accounts...</div>;
  }

  const instagramAccount = accounts.find((acc: any) => acc.platform === 'instagram' && acc.access_token);
  const tiktokAccount = accounts.find((acc: any) => acc.platform === 'tiktok' && acc.access_token);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Social Media Accounts</h2>

      <InstagramOAuthConnect
        influencerId={influencerId}
        connectedAccount={instagramAccount}
        onConnected={() => {
          fetchSocialAccounts();
          onUpdated();
        }}
      />

      <TikTokOAuthConnect
        influencerId={influencerId}
        connectedAccount={tiktokAccount}
        onConnected={() => {
          fetchSocialAccounts();
          onUpdated();
        }}
      />
    </div>
  );
};

export default InfluencerSocialAccounts;
