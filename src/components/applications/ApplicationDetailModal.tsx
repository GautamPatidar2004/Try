import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Instagram, 
  Youtube, 
  Twitter, 
  MapPin, 
  Users, 
  TrendingUp,
  Calendar,
  Check,
  X,
  ExternalLink
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

// TikTok icon component since lucide doesn't have it
const TikTokIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
  </svg>
);

interface ApplicationDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  application: {
    id: string;
    status: string;
    proposal_message?: string;
    proposed_dates_start?: string;
    proposed_dates_end?: string;
    content_deliverables?: string[];
    cover_letter?: string;
    proposed_content_ideas?: string;
    portfolio_urls?: string[];
    created_at: string;
    influencers?: {
      id: string;
      total_followers?: number;
      engagement_rate?: number;
      content_niches?: string[];
      instagram_url?: string;
      tiktok_url?: string;
      youtube_url?: string;
      twitter_url?: string;
      profiles?: {
        first_name?: string;
        last_name?: string;
        username?: string;
        bio?: string;
        location?: string;
        profile_photo_url?: string;
        avatar_url?: string;
      };
    };
    properties?: {
      title?: string;
      location?: string;
    };
  } | null;
  onApprove: () => void;
  onReject: () => void;
  isApproving?: boolean;
  isRejecting?: boolean;
  applicationType: 'host' | 'brand';
}

const formatFollowers = (count?: number) => {
  if (!count) return 'N/A';
  if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
  if (count >= 1000) return `${(count / 1000).toFixed(0)}K`;
  return count.toString();
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'approved':
    case 'accepted':
      return 'bg-green-500 text-white';
    case 'rejected':
      return 'bg-red-500 text-white';
    default:
      return 'bg-yellow-500 text-white';
  }
};

