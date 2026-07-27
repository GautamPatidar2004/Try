import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Lock, CheckCircle } from "lucide-react";
import Navigation from "@/components/Navigation";
import { SEO } from "@/components/SEO";

const ResetPassword = () => {
  const [loading, setLoading] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isValidSession, setIsValidSession] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    // Handle password reset token from URL
    const handleAuthToken = async () => {
      try {
        // Check if we have a password reset token in the URL
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Session error:', error);
          toast({
            title: "Invalid or expired link",
            description: "Please request a new password reset link.",
            variant: "destructive",
          });
          navigate('/auth');
          return;
        }

        // If we have a session, it means the token was valid
        if (data?.session) {
          setIsValidSession(true);
        } else {
          // Check for auth hash in URL (for password reset)
          const hashParams = new URLSearchParams(window.location.hash.substring(1));
          const accessToken = hashParams.get('access_token');
          const refreshToken = hashParams.get('refresh_token');
          const type = hashParams.get('type');

          if (type === 'recovery' && accessToken && refreshToken) {
            // Set the session using the tokens from the URL
            const { data: sessionData, error: sessionError } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken
            });

            if (sessionError) {
              toast({
                title: "Invalid or expired link",
                description: "Please request a new password reset link.",
                variant: "destructive",
              });
              navigate('/auth');
            } else if (sessionData?.session) {
              setIsValidSession(true);
            }
          } else {
            toast({
              title: "Invalid or expired link",
              description: "Please request a new password reset link.",
              variant: "destructive",
            });
            navigate('/auth');
          }
        }
      } catch (error) {
        console.error('Auth error:', error);
        toast({
          title: "Invalid or expired link",
          description: "Please request a new password reset link.",
          variant: "destructive",
        });
        navigate('/auth');
      }
    };

    handleAuthToken();
  }, [navigate, toast]);

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast({
        title: "Password mismatch",
        description: "Passwords do not match. Please try again.",
        variant: "destructive",
      });
      return;
    }

    if (password.length < 6) {
      toast({
        title: "Password too short",
        description: "Password must be at least 6 characters long.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: password
      });

      if (error) throw error;

      setIsComplete(true);
      toast({
        title: "Password updated!",
        description: "Your password has been successfully updated.",
      });

      // Redirect to auth page after 3 seconds
      setTimeout(() => {
        navigate('/auth');
      }, 3000);
    } catch (error: any) {
      toast({
        title: "Password update failed",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!isValidSession) {
    return (
      <>
        <SEO 
          title="Reset Password" 
          description="Reset your Hostfluencer account password."
          noIndex={true}
        />
        <Navigation />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 pt-20">
          <Card className="w-full max-w-md">
            <CardContent className="pt-6">
              <div className="text-center">
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
                <p className="text-gray-600">Validating reset link...</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </>
    );
  }

  if (isComplete) {
    return (
      <>
        <SEO 
          title="Password Updated" 
          description="Your password has been successfully updated."
          noIndex={true}
        />
        <Navigation />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 pt-20">
          <Card className="w-full max-w-md">
            <CardContent className="pt-6">
              <div className="text-center space-y-4">
                <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
                <h2 className="text-xl font-semibold">Password Updated!</h2>
                <p className="text-gray-600">
                  Your password has been successfully updated. 
                  You'll be redirected to the login page shortly.
                </p>
                <Button 
                  onClick={() => navigate('/auth')}
                  className="bg-brand-green hover:bg-brand-green/90"
                >
                  Go to Login
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </>
    );
  }

  return (
    <>
      <SEO 
        title="Set New Password" 
        description="Enter your new password to complete the reset process."
        noIndex={true}
      />
      <Navigation />
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 pt-20">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-brand-green">
              Set New Password
            </CardTitle>
            <p className="text-gray-600">Enter your new password below</p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePasswordReset} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="new-password">New Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="new-password"
                    type="password"
                    placeholder="Enter new password"
                    className="pl-10"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="confirm-new-password">Confirm New Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="confirm-new-password"
                    type="password"
                    placeholder="Confirm new password"
                    className="pl-10"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    minLength={6}
                  />
                </div>
              </div>
              
              <Button 
                type="submit" 
                className="w-full bg-brand-green hover:bg-brand-green/90"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating password...
                  </>
                ) : (
                  'Update Password'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default ResetPassword;