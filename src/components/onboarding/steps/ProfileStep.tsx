import React, { useState, useEffect } from 'react';
import { OnboardingStep } from '../OnboardingStep';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import ProfileAvatarUpload from '@/components/profiles/ProfileAvatarUpload';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ProfileStepProps {
  currentStep: number;
  totalSteps: number;
  onNext: () => void;
  onPrevious: () => void;
}

export const ProfileStep: React.FC<ProfileStepProps> = ({
  currentStep,
  totalSteps,
  onNext,
  onPrevious
}) => {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    username: '',
    location: '',
    bio: '',
    profile_photo_url: ''
  });
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Load existing profile data
    const loadProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (profile) {
          setFormData({
            first_name: profile.first_name || '',
            last_name: profile.last_name || '',
            username: profile.username || '',
            location: profile.location || '',
            bio: profile.bio || '',
            profile_photo_url: profile.profile_photo_url || ''
          });
        }
      }
    };

    loadProfile();
  }, []);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handlePhotoUpdated = (photoUrl: string) => {
    setFormData(prev => ({ ...prev, profile_photo_url: photoUrl }));
  };

  const validateForm = () => {
    return formData.first_name.trim() && formData.last_name.trim() && formData.username.trim();
  };

  const handleNext = async () => {
    if (!validateForm()) {
      toast({
        title: "Missing Information",
        description: "Please fill in your name and username to continue.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { error } = await supabase
          .from('profiles')
          .update(formData)
          .eq('id', user.id);

        if (error) {
          throw error;
        }

        toast({
          title: "Profile Updated!",
          description: "Your profile information has been saved successfully.",
        });

        onNext();
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <OnboardingStep
      title="Build Your Profile 👤"
      description="Let hosts know who you are! A complete profile gets more collaboration requests."
      currentStep={currentStep}
      totalSteps={totalSteps}
      onNext={handleNext}
      onPrevious={onPrevious}
      nextLabel={loading ? "Saving..." : "Save & Continue"}
      nextDisabled={!validateForm() || loading}
    >
      <div className="space-y-6">
        {/* Profile Photo */}
        <div className="text-center">
          <Label className="text-base font-medium">Profile Photo</Label>
          <div className="mt-2">
            {user?.id ? (
              <ProfileAvatarUpload
                userId={user.id}
                currentPhotoUrl={formData.profile_photo_url}
                onPhotoUpdated={handlePhotoUpdated}
                initials={`${formData.first_name.charAt(0)}${formData.last_name.charAt(0)}`}
              />
            ) : (
              <div className="flex items-center justify-center p-4">
                <p className="text-sm text-muted-foreground">Loading...</p>
              </div>
            )}
          </div>
        </div>

        {/* Basic Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="firstName">First Name *</Label>
            <Input
              id="firstName"
              value={formData.first_name}
              onChange={(e) => handleInputChange('first_name', e.target.value)}
              placeholder="Your first name"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lastName">Last Name *</Label>
            <Input
              id="lastName"
              value={formData.last_name}
              onChange={(e) => handleInputChange('last_name', e.target.value)}
              placeholder="Your last name"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="username">Username *</Label>
          <Input
            id="username"
            value={formData.username}
            onChange={(e) => handleInputChange('username', e.target.value)}
            placeholder="Choose a unique username"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="location">Location</Label>
          <Input
            id="location"
            value={formData.location}
            onChange={(e) => handleInputChange('location', e.target.value)}
            placeholder="City, Country"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="bio">Bio</Label>
          <Textarea
            id="bio"
            value={formData.bio}
            onChange={(e) => handleInputChange('bio', e.target.value)}
            placeholder="Tell hosts about yourself and your content style..."
            rows={3}
          />
        </div>

        {/* Progress indicator */}
        <div className="bg-secondary/50 rounded-lg p-3 text-center">
          <p className="text-sm text-muted-foreground">
            📝 Required fields help hosts understand who you are
          </p>
        </div>
      </div>
    </OnboardingStep>
  );
};