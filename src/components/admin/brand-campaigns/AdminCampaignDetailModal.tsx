import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { useToggleCampaignStatus, useUpdateBrandCampaign } from "@/hooks/useBrandCampaignMutations";
import { useGetCampaignApplications } from "@/hooks/useBrandCampaignApplications";
import type { BrandCampaign } from "./AdminCampaignCard";
import { CampaignDetailsTab } from "./tabs/CampaignDetailsTab";
import { CampaignApplicationsTab } from "./tabs/CampaignApplicationsTab";
import { CampaignInviteTab } from "./tabs/CampaignInviteTab";
import { CampaignSettingsTab } from "./tabs/CampaignSettingsTab";
import { Play, Pause, XCircle } from "lucide-react";

interface AdminCampaignDetailModalProps {
  campaign: BrandCampaign | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDelete: (id: string) => void;
}

export const AdminCampaignDetailModal = ({ campaign, open, onOpenChange, onDelete }: AdminCampaignDetailModalProps) => {
  const toggleStatus = useToggleCampaignStatus();
  const queryClient = useQueryClient();
  if (!campaign) return null;

  const status = campaign.status || "draft";
  const handleRefetch = () => {
    queryClient.invalidateQueries({
      queryKey: ["brand-campaigns"]
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between gap-3 pr-6">
            <div className="min-w-0">
              <DialogTitle className="text-lg">{campaign.campaign_title}</DialogTitle>
              <p className="text-sm text-muted-foreground">{campaign.brand_name}</p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {status === "open" && (
                <Button size="sm" variant="outline" disabled={toggleStatus.isPending} onClick={() => toggleStatus.mutate({ id: campaign.id, status: "paused" })}>
                  <Pause className="h-3 w-3 mr-1" /> Pause
                </Button>
              )}
              {status === "paused" && (
                <Button size="sm" variant="outline" disabled={toggleStatus.isPending} onClick={() => toggleStatus.mutate({ id: campaign.id, status: "open" })}>
                  <Play className="h-3 w-3 mr-1" /> Resume
                </Button>
              )}
              {(status === "open" || status === "paused") && (
                <Button size="sm" variant="outline" disabled={toggleStatus.isPending} onClick={() => toggleStatus.mutate({ id: campaign.id, status: "closed" })}>
                  <XCircle className="h-3 w-3 mr-1" /> Close
                </Button>
              )}
              {status === "draft" && (
                <Button size="sm" variant="outline" disabled={toggleStatus.isPending} onClick={() => toggleStatus.mutate({ id: campaign.id, status: "open" })}>
                  <Play className="h-3 w-3 mr-1" /> Publish
                </Button>
              )}
              <Badge variant="outline" className="capitalize">{status}</Badge>
            </div>
          </div>
        </DialogHeader>

        <Tabs defaultValue="details" className="mt-2">
          <TabsList className="w-full">
            <TabsTrigger value="details" className="flex-1">Details</TabsTrigger>
            <TabsTrigger value="applications" className="flex-1">Applications</TabsTrigger>
            <TabsTrigger value="invite" className="flex-1">Invite Creators</TabsTrigger>
            <TabsTrigger value="settings" className="flex-1">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="details">
            <CampaignDetailsTab campaign={campaign} />
          </TabsContent>

          <TabsContent value="applications">
            <CampaignApplicationsTab campaignId={campaign.id} />
          </TabsContent>

          <TabsContent value="invite">
            <CampaignInviteTab campaignId={campaign.id} />
          </TabsContent>

          <TabsContent value="settings">
            <CampaignSettingsTab campaign={campaign} onDelete={onDelete} onClose={() => onOpenChange(false)}  onRefetch={handleRefetch}/>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
