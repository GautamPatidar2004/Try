import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { Edit, Bell } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import CreatorDashboardSidebar from "./CreatorDashboardSidebar";
import CreatorProfileOverview from "./CreatorProfileOverview";
import InfluencerProfileSettings from "./InfluencerProfileSettings";
import InfluencerSocialMedia from "./InfluencerSocialMedia";
import InfluencerApplications from "./InfluencerApplications";
import ContentUpload from "./ContentUpload";
import MessageInbox from "../messaging/MessageInbox";
import { InfluencerSubscriptionTab } from "./InfluencerSubscriptionTab";
import CollaborationsList from "../reviews/CollaborationsList";
import ReviewsList from "../reviews/ReviewsList";
import { BadgesGrid } from "../badges/BadgesGrid";
import HelpSupportModal from "../support/HelpSupportModal";
import { EnhancedAnalyticsDashboard } from "./analytics/EnhancedAnalyticsDashboard";
import CreatorPostsManagement from "./CreatorPostsManagement";
import { useFollows } from "@/hooks/useFollows";
import { AmbassadorDashboard } from "../ambassador/AmbassadorDashboard";
import { useCreatorDashboardCounts } from "@/hooks/useCreatorDashboardCounts";
import MobileProfileBottomNav from "./MobileProfileBottomNav";
import CreatorAffiliateSection from "../creator/affiliate/CreatorAffiliateSection";
import { MediaKitGenerator } from "./analytics/MediaKitGenerator";

interface ModernInfluencerProfileProps {
  profile: any;
  applications: any[];
  initialTab?: string;
  onProfileUpdated: () => void;
}

const ModernInfluencerProfile = ({ profile, applications, initialTab, onProfileUpdated }: ModernInfluencerProfileProps) => {
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(initialTab || searchParams.get('tab') || "overview");
  const [conversationId, setConversationId] = useState<string | undefined>(searchParams.get('conversation') || undefined);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const { followerCount, followingCount } = useFollows(profile.id);
  const dashboardCounts = useCreatorDashboardCounts(profile.id);

  // Update active tab when URL parameter changes
  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
    const tabParam = searchParams.get('tab');
    const convParam = searchParams.get('conversation');
    if (tabParam) {
      setActiveTab(tabParam);
    }
    if (convParam) {
      setConversationId(convParam);
    }
  }, [initialTab, searchParams]);

  // Safety check for influencer data
  const influencerData = profile.influencers?.[0];
  if (!influencerData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <p className="text-lg text-muted-foreground">Please complete your creator profile setup...</p>
        </div>
      </div>
    );
  }

  const handleLogout = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      localStorage.clear();
      window.location.href = '/';
    } catch (error: any) {
      console.error("Logout error:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to logout. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getPageTitle = (tab: string) => {
    const titles: Record<string, string> = {
      overview: "Dashboard Overview",
      content: "Content Upload",
      applications: "My Applications",
      messages: "Messages",
      collaborations: "Collaborations",
      reviews: "Reviews",
      mediakit: "Media Kit",
      analytics: "Analytics",
      posts: "My Posts",
      social: "Social Media",
      badges: "Badges",
      affiliate: "Affiliate Earnings",
      ambassador: "Ambassador Program",
      subscription: "Subscription",
      settings: "Settings",
      help: "Help & Support",
    };
    return titles[tab] || "Dashboard";
  };

  return (
    <SidebarProvider defaultOpen={!isMobile}>
      <div className="flex min-h-screen w-full bg-background">
        <CreatorDashboardSidebar
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
                <h1 className="text-lg md:text-2xl font-bold">
                  {getPageTitle(activeTab)}
                </h1>
              </div>
              <div className="flex items-center gap-1 md:gap-2">
                <Button variant="ghost" size="icon" onClick={() => setActiveTab("settings")} className="h-9 w-9 md:h-10 md:w-10">
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
                <CreatorProfileOverview 
                  applicationsCount={applications.length}
                  activeCollaborations={dashboardCounts.activeCollaborations}
                  pendingApplications={dashboardCounts.pendingApplications}
                  userId={profile.id}
                />
              </TabsContent>
              
              <TabsContent value="content">
                <ContentUpload influencerId={profile.id} applications={applications} />
              </TabsContent>
              
              <TabsContent value="applications">
                <InfluencerApplications 
                  influencerId={profile.id}
                />
              </TabsContent>
              
              <TabsContent value="messages">
                <MessageInbox userId={profile.id} initialConversationId={conversationId} />
              </TabsContent>
              
              <TabsContent value="collaborations">
                <CollaborationsList userId={profile.id} userType="influencer" />
              </TabsContent>
              
              <TabsContent value="reviews">
                <ReviewsList userId={profile.id} userType="influencer" />
              </TabsContent>
              
              <TabsContent value="mediakit">
                <MediaKitGenerator
                  userId={profile.id}
                  defaultTitle={`${profile.first_name} ${profile.last_name}`}
                  defaultBio={influencerData?.bio}
                  defaultAvatarUrl={profile.profile_photo_url}
                />
              </TabsContent>

              <TabsContent value="analytics">
                <EnhancedAnalyticsDashboard userId={profile.id} />
              </TabsContent>
              
              <TabsContent value="posts">
                <CreatorPostsManagement influencerId={profile.id} />
              </TabsContent>
              
              <TabsContent value="social">
                <InfluencerSocialMedia 
                  influencerId={profile.id} 
                  onUpdated={onProfileUpdated} 
                />
              </TabsContent>
              
              <TabsContent value="badges">
                <BadgesGrid userId={profile.id} />
              </TabsContent>
              
              <TabsContent value="affiliate">
                <CreatorAffiliateSection />
              </TabsContent>
              
              <TabsContent value="ambassador">
                <AmbassadorDashboard />
              </TabsContent>
              
              <TabsContent value="subscription">
                <InfluencerSubscriptionTab />
              </TabsContent>
              
              <TabsContent value="settings">
                <InfluencerProfileSettings 
                  profile={profile} 
                  onProfileUpdated={onProfileUpdated} 
                />
              </TabsContent>
              
              <TabsContent value="help">
                <HelpSupportModal 
                  isOpen={true} 
                  onClose={() => setActiveTab("overview")} 
                  userType="influencer" 
                />
              </TabsContent>
            </Tabs>
          </div>
        </main>

        {/* Mobile Bottom Navigation */}
        {isMobile && (
          <MobileProfileBottomNav
            activeTab={activeTab}
            onTabChange={setActiveTab}
            userType="influencer"
          />
        )}
      </div>
    </SidebarProvider>
  );
};

export default ModernInfluencerProfile;
