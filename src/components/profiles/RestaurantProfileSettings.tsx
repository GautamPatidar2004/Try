import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import ProfileAvatarUpload from "./ProfileAvatarUpload";

interface RestaurantProfileSettingsProps {
  profile: any;
  onProfileUpdated: () => void;
}

const RestaurantProfileSettings = ({ profile, onProfileUpdated }: RestaurantProfileSettingsProps) => {
  const [loading, setLoading] = useState(false);
  const restaurantOwnerData = profile.restaurant_owners?.[0];
  const restaurantData = profile.restaurants?.[0];
  
  const [formData, setFormData] = useState({
    first_name: profile.first_name || '',
    last_name: profile.last_name || '',
    username: profile.username || '',
    phone: profile.phone || '',
    restaurant_name: restaurantData?.name || '',
    cuisine_type: restaurantData?.cuisine_type || '',
    description: restaurantData?.description || '',
    address: restaurantData?.address || '',
    city: restaurantData?.city || '',
    state: restaurantData?.state || '',
    zip_code: restaurantData?.zip_code || '',
    phone_number: restaurantData?.phone_number || '',
    website: restaurantData?.website || '',
    price_range: restaurantData?.price_range || '',
  });
  const [restaurantImage, setRestaurantImage] = useState(restaurantData?.image_url || '');
  const { toast } = useToast();

  const getInitials = () => {
    const name = formData.restaurant_name || formData.first_name || 'RS';
    return name.substring(0, 2).toUpperCase();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Update profile
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          first_name: formData.first_name,
          last_name: formData.last_name,
          username: formData.username || null,
          phone: formData.phone,
        })
        .eq('id', profile.id);

      if (profileError) throw profileError;

      // Ensure restaurant_owners record exists (it should be created during onboarding)
      // We don't need to update it here as it doesn't have additional fields

      // Update or insert restaurant data
      if (restaurantData) {
        const { error: restaurantError } = await supabase
          .from('restaurants')
          .update({
            name: formData.restaurant_name,
            cuisine_types: formData.cuisine_type ? [formData.cuisine_type] : [],
            description: formData.description,
            address: formData.address,
            city: formData.city,
            state: formData.state,
            price_range: formData.price_range,
          })
          .eq('id', restaurantData.id);

        if (restaurantError) throw restaurantError;
      } else {
        // For new restaurants, provide all required fields with defaults
        const { error: restaurantError } = await supabase
          .from('restaurants')
          .insert({
            owner_id: profile.id,
            name: formData.restaurant_name,
            cuisine_types: formData.cuisine_type ? [formData.cuisine_type] : [],
            description: formData.description || '',
            address: formData.address || '',
            city: formData.city || 'Unknown',
            state: formData.state || '',
            country: 'US',
            price_range: formData.price_range || '$',
            dining_style: 'Casual',
            collaboration_types: [],
            meal_types: [],
            booking_slots: {},
          });

        if (restaurantError) throw restaurantError;
      }

      toast({
        title: "Profile updated!",
        description: "Your changes have been saved successfully.",
      });

      onProfileUpdated();
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoUpdated = (newPhotoUrl: string) => {
    setRestaurantImage(newPhotoUrl);
    onProfileUpdated();
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Restaurant Profile Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Restaurant Image Upload */}
            <div className="flex justify-center">
              <ProfileAvatarUpload
                userId={profile.id}
                currentPhotoUrl={restaurantImage}
                initials={getInitials()}
                onPhotoUpdated={handlePhotoUpdated}
                size="lg"
              />
            </div>

            <div>
              <Label htmlFor="restaurant_name">Restaurant Name</Label>
              <Input
                id="restaurant_name"
                value={formData.restaurant_name}
                onChange={(e) => setFormData({ ...formData, restaurant_name: e.target.value })}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="first_name">Owner First Name</Label>
                <Input
                  id="first_name"
                  value={formData.first_name}
                  onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="last_name">Owner Last Name</Label>
                <Input
                  id="last_name"
                  value={formData.last_name}
                  onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="cuisine_type">Cuisine Type</Label>
              <Input
                id="cuisine_type"
                value={formData.cuisine_type}
                onChange={(e) => setFormData({ ...formData, cuisine_type: e.target.value })}
                placeholder="e.g., Italian, Mexican, Asian Fusion"
              />
            </div>

            <div>
              <Label htmlFor="price_range">Price Range</Label>
              <Select 
                value={formData.price_range} 
                onValueChange={(value) => setFormData({ ...formData, price_range: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select price range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="$">$ - Budget Friendly</SelectItem>
                  <SelectItem value="$$">$$ - Moderate</SelectItem>
                  <SelectItem value="$$$">$$$ - Upscale</SelectItem>
                  <SelectItem value="$$$$">$$$$ - Fine Dining</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="Street address"
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-2">
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="state">State</Label>
                <Input
                  id="state"
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  placeholder="XX"
                  maxLength={2}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="zip_code">ZIP Code</Label>
              <Input
                id="zip_code"
                value={formData.zip_code}
                onChange={(e) => setFormData({ ...formData, zip_code: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="phone_number">Restaurant Phone</Label>
              <Input
                id="phone_number"
                type="tel"
                value={formData.phone_number}
                onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                type="url"
                value={formData.website}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                placeholder="https://yourrestaurant.com"
              />
            </div>

            <div>
              <Label htmlFor="description">Restaurant Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Tell food influencers about your restaurant and cuisine..."
                rows={4}
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-orange-600 hover:bg-orange-700"
              disabled={loading}
            >
              {loading ? "Saving..." : "Save Changes"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default RestaurantProfileSettings;
