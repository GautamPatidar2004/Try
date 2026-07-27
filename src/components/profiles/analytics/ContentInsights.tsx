import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle, TrendingUp } from 'lucide-react';
import { useContentRecommendations } from '@/hooks/useContentRecommendations';

interface ContentInsightsProps {
  userId: string;
}

export const ContentInsights = ({ userId }: ContentInsightsProps) => {
  const { data, isLoading } = useContentRecommendations(userId);

  if (isLoading) {
    return <div className="animate-pulse">Loading insights...</div>;
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-500/10 text-red-500 border-red-500/20';
      case 'medium':
        return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
      case 'low':
        return 'bg-green-500/10 text-green-500 border-green-500/20';
      default:
        return 'bg-primary/10 text-primary border-primary/20';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high':
        return <AlertCircle className="w-4 h-4" />;
      case 'medium':
        return <TrendingUp className="w-4 h-4" />;
      case 'low':
        return <CheckCircle className="w-4 h-4" />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <Card className="glass-effect">
        <CardHeader>
          <CardTitle>Content Recommendations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data?.recommendations?.map((rec: any, index: number) => (
              <div
                key={index}
                className="flex items-start gap-4 p-4 bg-muted/50 rounded-lg hover:bg-muted/70 transition-colors"
              >
                <div className={`p-2 rounded-lg ${getPriorityColor(rec.priority)}`}>
                  {getPriorityIcon(rec.priority)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-medium capitalize">
                      {rec.type.replace(/_/g, ' ')}
                    </p>
                    <Badge variant="outline" className={getPriorityColor(rec.priority)}>
                      {rec.priority}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{rec.message}</p>
                </div>
              </div>
            ))}

            {(!data?.recommendations || data.recommendations.length === 0) && (
              <div className="text-center py-12 text-muted-foreground">
                Post more content to get personalized recommendations
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="glass-effect">
        <CardHeader>
          <CardTitle>Performance Tips</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
              <div>
                <p className="font-medium">Post Consistently</p>
                <p className="text-sm text-muted-foreground">
                  Aim for 3-5 posts per week to maintain engagement
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
              <div>
                <p className="font-medium">Use Trending Hashtags</p>
                <p className="text-sm text-muted-foreground">
                  Research and use 5-10 relevant hashtags per post
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
              <div>
                <p className="font-medium">Engage with Your Audience</p>
                <p className="text-sm text-muted-foreground">
                  Respond to comments within the first hour of posting
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
              <div>
                <p className="font-medium">Analyze Peak Times</p>
                <p className="text-sm text-muted-foreground">
                  Post when your audience is most active
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};