import { useMemo } from 'react';
import { useCreatorPosts } from '@/hooks/useCreatorPosts';
import { PostingTimeHeatmap } from './PostingTimeHeatmap';
import { HashtagPerformanceTable } from './HashtagPerformanceTable';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { TrendingUp, Image, Video, Film } from 'lucide-react';

interface ContentPerformanceAnalysisProps {
  userId: string;
}

export const ContentPerformanceAnalysis = ({ userId }: ContentPerformanceAnalysisProps) => {
  const { allPosts, loading } = useCreatorPosts(userId);

  const timelineData = useMemo(() => {
    const grouped: Record<string, { date: string; likes: number; views: number; count: number }> = {};

    allPosts.forEach(post => {
      const date = new Date(post.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      if (!grouped[date]) {
        grouped[date] = { date, likes: 0, views: 0, count: 0 };
      }
      grouped[date].likes += post.likes_count || 0;
      grouped[date].views += post.views_count || 0;
      grouped[date].count++;
    });

    return Object.values(grouped).map(item => ({
      date: item.date,
      avgLikes: Math.round(item.likes / item.count),
      avgViews: Math.round(item.views / item.count),
    }));
  }, [allPosts]);

  const contentTypeData = useMemo(() => {
    const types: Record<string, { count: number; engagement: number }> = {
      photo: { count: 0, engagement: 0 },
      video: { count: 0, engagement: 0 },
      reel: { count: 0, engagement: 0 },
    };

    allPosts.forEach(post => {
      const type = post.media_type?.toLowerCase() || 'photo';
      const engagement = (post.likes_count || 0) + (post.views_count || 0) * 0.1;
      
      if (types[type]) {
        types[type].count++;
        types[type].engagement += engagement;
      } else {
        types.photo.count++;
        types.photo.engagement += engagement;
      }
    });

    return Object.entries(types)
      .filter(([_, data]) => data.count > 0)
      .map(([type, data]) => ({
        name: type.charAt(0).toUpperCase() + type.slice(1),
        value: data.count,
        avgEngagement: Math.round(data.engagement / data.count),
      }));
  }, [allPosts]);

  const insights = useMemo(() => {
    if (allPosts.length < 3) return [];

    const result: string[] = [];

    // Content type insights
    if (contentTypeData.length > 1) {
      const sorted = [...contentTypeData].sort((a, b) => b.avgEngagement - a.avgEngagement);
      const best = sorted[0];
      const worst = sorted[sorted.length - 1];
      if (best.avgEngagement > worst.avgEngagement * 1.5) {
        const multiplier = (best.avgEngagement / worst.avgEngagement).toFixed(1);
        result.push(`Your ${best.name}s get ${multiplier}x more engagement than ${worst.name}s`);
      }
    }

    // Best performing posts
    const sortedByEngagement = [...allPosts].sort((a, b) => {
      const engA = (a.likes_count || 0) + (a.views_count || 0) * 0.1;
      const engB = (b.likes_count || 0) + (b.views_count || 0) * 0.1;
      return engB - engA;
    });

    const topPosts = sortedByEngagement.slice(0, 3);
    const avgTopEngagement = topPosts.reduce((acc, post) => 
      acc + (post.likes_count || 0) + (post.views_count || 0) * 0.1, 0
    ) / 3;
    
    const avgAllEngagement = allPosts.reduce((acc, post) => 
      acc + (post.likes_count || 0) + (post.views_count || 0) * 0.1, 0
    ) / allPosts.length;

    if (avgTopEngagement > avgAllEngagement * 2) {
      result.push(`Your top 3 posts perform ${(avgTopEngagement / avgAllEngagement).toFixed(1)}x better than average`);
    }

    return result;
  }, [allPosts, contentTypeData]);

  const COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--accent))'];

  if (loading) {
    return (
      <div className="space-y-6">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-96" />
        ))}
      </div>
    );
  }

  if (allPosts.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <TrendingUp className="w-12 h-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Content Data</h3>
          <p className="text-sm text-muted-foreground text-center max-w-md">
            Upload content to see detailed performance analysis and insights.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Automated Insights */}
      {insights.length > 0 && (
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-primary">
              <TrendingUp className="w-5 h-5" />
              Key Insights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {insights.map((insight, i) => (
                <li key={i} className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2" />
                  <span className="text-sm">{insight}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Performance Timeline */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Timeline</CardTitle>
          <p className="text-sm text-muted-foreground">
            Average engagement over time
          </p>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={timelineData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="avgLikes" stroke="hsl(var(--primary))" name="Avg Likes" />
              <Line type="monotone" dataKey="avgViews" stroke="hsl(var(--secondary))" name="Avg Views" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Content Type Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Content Type Performance</CardTitle>
          <p className="text-sm text-muted-foreground">
            Distribution and average engagement by content type
          </p>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={contentTypeData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}`}
                outerRadius={80}
                fill="hsl(var(--primary))"
                dataKey="value"
              >
                {contentTypeData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Hashtag Performance */}
      <HashtagPerformanceTable posts={allPosts} />

      {/* Posting Time Heatmap */}
      <PostingTimeHeatmap posts={allPosts} />
    </div>
  );
};
