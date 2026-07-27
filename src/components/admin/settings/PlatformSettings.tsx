import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GeneralSettingsPanel } from "./GeneralSettingsPanel";
import { FeatureFlagsPanel } from "./FeatureFlagsPanel";
import { ABTestsPanel } from "./ABTestsPanel";
import { RateLimitingPanel } from "./RateLimitingPanel";
import { MaintenanceModePanel } from "./MaintenanceModePanel";
import { AdminManagementPanel } from "./AdminManagementPanel";
import { Settings, Flag, FlaskConical, Shield, AlertTriangle, UserCog } from "lucide-react";

export const PlatformSettings = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Settings className="h-6 w-6" />
          Platform Settings
        </h2>
        <p className="text-muted-foreground mt-1">
          Configure platform features, experiments, and system settings
        </p>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <div className="w-full overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        <TabsList className="inline-flex w-max min-w-full">
          <TabsTrigger value="general" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            General
          </TabsTrigger>
          <TabsTrigger value="admins" className="flex items-center gap-2">
            <UserCog className="h-4 w-4" />
            Admins
          </TabsTrigger>
          <TabsTrigger value="flags" className="flex items-center gap-2">
            <Flag className="h-4 w-4" />
            Features
          </TabsTrigger>
          <TabsTrigger value="tests" className="flex items-center gap-2">
            <FlaskConical className="h-4 w-4" />
            A/B Tests
          </TabsTrigger>
          <TabsTrigger value="limits" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Rate Limits
          </TabsTrigger>
          <TabsTrigger value="maintenance" className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Maintenance
          </TabsTrigger>
        </TabsList>
        </div>

        <TabsContent value="general">
          <GeneralSettingsPanel />
        </TabsContent>

        <TabsContent value="admins">
          <AdminManagementPanel />
        </TabsContent>

        <TabsContent value="flags">
          <FeatureFlagsPanel />
        </TabsContent>

        <TabsContent value="tests">
          <ABTestsPanel />
        </TabsContent>

        <TabsContent value="limits">
          <RateLimitingPanel />
        </TabsContent>

        <TabsContent value="maintenance">
          <MaintenanceModePanel />
        </TabsContent>
      </Tabs>
    </div>
  );
};
