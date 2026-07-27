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
  Target,
  Wallet,
  UserCheck,
  FileText,
  Activity,
  Share2,
  ChevronDown,
  Percent,
  FileEdit,
  Kanban,
  ListTodo,
  PieChart,
  Rss,
  MousePointerClick,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface AdminSidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

interface NavGroup {
  label: string;
  items: NavItem[];
  defaultOpen?: boolean;
}

interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const navigationGroups: NavGroup[] = [
  {
    label: "Dashboard",
    defaultOpen: true,
    items: [
      { id: "overview", label: "Overview", icon: LayoutDashboard },
      { id: "analytics", label: "Analytics", icon: TrendingUp },
      { id: "popup-analytics", label: "Pop-up Analytics", icon: MousePointerClick },
      { id: "activity", label: "Activity Log", icon: Activity },
    ],
  },
  {
    label: "CRM",
    defaultOpen: false,
    items: [
      { id: "crm-pipeline", label: "Pipeline", icon: Kanban },
      { id: "users", label: "All Users", icon: Users },
      { id: "crm-activity", label: "Activity Feed", icon: Rss },
      { id: "crm-tasks", label: "Tasks", icon: ListTodo },
      { id: "crm-reports", label: "Reports", icon: PieChart },
      { id: "waitlist", label: "Waitlist", icon: UserPlus },
    ],
  },
  {
    label: "Marketplace",
    defaultOpen: false,
    items: [
      { id: "properties", label: "Properties", icon: Home },
      { id: "brands", label: "Brands", icon: Briefcase },
      { id: "restaurants", label: "Restaurants", icon: UtensilsCrossed },
      { id: "brand-campaigns", label: "Brand Campaigns", icon: Megaphone },
      { id: "posts", label: "Content Posts", icon: Camera },
    ],
  },
  {
    label: "Collaborations",
    defaultOpen: false,
    items: [
      { id: "applications", label: "Applications", icon: MessageSquare },
      { id: "agreements", label: "Agreements", icon: Handshake },
      { id: "social-accounts", label: "Social Accounts", icon: Share2 },
    ],
  },
  {
    label: "Financials",
    defaultOpen: false,
    items: [
      { id: "financial", label: "Revenue Dashboard", icon: DollarSign },
      { id: "platform-deals", label: "Platform Deals", icon: Briefcase },
    ],
  },
  {
    label: "Growth",
    defaultOpen: false,
    items: [
      { id: "referrals", label: "Referral Program", icon: Trophy },
      { id: "ambassadors", label: "Ambassadors", icon: Users2 },
      { id: "affiliates", label: "Creator Affiliates", icon: Percent },
      { id: "communications", label: "Communications", icon: Megaphone },
    ],
  },
   {
     label: "Content",
     defaultOpen: false,
     items: [
       { id: "blog", label: "Blog Posts", icon: FileEdit },
     ],
   },
  {
    label: "Support",
    defaultOpen: false,
    items: [
      { id: "support", label: "Tickets", icon: HelpCircle },
      { id: "reviews", label: "Reviews & Ratings", icon: Star },
    ],
  },
  {
    label: "Settings",
    defaultOpen: false,
    items: [
      { id: "settings", label: "Platform Settings", icon: Settings },
    ],
  },
];

export const AdminSidebar = ({ activeSection, onSectionChange }: AdminSidebarProps) => {
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";
  
  // Track which groups are open - default based on active section
  const getInitialOpenGroups = () => {
    const openGroups: Record<string, boolean> = {};
    navigationGroups.forEach((group) => {
      const hasActiveItem = group.items.some(item => item.id === activeSection);
      openGroups[group.label] = hasActiveItem || group.defaultOpen || false;
    });
    return openGroups;
  };
  
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(getInitialOpenGroups);

  const toggleGroup = (label: string) => {
    setOpenGroups(prev => ({
      ...prev,
      [label]: !prev[label]
    }));
  };

  return (
    <Sidebar collapsible="icon" className="border-r">
      <SidebarContent className="py-4">
        {/* Logo/Brand */}
        <div className="px-4 mb-4">
          <div className={cn(
            "flex items-center gap-2 font-bold text-lg",
            isCollapsed && "justify-center"
          )}>
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-hostfluencer-green to-hostfluencer-accent flex items-center justify-center text-white text-sm font-bold shrink-0">
              H
            </div>
            {!isCollapsed && <span>Hostfluencer</span>}
          </div>
        </div>

        {/* Navigation Groups */}
        {navigationGroups.map((group) => (
          <SidebarGroup key={group.label}>
            {isCollapsed ? (
              // Collapsed: Show items directly without group label
              <SidebarMenu>
                {group.items.map((item) => (
                  <SidebarMenuItem key={item.id}>
                    <SidebarMenuButton
                      isActive={activeSection === item.id}
                      onClick={() => onSectionChange(item.id)}
                      tooltip={item.label}
                      className={cn(
                        activeSection === item.id && "bg-hostfluencer-green text-white hover:bg-hostfluencer-green/90"
                      )}
                    >
                      <item.icon className="h-4 w-4" />
                      <span>{item.label}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            ) : (
              // Expanded: Show collapsible groups
              <Collapsible
                open={openGroups[group.label]}
                onOpenChange={() => toggleGroup(group.label)}
              >
                <CollapsibleTrigger asChild>
                  <SidebarGroupLabel className="cursor-pointer hover:bg-muted/50 rounded-md px-2 py-1.5 flex items-center justify-between group">
                    <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      {group.label}
                    </span>
                    <ChevronDown className={cn(
                      "h-4 w-4 text-muted-foreground transition-transform",
                      openGroups[group.label] && "rotate-180"
                    )} />
                  </SidebarGroupLabel>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <SidebarGroupContent>
                    <SidebarMenu>
                      {group.items.map((item) => (
                        <SidebarMenuItem key={item.id}>
                          <SidebarMenuButton
                            isActive={activeSection === item.id}
                            onClick={() => onSectionChange(item.id)}
                            className={cn(
                              activeSection === item.id && "bg-hostfluencer-green text-white hover:bg-hostfluencer-green/90"
                            )}
                          >
                            <item.icon className="h-4 w-4" />
                            <span>{item.label}</span>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      ))}
                    </SidebarMenu>
                  </SidebarGroupContent>
                </CollapsibleContent>
              </Collapsible>
            )}
          </SidebarGroup>
        ))}
      </SidebarContent>
      
      <SidebarFooter className="border-t p-4">
        {!isCollapsed && (
          <div className="text-xs text-muted-foreground">
            Admin Console v2.0
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
};
