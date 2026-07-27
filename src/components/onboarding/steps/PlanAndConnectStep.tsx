import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Instagram, Youtube, Twitter, CheckCircle, ArrowLeft, Zap, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useSubscription } from '@/hooks/useSubscription';
import { PricingPlans } from '@/components/subscription/PricingPlans';
import { motion } from 'framer-motion';
import { onboardingSocialSchema } from '@/lib/validation/schemas';

interface PlanAndConnectStepProps {
  userId: string;
  onNext: () => void;
  onPrevious: () => void;
  points: number;
  setPoints: (points: number | ((prev: number) => number)) => void;
}

const socialPlatforms = [
  { key: 'instagram_url', label: 'Instagram', icon: Instagram, placeholder: 'https://instagram.com/yourusername' },
  { key: 'youtube_url', label: 'YouTube', icon: Youtube, placeholder: 'https://youtube.com/@yourusername' },
  { key: 'twitter_url', label: 'Twitter/X', icon: Twitter, placeholder: 'https://twitter.com/yourusername' },
];

export const PlanAndConnectStep: React.FC<PlanAndConnectStepProps> = ({
  userId,
  onNext,
  onPrevious,
  points,
  setPoints
}) => {
  const [socialData, setSocialData] = useState({
    instagram_url: '',
    youtube_url: '',
    twitter_url: '',
    instagram_followers: 0,
    youtube_followers: 0,
    twitter_followers: 0
  });
  const [loading, setLoading] = useState(false);
  const [socialConnected, setSocialConnected] = useState(false);
  const [planSelected, setPlanSelected] = useState(false);
  const { subscriptionStatus, loading: subscriptionLoading } = useSubscription();
  const { toast } = useToast();

  useEffect(() => {
    if (subscriptionStatus?.hasActiveSubscription) {
      setPlanSelected(true);
    }
  }, [subscriptionStatus]);

  useEffect(() => {
    const loadSocialData = async () => {
      const { data: influencer } = await supabase
        .from('influencers')
        .select('instagram_url, youtube_url, twitter_url, total_followers')
        .eq('id', userId)
        .single();

      if (influencer) {
        const avgFollowers = Math.floor((influencer.total_followers || 0) / 3);
        setSocialData({
          instagram_url: influencer.instagram_url || '',
          youtube_url: influencer.youtube_url || '',
          twitter_url: influencer.twitter_url || '',
          instagram_followers: influencer.instagram_url ? avgFollowers : 0,
          youtube_followers: influencer.youtube_url ? avgFollowers : 0,
          twitter_followers: influencer.twitter_url ? avgFollowers : 0
        });
      }
    };

    loadSocialData();
  }, [userId]);

  const handleInputChange = (field: string, value: string) => {
    setSocialData(prev => ({ ...prev, [field]: value }));
    
    const hasAnySocial = Object.entries(socialData).some(([key, val]) => 
      key.includes('_url') && typeof val === 'string' && val.trim() !== ''
    );
    const willHaveSocial = value.trim() !== '' || Object.entries(socialData).some(([key, val]) => 
      key !== field && key.includes('_url') && typeof val === 'string' && val.trim() !== ''
    );
    
    if (!hasAnySocial && willHaveSocial && !socialConnected) {
      setSocialConnected(true);
      setPoints(prev => prev + 25);
      toast({
        title: "+25 points! Social connected! 📱",
        description: "Great! This helps hosts find you.",
      });
    }
  };

  const hasAtLeastOneSocial = () => {
    return (
      (socialData.instagram_url.trim() && socialData.instagram_followers > 0) ||
      (socialData.youtube_url.trim() && socialData.youtube_followers > 0) ||
      (socialData.twitter_url.trim() && socialData.twitter_followers > 0)
    );
  };

  const getTotalFollowers = () => {
    return socialData.instagram_followers + socialData.youtube_followers + socialData.twitter_followers;
  };

  const hasPaidSubscription = Boolean(subscriptionStatus?.hasActiveSubscription) || planSelected;

  const handleNext = async () => {
    const result = onboardingSocialSchema.safeParse(socialData);
    if (!result.success) {
      const firstError = result.error.errors[0];
      toast({
        title: "Validation Error",
        description: firstError.message,
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const totalFollowers = getTotalFollowers();
      const { error } = await supabase
        .from('influencers')
        .upsert({ 
          id: userId,
          instagram_url: socialData.instagram_url || null,
          youtube_url: socialData.youtube_url || null,
          twitter_url: socialData.twitter_url || null,
          total_followers: totalFollowers
        }, { onConflict: 'id' });

      if (error) throw error;

      setPoints(prev => prev + 30);
      toast({
        title: "+30 points! Step completed! 🎉",
        description: "Almost there! One final step.",
      });

      onNext();
    } catch (error) {
      console.error('Error updating social accounts:', error);
      toast({
        title: "Error",
        description: "Failed to save social accounts. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-4"
      >
        <div className="w-16 h-16 mx-auto bg-gradient-to-r from-primary to-primary/60 rounded-full flex items-center justify-center text-3xl mb-4">
          ⚡
        </div>
        <h2 className="text-2xl font-bold">Choose Your Plan & Connect</h2>
        <p className="text-muted-foreground">
          Select your subscription and connect your social accounts to maximize opportunities
        </p>
      </motion.div>

      {/* Subscription Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="border-border/50">
          <CardHeader>
           <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-primary" />
              Subscription Plan
               {hasPaidSubscription ? (
                <Badge className="bg-green-500/10 text-green-600 border-green-500/20">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Active
                </Badge>
              ) : (
                <Badge variant="destructive" className="text-xs">Required</Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {hasPaidSubscription ? (
              <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4 text-center">
                <p className="text-green-600 font-medium">✅ You have an active paid subscription!</p>
                <p className="text-sm text-muted-foreground mt-1">
                  You're all set to apply to unlimited properties
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
                  <div className="flex items-start gap-2">
                    <Zap className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-primary">Upgrade to unlock unlimited pitches</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        You're on the free Starter plan (1 pitch/month). Upgrade for unlimited access and premium features.
                      </p>
                    </div>
                  </div>
                </div>
                <PricingPlans forcedCategory="supply" compact onPlanSelected={() => setPlanSelected(true)} returnUrl="/onboarding" />
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Social Media Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              📱 Connect Social Media
              {hasAtLeastOneSocial() && (
                <Badge className="bg-blue-500/10 text-blue-600 border-blue-500/20">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Connected
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Requirements Notice */}
            <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-primary">At least one social account required</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Connect your social media and enter follower counts to unlock opportunities
                  </p>
                </div>
              </div>
            </div>

            {socialPlatforms.map((platform) => {
              const urlKey = platform.key as keyof typeof socialData;
              const followersKey = `${platform.key.replace('_url', '_followers')}` as keyof typeof socialData;
              const hasUrl = socialData[urlKey] && String(socialData[urlKey]).trim() !== '';
              
              return (
                <div key={platform.key} className="space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 p-3 border border-border/50 rounded-lg">
                    <div className="flex items-center gap-3 min-w-[100px]">
                      <platform.icon className="w-5 h-5 text-muted-foreground" />
                      <Label className="font-medium text-sm">{platform.label}</Label>
                    </div>
                    <Input
                      value={String(socialData[urlKey] || '')}
                      onChange={(e) => handleInputChange(platform.key, e.target.value)}
                      placeholder={platform.placeholder}
                      className="flex-1 h-11"
                    />
                  </div>
                  
                  {hasUrl && (
                    <div className="ml-0 sm:ml-4 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 p-3 bg-muted/30 rounded-lg border border-border/30">
                      <Label className="text-sm font-medium min-w-[120px]">
                        Follower Count *
                      </Label>
                      <Input
                        type="number"
                        min="0"
                        value={socialData[followersKey] as number || ''}
                        onChange={(e) => setSocialData(prev => ({
                          ...prev,
                          [followersKey]: parseInt(e.target.value) || 0
                        }))}
                        placeholder="Enter your follower count"
                        className="flex-1 h-11"
                      />
                    </div>
                  )}
                </div>
              );
            })}
            
            {/* Progress Summary */}
            <div className={`rounded-lg p-4 text-center border ${
              hasAtLeastOneSocial() 
                ? 'bg-green-500/10 border-green-500/20' 
                : 'bg-muted/50 border-border/50'
            }`}>
              {hasAtLeastOneSocial() ? (
                <div>
                  <p className="text-green-600 text-sm font-medium flex items-center justify-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    Ready to connect! Total: {getTotalFollowers().toLocaleString()} followers
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Verified profiles get 5x more collaboration requests
                  </p>
                </div>
              ) : (
                <p className="text-muted-foreground text-sm">
                  Connect at least one account with follower count to continue
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Navigation */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="flex gap-4"
      >
        <Button 
          variant="outline" 
          onClick={onPrevious}
          className="flex items-center gap-2 px-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>
        <Button 
          onClick={handleNext}
          disabled={loading || !hasAtLeastOneSocial() || !planSelected}
          className="flex-1 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary transition-all duration-300"
        >
          {loading ? "Saving..." : "Continue to Final Step →"}
        </Button>
      </motion.div>
    </div>
  );
};
