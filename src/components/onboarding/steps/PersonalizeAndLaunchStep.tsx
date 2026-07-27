import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { 
  ArrowLeft, 
  ArrowRight, 
  Sparkles,
  Trophy,
  Rocket
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

interface PersonalizeAndLaunchStepProps {
  userId: string;
  onPrevious: () => void;
  badges: Array<{
    id: string;
    name: string;
    description: string;
    icon: string;
    earned_at: string;
  }>;
  points: number;
}

const contentNiches = [
  'Travel', 'Lifestyle', 'Food & Drink', 'Wellness', 'Fashion',
  'Adventure', 'Luxury', 'Photography', 'Solo Travel', 'Family Travel'
];

const nextSteps = [
  {
    title: "Browse Properties",
    description: "Explore amazing properties and start applying",
    action: "marketplace",
    icon: "🏡",
    primary: true
  },
  {
    title: "Complete Your Profile",
    description: "Add more details to attract hosts",
    action: "profile",
    icon: "👤",
    primary: false
  },
  {
    title: "Join the Community",
    description: "Connect with other creators",
    action: "marketplace",
    icon: "👥",
    primary: false
  }
];

export const PersonalizeAndLaunchStep: React.FC<PersonalizeAndLaunchStepProps> = ({
  userId,
  onPrevious,
  badges,
  points
}) => {
  const [selectedNiches, setSelectedNiches] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const loadPreferences = async () => {
      const { data: influencer } = await supabase
        .from('influencers')
        .select('content_niches')
        .eq('id', userId)
        .single();

      if (influencer) {
        setSelectedNiches(influencer.content_niches || []);
      }
    };

    loadPreferences();
  }, [userId]);

  const handleNicheToggle = (niche: string) => {
    setSelectedNiches(prev => 
      prev.includes(niche) 
        ? prev.filter(n => n !== niche)
        : [...prev, niche]
    );
  };

  const handleNavigation = (action: string) => {
    switch (action) {
      case 'marketplace':
        navigate('/marketplace');
        break;
      case 'profile':
        navigate('/profile');
        break;
      default:
        navigate('/marketplace');
    }
  };

  const handleComplete = async () => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('influencers')
        .upsert({ 
          id: userId,
          content_niches: selectedNiches
        }, { onConflict: 'id' });

      if (error) throw error;

      // Send welcome email (non-blocking)
      supabase.functions.invoke('send-welcome-email', {
        body: { user_id: userId }
      }).catch(emailError => {
        console.error('Welcome email failed (non-blocking):', emailError);
      });

      toast({
        title: "🎉 Onboarding Complete!",
        description: `Congratulations! You've earned ${points} points and ${badges.length} badges!`,
      });

      setTimeout(() => {
        navigate('/marketplace');
      }, 2000);
    } catch (error) {
      console.error('Error completing onboarding:', error);
      toast({
        title: "Error",
        description: "Failed to save preferences. Please try again.",
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
        <div className="w-20 h-20 mx-auto bg-gradient-to-r from-primary to-primary/60 rounded-full flex items-center justify-center text-4xl mb-4 animate-pulse">
          🏆
        </div>
        <h2 className="text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
          You're Almost Ready!
        </h2>
        <p className="text-lg text-muted-foreground">
          Final personalization and you're ready to start collaborating!
        </p>
      </motion.div>

      {/* Points & Badges Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-2 gap-4"
      >
        <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-primary/10">
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Sparkles className="w-5 h-5 text-primary" />
              <span className="text-2xl font-bold text-primary">{points}</span>
            </div>
            <p className="text-sm font-medium">Points Earned</p>
          </CardContent>
        </Card>
        
        <Card className="border-yellow-500/20 bg-gradient-to-r from-yellow-500/5 to-yellow-500/10">
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Trophy className="w-5 h-5 text-yellow-600" />
              <span className="text-2xl font-bold text-yellow-700">{badges.length}</span>
            </div>
            <p className="text-sm font-medium">Badges Earned</p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Content Preferences */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              🎯 Content Preferences (Optional)
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Help hosts find you by selecting your content style
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {contentNiches.map((niche) => (
                <div key={niche} className="flex items-center space-x-2">
                  <Checkbox
                    id={`niche-${niche}`}
                    checked={selectedNiches.includes(niche)}
                    onCheckedChange={() => handleNicheToggle(niche)}
                  />
                  <Label 
                    htmlFor={`niche-${niche}`} 
                    className="text-sm cursor-pointer"
                  >
                    {niche}
                  </Label>
                </div>
              ))}
            </div>
            {selectedNiches.length > 0 && (
              <div className="mt-4">
                <div className="flex flex-wrap gap-2">
                  {selectedNiches.map((niche) => (
                    <Badge key={niche} variant="secondary">
                      {niche}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Next Steps */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Rocket className="w-5 h-5 text-primary" />
              What's Next?
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {nextSteps.map((step, index) => (
              <div 
                key={index} 
                className={`p-4 border rounded-lg cursor-pointer transition-all duration-200 hover:border-primary/50 ${
                  step.primary ? 'border-primary/20 bg-primary/5' : 'border-border/50'
                }`}
                onClick={() => handleNavigation(step.action)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{step.icon}</span>
                    <div>
                      <h5 className={`font-medium ${step.primary ? 'text-primary' : ''}`}>
                        {step.title}
                      </h5>
                      <p className="text-sm text-muted-foreground">{step.description}</p>
                    </div>
                  </div>
                  <ArrowRight className="w-5 h-5 text-muted-foreground" />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </motion.div>

      {/* Navigation */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
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
          onClick={handleComplete}
          disabled={loading}
          className="flex-1 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary transition-all duration-300 text-lg py-6"
        >
          {loading ? "Completing..." : "🚀 Launch My Creator Journey!"}
        </Button>
      </motion.div>
    </div>
  );
};
