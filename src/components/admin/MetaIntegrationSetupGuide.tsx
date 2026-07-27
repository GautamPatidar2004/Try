import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Copy, ExternalLink, Check, AlertCircle, Settings } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

const SUPABASE_PROJECT_ID = import.meta.env.VITE_SUPABASE_PROJECT_ID;
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;

export const MetaIntegrationSetupGuide = () => {
  const { toast } = useToast();
  const [copiedItem, setCopiedItem] = useState<string | null>(null);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedItem(label);
    toast({
      title: "Copied!",
      description: `${label} copied to clipboard`,
    });
    setTimeout(() => setCopiedItem(null), 2000);
  };

  const oauthRedirectUri = `${SUPABASE_URL}/functions/v1/connect-meta-analytics/callback`;
  const webhookUrl = `${SUPABASE_URL}/functions/v1/meta-webhook`;

  const configItems = [
    {
      label: "OAuth Redirect URI",
      value: oauthRedirectUri,
      description: "Add this to 'Valid OAuth Redirect URIs' in Meta App Settings",
    },
    {
      label: "Webhook Callback URL",
      value: webhookUrl,
      description: "Add this as the Webhook URL for Instagram subscriptions",
    },
    {
      label: "Deauthorize Callback URL",
      value: `${SUPABASE_URL}/functions/v1/connect-meta-analytics/deauthorize`,
      description: "Add this for handling app deauthorization",
    },
  ];

  const requiredPermissions = [
    { name: "instagram_basic", description: "Basic profile info", required: true },
    { name: "instagram_manage_insights", description: "Analytics data", required: true },
    { name: "pages_show_list", description: "List user's Pages", required: true },
    { name: "pages_read_engagement", description: "Page engagement data", required: true },
    { name: "business_management", description: "Business account access", required: true },
  ];

  const setupSteps = [
    {
      step: 1,
      title: "Create or Configure Meta App",
      description: "Go to Meta for Developers and create a new app or configure an existing one.",
      link: "https://developers.facebook.com/apps/",
      completed: false, // Could check META_APP_ID secret
    },
    {
      step: 2,
      title: "Add Instagram Graph API",
      description: "In your app dashboard, click 'Add Product' and select 'Instagram Graph API'.",
      completed: false,
    },
    {
      step: 3,
      title: "Configure OAuth Settings",
      description: "Add the OAuth Redirect URI below to your app's Facebook Login settings.",
      completed: false,
    },
    {
      step: 4,
      title: "Set App to Live Mode",
      description: "Switch your app from Development to Live mode in the app settings.",
      completed: false,
    },
    {
      step: 5,
      title: "Complete App Review (if needed)",
      description: "For advanced permissions, submit your app for Meta review.",
      link: "https://developers.facebook.com/docs/app-review",
      completed: false,
    },
    {
      step: 6,
      title: "Configure Secrets in Supabase",
      description: "Add META_APP_ID, META_APP_SECRET, and APP_DOMAIN to Supabase Edge Function secrets.",
      link: `https://supabase.com/dashboard/project/${SUPABASE_PROJECT_ID}/settings/functions`,
      completed: false,
    },
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Meta/Instagram Integration Setup
          </CardTitle>
          <CardDescription>
            Follow these steps to configure Instagram analytics integration
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Configuration Values */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">
              Required Configuration Values
            </h3>
            {configItems.map((item) => (
              <div key={item.label} className="rounded-lg border p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-sm">{item.label}</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(item.value, item.label)}
                  >
                    {copiedItem === item.label ? (
                      <Check className="h-4 w-4 text-green-500" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                <code className="block text-xs bg-muted p-2 rounded break-all">
                  {item.value}
                </code>
                <p className="text-xs text-muted-foreground">{item.description}</p>
              </div>
            ))}
          </div>

          {/* Required Permissions */}
          <div className="space-y-3">
            <h3 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">
              Required Permissions
            </h3>
            <div className="flex flex-wrap gap-2">
              {requiredPermissions.map((perm) => (
                <Badge 
                  key={perm.name} 
                  variant={perm.required ? "default" : "secondary"}
                  className="text-xs"
                >
                  {perm.name}
                </Badge>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">
              These permissions must be approved by Meta for your app to access Instagram data.
            </p>
          </div>

          {/* Setup Steps */}
          <div className="space-y-3">
            <h3 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">
              Setup Checklist
            </h3>
            <div className="space-y-2">
              {setupSteps.map((item) => (
                <div
                  key={item.step}
                  className="flex items-start gap-3 p-3 rounded-lg border"
                >
                  <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                    item.completed 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-muted text-muted-foreground'
                  }`}>
                    {item.completed ? <Check className="h-3 w-3" /> : item.step}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm">{item.title}</p>
                    <p className="text-xs text-muted-foreground">{item.description}</p>
                    {item.link && (
                      <a
                        href={item.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-primary hover:underline mt-1"
                      >
                        Open <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Common Issues */}
          <div className="space-y-3">
            <h3 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              Common Issues
            </h3>
            <div className="space-y-2 text-sm">
              <div className="p-3 bg-amber-50 dark:bg-amber-950/20 rounded-lg border border-amber-200 dark:border-amber-800">
                <p className="font-medium text-amber-800 dark:text-amber-200">
                  "No Instagram Business Account"
                </p>
                <p className="text-xs text-amber-700 dark:text-amber-300 mt-1">
                  Users must have an Instagram Business/Creator account linked to a Facebook Page.
                </p>
              </div>
              <div className="p-3 bg-amber-50 dark:bg-amber-950/20 rounded-lg border border-amber-200 dark:border-amber-800">
                <p className="font-medium text-amber-800 dark:text-amber-200">
                  "Token Exchange Failed"
                </p>
                <p className="text-xs text-amber-700 dark:text-amber-300 mt-1">
                  Verify the OAuth Redirect URI matches exactly and the app is in Live mode.
                </p>
              </div>
              <div className="p-3 bg-amber-50 dark:bg-amber-950/20 rounded-lg border border-amber-200 dark:border-amber-800">
                <p className="font-medium text-amber-800 dark:text-amber-200">
                  "Permissions Not Approved"
                </p>
                <p className="text-xs text-amber-700 dark:text-amber-300 mt-1">
                  Advanced permissions require App Review. Test users can be added in Development mode.
                </p>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="flex flex-wrap gap-2 pt-4 border-t">
            <Button variant="outline" size="sm" asChild>
              <a
                href="https://developers.facebook.com/apps/"
                target="_blank"
                rel="noopener noreferrer"
              >
                Meta Developer Console <ExternalLink className="h-3 w-3 ml-1" />
              </a>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <a
                href={`https://supabase.com/dashboard/project/${SUPABASE_PROJECT_ID}/functions/connect-meta-analytics/logs`}
                target="_blank"
                rel="noopener noreferrer"
              >
                View Edge Function Logs <ExternalLink className="h-3 w-3 ml-1" />
              </a>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <a
                href={`https://supabase.com/dashboard/project/${SUPABASE_PROJECT_ID}/settings/functions`}
                target="_blank"
                rel="noopener noreferrer"
              >
                Manage Secrets <ExternalLink className="h-3 w-3 ml-1" />
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
