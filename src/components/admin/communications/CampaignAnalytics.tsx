import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import {
  BarChart3,
  Download,
  Mail,
  Bell,
  CheckCircle,
  XCircle,
  Clock,
  Users,
  ArrowLeft,
  TrendingUp,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { CommunicationCampaign } from "@/hooks/useCommunications";

interface CampaignAnalyticsProps {
  campaigns: CommunicationCampaign[] | undefined;
}

export const CampaignAnalytics = ({ campaigns }: CampaignAnalyticsProps) => {
  const [selectedCampaignId, setSelectedCampaignId] = useState<string | null>(null);

  const selectedCampaign = campaigns?.find((c) => c.id === selectedCampaignId);

  const { data: recipients, isLoading: recipientsLoading, error: recipientsError, refetch: refetchRecipients } = useQuery({
    queryKey: ["campaign-recipients", selectedCampaignId],
    queryFn: async () => {
      if (!selectedCampaignId) return [];
      const { data, error } = await supabase
        .from("campaign_recipients")
        .select(`
          *,
          profiles:user_id (
            first_name,
            last_name,
            user_type
          )
        `)
        .eq("campaign_id", selectedCampaignId)
        .order("sent_at", { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!selectedCampaignId,
    retry: 2,
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "sent":
      case "delivered":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "failed":
        return <XCircle className="h-4 w-4 text-red-500" />;
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-500" />;
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const exportToCsv = () => {
    if (!recipients || !selectedCampaign) return;

    const csvContent = [
      ["Name", "Email", "User Type", "Status", "Sent At", "Delivered At", "Error"].join(","),
      ...recipients.map((r: any) => [
        `"${r.profiles?.first_name || ""} ${r.profiles?.last_name || ""}"`,
        `"${r.email || ""}"`,
        r.profiles?.user_type || "N/A",
        r.status,
        r.sent_at || "",
        r.delivered_at || "",
        `"${r.error_message || ""}"`,
      ].join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `campaign-${selectedCampaign.name}-recipients.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (selectedCampaignId && selectedCampaign) {
    const deliveryRate = selectedCampaign.total_recipients > 0
      ? (selectedCampaign.successful_deliveries / selectedCampaign.total_recipients) * 100
      : 0;

    const userTypeBreakdown = recipients?.reduce((acc: any, r: any) => {
      const type = r.profiles?.user_type || "unknown";
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {}) || {};

    return (
      <div className="space-y-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setSelectedCampaignId(null)}
          className="mb-2"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Campaigns
        </Button>

        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Total Recipients</span>
              </div>
              <p className="text-2xl font-bold mt-1">{selectedCampaign.total_recipients}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm text-muted-foreground">Delivered</span>
              </div>
              <p className="text-2xl font-bold mt-1">{selectedCampaign.successful_deliveries}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <XCircle className="h-4 w-4 text-red-500" />
                <span className="text-sm text-muted-foreground">Failed</span>
              </div>
              <p className="text-2xl font-bold mt-1">{selectedCampaign.failed_deliveries}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-primary" />
                <span className="text-sm text-muted-foreground">Delivery Rate</span>
              </div>
              <p className="text-2xl font-bold mt-1">{deliveryRate.toFixed(1)}%</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {/* Campaign Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Campaign Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <span className="text-sm text-muted-foreground">Name</span>
                <p className="font-medium">{selectedCampaign.name}</p>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">Type</span>
                <div className="flex items-center gap-2 mt-1">
                  {selectedCampaign.type === "email" ? (
                    <Mail className="h-4 w-4" />
                  ) : (
                    <Bell className="h-4 w-4" />
                  )}
                  <span className="capitalize">{selectedCampaign.type}</span>
                </div>
              </div>
              {selectedCampaign.subject && (
                <div>
                  <span className="text-sm text-muted-foreground">Subject</span>
                  <p className="font-medium">{selectedCampaign.subject}</p>
                </div>
              )}
              <div>
                <span className="text-sm text-muted-foreground">Sent At</span>
                <p className="font-medium">
                  {selectedCampaign.sent_at
                    ? format(new Date(selectedCampaign.sent_at), "MMM d, yyyy h:mm a")
                    : "Not sent yet"}
                </p>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">Delivery Progress</span>
                <Progress value={deliveryRate} className="mt-2" />
              </div>
            </CardContent>
          </Card>

          {/* User Type Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Recipient Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Object.entries(userTypeBreakdown).map(([type, count]) => (
                  <div key={type} className="flex items-center justify-between">
                    <span className="capitalize">{type === "unknown" ? "Unknown" : type}</span>
                    <Badge variant="secondary">{count as number}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recipients List */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base">Recipient Details</CardTitle>
              <CardDescription>Individual delivery status for each recipient</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={() => refetchRecipients()}>
                <RefreshCw className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={exportToCsv} disabled={!recipients?.length}>
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {recipientsLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                <span className="ml-2 text-muted-foreground">Loading recipients...</span>
              </div>
            ) : recipientsError ? (
              <div className="text-center py-8">
                <XCircle className="h-8 w-8 text-destructive mx-auto mb-2" />
                <p className="text-sm text-muted-foreground mb-4">Failed to load recipients</p>
                <Button variant="outline" size="sm" onClick={() => refetchRecipients()}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Retry
                </Button>
              </div>
            ) : recipients && recipients.length > 0 ? (
              <ScrollArea className="h-[300px]">
                <div className="space-y-2">
                  {recipients.map((recipient: any) => (
                    <div
                      key={recipient.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        {getStatusIcon(recipient.status)}
                        <div>
                          <p className="font-medium text-sm">
                            {recipient.profiles?.first_name || "Unknown"} {recipient.profiles?.last_name || "User"}
                          </p>
                          {recipient.email && (
                            <p className="text-xs text-muted-foreground">
                              {recipient.email}
                            </p>
                          )}
                          <p className="text-xs text-muted-foreground capitalize">
                            {recipient.profiles?.user_type || "Unknown type"}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge
                          variant={recipient.status === "sent" || recipient.status === "delivered" ? "default" : "destructive"}
                          className="text-xs"
                        >
                          {recipient.status}
                        </Badge>
                        {recipient.error_message && (
                          <p className="text-xs text-red-500 mt-1 max-w-[200px] truncate">
                            {recipient.error_message}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No recipients found for this campaign</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  // Campaign list view
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          Campaign Analytics
        </CardTitle>
        <CardDescription>
          View detailed performance metrics for each campaign
        </CardDescription>
      </CardHeader>
      <CardContent>
        {campaigns && campaigns.length > 0 ? (
          <ScrollArea className="h-[500px]">
            <div className="space-y-2">
              {campaigns
                .filter((c) => ["sent", "sending", "failed"].includes(c.status))
                .map((campaign) => {
                  const deliveryRate = campaign.total_recipients > 0
                    ? (campaign.successful_deliveries / campaign.total_recipients) * 100
                    : 0;

                  return (
                    <div
                      key={campaign.id}
                      className="p-4 border rounded-lg hover:bg-accent/50 transition-colors cursor-pointer"
                      onClick={() => setSelectedCampaignId(campaign.id)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {campaign.type === "email" ? (
                            <Mail className="h-4 w-4" />
                          ) : (
                            <Bell className="h-4 w-4" />
                          )}
                          <span className="font-medium">{campaign.name}</span>
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {campaign.sent_at && format(new Date(campaign.sent_at), "MMM d, yyyy")}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-sm">
                        <span>
                          <strong>{campaign.successful_deliveries}</strong> / {campaign.total_recipients} delivered
                        </span>
                        <span className="text-muted-foreground">
                          {deliveryRate.toFixed(1)}% success
                        </span>
                      </div>
                      <Progress value={deliveryRate} className="mt-2 h-2" />
                    </div>
                  );
                })}
            </div>
          </ScrollArea>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            No completed campaigns yet
          </div>
        )}
      </CardContent>
    </Card>
  );
};
