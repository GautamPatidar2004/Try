import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { HelpCircle, LogOut, Users } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import ClickableProfileAvatar from "./ClickableProfileAvatar";
import FollowButton from "../social/FollowButton";

interface HostProfileHeaderProps {
  profile: any;
  onEditProfile: () => void;
  onHelp: () => void;
  onLogout: () => void;
  onProfileUpdated: () => void;
  loading: boolean;
  followerCount?: number;
  followingCount?: number;
  showFollowButton?: boolean;
}

const HostProfileHeader = ({ 
  profile, 
  onEditProfile, 
  onHelp, 
  onLogout, 
  onProfileUpdated,
  loading,
  followerCount = 0,
  followingCount = 0,
  showFollowButton = false
}: HostProfileHeaderProps) => {
  const isMobile = useIsMobile();

  const getInitials = () => {
    const first = profile.first_name?.[0] || '';
    const last = profile.last_name?.[0] || '';
    return `${first}${last}`.toUpperCase();
  };

  return (
    <div className="bg-card border-b border-border">
      <div className={`mx-auto ${isMobile ? 'px-4 py-4' : 'max-w-7xl px-6 py-6'}`}>
        <div className={`flex ${isMobile ? 'flex-col space-y-4' : 'items-center justify-between'}`}>
          <div className={`flex ${isMobile ? 'flex-col items-center text-center space-y-3' : 'items-center space-x-4'}`}>
            <ClickableProfileAvatar
              userId={profile.id}
              currentPhotoUrl={profile.profile_photo_url}
              initials={getInitials()}
              onPhotoUpdated={onProfileUpdated}
              size={isMobile ? "md" : "lg"}
            />
            
            <div className={`${isMobile ? 'space-y-2' : 'flex-1'}`}>
              <h1 className={`font-bold text-foreground ${isMobile ? 'text-xl' : 'text-2xl'}`}>
                {profile.first_name} {profile.last_name}
              </h1>
              {profile.location && (
                <p className={`text-muted-foreground ${isMobile ? 'text-sm' : 'text-base'}`}>
                  {profile.location}
                </p>
              )}
              
              <div className={`flex ${isMobile ? 'justify-center' : ''} items-center gap-2 flex-wrap`}>
                <Badge variant="secondary" className="bg-brand-green/10 text-brand-green text-xs">
                  Host
                </Badge>
                <Badge 
                  variant={profile.hosts?.[0]?.verification_status === 'verified' ? 'default' : 'outline'}
                  className="text-xs"
                >
                  {profile.hosts?.[0]?.verification_status || 'Unverified'}
                </Badge>
              </div>
            </div>
          </div>
          
          {!isMobile && (
            <div className="flex gap-8">
              <div className="text-center">
                <div className="text-2xl font-bold text-foreground">{followerCount}</div>
                <div className="text-sm text-muted-foreground">Followers</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-foreground">{followingCount}</div>
                <div className="text-sm text-muted-foreground">Following</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-brand-green">
                  {profile.hosts?.[0]?.response_rate || 0}%
                </div>
                <div className="text-sm text-muted-foreground">Response Rate</div>
              </div>
            </div>
          )}
          
          <div className={`flex gap-2 ${isMobile ? 'w-full' : ''}`}>
            {showFollowButton && (
              <FollowButton userId={profile.id} size={isMobile ? "default" : "lg"} />
            )}
            <Button 
              onClick={onEditProfile}
              className={`bg-brand-green hover:bg-brand-green/90 text-white ${isMobile ? 'flex-1 text-sm py-2' : 'px-4 py-2'}`}
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
        
        {profile.bio && (
          <p className={`text-foreground/80 leading-relaxed ${isMobile ? 'mt-3 text-sm text-center' : 'mt-4 max-w-2xl'}`}>
            {profile.bio}
          </p>
        )}
      </div>
    </div>
  );
};

export default HostProfileHeader;