import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Send, Handshake, Clock } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { PointsDisplay } from "@/components/gamification/PointsDisplay";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { AardvarkPromoBanner } from "@/components/integrations/AardvarkPromoBanner";

interface CreatorProfileOverviewProps {
  applicationsCount: number;
  activeCollaborations: number;
  pendingApplications: number;
  userId: string;
}

const CreatorProfileOverview = ({
  applicationsCount,
  activeCollaborations,
  pendingApplications,
  userId,
}: CreatorProfileOverviewProps) => {
  const isMobile = useIsMobile();
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      {/* Aardvark cross-referral promo — drive creators to connect for extra earnings */}
      <AardvarkPromoBanner userId={userId} />

      {/* Quick Stats Cards */}
      <div
        className={`grid ${isMobile ? "grid-cols-1 gap-4" : "grid-cols-1 md:grid-cols-3 gap-6"}`}
      >
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className={isMobile ? "pb-2" : ""}>
            <CardTitle
              className={`flex items-center space-x-2 ${isMobile ? "text-lg" : ""}`}
            >
              <Send className="w-5 h-5" />
              <span>Applications</span>
            </CardTitle>
          </CardHeader>
          <CardContent className={isMobile ? "pt-0" : ""}>
            <div
              className={`font-bold text-brand-green ${isMobile ? "text-2xl" : "text-3xl"}`}
            >
              {applicationsCount}
            </div>
            <p className={`text-muted-foreground ${isMobile ? "text-sm" : ""}`}>
              Total submitted
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className={isMobile ? "pb-2" : ""}>
            <CardTitle
              className={`flex items-center space-x-2 ${isMobile ? "text-lg" : ""}`}
            >
              <Handshake className="w-5 h-5" />
              <span>Collaborations</span>
            </CardTitle>
          </CardHeader>
          <CardContent className={isMobile ? "pt-0" : ""}>
            <div
              className={`font-bold text-brand-green ${isMobile ? "text-2xl" : "text-3xl"}`}
            >
              {activeCollaborations}
            </div>
            <p className={`text-muted-foreground ${isMobile ? "text-sm" : ""}`}>
              Active
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className={isMobile ? "pb-2" : ""}>
            <CardTitle
              className={`flex items-center space-x-2 ${isMobile ? "text-lg" : ""}`}
            >
              <Clock className="w-5 h-5" />
              <span>Pending</span>
            </CardTitle>
          </CardHeader>
          <CardContent className={isMobile ? "pt-0" : ""}>
            <div
              className={`font-bold text-brand-green ${isMobile ? "text-2xl" : "text-3xl"}`}
            >
              {pendingApplications}
            </div>
            <p className={`text-muted-foreground ${isMobile ? "text-sm" : ""}`}>
              Awaiting response
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div
            className={`grid ${isMobile ? "grid-cols-1" : "grid-cols-3"} gap-4`}
          >
            <Button
              variant="outline"
              className="w-full"
              onClick={() => navigate("/discover")}
            >
              Browse Properties
            </Button>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => navigate("/profile?tab=content")}
            >
              Upload Content
            </Button>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => navigate("/profile?tab=analytics")}
            >
              View Analytics
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Gamification Section */}
      <Card>
        <CardHeader>
          <CardTitle>Your Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <PointsDisplay userId={userId} variant="default" />
        </CardContent>
      </Card>
    </div>
  );
};

export default CreatorProfileOverview;
