import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { HelpCircle, LogOut, UtensilsCrossed } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import ClickableProfileAvatar from "./ClickableProfileAvatar";

interface RestaurantProfileHeaderProps {
  profile: any;
  onEditProfile: () => void;
  onHelp: () => void;
  onLogout: () => void;
  onProfileUpdated: () => void;
  loading: boolean;
}

const RestaurantProfileHeader = ({ 
  profile, 
  onEditProfile, 
  onHelp, 
  onLogout, 
  onProfileUpdated,
  loading,
}: RestaurantProfileHeaderProps) => {
  const isMobile = useIsMobile();
  const restaurantOwnerData = profile.restaurant_owners?.[0];
  const restaurantData = profile.restaurants?.[0];

  const getInitials = () => {
    const name = restaurantData?.name || profile.first_name || 'RS';
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <div className="bg-card border-b border-border">
      <div className={`mx-auto ${isMobile ? 'px-4 py-4' : 'max-w-7xl px-6 py-6'}`}>
        <div className={`flex ${isMobile ? 'flex-col space-y-4' : 'items-center justify-between'}`}>
          <div className={`flex ${isMobile ? 'flex-col items-center text-center space-y-3' : 'items-center space-x-4'}`}>
            <ClickableProfileAvatar
              userId={profile.id}
              currentPhotoUrl={restaurantData?.image_url || profile.profile_photo_url}
              initials={getInitials()}
              onPhotoUpdated={onProfileUpdated}
              size={isMobile ? "md" : "lg"}
            />
            
            <div className={`${isMobile ? 'space-y-2' : 'flex-1'}`}>
              <h1 className={`font-bold text-foreground ${isMobile ? 'text-xl' : 'text-2xl'}`}>
                {restaurantData?.name || `${profile.first_name} ${profile.last_name}`}
              </h1>
              {restaurantData?.city && restaurantData?.state && (
                <p className={`text-muted-foreground ${isMobile ? 'text-sm' : 'text-base'}`}>
                  {restaurantData.city}, {restaurantData.state}
                </p>
              )}
              {restaurantData?.cuisine_type && (
                <p className={`text-muted-foreground text-sm`}>
                  {restaurantData.cuisine_type}
                </p>
              )}
              
              <div className={`flex ${isMobile ? 'justify-center' : ''} items-center gap-2 flex-wrap`}>
                <Badge variant="secondary" className="bg-orange-100 text-orange-700 text-xs">
                  <UtensilsCrossed className="w-3 h-3 mr-1" />
                  Restaurant Owner
                </Badge>
                <Badge 
                  variant={restaurantData?.is_active ? 'default' : 'outline'}
                  className="text-xs"
                >
                  {restaurantData?.is_active ? 'Active' : 'Inactive'}
                </Badge>
              </div>
            </div>
          </div>
          
          {!isMobile && restaurantData && (
            <div className="flex gap-8">
              <div className="text-center">
                <div className="text-2xl font-bold text-foreground">1</div>
                <div className="text-sm text-muted-foreground">Locations</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-foreground">0</div>
                <div className="text-sm text-muted-foreground">Campaigns</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {restaurantData.price_range || 'Not Set'}
                </div>
                <div className="text-sm text-muted-foreground">Price Range</div>
              </div>
            </div>
          )}
          
          <div className={`flex gap-2 ${isMobile ? 'w-full' : ''}`}>
            <Button 
              onClick={onEditProfile}
              className={`bg-orange-600 hover:bg-orange-700 text-white ${isMobile ? 'flex-1 text-sm py-2' : 'px-4 py-2'}`}
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
        
        {restaurantData?.description && (
          <p className={`text-foreground/80 leading-relaxed ${isMobile ? 'mt-3 text-sm text-center' : 'mt-4 max-w-2xl'}`}>
            {restaurantData.description}
          </p>
        )}
      </div>
    </div>
  );
};

export default RestaurantProfileHeader;
