
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Property {
  id: string;
  title: string;
  location: string;
  property_type: string;
  max_guests: number;
  collaboration_type: string;
  is_active: boolean;
  created_at: string;
  host_id: string;
  hosts: {
    profiles: {
      first_name: string;
      last_name: string;
    } | null;
  } | null;
}

export const usePropertiesData = () => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('properties')
        .select(`
          id, title, location, property_type, max_guests,
          collaboration_type, is_active, created_at, host_id,
          hosts (
            profiles (
              first_name,
              last_name
            )
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      const typedData = data as unknown as Property[];
      setProperties(typedData || []);
    } catch (error) {
      console.error('Error fetching properties:', error);
      toast({
        title: "Error",
        description: "Failed to load properties",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const togglePropertyStatus = async (propertyId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('properties')
        .update({ is_active: !currentStatus })
        .eq('id', propertyId);

      if (error) throw error;

      setProperties(properties.map(property => 
        property.id === propertyId 
          ? { ...property, is_active: !currentStatus }
          : property
      ));

      toast({
        title: "Success",
        description: `Property ${!currentStatus ? 'activated' : 'deactivated'} successfully`,
      });
    } catch (error) {
      console.error('Error updating property status:', error);
      toast({
        title: "Error",
        description: "Failed to update property status",
        variant: "destructive",
      });
    }
  };

  return {
    properties,
    loading,
    togglePropertyStatus,
    refetch: fetchProperties
  };
};
