import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Megaphone, Mail, Bell, FileText, BarChart3, Users, Workflow } from "lucide-react";
import { BroadcastNotificationComposer } from "./BroadcastNotificationComposer";
import { EmailCampaignComposer } from "./EmailCampaignComposer";
import { EnhancedTemplateEditor } from "./EnhancedTemplateEditor";
import { EnhancedCommunicationStats } from "./EnhancedCommunicationStats";
import { CampaignAnalytics } from "./CampaignAnalytics";
import { AutomationsList } from "./AutomationsList";
import { SavedSegmentsManager } from "./SavedSegmentsManager";
import { SegmentBuilder, SegmentFilters, useSegmentRecipientCount } from "./SegmentBuilder";
import { useCommunications } from "@/hooks/useCommunications";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const defaultFilters: SegmentFilters = {
  userType: "all",
  accountStatus: "all",
  isVerified: "all",
  accountTier: "all",
  engagementLevel: "all",
  location: "",
  lastLoginDays: "all",
  registeredAfter: undefined,
  registeredBefore: undefined,
};

export const CommunicationCenter = () => {
  const { campaigns, campaignsLoading } = useCommunications();
  const [activeTab, setActiveTab] = useState("overview");
  const [segmentFilters, setSegmentFilters] = useState<SegmentFilters>(defaultFilters);
  const { count: segmentCount, isLoading: segmentLoading } = useSegmentRecipientCount(segmentFilters);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "sent": return "bg-green-500/10 text-green-500";
      case "sending": return "bg-blue-500/10 text-blue-500";
      case "failed": return "bg-red-500/10 text-red-500";
      case "scheduled": return "bg-yellow-500/10 text-yellow-500";
      case "draft": return "bg-gray-500/10 text-gray-500";
      default: return "bg-gray-500/10 text-gray-500";
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Megaphone className="h-8 w-8" />
          Communication Center
        </h1>
        <p className="text-muted-foreground mt-1">
          CRM-style email campaigns, broadcasts, automations & analytics
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="w-full overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          <TabsList className="inline-flex w-max min-w-full">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <Megaphone className="h-4 w-4" />
              <span className="hidden sm:inline">Overview</span>
            </TabsTrigger>
            <TabsTrigger value="campaigns" className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              <span className="hidden sm:inline">Campaigns</span>
            </TabsTrigger>
            <TabsTrigger value="automations" className="flex items-center gap-2">
              <Workflow className="h-4 w-4" />
              <span className="hidden sm:inline">Automations</span>
            </TabsTrigger>
            <TabsTrigger value="templates" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              <span className="hidden sm:inline">Templates</span>
            </TabsTrigger>
            <TabsTrigger value="segments" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">Segments</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              <span className="hidden sm:inline">Analytics</span>
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Overview */}
        <TabsContent value="overview" className="space-y-6">
          <EnhancedCommunicationStats />
          <Card>
            <CardHeader>
              <CardTitle>Recent Campaigns</CardTitle>
              <CardDescription>Latest communication campaigns</CardDescription>
            </CardHeader>
            <CardContent>
              {campaignsLoading ? (
                <div className="text-center py-8 text-muted-foreground">Loading...</div>
              ) : campaigns && campaigns.length > 0 ? (
                <div className="space-y-3">
                  {campaigns.slice(0, 10).map((campaign) => (
                    <div
                      key={campaign.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium">{campaign.name}</h4>
                          <Badge variant="outline" className={getStatusColor(campaign.status)}>
                            {campaign.status}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            {campaign.type === "email" ? <Mail className="h-3 w-3" /> : <Bell className="h-3 w-3" />}
                            {campaign.type}
                          </span>
                          <span>{campaign.total_recipients} recipients</span>
                          {campaign.sent_at && (
                            <span>Sent {format(new Date(campaign.sent_at), "MMM d, yyyy")}</span>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium">
                          {campaign.successful_deliveries} / {campaign.total_recipients}
                        </div>
                        <div className="text-xs text-muted-foreground">delivered</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No campaigns yet. Create your first one!
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Campaigns */}
        <TabsContent value="campaigns" className="space-y-4">
          <Tabs defaultValue="email">
            <TabsList>
              <TabsTrigger value="email" className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Email
              </TabsTrigger>
              <TabsTrigger value="broadcast" className="flex items-center gap-2">
                <Bell className="h-4 w-4" />
                Broadcast
              </TabsTrigger>
            </TabsList>
            <TabsContent value="email">
              <EmailCampaignComposer />
            </TabsContent>
            <TabsContent value="broadcast">
              <BroadcastNotificationComposer />
            </TabsContent>
          </Tabs>
        </TabsContent>

        {/* Automations */}
        <TabsContent value="automations">
          <AutomationsList />
        </TabsContent>

        {/* Templates */}
        <TabsContent value="templates">
          <EnhancedTemplateEditor />
        </TabsContent>

        {/* Segments */}
        <TabsContent value="segments" className="space-y-4">
          <SegmentBuilder
            filters={segmentFilters}
            onFiltersChange={setSegmentFilters}
            recipientCount={segmentCount}
            isLoading={segmentLoading}
          />
          <SavedSegmentsManager
            currentFilters={segmentFilters}
            onLoadSegment={setSegmentFilters}
          />
        </TabsContent>

        {/* Analytics */}
        <TabsContent value="analytics">
          <CampaignAnalytics campaigns={campaigns} />
        </TabsContent>
      </Tabs>
    </div>
  );
};
