import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Bell, Send, Users } from "lucide-react";
import { useCommunications } from "@/hooks/useCommunications";
import { supabase } from "@/integrations/supabase/client";

const NOTIFICATION_TYPES = [
  { value: "platform_announcement", label: "Platform Announcement" },
  { value: "platform_update", label: "Platform Update" },
  { value: "new_creator_joined", label: "New Creator Joined" },
  { value: "new_host_joined", label: "New Host Joined" },
  { value: "new_brand_joined", label: "New Brand Joined" },
];

export const BroadcastNotificationComposer = () => {
  const { sendBroadcastNotification } = useCommunications();
  const [name, setName] = useState("");
  const [content, setContent] = useState("");
  const [userType, setUserType] = useState("all");
  const [isActive, setIsActive] = useState<boolean | undefined>(undefined);
  const [recipientCount, setRecipientCount] = useState<number | null>(null);
  const [notificationType, setNotificationType] = useState("platform_announcement");

  // Fetch recipient count when filters change
  useEffect(() => {
    const fetchRecipientCount = async () => {
      let query = supabase.from("profiles").select("id", { count: "exact", head: true });
      
      if (userType !== "all") {
        query = query.eq("user_type", userType);
      }
      if (isActive !== undefined) {
        query = query.eq("is_active", isActive);
      }

      const { count } = await query;
      setRecipientCount(count);
    };

    fetchRecipientCount();
  }, [userType, isActive]);

  const handleSend = () => {
    if (!name.trim() || !content.trim()) return;

    const targetSegment: any = {};
    if (userType !== "all") targetSegment.userType = userType;
    if (isActive !== undefined) targetSegment.isActive = isActive;

    sendBroadcastNotification.mutate({
      name,
      content,
      targetSegment,
      notificationType,
    });

    // Reset form
    setName("");
    setContent("");
    setUserType("all");
    setIsActive(undefined);
    setNotificationType("platform_announcement");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Send Broadcast Notification
        </CardTitle>
        <CardDescription>
          Send an in-app notification to targeted users
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="campaign-name">Campaign Name</Label>
          <Input
            id="campaign-name"
            placeholder="e.g., Weekly Update - Jan 2024"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="message">Message</Label>
          <Textarea
            id="message"
            placeholder="Enter your announcement message..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={6}
          />
          <p className="text-xs text-muted-foreground">{content.length} characters</p>
        </div>

        <div className="space-y-2">
          <Label>Notification Category</Label>
          <Select value={notificationType} onValueChange={setNotificationType}>
            <SelectTrigger>
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

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label>User Type</Label>
            <Select value={userType} onValueChange={setUserType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Users</SelectItem>
                <SelectItem value="host">Hosts Only</SelectItem>
                <SelectItem value="influencer">Creators Only</SelectItem>
                <SelectItem value="brand">Brands Only</SelectItem>
                <SelectItem value="restaurant_owner">Restaurant Owners Only</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Account Status</Label>
            <Select
              value={isActive === undefined ? "all" : isActive ? "active" : "inactive"}
              onValueChange={(val) =>
                setIsActive(val === "all" ? undefined : val === "active")
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="active">Active Only</SelectItem>
                <SelectItem value="inactive">Inactive Only</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {recipientCount !== null && (
          <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">
              <strong>{recipientCount}</strong> user{recipientCount !== 1 ? "s" : ""} will receive this notification
            </span>
          </div>
        )}

        <Button
          onClick={handleSend}
          disabled={!name.trim() || !content.trim() || sendBroadcastNotification.isPending || recipientCount === 0}
          className="w-full"
        >
          <Send className="h-4 w-4 mr-2" />
          {sendBroadcastNotification.isPending ? "Sending..." : "Send Broadcast"}
        </Button>
      </CardContent>
    </Card>
  );
};
