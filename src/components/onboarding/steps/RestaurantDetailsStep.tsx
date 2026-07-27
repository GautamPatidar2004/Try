import React, { useState } from 'react';
import { OnboardingStep } from '../OnboardingStep';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { OperatingHoursEditor, OperatingHours, DayHours } from '@/components/restaurant-owner/OperatingHoursEditor';
import { TimeSlotPicker, BookingSlot } from '@/components/restaurant-owner/TimeSlotPicker';
import { useToast } from '@/hooks/use-toast';
import { X } from 'lucide-react';

interface RestaurantDetailsStepProps {
  onNext: (data: RestaurantDetails) => void;
  onPrevious: () => void;
  initialData?: Partial<RestaurantDetails>;
}

export interface RestaurantDetails {
  cuisineTypes: string[];
  diningStyle: string;
  priceRange: string;
  dietaryOptions: string[];
  ambianceTags: string[];
  mealTypes: string[];
  seatingCapacity: number;
  hasOutdoorSeating: boolean;
  hasPrivateDining: boolean;
  hasParking: boolean;
  operatingHours: OperatingHours;
  collaborationTypes: string[];
  minFollowerCount: number;
  contentRequirements: string[];
  rateMin?: number;
  rateMax?: number;
  bookingSlots: BookingSlot[];
  maxPartySize: number;
  advanceBookingHours: number;
}

const DEFAULT_HOURS: DayHours = { open: '10:00', close: '22:00', isClosed: false };

const CUISINE_OPTIONS = [
  'Italian', 'Mexican', 'Japanese', 'Chinese', 'Indian', 'Thai', 'French',
  'American', 'Mediterranean', 'Korean', 'Vietnamese', 'Greek', 'Spanish',
  'Middle Eastern', 'Fusion', 'Steakhouse', 'Seafood', 'Vegetarian', 'Vegan',
];

const DIETARY_OPTIONS = [
  'Vegetarian', 'Vegan', 'Gluten-Free', 'Halal', 'Kosher', 'Dairy-Free',
];

const AMBIANCE_OPTIONS = [
  'Romantic', 'Family-Friendly', 'Trendy', 'Rustic', 'Cozy', 'Upscale',
  'Casual', 'Modern', 'Traditional', 'Outdoor Dining',
];

const MEAL_TYPES = ['Breakfast', 'Brunch', 'Lunch', 'Dinner'];

const CONTENT_REQUIREMENTS = [
  'Instagram Post', 'Instagram Story', 'TikTok Video', 'YouTube Video',
  'Instagram Reel', 'Facebook Post', 'Twitter Post', 'Blog Post',
];

