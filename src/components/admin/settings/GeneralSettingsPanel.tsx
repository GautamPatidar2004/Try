import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SettingCard } from "./SettingCard";
import { useSettings } from "@/hooks/useSettings";
import { Skeleton } from "@/components/ui/skeleton";

export const GeneralSettingsPanel = () => {
  const { settings, loading, updateSetting } = useSettings();

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-32" />
        <Skeleton className="h-32" />
        <Skeleton className="h-32" />
      </div>
    );
  }

  const generalSettings = settings.filter(s => s.category === 'general');

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">General Settings</h3>
        <p className="text-sm text-muted-foreground">
          Configure platform-wide settings and defaults
        </p>
      </div>

      <div className="grid gap-4">
        {generalSettings.length === 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>No General Settings</CardTitle>
              <CardDescription>
                No general settings have been configured yet. You can add settings by inserting them directly into the platform_settings table.
              </CardDescription>
            </CardHeader>
          </Card>
        ) : (
          generalSettings.map((setting) => (
            <SettingCard
              key={setting.id}
              title={setting.key}
              description={setting.description}
              type={setting.type}
              value={setting.value}
              onChange={(value) => updateSetting(setting.key, value)}
              updatedAt={setting.updated_at}
            />
          ))
        )}
      </div>
    </div>
  );
};
