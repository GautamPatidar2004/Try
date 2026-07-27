import { useState ,useEffect} from 'react';
import { ContactFormData } from '../types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { Send, Upload,Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';

interface PortfolioContactProps {
  creatorName: string;
  influencerId:string;
  
}
interface EntityOption {
  id: string;
  label: string;
}
export const PortfolioContact = ({ creatorName,influencerId }: PortfolioContactProps) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<ContactFormData>({
    name: '',
    brandName: '',
    email: '',
    budget: '',
    timeline: '',
    projectDescription: '',
    files: []
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof ContactFormData, string>>>({});
   // Current user state
   const [currentUserId, setCurrentUserId] = useState('');
   const [inviteType, setInviteType] = useState<'brand' | 'property' | null>(null);
 
   // Entity (property ya campaign) dropdown
   const [entityOptions, setEntityOptions] = useState<EntityOption[]>([]);
   const [selectedEntityId, setSelectedEntityId] = useState('');
   const [loadingEntities, setLoadingEntities] = useState(false);
 
   // Duplicate check
   const [alreadyInvited, setAlreadyInvited] = useState(false);



  
  useEffect(() => {
    const fetchCurrentUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;

      setCurrentUserId(session.user.id);

      const { data: profile } = await supabase
        .from('profiles')
        .select('user_type')
        .eq('id', session.user.id)
        .maybeSingle();

      if (profile?.user_type === 'host') {
        setInviteType('property');
      } else if (profile?.user_type === 'brand') {
        setInviteType('brand');
      }
    };

    fetchCurrentUser();
  }, []);
 
 
  
  useEffect(() => {
    if (!currentUserId || !inviteType) return;

    setLoadingEntities(true);
    setSelectedEntityId('');
    setEntityOptions([]);
    
    if (inviteType === 'property') {
      supabase
        .from('properties')
        .select('id, title')
        .eq('host_id', currentUserId)
        .then(({ data, error }) => {
          if (!error && data) {
            setEntityOptions(data.map((p) => ({ id: p.id, label: p.title })));
          }
          setLoadingEntities(false);
        });
    } else {
      supabase
        .from('brand_campaigns')
        .select('id, campaign_title')
        .eq('created_by', currentUserId)
        .eq('status', 'open')
        .then(({ data, error }) => {
          if (!error && data) {
            setEntityOptions(data.map((c) => ({ id: c.id, label: c.campaign_title })));
          }
          setLoadingEntities(false);
        });
    }
  }, [currentUserId, inviteType]);

  useEffect(() => {
    if (!selectedEntityId || !influencerId || !inviteType) return;

    const checkDuplicate = async () => {
      if (inviteType === 'brand') {
        const { data } = await supabase
          .from('brand_campaign_applications')
          .select('id')
          .eq('campaign_id', selectedEntityId)
          .eq('influencer_id', influencerId)
          .maybeSingle();
        setAlreadyInvited(!!data);
      } else {
        const { data } = await supabase
          .from('applications')
          .select('id')
          .eq('property_id', selectedEntityId)
          .eq('influencer_id', influencerId)
          .maybeSingle();
        setAlreadyInvited(!!data);
      }
    };

    checkDuplicate();
  }, [selectedEntityId, influencerId, inviteType]);
  const validateForm = () => {
    const newErrors: Partial<Record<keyof ContactFormData, string>> = {};

    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.brandName.trim()) newErrors.brandName = 'Brand/Restaurant name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }
    if (!formData.projectDescription.trim()) {
      newErrors.projectDescription = 'Project description is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    if (!selectedEntityId) {
      toast({
        title: 'Selection Required',
        description: `Please select a ${inviteType === 'brand' ? 'campaign' : 'property'} to invite for.`,
        variant: 'destructive',
      });
      return;
    }

    if (!currentUserId) {
      toast({ title: 'Error', description: 'Please log in to send an invite.', variant: 'destructive' });
      return;
    }

    if (alreadyInvited) {
      toast({ title: 'Already Invited', description: `${creatorName} has already been invited or applied.` });
      return;
    }

    setIsSubmitting(true);

    try {
      const inviteMessage = [
        formData.projectDescription.trim(),
        formData.budget ? `Budget: ${formData.budget}` : null,
        formData.timeline ? `Timeline: ${formData.timeline}` : null,
      ]
        .filter(Boolean)
        .join('\n\n');

      if (inviteType === 'brand') {
       
        const {data, error } = await supabase
          .from('brand_campaign_applications')
          .insert({
            campaign_id: selectedEntityId,
            influencer_id: influencerId,
            cover_letter: inviteMessage,
            initiated_by: 'brand',
            status: 'pending',
            follower_count_snapshot: 0,
            engagement_rate_snapshot: 0,
          });

        if (error) throw error;
      } else {
     
        const {data, error } = await supabase
          .from('applications')
          .insert({
            property_id: selectedEntityId,
            influencer_id: influencerId,
            proposal_message: inviteMessage,
            initiated_by: 'host',
            status: 'pending',
            content_deliverables: [],
          });

        if (error) throw error;
        console.log("error ",error)
      }

      const entityLabel = entityOptions.find((e) => e.id === selectedEntityId)?.label || '';
      const messageContent = [
        `Hi ${creatorName}! I'm ${formData.name} from ${formData.brandName}.`,
        `I'd like to invite you to collaborate on "${entityLabel}".`,
        '',
        inviteMessage,
        '',
        `You can reach me at: ${formData.email}`,
      ].join('\n');

      await supabase.from('messages').insert({
        sender_id: currentUserId,
        receiver_id: influencerId,
        content: messageContent,
      });

      toast({
        title: 'Inquiry Sent!',
        description: `${creatorName} typically responds within 24-48 hours. Check your email for updates.`,
      });

      // Form reset
      setFormData({
        name: '',
        brandName: '',
        email: '',
        budget: '',
        timeline: '',
        projectDescription: '',
        files: [],
      });
      setSelectedEntityId('');
      setAlreadyInvited(true);

     
      navigate(`/profile?tab=messages&conversation=${influencerId}`);
    } catch (err: any) {
      console.error(err);
      if (err?.code === '23505' || err?.message?.includes('duplicate key')) {
        toast({
          title: 'Already Invited',
          description: `${creatorName} has already been invited or applied to this ${inviteType === 'brand' ? 'campaign' : 'property'}.`,
        });
        setAlreadyInvited(true);
      } else {
        toast({
          title: 'Error',
          description: 'Failed to send inquiry. Please try again.',
          variant: 'destructive',
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof ContactFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Get in Touch</CardTitle>
          <CardDescription>
          {alreadyInvited
              ? `You've already sent an invite to ${creatorName}.`
         
              : ` Fill out the form below and ${creatorName} will get back to you within 24-48 hours.`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">

            {/* Property / Campaign Dropdown */}
            <div className="space-y-2">
              <Label>
                {inviteType === 'brand' ? 'Select Campaign *' : 'Select Property *'}
              </Label>
              {loadingEntities ? (
                <div className="flex items-center gap-2 text-muted-foreground text-sm py-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Loading your {inviteType === 'brand' ? 'campaigns' : 'properties'}...
                </div>
              ) : (
                <Select value={selectedEntityId} onValueChange={setSelectedEntityId}>
                  <SelectTrigger>
                    <SelectValue
                      placeholder={`Choose a ${inviteType === 'brand' ? 'campaign' : 'property'}`}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {entityOptions.length > 0 ? (
                      entityOptions.map((opt) => (
                        <SelectItem key={opt.id} value={opt.id}>
                          {opt.label}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="__none__" disabled>
                        No {inviteType === 'brand' ? 'active campaigns' : 'properties'} found
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              )}

              {/* Already invited warning */}
              {alreadyInvited && selectedEntityId && (
                <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded px-3 py-2">
                  {creatorName} has already been invited or applied to this{' '}
                  {inviteType === 'brand' ? 'campaign' : 'property'}.
                </p>
              )}
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Your Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="John Doe"
                  className={errors.name ? 'border-red-500' : ''}
                />
                {errors.name && (
                  <p className="text-xs text-red-500">{errors.name}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="brandName">Brand/Restaurant Name *</Label>
                <Input
                  id="brandName"
                  value={formData.brandName}
                  onChange={(e) => handleInputChange('brandName', e.target.value)}
                  placeholder="The Rooftop Cafe"
                  className={errors.brandName ? 'border-red-500' : ''}
                />
                {errors.brandName && (
                  <p className="text-xs text-red-500">{errors.brandName}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="john@example.com"
                className={errors.email ? 'border-red-500' : ''}
              />
              {errors.email && (
                <p className="text-xs text-red-500">{errors.email}</p>
              )}
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="budget">Budget Range (Optional)</Label>
                <Select
                  value={formData.budget}
                  onValueChange={(value) => handleInputChange('budget', value)}
                >
                  <SelectTrigger id="budget">
                    <SelectValue placeholder="Select budget" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="under-500">Under $500</SelectItem>
                    <SelectItem value="500-1000">$500 - $1,000</SelectItem>
                    <SelectItem value="1000-2500">$1,000 - $2,500</SelectItem>
                    <SelectItem value="2500-5000">$2,500 - $5,000</SelectItem>
                    <SelectItem value="5000-plus">$5,000+</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="timeline">Ideal Timeline (Optional)</Label>
                <Input
                  id="timeline"
                  value={formData.timeline}
                  onChange={(e) => handleInputChange('timeline', e.target.value)}
                  placeholder="e.g., Next 2 weeks"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Project Description *</Label>
              <Textarea
                id="description"
                value={formData.projectDescription}
                onChange={(e) => handleInputChange('projectDescription', e.target.value)}
                placeholder="Tell us about your collaboration idea, goals, and any specific requirements..."
                rows={6}
                className={errors.projectDescription ? 'border-red-500' : ''}
              />
              {errors.projectDescription && (
                <p className="text-xs text-red-500">{errors.projectDescription}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="files">Attachments (Optional)</Label>
              <div className="border-2 border-dashed rounded-lg p-8 text-center hover:border-primary transition-colors cursor-pointer">
                <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground mb-1">
                  Click to upload or drag and drop
                </p>
                <p className="text-xs text-muted-foreground">
                  PDF, PNG, JPG up to 10MB
                </p>
              </div>
            </div>

            <Button
              type="submit"
              size="lg"
              className="w-full"
              disabled={isSubmitting || alreadyInvited  || !selectedEntityId}
            >
              {isSubmitting ? (
                <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Sending...
              </>
                  ) : alreadyInvited ? (
                'Invite Already Sent'
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Submit Inquiry
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
