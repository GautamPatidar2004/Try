import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Users, DollarSign, Calendar, Eye, Play, Pause, XCircle, Trash2 } from "lucide-react";
import { format } from "date-fns";

export interface BrandCampaign {
  id: string;
  campaign_title: string;
  brand_name: string;
  brand_logo_url: string | null;
  campaign_image_url: string | null;
  campaign_description: string;
  compensation_type: string;
  budget_min: number | null;
  budget_max: number | null;
  status: string | null;
  spots_available: number | null;
  spots_filled: number | null;
  applications_count: number | null;
  views_count: number | null;
  created_at: string | null;
  // Extended fields for edit form
  brand_website: string | null;
  brand_description: string | null;
  campaign_type: string | null;
  campaign_brief_url: string | null;
  target_destination: string | null;
  min_followers: number | null;
  max_followers: number | null;
  min_engagement_rate: number | null;
  required_niches: string[] | null;
  required_platforms: string[] | null;
  deliverables: string[];
  content_requirements: string[] | null;
  geo_focus: string | null;
  requirements: string | null;
  product_value: number | null;
  currency: string | null;
  timeline_start: string | null;
  timeline_end: string | null;
  application_deadline: string | null;
  visibility: string | null;
  affiliate_enabled: boolean;
  affiliate_percentage: number | null;
}

interface AdminCampaignCardProps {
  campaign: BrandCampaign;
  onToggleStatus: (id: string, status: "open" | "paused" | "closed") => void;
  onDelete: (id: string) => void;
  onViewDetails?: (campaign: BrandCampaign) => void;
  isUpdating?: boolean;
}

const statusColors: Record<string, string> = {
  open: "bg-green-500/10 text-green-600 border-green-200",
  paused: "bg-yellow-500/10 text-yellow-600 border-yellow-200",
  closed: "bg-muted text-muted-foreground border-border",
  draft: "bg-blue-500/10 text-blue-600 border-blue-200",
};

export const AdminCampaignCard = ({ campaign, onToggleStatus, onDelete, onViewDetails, isUpdating }: AdminCampaignCardProps) => {
  const status = campaign.status || "draft";
  const spotsProgress = campaign.spots_available
    ? ((campaign.spots_filled || 0) / campaign.spots_available) * 100
    : 0;

  const getBudgetDisplay = () => {
    if (campaign.budget_min && campaign.budget_max)
      return `€${campaign.budget_min.toLocaleString()} – €${campaign.budget_max.toLocaleString()}`;
    if (campaign.budget_max) return `Up to €${campaign.budget_max.toLocaleString()}`;
    if (campaign.budget_min) return `From €${campaign.budget_min.toLocaleString()}`;
    return "N/A";
  };

  return (
    <Card className="overflow-hidden cursor-pointer hover:shadow-md transition-shadow" onClick={() => onViewDetails?.(campaign)}>
      {campaign.campaign_image_url && (
        <div className="h-32 overflow-hidden">
          <img
            src={campaign.campaign_image_url}
            alt={campaign.campaign_title}
            className="w-full h-full object-cover"
          />
        </div>
      )}
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <Avatar className="h-8 w-8 shrink-0">
              <AvatarImage src={campaign.brand_logo_url || undefined} />
              <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                {campaign.brand_name.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <h3 className="font-semibold text-sm leading-tight line-clamp-1">{campaign.campaign_title}</h3>
              <p className="text-xs text-muted-foreground">{campaign.brand_name}</p>
            </div>
          </div>
          <Badge variant="outline" className={statusColors[status] || statusColors.draft}>
            {status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3 pt-0">
        <p className="text-xs text-muted-foreground line-clamp-2">{campaign.campaign_description}</p>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-2 text-xs">
          <div className="flex items-center gap-1 text-muted-foreground">
            <DollarSign className="h-3 w-3" />
            <span>{getBudgetDisplay()}</span>
          </div>
          <div className="flex items-center gap-1 text-muted-foreground">
            <Users className="h-3 w-3" />
            <span>{campaign.applications_count || 0} apps</span>
          </div>
          <div className="flex items-center gap-1 text-muted-foreground">
            <Eye className="h-3 w-3" />
            <span>{campaign.views_count || 0} views</span>
          </div>
        </div>

        {/* Spots progress */}
        {campaign.spots_available && (
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Spots filled</span>
              <span>{campaign.spots_filled || 0} / {campaign.spots_available}</span>
            </div>
            <Progress value={spotsProgress} className="h-1.5" />
          </div>
        )}

        {/* Date & compensation */}
        <div className="flex items-center justify-between text-xs text-muted-foreground border-t pt-2">
          <div className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {campaign.created_at ? format(new Date(campaign.created_at), "MMM d, yyyy") : "—"}
          </div>
          <Badge variant="secondary" className="text-xs capitalize">
            {campaign.compensation_type}
          </Badge>
        </div>

        {/* Actions */}
        <div className="flex gap-1.5 pt-1" onClick={e => e.stopPropagation()}>
          {status === "open" && (
            <Button size="sm" variant="outline" className="flex-1 text-xs h-7" disabled={isUpdating} onClick={() => onToggleStatus(campaign.id, "paused")}>
              <Pause className="h-3 w-3 mr-1" /> Pause
            </Button>
          )}
          {status === "paused" && (
            <Button size="sm" variant="outline" className="flex-1 text-xs h-7" disabled={isUpdating} onClick={() => onToggleStatus(campaign.id, "open")}>
              <Play className="h-3 w-3 mr-1" /> Resume
            </Button>
          )}
          {(status === "open" || status === "paused") && (
            <Button size="sm" variant="outline" className="flex-1 text-xs h-7" disabled={isUpdating} onClick={() => onToggleStatus(campaign.id, "closed")}>
              <XCircle className="h-3 w-3 mr-1" /> Close
            </Button>
          )}
          {status === "draft" && (
            <Button size="sm" variant="outline" className="flex-1 text-xs h-7" disabled={isUpdating} onClick={() => onToggleStatus(campaign.id, "open")}>
              <Play className="h-3 w-3 mr-1" /> Publish
            </Button>
          )}
          <Button size="sm" variant="destructive" className="text-xs h-7 px-2" disabled={isUpdating} onClick={() => onDelete(campaign.id)}>
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
