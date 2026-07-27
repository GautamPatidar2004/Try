import { useState, useEffect } from "react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { 
  BarChart3, 
  Users, 
  Home, 
  Camera, 
  MessageSquare, 
  Settings,
  UserPlus,
  HelpCircle,
  DollarSign,
  Star,
  Trophy,
  Handshake,
  Megaphone,
  TrendingUp,
  Briefcase,
  UtensilsCrossed,
  Users2,
  LayoutDashboard,
  Activity,
  Share2,
  Search,
  Zap,
  Percent
} from "lucide-react";

interface AdminCommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (sectionId: string) => void;
}

const navigationItems = [
  { id: "overview", label: "Overview Dashboard", icon: LayoutDashboard, group: "Dashboard" },
  { id: "analytics", label: "Analytics", icon: TrendingUp, group: "Dashboard" },
  { id: "activity", label: "Activity Log", icon: Activity, group: "Dashboard" },
  { id: "users", label: "All Users", icon: Users, group: "CRM" },
  { id: "waitlist", label: "Waitlist", icon: UserPlus, group: "CRM" },
  { id: "properties", label: "Properties", icon: Home, group: "Marketplace" },
  { id: "brands", label: "Brands", icon: Briefcase, group: "Marketplace" },
  { id: "restaurants", label: "Restaurants", icon: UtensilsCrossed, group: "Marketplace" },
  { id: "posts", label: "Content Posts", icon: Camera, group: "Marketplace" },
  { id: "applications", label: "Applications", icon: MessageSquare, group: "Collaborations" },
  { id: "agreements", label: "Agreements", icon: Handshake, group: "Collaborations" },
  { id: "social-accounts", label: "Social Accounts", icon: Share2, group: "Collaborations" },
  { id: "financial", label: "Revenue Dashboard", icon: DollarSign, group: "Financials" },
  { id: "referrals", label: "Referral Program", icon: Trophy, group: "Growth" },
  { id: "ambassadors", label: "Ambassadors", icon: Users2, group: "Growth" },
  { id: "affiliates", label: "Creator Affiliates", icon: Percent, group: "Growth" },
  { id: "communications", label: "Communications", icon: Megaphone, group: "Growth" },
  { id: "support", label: "Support Tickets", icon: HelpCircle, group: "Support" },
  { id: "reviews", label: "Reviews & Ratings", icon: Star, group: "Support" },
  { id: "settings", label: "Platform Settings", icon: Settings, group: "Settings" },
];

const quickActions = [
  { id: "quick-user-search", label: "Search for a user...", icon: Search, action: "search-user" },
  { id: "quick-new-campaign", label: "Create communication campaign", icon: Megaphone, action: "new-campaign" },
  { id: "quick-export", label: "Export data", icon: Zap, action: "export" },
];

export const AdminCommandPalette = ({ open, onOpenChange, onSelect }: AdminCommandPaletteProps) => {
  const [search, setSearch] = useState("");

  // Reset search when dialog closes
  useEffect(() => {
    if (!open) {
      setSearch("");
    }
  }, [open]);

  const groupedItems = navigationItems.reduce((acc, item) => {
    if (!acc[item.group]) {
      acc[item.group] = [];
    }
    acc[item.group].push(item);
    return acc;
  }, {} as Record<string, typeof navigationItems>);

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput 
        placeholder="Type a command or search..." 
        value={search}
        onValueChange={setSearch}
      />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        
        {/* Quick Actions */}
        <CommandGroup heading="Quick Actions">
          {quickActions.map((action) => (
            <CommandItem
              key={action.id}
              onSelect={() => {
                // For now, quick actions just navigate to relevant section
                if (action.action === "search-user") {
                  onSelect("users");
                } else if (action.action === "new-campaign") {
                  onSelect("communications");
                } else if (action.action === "export") {
                  onSelect("analytics");
                }
              }}
              className="gap-2"
            >
              <action.icon className="h-4 w-4 text-muted-foreground" />
              <span>{action.label}</span>
            </CommandItem>
          ))}
        </CommandGroup>
        
        <CommandSeparator />
        
        {/* Navigation Groups */}
        {Object.entries(groupedItems).map(([group, items]) => (
          <CommandGroup key={group} heading={group}>
            {items.map((item) => (
              <CommandItem
                key={item.id}
                onSelect={() => onSelect(item.id)}
                className="gap-2"
              >
                <item.icon className="h-4 w-4 text-muted-foreground" />
                <span>{item.label}</span>
              </CommandItem>
            ))}
          </CommandGroup>
        ))}
      </CommandList>
    </CommandDialog>
  );
};
