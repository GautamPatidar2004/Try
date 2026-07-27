import React from 'react';
import { HostOnboarding } from '@/components/onboarding/HostOnboarding';
import { SEO } from '@/components/SEO';

const HostOnboardingPage = () => {
  return (
    <>
      <SEO 
        title="Host Onboarding" 
        description="Complete your host profile setup on Hostfluencer."
        noIndex={true}
      />
      <HostOnboarding />
    </>
  );
};

export default HostOnboardingPage;