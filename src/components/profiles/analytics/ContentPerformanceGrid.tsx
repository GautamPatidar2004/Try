import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Heart, Eye, TrendingUp, Play } from 'lucide-react';
import type { PostMetric } from '@/hooks/useCreatorAnalytics';

interface ContentPerformanceGridProps {
  posts: PostMetric[];
}

export const ContentPerformanceGrid = ({ posts }: ContentPerformanceGridProps) => {
  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  return (
    <Card className="glass-effect border-border/50">
      <CardHeader>
        <CardTitle>Top Performing Content</CardTitle>
      </CardHeader>
      <CardContent>
        {posts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {posts.map((post) => (
              <div
                key={post.id}
                className="group relative rounded-xl overflow-hidden hover-lift cursor-pointer"
              >
                <div className="aspect-square relative overflow-hidden bg-muted">
                  {post.mediaType === 'video' ? (
                    <>
                      <video
                        src={post.mediaUrl}
                        preload="metadata"
                        muted
                        playsInline
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="bg-black/50 rounded-full p-3 backdrop-blur-sm">
                          <Play className="w-6 h-6 text-white" fill="white" />
                        </div>
                      </div>
                    </>
                  ) : (
                    <img
                      src={post.mediaUrl}
                      alt={post.caption}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  
                  <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform">
                    <div className="flex items-center gap-4 text-white text-sm mb-2">
                      <div className="flex items-center gap-1">
                        <Heart className="w-4 h-4" />
                        <span>{formatNumber(post.likes)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Eye className="w-4 h-4" />
                        <span>{formatNumber(post.views)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <TrendingUp className="w-4 h-4" />
                        <span>{post.engagement.toFixed(1)}%</span>
                      </div>
                    </div>
                    <p className="text-white text-xs line-clamp-2">{post.caption}</p>
                  </div>

                  <div className="absolute top-2 right-2">
                    <Badge variant="secondary" className="capitalize backdrop-blur-sm bg-background/80">
                      {post.platform}
                    </Badge>
                  </div>

                  {post.propertyTitle && (
                    <div className="absolute top-2 left-2">
                      <Badge variant="default" className="backdrop-blur-sm">
                        {post.propertyTitle}
                      </Badge>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-2">No content posts yet</p>
            <p className="text-sm text-muted-foreground">
              Start creating content to see your top performers
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
