import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useUpdateBrandCampaign } from "@/hooks/useBrandCampaignMutations";
import { Save, Loader2, Trash2, AlertTriangle,ArrowRightLeft } from "lucide-react";
import type { BrandCampaign } from "../AdminCampaignCard";
import TransferCampaignModal from "./transferCampaignModel";
interface CampaignSettingsTabProps {
  campaign: BrandCampaign;
  onDelete: (id: string) => void;
  onClose: () => void;
  onRefetch:()=>void;
}

export const CampaignSettingsTab = ({ campaign, onDelete, onClose ,onRefetch }: CampaignSettingsTabProps) => {
  const updateCampaign = useUpdateBrandCampaign();
  const [deadline, setDeadline] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [visibility, setVisibility] = useState<string>("public");
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const handleExtend = () => {
    const updates: Record<string, any> = {};
    if (deadline) updates.application_deadline = new Date(deadline).toISOString();
    if (expiresAt) updates.expires_at = new Date(expiresAt).toISOString();

    if (Object.keys(updates).length === 0) return;

    updateCampaign.mutate({ id: campaign.id, data: updates as any });
  };

  const handleVisibility = (v: string) => {
    setVisibility(v);
    updateCampaign.mutate({ id: campaign.id, data: { visibility: v as "public" | "private" } });
  };

  return (
    <div className="space-y-4 pt-4">
      {/* Extend Deadlines */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">Extend Deadlines</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs">Application Deadline</Label>
              <Input type="date" value={deadline} onChange={e => setDeadline(e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Campaign Expiry</Label>
              <Input type="date" value={expiresAt} onChange={e => setExpiresAt(e.target.value)} />
            </div>
          </div>
          <Button size="sm" onClick={handleExtend} disabled={updateCampaign.isPending || (!deadline && !expiresAt)}>
            {updateCampaign.isPending ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <Save className="h-3 w-3 mr-1" />}
            Update Deadlines
          </Button>
        </CardContent>
      </Card>

      {/* Visibility */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">Visibility</CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={visibility} onValueChange={handleVisibility}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="public">Public — visible to all creators</SelectItem>
              <SelectItem value="private">Private — invite-only</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>
 {/* Transfer Ownership */}
 <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">Transfer Ownership</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="text-xs text-muted-foreground">
            Reassign this campaign to a different brand account on the platform.
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsTransferModalOpen(true)}
          >
            <ArrowRightLeft className="h-3 w-3 mr-1" />
            Transfer to Another Brand
          </Button>
        </CardContent>
      </Card>
      {/* Danger Zone */}
      <Card className="border-destructive/30">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-destructive flex items-center gap-1">
            <AlertTriangle className="h-4 w-4" /> Danger Zone
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => {
              onDelete(campaign.id);
              onClose();
            }}
          >
            <Trash2 className="h-3 w-3 mr-1" /> Delete Campaign
          </Button>
        </CardContent>
      </Card>
      {/* Transfer Modal */}
      <TransferCampaignModal
        campaign={{
          id: campaign.id,
          campaign_title: campaign.campaign_title,
          brand_name: campaign.brand_name,
          brand_id: (campaign as any).brand_id ?? null,
        }}
        isOpen={isTransferModalOpen}
        onClose={() => setIsTransferModalOpen(false)}
        onTransferComplete={() => {
          setIsTransferModalOpen(false);
          onRefetch?.();
          onClose();
        }}
      />
    </div>
  );
};
