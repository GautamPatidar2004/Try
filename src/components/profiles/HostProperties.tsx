import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, Upload, RefreshCw, Calendar, CreditCard } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import AddPropertyModal from "../properties/AddPropertyModal";
import EditPropertyModal from "../properties/EditPropertyModal";
import BulkImportModal from "../properties/BulkImportModal";
import PropertyCalendarModal from "../properties/PropertyCalendarModal";
import { useImageRecovery } from "@/hooks/useImageRecovery";
import { Property } from "@/types/properties";

interface HostPropertiesProps {
  hostId: string;
}

const HostProperties = ({ hostId }: HostPropertiesProps) => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isBulkImportOpen, setIsBulkImportOpen] = useState(false);
  const [isCalendarModalOpen, setIsCalendarModalOpen] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const { toast } = useToast();
  const { recoverMissingImages, isRecovering } = useImageRecovery();

  useEffect(() => {
    fetchProperties();
  }, [hostId]);

  const fetchProperties = async () => {
    try {
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('host_id', hostId);

      if (error) throw error;
      setProperties(data || []);
    } catch (error) {
      console.error('Error fetching properties:', error);
      toast({
        title: "Error",
        description: "Failed to load properties",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePropertyAdded = () => {
    fetchProperties();
  };

  const handleEditProperty = (property: Property) => {
    setSelectedProperty(property);
    setIsEditModalOpen(true);
  };

  const handleOpenCalendar = (property: Property) => {
    setSelectedProperty(property);
    setIsCalendarModalOpen(true);
  };

  const handleDeleteProperty = async (propertyId: string) => {
    if (!confirm('Are you sure you want to delete this property?')) return;

    try {
      const { error } = await supabase
        .from('properties')
        .delete()
        .eq('id', propertyId);

      if (error) throw error;

      toast({
        title: "Success!",
        description: "Property deleted successfully.",
      });

      fetchProperties();
    } catch (error) {
      console.error('Error deleting property:', error);
      toast({
        title: "Error",
        description: "Failed to delete property. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handlePropertyUpdated = () => {
    fetchProperties();
    setIsEditModalOpen(false);
    setSelectedProperty(null);
  };

  if (loading) {
    return <div>Loading properties...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">My Properties</h2>
        <div className="flex gap-2">
          <Button 
            variant="outline"
            onClick={() => setIsBulkImportOpen(true)}
          >
            <Upload className="w-4 h-4 mr-2" />
            Bulk Import
          </Button>
          <Button
            onClick={recoverMissingImages}
            variant="secondary"
            disabled={isRecovering}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isRecovering ? 'animate-spin' : ''}`} />
            {isRecovering ? 'Recovering...' : 'Recover Images'}
          </Button>
          <Button 
            className="bg-brand-green hover:bg-brand-green/90"
            onClick={() => setIsModalOpen(true)}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Property
          </Button>
        </div>
      </div>

      {properties.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <div className="text-muted-foreground mb-4">
              <Plus className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No properties yet</p>
              <p className="text-sm">Add your first property to start connecting with creators</p>
            </div>
            <Button 
              className="bg-brand-green hover:bg-brand-green/90"
              onClick={() => setIsModalOpen(true)}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Your First Property
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {properties.map((property: any) => (
            <Card key={property.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{property.title}</CardTitle>
                  {property.is_active ? (
                    <Badge variant="default" className="bg-green-600">Active</Badge>
                  ) : (
                    <Badge variant="secondary">Inactive</Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-2">{property.location}</p>
                <p className="text-sm text-muted-foreground mb-2">{property.property_type}</p>
                 {property.campaign_rate && (
                   <p className="text-sm font-medium mb-2">
                     Campaign: ${(property.campaign_rate / 100).toFixed(0)} · Creator gets ${(property.creator_payout / 100).toFixed(0)}
                   </p>
                 )}
                 {property.base_nightly_rate && (
                   <p className="text-sm text-muted-foreground mb-2">
                     ${(property.base_nightly_rate / 100).toFixed(0)}/night base rate
                   </p>
                 )}
                <div className="flex justify-between items-center">
                  <span className="text-primary font-semibold">
                    {property.collaboration_type === 'free_stay' ? 'Free Stay' : 
                      property.collaboration_type === 'discount' ? `${property.discount_percentage}% Off${property.base_nightly_rate ? ` → $${Math.round((property.base_nightly_rate / 100) * (1 - (property.discount_percentage || 0) / 100))}/night` : ''}` : 
                     'Paid Collaboration'}
                  </span>
                    <div className="flex space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleOpenCalendar(property)}
                        title="Manage Calendar"
                      >
                        <Calendar className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleEditProperty(property)}
                        title="Edit Property"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleDeleteProperty(property.id)}
                        title="Delete Property"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <AddPropertyModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        hostId={hostId}
        onPropertyAdded={handlePropertyAdded}
      />

      {selectedProperty && (
        <EditPropertyModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedProperty(null);
          }}
          property={selectedProperty}
          onPropertyUpdated={handlePropertyUpdated}
        />
      )}

      <BulkImportModal
        isOpen={isBulkImportOpen}
        onClose={() => setIsBulkImportOpen(false)}
        hostId={hostId}
        onImportComplete={handlePropertyAdded}
      />

      {selectedProperty && (
        <PropertyCalendarModal
          isOpen={isCalendarModalOpen}
          onClose={() => {
            setIsCalendarModalOpen(false);
            setSelectedProperty(null);
          }}
          property={selectedProperty}
        />
      )}
    </div>
  );
};

export default HostProperties;
