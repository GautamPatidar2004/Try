import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Loader2, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { SEO } from '@/components/SEO';
import { useProductAnalytics } from '@/hooks/useProductAnalytics';

const SubscriptionSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [planDetails, setPlanDetails] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const { trackSubscriptionStarted } = useProductAnalytics();
  const subscriptionTrackedRef = useRef(false);

  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    const processPayment = async () => {
      if (!sessionId) {
        setError('No session ID found');
        setLoading(false);
        return;
      }

      // Poll check-subscription-status until we see a paid plan (or timeout)
      const MAX_ATTEMPTS = 12; // ~24s
      const INTERVAL_MS = 2000;
      let lastData: any = null;
      try {
        for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
          const { data, error: err } = await supabase.functions.invoke('check-subscription-status');
          lastData = data;
          const planName = data?.plan?.name;
          const isPaid = data?.hasActiveSubscription && planName && planName !== 'Creator Starter';
          if (!err && isPaid) {
            setSuccess(true);
            setPlanDetails({
              type: 'subscription',
              name: planName,
              description: data.isTrialing
                ? 'Your free trial has started! You can cancel anytime before it ends.'
                : 'Your subscription is now active!',
            });
            if (!subscriptionTrackedRef.current) {
              trackSubscriptionStarted({ plan: planName, billing_interval: data.billingInterval || 'monthly' });
              subscriptionTrackedRef.current = true;
            }
            window.dispatchEvent(new Event('subscription:refresh'));
            setLoading(false);
            return;
          }
          await new Promise((r) => setTimeout(r, INTERVAL_MS));
        }
        // Timed out
        if (lastData?.hasActiveSubscription) {
          // We have something active (maybe Starter); treat as success but warn
          setSuccess(true);
          setPlanDetails({
            type: 'subscription',
            name: lastData.plan?.name || 'Subscription',
            description: 'Your subscription is being finalized. Refresh in a moment if your plan is not yet showing.',
          });
        } else {
          setError('Payment is taking longer than expected to sync. Refresh your profile in a minute, or contact support if you were charged.');
        }
      } catch (err) {
        console.error('Payment processing error:', err);
        setError('An error occurred while processing your payment.');
      } finally {
        setLoading(false);
      }
    };

    processPayment();
  }, [sessionId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20 flex items-center justify-center">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="flex flex-col items-center justify-center p-8">
            <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
            <h2 className="text-xl font-semibold mb-2">Processing Payment...</h2>
            <p className="text-muted-foreground text-center">
              Please wait while we confirm your payment.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20 flex items-center justify-center">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="flex flex-col items-center justify-center p-8">
            <AlertCircle className="h-12 w-12 text-destructive mb-4" />
            <h2 className="text-xl font-semibold mb-2">Payment Error</h2>
            <p className="text-muted-foreground text-center mb-6">{error}</p>
            <div className="space-y-2 w-full">
              <Button onClick={() => navigate('/pricing')} className="w-full">
                Back to Pricing
              </Button>
              <Button variant="outline" onClick={() => navigate('/')} className="w-full">
                Go Home
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20 flex items-center justify-center">
      <SEO 
        title="Payment Successful" 
        description="Your payment was successful. Welcome to Hostfluencer!"
        noIndex={true}
      />
      <Card className="w-full max-w-md mx-4">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <CheckCircle className="h-16 w-16 text-green-500" />
          </div>
          <CardTitle className="text-2xl text-green-600">Payment Successful!</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {planDetails && (
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-2">{planDetails.name}</h3>
              <p className="text-muted-foreground">{planDetails.description}</p>
            </div>
          )}
          
          <div className="space-y-3">
            <Button 
              onClick={() => navigate('/subscription')} 
              className="w-full"
              size="lg"
            >
              Go to Dashboard
            </Button>
            <Button 
              variant="outline" 
              onClick={() => navigate('/marketplace')} 
              className="w-full"
            >
              Explore Marketplace
            </Button>
            <Button 
              variant="ghost" 
              onClick={() => navigate('/')} 
              className="w-full"
            >
              Back to Home
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SubscriptionSuccess;