import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Target } from 'lucide-react';

interface ContentStrategyMatrixProps {
  bestPerforming: Array<{ type: string; avgEngagement: number }>;
  underperforming: Array<{ type: string; reason: string }>;
  quickWins: string[];
  longTermBets: string[];
}

export const ContentStrategyMatrix = ({ 
  bestPerforming, 
  underperforming,
  quickWins,
  longTermBets 
}: ContentStrategyMatrixProps) => {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            Content Strategy Matrix
          </CardTitle>
          <CardDescription>
            Performance analysis and strategic recommendations
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Best Performing */}
          <div>
            <h4 className="font-semibold mb-3 text-green-600">✅ Best Performing Content</h4>
            <div className="space-y-2">
              {bestPerforming.map((item, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-950 rounded-lg">
                  <span className="font-medium">{item.type}</span>
                  <span className="text-sm text-muted-foreground">
                    {item.avgEngagement.toLocaleString()} avg engagement
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Underperforming */}
          <div>
            <h4 className="font-semibold mb-3 text-orange-600">⚠️ Needs Improvement</h4>
            <div className="space-y-2">
              {underperforming.map((item, i) => (
                <div key={i} className="p-3 bg-orange-50 dark:bg-orange-950 rounded-lg">
                  <div className="font-medium">{item.type}</div>
                  <p className="text-sm text-muted-foreground mt-1">{item.reason}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Wins */}
          <div>
            <h4 className="font-semibold mb-3 text-blue-600">⚡ Quick Wins</h4>
            <ul className="space-y-1">
              {quickWins.map((win, i) => (
                <li key={i} className="text-sm flex items-start gap-2">
                  <span className="text-blue-600">•</span>
                  <span>{win}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Long-term Bets */}
          <div>
            <h4 className="font-semibold mb-3 text-purple-600">🎯 Long-term Investments</h4>
            <ul className="space-y-1">
              {longTermBets.map((bet, i) => (
                <li key={i} className="text-sm flex items-start gap-2">
                  <span className="text-purple-600">•</span>
                  <span>{bet}</span>
                </li>
              ))}
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};