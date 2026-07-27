import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, Eye, Pause, Play } from "lucide-react";
import { format } from "date-fns";

interface Campaign {
  id: string;
  campaign_title: string;
  campaign_description: string;
  status: string;
  budget_min?: number;
  budget_max?: number;
  applications_count?: number;
  views_count?: number;
  created_at: string;
  application_deadline?: string;
}

interface BrandCampaignsProps {
  campaigns: Campaign[];
  onEdit: (campaign: Campaign) => void;
  onDelete: (campaignId: string) => void;
  onToggleStatus: (campaignId: string, currentStatus: string) => void;
}

export const BrandCampaigns = ({ 
  campaigns, 
  onEdit, 
  onDelete, 
  onToggleStatus 
}: BrandCampaignsProps) => {
  if (!campaigns || campaigns.length === 0) {
    return (
      <Card className="p-8 text-center">
        <p className="text-muted-foreground">No campaigns found</p>
      </Card>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "open":
        return "default";
      case "closed":
        return "secondary";
      case "draft":
        return "outline";
      default:
        return "secondary";
    }
  };

  return (
    <div className="space-y-4">
      {campaigns.map((campaign) => (
        <Card key={campaign.id} className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="text-lg font-semibold">{campaign.campaign_title}</h3>
                <Badge variant={getStatusColor(campaign.status)}>
                  {campaign.status}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground line-clamp-2">
                {campaign.campaign_description}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-4 mb-4">
            <div>
              <p className="text-xs text-muted-foreground">Budget Range</p>
              <p className="text-sm font-medium">
                ${campaign.budget_min || 0} - ${campaign.budget_max || 0}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Applications</p>
              <p className="text-sm font-medium">{campaign.applications_count || 0}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Views</p>
              <p className="text-sm font-medium">{campaign.views_count || 0}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Deadline</p>
              <p className="text-sm font-medium">
                {campaign.application_deadline 
                  ? format(new Date(campaign.application_deadline), "MMM d, yyyy")
                  : "No deadline"}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t">
            <p className="text-xs text-muted-foreground">
              Created {format(new Date(campaign.created_at), "MMM d, yyyy")}
            </p>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onEdit(campaign)}
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onToggleStatus(campaign.id, campaign.status)}
              >
                {campaign.status === "open" ? (
                  <Pause className="h-4 w-4" />
                ) : (
                  <Play className="h-4 w-4" />
                )}
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  if (confirm("Are you sure you want to delete this campaign?")) {
                    onDelete(campaign.id);
                  }
                }}
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};
