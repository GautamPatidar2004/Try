import React from 'react';
import { BrandOnboarding } from '@/components/onboarding/BrandOnboarding';
import { SEO } from '@/components/SEO';

const BrandOnboardingPage = () => {
  return (
    <>
      <SEO 
        title="Brand Onboarding" 
        description="Complete your brand profile setup on Hostfluencer."
        noIndex={true}
      />
      <BrandOnboarding />
    </>
  );
};

export default BrandOnboardingPage;
