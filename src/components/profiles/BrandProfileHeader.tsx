import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { HelpCircle, LogOut, Building2 } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import ClickableProfileAvatar from "./ClickableProfileAvatar";
import { useBrandDashboardStats } from "@/hooks/useBrandDashboardStats";

interface BrandProfileHeaderProps {
  profile: any;
  onEditProfile: () => void;
  onHelp: () => void;
  onLogout: () => void;
  onProfileUpdated: () => void;
  loading: boolean;
}

const BrandProfileHeader = ({ 
  profile, 
  onEditProfile, 
  onHelp, 
  onLogout, 
  onProfileUpdated,
  loading,
}: BrandProfileHeaderProps) => {
  const isMobile = useIsMobile();
  const brandData = profile.brands?.[0];
  const { data: stats, isLoading: statsLoading } = useBrandDashboardStats(profile.id);

  const getInitials = () => {
    const brandName = brandData?.brand_name || profile.first_name || 'BR';
    return brandName.substring(0, 2).toUpperCase();
  };

  return (
    <div className="bg-card border-b border-border">
      <div className={`mx-auto ${isMobile ? 'px-4 py-4' : 'max-w-7xl px-6 py-6'}`}>
        <div className={`flex ${isMobile ? 'flex-col space-y-4' : 'items-center justify-between'}`}>
          <div className={`flex ${isMobile ? 'flex-col items-center text-center space-y-3' : 'items-center space-x-4'}`}>
            <ClickableProfileAvatar
              userId={profile.id}
              currentPhotoUrl={brandData?.logo_url || profile.profile_photo_url}
              initials={getInitials()}
              onPhotoUpdated={onProfileUpdated}
              size={isMobile ? "md" : "lg"}
            />
            
            <div className={`${isMobile ? 'space-y-2' : 'flex-1'}`}>
              <h1 className={`font-bold text-foreground ${isMobile ? 'text-xl' : 'text-2xl'}`}>
                {brandData?.brand_name || `${profile.first_name} ${profile.last_name}`}
              </h1>
              {brandData?.company_name && (
                <p className={`text-muted-foreground ${isMobile ? 'text-sm' : 'text-base'}`}>
                  {brandData.company_name}
                </p>
              )}
              {brandData?.industry && (
                <p className={`text-muted-foreground text-sm`}>
                  {brandData.industry}
                </p>
              )}
              
              <div className={`flex ${isMobile ? 'justify-center' : ''} items-center gap-2 flex-wrap`}>
                <Badge variant="secondary" className="bg-purple-100 text-purple-700 text-xs">
                  <Building2 className="w-3 h-3 mr-1" />
                  Brand Partner
                </Badge>
                <Badge 
                  variant={brandData?.verified ? 'default' : 'outline'}
                  className="text-xs"
                >
                  {brandData?.verified ? 'Verified' : 'Unverified'}
                </Badge>
              </div>
            </div>
          </div>
          
          {!isMobile && brandData && (
            <div className="flex gap-8">
              <div className="text-center">
                <div className="text-2xl font-bold text-foreground">
                  {statsLoading ? '...' : stats?.activeCampaigns || 0}
                </div>
                <div className="text-sm text-muted-foreground">Active Campaigns</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-foreground">
                  {statsLoading ? '...' : stats?.pendingApplications || 0}
                </div>
                <div className="text-sm text-muted-foreground">Applications</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {brandData.budget_range || 'Not Set'}
                </div>
                <div className="text-sm text-muted-foreground">Budget Range</div>
              </div>
            </div>
          )}
          
          <div className={`flex gap-2 ${isMobile ? 'w-full' : ''}`}>
            <Button 
              onClick={onEditProfile}
              className={`bg-purple-600 hover:bg-purple-700 text-white ${isMobile ? 'flex-1 text-sm py-2' : 'px-4 py-2'}`}
            >
              Edit Profile
            </Button>
            <Button 
              onClick={onHelp}
              variant="outline"
              className={`flex items-center gap-1 ${isMobile ? 'px-3 py-2' : 'px-4 py-2'}`}
            >
              <HelpCircle className="w-4 h-4" />
              {!isMobile && "Help"}
            </Button>
            <Button 
              onClick={onLogout}
              variant="outline"
              className={`flex items-center gap-1 ${isMobile ? 'px-3 py-2' : 'px-4 py-2'}`}
              disabled={loading}
            >
              <LogOut className="w-4 h-4" />
              {!isMobile && (loading ? "Signing out..." : "Logout")}
            </Button>
          </div>
        </div>
        
        {brandData?.description && (
          <p className={`text-foreground/80 leading-relaxed ${isMobile ? 'mt-3 text-sm text-center' : 'mt-4 max-w-2xl'}`}>
            {brandData.description}
          </p>
        )}
      </div>
    </div>
  );
};

export default BrandProfileHeader;
