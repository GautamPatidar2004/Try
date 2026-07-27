import { useState } from "react";
import { 
  Bell, 
  Check, 
  CheckCheck, 
  X, 
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
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useNotifications, Notification } from "@/hooks/useNotifications";
import { formatDistanceToNow } from "date-fns";
import { Link } from "react-router-dom";

const getNotificationIcon = (type: string) => {
  switch (type) {
    case "announcement":
      return <Megaphone className="h-4 w-4 text-primary" />;
    case "like":
      return <Heart className="h-4 w-4 text-red-500" />;
    case "comment":
      return <MessageSquare className="h-4 w-4 text-blue-500" />;
    case "follow":
      return <Users className="h-4 w-4 text-green-500" />;
    case "ambassador_new_referral":
      return <Link2 className="h-4 w-4 text-blue-500" />;
    case "ambassador_signup":
      return <UserPlus className="h-4 w-4 text-emerald-500" />;
    case "ambassador_subscription":
      return <DollarSign className="h-4 w-4 text-green-500" />;
    case "ambassador_milestone":
      return <Trophy className="h-4 w-4 text-yellow-500" />;
    case "ambassador_tier_change":
      return <TrendingUp className="h-4 w-4 text-purple-500" />;
    case "ambassador_requirement_update":
      return <CheckCircle className="h-4 w-4 text-blue-500" />;
    default:
      return <Bell className="h-4 w-4 text-muted-foreground" />;
  }
};

const NotificationItem = ({
  notification,
  onMarkAsRead,
  onDelete,
}: {
  notification: Notification;
  onMarkAsRead: (id: string) => void;
  onDelete: (id: string) => void;
}) => {
  return (
    <div
      className={`p-3 border-b last:border-b-0 hover:bg-muted/50 transition-colors ${
        !notification.read ? "bg-primary/5" : ""
      }`}
    >
      <div className="flex items-start gap-3">
        <div className="mt-1">{getNotificationIcon(notification.type)}</div>
        <div className="flex-1 min-w-0">
          <p className={`text-sm ${!notification.read ? "font-semibold" : ""}`}>
            {notification.title}
          </p>
          <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
            {notification.message}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
          </p>
        </div>
        <div className="flex items-center gap-1">
          {!notification.read && (
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={() => onMarkAsRead(notification.id)}
              title="Mark as read"
            >
              <Check className="h-3 w-3" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 text-muted-foreground hover:text-destructive"
            onClick={() => onDelete(notification.id)}
            title="Delete"
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export const NotificationBell = () => {
  const [open, setOpen] = useState(false);
  const { notifications, unreadCount, markAsRead, markAllAsRead, deleteNotification } =
    useNotifications();

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between p-3 border-b">
          <h4 className="font-semibold">Notifications</h4>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="text-xs h-7"
              onClick={() => markAllAsRead.mutate()}
            >
              <CheckCheck className="h-3 w-3 mr-1" />
              Mark all read
            </Button>
          )}
        </div>
        <ScrollArea className="h-[300px]">
          {!notifications || notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-[200px] text-muted-foreground">
              <Bell className="h-8 w-8 mb-2 opacity-50" />
              <p className="text-sm">No notifications yet</p>
            </div>
          ) : (
            notifications.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                onMarkAsRead={(id) => markAsRead.mutate(id)}
                onDelete={(id) => deleteNotification.mutate(id)}
              />
            ))
          )}
        </ScrollArea>
        <div className="p-2 border-t">
          <Link to="/notifications" onClick={() => setOpen(false)}>
            <Button variant="ghost" size="sm" className="w-full text-xs">
              View all notifications
            </Button>
          </Link>
        </div>
      </PopoverContent>
    </Popover>
  );
};
