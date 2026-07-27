import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Mail, Lock, User, ArrowLeft, Facebook, Eye, EyeOff } from "lucide-react";
import Navigation from "@/components/Navigation";
import { ChangePasswordModal } from "@/components/auth/ChangePasswordModal";
import { SITE_CONFIG } from "@/config/site";
import { SEO } from "@/components/SEO";
import { useProductAnalytics } from "@/hooks/useProductAnalytics";
import { recordPopupEvent, getPopupSession } from "@/lib/popupTracking";

const Auth = () => {
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [facebookLoading, setFacebookLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [signupData, setSignupData] = useState({ 
    email: '', 
    password: '', 
    confirmPassword: '',
    firstName: '',
    lastName: ''
  });
  const navigate = useNavigate();
  const { toast } = useToast();
  const { trackSignupStart, trackSignupComplete } = useProductAnalytics();
  const signupTrackedRef = useRef(false);
  const popupLandedRef = useRef(false);
  const defaultTab = location.state?.defaultTab || 'login';

  useEffect(() => {
    if (popupLandedRef.current) return;
    if (getPopupSession()) {
      popupLandedRef.current = true;
      void recordPopupEvent("auth_landed");
    }
  }, []);
  
  // Capture referral code from URL params
  const searchParams = new URLSearchParams(location.search);
  const referralCode = searchParams.get('ref') || searchParams.get('referral') || localStorage.getItem('referralCode');
  
  // Track signup start when switching to signup tab
  const handleTabChange = (value: string) => {
    if (value === 'signup' && !signupTrackedRef.current) {
      const userType = searchParams.get('type') as 'host' | 'influencer' | 'brand' | 'restaurant_owner';
      trackSignupStart({ role: userType || 'influencer' });
      signupTrackedRef.current = true;
    }
  };

  // Check if user is already authenticated and redirect appropriately
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        // Check for returnTo parameter
        const searchParams = new URLSearchParams(location.search);
        const returnTo = searchParams.get('returnTo');
        
        if (returnTo) {
          navigate(returnTo);
          return;
        }
        
        // Check if user has completed profile setup
        const { data: profile } = await supabase
          .from('profiles')
          .select('user_type')
          .eq('id', session.user.id)
          .maybeSingle();
        
        if (profile?.user_type) {
          navigate('/marketplace');
        } else {
          navigate('/onboarding/start');
        }
      }
    };
    
    checkAuth();
  }, [navigate, location.search]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: loginData.email,
        password: loginData.password,
      });

      if (error) throw error;

      // Check if user has a temporary password
      if (data.user?.user_metadata?.temp_password === true) {
        setShowPasswordModal(true);
        toast({
          title: "Password change required",
          description: "Please set a new password to continue.",
        });
        return;
      }

      toast({
        title: "Welcome back!",
        description: "You've been successfully logged in.",
      });
      
      // Check for returnTo parameter
      const searchParams = new URLSearchParams(location.search);
      const returnTo = searchParams.get('returnTo');
      
      if (returnTo) {
        navigate(returnTo);
      } else {
        // Redirect to marketplace, it will handle onboarding routing
        navigate('/marketplace');
      }
    } catch (error: any) {
      toast({
        title: "Login failed",
        description: error.message || "Please check your credentials and try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (signupData.password !== signupData.confirmPassword) {
      toast({
        title: "Password mismatch",
        description: "Passwords do not match. Please try again.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      // Store referral code for later use after signup
      if (referralCode) {
        localStorage.setItem('referralCode', referralCode);
      }
      
      const { data, error } = await supabase.auth.signUp({
        email: signupData.email,
        password: signupData.password,
        options: {
          data: {
            first_name: signupData.firstName,
            last_name: signupData.lastName,
            referred_by_code: referralCode || null,
          },
          emailRedirectTo: `${SITE_CONFIG.productionUrl}/onboarding/start`
        }
      });

      if (error) throw error;
      
      // If we have a session and a referral code, update the profile
      if (data.user && referralCode) {
        await supabase
          .from('profiles')
          .update({ referred_by_code: referralCode })
          .eq('id', data.user.id);
        
        // Clear stored referral code after successful use
        localStorage.removeItem('referralCode');
      }

      if (data.user) {
        // Track signup completion
        const pendingUserType = localStorage.getItem('pendingUserType');
        trackSignupComplete({ role: pendingUserType as 'host' | 'influencer' | 'brand' | 'restaurant_owner' || 'influencer' });
        void recordPopupEvent("signup_completed", { userId: data.user.id });
        
        if (data.session) {
          // Check for returnTo parameter
          const searchParams = new URLSearchParams(location.search);
          const returnTo = searchParams.get('returnTo');
          
          if (returnTo) {
            // User came from a specific page (like pricing) - redirect them back
            toast({
              title: "Account created!",
              description: "Welcome! Redirecting you back...",
            });
            navigate(returnTo);
          } else if (pendingUserType) {
            // Update profile with selected user type
            await supabase
              .from('profiles')
              .update({ user_type: pendingUserType })
              .eq('id', data.user.id);
            
            // Clear the pending type
            localStorage.removeItem('pendingUserType');
            
            toast({
              title: "Account created!",
              description: "Welcome! Let's complete your setup.",
            });
            
            // Navigate to appropriate onboarding
            if (pendingUserType === 'host') {
              navigate('/onboarding/host');
            } else if (pendingUserType === 'influencer') {
              navigate('/onboarding/influencer');
            } else if (pendingUserType === 'brand') {
              navigate('/onboarding/brand');
            } else if (pendingUserType === 'restaurant_owner') {
              navigate('/onboarding/restaurant-owner');
            }
          } else {
            // No pending type - go to type selection
            toast({
              title: "Account created!",
              description: "Welcome! Let's get you set up.",
            });
            navigate('/onboarding/start');
          }
        } else {
          // Email confirmation enabled - redirect to verification page
          navigate('/verify-email', { 
            state: { email: signupData.email } 
          });
        }
      }
    } catch (error: any) {
      toast({
        title: "Signup failed",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
        redirectTo: `${SITE_CONFIG.productionUrl}/auth/reset-password`,
      });

      if (error) throw error;

      toast({
        title: "Reset link sent!",
        description: "Check your email for a password reset link.",
      });
      setShowForgotPassword(false);
      setResetEmail('');
    } catch (error: any) {
      toast({
        title: "Error sending reset link",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFacebookLogin = async () => {
    setFacebookLoading(true);
    
    try {
      // Detect if we're running inside an iframe (Lovable preview)
      const isInIframe = window !== window.parent;
      
      if (isInIframe) {
        // Popup flow for iframe environments
        const { data, error } = await supabase.auth.signInWithOAuth({
          provider: 'facebook',
          options: {
            redirectTo: `${SITE_CONFIG.productionUrl}/onboarding/start`,
            scopes: 'email',
            skipBrowserRedirect: true,
          }
        });

        if (error) throw error;

        if (data?.url) {
          const popup = window.open(data.url, 'facebook_oauth', 'width=500,height=600');
          if (!popup) {
            toast({
              title: "Popup blocked",
              description: "Please allow popups for this site and try again.",
              variant: "destructive",
            });
            setFacebookLoading(false);
            return;
          }
          const interval = setInterval(() => {
            if (popup.closed) {
              clearInterval(interval);
              window.location.reload();
            }
          }, 500);
        }
      } else {
        // Standard redirect flow for production (top-level window)
        const { error } = await supabase.auth.signInWithOAuth({
          provider: 'facebook',
          options: {
            redirectTo: `${SITE_CONFIG.productionUrl}/onboarding/start`,
            scopes: 'email',
          }
        });

        if (error) throw error;
        // Browser will redirect automatically
      }
    } catch (error: any) {
      toast({
        title: "Facebook login failed",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
      setFacebookLoading(false);
    }
  };

  return (
    <>
      <SEO 
        title="Sign In" 
        description="Sign in or create an account to connect with hosts and creators on Hostfluencer."
        noIndex={true}
      />
      <Navigation />
      <ChangePasswordModal 
        isOpen={showPasswordModal} 
        onPasswordChanged={() => {
          setShowPasswordModal(false);
          navigate('/marketplace');
        }} 
      />
      <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/30 flex items-center justify-center p-4 pt-20 pb-8">
        <Card className="w-full max-w-md border-border/60 bg-card shadow-2xl shadow-black/20 backdrop-blur-sm">
        <CardHeader className="text-center px-6 sm:px-8 pt-8 pb-5 space-y-2">
          <CardTitle className="text-2xl sm:text-3xl font-bold text-brand-green tracking-tight">
            Welcome to Hostfluencer
          </CardTitle>
          <p className="text-muted-foreground text-sm sm:text-base">Connect hosts with content creators</p>
        </CardHeader>
        <CardContent className="px-6 sm:px-8 pb-8">
          {showForgotPassword ? (
            <div className="space-y-4">
              <div className="flex items-center space-x-2 mb-6">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowForgotPassword(false)}
                  className="p-0 h-auto"
                >
                  <ArrowLeft className="h-4 w-4 mr-1" />
                  Back to login
                </Button>
              </div>
              
              <div className="text-center mb-6">
                <h3 className="text-lg font-semibold">Reset your password</h3>
                <p className="text-muted-foreground text-sm">
                  Enter your email and we'll send you a reset link
                </p>
              </div>

              <form onSubmit={handleForgotPassword} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="reset-email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="reset-email"
                      type="email"
                      placeholder="Enter your email"
                      className="pl-10"
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      required
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
                      Sending reset link...
                    </>
                  ) : (
                    'Send reset link'
                  )}
                </Button>
              </form>
            </div>
          ) : (
            <>
              <Button
                type="button"
                variant="outline"
                className="w-full h-11 mb-2 bg-[#1877F2] hover:bg-[#1877F2]/90 text-white border-none text-sm sm:text-base font-medium shadow-sm"
                onClick={handleFacebookLogin}
                disabled={facebookLoading || loading}
              >
                {facebookLoading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Connecting...
                  </>
                ) : (
                  <>
                    <Facebook className="mr-2 h-5 w-5" />
                    Continue with Facebook
                  </>
                )}
              </Button>

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-border/60" />
                </div>
                <div className="relative flex justify-center text-[11px] uppercase tracking-wider">
                  <span className="bg-card px-3 text-muted-foreground">Or continue with email</span>
                </div>
              </div>

              <Tabs defaultValue={defaultTab} className="w-full" onValueChange={handleTabChange}>
                <TabsList className="grid w-full grid-cols-2 h-11 mb-5 bg-muted/60 rounded-lg p-1">
                  <TabsTrigger value="login" className="text-sm sm:text-base rounded-md data-[state=active]:bg-background data-[state=active]:shadow-sm">Login</TabsTrigger>
                  <TabsTrigger value="signup" className="text-sm sm:text-base rounded-md data-[state=active]:bg-background data-[state=active]:shadow-sm">Sign Up</TabsTrigger>
                </TabsList>
              
              <TabsContent value="login">
                <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="login-email"
                      type="email"
                      placeholder="Enter your email"
                      className="pl-10"
                      value={loginData.email}
                      onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                      required
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="login-password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="login-password"
                      type={showLoginPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      className="pl-10 pr-10 h-11"
                      value={loginData.password}
                      onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowLoginPassword(!showLoginPassword)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-muted-foreground min-h-[44px] min-w-[44px] flex items-center justify-center"
                    >
                      {showLoginPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
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
                      Logging in...
                    </>
                  ) : (
                    'Log In'
                  )}
                </Button>
                
                <div className="text-center mt-4">
                  <Button
                    type="button"
                    variant="link"
                    onClick={() => setShowForgotPassword(true)}
                    className="text-sm text-brand-green hover:text-brand-green/90 py-3 min-h-[44px]"
                  >
                    Forgot your password?
                  </Button>
                </div>
              </form>
            </TabsContent>
            
            <TabsContent value="signup">
              <form onSubmit={handleSignup} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName" className="text-sm">First Name</Label>
                    <Input
                      id="firstName"
                      placeholder="First name"
                      className="h-11 sm:h-10"
                      value={signupData.firstName}
                      onChange={(e) => setSignupData({ ...signupData, firstName: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName" className="text-sm">Last Name</Label>
                    <Input
                      id="lastName"
                      placeholder="Last name"
                      className="h-11 sm:h-10"
                      value={signupData.lastName}
                      onChange={(e) => setSignupData({ ...signupData, lastName: e.target.value })}
                      required
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="signup-email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="Enter your email"
                      className="pl-10"
                      value={signupData.email}
                      onChange={(e) => setSignupData({ ...signupData, email: e.target.value })}
                      required
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="signup-password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="signup-password"
                      type={showSignupPassword ? "text" : "password"}
                      placeholder="Create a password"
                      className="pl-10 pr-10 h-11"
                      value={signupData.password}
                      onChange={(e) => setSignupData({ ...signupData, password: e.target.value })}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowSignupPassword(!showSignupPassword)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-muted-foreground min-h-[44px] min-w-[44px] flex items-center justify-center"
                    >
                      {showSignupPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirm Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="confirm-password"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirm your password"
                      className="pl-10 pr-10 h-11"
                      value={signupData.confirmPassword}
                      onChange={(e) => setSignupData({ ...signupData, confirmPassword: e.target.value })}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-muted-foreground min-h-[44px] min-w-[44px] flex items-center justify-center"
                    >
                      {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                  {signupData.confirmPassword && signupData.password !== signupData.confirmPassword && (
                    <p className="text-xs text-destructive">Passwords do not match</p>
                  )}
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full bg-brand-green hover:bg-brand-green/90"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating account...
                    </>
                  ) : (
                    'Create Account'
                  )}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
            </>
          )}
        </CardContent>
        </Card>
      </div>
    </>
  );
};

export default Auth;
