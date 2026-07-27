import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Mail, Send, Eye, Sparkles } from "lucide-react";
import { useCommunications } from "@/hooks/useCommunications";
import { RichEmailEditor } from "./RichEmailEditor";
import { SegmentBuilder, SegmentFilters, useSegmentRecipientCount } from "./SegmentBuilder";
import { EmailPreviewModal } from "./EmailPreviewModal";
import { TemplateLibrary } from "./TemplateLibrary";

const NOTIFICATION_TYPES = [
  { value: "platform_announcement", label: "Platform Announcement" },
  { value: "platform_update", label: "Platform Update" },
  { value: "new_creator_joined", label: "New Creator Joined" },
  { value: "new_host_joined", label: "New Host Joined" },
  { value: "new_brand_joined", label: "New Brand Joined" },
];

const defaultFilters: SegmentFilters = {
  userType: "all",
  accountStatus: "all",
  isVerified: "all",
  accountTier: "all",
  engagementLevel: "all",
  location: "",
  lastLoginDays: "all",
  registeredAfter: undefined,
  registeredBefore: undefined,
};

export const EmailCampaignComposer = () => {
  const { sendEmailCampaign, sendBroadcastNotification } = useCommunications();
  const [name, setName] = useState("");
  const [subject, setSubject] = useState("");
  const [content, setContent] = useState("");
  const [filters, setFilters] = useState<SegmentFilters>(defaultFilters);
  const [sendInAppToo, setSendInAppToo] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [notificationType, setNotificationType] = useState("platform_announcement");

  const { count: recipientCount, isLoading: countLoading } = useSegmentRecipientCount(filters);

  const handleSelectTemplate = (template: { name: string; subject: string; content: string }) => {
    setName(template.name);
    setSubject(template.subject);
    setContent(template.content);
    setShowTemplates(false);
  };

  const buildTargetSegment = () => {
    const segment: Record<string, any> = {};
    if (filters.userType !== "all") segment.userType = filters.userType;
    if (filters.accountStatus !== "all") {
      segment.isActive = filters.accountStatus === "active";
      if (filters.accountStatus === "banned") segment.isBanned = true;
    }
    if (filters.isVerified !== "all") segment.isVerified = filters.isVerified === "verified";
    if (filters.accountTier !== "all") segment.accountTier = filters.accountTier;
    if (filters.location) segment.location = filters.location;
    return segment;
  };

  const handleSend = async () => {
    if (!name.trim() || !subject.trim() || !content.trim()) return;

    const targetSegment = buildTargetSegment();

    sendEmailCampaign.mutate({
      name,
      subject,
      content,
      targetSegment,
    });

    if (sendInAppToo) {
      sendBroadcastNotification.mutate({
        name: `${name} (In-App)`,
        content: subject,
        targetSegment,
        notificationType,
      });
    }

    // Reset form
    setName("");
    setSubject("");
    setContent("");
    setFilters(defaultFilters);
    setSendInAppToo(false);
    setNotificationType("platform_announcement");
  };

  return (
    <div className="space-y-4">
      {/* Template Selection */}
      {showTemplates ? (
        <div className="space-y-4">
          <Button variant="outline" onClick={() => setShowTemplates(false)}>
            ← Back to Composer
          </Button>
          <TemplateLibrary onSelectTemplate={handleSelectTemplate} />
        </div>
      ) : (
        <>
          {/* Main Composer */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Mail className="h-5 w-5" />
                    Email Campaign Composer
                  </CardTitle>
                  <CardDescription>Create and send targeted email campaigns</CardDescription>
                </div>
                <Button variant="outline" onClick={() => setShowTemplates(true)}>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Templates
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="campaign-name">Campaign Name</Label>
                  <Input
                    id="campaign-name"
                    placeholder="e.g., January Newsletter"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email-subject">Email Subject</Label>
                  <Input
                    id="email-subject"
                    placeholder="Enter email subject..."
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Email Content</Label>
                <RichEmailEditor
                  value={content}
                  onChange={setContent}
                  placeholder="Compose your email..."
                />
              </div>
            </CardContent>
          </Card>

          {/* Segment Builder */}
          <SegmentBuilder
            filters={filters}
            onFiltersChange={setFilters}
            recipientCount={recipientCount}
            isLoading={countLoading}
          />

          {/* Actions */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col gap-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="send-inapp"
                      checked={sendInAppToo}
                      onCheckedChange={(checked) => setSendInAppToo(checked as boolean)}
                    />
                    <Label htmlFor="send-inapp" className="text-sm font-normal cursor-pointer">
                      Also send as in-app notification
                    </Label>
                  </div>

                  {sendInAppToo && (
                    <div className="flex items-center gap-2">
                      <Label className="text-sm whitespace-nowrap">Type:</Label>
                      <Select value={notificationType} onValueChange={setNotificationType}>
                        <SelectTrigger className="w-[200px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {NOTIFICATION_TYPES.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>

                <div className="flex gap-2 w-full sm:w-auto">
                  <Button
                    variant="outline"
                    onClick={() => setShowPreview(true)}
                    disabled={!content.trim()}
                    className="flex-1 sm:flex-none"
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Preview
                  </Button>
                  <Button
                    onClick={handleSend}
                    disabled={
                      !name.trim() ||
                      !subject.trim() ||
                      !content.trim() ||
                      sendEmailCampaign.isPending ||
                      recipientCount === 0
                    }
                    className="flex-1 sm:flex-none"
                  >
                    <Send className="h-4 w-4 mr-2" />
                    {sendEmailCampaign.isPending ? "Sending..." : "Send Campaign"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      <EmailPreviewModal
        open={showPreview}
        onOpenChange={setShowPreview}
        subject={subject}
        content={content}
      />
    </div>
  );
};
