import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface HostSearchResult {
  id: string;
  business_name: string | null;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
}

export const useHostSearch = () => {
  const [results, setResults] = useState<HostSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchHosts = useCallback(async (query: string) => {
    if (!query || query.length < 2) {
      setResults([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Fetch all hosts with their profile info
      // Note: We filter client-side because PostgREST doesn't support .or() on joined table columns
      const { data: hostsData, error: hostsError } = await supabase
        .from('hosts')
        .select(`
          id,
          business_name,
          profiles (
            first_name,
            last_name
          )
        `)
        .limit(100);

      if (hostsError) {
        console.error('Host search error:', hostsError);
        setError('Failed to search hosts');
        setResults([]);
        return;
      }

      // Filter client-side for matches
      const lowerQuery = query.toLowerCase();
      const filteredResults = (hostsData || [])
        .filter((host: any) => {
          const businessMatch = host.business_name?.toLowerCase().includes(lowerQuery);
          const firstNameMatch = host.profiles?.first_name?.toLowerCase().includes(lowerQuery);
          const lastNameMatch = host.profiles?.last_name?.toLowerCase().includes(lowerQuery);
          const fullName = `${host.profiles?.first_name || ''} ${host.profiles?.last_name || ''}`.toLowerCase();
          const fullNameMatch = fullName.includes(lowerQuery);
          
          return businessMatch || firstNameMatch || lastNameMatch || fullNameMatch;
        })
        .slice(0, 20);

      // Transform to flat structure
      const transformedResults: HostSearchResult[] = filteredResults.map((host: any) => ({
        id: host.id,
        business_name: host.business_name,
        first_name: host.profiles?.first_name || null,
        last_name: host.profiles?.last_name || null,
        email: null, // Email not available without auth.users access
      }));

      setResults(transformedResults);
    } catch (err) {
      console.error('Host search exception:', err);
      setError('An error occurred while searching');
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const clearResults = useCallback(() => {
    setResults([]);
    setError(null);
  }, []);

  return {
    searchHosts,
    clearResults,
    results,
    loading,
    error,
  };
};