export const RestaurantDetailsStep: React.FC<RestaurantDetailsStepProps> = ({
  onNext,
  onPrevious,
  initialData,
}) => {
  const [formData, setFormData] = useState<RestaurantDetails>({
    cuisineTypes: initialData?.cuisineTypes || [],
    diningStyle: initialData?.diningStyle || 'casual',
    priceRange: initialData?.priceRange || '$$',
    dietaryOptions: initialData?.dietaryOptions || [],
    ambianceTags: initialData?.ambianceTags || [],
    mealTypes: initialData?.mealTypes || [],
    seatingCapacity: initialData?.seatingCapacity || 50,
    hasOutdoorSeating: initialData?.hasOutdoorSeating || false,
    hasPrivateDining: initialData?.hasPrivateDining || false,
    hasParking: initialData?.hasParking || false,
    operatingHours: initialData?.operatingHours || {
      monday: DEFAULT_HOURS,
      tuesday: DEFAULT_HOURS,
      wednesday: DEFAULT_HOURS,
      thursday: DEFAULT_HOURS,
      friday: DEFAULT_HOURS,
      saturday: DEFAULT_HOURS,
      sunday: DEFAULT_HOURS,
    },
    collaborationTypes: initialData?.collaborationTypes || [],
    minFollowerCount: initialData?.minFollowerCount || 0,
    contentRequirements: initialData?.contentRequirements || [],
    rateMin: initialData?.rateMin,
    rateMax: initialData?.rateMax,
    bookingSlots: initialData?.bookingSlots || [
      { time: '12:00', capacity: 4 },
      { time: '13:00', capacity: 4 },
      { time: '18:00', capacity: 4 },
      { time: '19:00', capacity: 4 },
    ],
    maxPartySize: initialData?.maxPartySize || 6,
    advanceBookingHours: initialData?.advanceBookingHours || 24,
  });

  const { toast } = useToast();

  const toggleArrayItem = (field: keyof RestaurantDetails, value: string) => {
    setFormData((prev) => {
      const array = prev[field] as string[];
      const newArray = array.includes(value)
        ? array.filter((item) => item !== value)
        : [...array, value];
      return { ...prev, [field]: newArray };
    });
  };

  const handleSubmit = () => {
    // Validation
    if (formData.cuisineTypes.length === 0) {
      toast({
        title: 'Cuisine type required',
        description: 'Please select at least one cuisine type',
        variant: 'destructive',
      });
      return;
    }

    if (formData.mealTypes.length === 0) {
      toast({
        title: 'Meal types required',
        description: 'Please select at least one meal type you serve',
        variant: 'destructive',
      });
      return;
    }

    if (formData.collaborationTypes.length === 0) {
      toast({
        title: 'Collaboration type required',
        description: 'Please select at least one collaboration type',
        variant: 'destructive',
      });
      return;
    }

    if (formData.bookingSlots.length === 0) {
      toast({
        title: 'Booking slots required',
        description: 'Please add at least one booking time slot',
        variant: 'destructive',
      });
      return;
    }

    // Check that at least 5 days have hours set
    const daysWithHours = Object.values(formData.operatingHours).filter(
      (day) => !day.isClosed
    ).length;

    if (daysWithHours < 5) {
      toast({
        title: 'Operating hours incomplete',
        description: 'Please set operating hours for at least 5 days',
        variant: 'destructive',
      });
      return;
    }

    onNext(formData);
  };

  return (
    <OnboardingStep
      title="Restaurant Details & Setup"
      description="Configure your restaurant's profile, operating hours, and collaboration preferences"
      currentStep={3}
      totalSteps={4}
      onNext={handleSubmit}
      onPrevious={onPrevious}
    >
      <div className="space-y-8">
        {/* Cuisine & Style */}
        <div className="space-y-4">
          <h3 className="font-semibold">Cuisine & Ambiance</h3>

          <div className="space-y-2">
            <Label>Cuisine Types <span className="text-destructive">*</span></Label>
            <div className="flex flex-wrap gap-2">
              {CUISINE_OPTIONS.map((cuisine) => (
                <Badge
                  key={cuisine}
                  variant={formData.cuisineTypes.includes(cuisine) ? 'default' : 'outline'}
                  className="cursor-pointer"
                  onClick={() => toggleArrayItem('cuisineTypes', cuisine)}
                >
                  {cuisine}
                  {formData.cuisineTypes.includes(cuisine) && (
                    <X className="w-3 h-3 ml-1" />
                  )}
                </Badge>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Dining Style</Label>
              <Select
                value={formData.diningStyle}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, diningStyle: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="casual">Casual Dining</SelectItem>
                  <SelectItem value="fine_dining">Fine Dining</SelectItem>
                  <SelectItem value="cafe">Café</SelectItem>
                  <SelectItem value="bar">Bar & Grill</SelectItem>
                  <SelectItem value="fast_casual">Fast Casual</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Price Range</Label>
              <Select
                value={formData.priceRange}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, priceRange: value }))}
              >
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
            <Label>Dietary Options</Label>
            <div className="flex flex-wrap gap-2">
              {DIETARY_OPTIONS.map((option) => (
                <Badge
                  key={option}
                  variant={formData.dietaryOptions.includes(option) ? 'default' : 'outline'}
                  className="cursor-pointer"
                  onClick={() => toggleArrayItem('dietaryOptions', option)}
                >
                  {option}
                </Badge>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Ambiance Tags</Label>
            <div className="flex flex-wrap gap-2">
              {AMBIANCE_OPTIONS.map((tag) => (
                <Badge
                  key={tag}
                  variant={formData.ambianceTags.includes(tag) ? 'default' : 'outline'}
                  className="cursor-pointer"
                  onClick={() => toggleArrayItem('ambianceTags', tag)}
                >
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        </div>

        {/* Restaurant Features */}
        <div className="space-y-4 pt-6 border-t">
          <h3 className="font-semibold">Restaurant Features</h3>

          <div className="space-y-2">
            <Label>Meal Types Served <span className="text-destructive">*</span></Label>
            <div className="flex flex-wrap gap-3">
              {MEAL_TYPES.map((meal) => (
                <div key={meal} className="flex items-center space-x-2">
                  <Checkbox
                    id={`meal-${meal}`}
                    checked={formData.mealTypes.includes(meal)}
                    onCheckedChange={() => toggleArrayItem('mealTypes', meal)}
                  />
                  <label htmlFor={`meal-${meal}`} className="text-sm cursor-pointer">
                    {meal}
                  </label>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="seatingCapacity">Seating Capacity</Label>
            <Input
              id="seatingCapacity"
              type="number"
              min="1"
              value={formData.seatingCapacity}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, seatingCapacity: parseInt(e.target.value) }))
              }
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="outdoor"
                checked={formData.hasOutdoorSeating}
                onCheckedChange={(checked) =>
                  setFormData((prev) => ({ ...prev, hasOutdoorSeating: checked as boolean }))
                }
              />
              <label htmlFor="outdoor" className="text-sm cursor-pointer">
                Outdoor Seating Available
              </label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="private"
                checked={formData.hasPrivateDining}
                onCheckedChange={(checked) =>
                  setFormData((prev) => ({ ...prev, hasPrivateDining: checked as boolean }))
                }
              />
              <label htmlFor="private" className="text-sm cursor-pointer">
                Private Dining Available
              </label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="parking"
                checked={formData.hasParking}
                onCheckedChange={(checked) =>
                  setFormData((prev) => ({ ...prev, hasParking: checked as boolean }))
                }
              />
              <label htmlFor="parking" className="text-sm cursor-pointer">
                Parking Available
              </label>
            </div>
          </div>
        </div>

        {/* Operating Hours */}
        <div className="space-y-4 pt-6 border-t">
          <h3 className="font-semibold">Operating Hours</h3>
          <OperatingHoursEditor
            hours={formData.operatingHours}
            onChange={(hours) => setFormData((prev) => ({ ...prev, operatingHours: hours }))}
          />
        </div>

        {/* Collaboration Settings */}
        <div className="space-y-4 pt-6 border-t">
          <h3 className="font-semibold">Collaboration Preferences</h3>

          <div className="space-y-2">
            <Label>Collaboration Types <span className="text-destructive">*</span></Label>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="free-meal"
                  checked={formData.collaborationTypes.includes('free_meal')}
                  onCheckedChange={() => toggleArrayItem('collaborationTypes', 'free_meal')}
                />
                <label htmlFor="free-meal" className="text-sm cursor-pointer">
                  Free Meal (Content Exchange)
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="paid"
                  checked={formData.collaborationTypes.includes('paid_partnership')}
                  onCheckedChange={() => toggleArrayItem('collaborationTypes', 'paid_partnership')}
                />
                <label htmlFor="paid" className="text-sm cursor-pointer">
                  Paid Partnership
                </label>
              </div>
            </div>
          </div>

          {formData.collaborationTypes.includes('paid_partnership') && (
            <div className="grid grid-cols-2 gap-4 pl-6">
              <div className="space-y-2">
                <Label htmlFor="rateMin">Minimum Rate ($)</Label>
                <Input
                  id="rateMin"
                  type="number"
                  min="0"
                  value={formData.rateMin || ''}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, rateMin: parseInt(e.target.value) }))
                  }
                  placeholder="0"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="rateMax">Maximum Rate ($)</Label>
                <Input
                  id="rateMax"
                  type="number"
                  min="0"
                  value={formData.rateMax || ''}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, rateMax: parseInt(e.target.value) }))
                  }
                  placeholder="0"
                />
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="minFollowers">Minimum Follower Count</Label>
            <Input
              id="minFollowers"
              type="number"
              min="0"
              value={formData.minFollowerCount}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, minFollowerCount: parseInt(e.target.value) }))
              }
              placeholder="0"
            />
            <p className="text-xs text-muted-foreground">Set to 0 for no minimum requirement</p>
          </div>

          <div className="space-y-2">
            <Label>Content Requirements</Label>
            <div className="flex flex-wrap gap-2">
              {CONTENT_REQUIREMENTS.map((req) => (
                <Badge
                  key={req}
                  variant={formData.contentRequirements.includes(req) ? 'default' : 'outline'}
                  className="cursor-pointer"
                  onClick={() => toggleArrayItem('contentRequirements', req)}
                >
                  {req}
                </Badge>
              ))}
            </div>
          </div>
        </div>

        {/* Booking Settings */}
        <div className="space-y-4 pt-6 border-t">
          <h3 className="font-semibold">Booking Settings</h3>

          <TimeSlotPicker
            slots={formData.bookingSlots}
            onChange={(slots) => setFormData((prev) => ({ ...prev, bookingSlots: slots }))}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="maxParty">Maximum Party Size</Label>
              <Input
                id="maxParty"
                type="number"
                min="1"
                max="20"
                value={formData.maxPartySize}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, maxPartySize: parseInt(e.target.value) }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="advanceHours">Advance Booking (hours)</Label>
              <Input
                id="advanceHours"
                type="number"
                min="1"
                max="168"
                value={formData.advanceBookingHours}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    advanceBookingHours: parseInt(e.target.value),
                  }))
                }
              />
              <p className="text-xs text-muted-foreground">
                Minimum hours in advance for bookings
              </p>
            </div>
          </div>
        </div>
      </div>
    </OnboardingStep>
  );
};
