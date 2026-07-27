import { useState } from 'react';
import { InstagramMetrics, AudienceData, ContentItem } from '@/data/mockPortfolioData';
import { PortfolioMetricCard } from '../shared/PortfolioMetricCard';
import { AudienceChart } from '../shared/AudienceChart';
import { ContentGalleryGrid } from '../shared/ContentGalleryGrid';
import { Users, TrendingUp, Eye, Heart, MessageCircle, Film, Image as ImageIcon, CheckCircle2, RefreshCw, Instagram } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { usePortfolioFilters } from '@/hooks/usePortfolioFilters';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface PortfolioInstagramProps {
  metrics: InstagramMetrics | null;
  audienceData: AudienceData | null;
  content: ContentItem[];
  onContentClick: (content: ContentItem) => void;
  creatorId?: string;
  hasInstagramData: boolean;
}

export const PortfolioInstagram = ({
  metrics,
  audienceData,
  content,
  onContentClick,
  creatorId,
  hasInstagramData,
}: PortfolioInstagramProps) => {
  const { filters, setFilters, filteredContent } = usePortfolioFilters(content, 'instagram');
  const [isSyncing, setIsSyncing] = useState(false);

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  // Helper to display value or N/A for unavailable metrics
  const displayValue = (value: number, format = true) => {
    if (value === 0) return 'N/A';
    return format ? formatNumber(value) : value.toString();
  };

  const handleResync = async () => {
    if (!creatorId) {
      toast.error('Unable to sync - creator ID not available');
      return;
    }

    setIsSyncing(true);
    try {
      const { data, error } = await supabase.functions.invoke('sync-meta-analytics', {
        body: { userId: creatorId, platform: 'instagram' }
      });

      if (error) throw error;
      
      toast.success('Instagram data synced successfully! Refresh the page to see updated data.');
    } catch (error: any) {
      console.error('Sync error:', error);
      toast.error(error.message || 'Failed to sync Instagram data');
    } finally {
      setIsSyncing(false);
    }
  };

  if (!hasInstagramData || !metrics) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <Instagram className="h-12 w-12 mb-4 text-muted-foreground opacity-50" />
        <h3 className="text-lg font-semibold mb-1">No Instagram data yet</h3>
        <p className="text-sm text-muted-foreground max-w-sm">
          This creator hasn't connected their Instagram account, so we can't show verified analytics.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Verification Badge and Sync Button */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <Badge className="bg-gradient-to-r from-purple-500 to-pink-500">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Verified Metrics
          </Badge>
          <span className="text-xs text-muted-foreground">
            Last synced: {new Date(metrics.lastSynced).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </span>
        </div>
        {creatorId && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleResync}
            disabled={isSyncing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isSyncing ? 'animate-spin' : ''}`} />
            {isSyncing ? 'Syncing...' : 'Re-sync Data'}
          </Button>
        )}
      </div>

      {/* Metrics */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Performance Metrics (30 Days)</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <PortfolioMetricCard
            icon={Users}
            label="Followers"
            value={formatNumber(metrics.followers)}
            tooltip="Total Instagram followers"
          />
          <PortfolioMetricCard
            icon={TrendingUp}
            label="Engagement Rate"
            value={metrics.engagementRate > 0 ? `${metrics.engagementRate}%` : 'N/A'}
            tooltip="30d engagements ÷ 30d reach"
          />
          <PortfolioMetricCard
            icon={Eye}
            label="Reach"
            value={displayValue(metrics.reach)}
            tooltip="Unique accounts reached"
          />
          <PortfolioMetricCard
            icon={Heart}
            label="Total Engagements"
            value={displayValue(metrics.totalEngagements)}
            tooltip="Likes + Comments + Saves + Shares"
          />
          <PortfolioMetricCard
            icon={Heart}
            label="Avg Likes/Post"
            value={displayValue(metrics.avgLikes)}
          />
          <PortfolioMetricCard
            icon={MessageCircle}
            label="Avg Comments"
            value={displayValue(metrics.avgComments)}
          />
          <PortfolioMetricCard
            icon={ImageIcon}
            label="Posts"
            value={metrics.postCount.lifetime > 0 ? metrics.postCount.lifetime.toString() : 'N/A'}
            tooltip="Total posts"
          />
          {/* Only show these if we have real data - hide when 0 as Meta API may not provide */}
          {metrics.avgReelsViews > 0 && (
            <PortfolioMetricCard
              icon={Film}
              label="Avg Reels Views"
              value={formatNumber(metrics.avgReelsViews)}
            />
          )}
          {metrics.avgStoryViews > 0 && (
            <PortfolioMetricCard
              icon={ImageIcon}
              label="Avg Story Views"
              value={formatNumber(metrics.avgStoryViews)}
            />
          )}
          {metrics.impressions > 0 && (
            <PortfolioMetricCard
              icon={Eye}
              label="Impressions"
              value={formatNumber(metrics.impressions)}
              tooltip="Total times content was displayed"
            />
          )}
        </div>
      </div>

      {/* Audience Insights */}
      {audienceData ? (
        <div>
          <h2 className="text-2xl font-bold mb-4">Audience Insights</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <AudienceChart type="gender" data={audienceData.gender} title="Gender Distribution" />
            <AudienceChart type="age" data={audienceData.age} title="Age Distribution" />
          </div>

          <div className="grid md:grid-cols-2 gap-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Top Cities</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {audienceData.topCities.map((city) => (
                    <div key={city.name} className="flex justify-between items-center">
                      <span className="text-sm">{city.name}</span>
                      <span className="text-sm font-semibold">{city.percentage}%</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Top Countries</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {audienceData.topCountries.map((country) => (
                    <div key={country.name} className="flex justify-between items-center">
                      <span className="text-sm">{country.name}</span>
                      <span className="text-sm font-semibold">{country.percentage}%</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">
          Audience demographics aren't available yet — they appear once Instagram returns demographic insights for this account (requires sufficient audience size per Meta).
        </p>
      )}

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
              value={filters.type}
              onValueChange={(value) => setFilters({ ...filters, type: value as any })}
            >
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="reel">Reels</SelectItem>
                <SelectItem value="post">Posts</SelectItem>
                <SelectItem value="story">Stories</SelectItem>
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
                <SelectItem value="reach">Highest Reach</SelectItem>
                <SelectItem value="impressions">Most Impressions</SelectItem>
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
