import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Calendar, MessageSquare, CheckCircle, XCircle, Instagram, TrendingUp } from "lucide-react";

interface MockApplication {
  id: string;
  creator: {
    name: string;
    avatar: string;
    followers: number;
    engagement: number;
    niche: string;
    instagram: string;
  };
  property: string;
  dates: string;
  proposal: string;
  contentDeliverables: string[];
  status: string;
  submittedAt: string;
}

interface MockApplicationDetailProps {
  isOpen: boolean;
  onClose: () => void;
  application: MockApplication | null;
  onAction: () => void;
}

export const MockApplicationDetail = ({ isOpen, onClose, application, onAction }: MockApplicationDetailProps) => {
  if (!application) return null;

  const formatFollowers = (count: number) => {
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(0)}K`;
    return count.toString();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Application Details</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Creator Profile */}
          <div className="flex items-start gap-4">
            <Avatar className="w-16 h-16">
              <AvatarImage src={application.creator.avatar} />
              <AvatarFallback>{application.creator.name[0]}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h3 className="font-semibold text-lg">{application.creator.name}</h3>
              <p className="text-sm text-muted-foreground">{application.creator.niche}</p>
              <div className="flex items-center gap-4 mt-2">
                <div className="flex items-center gap-1">
                  <Instagram className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">{application.creator.instagram}</span>
                </div>
                <div className="flex items-center gap-1">
                  <TrendingUp className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">{formatFollowers(application.creator.followers)} followers</span>
                </div>
              </div>
            </div>
            <Badge variant="secondary">{application.creator.engagement}% engagement</Badge>
          </div>

          {/* Property & Dates */}
          <div className="bg-muted/50 rounded-lg p-4 space-y-2">
            <div>
              <p className="text-sm text-muted-foreground">Property</p>
              <p className="font-medium">{application.property}</p>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm">{application.dates}</span>
            </div>
          </div>

          {/* Proposal */}
          <div>
            <h4 className="font-semibold mb-2">Proposal</h4>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {application.proposal}
            </p>
          </div>

          {/* Content Deliverables */}
          <div>
            <h4 className="font-semibold mb-2">Content Deliverables</h4>
            <div className="flex flex-wrap gap-2">
              {application.contentDeliverables.map((deliverable, index) => (
                <Badge key={index} variant="outline">
                  {deliverable}
                </Badge>
              ))}
            </div>
          </div>

          {/* Submission Info */}
          <div className="text-xs text-muted-foreground">
            Submitted {application.submittedAt}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-4 border-t">
            <Button 
              className="flex-1" 
              onClick={onAction}
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Accept
            </Button>
            <Button 
              variant="outline" 
              className="flex-1"
              onClick={onAction}
            >
              <MessageSquare className="w-4 h-4 mr-2" />
              Message
            </Button>
            <Button 
              variant="ghost"
              onClick={onAction}
            >
              <XCircle className="w-4 h-4 mr-2" />
              Decline
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
