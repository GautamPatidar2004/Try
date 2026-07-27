import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import BrandCampaignsList from "@/components/campaigns/BrandCampaignsList";
import { Button } from "@/components/ui/button";
import { Plus, Loader2 } from "lucide-react";

const BrandCampaignsDashboard = () => {
  const navigate = useNavigate();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) navigate("/auth");
      else setChecking(false);
    });
  }, [navigate]);

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 sm:py-12">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">My Campaigns</h1>
            <p className="text-muted-foreground mt-1">Track and manage your brand campaigns.</p>
          </div>
          <Button asChild variant="premium">
            <Link to="/campaigns/create"><Plus className="mr-2 h-4 w-4" /> New Campaign</Link>
          </Button>
        </div>
        <BrandCampaignsList />
      </div>
    </div>
  );
};

export default BrandCampaignsDashboard;
