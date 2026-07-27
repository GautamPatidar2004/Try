import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Property {
  id: string;
  title: string;
  description?: string;
  location: string;
  property_type: string;
  max_guests: number;
  bedrooms?: number;
  bathrooms?: number;
  amenities?: string[];
  collaboration_type: string;
  discount_percentage?: number;
  content_requirements?: string[];
  is_active: boolean;
  created_at: string;
  host_id: string;
  hosts: {
    business_name?: string;
    profiles: {
      first_name: string;
      last_name: string;
    } | null;
  } | null;
  property_images?: Array<{
    image_url: string;
    is_primary: boolean;
    display_order?: number;
  }>;
  applications_count?: number;
  collaborations_count?: number;
}

interface PropertyStats {
  totalProperties: number;
  activeProperties: number;
  inactiveProperties: number;
  totalApplications: number;
  averageApplicationsPerProperty: number;
  byType: { name: string; value: number }[];
  byCollaboration: { name: string; count: number }[];
  topProperties: Array<{
    id: string;
    title: string;
    location: string;
    applications_count: number;
    collaboration_type: string;
  }>;
}

export const usePropertiesManagement = () => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [stats, setStats] = useState<PropertyStats | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    try {
      setLoading(true);
      
      // Fetch properties with related data
      const { data: propertiesData, error: propertiesError } = await supabase
        .from('properties')
        .select(`
          *,
          hosts (
            business_name,
            profiles (
              first_name,
              last_name
            )
          ),
          property_images (
           id,
            image_url,
            is_primary,
            display_order
          )
        `)
        .order('created_at', { ascending: false });

      if (propertiesError) throw propertiesError;

      // Fetch application counts for each property
      const { data: applicationCounts, error: appError } = await supabase
        .from('applications')
        .select('property_id');

      if (appError) throw appError;

      // Map application counts to properties
      const appCountMap = (applicationCounts || []).reduce((acc, app) => {
        acc[app.property_id] = (acc[app.property_id] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const enrichedProperties = (propertiesData || []).map(prop => ({
        ...prop,
        applications_count: appCountMap[prop.id] || 0,
        collaborations_count: 0, // Will be populated if needed
      })) as Property[];

      setProperties(enrichedProperties);
      calculateStats(enrichedProperties);
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

  const calculateStats = (props: Property[]) => {
    const totalProperties = props.length;
    const activeProperties = props.filter(p => p.is_active).length;
    const inactiveProperties = totalProperties - activeProperties;
    
    const totalApplications = props.reduce((sum, p) => sum + (p.applications_count || 0), 0);
    const averageApplicationsPerProperty = totalProperties > 0 
      ? Math.round(totalApplications / totalProperties) 
      : 0;

    // Group by type
    const typeGroups = props.reduce((acc, p) => {
      acc[p.property_type] = (acc[p.property_type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const byType = Object.entries(typeGroups).map(([name, value]) => ({
      name: name.replace('_', ' '),
      value
    }));

    // Group by collaboration type
    const collabGroups = props.reduce((acc, p) => {
      acc[p.collaboration_type] = (acc[p.collaboration_type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const byCollaboration = Object.entries(collabGroups).map(([name, count]) => ({
      name,
      count
    }));

    // Top 5 properties by applications
    const topProperties = [...props]
      .sort((a, b) => (b.applications_count || 0) - (a.applications_count || 0))
      .slice(0, 5)
      .map(p => ({
        id: p.id,
        title: p.title,
        location: p.location,
        applications_count: p.applications_count || 0,
        collaboration_type: p.collaboration_type
      }));

    setStats({
      totalProperties,
      activeProperties,
      inactiveProperties,
      totalApplications,
      averageApplicationsPerProperty,
      byType,
      byCollaboration,
      topProperties
    });
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

  const bulkUpdateStatus = async (propertyIds: string[], newStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('properties')
        .update({ is_active: newStatus })
        .in('id', propertyIds);

      if (error) throw error;

      setProperties(properties.map(property =>
        propertyIds.includes(property.id)
          ? { ...property, is_active: newStatus }
          : property
      ));

      toast({
        title: "Success",
        description: `${propertyIds.length} properties updated successfully`,
      });
    } catch (error) {
      console.error('Error bulk updating properties:', error);
      toast({
        title: "Error",
        description: "Failed to update properties",
        variant: "destructive",
      });
    }
  };

  return {
    properties,
    stats,
    loading,
    togglePropertyStatus,
    bulkUpdateStatus,
    refetch: fetchProperties
  };
};
