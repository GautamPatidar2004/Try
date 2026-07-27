import React, { useState, useEffect } from 'react';
import { OnboardingStep } from '../OnboardingStep';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Instagram, Youtube, Twitter } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { InstagramOAuthConnect } from '@/components/social/InstagramOAuthConnect';
import { TikTokOAuthConnect } from '@/components/social/TikTokOAuthConnect';

interface SocialStepProps {
  currentStep: number;
  totalSteps: number;
  onNext: () => void;
  onPrevious: () => void;
}

const socialPlatforms = [
  { key: 'youtube_url', label: 'YouTube', icon: Youtube, placeholder: 'https://youtube.com/@yourusername' },
  { key: 'twitter_url', label: 'Twitter/X', icon: Twitter, placeholder: 'https://twitter.com/yourusername' },
];

export const SocialStep: React.FC<SocialStepProps> = ({
  currentStep,
  totalSteps,
  onNext,
  onPrevious
}) => {
  const [socialData, setSocialData] = useState({
    youtube_url: '',
    twitter_url: ''
  });
  const [instagramAccount, setInstagramAccount] = useState<any>(null);
  const [tiktokAccount, setTiktokAccount] = useState<any>(null);
  const [userId, setUserId] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const loadSocialData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      setUserId(user.id);
      
      const { data: influencer } = await supabase
        .from('influencers')
        .select('youtube_url, twitter_url')
        .eq('id', user.id)
        .single();

      if (influencer) {
        setSocialData({
          youtube_url: influencer.youtube_url || '',
          twitter_url: influencer.twitter_url || ''
        });
      }

      // Check for OAuth accounts
      const { data: socialAccounts } = await supabase
        .from('social_accounts')
        .select('*')
        .eq('influencer_id', user.id)
        .in('platform', ['instagram', 'tiktok']);

      if (socialAccounts) {
        setInstagramAccount(socialAccounts.find(a => a.platform === 'instagram') || null);
        setTiktokAccount(socialAccounts.find(a => a.platform === 'tiktok') || null);
      }
    }
  };

  useEffect(() => {
    loadSocialData();
  }, []);

  const handleInputChange = (field: string, value: string) => {
    setSocialData(prev => ({ ...prev, [field]: value }));
  };

  const hasAtLeastOneSocial = () => {
    return Object.values(socialData).some(url => url.trim() !== '');
  };

  const handleNext = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // Create or update influencer profile
        const { error } = await supabase
          .from('influencers')
          .upsert({ 
            id: user.id,
            ...socialData
          }, { 
            onConflict: 'id' 
          });

        if (error) {
          throw error;
        }

        toast({
          title: "Social Accounts Updated!",
          description: hasAtLeastOneSocial() 
            ? "Your social media links have been saved successfully."
            : "You can add social accounts later from your profile.",
        });

        onNext();
      }
    } catch (error) {
      console.error('Error updating social accounts:', error);
      toast({
        title: "Error",
        description: "Failed to update social accounts. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <OnboardingStep
      title="Connect Your Social Media 📱"
      description="Link your social accounts to showcase your reach and content style to potential hosts."
      currentStep={currentStep}
      totalSteps={totalSteps}
      onNext={handleNext}
      onPrevious={onPrevious}
      nextLabel={loading ? "Saving..." : "Save & Continue"}
      nextDisabled={loading}
    >
      <div className="space-y-6">
        {/* Instagram OAuth Connection */}
        <InstagramOAuthConnect
          influencerId={userId}
          connectedAccount={instagramAccount}
          onConnected={loadSocialData}
        />

        {/* TikTok OAuth Connection */}
        <TikTokOAuthConnect
          influencerId={userId}
          connectedAccount={tiktokAccount}
          onConnected={loadSocialData}
        />

        {/* Other Social Platform Cards */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-muted-foreground">Other Platforms (Optional)</h3>
          {socialPlatforms.map((platform) => (
            <Card key={platform.key} className="border-border/50">
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-3 min-w-[120px]">
                    <platform.icon className="w-5 h-5 text-muted-foreground" />
                    <Label className="font-medium">{platform.label}</Label>
                  </div>
                  <Input
                    value={socialData[platform.key as keyof typeof socialData]}
                    onChange={(e) => handleInputChange(platform.key, e.target.value)}
                    placeholder={platform.placeholder}
                    className="flex-1"
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Benefits of connecting social */}
        <div className="bg-secondary/50 rounded-lg p-4 space-y-3">
          <h4 className="font-medium text-foreground">Why connect your social accounts?</h4>
          <ul className="text-sm text-muted-foreground space-y-2">
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-primary rounded-full" />
              Hosts can see your follower count and engagement
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-primary rounded-full" />
              Showcase your content style and quality
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-primary rounded-full" />
              Increase your chances of getting collaboration requests
            </li>
          </ul>
        </div>

        {/* Skip option */}
        <div className="text-center">
          <Button 
            variant="ghost" 
            onClick={onNext}
            disabled={loading}
            className="text-muted-foreground hover:text-foreground"
          >
            Skip for now - I'll add these later
          </Button>
        </div>
      </div>
    </OnboardingStep>
  );
};