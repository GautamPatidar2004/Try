import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { BrandCampaign } from '@/hooks/useBrandCampaigns';
import { Calendar, Users, TrendingUp, MapPin, ExternalLink, Heart, Link, Share2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { ScrollArea } from '@/components/ui/scroll-area';

interface BrandCampaignDetailModalProps {
  campaign: BrandCampaign | null;
  isOpen: boolean;
  onClose: () => void;
  onApply: () => void;
  isSaved?: boolean;
  hasApplied?: boolean;
  onSave?: () => void;
  onUnsave?: () => void;
  isDemoMode?: boolean;
}

const getPlatformIcon = (platform: string) => {
  const icons: Record<string, string> = {
    instagram: '📷',
    tiktok: '🎵',
    youtube: '▶️',
    twitter: '🐦',
  };
  return icons[platform.toLowerCase()] || '📱';
};

export const BrandCampaignDetailModal = ({
  campaign,
  isOpen,
  onClose,
  onApply,
  isSaved,
  hasApplied,
  onSave,
  onUnsave,
  isDemoMode = false,
}: BrandCampaignDetailModalProps) => {
  const navigate = useNavigate();

  if (!campaign) return null;

  // Derive effective compensation type — detect affiliate campaigns stored as 'paid' with no budget
  const effectiveType = (() => {
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
  })();

  const spotsRemaining = campaign.spots_available - campaign.spots_filled;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] grid grid-rows-[auto,1fr,auto]">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <DialogTitle className="text-2xl">Campaign Details</DialogTitle>
            <Badge variant="outline" className="capitalize">
              {effectiveType === 'paid' ? 'Paid' : effectiveType === 'product' ? 'Gifted' : effectiveType === 'affiliate' ? 'Affiliate' : effectiveType === 'hybrid' ? 'Hybrid' : effectiveType}
            </Badge>
          </div>
        </DialogHeader>

        <ScrollArea className="pr-4 overflow-y-auto">
          <div className="space-y-6">
            {/* Brand Header */}
            <div className="flex items-start gap-4">
              {campaign.brand_logo_url && (
                <img
                  src={campaign.brand_logo_url}
                  alt={campaign.brand_name}
                  className="w-20 h-20 rounded-lg object-cover border-2 border-border"
                />
              )}
              <div className="flex-1 space-y-2">
                <h2 className="text-2xl font-bold">{campaign.campaign_title}</h2>
                <div className="flex items-center gap-2">
                  <p className="text-muted-foreground">{campaign.brand_name}</p>
                  {campaign.brand_website && (
                    <a
                      href={campaign.brand_website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline flex items-center gap-1 text-sm"
                    >
                      Visit Website <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
                {campaign.brand_description && (
                  <p className="text-sm text-muted-foreground">
                    {campaign.brand_description}
                  </p>
                )}
              </div>
            </div>

            <Separator />

            {/* Compensation — follows business rules */}
            {effectiveType === 'paid' && (
              <div className="space-y-3">
                <h3 className="font-semibold text-lg">💰 Compensation</h3>
                <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                  <p className="text-2xl font-bold text-emerald-600">
                    ${campaign.budget_min?.toLocaleString()} - ${campaign.budget_max?.toLocaleString()}
                  </p>
                  <p className="text-sm text-muted-foreground">Paid collaboration</p>
                </div>
              </div>
            )}

            {effectiveType === 'product' && !campaign.affiliate_enabled && (
              <div className="space-y-3">
                <h3 className="font-semibold text-lg">🎁 Compensation</h3>
                <div className="p-4 rounded-lg bg-purple-500/10 border border-purple-500/20">
                  <p className="text-2xl font-bold text-purple-600">
                    Gifted{campaign.product_value ? ` — Product Worth $${campaign.product_value.toLocaleString()}` : ''}
                  </p>
                  <p className="text-sm text-muted-foreground">Product gifted as compensation</p>
                </div>
              </div>
            )}

            {effectiveType === 'product' && campaign.affiliate_enabled && campaign.affiliate_percentage && (
              <div className="space-y-3">
                <h3 className="font-semibold text-lg">🎁 Compensation</h3>
                <div className="p-4 rounded-lg bg-purple-500/10 border border-purple-500/20 mb-3">
                  <p className="text-2xl font-bold text-purple-600">
                    Gifted{campaign.product_value ? ` — Product Worth $${campaign.product_value.toLocaleString()}` : ''}
                  </p>
                  <p className="text-sm text-muted-foreground">Product gifted as compensation</p>
                </div>
                <div className="p-4 rounded-lg bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20">
                  <div className="flex items-center gap-2 mb-1">
                    <Link className="w-5 h-5 text-amber-600" />
                    <p className="text-2xl font-bold text-amber-600">
                      {campaign.affiliate_percentage}% Commission
                    </p>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Earn {campaign.affiliate_percentage}% commission on sales generated through your unique affiliate link
                  </p>
                </div>
              </div>
            )}

            {effectiveType === 'hybrid' && (
              <div className="space-y-3">
                <h3 className="font-semibold text-lg">💎 Compensation</h3>
                <div className="p-4 rounded-lg bg-gradient-to-r from-pink-500/10 to-blue-500/10 border border-pink-500/20">
                  <p className="text-2xl font-bold bg-gradient-to-r from-pink-600 to-blue-600 bg-clip-text text-transparent">
                    Product + ${campaign.budget_min?.toLocaleString()}
                  </p>
                  <p className="text-sm text-muted-foreground">Hybrid collaboration</p>
                </div>
              </div>
            )}

            {/* Affiliate-only */}
            {effectiveType === 'affiliate' && campaign.affiliate_percentage && (
              <div className="space-y-3">
                <h3 className="font-semibold text-lg">🔗 Compensation</h3>
                <div className="p-4 rounded-lg bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20">
                  <div className="flex items-center gap-2 mb-1">
                    <Link className="w-5 h-5 text-amber-600" />
                    <p className="text-2xl font-bold text-amber-600">
                      {campaign.affiliate_percentage}% Commission
                    </p>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Earn {campaign.affiliate_percentage}% commission on sales generated through your unique affiliate link
                  </p>
                </div>
              </div>
            )}

            {/* Campaign Overview */}
            <div className="space-y-3">
              <h3 className="font-semibold text-lg">📝 Campaign Overview</h3>
              <p className="text-muted-foreground leading-relaxed">
                {campaign.campaign_description}
              </p>
              {campaign.requirements && (
                <p className="text-sm text-muted-foreground leading-relaxed mt-2">
                  {campaign.requirements}
                </p>
              )}
            </div>

            {/* Requirements */}
            <div className="space-y-3">
              <h3 className="font-semibold text-lg">✅ Requirements</h3>
              <div className="grid gap-3">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">
                    Minimum {campaign.min_followers.toLocaleString()} followers
                    {campaign.max_followers && ` (Max: ${campaign.max_followers.toLocaleString()})`}
                  </span>
                </div>
                {campaign.min_engagement_rate && (
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm font-medium">
                      {campaign.min_engagement_rate}% minimum engagement rate
                    </span>
                  </div>
                )}
                {(campaign.geo_focus || campaign.target_destination) && (
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">
                      {campaign.target_destination && <>Target: {campaign.target_destination}</>}
                      {campaign.target_destination && campaign.geo_focus && ' · '}
                      {campaign.geo_focus && <>Region: {campaign.geo_focus}</>}
                    </span>
                  </div>
                )}
                <div className="flex flex-wrap gap-2">
                  {campaign.required_platforms.map((platform) => (
                    <Badge key={platform} variant="outline">
                      {getPlatformIcon(platform)} {platform}
                    </Badge>
                  ))}
                </div>
                {campaign.required_niches.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {campaign.required_niches.map((niche) => (
                      <Badge key={niche} variant="secondary">
                        {niche}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Deliverables */}
            <div className="space-y-3">
              <h3 className="font-semibold text-lg">📦 Deliverables</h3>
              <ul className="space-y-2">
                {campaign.deliverables.map((deliverable, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span className="text-sm">{deliverable}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Content Requirements */}
            {campaign.content_requirements && campaign.content_requirements.length > 0 && (
              <div className="space-y-3">
                <h3 className="font-semibold text-lg">📋 Content Requirements</h3>
                <ul className="space-y-2">
                  {campaign.content_requirements.map((req, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-amber-500 mt-1">•</span>
                      <span className="text-sm">{req}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Timeline */}
            <div className="space-y-3">
              <h3 className="font-semibold text-lg">📅 Timeline</h3>
              <div className="grid gap-3 text-sm">
                {campaign.application_deadline && (
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span>
                      Application Deadline:{' '}
                      <strong>{format(new Date(campaign.application_deadline), 'PPP')}</strong>
                    </span>
                  </div>
                )}
                {campaign.timeline_start && (
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span>
                      Campaign Start:{' '}
                      <strong>{format(new Date(campaign.timeline_start), 'PPP')}</strong>
                    </span>
                  </div>
                )}
                {campaign.timeline_end && (
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span>
                      Campaign End:{' '}
                      <strong>{format(new Date(campaign.timeline_end), 'PPP')}</strong>
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Availability */}
            <div className="p-4 rounded-lg bg-secondary/20 border border-border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold">Spots Available</p>
                  <p className="text-sm text-muted-foreground">
                    {spotsRemaining} of {campaign.spots_available} spots remaining
                  </p>
                </div>
                <Badge
                  variant={spotsRemaining > 0 ? 'default' : 'secondary'}
                  className="text-lg px-4 py-2"
                >
                  {spotsRemaining}
                </Badge>
              </div>
            </div>
          </div>
        </ScrollArea>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4 pb-2 border-t px-6">
          <Button
            variant="outline"
            onClick={isSaved ? onUnsave : onSave}
            className="gap-2"
          >
            <Heart
              className={`w-4 h-4 ${isSaved ? 'fill-red-500 text-red-500' : ''}`}
            />
            {isSaved ? 'Saved' : 'Save for Later'}
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              const url = `${window.location.origin}/brand-deals/${campaign.id}`;
              navigator.clipboard.writeText(url);
              toast({ title: 'Link copied!', description: 'Brand deal link copied to clipboard' });
            }}
            className="gap-2"
            aria-label="Share brand deal"
          >
            <Share2 className="w-4 h-4" />
            Share
          </Button>
          <Button
            onClick={isDemoMode ? () => navigate('/auth') : onApply}
            disabled={!isDemoMode && (hasApplied || spotsRemaining === 0)}
            className="flex-1"
          >
            {hasApplied
              ? 'Already Applied'
              : spotsRemaining === 0
              ? 'Campaign Full'
              : 'Apply Now'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
