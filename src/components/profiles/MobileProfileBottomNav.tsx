import { Button } from "@/components/ui/button";
import { 
  LayoutDashboard, 
  MessageSquare, 
  FileText, 
  Settings, 
  MoreHorizontal,
  Home,
  BarChart3,
  Star,
  HelpCircle,
  Trophy,
  Award,
  CreditCard,
  Percent
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface MobileProfileBottomNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  userType?: 'host' | 'influencer' | 'brand' | 'restaurant_owner';
}

const MobileProfileBottomNav = ({ activeTab, onTabChange, userType = 'influencer' }: MobileProfileBottomNavProps) => {
  // Primary navigation items (always visible)
  const primaryItems = [
    { id: "overview", icon: LayoutDashboard, label: "Home" },
    { id: "messages", icon: MessageSquare, label: "Messages" },
    { id: "applications", icon: FileText, label: "Apps" },
    { id: "settings", icon: Settings, label: "Settings" },
  ];

  // Secondary items in "More" menu - different for influencers vs hosts
  const secondaryItems = userType === 'influencer' ? [
    { id: "analytics", icon: BarChart3, label: "Analytics" },
    { id: "affiliate", icon: Percent, label: "Affiliate" },
    { id: "ambassador", icon: Trophy, label: "Ambassador" },
    { id: "badges", icon: Award, label: "Badges" },
    { id: "subscription", icon: CreditCard, label: "Subscription" },
    { id: "reviews", icon: Star, label: "Reviews" },
    { id: "collaborations", icon: Home, label: "Collabs" },
    { id: "help", icon: HelpCircle, label: "Help" },
  ] : [
    { id: "analytics", icon: BarChart3, label: "Analytics" },
    { id: "reviews", icon: Star, label: "Reviews" },
    { id: "collaborations", icon: Home, label: "Collabs" },
    { id: "help", icon: HelpCircle, label: "Help" },
  ];

  // Add properties for hosts
  if (userType === 'host') {
    primaryItems[2] = { id: "properties", icon: Home, label: "Properties" };
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border z-50 pb-safe md:hidden">
      <div className="flex items-center justify-around px-2 py-2">
        {primaryItems.map((item) => (
          <Button
            key={item.id}
            variant={activeTab === item.id ? "default" : "ghost"}
            onClick={() => onTabChange(item.id)}
            className={`flex flex-col items-center gap-0.5 h-auto py-2 px-3 min-h-[52px] min-w-[52px] ${
              activeTab === item.id 
                ? "bg-primary text-primary-foreground" 
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <item.icon className="w-5 h-5" />
            <span className="text-[10px] font-medium">{item.label}</span>
          </Button>
        ))}
        
        {/* More Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="flex flex-col items-center gap-0.5 h-auto py-2 px-3 min-h-[52px] min-w-[52px] text-muted-foreground hover:text-foreground"
            >
              <MoreHorizontal className="w-5 h-5" />
              <span className="text-[10px] font-medium">More</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48 mb-2">
            {secondaryItems.map((item) => (
              <DropdownMenuItem
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`flex items-center gap-3 py-3 ${
                  activeTab === item.id ? "bg-accent" : ""
                }`}
              >
                <item.icon className="w-4 h-4" />
                <span>{item.label}</span>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};

export default MobileProfileBottomNav;
