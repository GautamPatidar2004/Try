import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Bell, Edit } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useFollows } from "@/hooks/useFollows";
import { useHostDashboardCounts } from "@/hooks/useHostDashboardCounts";
import HostDashboardSidebar from "./HostDashboardSidebar";
import HostProfileOverview from "./HostProfileOverview";
import HostProperties from "./HostProperties";
import HostApplications from "./HostApplications";
import HostProfileSettings from "./HostProfileSettings";
import HelpSupportModal from "../support/HelpSupportModal";

import MessageInbox from "../messaging/MessageInbox";
import CollaborationsList from "../reviews/CollaborationsList";
import ReviewsList from "../reviews/ReviewsList";
import { BadgesGrid } from "../badges/BadgesGrid";
import { EnhancedAnalyticsDashboard } from "./analytics/EnhancedAnalyticsDashboard";
import InfluencerSocialMedia from "./InfluencerSocialMedia";
import { InfluencerSubscriptionTab } from "./InfluencerSubscriptionTab";
import MobileProfileBottomNav from "./MobileProfileBottomNav";
 import HostContentPortfolio from "./HostContentPortfolio";

interface HostProfileProps {
  profile: any;
  initialTab?: string;
  onProfileUpdated: () => void;
}

const HostProfile = ({ profile, initialTab, onProfileUpdated }: HostProfileProps) => {
  const [activeTab, setActiveTab] = useState(initialTab || "overview");
  const [showHelp, setShowHelp] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const { followerCount, followingCount } = useFollows(profile.id);
  const dashboardCounts = useHostDashboardCounts(profile.id);
  const [propertiesCount, setPropertiesCount] = useState(0);

  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUserId(user?.id || null);
    };
    getCurrentUser();
  }, []);

  useEffect(() => {
    const fetchPropertiesCount = async () => {
      const { count } = await supabase
        .from("properties")
        .select("*", { count: "exact", head: true })
        .eq("host_id", profile.id)
        .eq("is_active", true);
      
      setPropertiesCount(count || 0);
    };
    
    if (profile.id) {
      fetchPropertiesCount();
    }
  }, [profile.id]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  const getPageTitle = (tab: string) => {
    const titles: Record<string, string> = {
      overview: "Dashboard Overview",
      properties: "My Properties",
      applications: "Applications",
      messages: "Messages",
      collaborations: "Collaborations",
       content: "Content",
      reviews: "Reviews",
      analytics: "Analytics",
      social: "Social Media",
      
      badges: "Badges",
      settings: "Settings",
      help: "Help & Support",
      subscription: "Subscription",
    };
    return titles[tab] || "Dashboard";
  };

  return (
    <SidebarProvider defaultOpen={!isMobile}>
      <div className="flex min-h-screen w-full">
        <HostDashboardSidebar
          profile={profile}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onLogout={handleLogout}
          followerCount={followerCount}
          followingCount={followingCount}
          dashboardCounts={dashboardCounts}
        />

        <main className="flex-1 flex flex-col pb-20 md:pb-0">
          {/* Top Bar */}
          <header className="border-b sticky top-0 z-40 bg-background">
            <div className="flex items-center gap-3 md:gap-4 px-4 md:px-6 py-3 md:py-4">
              <SidebarTrigger className="hidden md:flex" />
              <div className="flex-1">
                <h1 className="text-lg md:text-2xl font-bold">{getPageTitle(activeTab)}</h1>
              </div>
              <div className="flex items-center gap-1 md:gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setActiveTab("settings")}
                  className="h-9 w-9 md:h-10 md:w-10"
                >
                  <Edit className="h-4 w-4 md:h-5 md:w-5" />
                </Button>
                <Button variant="ghost" size="icon" className="h-9 w-9 md:h-10 md:w-10">
                  <Bell className="h-4 w-4 md:h-5 md:w-5" />
                </Button>
              </div>
            </div>
          </header>

          {/* Content Area */}
          <div className="flex-1 p-4 md:p-6">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsContent value="overview">
                <HostProfileOverview 
                  propertiesCount={propertiesCount}
                  pendingApplications={dashboardCounts.pendingApplications}
                  activeCollaborations={dashboardCounts.activeCollaborations}
                />
              </TabsContent>

              <TabsContent value="properties">
                <HostProperties hostId={profile.id} />
              </TabsContent>


              <TabsContent value="messages">
                <MessageInbox userId={profile.id} />
              </TabsContent>

              <TabsContent value="applications">
                <HostApplications hostId={profile.id} />
              </TabsContent>

              <TabsContent value="collaborations">
                <CollaborationsList userId={profile.id} userType="host" />
              </TabsContent>

               <TabsContent value="content">
                 <HostContentPortfolio hostId={profile.id} />
               </TabsContent>

              <TabsContent value="reviews">
                <ReviewsList userId={profile.id} userType="host" />
              </TabsContent>

              <TabsContent value="badges">
                <BadgesGrid userId={profile.id} />
              </TabsContent>

              <TabsContent value="analytics">
                <EnhancedAnalyticsDashboard userId={profile.id} userType="host" />
              </TabsContent>

              <TabsContent value="social">
                <InfluencerSocialMedia influencerId={profile.id} onUpdated={onProfileUpdated} />
              </TabsContent>

              <TabsContent value="help">
                <div className="max-w-4xl">
                  <HelpSupportModal isOpen={true} onClose={() => setActiveTab("overview")} userType="host" />
                </div>
              </TabsContent>

              <TabsContent value="settings">
                <HostProfileSettings profile={profile} onProfileUpdated={onProfileUpdated} />
              </TabsContent>

              <TabsContent value="subscription">
                <InfluencerSubscriptionTab />
              </TabsContent>
            </Tabs>
          </div>
        </main>

        {/* Mobile Bottom Navigation */}
        {isMobile && (
          <MobileProfileBottomNav
            activeTab={activeTab}
            onTabChange={setActiveTab}
            userType="host"
          />
        )}
      </div>

      <HelpSupportModal isOpen={showHelp} onClose={() => setShowHelp(false)} />
    </SidebarProvider>
  );
};

export default HostProfile;
