import { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { brandCampaignSchema, type BrandCampaignFormData } from '@/lib/validation/brandCampaignSchema';
import { useCreateBrandCampaign } from '@/hooks/useBrandCampaignMutations';
import { Checkbox } from '@/components/ui/checkbox';
import { ChevronLeft, ChevronRight, Upload, X, Image as ImageIcon } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface CreateBrandCampaignModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  brandProfile: {
    brand_name?: string;
    logo_url?: string;
    website?: string;
    description?: string;
  };
}

const NICHES = [
  'Fashion', 'Beauty', 'Fitness', 'Food', 'Travel', 'Tech', 'Lifestyle',
  'Gaming', 'Music', 'Art', 'Photography', 'Sports', 'Business', 'Education'
];

const PLATFORMS = ['Instagram', 'TikTok', 'YouTube', 'Twitter/X', 'Facebook'];

const DELIVERABLES = [
  'Instagram Post', 'Instagram Story', 'Instagram Reel', 'TikTok Video',
  'YouTube Video', 'YouTube Short', 'Blog Post', 'Tweet/Thread'
];

export const CreateBrandCampaignModal = ({ open, onOpenChange, brandProfile }: CreateBrandCampaignModalProps) => {
  const [step, setStep] = useState(1);
  const [isUploading, setIsUploading] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const createCampaign = useCreateBrandCampaign();

  const form = useForm<BrandCampaignFormData>({
    resolver: zodResolver(brandCampaignSchema),
    defaultValues: {
      campaign_title: '',
      campaign_description: '',
      campaign_brief_url: '',
      required_niches: [],
      required_platforms: [],
      min_followers: 1000,
      deliverables: [],
      content_requirements: [],
      compensation_type: 'paid',
      currency: 'usd',
      spots_available: 1,
      visibility: 'public',
      status: 'open',
      campaign_image_url: '',
    },
  });

  const handleImageUpload = async (file: File) => {
    if (!file) return;

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Please upload a valid image file (JPEG, PNG, WebP, or GIF)');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be less than 5MB');
      return;
    }

    setIsUploading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('You must be logged in to upload images');
        return;
      }

      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('campaign-images')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('campaign-images')
        .getPublicUrl(fileName);

      form.setValue('campaign_image_url', publicUrl);
      setImagePreview(publicUrl);
      toast.success('Image uploaded successfully');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload image');
    } finally {
      setIsUploading(false);
    }
  };

  const removeImage = () => {
    form.setValue('campaign_image_url', '');
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const onSubmit = async (data: BrandCampaignFormData) => {
    const submitData: any = {
      campaign_title: data.campaign_title,
      campaign_description: data.campaign_description,
      campaign_brief_url: data.campaign_brief_url || undefined,
      brand_name: brandProfile.brand_name || 'Your Brand',
      brand_logo_url: brandProfile.logo_url || undefined,
      brand_website: brandProfile.website || undefined,
      brand_description: brandProfile.description || undefined,
      required_niches: data.required_niches,
      required_platforms: data.required_platforms,
      min_followers: data.min_followers,
      max_followers: data.max_followers,
      min_engagement_rate: data.min_engagement_rate,
      deliverables: data.deliverables,
      content_requirements: data.content_requirements,
      timeline_start: data.timeline_start?.toISOString(),
      timeline_end: data.timeline_end?.toISOString(),
      application_deadline: data.application_deadline?.toISOString(),
      compensation_type: data.compensation_type,
      budget_min: data.budget_min,
      budget_max: data.budget_max,
      product_value: data.product_value,
      currency: data.currency,
      spots_available: data.spots_available,
      visibility: data.visibility,
      expires_at: data.expires_at?.toISOString(),
      status: data.status,
      campaign_image_url: data.campaign_image_url || undefined,
    };

    await createCampaign.mutateAsync(submitData);
    onOpenChange(false);
    form.reset();
    setStep(1);
    setImagePreview(null);
  };

  const nextStep = async () => {
    setIsNavigating(true);
    try {
      const fields = getStepFields(step);
      const isValid = await form.trigger(fields);

      // Extra guard: ensure cross-field rule is enforced during step navigation
      if (step === 4) {
        const compensationType = form.getValues('compensation_type');
        const budgetMin = form.getValues('budget_min');

        if ((compensationType === 'paid' || compensationType === 'hybrid') && (!budgetMin || budgetMin <= 0)) {
          form.setError('budget_min', { message: 'Budget minimum is required for paid campaigns' });
          return;
        }
      }

      if (isValid) setStep((s) => Math.min(5, s + 1));
    } finally {
      setIsNavigating(false);
    }
  };

  const getStepFields = (currentStep: number): (keyof BrandCampaignFormData)[] => {
    switch (currentStep) {
      case 1: return ['campaign_title', 'campaign_description'];
      case 2: return ['required_niches', 'required_platforms', 'min_followers'];
      case 3: return ['deliverables'];
      case 4: {
        const compensationType = form.getValues('compensation_type');
        if (compensationType === 'paid' || compensationType === 'hybrid') {
          return ['compensation_type', 'budget_min'];
        }
        return ['compensation_type'];
      }
      case 5: return ['spots_available'];
      default: return [];
    }
  };

  const handleFinalSubmit = async () => {
    // Safety: never create a campaign unless the user is on Step 5
    if (step !== 5) {
      setStep(5);
      return;
    }

    setIsNavigating(true);
    try {
      // Validate the entire form (runs schema refinements too)
      const isFormValid = await form.trigger();
      if (!isFormValid) {
        toast.error('Please complete all required fields before creating the campaign.');
        return;
      }

      await form.handleSubmit(onSubmit)();
    } catch (error) {
      // Errors are surfaced via the mutation's onError toast
    } finally {
      setIsNavigating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Campaign - Step {step} of 5</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
            {step === 1 && (
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="campaign_title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Campaign Title *</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Summer Fashion Campaign 2024" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="campaign_description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Campaign Description *</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Describe your campaign, goals, and what you're looking for in creators..."
                          className="min-h-[120px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="campaign_brief_url"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Campaign Brief URL (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="https://..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="required_niches"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Required Niches *</FormLabel>
                      <div className="grid grid-cols-2 gap-3">
                        {NICHES.map((niche) => (
                          <div key={niche} className="flex items-center space-x-2">
                            <Checkbox
                              checked={field.value?.includes(niche)}
                              onCheckedChange={(checked) => {
                                const current = field.value || [];
                                field.onChange(
                                  checked
                                    ? [...current, niche]
                                    : current.filter((v) => v !== niche)
                                );
                              }}
                            />
                            <label className="text-sm">{niche}</label>
                          </div>
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="required_platforms"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Required Platforms *</FormLabel>
                      <div className="grid grid-cols-2 gap-3">
                        {PLATFORMS.map((platform) => (
                          <div key={platform} className="flex items-center space-x-2">
                            <Checkbox
                              checked={field.value?.includes(platform)}
                              onCheckedChange={(checked) => {
                                const current = field.value || [];
                                field.onChange(
                                  checked
                                    ? [...current, platform]
                                    : current.filter((v) => v !== platform)
                                );
                              }}
                            />
                            <label className="text-sm">{platform}</label>
                          </div>
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="min_followers"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Minimum Followers *</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="max_followers"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Maximum Followers</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            value={field.value || ''}
                            onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="deliverables"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Deliverables *</FormLabel>
                      <div className="grid grid-cols-2 gap-3">
                        {DELIVERABLES.map((deliverable) => (
                          <div key={deliverable} className="flex items-center space-x-2">
                            <Checkbox
                              checked={field.value?.includes(deliverable)}
                              onCheckedChange={(checked) => {
                                const current = field.value || [];
                                field.onChange(
                                  checked
                                    ? [...current, deliverable]
                                    : current.filter((v) => v !== deliverable)
                                );
                              }}
                            />
                            <label className="text-sm">{deliverable}</label>
                          </div>
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="timeline_start"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Timeline Start</FormLabel>
                        <FormControl>
                          <Input 
                            type="date" 
                            value={field.value ? new Date(field.value).toISOString().split('T')[0] : ''}
                            onChange={(e) => field.onChange(e.target.value ? new Date(e.target.value) : undefined)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="timeline_end"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Timeline End</FormLabel>
                        <FormControl>
                          <Input 
                            type="date"
                            value={field.value ? new Date(field.value).toISOString().split('T')[0] : ''}
                            onChange={(e) => field.onChange(e.target.value ? new Date(e.target.value) : undefined)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="application_deadline"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Application Deadline</FormLabel>
                      <FormControl>
                        <Input 
                          type="date"
                          value={field.value ? new Date(field.value).toISOString().split('T')[0] : ''}
                          onChange={(e) => field.onChange(e.target.value ? new Date(e.target.value) : undefined)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            {step === 4 && (
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="compensation_type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Compensation Type *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select compensation type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="paid">Paid</SelectItem>
                          <SelectItem value="product">Product/Gift</SelectItem>
                          <SelectItem value="hybrid">Hybrid (Paid + Product)</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {(form.watch('compensation_type') === 'paid' || form.watch('compensation_type') === 'hybrid') && (
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="budget_min"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Budget Min ($) *</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              value={field.value || ''}
                              onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="budget_max"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Budget Max ($)</FormLabel>
                          <FormControl>
                            <Input 
                              type="number"
                              value={field.value || ''}
                              onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}

                {(form.watch('compensation_type') === 'product' || form.watch('compensation_type') === 'hybrid') && (
                  <FormField
                    control={form.control}
                    name="product_value"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Product Value ($)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number"
                            value={field.value || ''}
                            onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </div>
            )}

            {step === 5 && (
              <div className="space-y-4">
                {/* Campaign Cover Image */}
                <div className="space-y-2">
                  <FormLabel>Campaign Cover Image</FormLabel>
                  <div className="border-2 border-dashed border-border rounded-lg p-4">
                    {imagePreview ? (
                      <div className="relative">
                        <img 
                          src={imagePreview} 
                          alt="Campaign preview" 
                          className="w-full h-48 object-cover rounded-lg"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="absolute top-2 right-2"
                          onClick={removeImage}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ) : (
                      <div 
                        className="flex flex-col items-center justify-center h-48 cursor-pointer hover:bg-muted/50 rounded-lg transition-colors"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        {isUploading ? (
                          <div className="flex flex-col items-center gap-2">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
                            <p className="text-sm text-muted-foreground">Uploading...</p>
                          </div>
                        ) : (
                          <>
                            <ImageIcon className="w-12 h-12 text-muted-foreground mb-2" />
                            <p className="text-sm text-muted-foreground">Click to upload a cover image</p>
                            <p className="text-xs text-muted-foreground">JPEG, PNG, WebP or GIF (max 5MB)</p>
                          </>
                        )}
                      </div>
                    )}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/gif"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleImageUpload(file);
                      }}
                    />
                  </div>
                </div>

                <FormField
                  control={form.control}
                  name="spots_available"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Number of Spots Available *</FormLabel>
                      <FormControl>
                        <Input 
                          type="number"
                          min={1}
                          max={100}
                          value={field.value}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="visibility"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Visibility</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="public">Public (visible to all creators)</SelectItem>
                          <SelectItem value="private">Private (invite only)</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Campaign Status</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="open">Open (publish immediately)</SelectItem>
                          <SelectItem value="draft">Draft (save for later)</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            <div className="flex justify-between pt-4">
              {step > 1 && (
                <Button type="button" variant="outline" onClick={() => setStep(step - 1)}>
                  <ChevronLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
              )}
              {step < 5 ? (
                <Button type="button" onClick={nextStep} disabled={isNavigating} className="ml-auto">
                  Next
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Button
                  type="button"
                  onClick={handleFinalSubmit}
                  disabled={isNavigating || createCampaign.isPending}
                  className="ml-auto"
                >
                  {createCampaign.isPending ? 'Creating...' : 'Create Campaign'}
                </Button>
              )}
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
