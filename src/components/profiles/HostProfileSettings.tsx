
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

interface HostProfileSettingsProps {
  profile: any;
  onProfileUpdated: () => void;
}

const HostProfileSettings = ({ profile, onProfileUpdated }: HostProfileSettingsProps) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    first_name: profile.first_name || '',
    last_name: profile.last_name || '',
    username: profile.username || '',
    bio: profile.bio || '',
    location: profile.location || '',
    phone: profile.phone || '',
    business_name: profile.hosts?.[0]?.business_name || '',
    min_follower_count: profile.hosts?.[0]?.min_follower_count || 0,
  });
  const [profilePhotoUrl, setProfilePhotoUrl] = useState(profile.profile_photo_url || '');
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
    setLoading(true);

    try {
      // Validate username format
      if (formData.username && !validateUsername(formData.username)) {
        throw new Error('Username must be 3-30 characters long and contain only lowercase letters, numbers, and underscores');
      }

      // Update profile
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          first_name: formData.first_name,
          last_name: formData.last_name,
          username: formData.username || null,
          bio: formData.bio,
          location: formData.location,
          phone: formData.phone,
        })
        .eq('id', profile.id);

      if (profileError) throw profileError;

      // Update host data
      const { error: hostError } = await supabase
        .from('hosts')
        .update({
          business_name: formData.business_name,
          min_follower_count: formData.min_follower_count,
        })
        .eq('id', profile.id);

      if (hostError) throw hostError;

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
    setProfilePhotoUrl(newPhotoUrl);
    onProfileUpdated();
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Profile Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Profile Photo Upload */}
            <div className="flex justify-center">
              <ProfileAvatarUpload
                userId={profile.id}
                currentPhotoUrl={profilePhotoUrl}
                initials={getInitials()}
                onPhotoUpdated={handlePhotoUpdated}
                size="lg"
              />
            </div>

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
              <Label htmlFor="business_name">Business Name (Optional)</Label>
              <Input
                id="business_name"
                value={formData.business_name}
                onChange={(e) => setFormData({ ...formData, business_name: e.target.value })}
                placeholder="Your business or property management company"
              />
            </div>

            <div>
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="City, State/Country"
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
              <Label htmlFor="min_follower_count">Minimum Follower Count</Label>
              <Input
                id="min_follower_count"
                type="number"
                value={formData.min_follower_count}
                onChange={(e) => setFormData({ ...formData, min_follower_count: parseInt(e.target.value) || 0 })}
                placeholder="0"
              />
            </div>

            <div>
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                placeholder="Tell creators about your properties and hosting style..."
                rows={4}
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-brand-green hover:bg-brand-green/90"
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

export default HostProfileSettings;
