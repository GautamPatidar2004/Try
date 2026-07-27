import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, RefreshCw, Brain, Target, Calendar } from 'lucide-react';
import { IntelligenceScoreCard } from './IntelligenceScoreCard';
import { TrendRadarChart } from './TrendRadarChart';
import { ContentStrategyMatrix } from './ContentStrategyMatrix';
import { useContentIntelligence } from '@/hooks/useContentIntelligence';
import { format } from 'date-fns';

interface ContentIntelligenceDashboardProps {
  userId: string;
}

export const ContentIntelligenceDashboard = ({ userId }: ContentIntelligenceDashboardProps) => {
  const { report, isLoading, generate, isGenerating } = useContentIntelligence(userId);

  const intelligence = report?.intelligence_data as any;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Brain className="w-6 h-6 text-primary" />
            <h2 className="text-3xl font-bold">Content Intelligence</h2>
          </div>
          <p className="text-muted-foreground">
            Advanced AI-powered analysis of your content strategy and market position
          </p>
          {report?.created_at && (
            <p className="text-sm text-muted-foreground mt-1">
              Report generated: {format(new Date(report.created_at), 'PPp')}
            </p>
          )}
        </div>
        <Button
          onClick={() => generate()}
          disabled={isGenerating || !!report}
          className="gap-2"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <RefreshCw className="w-4 h-4" />
              {report ? 'Generated (7d cooldown)' : 'Generate Report'}
            </>
          )}
        </Button>
      </div>

      {!report && !isGenerating && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Brain className="w-16 h-16 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">No intelligence report yet</h3>
            <p className="text-muted-foreground text-center max-w-md mb-6">
              Generate a comprehensive intelligence report to get deep insights into your content performance, market trends, and strategic opportunities.
            </p>
            <Button onClick={() => generate()} disabled={isGenerating} className="gap-2">
              <Brain className="w-4 h-4" />
              Generate Intelligence Report
            </Button>
          </CardContent>
        </Card>
      )}

      {intelligence && (
        <>
          {/* Overall Score */}
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Overall Intelligence Score</CardTitle>
              <CardDescription>Comprehensive assessment of your creator performance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <div className="text-6xl font-bold text-primary">
                  {intelligence.overallScore}
                </div>
                <div className="flex-1">
                  <div className="h-4 bg-secondary rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary transition-all"
                      style={{ width: `${intelligence.overallScore}%` }}
                    />
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    {intelligence.overallScore >= 80 ? 'Excellent performance' :
                     intelligence.overallScore >= 60 ? 'Good performance with room to grow' :
                     'Significant opportunities for improvement'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <IntelligenceScoreCard
              title="Content Quality"
              score={intelligence.scores?.contentQuality || 0}
              icon={<Target className="w-4 h-4" />}
            />
            <IntelligenceScoreCard
              title="Growth Trajectory"
              score={intelligence.scores?.growthTrajectory || 0}
              icon={<Target className="w-4 h-4" />}
            />
            <IntelligenceScoreCard
              title="Monetization Potential"
              score={intelligence.scores?.monetizationPotential || 0}
              icon={<Target className="w-4 h-4" />}
            />
            <IntelligenceScoreCard
              title="Market Position"
              score={intelligence.scores?.marketPosition || 0}
              icon={<Target className="w-4 h-4" />}
            />
          </div>

          {/* Trend Analysis */}
          {intelligence.trendAnalysis?.trendingTopics && (
            <TrendRadarChart trends={intelligence.trendAnalysis.trendingTopics} />
          )}

          {/* Content Strategy Matrix */}
          {intelligence.contentStrategy && (
            <ContentStrategyMatrix
              bestPerforming={intelligence.contentStrategy.bestPerformingTypes || []}
              underperforming={intelligence.contentStrategy.underperformingTypes || []}
              quickWins={intelligence.contentStrategy.quickWins || []}
              longTermBets={intelligence.contentStrategy.longTermBets || []}
            />
          )}

          {/* Audience Insights */}
          {intelligence.audienceInsights && (
            <Card>
              <CardHeader>
                <CardTitle>Audience Insights</CardTitle>
                <CardDescription>Understanding your audience and engagement patterns</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-3">Best Posting Times</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {intelligence.audienceInsights.bestPostingTimes?.map((time: any, i: number) => (
                      <div key={i} className="p-3 bg-secondary rounded-lg">
                        <div className="font-medium">{time.day}</div>
                        <div className="text-sm text-muted-foreground">{time.time}</div>
                        <div className="text-xs text-primary">{time.score}% optimal</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Growth Predictions</h4>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <p className="text-sm text-muted-foreground">30 Days</p>
                      <p className="font-semibold">{intelligence.audienceInsights.growthPredictions?.['30days']}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">60 Days</p>
                      <p className="font-semibold">{intelligence.audienceInsights.growthPredictions?.['60days']}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">90 Days</p>
                      <p className="font-semibold">{intelligence.audienceInsights.growthPredictions?.['90days']}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Action Plan */}
          {intelligence.actionPlan && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  30-Day Action Plan
                </CardTitle>
                <CardDescription>Prioritized steps to improve your performance</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2 text-red-600">🚨 Immediate Actions</h4>
                  <ul className="space-y-1">
                    {intelligence.actionPlan.immediate?.map((action: string, i: number) => (
                      <li key={i} className="text-sm">• {action}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2 text-orange-600">📅 Short-term (1-2 weeks)</h4>
                  <ul className="space-y-1">
                    {intelligence.actionPlan.short_term?.map((action: string, i: number) => (
                      <li key={i} className="text-sm">• {action}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2 text-blue-600">🎯 Long-term (1+ month)</h4>
                  <ul className="space-y-1">
                    {intelligence.actionPlan.long_term?.map((action: string, i: number) => (
                      <li key={i} className="text-sm">• {action}</li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
};