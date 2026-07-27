import { Card, CardContent } from "@/components/ui/card";
import { InsightCard } from "@/hooks/useAmbassadorAnalytics";
import { cn } from "@/lib/utils";
import { Lightbulb } from "lucide-react";

interface SmartInsightsProps {
  insights: InsightCard[];
}

const INSIGHT_STYLES: Record<InsightCard['type'], { bg: string; border: string; icon: string }> = {
  success: {
    bg: 'bg-green-500/10',
    border: 'border-green-500/20',
    icon: 'text-green-600',
  },
  warning: {
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/20',
    icon: 'text-amber-600',
  },
  tip: {
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/20',
    icon: 'text-blue-600',
  },
  info: {
    bg: 'bg-purple-500/10',
    border: 'border-purple-500/20',
    icon: 'text-purple-600',
  },
};

export const SmartInsights = ({ insights }: SmartInsightsProps) => {
  if (insights.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Lightbulb className="h-5 w-5 text-amber-500" />
        <h3 className="font-semibold">Smart Insights</h3>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {insights.map((insight) => {
          const styles = INSIGHT_STYLES[insight.type];
          return (
            <Card 
              key={insight.id} 
              className={cn(
                "border transition-all hover:shadow-md",
                styles.bg,
                styles.border
              )}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">{insight.icon}</span>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-sm leading-tight">{insight.title}</h4>
                    <p className="text-xs text-muted-foreground mt-1">{insight.description}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
