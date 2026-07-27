import { Calendar, DollarSign, Eye } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { format, isPast, differenceInDays } from "date-fns";

interface CollaborationCardProps {
  agreement: any;
  onViewDetails: (agreement: any) => void;
}

export const CollaborationCard = ({ agreement, onViewDetails }: CollaborationCardProps) => {
  const hostName = agreement.host?.profiles?.first_name && agreement.host?.profiles?.last_name
    ? `${agreement.host.profiles.first_name} ${agreement.host.profiles.last_name}`
    : agreement.host?.profiles?.username || "Unknown Host";

  const influencerName = agreement.influencer?.profiles?.first_name && agreement.influencer?.profiles?.last_name
    ? `${agreement.influencer.profiles.first_name} ${agreement.influencer.profiles.last_name}`
    : agreement.influencer?.profiles?.username || "Unknown Influencer";

  const propertyTitle = agreement.application?.property?.title || "No Property";
  const propertyType = agreement.application?.property?.property_type || "";

  const stayStart = agreement.application?.proposed_dates_start 
    ? new Date(agreement.application.proposed_dates_start) 
    : null;
  const stayEnd = agreement.application?.proposed_dates_end 
    ? new Date(agreement.application.proposed_dates_end) 
    : null;

  return (
    <Card className="hover:shadow-md transition-shadow cursor-move">
      <CardContent className="p-4 space-y-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <Avatar className="h-8 w-8 flex-shrink-0">
              <AvatarImage src="" />
              <AvatarFallback className="text-xs bg-primary/10 text-primary">
                {hostName.charAt(0)}{influencerName.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="font-medium text-sm truncate">{hostName}</p>
              <p className="text-xs text-muted-foreground truncate">× {influencerName}</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 flex-shrink-0"
            onClick={(e) => {
              e.stopPropagation();
              onViewDetails(agreement);
            }}
          >
            <Eye className="h-4 w-4" />
          </Button>
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              {propertyType}
            </Badge>
            <p className="text-xs text-muted-foreground truncate flex-1">{propertyTitle}</p>
          </div>

          {agreement.agreed_rate && (
            <div className="flex items-center gap-1.5 text-sm font-medium">
              <DollarSign className="h-3.5 w-3.5 text-green-600" />
              <span>{agreement.agreed_rate.toLocaleString()} {agreement.currency?.toUpperCase() || 'USD'}</span>
            </div>
          )}

          {stayStart && (
            <div className="flex items-center gap-1.5 text-xs">
              <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-muted-foreground">
                {format(stayStart, "MMM d")}
                {stayEnd && ` - ${format(stayEnd, "MMM d, yyyy")}`}
                {!stayEnd && `, ${format(stayStart, "yyyy")}`}
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
