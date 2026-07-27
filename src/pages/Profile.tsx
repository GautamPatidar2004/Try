import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { useToast } from "@/hooks/use-toast";
import HostProfile from "@/components/profiles/HostProfile";
import ModernInfluencerProfile from "@/components/profiles/ModernInfluencerProfile";
import BrandProfile from "@/components/profiles/BrandProfile";
import RestaurantProfile from "@/components/profiles/RestaurantProfile";
import { Loader2 } from "lucide-react";
import Navigation from "@/components/Navigation";
import { SEO } from "@/components/SEO";

const Profile = () => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  
  const initialTab = searchParams.get('tab') || undefined;

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate('/auth');
        return;
      }

      setUser(session.user);
      await fetchProfile(session.user.id);
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === 'SIGNED_OUT' || !session) {
          navigate('/auth');
        } else if (event === 'SIGNED_IN' && session) {
          setUser(session.user);
          setTimeout(() => {
            fetchProfile(session.user.id);
          }, 0);
        }
      }
    );

    checkAuth();

    return () => subscription.unsubscribe();
  }, [navigate]);

  const fetchProfile = async (userId: string) => {
    try {
      const { data: baseProfileData, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        throw error;
      }

      if (!baseProfileData) {
        throw new Error('Profile not found');
      }

      const profileData: any = baseProfileData;

      // Fetch user-type-specific data
      if (profileData.user_type === 'host') {
        const { data: hostData } = await supabase
          .from('hosts')
          .select('*')
          .eq('id', userId)
          .maybeSingle();
        profileData.hosts = hostData ? [hostData] : [];
      } else if (profileData.user_type === 'influencer') {
        const { data: influencerData } = await supabase
          .from('influencers')
          .select('*')
          .eq('id', userId)
          .maybeSingle();
        profileData.influencers = influencerData ? [influencerData] : [];
      } else if (profileData.user_type === 'brand') {
        const { data: brandData } = await supabase
          .from('brands')
          .select('*')
          .eq('user_id', userId)
          .maybeSingle();
        profileData.brands = brandData ? [brandData] : [];
      } else if (profileData.user_type === 'restaurant_owner') {
        const { data: restaurantOwnerData } = await supabase
          .from('restaurant_owners')
          .select('*')
          .eq('id', userId)
          .maybeSingle();
        profileData.restaurant_owners = restaurantOwnerData ? [restaurantOwnerData] : [];
        
        if (restaurantOwnerData) {
          const { data: restaurantsData } = await supabase
            .from('restaurants')
            .select('*')
            .eq('owner_id', userId);
          profileData.restaurants = restaurantsData || [];
        }
      }

      setProfile(profileData);

      if (profileData?.user_type === 'influencer' && Array.isArray(profileData.influencers) && profileData.influencers.length > 0) {
        await fetchApplications(userId);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load profile data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // const fetchApplications = async (userId: string) => {
  //   try {
  //     const { data, error } = await supabase
  //       .from('applications')
  //       .select(`
  //         *,
  //         properties(
  //           title,
  //           location,
  //           collaboration_type,
  //           hosts(
  //             profiles(first_name, last_name)
  //           )
  //         )
  //       `)
  //       .eq('influencer_id', userId)
  //       .order('created_at', { ascending: false });

  //     if (error) throw error;
  //     setApplications(data || []);
  //   } catch (error) {
  //     // Silent fail for applications fetch
  //   }
  // };
  const fetchApplications = async (userId: string) => {
    try {
      // Property applications
      const { data: propertyApps, error: propertyError } = await supabase
        .from("applications")
        .select(`
          *,
          properties(
            title,
            location,
            collaboration_type,
            hosts(
              profiles(first_name, last_name)
            )
          )
        `)
        .eq("influencer_id", userId);
  
      if (propertyError) throw propertyError;
  
      // Brand applications
      const { data: brandApps, error: brandError } = await supabase
        .from("brand_campaign_applications")
        .select(`
          *,
          campaign:brand_campaigns(
            id,
            campaign_title,
            brand_name,
            creator_payout,
            currency,
            status
          )
        `)
        .eq("influencer_id", userId);
  
      if (brandError) throw brandError;
  
      // Transform brand apps into the same shape as property apps
      const normalizedBrandApps = (brandApps || []).map((app: any) => ({
        ...app,
        applicationType: "brand",
  
        properties: {
          title: app.campaign?.campaign_title,
          location: app.campaign?.brand_name,
          collaboration_type: "brand_campaign",
  
          hosts: {
            profiles: {
              first_name: app.campaign?.brand_name,
              last_name: "",
            },
          },
        },
  
        // Make brand apps behave like approved applications
        content_delivery_status: app.content_delivery_status || "pending",
        content_deadline: null,
      }));
  
      // Add type to stay apps too
      const normalizedPropertyApps = (propertyApps || []).map((app: any) => ({
        ...app,
        applicationType: "stay",
      }));
  
      const mergedApplications = [
        ...normalizedPropertyApps,
        ...normalizedBrandApps,
      ].sort(
        (a: any, b: any) =>
          new Date(b.created_at).getTime() -
          new Date(a.created_at).getTime()
      );
 
      setApplications(mergedApplications);
    } catch (error) {
      console.error("Error fetching applications:", error);
    }
  };

  if (loading) {
    return (
      <>
        <Navigation />
        <div className="min-h-screen flex items-center justify-center pt-16">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      </>
    );
  }

  const isProfileComplete = (profile: any): boolean => {
    if (!profile?.user_type) return false;
    
    switch (profile.user_type) {
      case 'host':
        return Array.isArray(profile.hosts) && profile.hosts.length > 0;
      case 'influencer':
        return Array.isArray(profile.influencers) && profile.influencers.length > 0;
      case 'brand':
        return Array.isArray(profile.brands) && profile.brands.length > 0;
      case 'restaurant_owner':
        return Array.isArray(profile.restaurant_owners) && profile.restaurant_owners.length > 0;
      default:
        return false;
    }
  };

  if (!profile) {
    if (!isRedirecting) {
      setIsRedirecting(true);
      navigate('/onboarding/start', { replace: true });
    }
    return (
      <>
        <Navigation />
        <div className="min-h-screen flex items-center justify-center pt-16">
          <Loader2 className="w-8 h-8 animate-spin" />
          <p className="text-sm text-muted-foreground mt-4">Setting up your profile...</p>
        </div>
      </>
    );
  }

  if (!profile.user_type) {
    if (!isRedirecting) {
      setIsRedirecting(true);
      navigate('/onboarding/start', { replace: true });
    }
    return (
      <>
        <Navigation />
        <div className="min-h-screen flex items-center justify-center pt-16">
          <Loader2 className="w-8 h-8 animate-spin" />
          <p className="text-sm text-muted-foreground mt-4">Setting up your profile...</p>
        </div>
      </>
    );
  }

  if (!isProfileComplete(profile)) {
    const onboardingRoutes: Record<string, string> = {
      host: '/onboarding/host',
      influencer: '/onboarding/influencer',
      brand: '/onboarding/brand',
      restaurant_owner: '/onboarding/restaurant-owner'
    };
    
    if (!isRedirecting) {
      setIsRedirecting(true);
      navigate(onboardingRoutes[profile.user_type] || '/onboarding/start', { replace: true });
    }
    return (
      <>
        <Navigation />
        <div className="min-h-screen flex items-center justify-center pt-16">
          <Loader2 className="w-8 h-8 animate-spin" />
          <p className="text-sm text-muted-foreground mt-4">Completing your profile...</p>
        </div>
      </>
    );
  }

  return (
    <>
      <SEO 
        title="My Profile" 
        description="Manage your Hostfluencer profile, settings, and preferences."
        noIndex={true}
      />
      <Navigation />
      <div className="min-h-screen bg-muted pt-16">
        {profile.user_type === 'host' && (
          <HostProfile 
            profile={profile} 
            initialTab={initialTab}
            onProfileUpdated={() => fetchProfile(user!.id)} 
          />
        )}
        {profile.user_type === 'influencer' && (
          <ModernInfluencerProfile 
            profile={profile} 
            applications={applications}
            initialTab={initialTab}
            onProfileUpdated={() => fetchProfile(user!.id)} 
          />
        )}
        {profile.user_type === 'brand' && (
          <BrandProfile 
            profile={profile} 
            initialTab={initialTab}
            onProfileUpdated={() => fetchProfile(user!.id)} 
          />
        )}
        {profile.user_type === 'restaurant_owner' && (
          <RestaurantProfile 
            profile={profile} 
            initialTab={initialTab}
            onProfileUpdated={() => fetchProfile(user!.id)} 
          />
        )}
      </div>
    </>
  );
};

export default Profile;
