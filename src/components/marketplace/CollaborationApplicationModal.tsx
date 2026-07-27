
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { Calendar, MapPin, Users, Home, Bath, Star, X, Crown, AlertCircle, CalendarIcon } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useSubscription } from '@/hooks/useSubscription';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { collaborationApplicationSchema } from '@/lib/validation/schemas';

interface Property {
  id: string;
  title: string;
  location: string;
  images: string[];
  rating: number;
  reviews: number;
  type: string;
  guests: number;
  bedrooms: number;
  bathrooms: number;
  pricePerNight: number;
  amenities: string[];
  contentRequirements: string[];
  collaborationType: string;
  isSuperhost: boolean;
  host: {
    name: string;
    avatar: string;
    responseRate: number;
    business?: string;
  };
  availableDates: string;
  description?: string;
  discount?: number;
}

interface CollaborationApplicationModalProps {
  property: Property | null;
  isOpen: boolean;
  onClose: () => void;
}

const CollaborationApplicationModal = ({ property, isOpen, onClose }: CollaborationApplicationModalProps) => {
  const navigate = useNavigate();
  const [applicationData, setApplicationData] = useState({
    proposalMessage: '',
    startDate: undefined as Date | undefined,
    endDate: undefined as Date | undefined,
    contentDeliverables: '',
    socialMediaHandles: '',
    followerCount: '',
    engagementRate: '',
    portfolioLinks: ''
  });
  const [loading, setLoading] = useState(false);
  const [pitchStatus, setPitchStatus] = useState<{ allowed: boolean; remaining: number | null; limit: number | null } | null>(null);
  const [checkingPitches, setCheckingPitches] = useState(false);
  const [existingApplication, setExistingApplication] = useState<{ id: string; status: string; created_at: string } | null>(null);
  const [checkingExisting, setCheckingExisting] = useState(false);
  const { toast } = useToast();
  const { canApplyToProperties, subscriptionStatus, loading: subscriptionLoading } = useSubscription();

  // Ensure subscription is truly ready (not just loading=false with null status)
  const isSubscriptionReady = !subscriptionLoading && subscriptionStatus !== null;

  // Check for existing application when modal opens
  React.useEffect(() => {
    const checkExistingApplication = async () => {
      if (!isOpen || !property) return;
      
      setCheckingExisting(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setCheckingExisting(false);
          return;
        }
        
        const { data: existing } = await supabase
          .from('applications')
          .select('id, status, created_at')
          .eq('property_id', property.id)
          .eq('influencer_id', user.id)
          .maybeSingle();
        
        setExistingApplication(existing);
      } catch (error) {
        console.error('Error checking existing application:', error);
      } finally {
        setCheckingExisting(false);
      }
    };
    
    checkExistingApplication();
  }, [isOpen, property?.id]);

  // Check pitch limits only after subscription is loaded
  React.useEffect(() => {
    const checkPitchLimit = async () => {
      // Wait for subscription to be ready before checking
      if (!isOpen || !isSubscriptionReady) {
        return;
      }
      
      // Premium override users get instant pass - no need to count pitches
      if (subscriptionStatus?.hasPremiumOverride || 
          subscriptionStatus?.plan?.maxPitchesPerMonth === -1) {
        setPitchStatus({ allowed: true, remaining: null, limit: null });
        setCheckingPitches(false);
        return;
      }
      
      setCheckingPitches(true);
      try {
        const status = await canApplyToProperties();
        setPitchStatus(status);
      } catch (error) {
        console.error('Error checking pitch limits:', error);
        // On error, allow the application to proceed
        setPitchStatus({ allowed: true, remaining: null, limit: null });
      } finally {
        setCheckingPitches(false);
      }
    };
    
    checkPitchLimit();
  }, [isOpen, isSubscriptionReady, subscriptionStatus, canApplyToProperties]);

  // Safety timeout: if loading takes more than 3 seconds, unblock with free-tier defaults
  const [timedOut, setTimedOut] = useState(false);
  useEffect(() => {
    if (!isOpen) {
      setTimedOut(false);
      return;
    }
    const timer = setTimeout(() => {
      setTimedOut(true);
      // If pitch status still not resolved, default to allowing
      if (!pitchStatus) {
        setPitchStatus({ allowed: true, remaining: 1, limit: 1 });
      }
    }, 3000);
    return () => clearTimeout(timer);
  }, [isOpen]);

  // Combined loading state - wait for subscription to truly be ready (or timeout)
  const isLoading = !timedOut && (!isSubscriptionReady || checkingPitches || checkingExisting);

  // Show message if already applied
  if (existingApplication && isOpen) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-blue-500" />
              Already Applied
            </DialogTitle>
          </DialogHeader>
          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="pt-6 space-y-3">
              <p className="text-sm text-blue-700">
                You've already submitted an application for <strong>{property?.title}</strong>.
              </p>
              <div className="text-sm text-blue-600 space-y-1">
                <p><strong>Status:</strong> <Badge variant="outline" className="capitalize">{existingApplication.status}</Badge></p>
                <p><strong>Submitted:</strong> {new Date(existingApplication.created_at).toLocaleDateString()}</p>
              </div>
              <Button onClick={onClose} className="w-full mt-4">
                Close
              </Button>
            </CardContent>
          </Card>
        </DialogContent>
      </Dialog>
    );
  }

  // Check subscription access - show limit reached message
  if (pitchStatus && !pitchStatus.allowed) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-amber-500" />
              Application Limit Reached
            </DialogTitle>
          </DialogHeader>
          <Card className="border-amber-200 bg-amber-50">
            <CardContent className="pt-6 space-y-4">
              <p className="text-sm text-amber-700">
                You've used your <strong>1 free application</strong> this month.
              </p>
              <p className="text-sm text-amber-600">
                Upgrade to Creator Pro for <strong>unlimited applications</strong> and unlock premium features like AI matching, verified badge, and advanced analytics.
              </p>
              <div className="rounded-md bg-amber-100 border border-amber-300 p-3">
                <p className="text-sm font-medium text-amber-800">
                  🎉 Use code <span className="font-bold tracking-wide">UPGRADE10</span> for 10% off your first month!
                </p>
              </div>
              <div className="flex gap-2">
                <Button 
                  onClick={() => { onClose(); window.location.href = '/subscription'; }}
                  size="sm"
                  className="bg-primary hover:bg-primary/90"
                >
                  <Crown className="h-4 w-4 mr-1" />
                  Upgrade to Pro — 10% Off
                </Button>
                <Button variant="outline" onClick={onClose} size="sm">
                  Close
                </Button>
              </div>
            </CardContent>
          </Card>
        </DialogContent>
      </Dialog>
    );
  }

  // Don't render if property is null
  if (!property) {
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setLoading(true);
    
    // 15-second submit timeout
    const timeoutId = setTimeout(() => {
      setLoading(false);
      toast({
        title: "Request Timed Out",
        description: "The submission took too long. Please try again.",
        variant: "destructive",
      });
    }, 15000);
    
    try {
      // Validate input data
      const validationResult = collaborationApplicationSchema.safeParse({
        proposal_message: applicationData.proposalMessage,
        proposed_dates_start: applicationData.startDate,
        proposed_dates_end: applicationData.endDate,
        content_deliverables: applicationData.contentDeliverables
      });

      if (!validationResult.success) {
        const firstError = validationResult.error.errors[0];
        toast({
          title: "Validation Error",
          description: firstError.message,
          variant: "destructive"
        });
        clearTimeout(timeoutId);
        setLoading(false);
        return;
      }

      const validData = validationResult.data;

      // Get current user
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) throw new Error('Not authenticated');

      // Create application with validated data
      const { data: applicationResult, error } = await supabase
        .from('applications')
        .insert({
          property_id: property.id,
          influencer_id: session.user.id,
          proposal_message: validData.proposal_message,
          proposed_dates_start: format(validData.proposed_dates_start, 'yyyy-MM-dd'),
          proposed_dates_end: validData.proposed_dates_end ? format(validData.proposed_dates_end, 'yyyy-MM-dd') : null,
          content_deliverables: validData.content_deliverables ? validData.content_deliverables.split(',').map(d => d.trim()) : [],
          status: 'pending'
        })
        .select()
        .single();

      if (error) throw error;

      clearTimeout(timeoutId);

      // Show success immediately and close
      toast({
        title: "Application Submitted!",
        description: `Your collaboration proposal for ${property.title} has been sent to the host.`,
      });
      onClose();

      // Fire-and-forget: send message to host in background and navigate to messages
      if (applicationResult && applicationData.proposalMessage.trim()) {
        const userId = session.user.id;
        const appId = applicationResult.id;
        const msg = applicationData.proposalMessage;
        supabase
          .from('properties')
          .select('host_id')
          .eq('id', property.id)
          .single()
          .then(({ data: propertyData }) => {
            if (propertyData?.host_id) {
              supabase.from('messages').insert({
                sender_id: userId,
                receiver_id: propertyData.host_id,
                content: `Hi! I've just submitted an application for your property "${property.title}". Here's my proposal:\n\n${msg}`,
                application_id: appId
              });
              // Navigate to messages with the host conversation pre-selected
              navigate(`/profile?tab=messages&conversation=${propertyData.host_id}`);
            }
          });
      }
    } catch (error: any) {
      clearTimeout(timeoutId);
      console.error('Error submitting application:', error);
      
      // Check for duplicate key error
      if (error?.code === '23505' || error?.message?.includes('duplicate key')) {
        toast({
          title: "Already Applied",
          description: "You've already submitted an application for this property.",
        });
        // Refresh to show the existing application view
        setExistingApplication({ id: '', status: 'pending', created_at: new Date().toISOString() });
      } else {
        toast({
          title: "Error",
          description: "Failed to submit application. Please try again.",
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setApplicationData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleDateChange = (field: 'startDate' | 'endDate', date: Date | undefined) => {
    setApplicationData(prev => ({
      ...prev,
      [field]: date
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-semibold">
            Apply for Collaboration
            {pitchStatus && pitchStatus.remaining !== null && pitchStatus.limit !== null && (
              <Badge variant="outline" className="ml-3 text-sm font-normal">
                {pitchStatus.remaining} of {pitchStatus.limit} applications left
              </Badge>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Property Details */}
          <div className="space-y-4">
            <div className="relative aspect-video rounded-lg overflow-hidden">
              <img 
                src={property.images[0]} 
                alt={property.title}
                className="w-full h-full object-cover"
              />
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold">{property.title}</h3>
                <div className="flex items-center space-x-1">
                  <Star className="w-4 h-4 fill-black text-foreground" />
                  <span className="text-sm font-medium">{property.rating}</span>
                  <span className="text-sm text-muted-foreground">({property.reviews})</span>
                </div>
              </div>
              
              <div className="flex items-center text-muted-foreground">
                <MapPin className="w-4 h-4 mr-1" />
                <span className="text-sm">{property.location}</span>
              </div>
              
              <div className="flex items-center space-x-4 text-muted-foreground text-sm">
                <div className="flex items-center">
                  <Users className="w-4 h-4 mr-1" />
                  {property.guests} guests
                </div>
                <div className="flex items-center">
                  <Home className="w-4 h-4 mr-1" />
                  {property.bedrooms} bed
                </div>
                <div className="flex items-center">
                  <Bath className="w-4 h-4 mr-1" />
                  {property.bathrooms} bath
                </div>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-medium">Collaboration Type</h4>
                <Badge variant="secondary">{property.collaborationType}</Badge>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-medium">Content Requirements</h4>
                <div className="flex flex-wrap gap-1">
                  {property.contentRequirements.map((req, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {req}
                    </Badge>
                  ))}
                </div>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-medium">Available Dates</h4>
                <p className="text-sm text-muted-foreground">{property.availableDates}</p>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-medium">Host</h4>
                <div className="flex items-center space-x-3">
                  <img 
                    src={property.host.avatar} 
                    alt={property.host.name}
                    className="w-10 h-10 rounded-full"
                  />
                  <div>
                    <p className="font-medium">{property.host.name}</p>
                    {property.host.business && (
                      <p className="text-sm text-muted-foreground">{property.host.business}</p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      {property.host.responseRate}% response rate
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Application Form */}
          <div className="space-y-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="proposalMessage">Proposal Message *</Label>
                <Textarea
                  id="proposalMessage"
                  placeholder="Tell the host why you'd be perfect for this collaboration..."
                  value={applicationData.proposalMessage}
                  onChange={(e) => handleInputChange('proposalMessage', e.target.value)}
                  rows={4}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Check-in Date *</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !applicationData.startDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {applicationData.startDate ? format(applicationData.startDate, "PPP") : "Select date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <CalendarComponent
                        mode="single"
                        selected={applicationData.startDate}
                        onSelect={(date) => handleDateChange('startDate', date)}
                        disabled={(date) => date < new Date()}
                        initialFocus
                        className="p-3 pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div>
                  <Label>Check-out Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !applicationData.endDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {applicationData.endDate ? format(applicationData.endDate, "PPP") : "Select date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <CalendarComponent
                        mode="single"
                        selected={applicationData.endDate}
                        onSelect={(date) => handleDateChange('endDate', date)}
                        disabled={(date) => date < new Date() || (applicationData.startDate && date <= applicationData.startDate)}
                        initialFocus
                        className="p-3 pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              <div>
                <Label htmlFor="contentDeliverables">Content Deliverables *</Label>
                <Textarea
                  id="contentDeliverables"
                  placeholder="Describe what content you'll create (e.g., 5 Instagram posts, 3 Stories, 1 Reel)"
                  value={applicationData.contentDeliverables}
                  onChange={(e) => handleInputChange('contentDeliverables', e.target.value)}
                  rows={3}
                  required
                />
              </div>

              <div>
                <Label htmlFor="socialMediaHandles">Social Media Handles *</Label>
                <Input
                  id="socialMediaHandles"
                  placeholder="@yourusername on Instagram, TikTok, etc."
                  value={applicationData.socialMediaHandles}
                  onChange={(e) => handleInputChange('socialMediaHandles', e.target.value)}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="followerCount">Total Followers</Label>
                  <Input
                    id="followerCount"
                    type="number"
                    placeholder="10000"
                    value={applicationData.followerCount}
                    onChange={(e) => handleInputChange('followerCount', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="engagementRate">Engagement Rate (%)</Label>
                  <Input
                    id="engagementRate"
                    type="number"
                    step="0.1"
                    placeholder="3.5"
                    value={applicationData.engagementRate}
                    onChange={(e) => handleInputChange('engagementRate', e.target.value)}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="portfolioLinks">Portfolio Links</Label>
                <Input
                  id="portfolioLinks"
                  placeholder="Links to your best work"
                  value={applicationData.portfolioLinks}
                  onChange={(e) => handleInputChange('portfolioLinks', e.target.value)}
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <Button type="button" variant="outline" onClick={onClose} className="flex-1">
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={loading || isLoading || !applicationData.proposalMessage.trim() || !applicationData.startDate || (pitchStatus !== null && !pitchStatus.allowed)}
                  className="flex-1 bg-brand-green hover:bg-brand-green/90"
                >
                  {loading ? 'Submitting...' : isLoading ? 'Checking...' : 'Submit Application'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CollaborationApplicationModal;
