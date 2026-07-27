import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { useRateLimits } from "@/hooks/useRateLimits";
import { Skeleton } from "@/components/ui/skeleton";
import { Shield, Clock } from "lucide-react";

export const RateLimitingPanel = () => {
  const { limits, loading, toggleLimit } = useRateLimits();

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-32" />
        <Skeleton className="h-32" />
      </div>
    );
  }

  const formatWindow = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`;
    return `${Math.floor(seconds / 86400)}d`;
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Rate Limiting</h3>
        <p className="text-sm text-muted-foreground">
          Configure rate limits to prevent abuse and ensure fair usage
        </p>
      </div>

      <div className="grid gap-4">
        {limits.length === 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>No Rate Limits</CardTitle>
              <CardDescription>
                No rate limits have been configured yet. Add limits to control resource usage.
              </CardDescription>
            </CardHeader>
          </Card>
        ) : (
          limits.map((limit) => (
            <Card key={limit.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <Shield className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-base capitalize">
                          {limit.resource.replace(/_/g, ' ')}
                        </CardTitle>
                        <Badge variant={limit.is_active ? "default" : "secondary"}>
                          {limit.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                      <CardDescription className="flex items-center gap-2">
                        <Clock className="h-3 w-3" />
                        {limit.limit_count} requests per {formatWindow(limit.window_seconds)}
                      </CardDescription>
                    </div>
                  </div>
                  <Switch
                    checked={limit.is_active}
                    onCheckedChange={(active) => toggleLimit(limit.id, active)}
                  />
                </div>
              </CardHeader>
              {limit.user_type && (
                <CardContent>
                  <div className="text-sm">
                    <span className="text-muted-foreground">Applies to: </span>
                    <Badge variant="outline">{limit.user_type}</Badge>
                  </div>
                </CardContent>
              )}
            </Card>
          ))
        )}
      </div>
    </div>
  );
};
