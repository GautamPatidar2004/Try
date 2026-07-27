import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, Heart } from "lucide-react";

interface Post {
  id: string;
  caption: string;
  likes_count: number;
  views_count: number;
  influencers: {
    profiles: {
      first_name: string;
      last_name: string;
    } | null;
  } | null;
}

interface TopPostsCardProps {
  posts: Post[];
}

const TopPostsCard = ({ posts }: TopPostsCardProps) => {
  const topPosts = [...posts]
    .sort((a, b) => (b.likes_count + b.views_count) - (a.likes_count + a.views_count))
    .slice(0, 5);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Top Performing Posts</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {topPosts.map((post, index) => (
            <div key={post.id} className="flex items-start gap-3 pb-3 border-b last:border-0">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-semibold text-sm">
                {index + 1}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  {post.caption?.slice(0, 50) || 'No caption'}
                </p>
                <p className="text-xs text-muted-foreground">
                  by {post.influencers?.profiles?.first_name} {post.influencers?.profiles?.last_name}
                </p>
                <div className="flex items-center gap-3 mt-1">
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Heart className="w-3 h-3" />
                    {post.likes_count}
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Eye className="w-3 h-3" />
                    {post.views_count}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default TopPostsCard;
