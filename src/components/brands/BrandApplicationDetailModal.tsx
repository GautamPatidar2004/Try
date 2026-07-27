import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { 
  Instagram, 
  MapPin, 
  Users, 
  TrendingUp, 
  Calendar,
  ExternalLink,
  CheckCircle,
  XCircle,
  Clock
} from "lucide-react";
import { format } from "date-fns";

interface BrandApplicationDetailModalProps {
  application: any;
  isOpen: boolean;
  onClose: () => void;
  onUpdateStatus: (applicationId: string, status: 'accepted' | 'rejected') => void;
}

export const BrandApplicationDetailModal = ({
  application,
  isOpen,
  onClose,
  onUpdateStatus,
}: BrandApplicationDetailModalProps) => {
  if (!application) return null;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
      case 'accepted':
        return <Badge variant="secondary" className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Accepted</Badge>;
      case 'rejected':
        return <Badge variant="secondary" className="bg-red-100 text-red-800"><XCircle className="w-3 h-3 mr-1" />Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const handleAccept = () => {
    onUpdateStatus(application.id, 'accepted');
    onClose();
  };

  const handleReject = () => {
    onUpdateStatus(application.id, 'rejected');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Application Details</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Header with Avatar and Basic Info */}
          <div className="flex items-start gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={application.profile?.profile_photo_url} />
              <AvatarFallback className="text-lg">
                {application.profile?.first_name?.[0]}
                {application.profile?.last_name?.[0]}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-xl font-semibold">
                  {application.profile?.first_name} {application.profile?.last_name}
                </h3>
                {getStatusBadge(application.status)}
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Applied for: <span className="font-medium text-foreground">{application.campaign_title}</span>
              </p>
              <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                <Calendar className="w-3 h-3" />
                Applied on {application.created_at ? format(new Date(application.created_at), 'MMM d, yyyy') : 'N/A'}
              </p>
            </div>
          </div>

          <Separator />

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50">
              <Users className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">
                  {application.follower_count_snapshot?.toLocaleString() || 
                   application.influencer?.total_followers?.toLocaleString() || 'N/A'}
                </p>
                <p className="text-xs text-muted-foreground">Followers</p>
              </div>
            </div>
            <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50">
              <TrendingUp className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">
                  {application.engagement_rate_snapshot || 
                   application.influencer?.engagement_rate || 'N/A'}%
                </p>
                <p className="text-xs text-muted-foreground">Engagement</p>
              </div>
            </div>
            <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50">
              <MapPin className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium truncate">
                  {application.profile?.location || 'N/A'}
                </p>
                <p className="text-xs text-muted-foreground">Location</p>
              </div>
            </div>
          </div>

          {/* Social Links */}
          {application.influencer?.instagram_url && (
            <div>
              <h4 className="text-sm font-medium mb-2">Social Media</h4>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" asChild>
                  <a href={application.influencer.instagram_url} target="_blank" rel="noopener noreferrer">
                    <Instagram className="w-4 h-4 mr-2" />
                    Instagram
                    <ExternalLink className="w-3 h-3 ml-1" />
                  </a>
                </Button>
              </div>
            </div>
          )}

          <Separator />

          {/* Cover Letter */}
          {application.cover_letter && (
            <div>
              <h4 className="text-sm font-medium mb-2">Cover Letter</h4>
              <div className="p-4 rounded-lg bg-muted/50">
                <p className="text-sm whitespace-pre-wrap">{application.cover_letter}</p>
              </div>
            </div>
          )}

          {/* Content Ideas */}
          {application.proposed_content_ideas && (
            <div>
              <h4 className="text-sm font-medium mb-2">Proposed Content Ideas</h4>
              <div className="p-4 rounded-lg bg-muted/50">
                <p className="text-sm whitespace-pre-wrap">{application.proposed_content_ideas}</p>
              </div>
            </div>
          )}

          {/* Portfolio */}
          {application.portfolio_urls && application.portfolio_urls.length > 0 && (
            <div>
              <h4 className="text-sm font-medium mb-2">Portfolio</h4>
              <div className="flex flex-wrap gap-2">
                {application.portfolio_urls.map((url: string, index: number) => (
                  <Button key={index} variant="outline" size="sm" asChild>
                    <a href={url} target="_blank" rel="noopener noreferrer">
                      Portfolio {index + 1}
                      <ExternalLink className="w-3 h-3 ml-1" />
                    </a>
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Rejection Reason if rejected */}
          {application.status === 'rejected' && application.rejection_reason && (
            <div>
              <h4 className="text-sm font-medium mb-2 text-destructive">Rejection Reason</h4>
              <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20">
                <p className="text-sm">{application.rejection_reason}</p>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          {application.status === 'pending' && (
            <>
              <Separator />
              <div className="flex gap-3 justify-end">
                <Button variant="outline" onClick={handleReject}>
                  <XCircle className="w-4 h-4 mr-2" />
                  Reject
                </Button>
                <Button onClick={handleAccept}>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Accept
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
