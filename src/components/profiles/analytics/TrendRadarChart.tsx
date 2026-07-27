import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp } from 'lucide-react';

interface TrendData {
  topic: string;
  opportunityScore: number;
  currentCoverage: string;
  recommendation: string;
}

interface TrendRadarChartProps {
  trends: TrendData[];
}

export const TrendRadarChart = ({ trends }: TrendRadarChartProps) => {
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-yellow-500';
    return 'bg-orange-500';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5" />
          Trending Topics & Opportunities
        </CardTitle>
        <CardDescription>
          AI-detected trends in your niche with opportunity scoring
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {trends.map((trend, index) => (
            <div key={index} className="space-y-2">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="font-semibold">{trend.topic}</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    {trend.recommendation}
                  </p>
                </div>
                <Badge variant="secondary" className="ml-2">
                  {trend.opportunityScore}% opportunity
                </Badge>
              </div>
              
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Current Coverage: {trend.currentCoverage}</span>
                  <span>{trend.opportunityScore}%</span>
                </div>
                <div className="h-2 bg-secondary rounded-full overflow-hidden">
                  <div
                    className={`h-full ${getScoreColor(trend.opportunityScore)} transition-all`}
                    style={{ width: `${trend.opportunityScore}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};