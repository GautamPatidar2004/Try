import React, { useState, useEffect } from 'react';
import { OnboardingStep } from '../OnboardingStep';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface PreferencesStepProps {
  currentStep: number;
  totalSteps: number;
  onNext: () => void;
  onPrevious: () => void;
}

const contentNiches = [
  'Travel', 'Lifestyle', 'Food & Drink', 'Wellness', 'Fashion',
  'Adventure', 'Luxury', 'Budget Travel', 'Family Travel', 'Solo Travel',
  'Photography', 'Couples Travel', 'Business Travel', 'Eco-Tourism'
];

const collaborationTypes = [
  'Free Stay + Content', 'Paid Partnership', 'Commission Based',
  'Product Collaboration', 'Event Coverage', 'Long-term Partnership'
];

export const PreferencesStep: React.FC<PreferencesStepProps> = ({
  currentStep,
  totalSteps,
  onNext,
  onPrevious
}) => {
  const [selectedNiches, setSelectedNiches] = useState<string[]>([]);
  const [selectedCollaborations, setSelectedCollaborations] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Load existing preferences
    const loadPreferences = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: influencer } = await supabase
          .from('influencers')
          .select('content_niches, collaboration_preferences')
          .eq('id', user.id)
          .single();

        if (influencer) {
          setSelectedNiches(influencer.content_niches || []);
          setSelectedCollaborations(influencer.collaboration_preferences || []);
        }
      }
    };

    loadPreferences();
  }, []);

  const handleNicheToggle = (niche: string) => {
    setSelectedNiches(prev => 
      prev.includes(niche) 
        ? prev.filter(n => n !== niche)
        : [...prev, niche]
    );
  };

  const handleCollaborationToggle = (collaboration: string) => {
    setSelectedCollaborations(prev => 
      prev.includes(collaboration) 
        ? prev.filter(c => c !== collaboration)
        : [...prev, collaboration]
    );
  };

  const hasSelections = () => {
    return selectedNiches.length > 0 || selectedCollaborations.length > 0;
  };

  const handleNext = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // Create or update influencer profile with preferences
        const { error } = await supabase
          .from('influencers')
          .upsert({ 
            id: user.id,
            content_niches: selectedNiches,
            collaboration_preferences: selectedCollaborations
          }, { 
            onConflict: 'id' 
          });

        if (error) {
          throw error;
        }

        toast({
          title: "Preferences Saved!",
          description: hasSelections() 
            ? "Your content preferences have been saved successfully."
            : "You can update your preferences later from your profile.",
        });

        onNext();
      }
    } catch (error) {
      console.error('Error updating preferences:', error);
      toast({
        title: "Error",
        description: "Failed to update preferences. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <OnboardingStep
      title="Set Your Content Preferences 🎯"
      description="Help hosts find you by selecting your content niches and collaboration preferences."
      currentStep={currentStep}
      totalSteps={totalSteps}
      onNext={handleNext}
      onPrevious={onPrevious}
      nextLabel={loading ? "Saving..." : "Save & Continue"}
      nextDisabled={loading}
    >
      <div className="space-y-6">
        {/* Content Niches */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Content Niches</CardTitle>
            <p className="text-sm text-muted-foreground">
              What type of content do you create? (Select all that apply)
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
                <p className="text-sm text-muted-foreground mb-2">Selected:</p>
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

        {/* Collaboration Preferences */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Collaboration Types</CardTitle>
            <p className="text-sm text-muted-foreground">
              What types of collaborations are you interested in?
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {collaborationTypes.map((collaboration) => (
                <div key={collaboration} className="flex items-center space-x-2">
                  <Checkbox
                    id={`collab-${collaboration}`}
                    checked={selectedCollaborations.includes(collaboration)}
                    onCheckedChange={() => handleCollaborationToggle(collaboration)}
                  />
                  <Label 
                    htmlFor={`collab-${collaboration}`} 
                    className="text-sm cursor-pointer"
                  >
                    {collaboration}
                  </Label>
                </div>
              ))}
            </div>
            {selectedCollaborations.length > 0 && (
              <div className="mt-4">
                <p className="text-sm text-muted-foreground mb-2">Selected:</p>
                <div className="flex flex-wrap gap-2">
                  {selectedCollaborations.map((collaboration) => (
                    <Badge key={collaboration} variant="secondary">
                      {collaboration}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Help text */}
        <div className="bg-secondary/50 rounded-lg p-4 text-center">
          <p className="text-sm text-muted-foreground">
            💡 These preferences help hosts find creators that match their needs
          </p>
        </div>
      </div>
    </OnboardingStep>
  );
};