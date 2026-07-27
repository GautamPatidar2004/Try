import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { MapPin, Star, Calendar, Send } from "lucide-react";
import { demoCreatorProperties } from "@/data/mockDemoData";
import { SignupPaywall } from "./SignupPaywall";

export const CreatorDemoExperience = () => {
  const [selectedProperty, setSelectedProperty] = useState<typeof demoCreatorProperties[0] | null>(null);
  const [showApplicationForm, setShowApplicationForm] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);

  const handleApply = () => {
    setShowApplicationForm(true);
  };

  const handleSubmitApplication = (e: React.FormEvent) => {
    e.preventDefault();
    setShowApplicationForm(false);
    setShowPaywall(true);
  };

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {demoCreatorProperties.map((property) => (
          <div 
            key={property.id} 
            className="group cursor-pointer"
            onClick={() => setSelectedProperty(property)}
          >
            <div className="relative overflow-hidden rounded-lg aspect-[4/3] mb-3">
              <img 
                src={property.image} 
                alt={property.title}
                className="w-full h-full object-cover transition-transform group-hover:scale-105"
              />
              <Badge className="absolute top-3 right-3" variant="secondary">
                {property.type}
              </Badge>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="w-4 h-4" />
                <span>{property.location}</span>
              </div>
              <h3 className="font-semibold line-clamp-1 group-hover:text-primary transition-colors">
                {property.title}
              </h3>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span className="text-sm font-medium">{property.rating}</span>
                </div>
                <span className="text-sm text-muted-foreground">({property.reviews} reviews)</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Property Detail Modal */}
      <Dialog open={!!selectedProperty && !showApplicationForm} onOpenChange={() => setSelectedProperty(null)}>
        <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
          {selectedProperty && (
            <>
              <div className="relative h-64 -mt-6 -mx-6 mb-6">
                <img 
                  src={selectedProperty.image} 
                  alt={selectedProperty.title}
                  className="w-full h-full object-cover"
                />
              </div>
              
              <DialogHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <DialogTitle className="text-2xl mb-2">{selectedProperty.title}</DialogTitle>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        <span>{selectedProperty.location}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span className="font-medium">{selectedProperty.rating}</span>
                        <span>({selectedProperty.reviews} reviews)</span>
                      </div>
                    </div>
                  </div>
                  <Badge variant="secondary">{selectedProperty.type}</Badge>
                </div>
              </DialogHeader>

              <div className="space-y-6">
                <div>
                  <h4 className="font-semibold mb-2">About this property</h4>
                  <p className="text-sm text-muted-foreground">{selectedProperty.description}</p>
                </div>

                <div>
                  <h4 className="font-semibold mb-3">Amenities</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedProperty.amenities.map((amenity, index) => (
                      <Badge key={index} variant="outline">{amenity}</Badge>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
                  <Avatar>
                    <AvatarImage src={selectedProperty.host.avatar} />
                    <AvatarFallback>{selectedProperty.host.name[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{selectedProperty.host.name}</p>
                    <p className="text-sm text-muted-foreground">
                      Responds {selectedProperty.host.responseTime}
                    </p>
                  </div>
                </div>

                <Button className="w-full" size="lg" onClick={handleApply}>
                  <Calendar className="w-4 h-4 mr-2" />
                  Apply for Collaboration
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Application Form Modal */}
      <Dialog open={showApplicationForm} onOpenChange={setShowApplicationForm}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Apply for Collaboration</DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleSubmitApplication} className="space-y-4">
            <div>
              <Label>Property</Label>
              <p className="text-sm font-medium mt-1">{selectedProperty?.title}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="check-in">Check-in Date</Label>
                <Input id="check-in" type="date" required />
              </div>
              <div>
                <Label htmlFor="check-out">Check-out Date</Label>
                <Input id="check-out" type="date" required />
              </div>
            </div>

            <div>
              <Label htmlFor="proposal">Your Proposal</Label>
              <Textarea 
                id="proposal"
                placeholder="Tell the host why you're a great fit and what content you'll create..."
                className="min-h-32"
                required
              />
            </div>

            <div>
              <Label htmlFor="deliverables">Content Deliverables</Label>
              <Input 
                id="deliverables"
                placeholder="e.g., 10 Instagram posts, 5 stories, 1 reel"
                required
              />
            </div>

            <div>
              <Label htmlFor="followers">Follower Count</Label>
              <Input 
                id="followers"
                type="number"
                placeholder="50000"
                required
              />
            </div>

            <Button type="submit" className="w-full" size="lg">
              <Send className="w-4 h-4 mr-2" />
              Submit Application
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Signup Paywall */}
      <SignupPaywall 
        isOpen={showPaywall}
        onClose={() => setShowPaywall(false)}
        userType="creator"
        context={{
          propertyName: selectedProperty?.title,
          hostName: selectedProperty?.host.name
        }}
      />
    </>
  );
};
