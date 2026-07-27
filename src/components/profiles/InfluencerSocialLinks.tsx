import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Instagram, Youtube, Twitter, Zap, ExternalLink, Save } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { formatSocialUrl } from "@/lib/socialUrlFormatter";

interface InfluencerSocialLinksProps {
  influencerId: string;
  onUpdated: () => void;
}

const InfluencerSocialLinks = ({ influencerId, onUpdated }: InfluencerSocialLinksProps) => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [socialLinks, setSocialLinks] = useState({
    instagram_url: '',
    tiktok_url: '',
    youtube_url: '',
    twitter_url: '',
  });
  const { toast } = useToast();

  const platforms = [
    { 
      key: 'instagram_url' as keyof typeof socialLinks, 
      label: 'Instagram', 
      icon: Instagram, 
      placeholder: 'https://instagram.com/yourusername',
      baseUrl: 'instagram.com'
    },
    { 
      key: 'tiktok_url' as keyof typeof socialLinks, 
      label: 'TikTok', 
      icon: Zap, 
      placeholder: 'https://tiktok.com/@yourusername',
      baseUrl: 'tiktok.com'
    },
    { 
      key: 'youtube_url' as keyof typeof socialLinks, 
      label: 'YouTube', 
      icon: Youtube, 
      placeholder: 'https://youtube.com/@yourchannel',
      baseUrl: 'youtube.com'
    },
    { 
      key: 'twitter_url' as keyof typeof socialLinks, 
      label: 'X (Twitter)', 
      icon: Twitter, 
      placeholder: 'https://x.com/yourusername',
      baseUrl: 'x.com'
    },
  ];

  useEffect(() => {
    fetchSocialLinks();
  }, [influencerId]);

  const fetchSocialLinks = async () => {
    try {
      const { data, error } = await supabase
        .from('influencers')
        .select('instagram_url, tiktok_url, youtube_url, twitter_url')
        .eq('id', influencerId)
        .maybeSingle();

      if (error) {
        console.error('Error fetching social links:', error);
      }
      
      if (data) {
        setSocialLinks({
          instagram_url: data.instagram_url || '',
          tiktok_url: data.tiktok_url || '',
          youtube_url: data.youtube_url || '',
          twitter_url: data.twitter_url || '',
        });
      }
    } catch (error) {
      console.error('Error in social links fetch:', error);
      toast({
        title: "Error",
        description: "Failed to load social media links",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const validateUrl = (url: string, baseUrl: string) => {
    if (!url) return true; // Empty is valid
    try {
      const urlObj = new URL(url);
      return urlObj.hostname.includes(baseUrl);
    } catch {
      return false;
    }
  };

  const formatUrl = (url: string, baseUrl: string) => {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    if (url.startsWith('@')) url = url.substring(1);
    return `https://${baseUrl}/${url}`;
  };

  const handleSave = async () => {
    setSaving(true);
    
    // Validate URLs
    for (const platform of platforms) {
      const url = socialLinks[platform.key];
      if (url && !validateUrl(url, platform.baseUrl)) {
        toast({
          title: "Invalid URL",
          description: `Please enter a valid ${platform.label} URL`,
          variant: "destructive",
        });
        setSaving(false);
        return;
      }
    }

    try {
      const formattedLinks = Object.fromEntries(
        Object.entries(socialLinks).map(([key, value]) => {
          if (!value) return [key, null];
          const platform = platforms.find(p => p.key === key);
          return [key, formatUrl(value, platform?.baseUrl || '')];
        })
      );

      const { error } = await supabase
        .from('influencers')
        .update(formattedLinks)
        .eq('id', influencerId);

      if (error) throw error;

      toast({
        title: "Social links updated!",
        description: "Your social media links have been saved.",
      });

      onUpdated();
    } catch (error) {
      console.error('Error updating social links:', error);
      toast({
        title: "Error",
        description: "Failed to update social links. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (key: keyof typeof socialLinks, value: string) => {
    setSocialLinks(prev => ({ ...prev, [key]: value }));
  };

  if (loading) {
    return <div>Loading social media links...</div>;
  }

  const hasAnyLinks = Object.values(socialLinks).some(url => url);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Social Media Links</h2>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Connect Your Social Profiles</CardTitle>
          <p className="text-sm text-muted-foreground">
            Add links to your social media profiles to showcase your reach and connect with brands.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {platforms.map((platform) => (
            <div key={platform.key} className="space-y-2">
              <Label htmlFor={platform.key} className="flex items-center gap-2">
                <platform.icon className="w-4 h-4" />
                {platform.label}
              </Label>
              <div className="flex gap-2">
                <Input
                  id={platform.key}
                  value={socialLinks[platform.key]}
                  onChange={(e) => handleInputChange(platform.key, e.target.value)}
                  placeholder={platform.placeholder}
                  className="flex-1"
                />
                {socialLinks[platform.key] && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const platformKey = platform.key.replace('_url', '') as 'instagram' | 'youtube' | 'twitter' | 'tiktok';
                      const formattedUrl = formatSocialUrl(platformKey, socialLinks[platform.key]);
                      if (formattedUrl) window.open(formattedUrl, '_blank');
                    }}
                  >
                    <ExternalLink className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>
          ))}
          
          <Button 
            onClick={handleSave} 
            disabled={saving}
            className="w-full bg-brand-green hover:bg-brand-green/90"
          >
            <Save className="w-4 h-4 mr-2" />
            {saving ? "Saving..." : "Save Social Links"}
          </Button>
        </CardContent>
      </Card>

      {hasAnyLinks && (
        <Card>
          <CardHeader>
            <CardTitle>Your Social Profiles</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {platforms.map((platform) => {
                const url = socialLinks[platform.key];
                if (!url) return null;
                
                return (
                  <div key={platform.key} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div className="flex items-center gap-3">
                      <platform.icon className="w-6 h-6 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{platform.label}</p>
                        <p className="text-sm text-muted-foreground truncate max-w-[200px]">{url}</p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const platformKey = platform.key.replace('_url', '') as 'instagram' | 'youtube' | 'twitter' | 'tiktok';
                        const formattedUrl = formatSocialUrl(platformKey, url);
                        if (formattedUrl) window.open(formattedUrl, '_blank');
                      }}
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default InfluencerSocialLinks;