import { PortfolioCreator } from '../types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Instagram, Music2 } from 'lucide-react';
import { PortfolioMetricCard } from '../shared/PortfolioMetricCard';
import { AudienceChart } from '../shared/AudienceChart';
import { ContentGalleryGrid } from '../shared/ContentGalleryGrid';
import { Users, TrendingUp, Eye, Heart } from 'lucide-react';
import { InstagramMetrics, TikTokMetrics, AudienceData, ContentItem } from '@/data/mockPortfolioData';

interface PortfolioOverviewProps {
  creator: PortfolioCreator;
  instagramMetrics: InstagramMetrics | null;
  tiktokMetrics: TikTokMetrics | null;
  audienceData: AudienceData | null;
  featuredContent: ContentItem[];
  onContentClick: (content: ContentItem) => void;
  hasInstagramData: boolean;
  hasTikTokData: boolean;
}

export const PortfolioOverview = ({
  creator,
  instagramMetrics,
  tiktokMetrics,
  audienceData,
  featuredContent,
  onContentClick,
  hasInstagramData,
  hasTikTokData,
}: PortfolioOverviewProps) => {
  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  return (
    <div className="space-y-8">
      {/* About Section */}
      <Card>
        <CardHeader>
          <CardTitle>About</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground leading-relaxed">{creator.bio}</p>
        </CardContent>
      </Card>

      {/* Cross-Platform Highlights */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Last 30 Days Performance</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="border-pink-500/20">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <span className="text-pink-500">Instagram</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {hasInstagramData && instagramMetrics ? (
                <div className="grid grid-cols-2 gap-4">
                  <PortfolioMetricCard icon={Users} label="Followers" value={formatNumber(instagramMetrics.followers)} />
                  <PortfolioMetricCard icon={TrendingUp} label="Engagement" value={`${instagramMetrics.engagementRate}%`} />
                  <PortfolioMetricCard icon={Eye} label="Reach" value={formatNumber(instagramMetrics.reach)} />
                  <PortfolioMetricCard icon={Heart} label="Avg Likes" value={formatNumber(instagramMetrics.avgLikes)} />
                </div>
              ) : (
                <div className="text-center py-8 text-sm text-muted-foreground">
                  <Instagram className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  Instagram not connected yet.
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-cyan-500/20">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <span className="text-cyan-500">TikTok</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {hasTikTokData && tiktokMetrics ? (
                <div className="grid grid-cols-2 gap-4">
                  <PortfolioMetricCard icon={Users} label="Followers" value={formatNumber(tiktokMetrics.followers)} />
                  <PortfolioMetricCard icon={TrendingUp} label="Engagement" value={`${tiktokMetrics.engagementRate}%`} />
                  <PortfolioMetricCard icon={Eye} label="Views" value={formatNumber(tiktokMetrics.views)} />
                  <PortfolioMetricCard icon={Heart} label="Avg Likes" value={formatNumber(tiktokMetrics.avgLikes)} />
                </div>
              ) : (
                <div className="text-center py-8 text-sm text-muted-foreground">
                  <Music2 className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  TikTok not connected yet.
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Audience Overview */}
      {audienceData && (
        <div>
          <h2 className="text-2xl font-bold mb-4">Audience Demographics (Instagram)</h2>
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
      )}

      {/* Featured Content */}
      {featuredContent.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold mb-4">Featured Content</h2>
          <ContentGalleryGrid content={featuredContent} onContentClick={onContentClick} />
        </div>
      )}
    </div>
  );
};
