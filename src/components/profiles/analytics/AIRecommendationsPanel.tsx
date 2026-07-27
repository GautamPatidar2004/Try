import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, RefreshCw, Sparkles, TrendingUp, AlertCircle, Target } from 'lucide-react';
import { RecommendationCard } from './RecommendationCard';
import { useAIRecommendations } from '@/hooks/useAIRecommendations';
import { format } from 'date-fns';

interface AIRecommendationsPanelProps {
  userId: string;
}

export const AIRecommendationsPanel = ({ userId }: AIRecommendationsPanelProps) => {
  const {
    recommendations,
    isLoading,
    generate,
    isGenerating,
    updateStatus,
  } = useAIRecommendations(userId);

  const handleMarkDone = (recId: string) => {
    if (!recommendations?.id) return;
    updateStatus({ id: recommendations.id, status: 'completed' });
  };

  const handleDismiss = (recId: string) => {
    if (!recommendations?.id) return;
    updateStatus({ 
      id: recommendations.id, 
      status: 'dismissed',
      dismissReason: 'Not relevant to current goals'
    });
  };

  const recData = recommendations?.recommendation_data as any;
  const activeRecs = recData?.recommendations || [];
  const insights = recData?.insights;

  // Group by priority
  const criticalRecs = activeRecs.filter((r: any) => r.priority === 'critical');
  const highRecs = activeRecs.filter((r: any) => r.priority === 'high');
  const mediumRecs = activeRecs.filter((r: any) => r.priority === 'medium');
  const lowRecs = activeRecs.filter((r: any) => r.priority === 'low');

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
            <Sparkles className="w-6 h-6 text-primary" />
            <h2 className="text-3xl font-bold">AI-Powered Recommendations</h2>
          </div>
          <p className="text-muted-foreground">
            Personalized insights powered by advanced AI analysis
          </p>
          {recommendations?.created_at && (
            <p className="text-sm text-muted-foreground mt-1">
              Last updated: {format(new Date(recommendations.created_at), 'PPp')}
            </p>
          )}
        </div>
        <Button
          onClick={() => generate()}
          disabled={isGenerating || !!recommendations}
          className="gap-2"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <RefreshCw className="w-4 h-4" />
              {recommendations ? 'Generated (24h cooldown)' : 'Generate Recommendations'}
            </>
          )}
        </Button>
      </div>

      {!recommendations && !isGenerating && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Sparkles className="w-16 h-16 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">No recommendations yet</h3>
            <p className="text-muted-foreground text-center max-w-md mb-6">
              Generate AI-powered recommendations to get personalized insights on how to grow your influence and maximize your earnings.
            </p>
            <Button onClick={() => generate()} disabled={isGenerating} className="gap-2">
              <Sparkles className="w-4 h-4" />
              Generate Your First Recommendations
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Key Insights Summary */}
      {insights && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-green-500" />
                Strengths
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-1">
                {insights.strengths?.map((strength: string, i: number) => (
                  <li key={i} className="text-sm">• {strength}</li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Target className="w-4 h-4 text-blue-500" />
                Opportunities
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-1">
                {insights.opportunities?.map((opp: string, i: number) => (
                  <li key={i} className="text-sm">• {opp}</li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-orange-500" />
                Areas to Improve
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-1">
                {insights.weaknesses?.map((weakness: string, i: number) => (
                  <li key={i} className="text-sm">• {weakness}</li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Recommendations by Priority */}
      {activeRecs.length > 0 && (
        <div className="space-y-6">
          {/* Progress */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Progress</CardTitle>
              <CardDescription>
                0 of {activeRecs.length} recommendations completed
              </CardDescription>
            </CardHeader>
          </Card>

          {/* Critical Priority */}
          {criticalRecs.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-destructive">🚨 Critical Priority</h3>
              {criticalRecs.map((rec: any) => (
                <RecommendationCard
                  key={rec.id}
                  recommendation={rec}
                  onMarkDone={handleMarkDone}
                  onDismiss={handleDismiss}
                />
              ))}
            </div>
          )}

          {/* High Priority */}
          {highRecs.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-orange-600">⚡ High Priority</h3>
              {highRecs.map((rec: any) => (
                <RecommendationCard
                  key={rec.id}
                  recommendation={rec}
                  onMarkDone={handleMarkDone}
                  onDismiss={handleDismiss}
                />
              ))}
            </div>
          )}

          {/* Medium Priority */}
          {mediumRecs.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-yellow-600">📊 Medium Priority</h3>
              {mediumRecs.map((rec: any) => (
                <RecommendationCard
                  key={rec.id}
                  recommendation={rec}
                  onMarkDone={handleMarkDone}
                  onDismiss={handleDismiss}
                />
              ))}
            </div>
          )}

          {/* Low Priority */}
          {lowRecs.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-muted-foreground">💡 Low Priority</h3>
              {lowRecs.map((rec: any) => (
                <RecommendationCard
                  key={rec.id}
                  recommendation={rec}
                  onMarkDone={handleMarkDone}
                  onDismiss={handleDismiss}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};