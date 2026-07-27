import { useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { FileText, CheckCircle, XCircle, MessageSquare, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ApplicationMessageCardProps {
  applicationId: string;
  message: {
    id: string;
    content: string;
    sender_id: string;
    created_at: string;
    sender?: {
      first_name?: string;
      last_name?: string;
      profile_photo_url?: string;
    };
  };
  isFromUser: boolean;
  formatTime: (date: string) => string;
}

interface ApplicationData {
  id: string;
  status: string;
  created_at: string;
  cover_letter?: string;
  campaign_id?: string;
  property_id?: string;
  influencer_id?: string;
  campaign?: { campaign_title: string; brand_name: string } | null;
  property?: { title: string } | null;
  influencer?: { first_name: string; last_name: string; profile_photo_url: string } | null;
}

const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  pending: { label: "Pending", variant: "secondary" },
  accepted: { label: "Accepted", variant: "default" },
  approved: { label: "Approved", variant: "default" },
  rejected: { label: "Rejected", variant: "destructive" },
  withdrawn: { label: "Withdrawn", variant: "outline" },
};

export const ApplicationMessageCard = ({
  applicationId,
  message,
  isFromUser,
  formatTime,
}: ApplicationMessageCardProps) => {
  const [appData, setAppData] = useState<ApplicationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState(false);

  useEffect(() => {
    const fetchApplication = async () => {
      // Try brand_campaign_applications first
      const { data: brandApp } = await supabase
        .from("brand_campaign_applications")
        .select("id, status, created_at, cover_letter, campaign_id, influencer_id, brand_campaigns(campaign_title, brand_name)")
        .eq("id", applicationId)
        .maybeSingle();

      if (brandApp) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("first_name, last_name, profile_photo_url")
          .eq("id", brandApp.influencer_id)
          .maybeSingle();

        setAppData({
          ...brandApp,
          campaign: brandApp.brand_campaigns as any,
          property: null,
          influencer: profile,
        });
        setLoading(false);
        return;
      }

      // Try property applications
      const { data: propApp } = await supabase
        .from("applications")
        .select("id, status, created_at, proposal_message, property_id, influencer_id, properties(title)")
        .eq("id", applicationId)
        .maybeSingle();

      if (propApp) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("first_name, last_name, profile_photo_url")
          .eq("id", propApp.influencer_id)
          .maybeSingle();

        setAppData({
          ...propApp,
          cover_letter: propApp.proposal_message || undefined,
          campaign: null,
          property: propApp.properties as any,
          influencer: profile,
        });
      }
      setLoading(false);
    };

    fetchApplication();
  }, [applicationId]);

  const handleAction = async (action: "accepted" | "rejected") => {
    if (!appData) return;
    setActing(true);

    const table = appData.campaign_id ? "brand_campaign_applications" : "applications";
    const { error } = await supabase
      .from(table)
      .update({ status: action })
      .eq("id", appData.id);

    if (error) {
      toast.error("Failed to update application");
    } else {
      toast.success(`Application ${action}`);
      setAppData({ ...appData, status: action });
    }
    setActing(false);
  };

  if (loading) {
    return (
      <div className={`flex ${isFromUser ? "justify-end" : "justify-start"}`}>
        <Card className="p-4 max-w-[70%] bg-card border">
          <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
        </Card>
      </div>
    );
  }

  if (!appData) {
    // Fallback to normal message
    return null;
  }

  const creatorName = appData.influencer
    ? `${appData.influencer.first_name || ""} ${appData.influencer.last_name || ""}`.trim()
    : "Unknown Creator";
  const initials = creatorName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
  const title = appData.campaign?.campaign_title || appData.property?.title || "Application";
  const statusInfo = statusConfig[appData.status || "pending"] || statusConfig.pending;
  const isPending = appData.status === "pending";

  return (
    <div className={`flex ${isFromUser ? "justify-end" : "justify-start"}`}>
      <Card className="max-w-[80%] overflow-hidden border bg-card shadow-sm">
        {/* Header */}
        <div className="flex items-center gap-2 px-4 pt-3 pb-2">
          <FileText className="w-4 h-4 text-primary" />
          <span className="text-xs font-semibold text-primary uppercase tracking-wide">
            Application
          </span>
          <Badge variant={statusInfo.variant} className="ml-auto text-[10px] px-2 py-0">
            {statusInfo.label}
          </Badge>
        </div>

        {/* Body */}
        <div className="px-4 pb-3 flex items-start gap-3">
          <Avatar className="w-10 h-10 flex-shrink-0">
            <AvatarImage src={appData.influencer?.profile_photo_url} />
            <AvatarFallback className="bg-primary/10 text-primary text-xs">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="font-medium text-sm truncate">{creatorName}</p>
            <p className="text-xs text-muted-foreground truncate">{title}</p>
            {appData.cover_letter && (
              <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                {appData.cover_letter}
              </p>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="px-4 pb-3 flex items-center gap-2 flex-wrap">
          {isPending && !isFromUser && (
            <>
              <Button
                size="sm"
                variant="default"
                className="h-7 text-xs gap-1"
                onClick={() => handleAction("accepted")}
                disabled={acting}
              >
                <CheckCircle className="w-3 h-3" />
                Approve
              </Button>
              <Button
                size="sm"
                variant="destructive"
                className="h-7 text-xs gap-1"
                onClick={() => handleAction("rejected")}
                disabled={acting}
              >
                <XCircle className="w-3 h-3" />
                Reject
              </Button>
            </>
          )}
          <span className="ml-auto text-[10px] text-muted-foreground">
            {formatTime(message.created_at)}
          </span>
        </div>
      </Card>
    </div>
  );
};
