import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Megaphone } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { BrandCampaignCard } from "@/components/brands/BrandCampaignCard";

interface BrandCampaignsManagerProps {
  profile: any;
}

const BrandCampaignsManager = ({ profile }: BrandCampaignsManagerProps) => {
  const navigate = useNavigate();

  const { data: userCampaigns, isLoading } = useQuery({
    queryKey: ['my-brand-campaigns', profile?.id],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from('brand_campaigns')
        .select('*')
        .eq('created_by', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as any[];
    },
    enabled: !!profile?.id,
  });

  const hasCampaigns = userCampaigns && userCampaigns.length > 0;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Campaign Management</h2>
        <Button onClick={() => navigate('/campaigns/create')}>
          <Plus className="w-4 h-4 mr-2" />
          Create Campaign
        </Button>
      </div>

      {isLoading ? (
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <p className="text-muted-foreground">Loading campaigns...</p>
          </CardContent>
        </Card>
      ) : hasCampaigns ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {userCampaigns.map((campaign) => (
            <BrandCampaignCard key={campaign.id} campaign={campaign} />
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Megaphone className="w-16 h-16 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">No campaigns yet</h3>
            <p className="text-muted-foreground text-center mb-6 max-w-md">
              Create your first campaign to start connecting with creators and growing your brand presence.
            </p>
            <Button onClick={() => navigate('/campaigns/create')}>
              <Plus className="w-4 h-4 mr-2" />
              Create Your First Campaign
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default BrandCampaignsManager;
