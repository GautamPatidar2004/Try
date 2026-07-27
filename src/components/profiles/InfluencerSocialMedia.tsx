import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Users, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import InfluencerSocialLinks from "./InfluencerSocialLinks";
import InfluencerSocialAccounts from "./InfluencerSocialAccounts";

interface InfluencerSocialMediaProps {
  influencerId: string;
  onUpdated: () => void;
}

const InfluencerSocialMedia = ({ influencerId, onUpdated }: InfluencerSocialMediaProps) => {
  const [totalFollowers, setTotalFollowers] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchTotalFollowers();
  }, [influencerId]);

  const fetchTotalFollowers = async () => {
    try {
      const { data, error } = await supabase
        .from('influencers')
        .select('total_followers')
        .eq('id', influencerId)
        .maybeSingle();

      if (error) {
        console.error('Error fetching total followers:', error);
      }
      setTotalFollowers(data?.total_followers || 0);
    } catch (error) {
      console.error('Error fetching total followers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveTotalFollowers = async () => {
    if (totalFollowers < 0) {
      toast({
        title: "Invalid Input",
        description: "Total followers must be a positive number",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase
        .from('influencers')
        .update({ total_followers: totalFollowers })
        .eq('id', influencerId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Total followers updated successfully",
      });
      onUpdated();
    } catch (error) {
      console.error('Error updating total followers:', error);
      toast({
        title: "Error",
        description: "Failed to update total followers",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Total Followers Section */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Total Followers
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="totalFollowers">
                Total Followers Across All Platforms
              </Label>
              <div className="flex gap-2">
                <Input
                  id="totalFollowers"
                  type="number"
                  min="0"
                  value={totalFollowers}
                  onChange={(e) => setTotalFollowers(parseInt(e.target.value) || 0)}
                  placeholder="e.g., 125000"
                  className="flex-1"
                />
                <Button 
                  onClick={handleSaveTotalFollowers} 
                  disabled={saving}
                  className="min-w-[100px]"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving
                    </>
                  ) : (
                    'Save'
                  )}
                </Button>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              This number will be displayed in your profile stats and helps hosts find you
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Social Media Profile Links */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle>Social Media Profile Links</CardTitle>
        </CardHeader>
        <CardContent>
          <InfluencerSocialLinks 
            influencerId={influencerId} 
            onUpdated={onUpdated} 
          />
        </CardContent>
      </Card>

      {/* Detailed Social Accounts */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle>Social Accounts Management</CardTitle>
        </CardHeader>
        <CardContent>
          <InfluencerSocialAccounts 
            influencerId={influencerId} 
            onUpdated={onUpdated} 
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default InfluencerSocialMedia;
