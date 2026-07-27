import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { useRestaurantManagement } from '@/hooks/useRestaurantManagement';
import { useToast } from '@/hooks/use-toast';
import { X, Loader2 } from 'lucide-react';
import { OperatingHoursEditor, OperatingHours, DayHours } from './OperatingHoursEditor';
import { TimeSlotPicker, BookingSlot } from './TimeSlotPicker';

interface AddRestaurantLocationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  existingRestaurant?: any;
}

const DEFAULT_HOURS: DayHours = { open: '10:00', close: '22:00', isClosed: false };

const CUISINE_OPTIONS = [
  'Italian', 'Mexican', 'Japanese', 'Chinese', 'Indian', 'Thai', 'French',
  'American', 'Mediterranean', 'Korean', 'Vietnamese', 'Greek', 'Spanish',
  'Middle Eastern', 'Fusion', 'Steakhouse', 'Seafood', 'Vegetarian', 'Vegan',
];

const DIETARY_OPTIONS = ['Vegetarian', 'Vegan', 'Gluten-Free', 'Halal', 'Kosher', 'Dairy-Free'];
const AMBIANCE_OPTIONS = ['Romantic', 'Family-Friendly', 'Trendy', 'Rustic', 'Cozy', 'Upscale', 'Casual', 'Modern'];
const MEAL_TYPES = ['Breakfast', 'Brunch', 'Lunch', 'Dinner'];

