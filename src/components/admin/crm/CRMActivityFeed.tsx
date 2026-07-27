import { useState } from "react";
import { useCRMActivityFeed } from "@/hooks/useCRMActivityFeed";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RefreshCw, Activity } from "lucide-react";
import { format } from "date-fns";

export const CRMActivityFeed = () => {
  const [activityType, setActivityType] = useState("all");
  const { events, isLoading, refetch } = useCRMActivityFeed({ activityType });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Activity Feed</h2>
        <div className="flex gap-3">
          <Select value={activityType} onValueChange={setActivityType}>
            <SelectTrigger className="w-44">
              <SelectValue placeholder="Activity Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Activities</SelectItem>
              <SelectItem value="signup">Signups</SelectItem>
              <SelectItem value="login">Logins</SelectItem>
              <SelectItem value="application">Applications</SelectItem>
              <SelectItem value="profile_update">Profile Updates</SelectItem>
              <SelectItem value="message">Messages</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon" onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-8 text-muted-foreground">Loading...</div>
      ) : (
        <div className="space-y-2">
          {events.map((event) => (
            <div
              key={event.id}
              className="flex items-start gap-3 p-3 rounded-lg border bg-card hover:bg-muted/30 transition-colors"
            >
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <Activity className="h-4 w-4 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">
                    {event.user?.first_name || "Unknown"} {event.user?.last_name || ""}
                  </span>
                  {event.user?.user_type && (
                    <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                      {event.user.user_type}
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">{event.activity_description}</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {format(new Date(event.created_at), "MMM d, yyyy HH:mm:ss")}
                </p>
              </div>
              <Badge variant="secondary" className="text-[10px] shrink-0">
                {event.activity_type}
              </Badge>
            </div>
          ))}
          {events.length === 0 && (
            <p className="text-center py-8 text-muted-foreground">No activity recorded yet</p>
          )}
        </div>
      )}
    </div>
  );
};
