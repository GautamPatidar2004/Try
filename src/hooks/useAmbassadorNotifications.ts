import { useMemo } from "react";
import { useNotifications, Notification } from "./useNotifications";
import { 
  AmbassadorNotificationCategory, 
  getNotificationCategory, 
  isAmbassadorNotificationType 
} from "@/components/ambassador/AmbassadorNotificationFilters";

export const AMBASSADOR_NOTIFICATION_TYPES = [
  "ambassador_new_referral",
  "ambassador_signup",
  "ambassador_subscription",
  "ambassador_milestone",
  "ambassador_tier_change",
  "ambassador_requirement_update",
] as const;

export type AmbassadorNotificationType = typeof AMBASSADOR_NOTIFICATION_TYPES[number];

export const useAmbassadorNotifications = (category: AmbassadorNotificationCategory = "all") => {
  const notificationsData = useNotifications();
  
  const ambassadorNotifications = useMemo(() => {
    if (!notificationsData.notifications) return [];
    
    return notificationsData.notifications.filter((n) => 
      isAmbassadorNotificationType(n.type)
    );
  }, [notificationsData.notifications]);
  
  const filteredNotifications = useMemo(() => {
    if (category === "all") return ambassadorNotifications;
    
    return ambassadorNotifications.filter((n) => 
      getNotificationCategory(n.type) === category
    );
  }, [ambassadorNotifications, category]);
  
  const unreadAmbassadorCount = useMemo(() => {
    return ambassadorNotifications.filter((n) => !n.read).length;
  }, [ambassadorNotifications]);
  
  return {
    ...notificationsData,
    ambassadorNotifications,
    filteredNotifications,
    unreadAmbassadorCount,
  };
};
