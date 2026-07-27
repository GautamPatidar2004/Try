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

interface BrandProfileSettingsProps {
  profile: any;
  onProfileUpdated: () => void;
}

const BrandProfileSettings = ({ profile, onProfileUpdated }: BrandProfileSettingsProps) => {
  const [loading, setLoading] = useState(false);
  const brandData = profile.brands?.[0];
  const [formData, setFormData] = useState({
    first_name: profile.first_name || '',
    last_name: profile.last_name || '',
    username: profile.username || '',
    phone: profile.phone || '',
    brand_name: brandData?.brand_name || '',
    company_name: brandData?.company_name || '',
    website: brandData?.website || '',
    industry: brandData?.industry || '',
    description: brandData?.description || '',
    budget_range: brandData?.budget_range || '',
    contact_email: brandData?.contact_email || '',
    contact_phone: brandData?.contact_phone || '',
  });
  const [logoUrl, setLogoUrl] = useState(brandData?.logo_url || '');
  const { toast } = useToast();

  const getInitials = () => {
    const brandName = formData.brand_name || formData.first_name || 'BR';
    return brandName.substring(0, 2).toUpperCase();
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

      // Update or insert brand data
      if (brandData) {
        const { error: brandError } = await supabase
          .from('brands')
          .update({
            brand_name: formData.brand_name,
            company_name: formData.company_name,
            website: formData.website,
            industry: formData.industry,
            description: formData.description,
            budget_range: formData.budget_range,
            contact_email: formData.contact_email,
            contact_phone: formData.contact_phone,
          })
          .eq('user_id', profile.id);

        if (brandError) throw brandError;
      } else {
        const { error: brandError } = await supabase
          .from('brands')
          .insert({
            user_id: profile.id,
            brand_name: formData.brand_name,
            company_name: formData.company_name,
            website: formData.website,
            industry: formData.industry,
            description: formData.description,
            budget_range: formData.budget_range,
            contact_email: formData.contact_email,
            contact_phone: formData.contact_phone,
          });

        if (brandError) throw brandError;
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
    setLogoUrl(newPhotoUrl);
    onProfileUpdated();
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Brand Profile Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Brand Logo Upload */}
            <div className="flex justify-center">
              <ProfileAvatarUpload
                userId={profile.id}
                currentPhotoUrl={logoUrl}
                initials={getInitials()}
                onPhotoUpdated={handlePhotoUpdated}
                size="lg"
              />
            </div>

            <div>
              <Label htmlFor="brand_name">Brand Name</Label>
              <Input
                id="brand_name"
                value={formData.brand_name}
                onChange={(e) => setFormData({ ...formData, brand_name: e.target.value })}
                required
              />
            </div>

            <div>
              <Label htmlFor="company_name">Company Name</Label>
              <Input
                id="company_name"
                value={formData.company_name}
                onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="first_name">Contact First Name</Label>
                <Input
                  id="first_name"
                  value={formData.first_name}
                  onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="last_name">Contact Last Name</Label>
                <Input
                  id="last_name"
                  value={formData.last_name}
                  onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                type="url"
                value={formData.website}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                placeholder="https://yourbrand.com"
              />
            </div>

            <div>
              <Label htmlFor="industry">Industry</Label>
              <Input
                id="industry"
                value={formData.industry}
                onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                placeholder="e.g., Fashion, Technology, Food & Beverage"
                required
              />
            </div>

            <div>
              <Label htmlFor="budget_range">Budget Range</Label>
              <Select 
                value={formData.budget_range} 
                onValueChange={(value) => setFormData({ ...formData, budget_range: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select budget range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="$1,000-$5,000">$1,000-$5,000</SelectItem>
                  <SelectItem value="$5,000-$10,000">$5,000-$10,000</SelectItem>
                  <SelectItem value="$10,000-$25,000">$10,000-$25,000</SelectItem>
                  <SelectItem value="$25,000-$50,000">$25,000-$50,000</SelectItem>
                  <SelectItem value="$50,000+">$50,000+</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="contact_email">Contact Email</Label>
              <Input
                id="contact_email"
                type="email"
                value={formData.contact_email}
                onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
                required
              />
            </div>

            <div>
              <Label htmlFor="contact_phone">Contact Phone</Label>
              <Input
                id="contact_phone"
                type="tel"
                value={formData.contact_phone}
                onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="description">Brand Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Tell creators about your brand and what you're looking for..."
                rows={4}
                required
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-purple-600 hover:bg-purple-700"
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

export default BrandProfileSettings;
