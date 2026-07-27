import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Bell, Edit } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useBrandDashboardCounts } from "@/hooks/useBrandDashboardCounts";
import BrandDashboardSidebar from "./BrandDashboardSidebar";
import BrandProfileOverview from "./BrandProfileOverview";
import BrandCampaignsManager from "./BrandCampaignsManager";
import BrandApplicationsManager from "./BrandApplicationsManager";
import BrandCollaborationsManager from "./BrandCollaborationsManager";
import BrandContentManager from "./BrandContentManager";
import BrandAnalyticsDashboard from "./BrandAnalyticsDashboard";
import BrandProfileSettings from "./BrandProfileSettings";
import MessageInbox from "../messaging/MessageInbox";
import HelpSupportModal from "../support/HelpSupportModal";

import ReviewsList from "../reviews/ReviewsList";
import { useToast } from "@/hooks/use-toast";

interface BrandProfileProps {
  profile: any;
  initialTab?: string;
  onProfileUpdated: () => void;
}

const BrandProfile = ({ profile, initialTab, onProfileUpdated }: BrandProfileProps) => {
  const [activeTab, setActiveTab] = useState(initialTab || "overview");
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const { toast } = useToast();
  const dashboardCounts = useBrandDashboardCounts(profile?.id);

  // Safety check for brand data
  const brandData = profile.brands?.[0];
  if (!brandData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <p className="text-lg text-muted-foreground">Please complete your brand profile setup...</p>
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
    }
  };

  const getPageTitle = (tab: string) => {
    const titles: Record<string, string> = {
      overview: "Dashboard Overview",
      campaigns: "Campaigns",
      applications: "Applications",
      messages: "Messages",
      collaborations: "Collaborations",
      content: "Content Management",
      analytics: "Analytics",
      
      reviews: "Reviews",
      settings: "Settings",
      help: "Help & Support",
    };
    return titles[tab] || "Dashboard";
  };

  return (
    <SidebarProvider defaultOpen={!isMobile}>
      <div className="flex min-h-screen w-full">
        <BrandDashboardSidebar
          profile={profile}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onLogout={handleLogout}
          dashboardCounts={dashboardCounts}
        />

        <main className="flex-1 flex flex-col">
          {/* Top Bar */}
          <header className="border-b sticky top-0 z-40 bg-background">
            <div className="flex items-center gap-4 px-6 py-4">
              <SidebarTrigger />
              <div className="flex-1">
                <h1 className="text-2xl font-bold">{getPageTitle(activeTab)}</h1>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setActiveTab("settings")}
                >
                  <Edit className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="icon">
                  <Bell className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </header>

          {/* Content Area */}
          <div className="flex-1 p-6">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsContent value="overview">
                <BrandProfileOverview profile={profile} onTabChange={setActiveTab} />
              </TabsContent>

              <TabsContent value="campaigns">
                <BrandCampaignsManager profile={profile} />
              </TabsContent>

              <TabsContent value="applications">
                <BrandApplicationsManager profile={profile} />
              </TabsContent>

              <TabsContent value="messages">
                <MessageInbox userId={profile.id} />
              </TabsContent>

              <TabsContent value="collaborations">
                <BrandCollaborationsManager profile={profile} onTabChange={setActiveTab} />
              </TabsContent>

              <TabsContent value="content">
                <BrandContentManager profile={profile} />
              </TabsContent>

              <TabsContent value="analytics">
                <BrandAnalyticsDashboard profile={profile} />
              </TabsContent>


              <TabsContent value="reviews">
                <ReviewsList userId={profile.id} userType="host" />
              </TabsContent>

              <TabsContent value="settings">
                <BrandProfileSettings profile={profile} onProfileUpdated={onProfileUpdated} />
              </TabsContent>

              <TabsContent value="help">
                <div className="max-w-4xl">
                  <HelpSupportModal isOpen={true} onClose={() => setActiveTab("overview")} userType="brand" />
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default BrandProfile;
