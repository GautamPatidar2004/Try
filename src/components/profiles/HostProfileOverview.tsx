import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Home, MessageSquare, BarChart3 } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

interface HostProfileOverviewProps {
  propertiesCount: number;
  pendingApplications: number;
  activeCollaborations: number;
}

const HostProfileOverview = ({ 
  propertiesCount, 
  pendingApplications, 
  activeCollaborations 
}: HostProfileOverviewProps) => {
  const isMobile = useIsMobile();

  return (
    <div className={`grid ${isMobile ? 'grid-cols-1 gap-4' : 'grid-cols-1 md:grid-cols-3 gap-6'}`}>
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className={isMobile ? 'pb-2' : ''}>
          <CardTitle className={`flex items-center space-x-2 ${isMobile ? 'text-lg' : ''}`}>
            <Home className="w-5 h-5" />
            <span>Properties</span>
          </CardTitle>
        </CardHeader>
        <CardContent className={isMobile ? 'pt-0' : ''}>
          <div className={`font-bold text-brand-green ${isMobile ? 'text-2xl' : 'text-3xl'}`}>{propertiesCount}</div>
          <p className={`text-muted-foreground ${isMobile ? 'text-sm' : ''}`}>Active listings</p>
        </CardContent>
      </Card>
      
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className={isMobile ? 'pb-2' : ''}>
          <CardTitle className={`flex items-center space-x-2 ${isMobile ? 'text-lg' : ''}`}>
            <MessageSquare className="w-5 h-5" />
            <span>Applications</span>
          </CardTitle>
        </CardHeader>
        <CardContent className={isMobile ? 'pt-0' : ''}>
          <div className={`font-bold text-brand-green ${isMobile ? 'text-2xl' : 'text-3xl'}`}>{pendingApplications}</div>
          <p className={`text-muted-foreground ${isMobile ? 'text-sm' : ''}`}>Pending review</p>
        </CardContent>
      </Card>
      
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className={isMobile ? 'pb-2' : ''}>
          <CardTitle className={`flex items-center space-x-2 ${isMobile ? 'text-lg' : ''}`}>
            <BarChart3 className="w-5 h-5" />
            <span>Collaborations</span>
          </CardTitle>
        </CardHeader>
        <CardContent className={isMobile ? 'pt-0' : ''}>
          <div className={`font-bold text-brand-green ${isMobile ? 'text-2xl' : 'text-3xl'}`}>{activeCollaborations}</div>
          <p className={`text-muted-foreground ${isMobile ? 'text-sm' : ''}`}>Active</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default HostProfileOverview;