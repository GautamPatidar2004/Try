import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Users, DollarSign, Calendar, Star } from "lucide-react";
import { format } from "date-fns";

interface PlatformDeal {
  id: string;
  campaign_title: string;
  brand_name: string;
  brand_logo_url: string | null;
  campaign_description: string;
  budget_min: number | null;
  budget_max: number | null;
  status: string;
  spots_available: number | null;
  spots_filled: number | null;
  applications_count: number | null;
  created_at: string;
  priority_level: string | null;
  commission_rate: number | null;
}

interface PlatformDealCardProps {
  deal: PlatformDeal;
  onClick: () => void;
}

export const PlatformDealCard = ({ deal, onClick }: PlatformDealCardProps) => {
  const statusColors: Record<string, string> = {
    open: "bg-green-500/10 text-green-600 border-green-200",
    paused: "bg-yellow-500/10 text-yellow-600 border-yellow-200",
    closed: "bg-gray-500/10 text-gray-600 border-gray-200",
    draft: "bg-blue-500/10 text-blue-600 border-blue-200",
  };

  const priorityColors: Record<string, string> = {
    high: "bg-red-500/10 text-red-600",
    medium: "bg-orange-500/10 text-orange-600",
    low: "bg-gray-500/10 text-gray-600",
  };

  const getBudgetDisplay = () => {
    if (deal.budget_min && deal.budget_max) {
      return `€${deal.budget_min.toLocaleString()} - €${deal.budget_max.toLocaleString()}`;
    }
    if (deal.budget_max) {
      return `Up to €${deal.budget_max.toLocaleString()}`;
    }
    if (deal.budget_min) {
      return `From €${deal.budget_min.toLocaleString()}`;
    }
    return "Budget TBD";
  };

  return (
    <Card 
      className="cursor-pointer hover:shadow-md transition-shadow border-l-4 border-l-hostfluencer-green"
      onClick={onClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={deal.brand_logo_url || undefined} />
              <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                {deal.brand_name.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <h3 className="font-semibold text-sm leading-tight line-clamp-1">
                {deal.campaign_title}
              </h3>
              <p className="text-xs text-muted-foreground">{deal.brand_name}</p>
            </div>
          </div>
          <div className="flex flex-col gap-1 items-end">
            <Badge variant="outline" className={statusColors[deal.status] || statusColors.draft}>
              {deal.status}
            </Badge>
            {deal.priority_level && (
              <Badge variant="secondary" className={`text-xs ${priorityColors[deal.priority_level] || ""}`}>
                <Star className="h-3 w-3 mr-1" />
                {deal.priority_level}
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0 space-y-3">
        <p className="text-sm text-muted-foreground line-clamp-2">
          {deal.campaign_description}
        </p>
        
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <DollarSign className="h-3.5 w-3.5" />
            <span className="text-xs">{getBudgetDisplay()}</span>
          </div>
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Users className="h-3.5 w-3.5" />
            <span className="text-xs">
              {deal.spots_filled || 0}/{deal.spots_available || "∞"} spots
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {format(new Date(deal.created_at), "MMM d, yyyy")}
          </div>
          {deal.applications_count !== null && deal.applications_count > 0 && (
            <Badge variant="secondary" className="text-xs">
              {deal.applications_count} applications
            </Badge>
          )}
        </div>

        {deal.commission_rate && (
          <div className="text-xs text-muted-foreground">
            Platform commission: {deal.commission_rate}%
          </div>
        )}
      </CardContent>
    </Card>
  );
};
