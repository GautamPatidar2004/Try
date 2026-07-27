import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Home,
  Megaphone,
  FileText,
  MessageSquare,
  Handshake,
  Star,
  BarChart3,
  TrendingUp,
  Image,
  Settings,
  HelpCircle,
  LogOut,
  CheckCircle,
} from "lucide-react";

interface BrandDashboardSidebarProps {
  profile: any;
  activeTab: string;
  onTabChange: (tab: string) => void;
  onLogout: () => void;
  dashboardCounts?: {
    unreadMessages: number;
    pendingApplications: number;
    activeCollaborations: number;
    activeCampaigns: number;
  };
}

const BrandDashboardSidebar = ({
  profile,
  activeTab,
  onTabChange,
  onLogout,
  dashboardCounts,
}: BrandDashboardSidebarProps) => {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const brandData = profile?.brands?.[0];

  const counts = dashboardCounts || {
    unreadMessages: 0,
    pendingApplications: 0,
    activeCollaborations: 0,
    activeCampaigns: 0,
  };

  const mainNavItems = [
    { key: "overview", label: "Overview", icon: Home },
    { key: "campaigns", label: "Campaigns", icon: Megaphone, badge: counts.activeCampaigns },
    { key: "applications", label: "Applications", icon: FileText, badge: counts.pendingApplications },
    { key: "messages", label: "Messages", icon: MessageSquare, badge: counts.unreadMessages },
    { key: "collaborations", label: "Collaborations", icon: Handshake, badge: counts.activeCollaborations },
  ];

  const secondaryNavItems = [
    { key: "content", label: "Content", icon: Image },
    { key: "analytics", label: "Analytics", icon: BarChart3 },
    
    { key: "reviews", label: "Reviews", icon: Star },
  ];

  const isActive = (key: string) => activeTab === key;

  return (
    <Sidebar className={collapsed ? "w-16" : "w-64"} collapsible="icon">
      <SidebarTrigger className="m-2 self-end" />

      <SidebarContent>
        {/* Profile Section */}
        {!collapsed && (
          <div className="px-4 py-6">
            <div className="flex items-center gap-3 mb-3">
              <Avatar className="h-12 w-12">
                <AvatarImage src={brandData?.logo_url} />
                <AvatarFallback className="bg-primary text-primary-foreground">
                  {brandData?.brand_name?.[0] || "B"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-sm truncate">
                    {brandData?.brand_name || "Brand"}
                  </p>
                  {brandData?.verified && (
                    <CheckCircle className="h-4 w-4 text-primary flex-shrink-0" />
                  )}
                </div>
                <p className="text-xs text-muted-foreground truncate">
                  {brandData?.industry}
                </p>
              </div>
            </div>

            <div className="flex gap-4 text-xs">
              <div>
                <span className="font-semibold">{counts.activeCampaigns}</span>
                <span className="text-muted-foreground ml-1">Campaigns</span>
              </div>
              <div>
                <span className="font-semibold">{counts.activeCollaborations}</span>
                <span className="text-muted-foreground ml-1">Collaborations</span>
              </div>
            </div>
          </div>
        )}

        <Separator />

        {/* Main Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel>Main</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNavItems.map((item) => (
                <SidebarMenuItem key={item.key}>
                  <SidebarMenuButton
                    onClick={() => onTabChange(item.key)}
                    isActive={isActive(item.key)}
                    className={isActive(item.key) ? "bg-primary text-primary-foreground" : ""}
                  >
                    <item.icon className="h-4 w-4" />
                    {!collapsed && (
                      <span className="flex-1">{item.label}</span>
                    )}
                    {!collapsed && item.badge && item.badge > 0 && (
                      <Badge variant="destructive" className="ml-auto h-5 px-1.5 text-xs">
                        {item.badge}
                      </Badge>
                    )}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <Separator />

        {/* Secondary Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel>More</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {secondaryNavItems.map((item) => (
                <SidebarMenuItem key={item.key}>
                  <SidebarMenuButton
                    onClick={() => onTabChange(item.key)}
                    isActive={isActive(item.key)}
                    className={isActive(item.key) ? "bg-primary text-primary-foreground" : ""}
                  >
                    <item.icon className="h-4 w-4" />
                    {!collapsed && <span>{item.label}</span>}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <div className="mt-auto">
          <Separator />
          {/* Bottom Navigation */}
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    onClick={() => onTabChange("settings")}
                    isActive={isActive("settings")}
                    className={isActive("settings") ? "bg-primary text-primary-foreground" : ""}
                  >
                    <Settings className="h-4 w-4" />
                    {!collapsed && <span>Settings</span>}
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    onClick={() => onTabChange("help")}
                    isActive={isActive("help")}
                    className={isActive("help") ? "bg-primary text-primary-foreground" : ""}
                  >
                    <HelpCircle className="h-4 w-4" />
                    {!collapsed && <span>Help & Support</span>}
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton onClick={onLogout}>
                    <LogOut className="h-4 w-4" />
                    {!collapsed && <span>Logout</span>}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </div>
      </SidebarContent>
    </Sidebar>
  );
};

export default BrandDashboardSidebar;
