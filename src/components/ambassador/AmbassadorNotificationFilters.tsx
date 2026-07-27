import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserPlus, DollarSign, Trophy, CheckCircle, Bell } from "lucide-react";

export type AmbassadorNotificationCategory = 
  | "all" 
  | "referrals" 
  | "earnings" 
  | "milestones" 
  | "updates";

interface AmbassadorNotificationFiltersProps {
  activeCategory: AmbassadorNotificationCategory;
  onCategoryChange: (category: AmbassadorNotificationCategory) => void;
}

const categories: { value: AmbassadorNotificationCategory; label: string; icon: React.ReactNode }[] = [
  { value: "all", label: "All", icon: <Bell className="h-3.5 w-3.5" /> },
  { value: "referrals", label: "Referrals", icon: <UserPlus className="h-3.5 w-3.5" /> },
  { value: "earnings", label: "Earnings", icon: <DollarSign className="h-3.5 w-3.5" /> },
  { value: "milestones", label: "Milestones", icon: <Trophy className="h-3.5 w-3.5" /> },
  { value: "updates", label: "Updates", icon: <CheckCircle className="h-3.5 w-3.5" /> },
];

export const AmbassadorNotificationFilters = ({
  activeCategory,
  onCategoryChange,
}: AmbassadorNotificationFiltersProps) => {
  return (
    <Tabs value={activeCategory} onValueChange={(v) => onCategoryChange(v as AmbassadorNotificationCategory)}>
      <TabsList className="grid w-full grid-cols-5 h-8">
        {categories.map((category) => (
          <TabsTrigger
            key={category.value}
            value={category.value}
            className="flex items-center gap-1 text-xs px-2"
          >
            {category.icon}
            <span className="hidden sm:inline">{category.label}</span>
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
};

// Helper function to map notification types to categories
export const getNotificationCategory = (type: string): AmbassadorNotificationCategory => {
  switch (type) {
    case "ambassador_new_referral":
    case "ambassador_signup":
      return "referrals";
    case "ambassador_subscription":
      return "earnings";
    case "ambassador_milestone":
      return "milestones";
    case "ambassador_tier_change":
    case "ambassador_requirement_update":
      return "updates";
    default:
      return "all";
  }
};

// Check if a notification type is an ambassador notification
export const isAmbassadorNotificationType = (type: string): boolean => {
  return type.startsWith("ambassador_");
};
