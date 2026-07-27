import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAIMatches } from "@/hooks/useAIMatches";
import Navigation from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import MatchBadge from "@/components/ai-matching/MatchBadge";
import MatchReasons from "@/components/ai-matching/MatchReasons";
import { Building2, Loader2, Sparkles, ArrowRight } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SEO } from "@/components/SEO";

const MyMatches = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [properties, setProperties] = useState<any[]>([]);

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

    checkAuth();
  }, [navigate]);

  const fetchProfile = async (userId: string) => {
    try {
      const { data: profileData, error } = await supabase
        .from('profiles')
        .select('*, influencers(*)')
        .eq('id', userId)
        .single();

      if (error) throw error;

      setProfile(profileData);

      // Fetch properties for match context
      const { data: propertiesData } = await supabase
        .from('properties')
        .select(`
          *,
          property_images(image_url, is_primary),
          hosts(business_name, profiles(first_name, last_name))
        `)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      setProperties(propertiesData || []);
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast({
        title: "Error",
        description: "Failed to load profile data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const { matches, loading: matchesLoading, getTopMatches } = useAIMatches(
    user?.id,
    profile?.user_type
  );

  const topMatches = getTopMatches(90);
  const excellentMatches = matches.filter(m => m.match_score >= 80 && m.match_score < 90);
  const goodMatches = matches.filter(m => m.match_score >= 70 && m.match_score < 80);

  const getPropertyForMatch = (propertyId: string) => {
    return properties.find(p => p.id === propertyId);
  };

  const handleViewProperty = (propertyId: string) => {
    navigate(`/marketplace?property=${propertyId}`);
  };

  if (loading || matchesLoading) {
    return (
      <div className="min-h-screen bg-muted">
        <Navigation />
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
        </div>
      </div>
    );
  }

  const isInfluencer = profile?.user_type === 'influencer';
  const isHost = profile?.user_type === 'host';

  if (profile && !isInfluencer && !isHost) {
    return (
      <div className="min-h-screen bg-muted">
        <Navigation />
        <div className="max-w-4xl mx-auto px-4 py-20">
          <Card>
            <CardContent className="text-center py-12">
              <Sparkles className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-2xl font-semibold mb-2">AI Matching</h2>
              <p className="text-muted-foreground">
                Please complete your profile setup to access AI matching.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted">
      <SEO 
        title="My Matches" 
        description="View your AI-powered matches and recommendations."
        noIndex={true}
      />
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Sparkles className="h-8 w-8 text-purple-600" />
            <h1 className="text-3xl font-bold text-foreground">
              {isInfluencer ? 'AI Powered Matches' : 'Recommended Creators'}
            </h1>
          </div>
          <p className="text-muted-foreground">
            {isInfluencer 
              ? 'Discover properties that perfectly align with your content style and audience'
              : 'Discover creators that perfectly match your properties'}
          </p>
        </div>

        {matches.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Sparkles className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">No matches yet</h2>
              <p className="text-muted-foreground mb-4">
                {isInfluencer 
                  ? 'Browse properties in the marketplace to generate AI-powered match scores'
                  : 'Calculate matches to discover creators for your properties'}
              </p>
              <Button onClick={() => navigate(isInfluencer ? '/marketplace' : '/profile')}>
                {isInfluencer ? 'Explore Properties' : 'Go to Profile'}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        ) : isHost ? (
          <div className="space-y-6">
            {properties.map((property) => {
              const propertyMatches = matches
                .filter(m => m.property_id === property.id)
                .sort((a, b) => b.match_score - a.match_score);

              if (propertyMatches.length === 0) return null;

              return (
                <Card key={property.id}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Building2 className="h-5 w-5" />
                      {property.title}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {propertyMatches.length} matching creator{propertyMatches.length !== 1 ? 's' : ''}
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {propertyMatches.slice(0, 5).map((match) => (
                      <Card key={match.id} className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <h4 className="font-semibold">Creator Match</h4>
                          <MatchBadge score={match.match_score} />
                        </div>
                        <MatchReasons 
                          reasons={match.match_reasons} 
                          recommendation={match.ai_recommendation || ''} 
                        />
                        <div className="flex gap-2 mt-4">
                          <Button variant="outline" className="flex-1">
                            View Creator
                          </Button>
                          <Button>Send Invitation</Button>
                        </div>
                      </Card>
                    ))}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <Tabs defaultValue="top" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3 max-w-md">
              <TabsTrigger value="top">
                Perfect Matches ({topMatches.length})
              </TabsTrigger>
              <TabsTrigger value="excellent">
                Excellent ({excellentMatches.length})
              </TabsTrigger>
              <TabsTrigger value="good">
                Good ({goodMatches.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="top" className="space-y-6">
              {topMatches.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-8">
                    <p className="text-muted-foreground">No perfect matches yet</p>
                  </CardContent>
                </Card>
              ) : (
                topMatches.map(match => {
                  const property = getPropertyForMatch(match.property_id);
                  if (!property) return null;

                  return (
                    <Card key={match.id} className="overflow-hidden">
                      <CardContent className="p-6">
                        <div className="flex gap-6">
                          {/* Property Image */}
                          <div className="w-64 h-48 flex-shrink-0 rounded-lg overflow-hidden">
                            <img
                              src={property.property_images?.find((img: any) => img.is_primary)?.image_url || '/placeholder.svg'}
                              alt={property.title}
                              className="w-full h-full object-cover"
                            />
                          </div>

                          {/* Property Details */}
                          <div className="flex-1 space-y-4">
                            <div>
                              <div className="flex items-start justify-between mb-2">
                                <div>
                                  <h3 className="text-xl font-semibold mb-1">{property.title}</h3>
                                  <p className="text-muted-foreground">{property.location}</p>
                                </div>
                                <MatchBadge score={match.match_score} />
                              </div>
                              <p className="text-sm text-muted-foreground line-clamp-2">
                                {property.description}
                              </p>
                            </div>

                            <MatchReasons 
                              reasons={match.match_reasons}
                              recommendation={match.ai_recommendation}
                            />

                            <div className="flex gap-3">
                              <Button onClick={() => handleViewProperty(property.id)}>
                                View Property
                              </Button>
                              <Button variant="outline">
                                Apply Now
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </TabsContent>

            <TabsContent value="excellent" className="space-y-6">
              {excellentMatches.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-8">
                    <p className="text-muted-foreground">No excellent matches yet</p>
                  </CardContent>
                </Card>
              ) : (
                excellentMatches.map(match => {
                  const property = getPropertyForMatch(match.property_id);
                  if (!property) return null;

                  return (
                    <Card key={match.id} className="overflow-hidden">
                      <CardContent className="p-6">
                        <div className="flex gap-6">
                          <div className="w-64 h-48 flex-shrink-0 rounded-lg overflow-hidden">
                            <img
                              src={property.property_images?.find((img: any) => img.is_primary)?.image_url || '/placeholder.svg'}
                              alt={property.title}
                              className="w-full h-full object-cover"
                            />
                          </div>

                          <div className="flex-1 space-y-4">
                            <div>
                              <div className="flex items-start justify-between mb-2">
                                <div>
                                  <h3 className="text-xl font-semibold mb-1">{property.title}</h3>
                                  <p className="text-muted-foreground">{property.location}</p>
                                </div>
                                <MatchBadge score={match.match_score} />
                              </div>
                              <p className="text-sm text-muted-foreground line-clamp-2">
                                {property.description}
                              </p>
                            </div>

                            <MatchReasons 
                              reasons={match.match_reasons}
                              recommendation={match.ai_recommendation}
                            />

                            <div className="flex gap-3">
                              <Button onClick={() => handleViewProperty(property.id)}>
                                View Property
                              </Button>
                              <Button variant="outline">
                                Apply Now
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </TabsContent>

            <TabsContent value="good" className="space-y-6">
              {goodMatches.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-8">
                    <p className="text-muted-foreground">No good matches yet</p>
                  </CardContent>
                </Card>
              ) : (
                goodMatches.map(match => {
                  const property = getPropertyForMatch(match.property_id);
                  if (!property) return null;

                  return (
                    <Card key={match.id} className="overflow-hidden">
                      <CardContent className="p-6">
                        <div className="flex gap-6">
                          <div className="w-64 h-48 flex-shrink-0 rounded-lg overflow-hidden">
                            <img
                              src={property.property_images?.find((img: any) => img.is_primary)?.image_url || '/placeholder.svg'}
                              alt={property.title}
                              className="w-full h-full object-cover"
                            />
                          </div>

                          <div className="flex-1 space-y-4">
                            <div>
                              <div className="flex items-start justify-between mb-2">
                                <div>
                                  <h3 className="text-xl font-semibold mb-1">{property.title}</h3>
                                  <p className="text-muted-foreground">{property.location}</p>
                                </div>
                                <MatchBadge score={match.match_score} />
                              </div>
                              <p className="text-sm text-muted-foreground line-clamp-2">
                                {property.description}
                              </p>
                            </div>

                            <MatchReasons 
                              reasons={match.match_reasons}
                              recommendation={match.ai_recommendation}
                            />

                            <div className="flex gap-3">
                              <Button onClick={() => handleViewProperty(property.id)}>
                                View Property
                              </Button>
                              <Button variant="outline">
                                Apply Now
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
};

export default MyMatches;