
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface Application {
  id: string;
  status: string;
  proposal_message: string;
  proposed_dates_start: string;
  proposed_dates_end: string;
  content_deliverables?: string[];
  content_delivery_status: string;
  created_at: string;
  influencer_id: string;
  property_id: string;
  influencers: {
    id: string;
    total_followers?: number;
    engagement_rate?: number;
    content_niches?: string[];
    instagram_url?: string;
    tiktok_url?: string;
    youtube_url?: string;
    twitter_url?: string;
    profiles: {
      first_name?: string;
      last_name?: string;
      username?: string;
      bio?: string;
      location?: string;
      profile_photo_url?: string;
    } | null;
  } | null;
  properties: {
    title: string;
    location: string;
    hosts: {
      profiles: {
        first_name: string;
        last_name: string;
      } | null;
    } | null;
  } | null;
}

export const useApplications = () => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('applications')
        .select(`
          *,
          influencers (
            id,
            total_followers,
            engagement_rate,
            content_niches,
            instagram_url,
            tiktok_url,
            youtube_url,
            twitter_url,
            profiles (
              first_name,
              last_name,
              username,
              bio,
              location,
            profile_photo_url
            )
          ),
          properties (
            title,
            location,
            hosts (
              profiles (
                first_name,
                last_name
              )
            )
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Type assertion to ensure proper typing
      const typedData = data as unknown as Application[];
      setApplications(typedData || []);
    } catch (error) {
      console.error('Error fetching applications:', error);
      toast({
        title: "Error",
        description: "Failed to load applications",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateApplicationStatus = async (applicationId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('applications')
        .update({ status: newStatus })
        .eq('id', applicationId);

      if (error) throw error;

      setApplications(applications.map(app => 
        app.id === applicationId 
          ? { ...app, status: newStatus }
          : app
      ));

      toast({
        title: "Success",
        description: `Application ${newStatus} successfully`,
      });
    } catch (error) {
      console.error('Error updating application status:', error);
      toast({
        title: "Error",
        description: "Failed to update application status",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  return {
    applications,
    loading,
    updateApplicationStatus
  };
};
