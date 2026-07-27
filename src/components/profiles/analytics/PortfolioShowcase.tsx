import { useState } from 'react';
import { usePortfolio, SortOption } from '@/hooks/usePortfolio';
import { PortfolioPostCard } from './PortfolioPostCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Image as ImageIcon, TrendingUp, Calendar } from 'lucide-react';
import PostDetailsModal from '@/components/profiles/posts/PostDetailsModal';

interface PortfolioShowcaseProps {
  userId: string;
}

export const PortfolioShowcase = ({ userId }: PortfolioShowcaseProps) => {
  const {
    posts,
    stats,
    loading,
    sortBy,
    setSortBy,
    getPerformanceBadge,
  } = usePortfolio(userId);

  const [selectedPost, setSelectedPost] = useState<any>(null);

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US', {
      notation: 'compact',
      compactDisplay: 'short',
    }).format(num);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="aspect-square" />
          ))}
        </div>
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <ImageIcon className="w-12 h-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Content Yet</h3>
          <p className="text-sm text-muted-foreground text-center max-w-md">
            Start uploading your best performing content to build your portfolio and showcase your work to potential partners.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-primary" />
              Total Posts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{stats.totalPosts}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-green-500" />
              Avg. Engagement
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatNumber(stats.avgEngagement)}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Calendar className="w-4 h-4 text-blue-500" />
              Best Platform
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{stats.bestPlatform}</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold">Your Portfolio</h3>
          <p className="text-sm text-muted-foreground">
            Showcase your best performing content
          </p>
        </div>
        <Select value={sortBy} onValueChange={(value) => setSortBy(value as SortOption)}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest First</SelectItem>
            <SelectItem value="most_likes">Most Likes</SelectItem>
            <SelectItem value="most_views">Most Views</SelectItem>
            <SelectItem value="highest_engagement">Highest Engagement</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Portfolio Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {posts.map((post) => (
          <PortfolioPostCard
            key={post.id}
            mediaUrl={post.media_url}
            mediaType={post.media_type}
            likesCount={post.likes_count || 0}
            viewsCount={post.views_count || 0}
            caption={post.caption}
            propertyTitle={post.property_title}
            performanceBadge={getPerformanceBadge(post)}
            onClick={() => setSelectedPost(post)}
          />
        ))}
      </div>

      {/* Post Details Modal */}
      {selectedPost && (
        <PostDetailsModal
          post={selectedPost}
          open={!!selectedPost}
          onOpenChange={(open) => !open && setSelectedPost(null)}
        />
      )}
    </div>
  );
};
