import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Heart, Calendar, Users, TrendingUp, Clock, MapPin, Link } from 'lucide-react';
import { BrandCampaign } from '@/hooks/useBrandCampaigns';
import { getPlatformConfig } from '@/hooks/useCampaignFilterOptions';
import { cn } from '@/lib/utils';

interface BrandCampaignCardProps {
  campaign: BrandCampaign;
  isSaved?: boolean;
  hasApplied?: boolean;
  onSave?: () => void;
  onUnsave?: () => void;
  onViewDetails: () => void;
}

const getEffectiveCompensationType = (campaign: BrandCampaign): string => {
  // Detect affiliate-only campaigns that were saved with wrong compensation_type
  if (
    campaign.compensation_type === 'paid' &&
    campaign.affiliate_enabled &&
    campaign.affiliate_percentage &&
    (!campaign.budget_min || campaign.budget_min === 0) &&
    (!campaign.budget_max || campaign.budget_max === 0)
  ) {
    return 'affiliate';
  }
  return campaign.compensation_type;
};

const getCompensationBadges = (campaign: BrandCampaign) => {
  const badges: React.ReactNode[] = [];
  const type = getEffectiveCompensationType(campaign);

  if (type === 'paid') {
    // Paid only — no affiliate, no product
    if (campaign.budget_min && campaign.budget_max) {
      badges.push(
        <Badge key="paid" className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white border-0 shadow-lg">
          💰 ${campaign.budget_min.toLocaleString()} - ${campaign.budget_max.toLocaleString()}
        </Badge>
      );
    } else {
      badges.push(
        <Badge key="paid" className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white border-0 shadow-lg">
          💰 Paid Campaign
        </Badge>
      );
    }
    return badges;
  }

  if (type === 'product') {
    if (campaign.affiliate_enabled && campaign.affiliate_percentage) {
      // Product + Affiliate combo
      badges.push(
        <Badge key="product" className="bg-gradient-to-r from-purple-500 to-purple-600 text-white border-0 shadow-lg">
          🎁 Gifted{campaign.product_value ? ` $${campaign.product_value.toLocaleString()}` : ''}
        </Badge>
      );
      badges.push(
        <Badge key="affiliate" className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0 shadow-lg">
          <Link className="w-3 h-3 mr-1" />
          {campaign.affiliate_percentage}% Commission
        </Badge>
      );
    } else {
      // Gifted only
      badges.push(
        <Badge key="gifted" className="bg-gradient-to-r from-purple-500 to-purple-600 text-white border-0 shadow-lg">
          🎁 Gifted{campaign.product_value ? ` Worth $${campaign.product_value.toLocaleString()}` : ''}
        </Badge>
      );
    }
    return badges;
  }

  if (type === 'hybrid') {
    badges.push(
      <Badge key="hybrid" className="bg-gradient-to-r from-pink-500 to-blue-500 text-white border-0 shadow-lg">
        💎 Product + ${campaign.budget_min?.toLocaleString() || 0}
      </Badge>
    );
    return badges;
  }

  // Affiliate-only compensation type
  if (type === 'affiliate' && campaign.affiliate_percentage) {
    badges.push(
      <Badge key="affiliate" className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0 shadow-lg">
        <Link className="w-3 h-3 mr-1" />
        {campaign.affiliate_percentage}% Commission
      </Badge>
    );
  }

  return badges;
};

