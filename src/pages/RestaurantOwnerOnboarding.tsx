import React from 'react';
import { RestaurantOwnerOnboarding } from '@/components/onboarding/RestaurantOwnerOnboarding';
import { SEO } from '@/components/SEO';

const RestaurantOwnerOnboardingPage = () => {
  return (
    <>
      <SEO 
        title="Restaurant Owner Onboarding" 
        description="Complete your restaurant profile setup on Hostfluencer."
        noIndex={true}
      />
      <RestaurantOwnerOnboarding />
    </>
  );
};

export default RestaurantOwnerOnboardingPage;
