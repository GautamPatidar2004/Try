import React, { useState } from 'react';
import { User } from '@supabase/supabase-js';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Home, ArrowRight } from 'lucide-react';
import ProfileAvatarUpload from '@/components/profiles/ProfileAvatarUpload';

interface HostWelcomeAndSetupStepProps {
  user: User | null;
  onNext: (data: any) => void;
  onPrevious: () => void;
  onExit: () => void;
  currentStep: number;
  totalSteps: number;
}

export const HostWelcomeAndSetupStep: React.FC<HostWelcomeAndSetupStepProps> = ({
  user,
  onNext,
  onPrevious,
  onExit,
  currentStep,
  totalSteps
}) => {
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState({
    first_name: '',
    last_name: '',
    username: '',
    bio: '',
    location: '',
    phone: '',
    profile_photo_url: ''
  });
  const { toast } = useToast();

  const getInitials = () => {
    const first = profile.first_name?.[0] || '';
    const last = profile.last_name?.[0] || '';
    return `${first}${last}`.toUpperCase();
  };

  const handlePhotoUpdated = (newPhotoUrl: string) => {
    setProfile(prev => ({ ...prev, profile_photo_url: newPhotoUrl }));
  };

  const handleSubmit = async () => {
    if (!user || !profile.first_name || !profile.last_name || !profile.location) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      // Update profile with user_type set to 'host'
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({ 
          id: user.id,
          user_type: 'host',
          ...profile
        }, { 
          onConflict: 'id' 
        });

      if (profileError) throw profileError;

      // Create host record
      const { error: hostError } = await supabase
        .from('hosts')
        .upsert({ 
          id: user.id
        }, { 
          onConflict: 'id' 
        });

      if (hostError) throw hostError;

      toast({
        title: "Profile Created!",
        description: "Welcome to Hostfluencer! Let's continue setting up your host profile.",
      });

      onNext(profile);
    } catch (error: any) {
      console.error('Error creating profile:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create profile. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Card className="border-0 shadow-xl bg-background/80 backdrop-blur-sm">
        <CardHeader className="text-center pb-6">
          <div className="flex justify-center mb-4">
            <div className="p-3 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white">
              <Home className="w-8 h-8" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">Welcome, Property Host!</CardTitle>
          <p className="text-muted-foreground">
            Let's create your profile and start connecting with amazing content creators
          </p>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Profile Photo */}
          {user && (
            <div className="flex justify-center">
              <ProfileAvatarUpload
                userId={user.id}
                currentPhotoUrl={profile.profile_photo_url}
                initials={getInitials()}
                onPhotoUpdated={handlePhotoUpdated}
                size="lg"
              />
            </div>
          )}

          {/* Basic Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="first_name">First Name *</Label>
              <Input
                id="first_name"
                value={profile.first_name}
                onChange={(e) => setProfile(prev => ({ ...prev, first_name: e.target.value }))}
                placeholder="John"
                required
              />
            </div>
            <div>
              <Label htmlFor="last_name">Last Name *</Label>
              <Input
                id="last_name"
                value={profile.last_name}
                onChange={(e) => setProfile(prev => ({ ...prev, last_name: e.target.value }))}
                placeholder="Doe"
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="username">Username (Optional)</Label>
            <Input
              id="username"
              value={profile.username}
              onChange={(e) => setProfile(prev => ({ ...prev, username: e.target.value.toLowerCase() }))}
              placeholder="johndoe_properties"
            />
            <p className="text-sm text-muted-foreground mt-1">
              This will be your unique identifier on the platform
            </p>
          </div>

          <div>
            <Label htmlFor="location">Location *</Label>
            <Input
              id="location"
              value={profile.location}
              onChange={(e) => setProfile(prev => ({ ...prev, location: e.target.value }))}
              placeholder="Miami, Florida"
              required
            />
          </div>

          <div>
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              type="tel"
              value={profile.phone}
              onChange={(e) => setProfile(prev => ({ ...prev, phone: e.target.value }))}
              placeholder="+1 (555) 123-4567"
            />
          </div>

          <div>
            <Label htmlFor="bio">Tell Us About Yourself</Label>
            <Textarea
              id="bio"
              value={profile.bio}
              onChange={(e) => setProfile(prev => ({ ...prev, bio: e.target.value }))}
              placeholder="I'm a property owner passionate about creating amazing experiences for content creators..."
              rows={4}
            />
          </div>

          <div className="flex justify-between pt-4">
            <Button
              variant="outline"
              onClick={onExit}
              disabled={loading}
            >
              Exit Setup
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={loading}
              className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating Profile...
                </>
              ) : (
                <>
                  Continue Setup
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};