export const AddRestaurantLocationModal: React.FC<AddRestaurantLocationModalProps> = ({
  open,
  onOpenChange,
  onSuccess,
  existingRestaurant
}) => {
  const { createRestaurant, updateRestaurant, loading } = useRestaurantManagement();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: existingRestaurant?.name || '',
    description: existingRestaurant?.description || '',
    address: existingRestaurant?.address || '',
    city: existingRestaurant?.city || '',
    state: existingRestaurant?.state || '',
    country: existingRestaurant?.country || 'United States',
    cuisineTypes: existingRestaurant?.cuisine_types || [],
    diningStyle: existingRestaurant?.dining_style || 'casual',
    priceRange: existingRestaurant?.price_range || '$$',
    dietaryOptions: existingRestaurant?.dietary_options || [],
    ambianceTags: existingRestaurant?.ambiance || [],
    mealTypes: existingRestaurant?.meal_types || [],
    seatingCapacity: existingRestaurant?.seating_capacity || 50,
    hasOutdoorSeating: existingRestaurant?.has_outdoor_seating || false,
    hasPrivateDining: existingRestaurant?.has_private_dining || false,
    hasParking: existingRestaurant?.parking_available || false,
    operatingHours: existingRestaurant?.operating_hours || {
      monday: DEFAULT_HOURS,
      tuesday: DEFAULT_HOURS,
      wednesday: DEFAULT_HOURS,
      thursday: DEFAULT_HOURS,
      friday: DEFAULT_HOURS,
      saturday: DEFAULT_HOURS,
      sunday: DEFAULT_HOURS,
    },
    collaborationTypes: existingRestaurant?.collaboration_types || ['free_meal'],
    minFollowerCount: existingRestaurant?.min_follower_count || 0,
    bookingSlots: existingRestaurant?.booking_slots || [
      { time: '12:00', capacity: 4 },
      { time: '13:00', capacity: 4 },
      { time: '18:00', capacity: 4 },
      { time: '19:00', capacity: 4 },
    ],
    maxPartySize: existingRestaurant?.max_party_size || 6,
    advanceBookingHours: existingRestaurant?.advance_booking_hours || 24,
  });

  const toggleArrayItem = (field: string, value: string) => {
    setFormData(prev => {
      const array = (prev as any)[field] as string[];
      const newArray = array.includes(value)
        ? array.filter(item => item !== value)
        : [...array, value];
      return { ...prev, [field]: newArray };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.address || !formData.city || !formData.country) {
      toast({
        title: 'Missing required fields',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    if (formData.cuisineTypes.length === 0) {
      toast({
        title: 'Cuisine type required',
        description: 'Please select at least one cuisine type',
        variant: 'destructive',
      });
      return;
    }

    const restaurantData = {
      name: formData.name,
      description: formData.description,
      address: formData.address,
      city: formData.city,
      state: formData.state,
      country: formData.country,
      cuisine_types: formData.cuisineTypes,
      dining_style: formData.diningStyle,
      price_range: formData.priceRange,
      dietary_options: formData.dietaryOptions,
      ambiance: formData.ambianceTags,
      meal_types: formData.mealTypes,
      seating_capacity: formData.seatingCapacity,
      has_outdoor_seating: formData.hasOutdoorSeating,
      has_private_dining: formData.hasPrivateDining,
      parking_available: formData.hasParking,
      operating_hours: formData.operatingHours,
      collaboration_types: formData.collaborationTypes,
      min_follower_count: formData.minFollowerCount,
      booking_slots: formData.bookingSlots,
      advance_booking_hours: formData.advanceBookingHours,
      max_party_size: formData.maxPartySize,
      is_active: true,
    };

    let result;
    if (existingRestaurant) {
      result = await updateRestaurant(existingRestaurant.id, restaurantData);
    } else {
      result = await createRestaurant(restaurantData);
    }

    if (result) {
      onSuccess();
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{existingRestaurant ? 'Edit Location' : 'Add New Location'}</DialogTitle>
          <DialogDescription>
            {existingRestaurant ? 'Update your restaurant location details' : 'Add a new restaurant location to your profile'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div className="space-y-4">
            <h3 className="font-semibold">Basic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Restaurant Name <span className="text-destructive">*</span></Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="city">City <span className="text-destructive">*</span></Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Address <span className="text-destructive">*</span></Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="state">State/Province</Label>
                <Input
                  id="state"
                  value={formData.state}
                  onChange={(e) => setFormData(prev => ({ ...prev, state: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="country">Country <span className="text-destructive">*</span></Label>
                <Input
                  id="country"
                  value={formData.country}
                  onChange={(e) => setFormData(prev => ({ ...prev, country: e.target.value }))}
                  required
                />
              </div>
            </div>
          </div>

          {/* Cuisine & Style */}
          <div className="space-y-4 pt-4 border-t">
            <h3 className="font-semibold">Cuisine & Style</h3>
            <div className="space-y-2">
              <Label>Cuisine Types <span className="text-destructive">*</span></Label>
              <div className="flex flex-wrap gap-2">
                {CUISINE_OPTIONS.map(cuisine => (
                  <Badge
                    key={cuisine}
                    variant={formData.cuisineTypes.includes(cuisine) ? 'default' : 'outline'}
                    className="cursor-pointer"
                    onClick={() => toggleArrayItem('cuisineTypes', cuisine)}
                  >
                    {cuisine}
                    {formData.cuisineTypes.includes(cuisine) && <X className="w-3 h-3 ml-1" />}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Dining Style</Label>
                <Select value={formData.diningStyle} onValueChange={(value) => setFormData(prev => ({ ...prev, diningStyle: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="casual">Casual Dining</SelectItem>
                    <SelectItem value="fine_dining">Fine Dining</SelectItem>
                    <SelectItem value="cafe">Café</SelectItem>
                    <SelectItem value="bar">Bar & Grill</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Price Range</Label>
                <Select value={formData.priceRange} onValueChange={(value) => setFormData(prev => ({ ...prev, priceRange: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="$">$ - Budget Friendly</SelectItem>
                    <SelectItem value="$$">$$ - Moderate</SelectItem>
                    <SelectItem value="$$$">$$$ - Upscale</SelectItem>
                    <SelectItem value="$$$$">$$$$ - Fine Dining</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Meal Types</Label>
              <div className="flex flex-wrap gap-3">
                {MEAL_TYPES.map(meal => (
                  <div key={meal} className="flex items-center space-x-2">
                    <Checkbox
                      id={`meal-${meal}`}
                      checked={formData.mealTypes.includes(meal)}
                      onCheckedChange={() => toggleArrayItem('mealTypes', meal)}
                    />
                    <label htmlFor={`meal-${meal}`} className="text-sm cursor-pointer">{meal}</label>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Operating Hours */}
          <div className="space-y-4 pt-4 border-t">
            <h3 className="font-semibold">Operating Hours</h3>
            <OperatingHoursEditor
              hours={formData.operatingHours}
              onChange={(hours) => setFormData(prev => ({ ...prev, operatingHours: hours }))}
            />
          </div>

          {/* Booking Slots */}
          <div className="space-y-4 pt-4 border-t">
            <h3 className="font-semibold">Booking Settings</h3>
            <TimeSlotPicker
              slots={formData.bookingSlots}
              onChange={(slots) => setFormData(prev => ({ ...prev, bookingSlots: slots }))}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {existingRestaurant ? 'Update Location' : 'Add Location'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
