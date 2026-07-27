import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAIMatches } from "@/hooks/useAIMatches";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Building2, Sparkles, Loader2 } from "lucide-react";
import HostMatchSummary from "@/components/ai-matching/HostMatchSummary";
import CreatorMatchCard from "@/components/ai-matching/CreatorMatchCard";
import CalculateMatchesButton from "@/components/ai-matching/CalculateMatchesButton";

interface Property {
  id: string;
  title: string;
  property_type: string;
  location: string;
}

interface Creator {
  id: string;
  first_name: string;
  last_name: string;
  profile_photo_url: string | null;
  location: string | null;
  influencers: {
    total_followers: number;
    content_niches: string[];
  }[];
}

interface HostRecommendedCreatorsProps {
  hostId: string;
}

const HostRecommendedCreators = ({ hostId }: HostRecommendedCreatorsProps) => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [creators, setCreators] = useState<Record<string, Creator[]>>({});
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { matches, loading: matchesLoading, fetchMatches } = useAIMatches(hostId, 'host');

  useEffect(() => {
    fetchProperties();
  }, [hostId]);

  useEffect(() => {
    if (matches.length > 0 && properties.length > 0) {
      fetchCreators();
    }
  }, [matches, properties]);

  const fetchProperties = async () => {
    try {
      const { data, error } = await supabase
        .from('properties')
        .select('id, title, property_type, location')
        .eq('host_id', hostId)
        .eq('is_active', true);

      if (error) throw error;
      setProperties(data || []);
    } catch (error) {
      console.error('Error fetching properties:', error);
      toast({
        title: 'Error',
        description: 'Failed to load properties',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchCreators = async () => {
    try {
      const creatorsByProperty: Record<string, Creator[]> = {};

      for (const property of properties) {
        const propertyMatches = matches.filter(m => m.property_id === property.id);
        const creatorIds = propertyMatches.map(m => m.influencer_id);

        if (creatorIds.length > 0) {
          const { data, error } = await supabase
            .from('profiles')
            .select(`
              id,
              first_name,
              last_name,
              profile_photo_url,
              location,
              influencers (
                total_followers,
                content_niches
              )
            `)
            .in('id', creatorIds);

          if (error) throw error;
          creatorsByProperty[property.id] = (data || []) as unknown as Creator[];
        }
      }

      setCreators(creatorsByProperty);
    } catch (error) {
      console.error('Error fetching creators:', error);
    }
  };

  if (loading || matchesLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const totalMatches = matches.length;
  const perfectMatches = matches.filter(m => m.match_score >= 90).length;
  const excellentMatches = matches.filter(m => m.match_score >= 80 && m.match_score < 90).length;
  const propertiesWithMatches = Object.keys(creators).length;

  if (properties.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Building2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Properties Yet</h3>
          <p className="text-muted-foreground mb-4">
            Add properties to start finding matching creators
          </p>
        </CardContent>
      </Card>
    );
  }

  if (totalMatches === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Sparkles className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Find Your Perfect Creators</h3>
          <p className="text-muted-foreground mb-6">
            Use AI to discover creators that match your properties
          </p>
          <div className="flex flex-col gap-3 max-w-md mx-auto">
            {properties.map((property) => (
              <CalculateMatchesButton
                key={property.id}
                propertyId={property.id}
                propertyTitle={property.title}
                onComplete={fetchMatches}
                variant="default"
                fullWidth
              />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <HostMatchSummary
        totalMatches={totalMatches}
        perfectMatches={perfectMatches}
        excellentMatches={excellentMatches}
        propertiesWithMatches={propertiesWithMatches}
        totalProperties={properties.length}
      />

      {properties.map((property) => {
        const propertyMatches = matches
          .filter(m => m.property_id === property.id)
          .sort((a, b) => b.match_score - a.match_score)
          .slice(0, 5);
        
        const propertyCreators = creators[property.id] || [];

        if (propertyMatches.length === 0) {
          return (
            <Card key={property.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="h-5 w-5" />
                    {property.title}
                  </CardTitle>
                  <CalculateMatchesButton
                    propertyId={property.id}
                    propertyTitle={property.title}
                    onComplete={fetchMatches}
                  />
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground text-center py-4">
                  No matches calculated yet
                </p>
              </CardContent>
            </Card>
          );
        }

        return (
          <Card key={property.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  {property.title}
                </CardTitle>
                <Button variant="outline" size="sm" onClick={fetchMatches}>
                  Refresh Matches
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                {propertyMatches.length} matching creator{propertyMatches.length !== 1 ? 's' : ''} found
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {propertyMatches.map((match) => {
                  const creator = propertyCreators.find(c => c.id === match.influencer_id);
                  if (!creator) return null;

                  return (
                    <CreatorMatchCard
                      key={match.id}
                      creator={{
                        id: creator.id,
                        name: `${creator.first_name} ${creator.last_name}`,
                        avatar: creator.profile_photo_url || undefined,
                        location: creator.location || undefined,
                        followers: creator.influencers[0]?.total_followers || 0,
                        specialties: creator.influencers[0]?.content_niches || [],
                      }}
                      matchScore={match.match_score}
                      matchReasons={match.match_reasons}
                      aiRecommendation={match.ai_recommendation || ''}
                      propertyTitle={property.title}
                    />
                  );
                })}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default HostRecommendedCreators;
