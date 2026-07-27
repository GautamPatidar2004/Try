import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useSettings } from "@/hooks/useSettings";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertTriangle, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export const MaintenanceModePanel = () => {
  const { settings, loading, updateSetting, createSetting } = useSettings();
  const { toast } = useToast();
  const [maintenanceEnabled, setMaintenanceEnabled] = useState(false);
  const [maintenanceMessage, setMaintenanceMessage] = useState("");

  useEffect(() => {
    const modeSetting = settings.find(s => s.key === 'maintenance_mode');
    const messageSetting = settings.find(s => s.key === 'maintenance_message');
    
    if (modeSetting) {
      setMaintenanceEnabled(modeSetting.value === true);
    }
    if (messageSetting) {
      setMaintenanceMessage(messageSetting.value || "");
    }
  }, [settings]);

  const handleToggleMaintenance = async (enabled: boolean) => {
    setMaintenanceEnabled(enabled);
    const modeSetting = settings.find(s => s.key === 'maintenance_mode');
    
    if (modeSetting) {
      await updateSetting('maintenance_mode', enabled);
    } else {
      await createSetting({
        key: 'maintenance_mode',
        value: enabled,
        type: 'boolean',
        category: 'maintenance',
        description: 'Enable or disable platform maintenance mode',
        is_public: true
      });
    }
  };

  const handleSaveMessage = async () => {
    const messageSetting = settings.find(s => s.key === 'maintenance_message');
    
    if (messageSetting) {
      await updateSetting('maintenance_message', maintenanceMessage);
    } else {
      await createSetting({
        key: 'maintenance_message',
        value: maintenanceMessage,
        type: 'string',
        category: 'maintenance',
        description: 'Message displayed during maintenance mode',
        is_public: true
      });
    }
  };

  if (loading) {
    return <Skeleton className="h-64" />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Maintenance Mode</h3>
        <p className="text-sm text-muted-foreground">
          Enable maintenance mode to temporarily restrict platform access
        </p>
      </div>

      <Card className={maintenanceEnabled ? "border-destructive" : ""}>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              <AlertTriangle className={`h-5 w-5 mt-0.5 ${maintenanceEnabled ? 'text-destructive' : 'text-muted-foreground'}`} />
              <div className="space-y-1">
                <CardTitle className="text-base">Platform Maintenance</CardTitle>
                <CardDescription>
                  When enabled, users will see a maintenance message
                </CardDescription>
              </div>
            </div>
            <Switch
              checked={maintenanceEnabled}
              onCheckedChange={handleToggleMaintenance}
            />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Maintenance Message</label>
            <Textarea
              value={maintenanceMessage}
              onChange={(e) => setMaintenanceMessage(e.target.value)}
              placeholder="The platform is currently under maintenance. Please check back soon."
              rows={4}
            />
          </div>
          <Button onClick={handleSaveMessage} className="w-full">
            <Save className="h-4 w-4 mr-2" />
            Save Message
          </Button>
        </CardContent>
      </Card>

      {maintenanceEnabled && (
        <Card className="border-destructive bg-destructive/5">
          <CardHeader>
            <CardTitle className="text-sm text-destructive">⚠️ Warning</CardTitle>
            <CardDescription>
              Maintenance mode is currently active. Most users will not be able to access the platform.
            </CardDescription>
          </CardHeader>
        </Card>
      )}
    </div>
  );
};
