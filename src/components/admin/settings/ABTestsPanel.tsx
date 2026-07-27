import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useABTests } from "@/hooks/useABTests";
import { Skeleton } from "@/components/ui/skeleton";
import { FlaskConical, Play, Pause, CheckCircle2 } from "lucide-react";
import { format } from "date-fns";

export const ABTestsPanel = () => {
  const { tests, loading, updateTestStatus } = useABTests();

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-32" />
        <Skeleton className="h-32" />
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running': return 'default';
      case 'paused': return 'secondary';
      case 'completed': return 'outline';
      default: return 'secondary';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">A/B Tests</h3>
        <p className="text-sm text-muted-foreground">
          Manage experiments and test different feature variants
        </p>
      </div>

      <div className="grid gap-4">
        {tests.length === 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>No A/B Tests</CardTitle>
              <CardDescription>
                No A/B tests have been created yet. Create tests to experiment with different features.
              </CardDescription>
            </CardHeader>
          </Card>
        ) : (
          tests.map((test) => (
            <Card key={test.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <FlaskConical className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-base">{test.name}</CardTitle>
                        <Badge variant={getStatusColor(test.status)}>
                          {test.status}
                        </Badge>
                      </div>
                      <CardDescription>{test.description}</CardDescription>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {test.status === 'draft' && (
                      <Button
                        size="sm"
                        onClick={() => updateTestStatus(test.id, 'running')}
                      >
                        <Play className="h-4 w-4 mr-1" />
                        Start
                      </Button>
                    )}
                    {test.status === 'running' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateTestStatus(test.id, 'paused')}
                      >
                        <Pause className="h-4 w-4 mr-1" />
                        Pause
                      </Button>
                    )}
                    {test.status === 'paused' && (
                      <Button
                        size="sm"
                        onClick={() => updateTestStatus(test.id, 'running')}
                      >
                        <Play className="h-4 w-4 mr-1" />
                        Resume
                      </Button>
                    )}
                    {(test.status === 'running' || test.status === 'paused') && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateTestStatus(test.id, 'completed')}
                      >
                        <CheckCircle2 className="h-4 w-4 mr-1" />
                        Complete
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Variants</label>
                    <div className="flex gap-2 mt-2">
                      {test.variants.map((variant, idx) => (
                        <Badge key={idx} variant="outline">
                          {variant.name}: {variant.allocation}%
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {test.start_date && (
                    <div className="text-sm text-muted-foreground">
                      Started: {format(new Date(test.start_date), 'PPp')}
                    </div>
                  )}

                  {test.winner_variant && (
                    <div>
                      <label className="text-sm font-medium">Winner</label>
                      <Badge className="ml-2">{test.winner_variant}</Badge>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};
