import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface GeographicMetrics {
  location: string;
  users: number;
  properties: number;
  revenue: number;
  latitude?: number;
  longitude?: number;
}

export const useGeographicData = () => {
  return useQuery({
    queryKey: ['geographic-data'],
    queryFn: async () => {
      // Get users by location
      const { data: profiles } = await supabase
        .from('profiles')
        .select('location');

      // Get properties by location
      const { data: properties } = await supabase
        .from('properties')
        .select('location');

      // Aggregate by location
      const locationMap = new Map<string, GeographicMetrics>();

      profiles?.forEach(p => {
        if (p.location) {
          const existing = locationMap.get(p.location) || {
            location: p.location,
            users: 0,
            properties: 0,
            revenue: 0,
          };
          existing.users++;
          locationMap.set(p.location, existing);
        }
      });

      properties?.forEach(p => {
        if (p.location) {
          const existing = locationMap.get(p.location) || {
            location: p.location,
            users: 0,
            properties: 0,
            revenue: 0,
          };
          existing.properties++;
          locationMap.set(p.location, existing);
        }
      });

      return Array.from(locationMap.values()).sort((a, b) => b.users - a.users);
    },
  });
};
