import React from 'react';
import { InfluencerOnboarding } from '@/components/onboarding/InfluencerOnboarding';
import { SEO } from '@/components/SEO';

const InfluencerOnboardingPage = () => {
  return (
    <>
      <SEO 
        title="Creator Onboarding" 
        description="Complete your creator profile setup on Hostfluencer."
        noIndex={true}
      />
      <InfluencerOnboarding />
    </>
  );
};

export default InfluencerOnboardingPage;