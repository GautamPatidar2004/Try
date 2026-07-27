import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import InfluencerMarketplace from "@/components/marketplace/InfluencerMarketplace";
import CreatorMarketplace from "@/components/creators/CreatorMarketplace";
import { BrandDealsMarketplace } from "@/components/marketplace/BrandDealsMarketplace";
import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { useSubscription } from "@/hooks/useSubscription";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Crown } from "lucide-react";
import MarketplaceTabs from "@/components/marketplace/MarketplaceTabs";
import { SEO } from "@/components/SEO";
import { UpgradePrompt } from "@/components/subscription/UpgradePrompt";

const Marketplace = () => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [activeTab, setActiveTab] = useState<'discovery' | 'properties' | 'brand-deals'>('discovery');
  const navigate = useNavigate();
  const { creatorId, propertyId, campaignId } = useParams();
  const { toast } = useToast();
  const { subscriptionStatus, isInfluencer, canApplyToProperties } = useSubscription();
  const { isAdmin } = useAdminAuth();

  // Creators on the free Starter plan don't get unlimited marketplace browsing.
  const isStarterCreator =
    isInfluencer && subscriptionStatus?.plan?.name === 'Creator Starter';

  // Deep-link: switch tab based on URL param
  useEffect(() => {
    if (propertyId) setActiveTab('properties');
    else if (campaignId) setActiveTab('brand-deals');
    else if (creatorId) setActiveTab('discovery');
  }, [creatorId, propertyId, campaignId]);

  const clearDeepLink = () => {
    if (creatorId || propertyId || campaignId) {
      navigate('/marketplace', { replace: true });
    }
  };

  useEffect(() => {
    let mounted = true;

    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!mounted) return;

      if (!session) {
        setIsDemoMode(true);
        setLoading(false);
        return;
      }

      setUser(session.user);
      await fetchProfile(session.user.id);
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (!mounted) return;

        if (event === 'SIGNED_OUT' || !session) {
          setIsDemoMode(true);
          setUser(null);
          setProfile(null);
          setLoading(false);
        } else if (event === 'SIGNED_IN' && session) {
          setUser(session.user);
          setIsDemoMode(false);
          fetchProfile(session.user.id);
        }
      }
    );

    checkAuth();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const fetchProfile = async (userId: string) => {
    try {
      const { data: profileData, error } = await supabase
        .from('profiles')
        .select(`
          *,
          hosts(*),
          influencers(*)
        `)
        .eq('id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      setProfile(profileData);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load profile data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAuthRedirect = () => {
    navigate('/auth');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  // Demo mode for unauthenticated users
  if (isDemoMode) {
    return (
      <div className="min-h-screen bg-background">
        <SEO
          title="Browse Creator & Host Opportunities"
          description="Explore collaboration opportunities between content creators and property hosts. Find your perfect match for authentic content partnerships."
          canonical="/marketplace"
          keywords="creator marketplace, find collaborations, host opportunities, influencer partnerships"
        />
        <Navigation />
        {/* Demo banner */}
        <div className="bg-brand-green text-white p-4 text-center mt-16">
          <p className="text-sm">
            You're viewing the marketplace in demo mode. 
            <Button 
              variant="link" 
              className="text-white underline ml-2 p-0 h-auto"
              onClick={handleAuthRedirect}
            >
              Sign up or log in
            </Button> 
            to access full features.
          </p>
        </div>
        
        <MarketplaceTabs 
          activeTab={activeTab} 
          onTabChange={setActiveTab} 
        />
        
        {/* Tab Content for Demo Mode */}
        <div>
          {activeTab === 'discovery' ? (
            <CreatorMarketplace isDemoMode={true} initialCreatorId={creatorId} onCloseDeepLink={clearDeepLink} />
          ) : activeTab === 'brand-deals' ? (
            <BrandDealsMarketplace isDemoMode={true} initialCampaignId={campaignId} onCloseDeepLink={clearDeepLink} />
          ) : (
            <InfluencerMarketplace isDemoMode={isDemoMode} initialPropertyId={propertyId} onCloseDeepLink={clearDeepLink} />
          )}
        </div>
      </div>
    );
  }

  // Authenticated user without profile setup - redirect to onboarding
  if (user && !loading && (!profile || !profile.user_type)) {
    navigate('/onboarding/start');
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  // All authenticated users can see both tabs
  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Browse Creator & Host Opportunities"
        description="Explore collaboration opportunities between content creators and property hosts. Find your perfect match for authentic content partnerships."
        canonical="/marketplace"
        keywords="creator marketplace, find collaborations, host opportunities, influencer partnerships"
      />
      <Navigation />
      <MarketplaceTabs 
        activeTab={activeTab} 
        onTabChange={setActiveTab} 
        showAdminBadge={isAdmin}
      />
      
      {/* Tab Content */}
      <div>
        {activeTab === 'discovery' ? (
          <CreatorMarketplace isDemoMode={false} initialCreatorId={creatorId} onCloseDeepLink={clearDeepLink} />
        ) : activeTab === 'brand-deals' ? (
          isStarterCreator ? (
            <div className="max-w-2xl mx-auto p-6">
              <UpgradePrompt feature="unlimitedBrowsing" />
            </div>
          ) : (
            <BrandDealsMarketplace initialCampaignId={campaignId} onCloseDeepLink={clearDeepLink} />
          )
        ) : (
          isStarterCreator ? (
            <div className="max-w-2xl mx-auto p-6">
              <UpgradePrompt feature="unlimitedBrowsing" />
            </div>
          ) : (
            <InfluencerMarketplace isDemoMode={isDemoMode} initialPropertyId={propertyId} onCloseDeepLink={clearDeepLink} />
          )
        )}
      </div>
    </div>
  );
};

export default Marketplace;
