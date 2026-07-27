import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useConversionFunnels } from "@/hooks/useConversionFunnels";
import { TrendingDown } from "lucide-react";

export const ConversionFunnels = () => {
  const { data: funnels, isLoading } = useConversionFunnels();

  if (isLoading) {
    return <div className="text-center py-8">Loading conversion funnels...</div>;
  }

  return (
    <div className="space-y-4">
      {funnels?.map((funnel, idx) => (
        <Card key={idx}>
          <CardHeader>
            <CardTitle>{funnel.name}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {funnel.steps.map((step, stepIdx) => (
                <div key={stepIdx} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">{step.name}</p>
                      <p className="text-sm text-muted-foreground">{step.users.toLocaleString()} users</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-lg">{step.conversionRate.toFixed(1)}%</p>
                      {stepIdx > 0 && (
                        <p className="text-sm text-red-600 flex items-center gap-1">
                          <TrendingDown className="w-3 h-3" />
                          {step.dropoffRate.toFixed(1)}% drop-off
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <div className="relative">
                    <div className="w-full bg-muted rounded-full h-8 overflow-hidden">
                      <div 
                        className="bg-primary h-full transition-all flex items-center justify-center text-sm font-medium text-primary-foreground"
                        style={{ width: `${step.conversionRate}%` }}
                      >
                        {step.conversionRate > 10 && `${step.conversionRate.toFixed(0)}%`}
                      </div>
                    </div>
                  </div>

                  {stepIdx < funnel.steps.length - 1 && (
                    <div className="flex justify-center">
                      <div className="w-px h-4 bg-border"></div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
