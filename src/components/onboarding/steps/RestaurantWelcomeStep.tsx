import React, { useState } from 'react';
import { OnboardingStep } from '../OnboardingStep';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Upload, MapPin } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface RestaurantWelcomeStepProps {
  onNext: (data: RestaurantProfileData) => void;
  initialData?: Partial<RestaurantProfileData>;
}

export interface RestaurantProfileData {
  restaurantName: string;
  businessName?: string;
  description: string;
  address: string;
  city: string;
  state: string;
  country: string;
  phone: string;
  website?: string;
  profilePhotoUrl?: string;
}

export const RestaurantWelcomeStep: React.FC<RestaurantWelcomeStepProps> = ({
  onNext,
  initialData,
}) => {
  const [formData, setFormData] = useState<RestaurantProfileData>({
    restaurantName: initialData?.restaurantName || '',
    businessName: initialData?.businessName || '',
    description: initialData?.description || '',
    address: initialData?.address || '',
    city: initialData?.city || '',
    state: initialData?.state || '',
    country: initialData?.country || 'USA',
    phone: initialData?.phone || '',
    website: initialData?.website || '',
    profilePhotoUrl: initialData?.profilePhotoUrl || '',
  });

  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  const handleChange = (field: keyof RestaurantProfileData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file
    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Invalid file type',
        description: 'Please upload an image file',
        variant: 'destructive',
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: 'File too large',
        description: 'Please upload an image smaller than 5MB',
        variant: 'destructive',
      });
      return;
    }

    setUploading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/restaurant-profile.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('profile-photos')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('profile-photos')
        .getPublicUrl(fileName);

      setFormData((prev) => ({ ...prev, profilePhotoUrl: publicUrl }));

      toast({
        title: 'Photo uploaded',
        description: 'Your restaurant photo has been updated',
      });
    } catch (error: any) {
      toast({
        title: 'Upload failed',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = () => {
    // Validation
    if (!formData.restaurantName.trim()) {
      toast({
        title: 'Restaurant name required',
        description: 'Please enter your restaurant name',
        variant: 'destructive',
      });
      return;
    }

    if (!formData.description.trim()) {
      toast({
        title: 'Description required',
        description: 'Please describe your restaurant',
        variant: 'destructive',
      });
      return;
    }

    if (!formData.address.trim() || !formData.city.trim() || !formData.state.trim()) {
      toast({
        title: 'Location required',
        description: 'Please provide your restaurant location',
        variant: 'destructive',
      });
      return;
    }

    if (!formData.phone.trim()) {
      toast({
        title: 'Phone number required',
        description: 'Please provide a contact phone number',
        variant: 'destructive',
      });
      return;
    }

    onNext(formData);
  };

  const charCount = formData.description.length;
  const maxChars = 500;

  return (
    <OnboardingStep
      title="Welcome! Let's set up your restaurant"
      description="Tell us about your restaurant and help creators discover your unique dining experience"
      currentStep={1}
      totalSteps={2}
      onNext={handleSubmit}
    >
      <div className="space-y-6">
        {/* Profile Photo */}
        <div className="flex flex-col items-center space-y-4">
          <Avatar className="w-24 h-24">
            <AvatarImage src={formData.profilePhotoUrl} alt="Restaurant" />
            <AvatarFallback className="text-2xl">
              {formData.restaurantName.substring(0, 2).toUpperCase() || 'R'}
            </AvatarFallback>
          </Avatar>
          <div>
            <input
              type="file"
              id="photo-upload"
              className="hidden"
              accept="image/*"
              onChange={handlePhotoUpload}
              disabled={uploading}
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => document.getElementById('photo-upload')?.click()}
              disabled={uploading}
            >
              <Upload className="w-4 h-4 mr-2" />
              {uploading ? 'Uploading...' : 'Upload Photo'}
            </Button>
          </div>
        </div>

        {/* Restaurant Name */}
        <div className="space-y-2">
          <Label htmlFor="restaurantName">
            Restaurant Name <span className="text-destructive">*</span>
          </Label>
          <Input
            id="restaurantName"
            value={formData.restaurantName}
            onChange={(e) => handleChange('restaurantName', e.target.value)}
            placeholder="Enter your restaurant name"
          />
        </div>

        {/* Business Name */}
        <div className="space-y-2">
          <Label htmlFor="businessName">Business Name (if different)</Label>
          <Input
            id="businessName"
            value={formData.businessName}
            onChange={(e) => handleChange('businessName', e.target.value)}
            placeholder="Enter legal business name"
          />
        </div>

        {/* Description */}
        <div className="space-y-2">
          <Label htmlFor="description">
            Description <span className="text-destructive">*</span>
          </Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => handleChange('description', e.target.value)}
            placeholder="Describe your restaurant, cuisine, and atmosphere..."
            rows={4}
            maxLength={maxChars}
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Tell creators what makes your restaurant special</span>
            <span>{charCount}/{maxChars}</span>
          </div>
        </div>

        {/* Address */}
        <div className="space-y-2">
          <Label htmlFor="address">
            <MapPin className="w-4 h-4 inline mr-1" />
            Street Address <span className="text-destructive">*</span>
          </Label>
          <Input
            id="address"
            value={formData.address}
            onChange={(e) => handleChange('address', e.target.value)}
            placeholder="123 Main Street"
          />
        </div>

        {/* City, State, Country */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="city">
              City <span className="text-destructive">*</span>
            </Label>
            <Input
              id="city"
              value={formData.city}
              onChange={(e) => handleChange('city', e.target.value)}
              placeholder="City"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="state">
              State <span className="text-destructive">*</span>
            </Label>
            <Input
              id="state"
              value={formData.state}
              onChange={(e) => handleChange('state', e.target.value)}
              placeholder="State"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="country">Country</Label>
            <Input
              id="country"
              value={formData.country}
              onChange={(e) => handleChange('country', e.target.value)}
              placeholder="Country"
            />
          </div>
        </div>

        {/* Phone & Website */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="phone">
              Phone Number <span className="text-destructive">*</span>
            </Label>
            <Input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
              placeholder="(555) 123-4567"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="website">Website (optional)</Label>
            <Input
              id="website"
              type="url"
              value={formData.website}
              onChange={(e) => handleChange('website', e.target.value)}
              placeholder="https://yourrestaurant.com"
            />
          </div>
        </div>
      </div>
    </OnboardingStep>
  );
};
