import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

interface PostingTimeHeatmapProps {
  posts: any[];
}

export const PostingTimeHeatmap = ({ posts }: PostingTimeHeatmapProps) => {
  const heatmapData = useMemo(() => {
    const data: Record<string, Record<number, { count: number; avgEngagement: number }>> = {};
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    // Initialize data structure
    days.forEach(day => {
      data[day] = {};
      for (let hour = 0; hour < 24; hour++) {
        data[day][hour] = { count: 0, avgEngagement: 0 };
      }
    });

    // Populate with post data
    posts.forEach(post => {
      if (!post.posting_date) return;
      
      const date = new Date(post.posting_date);
      const day = days[date.getDay()];
      const hour = date.getHours();
      const engagement = (post.likes_count || 0) + (post.views_count || 0) * 0.1;

      data[day][hour].count++;
      data[day][hour].avgEngagement += engagement;
    });

    // Calculate averages
    days.forEach(day => {
      for (let hour = 0; hour < 24; hour++) {
        if (data[day][hour].count > 0) {
          data[day][hour].avgEngagement /= data[day][hour].count;
        }
      }
    });

    return data;
  }, [posts]);

  const getEngagementColor = (engagement: number, maxEngagement: number) => {
    if (engagement === 0) return 'bg-muted';
    const intensity = (engagement / maxEngagement) * 100;
    if (intensity > 75) return 'bg-green-500';
    if (intensity > 50) return 'bg-green-400';
    if (intensity > 25) return 'bg-yellow-400';
    return 'bg-yellow-300';
  };

  const maxEngagement = Math.max(
    ...Object.values(heatmapData).flatMap(day =>
      Object.values(day).map(slot => slot.avgEngagement)
    )
  );

  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const hours = Array.from({ length: 24 }, (_, i) => i);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Best Times to Post</CardTitle>
        <p className="text-sm text-muted-foreground">
          Heatmap showing average engagement by day and hour
        </p>
      </CardHeader>
      <CardContent>
        <TooltipProvider>
          <div className="overflow-x-auto">
            <div className="inline-block min-w-full">
              {/* Hour labels */}
              <div className="flex mb-2">
                <div className="w-12" />
                {hours.map(hour => (
                  <div key={hour} className="w-8 text-xs text-center text-muted-foreground">
                    {hour % 4 === 0 ? `${hour}h` : ''}
                  </div>
                ))}
              </div>

              {/* Heatmap grid */}
              {days.map(day => (
                <div key={day} className="flex items-center mb-1">
                  <div className="w-12 text-xs font-medium">{day}</div>
                  {hours.map(hour => {
                    const slot = heatmapData[day][hour];
                    return (
                      <Tooltip key={hour}>
                        <TooltipTrigger asChild>
                          <div
                            className={cn(
                              'w-8 h-6 mx-px rounded cursor-pointer transition-all hover:scale-110',
                              getEngagementColor(slot.avgEngagement, maxEngagement)
                            )}
                          />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="font-semibold">{day} at {hour}:00</p>
                          <p className="text-sm">Posts: {slot.count}</p>
                          <p className="text-sm">
                            Avg Engagement: {slot.avgEngagement.toFixed(0)}
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    );
                  })}
                </div>
              ))}

              {/* Legend */}
              <div className="flex items-center gap-2 mt-4 text-xs text-muted-foreground">
                <span>Low</span>
                <div className="flex gap-1">
                  <div className="w-4 h-4 bg-muted rounded" />
                  <div className="w-4 h-4 bg-yellow-300 rounded" />
                  <div className="w-4 h-4 bg-yellow-400 rounded" />
                  <div className="w-4 h-4 bg-green-400 rounded" />
                  <div className="w-4 h-4 bg-green-500 rounded" />
                </div>
                <span>High</span>
              </div>
            </div>
          </div>
        </TooltipProvider>
      </CardContent>
    </Card>
  );
};
