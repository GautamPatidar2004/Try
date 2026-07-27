import React, { useState } from 'react';
import { User } from '@supabase/supabase-js';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Building2, ArrowRight, ArrowLeft } from 'lucide-react';

interface HostBusinessStepProps {
  user: User | null;
  onNext: (data: any) => void;
  onPrevious: () => void;
  onExit: () => void;
  currentStep: number;
  totalSteps: number;
}

export const HostBusinessStep: React.FC<HostBusinessStepProps> = ({
  user,
  onNext,
  onPrevious,
  onExit,
  currentStep,
  totalSteps
}) => {
  const [loading, setLoading] = useState(false);
  const [businessData, setBusinessData] = useState({
    business_name: '',
    min_follower_count: 1000,
    preferred_collaboration_types: [] as string[],
    verification_status: 'unverified'
  });
  const { toast } = useToast();

  const collaborationTypes = [
    'Paid Stays',
    'Content Creation',
    'Social Media Posts',
    'Photography',
    'Video Content',
    'Event Hosting',
    'Long-term Partnerships'
  ];

  const handleCollaborationTypeChange = (type: string, checked: boolean) => {
    setBusinessData(prev => ({
      ...prev,
      preferred_collaboration_types: checked
        ? [...prev.preferred_collaboration_types, type]
        : prev.preferred_collaboration_types.filter(t => t !== type)
    }));
  };

  const handleSubmit = async () => {
    if (!user || !businessData.business_name) {
      toast({
        title: "Missing Information",
        description: "Please fill in your business name.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      // Update host profile with business information
      const { error: hostError } = await supabase
        .from('hosts')
        .update({
          business_name: businessData.business_name,
          min_follower_count: businessData.min_follower_count,
          preferred_collaboration_types: businessData.preferred_collaboration_types,
          verification_status: businessData.verification_status
        })
        .eq('id', user.id);

      if (hostError) throw hostError;

      toast({
        title: "Business Details Saved!",
        description: "Your hosting preferences have been configured.",
      });

      onNext(businessData);
    } catch (error: any) {
      console.error('Error updating host profile:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to save business details. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Card className="border-0 shadow-xl bg-background/80 backdrop-blur-sm">
        <CardHeader className="text-center pb-6">
          <div className="flex justify-center mb-4">
            <div className="p-3 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 text-white">
              <Building2 className="w-8 h-8" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">Business Details</CardTitle>
          <p className="text-muted-foreground">
            Tell us about your hosting business and collaboration preferences
          </p>
        </CardHeader>

        <CardContent className="space-y-6">
          <div>
            <Label htmlFor="business_name">Business/Property Name *</Label>
            <Input
              id="business_name"
              value={businessData.business_name}
              onChange={(e) => setBusinessData(prev => ({ ...prev, business_name: e.target.value }))}
              placeholder="Sunset Villa Properties"
              required
            />
            <p className="text-sm text-muted-foreground mt-1">
              This is how creators will identify your business
            </p>
          </div>

          <div>
            <Label htmlFor="min_follower_count">Minimum Follower Count</Label>
            <Input
              id="min_follower_count"
              type="number"
              value={businessData.min_follower_count}
              onChange={(e) => setBusinessData(prev => ({ ...prev, min_follower_count: parseInt(e.target.value) || 0 }))}
              placeholder="1000"
              min="0"
            />
            <p className="text-sm text-muted-foreground mt-1">
              Minimum social media followers for collaboration partners
            </p>
          </div>

          <div>
            <Label>Preferred Collaboration Types</Label>
            <p className="text-sm text-muted-foreground mb-3">
              Select the types of collaborations you're interested in
            </p>
            <div className="grid grid-cols-2 gap-3">
              {collaborationTypes.map((type) => (
                <div key={type} className="flex items-center space-x-2">
                  <Checkbox
                    id={type}
                    checked={businessData.preferred_collaboration_types.includes(type)}
                    onCheckedChange={(checked) => handleCollaborationTypeChange(type, checked as boolean)}
                  />
                  <Label htmlFor={type} className="text-sm font-normal">
                    {type}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-between pt-4">
            <Button
              variant="outline"
              onClick={onPrevious}
              disabled={loading}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Previous
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={loading}
              className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  Continue
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};