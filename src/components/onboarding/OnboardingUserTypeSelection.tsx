import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Home, Camera, Sparkles, UtensilsCrossed } from 'lucide-react';
import { motion } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';

export const OnboardingUserTypeSelection: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    let mounted = true;
    
    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (!mounted) return;
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    // Check for existing session (but don't redirect if no session)
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!mounted) return;
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [navigate]);

  const handleUserTypeSelection = async (userType: 'host' | 'influencer' | 'restaurant_owner' | 'brand') => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      localStorage.setItem('pendingUserType', userType);
      navigate('/auth', { 
        state: { 
          defaultTab: 'signup',
          pendingUserType: userType 
        } 
      });
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ user_type: userType })
        .eq('id', session.user.id);

      if (error) {
        console.error('Error updating user type:', error);
        toast({
          title: "Error",
          description: "Failed to update user type. Please try again.",
          variant: "destructive"
        });
        setLoading(false);
        return;
      }

      if (userType === 'host') {
        navigate('/onboarding/host', { replace: true });
      } else if (userType === 'influencer') {
        navigate('/onboarding/influencer', { replace: true });
      } else if (userType === 'restaurant_owner') {
        navigate('/onboarding/restaurant-owner', { replace: true });
      } else if (userType === 'brand') {
        navigate('/onboarding/brand', { replace: true });
      }
    } catch (error) {
      console.error('Error updating user type:', error);
      toast({
        title: "Error",
        description: "Failed to update user type. Please try again.",
        variant: "destructive"
      });
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 to-secondary/5">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/5 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-4xl"
      >
        <Card className="border-0 shadow-xl bg-background/80 backdrop-blur-sm">
          <CardHeader className="text-center pb-8 pt-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="flex justify-center mb-6"
            >
              <div className="text-center">
                <h1 className="text-4xl font-bold bg-gradient-to-r from-brand-green to-voyager-blue bg-clip-text text-transparent">
                  Hostfluencer
                </h1>
                <div className="h-1 w-16 bg-gradient-to-r from-brand-green to-voyager-blue rounded-full mx-auto mt-2"></div>
              </div>
            </motion.div>
            <CardTitle className="text-2xl font-bold text-foreground">
              Welcome! Let's get started
            </CardTitle>
            <p className="text-muted-foreground text-lg mt-2">
              Let's get you set up with the perfect experience
            </p>
          </CardHeader>
          
          <CardContent className="px-8 pb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
              <motion.div
                whileHover={{ scale: 1.02, y: -5 }}
                whileTap={{ scale: 0.98 }}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Button
                  variant="outline"
                  className="min-h-44 w-full flex flex-col items-center justify-center space-y-4 border-2 hover:border-primary hover:bg-primary/5 transition-all duration-300 group p-4 sm:p-6"
                  onClick={() => handleUserTypeSelection('host')}
                >
                  <div className="p-4 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white group-hover:scale-110 transition-transform duration-300">
                    <Home className="w-8 h-8" />
                  </div>
                  <div className="text-center space-y-2 overflow-hidden w-full max-w-full">
                    <div className="font-bold text-lg">Property Host</div>
                    <div className="text-xs sm:text-sm text-muted-foreground leading-relaxed px-1 sm:px-2 break-words">
                      I have properties and want to collaborate with creators
                    </div>
                  </div>
                </Button>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.02, y: -5 }}
                whileTap={{ scale: 0.98 }}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
              >
                <Button
                  variant="outline"
                  className="min-h-44 w-full flex flex-col items-center justify-center space-y-4 border-2 hover:border-primary hover:bg-primary/5 transition-all duration-300 group p-4 sm:p-6"
                  onClick={() => handleUserTypeSelection('influencer')}
                >
                  <div className="p-4 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white group-hover:scale-110 transition-transform duration-300">
                    <Camera className="w-8 h-8" />
                  </div>
                  <div className="text-center space-y-2 overflow-hidden w-full max-w-full">
                    <div className="font-bold text-lg">Content Creator</div>
                    <div className="text-xs sm:text-sm text-muted-foreground leading-relaxed px-1 sm:px-2 break-words">
                      I create content and want to collaborate with hosts
                    </div>
                  </div>
              </Button>
            </motion.div>

            {/* Restaurant Owner Card */}
            <motion.div
              whileHover={{ scale: 1.02, y: -5 }}
              whileTap={{ scale: 0.98 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Button
                variant="outline"
                className="min-h-44 w-full flex flex-col items-center justify-center space-y-4 border-2 hover:border-primary hover:bg-primary/5 transition-all duration-300 group p-4 sm:p-6"
                onClick={() => handleUserTypeSelection('restaurant_owner')}
              >
                <div className="p-4 rounded-full bg-gradient-to-r from-orange-500 to-red-500 text-white group-hover:scale-110 transition-transform duration-300">
                  <UtensilsCrossed className="w-8 h-8" />
                </div>
                <div className="text-center space-y-2 overflow-hidden w-full max-w-full">
                  <div className="font-bold text-lg">Restaurant Owner</div>
                  <div className="text-xs sm:text-sm text-muted-foreground leading-relaxed px-1 sm:px-2 break-words">
                    I own a restaurant and want to collaborate with creators
                  </div>
                </div>
              </Button>
            </motion.div>

            {/* Brand Partner Card */}
            <motion.div
              whileHover={{ scale: 1.02, y: -5 }}
              whileTap={{ scale: 0.98 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <Button
                variant="outline"
                className="min-h-44 w-full flex flex-col items-center justify-center space-y-4 border-2 hover:border-primary hover:bg-primary/5 transition-all duration-300 group p-4 sm:p-6"
                onClick={() => handleUserTypeSelection('brand')}
              >
                <div className="p-4 rounded-full bg-gradient-to-r from-purple-500 to-violet-500 text-white group-hover:scale-110 transition-transform duration-300">
                  <Sparkles className="w-8 h-8" />
                </div>
                <div className="text-center space-y-2 overflow-hidden w-full max-w-full">
                  <div className="font-bold text-lg">Brand Partner</div>
                  <div className="text-xs sm:text-sm text-muted-foreground leading-relaxed px-1 sm:px-2 break-words">
                    I represent a brand and want to partner with creators
                  </div>
                </div>
              </Button>
            </motion.div>
          </div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="text-center mt-8 text-sm text-muted-foreground"
            >
              Don't worry, you can always change this later in your profile settings
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};