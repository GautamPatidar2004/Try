
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { X } from "lucide-react";
import ProfileAvatarUpload from "./ProfileAvatarUpload";
import { GENDER_OPTIONS, LIFESTYLE_OPTIONS } from "@/lib/demographics";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

interface InfluencerProfileSettingsProps {
  profile: any;
  onProfileUpdated: () => void;
}

const InfluencerProfileSettings = ({ profile, onProfileUpdated }: InfluencerProfileSettingsProps) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    first_name: profile.first_name || '',
    last_name: profile.last_name || '',
    username: profile.username || '',
    bio: profile.bio || '',
    location: profile.location || '',
    phone: profile.phone || '',
    rate_range_min: profile.influencers?.rate_range_min || '',
    rate_range_max: profile.influencers?.rate_range_max || '',
    content_niches: profile.influencers?.content_niches || [],
    date_of_birth: profile.influencers?.date_of_birth || '',
    gender: profile.influencers?.gender || '',
    lifestyle_tags: (profile.influencers?.lifestyle_tags as string[]) || [],
  });
  const [profilePhotoUrl, setProfilePhotoUrl] = useState(profile.profile_photo_url || '');
  const [newNiche, setNewNiche] = useState('');
  const { toast } = useToast();

  const popularNiches = [
    'Travel', 'Lifestyle', 'Food', 'Fashion', 'Fitness', 'Beauty', 
    'Photography', 'Adventure', 'Luxury', 'Budget Travel', 'Family', 'Couples'
  ];

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

  const addNiche = (niche: string) => {
    if (!formData.content_niches.includes(niche)) {
      setFormData({
        ...formData,
        content_niches: [...formData.content_niches, niche]
      });
    }
    setNewNiche('');
  };

  const removeNiche = (niche: string) => {
    setFormData({
      ...formData,
      content_niches: formData.content_niches.filter(n => n !== niche)
    });
  };

  const toggleLifestyle = (tag: string) => {
    setFormData((f) => ({
      ...f,
      lifestyle_tags: f.lifestyle_tags.includes(tag)
        ? f.lifestyle_tags.filter((t: string) => t !== tag)
        : [...f.lifestyle_tags, tag],
    }));
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

      // Update influencer data
      const { error: influencerError } = await supabase
        .from('influencers')
        .update({
          rate_range_min: formData.rate_range_min ? parseInt(formData.rate_range_min) : null,
          rate_range_max: formData.rate_range_max ? parseInt(formData.rate_range_max) : null,
          content_niches: formData.content_niches,
          date_of_birth: formData.date_of_birth || null,
          gender: formData.gender || null,
          lifestyle_tags: formData.lifestyle_tags,
        })
        .eq('id', profile.id);

      if (influencerError) throw influencerError;

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

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="date_of_birth">Date of Birth</Label>
                <Input
                  id="date_of_birth"
                  type="date"
                  value={formData.date_of_birth}
                  onChange={(e) =>
                    setFormData({ ...formData, date_of_birth: e.target.value })
                  }
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Used to show brands your generation (Gen Z, Millennial, etc.)
                </p>
              </div>
              <div>
                <Label htmlFor="gender">Gender</Label>
                <Select
                  value={formData.gender || undefined}
                  onValueChange={(v) => setFormData({ ...formData, gender: v })}
                >
                  <SelectTrigger id="gender">
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    {GENDER_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label>Lifestyle</Label>
              <p className="text-xs text-muted-foreground mb-3">
                Help brands find you for relevant collaborations.
              </p>
              <div className="grid grid-cols-2 gap-3">
                {LIFESTYLE_OPTIONS.map((opt) => (
                  <label
                    key={opt.value}
                    className="flex items-center gap-2 p-2 rounded-md border hover:bg-muted/50 cursor-pointer"
                  >
                    <Checkbox
                      checked={formData.lifestyle_tags.includes(opt.value)}
                      onCheckedChange={() => toggleLifestyle(opt.value)}
                    />
                    <span className="text-sm font-medium">{opt.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="rate_range_min">Rate Range Min ($)</Label>
                <Input
                  id="rate_range_min"
                  type="number"
                  value={formData.rate_range_min}
                  onChange={(e) => setFormData({ ...formData, rate_range_min: e.target.value })}
                  placeholder="500"
                />
              </div>
              <div>
                <Label htmlFor="rate_range_max">Rate Range Max ($)</Label>
                <Input
                  id="rate_range_max"
                  type="number"
                  value={formData.rate_range_max}
                  onChange={(e) => setFormData({ ...formData, rate_range_max: e.target.value })}
                  placeholder="2000"
                />
              </div>
            </div>

            <div>
              <Label>Content Niches</Label>
              <div className="flex flex-wrap gap-2 mb-3">
                {formData.content_niches.map((niche) => (
                  <Badge key={niche} variant="secondary" className="flex items-center gap-1">
                    {niche}
                    <X 
                      className="w-3 h-3 cursor-pointer" 
                      onClick={() => removeNiche(niche)}
                    />
                  </Badge>
                ))}
              </div>
              <div className="flex gap-2 mb-2">
                <Input
                  placeholder="Add custom niche..."
                  value={newNiche}
                  onChange={(e) => setNewNiche(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      if (newNiche.trim()) addNiche(newNiche.trim());
                    }
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    if (newNiche.trim()) addNiche(newNiche.trim());
                  }}
                >
                  Add
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {popularNiches.map((niche) => (
                  <Button
                    key={niche}
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => addNiche(niche)}
                    disabled={formData.content_niches.includes(niche)}
                  >
                    {niche}
                  </Button>
                ))}
              </div>
            </div>

            <div>
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                placeholder="Tell hosts about your content style and audience..."
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

export default InfluencerProfileSettings;
