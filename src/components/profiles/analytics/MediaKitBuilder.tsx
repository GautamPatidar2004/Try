import { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight, Save, Loader2, FileText, Eye } from 'lucide-react';
import { MediaKitBuilderSidebar } from './MediaKitBuilderSidebar';
import { HeroProfileStep } from './media-kit-steps/HeroProfileStep';
import { AboutYouStep } from './media-kit-steps/AboutYouStep';
import { ServicesRatesStep, ServiceItem } from './media-kit-steps/ServicesRatesStep';
import { DeliverablesStep } from './media-kit-steps/DeliverablesStep';
import { PortfolioStep } from './media-kit-steps/PortfolioStep';
import { BrandCollabsStep, BrandCollab } from './media-kit-steps/BrandCollabsStep';
import { useMediaKit, MediaKitConfig } from '@/hooks/useMediaKit';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const DEFAULT_DELIVERABLES = [
  '2–3 vertical short-form videos (walkthrough, amenities, lifestyle POV)',
  '5–8 short clips or photos for listing use',
  '3–6 Instagram stories tagging the property',
  'Content usage rights for organic reposting',
];

export interface BuilderState {
  name: string;
  tagline: string;
  coverPhotoUrl: string;
  profilePhotoUrl: string;
  bio: string;
  location: string;
  languages: string[];
  specialties: string[];
  services: ServiceItem[];
  deliverables: string[];
  portfolioUrls: string[];
  brandCollabs: BrandCollab[];
}

interface MediaKitBuilderProps {
  userId: string;
  onBack: () => void;
  defaultName?: string;
  defaultBio?: string;
  defaultAvatarUrl?: string;
}

export const MediaKitBuilder = ({ userId, onBack, defaultName, defaultBio, defaultAvatarUrl }: MediaKitBuilderProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();
  const { generateMediaKit, isGenerating } = useMediaKit(userId);

  const [state, setState] = useState<BuilderState>({
    name: defaultName || '',
    tagline: '',
    coverPhotoUrl: '',
    profilePhotoUrl: defaultAvatarUrl || '',
    bio: defaultBio || '',
    location: '',
    languages: ['English'],
    specialties: [],
    services: [],
    deliverables: DEFAULT_DELIVERABLES,
    portfolioUrls: [],
    brandCollabs: [],
  });

  // Pre-populate from profile
  useEffect(() => {
    const fetchProfile = async () => {
      const { data: profile } = await supabase
        .from('profiles')
        .select('*, influencers(*)')
        .eq('id', userId)
        .single();
      if (profile) {
        setState(prev => ({
          ...prev,
          name: prev.name || `${profile.first_name || ''} ${profile.last_name || ''}`.trim(),
          bio: prev.bio || profile.bio || '',
          profilePhotoUrl: prev.profilePhotoUrl || profile.profile_photo_url || '',
          location: prev.location || profile.location || '',
          specialties: prev.specialties.length ? prev.specialties : (profile.influencers?.content_niches || []),
        }));
      }
    };
    fetchProfile();
  }, [userId]);

  const completedSteps = useMemo(() => {
    const completed = new Set<number>();
    if (state.name) completed.add(0);
    if (state.bio) completed.add(1);
    if (state.services.length > 0) completed.add(2);
    if (state.deliverables.length > 0) completed.add(3);
    if (state.portfolioUrls.length > 0) completed.add(4);
    if (state.brandCollabs.length > 0) completed.add(5);
    return completed;
  }, [state]);

  const updateState = (partial: Partial<BuilderState>) => {
    setState(prev => ({ ...prev, ...partial }));
  };

  const handleSaveDraft = async () => {
    setSaving(true);
    try {
      const { error } = await supabase.from('media_kits').insert([{
        influencer_id: userId,
        title: `${state.name || 'My'}'s Media Kit`,
        bio: state.bio,
        pdf_url: '',
        builder_config: state as any,
        rate_card: { services: state.services, deliverables: state.deliverables, brandCollabs: state.brandCollabs } as any,
        last_generated_at: new Date().toISOString(),
      }]);
      if (error) throw error;
      toast({ title: 'Draft Saved', description: 'Your media kit draft has been saved.' });
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const handleGenerate = async () => {
    const config: MediaKitConfig = {
      bio: state.bio,
      deliverables: state.deliverables,
      featuredPhotos: state.portfolioUrls,
      coverPhotoUrl: state.coverPhotoUrl,
      profilePhotoUrl: state.profilePhotoUrl,
      tagline: state.tagline,
      location: state.location,
      languages: state.languages,
      specialties: state.specialties,
      services: state.services,
      brandCollabs: state.brandCollabs,
    };
    await generateMediaKit(config);
    onBack();
  };

  const totalSteps = 6;

  const renderStep = () => {
    switch (currentStep) {
      case 0: return <HeroProfileStep data={{ name: state.name, tagline: state.tagline, coverPhotoUrl: state.coverPhotoUrl, profilePhotoUrl: state.profilePhotoUrl }} onChange={updateState} userId={userId} />;
      case 1: return <AboutYouStep data={{ bio: state.bio, location: state.location, languages: state.languages, specialties: state.specialties }} onChange={updateState} />;
      case 2: return <ServicesRatesStep services={state.services} onChange={(services) => updateState({ services })} />;
      case 3: return <DeliverablesStep deliverables={state.deliverables} onChange={(deliverables) => updateState({ deliverables })} />;
      case 4: return <PortfolioStep portfolioUrls={state.portfolioUrls} onChange={(portfolioUrls) => updateState({ portfolioUrls })} userId={userId} />;
      case 5: return <BrandCollabsStep collabs={state.brandCollabs} onChange={(brandCollabs) => updateState({ brandCollabs })} />;
      default: return null;
    }
  };

  return (
    <div className="min-h-[600px] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border pb-4 mb-0">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h2 className="text-xl font-bold">Media Kit Builder</h2>
            <p className="text-sm text-muted-foreground">Step {currentStep + 1} of {totalSteps}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleSaveDraft} disabled={saving}>
            {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
            Save Draft
          </Button>
          <Button size="sm" onClick={handleGenerate} disabled={isGenerating}>
            {isGenerating ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <FileText className="h-4 w-4 mr-2" />}
            Generate PDF
          </Button>
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-1">
        <MediaKitBuilderSidebar
          currentStep={currentStep}
          completedSteps={completedSteps}
          onStepClick={setCurrentStep}
        />

        <div className="flex-1 p-6 overflow-y-auto">
          <div className="max-w-xl">
            {renderStep()}

            {/* Navigation */}
            <div className="flex justify-between mt-8 pt-4 border-t border-border">
              <Button
                variant="outline"
                onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
                disabled={currentStep === 0}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Previous
              </Button>
              {currentStep < totalSteps - 1 ? (
                <Button onClick={() => setCurrentStep(currentStep + 1)}>
                  Next Step
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              ) : (
                <Button onClick={handleGenerate} disabled={isGenerating}>
                  {isGenerating ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <FileText className="h-4 w-4 mr-2" />}
                  Generate Media Kit
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
