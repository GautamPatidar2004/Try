import { useState } from 'react';
import { TikTokMetrics, AudienceData, ContentItem } from '@/data/mockPortfolioData';
import { PortfolioMetricCard } from '../shared/PortfolioMetricCard';
import { ContentGalleryGrid } from '../shared/ContentGalleryGrid';
import { Users, TrendingUp, Eye, Heart, MessageCircle, Share2, Film, CheckCircle2, RefreshCw, Music2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { usePortfolioFilters } from '@/hooks/usePortfolioFilters';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface PortfolioTikTokProps {
  metrics: TikTokMetrics | null;
  audienceData: AudienceData | null;
  content: ContentItem[];
  onContentClick: (content: ContentItem) => void;
  creatorId?: string;
  hasTikTokData: boolean;
}

export const PortfolioTikTok = ({
  metrics,
  audienceData,
  content,
  onContentClick,
  creatorId,
  hasTikTokData,
}: PortfolioTikTokProps) => {
  const { filters, setFilters, filteredContent } = usePortfolioFilters(content, 'tiktok');
  const [isSyncing, setIsSyncing] = useState(false);

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const displayValue = (v: number) => (v && v > 0 ? formatNumber(v) : 'N/A');

  const handleResync = async () => {
    if (!creatorId) return;
    setIsSyncing(true);
    try {
      const { error } = await supabase.functions.invoke('sync-tiktok-analytics', {
        body: { userId: creatorId },
      });
      if (error) throw error;
      toast.success('TikTok data synced! Refresh to see updated metrics.');
    } catch (e: any) {
      toast.error(e.message || 'Failed to sync TikTok data');
    } finally {
      setIsSyncing(false);
    }
  };

  if (!hasTikTokData || !metrics) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <Music2 className="h-12 w-12 mb-4 text-muted-foreground opacity-50" />
        <h3 className="text-lg font-semibold mb-1">No TikTok data yet</h3>
        <p className="text-sm text-muted-foreground max-w-sm">
          This creator hasn't connected their TikTok account, so we can't show verified analytics.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Verification Badge */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <Badge className="bg-gradient-to-r from-cyan-500 to-pink-500">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Verified Metrics
          </Badge>
          <span className="text-xs text-muted-foreground">
            Last synced: {new Date(metrics.lastSynced).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </span>
        </div>
        {creatorId && (
          <Button variant="outline" size="sm" onClick={handleResync} disabled={isSyncing}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isSyncing ? 'animate-spin' : ''}`} />
            {isSyncing ? 'Syncing...' : 'Re-sync Data'}
          </Button>
        )}
      </div>

      {/* Metrics */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Performance Metrics (30 Days)</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <PortfolioMetricCard icon={Users} label="Followers" value={formatNumber(metrics.followers)} tooltip="Total TikTok followers" />
          <PortfolioMetricCard icon={TrendingUp} label="Engagement Rate" value={metrics.engagementRate > 0 ? `${metrics.engagementRate}%` : 'N/A'} tooltip="Engagements ÷ views across recent videos" />
          <PortfolioMetricCard icon={Eye} label="Total Views" value={displayValue(metrics.views)} tooltip="Sum of views across recent videos" />
          <PortfolioMetricCard icon={Heart} label="Total Engagements" value={displayValue(metrics.totalEngagements)} tooltip="Likes + Comments + Shares" />
          <PortfolioMetricCard icon={Eye} label="Avg Views/Video" value={displayValue(metrics.avgViews)} />
          <PortfolioMetricCard icon={Heart} label="Avg Likes" value={displayValue(metrics.avgLikes)} />
          <PortfolioMetricCard icon={MessageCircle} label="Avg Comments" value={displayValue(metrics.avgComments)} />
          <PortfolioMetricCard icon={Share2} label="Avg Shares" value={displayValue(metrics.avgShares)} />
          <PortfolioMetricCard icon={Film} label="Videos" value={metrics.videoCount.lifetime > 0 ? metrics.videoCount.lifetime.toString() : 'N/A'} tooltip={`Recent fetched: ${metrics.videoCount.last30Days}`} />
        </div>
      </div>

      <p className="text-xs text-muted-foreground">
        Audience demographics are not available — TikTok's API does not expose demographic data on standard creator scopes.
      </p>

      {/* Content Gallery */}
      <div>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
          <h2 className="text-2xl font-bold">Content Gallery</h2>
          
          <div className="flex flex-wrap gap-2">
            <Select
              value={filters.dateRange}
              onValueChange={(value) => setFilters({ ...filters, dateRange: value as any })}
            >
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="30">30 days</SelectItem>
                <SelectItem value="60">60 days</SelectItem>
                <SelectItem value="90">90 days</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={filters.sortBy}
              onValueChange={(value) => setFilters({ ...filters, sortBy: value as any })}
            >
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date">Most Recent</SelectItem>
                <SelectItem value="views">Highest Views</SelectItem>
                <SelectItem value="engagements">Most Engaged</SelectItem>
                <SelectItem value="likes">Most Liked</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <ContentGalleryGrid content={filteredContent} onContentClick={onContentClick} />
      </div>
    </div>
  );
};
