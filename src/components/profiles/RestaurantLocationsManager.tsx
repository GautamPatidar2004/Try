import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, MapPin, Edit, Trash2 } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { AddRestaurantLocationModal } from "@/components/restaurant-owner/AddRestaurantLocationModal";

interface RestaurantLocationsManagerProps {
  profile: any;
}

const RestaurantLocationsManager = ({ profile }: RestaurantLocationsManagerProps) => {
  const isMobile = useIsMobile();
  const { toast } = useToast();
  const [restaurants, setRestaurants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRestaurant, setEditingRestaurant] = useState<any>(null);

  useEffect(() => {
    fetchRestaurants();
  }, [profile]);

  const fetchRestaurants = async () => {
    try {
      const { data, error } = await supabase
        .from('restaurants')
        .select('*')
        .eq('owner_id', profile.id)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRestaurants(data || []);
    } catch (error) {
      console.error('Error fetching restaurants:', error);
      toast({
        title: 'Error',
        description: 'Failed to load restaurants',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (restaurant: any) => {
    setEditingRestaurant(restaurant);
    setIsModalOpen(true);
  };

  const handleAddNew = () => {
    setEditingRestaurant(null);
    setIsModalOpen(true);
  };

  const handleSuccess = () => {
    fetchRestaurants();
  };

  const handleDelete = async (restaurantId: string) => {
    if (!confirm('Are you sure you want to delete this location?')) return;

    try {
      const { error } = await supabase
        .from('restaurants')
        .update({ is_active: false })
        .eq('id', restaurantId);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Restaurant location deleted',
      });

      fetchRestaurants();
    } catch (error) {
      console.error('Error deleting restaurant:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete restaurant',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading locations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Restaurant Locations</h2>
        <Button onClick={handleAddNew}>
          <Plus className="w-4 h-4 mr-2" />
          Add Location
        </Button>
      </div>

      {restaurants.length > 0 ? (
        <div className="grid gap-4">
          {restaurants.map((restaurant) => (
            <Card key={restaurant.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-5 h-5" />
                    <CardTitle>{restaurant.name}</CardTitle>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(restaurant)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(restaurant.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {restaurant.description && (
                    <p className="text-sm text-muted-foreground">{restaurant.description}</p>
                  )}
                  
                  <div className="space-y-1 text-sm">
                    <p>{restaurant.address}</p>
                    <p>{restaurant.city}, {restaurant.state} {restaurant.country}</p>
                  </div>

                  <div className="flex flex-wrap gap-2 pt-2">
                    {restaurant.cuisine_types?.map((cuisine: string) => (
                      <Badge key={cuisine} variant="secondary">{cuisine}</Badge>
                    ))}
                    <Badge variant="outline">{restaurant.price_range}</Badge>
                    <Badge variant="outline">{restaurant.dining_style}</Badge>
                  </div>

                  {restaurant.collaboration_types?.length > 0 && (
                    <div className="pt-2 border-t">
                      <p className="text-xs text-muted-foreground mb-1">Collaboration Types:</p>
                      <div className="flex flex-wrap gap-1">
                        {restaurant.collaboration_types.map((type: string) => (
                          <Badge key={type} variant="outline" className="text-xs">
                            {type.replace('_', ' ')}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <MapPin className="w-16 h-16 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">No locations yet</h3>
            <p className="text-muted-foreground text-center mb-6 max-w-md">
              Add your first restaurant location to start connecting with food influencers.
            </p>
            <Button onClick={handleAddNew}>
              <Plus className="w-4 h-4 mr-2" />
              Add Your First Location
            </Button>
          </CardContent>
        </Card>
      )}

      <AddRestaurantLocationModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        onSuccess={handleSuccess}
        existingRestaurant={editingRestaurant}
      />
    </div>
  );
};

export default RestaurantLocationsManager;