export const BrandCampaignCard = ({
  campaign,
  isSaved,
  hasApplied,
  onSave,
  onUnsave,
  onViewDetails,
}: BrandCampaignCardProps) => {
  const handleSaveToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isSaved) {
      onUnsave?.();
    } else {
      onSave?.();
    }
  };

  const spotsRemaining = campaign.spots_available - campaign.spots_filled;
  const spotsFilledPercentage = campaign.spots_available > 0 
    ? (campaign.spots_filled / campaign.spots_available) * 100 
    : 0;
  
  const deadlineDays = campaign.application_deadline
    ? Math.ceil(
        (new Date(campaign.application_deadline).getTime() - Date.now()) /
          (1000 * 60 * 60 * 24)
      )
    : null;

  const isUrgent = deadlineDays !== null && deadlineDays <= 3 && deadlineDays > 0;
  const isExpired = deadlineDays !== null && deadlineDays < 0;

  return (
    <Card 
      className={cn(
        "group overflow-hidden transition-all duration-300 cursor-pointer border-border/40 bg-card/50 backdrop-blur-sm",
        "hover:shadow-xl hover:shadow-primary/5 hover:border-primary/20 hover:-translate-y-1"
      )}
      onClick={onViewDetails}
    >
      {/* Campaign Hero Image */}
      <div className="relative h-44 overflow-hidden bg-gradient-to-br from-muted to-muted/50">
        {campaign.campaign_image_url ? (
          <img
            src={campaign.campaign_image_url}
            alt={campaign.campaign_title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-4xl opacity-30">🎯</div>
          </div>
        )}
        
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        
        {/* Floating save button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={handleSaveToggle}
          className="absolute top-3 right-3 bg-background/80 backdrop-blur-sm hover:bg-background/90 shadow-lg"
        >
          <Heart
            className={cn(
              "w-5 h-5 transition-colors",
              isSaved ? 'fill-red-500 text-red-500' : 'text-muted-foreground'
            )}
          />
        </Button>

        {/* Brand logo */}
        {campaign.brand_logo_url && (
          <div className="absolute bottom-3 left-3">
            <img
              src={campaign.brand_logo_url}
              alt={campaign.brand_name}
              className="w-10 h-10 rounded-lg object-cover border-2 border-background shadow-lg"
            />
          </div>
        )}

        {/* Urgency badge */}
        {isUrgent && (
          <Badge className="absolute top-3 left-3 bg-destructive text-destructive-foreground animate-pulse">
            <Clock className="w-3 h-3 mr-1" />
            {deadlineDays} days left
          </Badge>
        )}
      </div>

      <div className="p-5 space-y-4">
        {/* Compensation Badges */}
        <div className="flex items-center gap-2 flex-wrap">
          {getCompensationBadges(campaign)}
          {hasApplied && (
            <Badge variant="secondary" className="bg-blue-500/10 text-blue-600 border-blue-500/20">
              ✓ Applied
            </Badge>
          )}
        </div>

        {/* Title, Brand & Campaign Type */}
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-lg line-clamp-1 group-hover:text-primary transition-colors">
              {campaign.campaign_title}
            </h3>
            {campaign.campaign_type && (
              <Badge variant="outline" className="text-xs capitalize shrink-0">
                {campaign.campaign_type}
              </Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground">
            {campaign.brand_name}
          </p>
        </div>

        {/* Description */}
        <p className="text-sm text-muted-foreground line-clamp-2">
          {campaign.campaign_description}
        </p>

        {/* Geo / Destination */}
        {(campaign.geo_focus || campaign.target_destination) && (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <MapPin className="w-3.5 h-3.5" />
            <span>{campaign.target_destination || campaign.geo_focus}</span>
          </div>
        )}

        {/* Platforms */}
        <div className="flex flex-wrap gap-1.5">
          {campaign.required_platforms.slice(0, 3).map((platform) => {
            const config = getPlatformConfig(platform);
            return (
              <Badge key={platform} variant="outline" className="text-xs">
                {config.icon} {config.label}
              </Badge>
            );
          })}
          {campaign.required_platforms.length > 3 && (
            <Badge variant="outline" className="text-xs">
              +{campaign.required_platforms.length - 3}
            </Badge>
          )}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3 text-xs text-muted-foreground pt-2 border-t">
          <div className="flex items-center gap-1.5">
            <Users className="w-4 h-4" />
            <span>{campaign.min_followers.toLocaleString()}+ followers</span>
          </div>
          {campaign.min_engagement_rate ? (
            <div className="flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4" />
              <span>{campaign.min_engagement_rate}%+ engagement</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4" />
              <span>{campaign.deliverables.length} deliverable{campaign.deliverables.length !== 1 ? 's' : ''}</span>
            </div>
          )}
          {campaign.application_deadline && !isExpired && (
            <div className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4" />
              <span className={isUrgent ? 'text-destructive font-medium' : ''}>
                {deadlineDays} days left
              </span>
            </div>
          )}
          <div className="flex items-center gap-1.5">
            <span className={spotsRemaining <= 3 ? 'text-amber-600 font-medium' : ''}>
              {spotsRemaining} spot{spotsRemaining !== 1 ? 's' : ''} left
            </span>
          </div>
        </div>

        {/* Spots Progress Bar */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">Spots filled</span>
            <span className="font-medium">{campaign.spots_filled}/{campaign.spots_available}</span>
          </div>
          <Progress 
            value={spotsFilledPercentage} 
            className="h-2"
          />
        </div>

        {/* Action Button */}
        <Button
          className="w-full"
          variant={hasApplied ? 'secondary' : 'default'}
          disabled={hasApplied || spotsRemaining === 0 || isExpired}
        >
          {hasApplied
            ? 'Already Applied'
            : isExpired
            ? 'Deadline Passed'
            : spotsRemaining === 0
            ? 'Campaign Full'
            : 'View Details & Apply'}
        </Button>
      </div>
    </Card>
  );
};
