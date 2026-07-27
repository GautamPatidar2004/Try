import { useEffect, useState } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Loader2 } from "lucide-react";

const CampaignConfirmation = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const campaignId = searchParams.get("campaign_id");
  const [campaign, setCampaign] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCampaign = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { navigate("/auth"); return; }

      if (campaignId) {
        const { data } = await supabase
          .from('brand_campaigns')
          .select('campaign_title, total_budget, payment_status, status')
          .eq('id', campaignId)
          .eq('created_by', user.id)
          .single();
        if (data) setCampaign(data);
      }
      setLoading(false);
    };
    fetchCampaign();
  }, [campaignId, navigate]);

  const formatCents = (cents: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(cents / 100);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <Card className="max-w-lg w-full">
        <CardContent className="pt-8 pb-8 text-center space-y-6">
          <div className="flex justify-center">
            <CheckCircle2 className="h-16 w-16 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Campaign Submitted!</h1>
            {campaign && (
              <p className="text-lg text-muted-foreground mt-1">{campaign.campaign_title}</p>
            )}
          </div>
          {campaign?.total_budget && (
            <p className="text-xl font-semibold text-foreground">{formatCents(campaign.total_budget)}</p>
          )}
          <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-200 text-sm px-4 py-1">
            Under Review
          </Badge>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            Our team will review your campaign and begin matching you with creators within 24-48 hours. 
            You'll receive an email once your campaign is live.
          </p>
          <Button asChild variant="premium">
            <Link to="/dashboard/campaigns">View My Campaigns</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default CampaignConfirmation;
