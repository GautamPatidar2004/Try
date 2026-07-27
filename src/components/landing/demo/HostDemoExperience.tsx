import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, UserCheck, TrendingUp, MapPin, Plus } from "lucide-react";
import { mockApplications, mockHostProperties } from "@/data/mockDemoData";
import { MockApplicationDetail } from "./MockApplicationDetail";
import { SignupPaywall } from "./SignupPaywall";

export const HostDemoExperience = () => {
  const [selectedApplication, setSelectedApplication] = useState<typeof mockApplications[0] | null>(null);
  const [showPaywall, setShowPaywall] = useState(false);
  const [paywallContext, setPaywallContext] = useState<any>({});

  const handleViewApplication = (application: typeof mockApplications[0]) => {
    setSelectedApplication(application);
  };

  const handleAction = () => {
    setSelectedApplication(null);
    setPaywallContext({ creatorName: selectedApplication?.creator.name });
    setShowPaywall(true);
  };

  const handleAddProperty = () => {
    setPaywallContext({});
    setShowPaywall(true);
  };

  const totalViews = mockHostProperties.reduce((sum, prop) => sum + prop.views, 0);
  const totalApplications = mockHostProperties.reduce((sum, prop) => sum + prop.applications, 0);
  const avgResponseRate = Math.round(
    mockHostProperties.reduce((sum, prop) => sum + prop.responseRate, 0) / mockHostProperties.length
  );

  return (
    <>
      <div className="space-y-6">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-full bg-primary/10">
                  <Eye className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{totalViews.toLocaleString()}</p>
                  <p className="text-sm text-muted-foreground">Total Views</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-full bg-primary/10">
                  <UserCheck className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{totalApplications}</p>
                  <p className="text-sm text-muted-foreground">Applications</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-full bg-primary/10">
                  <TrendingUp className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{avgResponseRate}%</p>
                  <p className="text-sm text-muted-foreground">Response Rate</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Properties */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Your Properties</CardTitle>
              <Button size="sm" onClick={handleAddProperty}>
                <Plus className="w-4 h-4 mr-2" />
                Add Property
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {mockHostProperties.map((property) => (
                <div key={property.id} className="flex gap-4 p-3 rounded-lg border hover:border-primary/50 transition-colors">
                  <img 
                    src={property.image} 
                    alt={property.title}
                    className="w-20 h-20 rounded-lg object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-sm truncate">{property.title}</h4>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                      <MapPin className="w-3 h-3" />
                      <span>{property.location}</span>
                    </div>
                    <div className="flex gap-3 mt-2 text-xs">
                      <span className="text-muted-foreground">{property.views} views</span>
                      <span className="font-medium text-primary">{property.applications} applications</span>
                    </div>
                  </div>
                  <Badge variant="secondary" className="h-fit">
                    {property.status}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Applications */}
          <Card>
            <CardHeader>
              <CardTitle>Pending Applications</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {mockApplications.map((application) => (
                <div 
                  key={application.id}
                  className="flex gap-3 p-3 rounded-lg border hover:border-primary/50 transition-colors cursor-pointer"
                  onClick={() => handleViewApplication(application)}
                >
                  <Avatar>
                    <AvatarImage src={application.creator.avatar} />
                    <AvatarFallback>{application.creator.name[0]}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-sm">{application.creator.name}</h4>
                    <p className="text-xs text-muted-foreground truncate">
                      {application.property}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="outline" className="text-xs">
                        {(application.creator.followers / 1000).toFixed(0)}K followers
                      </Badge>
                      <span className="text-xs text-muted-foreground">{application.submittedAt}</span>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Application Detail Modal */}
      <MockApplicationDetail 
        isOpen={!!selectedApplication}
        onClose={() => setSelectedApplication(null)}
        application={selectedApplication}
        onAction={handleAction}
      />

      {/* Signup Paywall */}
      <SignupPaywall 
        isOpen={showPaywall}
        onClose={() => setShowPaywall(false)}
        userType="host"
        context={paywallContext}
      />
    </>
  );
};
