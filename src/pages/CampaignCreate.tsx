import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import CampaignCreateForm from "@/components/campaigns/CampaignCreateForm";
import { Loader2 } from "lucide-react";

const CampaignCreate = () => {
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
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Create a Campaign</h1>
          <p className="text-muted-foreground mt-1">Set up your brand campaign and get matched with top creators.</p>
        </div>
        <CampaignCreateForm />
      </div>
    </div>
  );
};

export default CampaignCreate;
