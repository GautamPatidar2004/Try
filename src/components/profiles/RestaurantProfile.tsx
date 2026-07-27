import { useState, useEffect } from "react";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { useIsMobile } from "@/hooks/use-mobile";
import RestaurantProfileHeader from "./RestaurantProfileHeader";
import RestaurantProfileOverview from "./RestaurantProfileOverview";
import RestaurantLocationsManager from "./RestaurantLocationsManager";
import RestaurantBookingsManager from "./RestaurantBookingsManager";
import RestaurantProfileSettings from "./RestaurantProfileSettings";
import MessageInbox from "../messaging/MessageInbox";
import HelpSupportModal from "../support/HelpSupportModal";

import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

interface RestaurantProfileProps {
  profile: any;
  initialTab?: string;
  onProfileUpdated: () => void;
}

const RestaurantProfile = ({ profile, initialTab, onProfileUpdated }: RestaurantProfileProps) => {
  const [activeTab, setActiveTab] = useState(initialTab || "overview");
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Safety check for restaurant owner data
  const restaurantOwnerData = profile.restaurant_owners?.[0];
  if (!restaurantOwnerData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <p className="text-lg text-muted-foreground">Please complete your restaurant profile setup...</p>
        </div>
      </div>
    );
  }

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  const handleLogout = async () => {
    setLoading(true);
    try {
      await supabase.auth.signOut();
      navigate('/auth');
    } catch (error) {
      console.error('Logout error:', error);
      toast({
        title: "Error",
        description: "Failed to logout. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-muted">
      <RestaurantProfileHeader
        profile={profile}
        onEditProfile={() => setActiveTab('settings')}
        onHelp={() => setIsHelpOpen(true)}
        onLogout={handleLogout}
        onProfileUpdated={onProfileUpdated}
        loading={loading}
      />

      <div className={`mx-auto ${isMobile ? 'px-4 py-4' : 'max-w-7xl px-6 py-6'}`}>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">

          <TabsContent value="overview" className="space-y-6">
            <RestaurantProfileOverview profile={profile} />
          </TabsContent>

          <TabsContent value="locations" className="space-y-6">
            <RestaurantLocationsManager profile={profile} />
          </TabsContent>

          <TabsContent value="bookings" className="space-y-6">
            <RestaurantBookingsManager profile={profile} />
          </TabsContent>

          <TabsContent value="messages" className="space-y-6">
            <MessageInbox userId={profile.id} />
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <RestaurantProfileSettings profile={profile} onProfileUpdated={onProfileUpdated} />
          </TabsContent>
        </Tabs>
      </div>

      <HelpSupportModal
        isOpen={isHelpOpen}
        onClose={() => setIsHelpOpen(false)}
        userType="restaurant_owner"
      />
    </div>
  );
};

export default RestaurantProfile;
