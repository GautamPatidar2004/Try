import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Download, Filter } from "lucide-react";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ActivityEvent {
  id: string;
  activity_type: string;
  activity_description: string;
  metadata: any;
  ip_address: string | null;
  created_at: string;
}

interface UserActivityTimelineProps {
  userId: string;
}

export const UserActivityTimeline = ({ userId }: UserActivityTimelineProps) => {
  const [activities, setActivities] = useState<ActivityEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<string>("all");

  useEffect(() => {
    fetchActivities();
  }, [userId, filterType]);

  const fetchActivities = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from("user_activity_timeline")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(50);

      if (filterType !== "all") {
        query = query.eq("activity_type", filterType);
      }

      const { data, error } = await query;

      if (error) throw error;
      setActivities(data || []);
    } catch (error) {
      console.error("Error fetching activities:", error);
    } finally {
      setLoading(false);
    }
  };

  const exportActivities = () => {
    const csv = [
      ["Date", "Type", "Description", "IP Address"],
      ...activities.map((activity) => [
        format(new Date(activity.created_at), "PPpp"),
        activity.activity_type,
        activity.activity_description,
        activity.ip_address || "N/A",
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `user-activity-${userId}-${Date.now()}.csv`;
    a.click();
  };

  const getActivityColor = (type: string) => {
    const colors: Record<string, string> = {
      login: "bg-blue-500/10 text-blue-500",
      logout: "bg-gray-500/10 text-gray-500",
      profile_update: "bg-green-500/10 text-green-500",
      application_created: "bg-purple-500/10 text-purple-500",
      payment: "bg-emerald-500/10 text-emerald-500",
      security: "bg-red-500/10 text-red-500",
    };
    return colors[type] || "bg-muted text-muted-foreground";
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Activity Timeline</CardTitle>
          <div className="flex gap-2">
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-[140px]">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Activity</SelectItem>
                <SelectItem value="login">Login</SelectItem>
                <SelectItem value="profile_update">Profile</SelectItem>
                <SelectItem value="application_created">Applications</SelectItem>
                <SelectItem value="payment">Payments</SelectItem>
                <SelectItem value="security">Security</SelectItem>
              </SelectContent>
            </Select>
            <Button size="sm" variant="outline" onClick={exportActivities}>
              <Download className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pr-4">
          {loading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : activities.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No activity recorded yet
            </div>
          ) : (
            <div className="space-y-3">
              {activities.map((activity) => (
                <div
                  key={activity.id}
                  className="border rounded-lg p-3 hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge
                          variant="outline"
                          className={getActivityColor(activity.activity_type)}
                        >
                          {activity.activity_type.replace("_", " ")}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(activity.created_at), "PPp")}
                        </span>
                      </div>
                      <p className="text-sm">{activity.activity_description}</p>
                      {activity.ip_address && (
                        <p className="text-xs text-muted-foreground mt-1">
                          IP: {activity.ip_address}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
