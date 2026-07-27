import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { SITE_CONFIG } from "@/config/site";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mail, ArrowLeft, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Navigation from "@/components/Navigation";
import { SEO } from "@/components/SEO";

const VerifyEmail = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [email, setEmail] = useState<string>("");
  const [resending, setResending] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    // Get email from navigation state
    const emailFromState = location.state?.email;
    if (emailFromState) {
      setEmail(emailFromState);
    }
  }, [location]);

  useEffect(() => {
    // Countdown timer for resend button
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  const handleResendEmail = async () => {
    if (!email) {
      toast({
        title: "Error",
        description: "Email address not found. Please sign up again.",
        variant: "destructive",
      });
      return;
    }

    setResending(true);

    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
        options: {
          emailRedirectTo: `${SITE_CONFIG.productionUrl}/onboarding/start`
        }
      });

      if (error) throw error;

      toast({
        title: "Email sent!",
        description: "We've sent you another verification email.",
      });
      setCooldown(60); // 60 second cooldown
    } catch (error: any) {
      toast({
        title: "Failed to resend email",
        description: error.message || "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setResending(false);
    }
  };

  return (
    <>
      <SEO 
        title="Verify Your Email" 
        description="Please verify your email address to continue."
        noIndex={true}
      />
      <Navigation />
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 pt-20">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-brand-green/10 rounded-full flex items-center justify-center mb-4">
              <Mail className="w-8 h-8 text-brand-green" />
            </div>
            <CardTitle className="text-2xl font-bold">
              Check your email
            </CardTitle>
            <p className="text-gray-600 mt-2">
              We've sent a verification link to
            </p>
            {email && (
              <p className="font-medium text-brand-green mt-1">
                {email}
              </p>
            )}
          </CardHeader>
          
          <CardContent className="space-y-6">
            <div className="space-y-4 text-center text-sm text-gray-600">
              <p>
                Click the link in the email to verify your account and get started.
              </p>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-left">
                <p className="font-medium text-gray-900 mb-2">
                  Didn't receive the email?
                </p>
                <ul className="list-disc list-inside space-y-1 text-gray-600">
                  <li>Check your spam or junk folder</li>
                  <li>Make sure you entered the correct email</li>
                  <li>Wait a few minutes and check again</li>
                </ul>
              </div>
            </div>

            <div className="space-y-3">
              <Button
                onClick={handleResendEmail}
                disabled={resending || cooldown > 0}
                variant="outline"
                className="w-full"
              >
                {resending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : cooldown > 0 ? (
                  `Resend email (${cooldown}s)`
                ) : (
                  'Resend verification email'
                )}
              </Button>

              <Button
                onClick={() => navigate('/auth')}
                variant="ghost"
                className="w-full"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to login
              </Button>
            </div>

            <div className="text-center text-xs text-gray-500">
              Need help?{" "}
              <button
                onClick={() => navigate('/help')}
                className="text-brand-green hover:underline"
              >
                Contact support
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default VerifyEmail;