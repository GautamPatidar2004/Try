import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import ProfileAvatarUpload from '@/components/profiles/ProfileAvatarUpload';
import { Sparkles, Star, Users, TrendingUp, AlertCircle, CheckCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';
import { onboardingProfileSchema } from '@/lib/validation/schemas';

interface WelcomeAndSetupStepProps {
  userId: string;
  onNext: () => void;
  points: number;
  setPoints: (points: number | ((prev: number) => number)) => void;
}

const benefits = [
  { icon: Star, title: "Premium Access", description: "Connect with verified hosts" },
  { icon: Users, title: "Creator Community", description: "Join thousands of creators" },
  { icon: TrendingUp, title: "Growth Tools", description: "Analytics and insights" },
];

export const WelcomeAndSetupStep: React.FC<WelcomeAndSetupStepProps> = ({ 
  userId,
  onNext,
  points,
  setPoints
}) => {
  const [profile, setProfile] = useState({
    first_name: '',
    last_name: '',
    bio: '',
    location: '',
    profile_photo_url: ''
  });
  const [loading, setLoading] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const loadProfile = async () => {
      const { data: profileData } = await supabase
        .from('profiles')
        .select('first_name, last_name, bio, location, profile_photo_url')
        .eq('id', userId)
        .single();

      if (profileData) {
        setProfile({
          first_name: profileData.first_name || '',
          last_name: profileData.last_name || '',
          bio: profileData.bio || '',
          location: profileData.location || '',
          profile_photo_url: profileData.profile_photo_url || ''
        });
      }
    };

    loadProfile();
  }, [userId]);

  const handleInputChange = (field: string, value: string) => {
    setProfile(prev => ({ ...prev, [field]: value }));
    
    // Add instant feedback points
    if (!hasInteracted) {
      setHasInteracted(true);
      setPoints(prev => prev + 10);
      toast({
        title: "+10 points! 🎉",
        description: "Great start on your profile!",
      });
    }
  };

  const isFormValid = () => {
    return (
      profile.first_name.trim().length > 0 &&
      profile.bio.trim().length >= 50 &&
      profile.location.trim().length > 0 &&
      profile.profile_photo_url.trim().length > 0
    );
  };

  const getValidationErrors = () => {
    const errors: string[] = [];
    if (!profile.first_name.trim()) errors.push('First name is required');
    if (profile.bio.trim().length < 50) errors.push(`Bio needs ${50 - profile.bio.trim().length} more characters`);
    if (!profile.location.trim()) errors.push('Location is required');
    if (!profile.profile_photo_url.trim()) errors.push('Profile picture is required');
    return errors;
  };

  const handleNext = async () => {
    // Validate using schema
    const result = onboardingProfileSchema.safeParse({
      first_name: profile.first_name,
      last_name: profile.last_name,
      bio: profile.bio,
      location: profile.location,
      profile_photo_url: profile.profile_photo_url
    });

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
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          ...profile,
          user_type: 'influencer'
        })
        .eq('id', userId);

      if (profileError) throw profileError;

      const { error: influencerError } = await supabase
        .from('influencers')
        .upsert({ id: userId }, { onConflict: 'id' });

      if (influencerError) throw influencerError;

      // Award points for completion
      setPoints(prev => prev + 50);
      
      toast({
        title: "+50 points! Profile created! 🚀",
        description: "Looking great! Let's continue your setup.",
      });

      onNext();
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
    <div className="space-y-8">
      {/* Welcome Header */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center space-y-4"
      >
        <div className="w-20 h-20 mx-auto bg-gradient-to-r from-primary to-primary/60 rounded-full flex items-center justify-center text-4xl mb-4">
          🚀
        </div>
        <h2 className="text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
          Welcome to Your Creator Journey!
        </h2>
        <p className="text-lg text-muted-foreground max-w-md mx-auto">
          Let's set up your profile and unlock amazing collaboration opportunities!
        </p>
      </motion.div>

      {/* Benefits Grid */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8"
      >
        {benefits.map((benefit, index) => (
          <Card key={index} className="border-border/50 hover:border-primary/50 transition-all duration-300 hover:shadow-lg">
            <CardContent className="p-4 text-center space-y-3">
              <div className="w-12 h-12 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
                <benefit.icon className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h4 className="font-semibold">{benefit.title}</h4>
                <p className="text-sm text-muted-foreground">{benefit.description}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </motion.div>

      {/* Profile Setup Form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              Quick Profile Setup
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Requirements Checklist */}
            <div className="bg-muted/50 rounded-lg p-4 space-y-2">
              <p className="text-sm font-medium mb-2">Complete these required fields:</p>
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm">
                  {profile.first_name.trim() ? (
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-destructive" />
                  )}
                  <span className={profile.first_name.trim() ? 'text-green-600' : 'text-muted-foreground'}>
                    First name
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  {profile.bio.trim().length >= 50 ? (
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-destructive" />
                  )}
                  <span className={profile.bio.trim().length >= 50 ? 'text-green-600' : 'text-muted-foreground'}>
                    Bio (at least 50 characters)
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  {profile.location.trim() ? (
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-destructive" />
                  )}
                  <span className={profile.location.trim() ? 'text-green-600' : 'text-muted-foreground'}>
                    Location
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  {profile.profile_photo_url.trim() ? (
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-destructive" />
                  )}
                  <span className={profile.profile_photo_url.trim() ? 'text-green-600' : 'text-muted-foreground'}>
                    Profile picture
                  </span>
                </div>
              </div>
            </div>

            {/* Avatar Section */}
            <div className="space-y-2">
              <Label>Profile Picture *</Label>
              <div className="flex justify-center">
                <ProfileAvatarUpload
                  userId={userId}
                  currentPhotoUrl={profile.profile_photo_url}
                  initials={profile.first_name ? profile.first_name[0]?.toUpperCase() : '?'}
                  onPhotoUpdated={(url) => {
                    setProfile(prev => ({ ...prev, profile_photo_url: url }));
                    if (!hasInteracted) {
                      setHasInteracted(true);
                      setPoints(prev => prev + 25);
                      toast({
                        title: "+25 points! 📸",
                        description: "Profile picture uploaded!",
                      });
                    }
                  }}
                  size="lg"
                />
              </div>
              <p className="text-xs text-center text-muted-foreground">
                Profiles with pictures get 5x more responses
              </p>
            </div>

            {/* Names */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="first_name">First Name *</Label>
                <Input
                  id="first_name"
                  value={profile.first_name}
                  onChange={(e) => handleInputChange('first_name', e.target.value)}
                  placeholder="Your first name"
                  className="transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="last_name">Last Name</Label>
                <Input
                  id="last_name"
                  value={profile.last_name}
                  onChange={(e) => handleInputChange('last_name', e.target.value)}
                  placeholder="Your last name"
                  className="transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>

            {/* Location */}
            <div className="space-y-2">
              <Label htmlFor="location">Location *</Label>
              <Input
                id="location"
                value={profile.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                placeholder="City, Country (e.g., Los Angeles, USA)"
                className="transition-all duration-200 focus:ring-2 focus:ring-primary/20"
              />
            </div>

            {/* Bio */}
            <div className="space-y-2">
              <Label htmlFor="bio">Bio * (Minimum 50 characters)</Label>
              <Textarea
                id="bio"
                value={profile.bio}
                onChange={(e) => handleInputChange('bio', e.target.value)}
                placeholder="Tell hosts about yourself, your content style, and why you'd be great to work with..."
                rows={4}
                className="transition-all duration-200 focus:ring-2 focus:ring-primary/20"
              />
              <div className="flex justify-between items-center text-xs">
                <span className={profile.bio.length >= 50 ? 'text-green-600' : 'text-muted-foreground'}>
                  {profile.bio.length}/50 characters {profile.bio.length >= 50 && '✓'}
                </span>
                <span className="text-muted-foreground">
                  Complete bios get 70% more responses
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Action Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="flex justify-end"
      >
        <Button 
          onClick={handleNext}
          disabled={loading || !isFormValid()}
          className="px-8 py-3 text-lg font-semibold min-w-[160px] bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary transition-all duration-300"
        >
          {loading ? "Saving..." : "Continue Setup →"}
        </Button>
      </motion.div>

      {/* Progress Incentive */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="bg-gradient-to-r from-primary/5 to-primary/10 rounded-lg p-4 text-center border border-primary/20"
      >
        <p className="text-sm font-medium text-foreground">
          🎯 Complete all steps to earn the "Collaboration Ready" badge and unlock premium features!
        </p>
      </motion.div>
    </div>
  );
};
