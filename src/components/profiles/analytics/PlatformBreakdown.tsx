import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Instagram, Youtube, Twitter, Music } from 'lucide-react';
import { GrowthIndicator } from './GrowthIndicator';
import type { PlatformStat } from '@/hooks/useCreatorAnalytics';

interface PlatformBreakdownProps {
  platforms: PlatformStat[];
}

const platformIcons: Record<string, any> = {
  instagram: Instagram,
  youtube: Youtube,
  twitter: Twitter,
  tiktok: Music,
};

const platformColors: Record<string, string> = {
  instagram: 'from-pink-500 to-purple-500',
  youtube: 'from-red-500 to-red-600',
  twitter: 'from-blue-400 to-blue-500',
  tiktok: 'from-black to-pink-500',
};

export const PlatformBreakdown = ({ platforms }: PlatformBreakdownProps) => {
  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  return (
    <Card className="glass-effect border-border/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Platform Breakdown
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {platforms.map((platform) => {
            const Icon = platformIcons[platform.platform.toLowerCase()] || Instagram;
            const gradientColor = platformColors[platform.platform.toLowerCase()] || 'from-gray-500 to-gray-600';

            return (
              <div
                key={platform.platform}
                className="group relative p-6 rounded-xl border border-border/50 hover-lift bg-gradient-to-br from-background/50 to-background overflow-hidden"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${gradientColor} opacity-5 group-hover:opacity-10 transition-opacity`} />
                
                <div className="relative">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg bg-gradient-to-br ${gradientColor}`}>
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold capitalize">{platform.platform}</h3>
                        {platform.isVerified && (
                          <Badge variant="secondary" className="mt-1 text-xs">
                            Verified
                          </Badge>
                        )}
                      </div>
                    </div>
                    <GrowthIndicator value={platform.growth} />
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Followers</span>
                      <span className="font-semibold">{formatNumber(platform.followerCount)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Posts</span>
                      <span className="font-semibold">{platform.postCount}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Avg. Engagement</span>
                      <span className="font-semibold">{platform.avgEngagement.toFixed(1)}%</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {platforms.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">No social accounts connected</p>
            <p className="text-sm text-muted-foreground">
              Connect your social media accounts to see platform analytics
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
