
import { useState } from "react";
import { User } from "@supabase/supabase-js";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { UserCheck, Camera } from "lucide-react";
import ProfileAvatarUpload from "./ProfileAvatarUpload";

interface ProfileSetupProps {
  user: User | null;
  onProfileCreated: () => void;
}

const ProfileSetup = ({ user, onProfileCreated }: ProfileSetupProps) => {
  const [userType, setUserType] = useState<'host' | 'influencer' | null>(null);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    username: '',
    bio: '',
    location: '',
    phone: '',
  });
  const [profilePhotoUrl, setProfilePhotoUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const getInitials = () => {
    const first = formData.first_name?.[0] || '';
    const last = formData.last_name?.[0] || '';
    return `${first}${last}`.toUpperCase();
  };

  const validateUsername = (username: string) => {
    if (!username) return true; // Username is optional
    const regex = /^[a-z0-9_]{3,30}$/;
    return regex.test(username);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userType || !user) return;

    setLoading(true);
    try {
      // Validate username format
      if (formData.username && !validateUsername(formData.username)) {
        throw new Error('Username must be 3-30 characters long and contain only lowercase letters, numbers, and underscores');
      }

      // Create profile
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          user_type: userType,
          profile_photo_url: profilePhotoUrl || null,
          username: formData.username || null,
          ...formData,
        });

      if (profileError) throw profileError;

      // Create user-type specific record
      if (userType === 'host') {
        const { error: hostError } = await supabase
          .from('hosts')
          .insert({
            id: user.id,
          });
        if (hostError) throw hostError;
      } else {
        const { error: influencerError } = await supabase
          .from('influencers')
          .insert({
            id: user.id,
          });
        if (influencerError) throw influencerError;
      }

      toast({
        title: "Profile created!",
        description: "Welcome to Hostfluencer!",
      });

      onProfileCreated();
    } catch (error: any) {
      console.error('Error creating profile:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoUpdated = (newPhotoUrl: string) => {
    setProfilePhotoUrl(newPhotoUrl);
  };

  return (
    <div className="min-h-screen bg-muted flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Complete Your Profile</CardTitle>
          <p className="text-muted-foreground">Let's set up your account to get started</p>
        </CardHeader>
        <CardContent className="space-y-6">
          {!userType ? (
            <div className="space-y-4">
              <Label className="text-lg font-medium">I am a...</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button
                  variant="outline"
                  className="h-32 flex flex-col items-center justify-center space-y-2 hover:bg-brand-green hover:text-white"
                  onClick={() => setUserType('host')}
                >
                  <UserCheck className="w-8 h-8" />
                  <div className="text-center">
                    <div className="font-semibold">Property Host</div>
                    <div className="text-sm opacity-75">I have properties to offer</div>
                  </div>
                </Button>
                <Button
                  variant="outline"
                  className="h-32 flex flex-col items-center justify-center space-y-2 hover:bg-brand-green hover:text-white"
                  onClick={() => setUserType('influencer')}
                >
                  <Camera className="w-8 h-8" />
                  <div className="text-center">
                    <div className="font-semibold">Content Creator</div>
                    <div className="text-sm opacity-75">I create content for brands</div>
                  </div>
                </Button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Profile Photo Upload */}
              {user && (
                <div className="flex justify-center">
                  <ProfileAvatarUpload
                    userId={user.id}
                    currentPhotoUrl={profilePhotoUrl}
                    initials={getInitials()}
                    onPhotoUpdated={handlePhotoUpdated}
                    size="lg"
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="first_name">First Name</Label>
                  <Input
                    id="first_name"
                    value={formData.first_name}
                    onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="last_name">Last Name</Label>
                  <Input
                    id="last_name"
                    value={formData.last_name}
                    onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="username">Username (Optional)</Label>
                <Input
                  id="username"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value.toLowerCase() })}
                  placeholder="johndoe123"
                  pattern="[a-z0-9_]{3,30}"
                  title="Username must be 3-30 characters long and contain only lowercase letters, numbers, and underscores"
                />
                <p className="text-sm text-muted-foreground mt-1">
                  3-30 characters, lowercase letters, numbers, and underscores only
                </p>
              </div>
              
              <div>
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  placeholder="City, State/Country"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  required
                />
              </div>

              <div>
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  placeholder={userType === 'host' ? 
                    "Tell creators about your properties and hosting style..." : 
                    "Tell hosts about your content style and audience..."
                  }
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  rows={4}
                />
              </div>

              <div className="flex space-x-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setUserType(null)}
                  disabled={loading}
                >
                  Back
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-brand-green hover:bg-brand-green/90"
                  disabled={loading}
                >
                  {loading ? "Creating Profile..." : "Complete Setup"}
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfileSetup;
