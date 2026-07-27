import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
 import { MapPin, Users, Home, Handshake, Image as ImageIcon, User, BarChart3, FileText, Pencil } from "lucide-react";
 import { Button } from "@/components/ui/button";

interface Property {
  id: string;
  title: string;
  description?: string;
  location: string;
  property_type: string;
  max_guests: number;
  bedrooms?: number;
  bathrooms?: number;
  amenities?: string[];
  collaboration_type: string;
  discount_percentage?: number;
  content_requirements?: string[];
  is_active: boolean;
  created_at: string;
  host_id: string;
  hosts: {
    business_name?: string;
    profiles: {
      first_name: string;
      last_name: string;
      email?: string;
      phone?: string;
    } | null;
  } | null;
  property_images?: Array<{
    image_url: string;
    is_primary: boolean;
    display_order?: number;
  }>;
  applications_count?: number;
  collaborations_count?: number;
}

interface PropertyDetailModalProps {
  property: Property | null;
  isOpen: boolean;
  onClose: () => void;
   onEdit?: (property: Property) => void;
}

 const PropertyDetailModal = ({ property, isOpen, onClose, onEdit }: PropertyDetailModalProps) => {
  if (!property) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>{property.title}</span>
             <div className="flex items-center gap-2">
               {onEdit && (
                 <Button 
                   variant="outline" 
                   size="sm"
                   onClick={() => onEdit(property)}
                 >
                   <Pencil className="w-4 h-4 mr-1" />
                   Edit
                 </Button>
               )}
               <Badge variant={property.is_active ? "default" : "secondary"}>
                 {property.is_active ? "Active" : "Inactive"}
               </Badge>
             </div>
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="details" className="w-full">
          <TabsList className="grid w-full grid-cols-4 lg:grid-cols-7">
            <TabsTrigger value="details">
              <Home className="w-4 h-4 mr-2" />
              Details
            </TabsTrigger>
            <TabsTrigger value="images">
              <ImageIcon className="w-4 h-4 mr-2" />
              Images
            </TabsTrigger>
            <TabsTrigger value="host">
              <User className="w-4 h-4 mr-2" />
              Host
            </TabsTrigger>
            <TabsTrigger value="collaboration">
              <Handshake className="w-4 h-4 mr-2" />
              Collab
            </TabsTrigger>
            <TabsTrigger value="analytics" className="hidden lg:flex">
              <BarChart3 className="w-4 h-4 mr-2" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="notes" className="hidden lg:flex">
              <FileText className="w-4 h-4 mr-2" />
              Notes
            </TabsTrigger>
          </TabsList>

          <ScrollArea className="h-[60vh] mt-4">
            <TabsContent value="details" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold mb-2">Location</h4>
                  <div className="flex items-center text-muted-foreground">
                    <MapPin className="w-4 h-4 mr-2" />
                    {property.location}
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Property Type</h4>
                  <Badge variant="outline">{property.property_type.replace('_', ' ')}</Badge>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Capacity</h4>
                  <div className="flex items-center text-muted-foreground">
                    <Users className="w-4 h-4 mr-2" />
                    {property.max_guests} guests
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Rooms</h4>
                  <p className="text-muted-foreground">
                    {property.bedrooms || 0} bed · {property.bathrooms || 0} bath
                  </p>
                </div>
              </div>

              {property.description && (
                <div>
                  <h4 className="font-semibold mb-2">Description</h4>
                  <p className="text-muted-foreground">{property.description}</p>
                </div>
              )}

              {property.amenities && property.amenities.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2">Amenities</h4>
                  <div className="flex flex-wrap gap-2">
                    {property.amenities.map((amenity, index) => (
                      <Badge key={index} variant="secondary">{amenity}</Badge>
                    ))}
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="images" className="space-y-4">
              {property.property_images && property.property_images.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {property.property_images
                    .sort((a, b) => (a.display_order || 0) - (b.display_order || 0))
                    .map((image, index) => (
                      <div key={index} className="relative">
                        <img 
                          src={image.image_url} 
                          alt={`Property ${index + 1}`}
                          className="w-full h-40 object-cover rounded-lg"
                        />
                        {image.is_primary && (
                          <Badge className="absolute top-2 left-2">Primary</Badge>
                        )}
                      </div>
                    ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">No images available</p>
              )}
            </TabsContent>

            <TabsContent value="host" className="space-y-4">
              <div className="space-y-3">
                <div>
                  <h4 className="font-semibold mb-2">Host Name</h4>
                  <p className="text-muted-foreground">
                    {property.hosts?.profiles?.first_name} {property.hosts?.profiles?.last_name}
                  </p>
                </div>
                {property.hosts?.business_name && (
                  <div>
                    <h4 className="font-semibold mb-2">Business Name</h4>
                    <p className="text-muted-foreground">{property.hosts.business_name}</p>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="collaboration" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold mb-2">Collaboration Type</h4>
                  <Badge>{property.collaboration_type.replace('_', ' ')}</Badge>
                </div>
                {property.discount_percentage && (
                  <div>
                    <h4 className="font-semibold mb-2">Discount</h4>
                    <p className="text-muted-foreground">{property.discount_percentage}% off</p>
                  </div>
                )}
              </div>

              {property.content_requirements && property.content_requirements.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2">Content Requirements</h4>
                  <div className="flex flex-wrap gap-2">
                    {property.content_requirements.map((req, index) => (
                      <Badge key={index} variant="outline">{req}</Badge>
                    ))}
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="analytics" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="border rounded-lg p-4">
                  <h4 className="font-semibold mb-2">Applications</h4>
                  <p className="text-3xl font-bold">{property.applications_count || 0}</p>
                </div>
                <div className="border rounded-lg p-4">
                  <h4 className="font-semibold mb-2">Collaborations</h4>
                  <p className="text-3xl font-bold">{property.collaborations_count || 0}</p>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="notes" className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Admin Notes</h4>
                <p className="text-muted-foreground">No admin notes yet</p>
              </div>
            </TabsContent>
          </ScrollArea>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default PropertyDetailModal;