export const ApplicationDetailModal = ({
  isOpen,
  onClose,
  application,
  onApprove,
  onReject,
  isApproving = false,
  isRejecting = false,
  applicationType,
}: ApplicationDetailModalProps) => {
  if (!application) return null;

  const influencer = application.influencers;
  const profile = influencer?.profiles;
  const avatarUrl = profile?.profile_photo_url || profile?.avatar_url;
  const fullName = [profile?.first_name, profile?.last_name].filter(Boolean).join(' ') || 'Creator';
  const isPending = application.status === 'pending';

  const socialLinks = [
    { url: influencer?.instagram_url, icon: Instagram, label: 'Instagram' },
    { url: influencer?.tiktok_url, icon: TikTokIcon, label: 'TikTok' },
    { url: influencer?.youtube_url, icon: Youtube, label: 'YouTube' },
    { url: influencer?.twitter_url, icon: Twitter, label: 'Twitter' },
  ].filter(link => link.url);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] p-0">
        <DialogHeader className="px-6 pt-6 pb-4">
          <DialogTitle>Application Details</DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="max-h-[calc(90vh-180px)]">
          <div className="px-6 space-y-6">
            {/* Creator Profile Section */}
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={avatarUrl} />
                  <AvatarFallback className="text-xl">
                    {profile?.first_name?.[0]}{profile?.last_name?.[0]}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="text-xl font-semibold">{fullName}</h3>
                      {profile?.username && (
                        <p className="text-muted-foreground">@{profile.username}</p>
                      )}
                      {profile?.location && (
                        <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                          <MapPin className="h-3 w-3" />
                          {profile.location}
                        </p>
                      )}
                    </div>
                    <Badge className={getStatusColor(application.status)}>
                      {application.status}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="flex items-center gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span>
                    <strong>{formatFollowers(influencer?.total_followers)}</strong> followers
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  <span>
                    <strong>{influencer?.engagement_rate?.toFixed(1) || 'N/A'}%</strong> engagement
                  </span>
                </div>
              </div>

              {/* Social Links */}
              {socialLinks.length > 0 && (
                <div className="flex gap-2">
                  {socialLinks.map(({ url, icon: Icon, label }) => (
                    <Button
                      key={label}
                      variant="outline"
                      size="sm"
                      asChild
                      className="gap-2"
                    >
                      <a href={url} target="_blank" rel="noopener noreferrer">
                        <Icon className="h-4 w-4" />
                        {label}
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </Button>
                  ))}
                </div>
              )}

              {/* Content Niches */}
              {influencer?.content_niches && influencer.content_niches.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {influencer.content_niches.map((niche, index) => (
                    <Badge key={index} variant="secondary">
                      {niche}
                    </Badge>
                  ))}
                </div>
              )}

              {/* Bio */}
              {profile?.bio && (
                <div>
                  <p className="text-sm font-medium mb-1">Bio</p>
                  <p className="text-sm text-muted-foreground">{profile.bio}</p>
                </div>
              )}
            </div>

            <Separator />

            {/* Application Details Section */}
            <div className="space-y-4">
              {/* Property */}
              {application.properties?.title && (
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
                    {applicationType === 'brand' ? 'Campaign' : 'Property'}
                  </p>
                  <p className="font-medium">{application.properties.title}</p>
                  {application.properties.location && (
                    <p className="text-sm text-muted-foreground">{application.properties.location}</p>
                  )}
                </div>
              )}

              {/* Proposed Dates */}
              {application.proposed_dates_start && (
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>
                    {new Date(application.proposed_dates_start).toLocaleDateString()}
                    {application.proposed_dates_end && (
                      <> — {new Date(application.proposed_dates_end).toLocaleDateString()}</>
                    )}
                  </span>
                </div>
              )}

              {/* Proposal Message (Host) */}
              {application.proposal_message && (
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Proposal</p>
                  <p className="text-sm bg-muted p-3 rounded-lg">{application.proposal_message}</p>
                </div>
              )}

              {/* Cover Letter (Brand) */}
              {application.cover_letter && (
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Cover Letter</p>
                  <p className="text-sm bg-muted p-3 rounded-lg">{application.cover_letter}</p>
                </div>
              )}

              {/* Content Ideas (Brand) */}
              {application.proposed_content_ideas && (
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Content Ideas</p>
                  <p className="text-sm bg-muted p-3 rounded-lg">{application.proposed_content_ideas}</p>
                </div>
              )}

              {/* Content Deliverables */}
              {application.content_deliverables && application.content_deliverables.length > 0 && (
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Content Deliverables</p>
                  <div className="flex flex-wrap gap-2">
                    {application.content_deliverables.map((deliverable, index) => (
                      <Badge key={index} variant="outline">
                        {deliverable}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Portfolio URLs (Brand) */}
              {application.portfolio_urls && application.portfolio_urls.length > 0 && (
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">Portfolio</p>
                  <div className="flex flex-wrap gap-2">
                    {application.portfolio_urls.map((url, index) => (
                      <Button key={index} variant="outline" size="sm" asChild>
                        <a href={url} target="_blank" rel="noopener noreferrer">
                          Link {index + 1}
                          <ExternalLink className="h-3 w-3 ml-1" />
                        </a>
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              {/* Submission Date */}
              <p className="text-xs text-muted-foreground">
                Submitted {formatDistanceToNow(new Date(application.created_at), { addSuffix: true })}
              </p>
            </div>
          </div>
        </ScrollArea>

        {/* Action Buttons */}
        <div className="px-6 py-4 border-t bg-muted/30">
          {isPending ? (
            <div className="flex gap-3">
              <Button
                onClick={onApprove}
                disabled={isApproving || isRejecting}
                className="flex-1"
              >
                <Check className="h-4 w-4 mr-2" />
                {isApproving ? 'Approving...' : 'Approve'}
              </Button>
              <Button
                variant="destructive"
                onClick={onReject}
                disabled={isApproving || isRejecting}
                className="flex-1"
              >
                <X className="h-4 w-4 mr-2" />
                {isRejecting ? 'Rejecting...' : 'Reject'}
              </Button>
            </div>
          ) : (
            <Button variant="outline" onClick={onClose} className="w-full">
              Close
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
