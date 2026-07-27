import { useState } from "react";
import { 
  Bell, 
  Check, 
  CheckCheck, 
  Trash2, 
  Megaphone, 
  Heart, 
  MessageSquare, 
  Users,
  DollarSign,
  Trophy,
  TrendingUp,
  CheckCircle,
  Link2,
  UserPlus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNotifications, Notification } from "@/hooks/useNotifications";
import { useAmbassador } from "@/hooks/useAmbassador";
import { 
  AmbassadorNotificationFilters, 
  AmbassadorNotificationCategory,
  getNotificationCategory,
  isAmbassadorNotificationType,
} from "@/components/ambassador/AmbassadorNotificationFilters";
import { formatDistanceToNow } from "date-fns";

const getNotificationIcon = (type: string) => {
  switch (type) {
    case "announcement":
      return <Megaphone className="h-5 w-5 text-primary" />;
    case "like":
      return <Heart className="h-5 w-5 text-red-500" />;
    case "comment":
      return <MessageSquare className="h-5 w-5 text-blue-500" />;
    case "follow":
      return <Users className="h-5 w-5 text-green-500" />;
    case "application":
      return <Bell className="h-5 w-5 text-orange-500" />;
    case "ambassador_new_referral":
      return <Link2 className="h-5 w-5 text-blue-500" />;
    case "ambassador_signup":
      return <UserPlus className="h-5 w-5 text-emerald-500" />;
    case "ambassador_subscription":
      return <DollarSign className="h-5 w-5 text-green-500" />;
    case "ambassador_milestone":
      return <Trophy className="h-5 w-5 text-yellow-500" />;
    case "ambassador_tier_change":
      return <TrendingUp className="h-5 w-5 text-purple-500" />;
    case "ambassador_requirement_update":
      return <CheckCircle className="h-5 w-5 text-blue-500" />;
    default:
      return <Bell className="h-5 w-5 text-muted-foreground" />;
  }
};

const NotificationCard = ({
  notification,
  onMarkAsRead,
  onDelete,
}: {
  notification: Notification;
  onMarkAsRead: (id: string) => void;
  onDelete: (id: string) => void;
}) => {
  return (
    <Card className={`mb-3 ${!notification.read ? "border-primary/50 bg-primary/5" : ""}`}>
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          <div className="p-2 rounded-full bg-muted">
            {getNotificationIcon(notification.type)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h4 className={`text-sm ${!notification.read ? "font-semibold" : "font-medium"}`}>
                {notification.title}
              </h4>
              {!notification.read && (
                <Badge variant="secondary" className="text-xs">New</Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground">{notification.message}</p>
            <p className="text-xs text-muted-foreground mt-2">
              {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {!notification.read && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onMarkAsRead(notification.id)}
              >
                <Check className="h-4 w-4" />
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              className="text-destructive hover:bg-destructive hover:text-destructive-foreground"
              onClick={() => onDelete(notification.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export const NotificationCenter = () => {
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const [ambassadorCategory, setAmbassadorCategory] = useState<AmbassadorNotificationCategory>("all");
  const { notifications, isLoading, unreadCount, markAsRead, markAllAsRead, deleteNotification } =
    useNotifications();
  const { isAmbassador } = useAmbassador();

  const filteredNotifications = notifications?.filter((n) => {
    // First apply read/unread filter
    if (filter === "unread" && n.read) return false;
    
    // If ambassador and category filter is set, apply it
    if (isAmbassador && ambassadorCategory !== "all") {
      if (!isAmbassadorNotificationType(n.type)) return false;
      return getNotificationCategory(n.type) === ambassadorCategory;
    }
    
    return true;
  });

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Bell className="h-6 w-6" />
            Notifications
          </h1>
          <p className="text-muted-foreground">
            {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount > 1 ? "s" : ""}` : "All caught up!"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <Button variant="outline" onClick={() => markAllAsRead.mutate()}>
              <CheckCheck className="h-4 w-4 mr-2" />
              Mark all as read
            </Button>
          )}
        </div>
      </div>

      {isAmbassador && (
        <div className="mb-4">
          <p className="text-sm text-muted-foreground mb-2">Ambassador Notifications</p>
          <AmbassadorNotificationFilters
            activeCategory={ambassadorCategory}
            onCategoryChange={setAmbassadorCategory}
          />
        </div>
      )}

      <Tabs value={filter} onValueChange={(v) => setFilter(v as "all" | "unread")}>
        <TabsList className="mb-4">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="unread">
            Unread
            {unreadCount > 0 && (
              <Badge variant="secondary" className="ml-2">{unreadCount}</Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value={filter}>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : !filteredNotifications || filteredNotifications.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Bell className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No notifications</h3>
                <p className="text-muted-foreground text-center">
                  {filter === "unread"
                    ? "You've read all your notifications"
                    : "You don't have any notifications yet"}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div>
              {filteredNotifications.map((notification) => (
                <NotificationCard
                  key={notification.id}
                  notification={notification}
                  onMarkAsRead={(id) => markAsRead.mutate(id)}
                  onDelete={(id) => deleteNotification.mutate(id)}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};
