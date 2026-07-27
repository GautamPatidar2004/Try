import { useLocation, useNavigate } from "react-router-dom";
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
  Send,
  MessageSquare,
  Handshake,
  Star,
  BarChart3,
  BookImage,
  Share2,
  Trophy,
  CreditCard,
  Settings,
  HelpCircle,
  LogOut,
  CheckCircle,
  Camera,
  Percent,
  Plane,
  FileText
} from "lucide-react";
import { useCreatorDashboardCounts } from "@/hooks/useCreatorDashboardCounts";
import { ThemeToggle } from "@/components/ThemeToggle";

interface CreatorDashboardSidebarProps {
  profile: any;
  activeTab: string;
  onTabChange: (tab: string) => void;
  onLogout: () => void;
  followerCount?: number;
  followingCount?: number;
  dashboardCounts?: {
    unreadMessages: number;
    pendingApplications: number;
    activeCollaborations: number;
  };
}

const CreatorDashboardSidebar = ({
  profile,
  activeTab,
  onTabChange,
  onLogout,
  followerCount = 0,
  followingCount = 0,
  dashboardCounts,
}: CreatorDashboardSidebarProps) => {
  const { state } = useSidebar();
  const location = useLocation();
  const navigate = useNavigate();
  const internalCounts = useCreatorDashboardCounts(dashboardCounts ? undefined : profile?.id);
  const counts = dashboardCounts || internalCounts;
  const collapsed = state === "collapsed";

  const mainNavItems = [
    { key: "overview", label: "Overview", icon: Home },
    { key: "content", label: "Content", icon: Camera },
    { key: "applications", label: "Applications", icon: Send, badge: counts.pendingApplications },
    { key: "messages", label: "Messages", icon: MessageSquare, badge: counts.unreadMessages },
    { key: "collaborations", label: "Collaborations", icon: Handshake },
    { key: "posts", label: "My Posts", icon: FileText },
    { key: "stays", label: "My Stays", icon: Plane, route: "/creator/stays" as const },
    { key: "reviews", label: "Reviews", icon: Star },
    { key: "mediakit", label: "Media Kit", icon: BookImage },
  ];

  const secondaryNavItems = [
    { key: "analytics", label: "Analytics", icon: BarChart3 },
    { key: "social", label: "Social Media", icon: Share2 },
    { key: "affiliate", label: "Affiliate", icon: Percent },
    { key: "ambassador", label: "Ambassador", icon: Trophy },
    { key: "subscription", label: "Subscription", icon: CreditCard },
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
                <AvatarImage src={profile?.profile_photo_url} />
                <AvatarFallback className="bg-primary text-primary-foreground">
                  {profile?.first_name?.[0]}
                  {profile?.last_name?.[0]}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-sm truncate">
                    {profile?.first_name} {profile?.last_name}
                  </p>
                  {profile?.is_verified && (
                    <CheckCircle className="h-4 w-4 text-primary flex-shrink-0" />
                  )}
                </div>
                <p className="text-xs text-muted-foreground truncate">{profile?.location}</p>
              </div>
            </div>
            
            <div className="flex gap-4 text-xs">
              <div>
                <span className="font-semibold">{followerCount}</span>
                <span className="text-muted-foreground ml-1">Followers</span>
              </div>
              <div>
                <span className="font-semibold">{followingCount}</span>
                <span className="text-muted-foreground ml-1">Following</span>
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
                    onClick={() => ((item as any).route ? navigate((item as any).route) : onTabChange(item.key))}
                    isActive={isActive(item.key)}
                    className={`rounded-full transition-all duration-200 ${isActive(item.key) ? "bg-primary text-primary-foreground shadow-md" : "hover:bg-muted/80"}`}
                  >
                    <item.icon className="h-4 w-4" />
                    {!collapsed && (
                      <>
                        <span>{item.label}</span>
                        {item.badge !== undefined && item.badge > 0 && (
                          <Badge
                            variant="secondary"
                            className="ml-auto h-5 min-w-5 flex items-center justify-center px-1.5 text-xs rounded-full"
                          >
                            {item.badge}
                          </Badge>
                        )}
                      </>
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
                    className={`rounded-full transition-all duration-200 ${isActive(item.key) ? "bg-primary text-primary-foreground shadow-md" : "hover:bg-muted/80"}`}
                  >
                    <item.icon className="h-4 w-4" />
                    {!collapsed && <span>{item.label}</span>}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <Separator />

        {/* Bottom Navigation */}
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={() => onTabChange("settings")}
                  isActive={isActive("settings")}
                  className={`rounded-full transition-all duration-200 ${isActive("settings") ? "bg-primary text-primary-foreground shadow-md" : "hover:bg-muted/80"}`}
                >
                  <Settings className="h-4 w-4" />
                  {!collapsed && <span>Settings</span>}
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={() => onTabChange("help")}
                  isActive={isActive("help")}
                  className={`rounded-full transition-all duration-200 ${isActive("help") ? "bg-primary text-primary-foreground shadow-md" : "hover:bg-muted/80"}`}
                >
                  <HelpCircle className="h-4 w-4" />
                  {!collapsed && <span>Help & Support</span>}
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton onClick={onLogout} className="rounded-full transition-all duration-200 hover:bg-muted/80">
                  <LogOut className="h-4 w-4" />
                  {!collapsed && <span>Logout</span>}
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {!collapsed && (
          <div className="px-4 py-3 flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Theme</span>
            <ThemeToggle variant="outline" size="icon" />
          </div>
        )}
      </SidebarContent>
    </Sidebar>
  );
};

export default CreatorDashboardSidebar;
