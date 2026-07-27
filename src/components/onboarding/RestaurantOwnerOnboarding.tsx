import React, { useEffect, useState } from 'react';
import { RestaurantWelcomeStep, RestaurantProfileData } from './steps/RestaurantWelcomeStep';
import { RestaurantDetailsStep, RestaurantDetails } from './steps/RestaurantDetailsStep';
import { RestaurantLaunchStep } from './steps/RestaurantLaunchStep';
import { useOnboarding } from '@/hooks/useOnboarding';
import { BadgeEarned } from './BadgeEarned';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

// Default operating hours for auto-listing
const DEFAULT_OPERATING_HOURS = {
  monday: { open: '11:00', close: '22:00', isClosed: false },
  tuesday: { open: '11:00', close: '22:00', isClosed: false },
  wednesday: { open: '11:00', close: '22:00', isClosed: false },
  thursday: { open: '11:00', close: '22:00', isClosed: false },
  friday: { open: '11:00', close: '23:00', isClosed: false },
  saturday: { open: '10:00', close: '23:00', isClosed: false },
  sunday: { open: '10:00', close: '21:00', isClosed: false },
};

// Default booking slots for auto-listing
const DEFAULT_BOOKING_SLOTS = [
  { time: '12:00', capacity: 4 },
  { time: '13:00', capacity: 4 },
  { time: '18:00', capacity: 4 },
  { time: '19:00', capacity: 4 },
  { time: '20:00', capacity: 4 },
];

export const RestaurantOwnerOnboarding: React.FC = () => {
  const [userId, setUserId] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [profileData, setProfileData] = useState<Partial<RestaurantProfileData>>({});
  const [detailsData, setDetailsData] = useState<Partial<RestaurantDetails>>({});
  
  const { updateStep, newlyEarnedBadge, dismissBadgeCelebration } = useOnboarding(userId);
  const { toast } = useToast();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUserId(data.user?.id ?? null));
  }, []);

  const totalSteps = 2; // Simplified to 2 steps

  const handleStep1Next = async (data: RestaurantProfileData) => {
    setProfileData(data);
    await updateStep(1, { profile: data });
    setCurrentStep(2);
  };

  const handleFinish = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // 1. Create restaurant_owners record with user.id as the primary key
      const { error: ownerError } = await supabase
        .from('restaurant_owners')
        .insert({
          id: user.id, // Critical: links to profiles table
          business_name: profileData.businessName || profileData.restaurantName || 'My Restaurant',
          verification_status: 'unverified', // Can verify later from dashboard
          verification_documents: []
        } as any);

      if (ownerError && ownerError.code !== '23505') { // Ignore duplicate key errors
        throw ownerError;
      }

      // 2. Create restaurant record with smart defaults for auto-listing
      const { data: restaurant, error: restaurantError } = await supabase
        .from('restaurants')
        .insert({
          owner_id: user.id, // Critical: links to restaurant_owners
          name: profileData.restaurantName || 'My Restaurant',
          description: profileData.description || '',
          address: profileData.address || '',
          city: profileData.city || '',
          state: profileData.state || '',
          country: profileData.country || 'United States',
          // Smart defaults for immediate listing
          cuisine_types: detailsData.cuisineTypes || ['American'],
          dining_style: detailsData.diningStyle || 'casual',
          price_range: detailsData.priceRange || '$$',
          dietary_options: detailsData.dietaryOptions || [],
          ambiance: detailsData.ambianceTags || [],
          meal_types: detailsData.mealTypes || ['Lunch', 'Dinner'],
          seating_capacity: detailsData.seatingCapacity || 50,
          has_outdoor_seating: detailsData.hasOutdoorSeating || false,
          has_private_dining: detailsData.hasPrivateDining || false,
          parking_available: detailsData.hasParking || false,
          operating_hours: detailsData.operatingHours || DEFAULT_OPERATING_HOURS,
          collaboration_types: detailsData.collaborationTypes || ['free_meal'],
          content_requirements: detailsData.contentRequirements || ['Instagram Post'],
          min_follower_count: detailsData.minFollowerCount || 0,
          paid_rate_min: detailsData.rateMin || null,
          paid_rate_max: detailsData.rateMax || null,
          booking_slots: detailsData.bookingSlots || DEFAULT_BOOKING_SLOTS,
          advance_booking_hours: detailsData.advanceBookingHours || 24,
          max_party_size: detailsData.maxPartySize || 6,
          is_active: true // Auto-listed immediately
        } as any)
        .select()
        .single();

      if (restaurantError) throw restaurantError;

      // 3. Upload profile photo if provided
      if (profileData.profilePhotoUrl && restaurant) {
        await supabase
          .from('restaurant_images')
          .insert({
            restaurant_id: restaurant.id,
            image_url: profileData.profilePhotoUrl,
            image_type: 'profile',
            is_primary: true,
            display_order: 0
          });
      }

      // 4. Update profile user_type
      await supabase
        .from('profiles')
        .update({ user_type: 'restaurant_owner' })
        .eq('id', user.id);

      toast({
        title: '🎉 Your restaurant is now live!',
        description: 'Creators can start discovering you immediately',
      });

      await updateStep(2, { completed: true });
    } catch (error: any) {
      console.error('Onboarding error:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to complete onboarding',
        variant: 'destructive',
      });
    }
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return <RestaurantWelcomeStep onNext={handleStep1Next} initialData={profileData} />;
      case 2:
        return (
          <RestaurantLaunchStep
            onNext={handleFinish}
            onPrevious={() => setCurrentStep(1)}
          />
        );
      default:
        return null;
    }
  };

  if (!userId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/5">
        <div className="container max-w-4xl mx-auto py-8 px-4">
          <div className="text-sm text-muted-foreground">Loading…</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/5">
      <div className="container max-w-4xl mx-auto py-8 px-4">
        {renderCurrentStep()}
      </div>

      {newlyEarnedBadge && (
        <BadgeEarned badge={newlyEarnedBadge} onDismiss={dismissBadgeCelebration} />
      )}
    </div>
  );
};
