import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Users, Star } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

interface RestaurantProfileOverviewProps {
  profile: any;
}

const RestaurantProfileOverview = ({ profile }: RestaurantProfileOverviewProps) => {
  const isMobile = useIsMobile();

  return (
    <div className={`grid ${isMobile ? 'grid-cols-1 gap-4' : 'grid-cols-1 md:grid-cols-3 gap-6'}`}>
      <Card className="hover:shadow-md transition-shadow border-orange-100">
        <CardHeader className={isMobile ? 'pb-2' : ''}>
          <CardTitle className={`flex items-center space-x-2 ${isMobile ? 'text-lg' : ''}`}>
            <MapPin className="w-5 h-5 text-orange-600" />
            <span>Locations</span>
          </CardTitle>
        </CardHeader>
        <CardContent className={isMobile ? 'pt-0' : ''}>
          <div className={`font-bold text-orange-600 ${isMobile ? 'text-2xl' : 'text-3xl'}`}>1</div>
          <p className={`text-muted-foreground ${isMobile ? 'text-sm' : ''}`}>Active locations</p>
        </CardContent>
      </Card>
      
      <Card className="hover:shadow-md transition-shadow border-orange-100">
        <CardHeader className={isMobile ? 'pb-2' : ''}>
          <CardTitle className={`flex items-center space-x-2 ${isMobile ? 'text-lg' : ''}`}>
            <Users className="w-5 h-5 text-orange-600" />
            <span>Collaborations</span>
          </CardTitle>
        </CardHeader>
        <CardContent className={isMobile ? 'pt-0' : ''}>
          <div className={`font-bold text-orange-600 ${isMobile ? 'text-2xl' : 'text-3xl'}`}>0</div>
          <p className={`text-muted-foreground ${isMobile ? 'text-sm' : ''}`}>With food influencers</p>
        </CardContent>
      </Card>
      
      <Card className="hover:shadow-md transition-shadow border-orange-100">
        <CardHeader className={isMobile ? 'pb-2' : ''}>
          <CardTitle className={`flex items-center space-x-2 ${isMobile ? 'text-lg' : ''}`}>
            <Star className="w-5 h-5 text-orange-600" />
            <span>Reviews</span>
          </CardTitle>
        </CardHeader>
        <CardContent className={isMobile ? 'pt-0' : ''}>
          <div className={`font-bold text-orange-600 ${isMobile ? 'text-2xl' : 'text-3xl'}`}>0</div>
          <p className={`text-muted-foreground ${isMobile ? 'text-sm' : ''}`}>Customer reviews</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default RestaurantProfileOverview;
