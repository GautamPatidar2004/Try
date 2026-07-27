import React from 'react';
import { SubscriptionDashboard } from '@/components/subscription/SubscriptionDashboard';
import { SEO } from '@/components/SEO';

const Subscription = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20">
      <SEO 
        title="My Subscription" 
        description="Manage your Hostfluencer subscription and billing."
        noIndex={true}
      />
      <div className="container mx-auto py-12">
        <SubscriptionDashboard />
      </div>
    </div>
  );
};

export default Subscription;