import { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Hash, TrendingUp } from 'lucide-react';

interface HashtagPerformanceTableProps {
  posts: any[];
}

export const HashtagPerformanceTable = ({ posts }: HashtagPerformanceTableProps) => {
  const [showAll, setShowAll] = useState(false);

  const hashtagStats = useMemo(() => {
    const stats: Record<string, { count: number; totalLikes: number; totalViews: number }> = {};

    posts.forEach(post => {
      if (!post.hashtags) return;
      
      const hashtags = Array.isArray(post.hashtags) ? post.hashtags : [];
      const likes = post.likes_count || 0;
      const views = post.views_count || 0;

      hashtags.forEach((tag: string) => {
        const cleanTag = tag.toLowerCase().replace('#', '');
        if (!stats[cleanTag]) {
          stats[cleanTag] = { count: 0, totalLikes: 0, totalViews: 0 };
        }
        stats[cleanTag].count++;
        stats[cleanTag].totalLikes += likes;
        stats[cleanTag].totalViews += views;
      });
    });

    // Convert to array and calculate averages
    return Object.entries(stats)
      .map(([tag, data]) => ({
        tag,
        count: data.count,
        avgLikes: Math.round(data.totalLikes / data.count),
        avgViews: Math.round(data.totalViews / data.count),
        avgEngagement: Math.round((data.totalLikes + data.totalViews * 0.1) / data.count),
      }))
      .sort((a, b) => b.avgEngagement - a.avgEngagement);
  }, [posts]);

  const displayedHashtags = showAll ? hashtagStats : hashtagStats.slice(0, 10);

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US', {
      notation: 'compact',
      compactDisplay: 'short',
    }).format(num);
  };

  if (hashtagStats.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Hash className="w-5 h-5" />
            Hashtag Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-8">
            No hashtag data available. Add hashtags to your posts to track their performance.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Hash className="w-5 h-5" />
          Hashtag Performance
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Top performing hashtags by average engagement
        </p>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Hashtag</TableHead>
                <TableHead className="text-right">Uses</TableHead>
                <TableHead className="text-right">Avg Likes</TableHead>
                <TableHead className="text-right">Avg Views</TableHead>
                <TableHead className="text-right">Avg Engagement</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {displayedHashtags.map((stat, index) => (
                <TableRow key={stat.tag}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      #{stat.tag}
                      {index < 3 && (
                        <Badge variant="secondary" className="text-xs">
                          <TrendingUp className="w-3 h-3 mr-1" />
                          Top {index + 1}
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">{stat.count}</TableCell>
                  <TableCell className="text-right">{formatNumber(stat.avgLikes)}</TableCell>
                  <TableCell className="text-right">{formatNumber(stat.avgViews)}</TableCell>
                  <TableCell className="text-right font-semibold">
                    {formatNumber(stat.avgEngagement)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {hashtagStats.length > 10 && (
          <Button
            variant="outline"
            className="w-full mt-4"
            onClick={() => setShowAll(!showAll)}
          >
            {showAll ? 'Show Less' : `Show All ${hashtagStats.length} Hashtags`}
          </Button>
        )}
      </CardContent>
    </Card>
  );
};
