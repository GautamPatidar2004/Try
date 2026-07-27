import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { useFeatureFlags } from "@/hooks/useFeatureFlags";
import { Skeleton } from "@/components/ui/skeleton";
import { Flag, TrendingUp } from "lucide-react";

export const FeatureFlagsPanel = () => {
  const { flags, loading, toggleFlag, updateRollout } = useFeatureFlags();

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-32" />
        <Skeleton className="h-32" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Feature Flags</h3>
        <p className="text-sm text-muted-foreground">
          Control feature availability and gradual rollouts
        </p>
      </div>

      <div className="grid gap-4">
        {flags.length === 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>No Feature Flags</CardTitle>
              <CardDescription>
                No feature flags have been configured yet. Create flags to control feature releases.
              </CardDescription>
            </CardHeader>
          </Card>
        ) : (
          flags.map((flag) => (
            <Card key={flag.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <Flag className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-base">{flag.name}</CardTitle>
                        <Badge variant={flag.is_enabled ? "default" : "secondary"}>
                          {flag.is_enabled ? 'Enabled' : 'Disabled'}
                        </Badge>
                        <Badge variant="outline">{flag.environment}</Badge>
                      </div>
                      <CardDescription>{flag.description}</CardDescription>
                    </div>
                  </div>
                  <Switch
                    checked={flag.is_enabled}
                    onCheckedChange={(enabled) => toggleFlag(flag.id, enabled)}
                  />
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-sm font-medium flex items-center gap-2">
                        <TrendingUp className="h-4 w-4" />
                        Rollout Percentage
                      </label>
                      <Badge variant="secondary">{flag.rollout_percentage}%</Badge>
                    </div>
                    <Slider
                      value={[flag.rollout_percentage]}
                      onValueChange={(vals) => updateRollout(flag.id, vals[0])}
                      max={100}
                      step={5}
                      disabled={!flag.is_enabled}
                    />
                  </div>

                  {flag.target_user_types.length > 0 && (
                    <div>
                      <label className="text-sm font-medium">Target User Types</label>
                      <div className="flex gap-2 mt-2">
                        {flag.target_user_types.map((type) => (
                          <Badge key={type} variant="outline">{type}</Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {flag.target_user_ids.length > 0 && (
                    <div>
                      <label className="text-sm font-medium">Targeted Users</label>
                      <p className="text-sm text-muted-foreground mt-1">
                        {flag.target_user_ids.length} specific users targeted
                      </p>
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
