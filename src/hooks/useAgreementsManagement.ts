import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export const useAgreementsManagement = () => {
  const { data: agreements, isLoading, refetch } = useQuery({
    queryKey: ["admin-agreements"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("collaboration_agreements")
        .select(`
          id, host_id, influencer_id, application_id, status,
          agreed_rate, currency, deliverable_count, deadline,
          agreed_at, created_at, updated_at, affiliate_commission_rate,
          application:applications(
            id, proposed_dates_start, proposed_dates_end,
            influencer:influencers(
              id,
              profiles:profiles(id, first_name, last_name, username)
            ),
            property:properties(
              id, title, property_type,
              host:hosts(
                id,
                profiles:profiles(id, first_name, last_name, username)
              )
            )
          )
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      
      // Transform data to match expected structure
      return data?.map(agreement => ({
        ...agreement,
        host: agreement.application?.property?.host,
        influencer: agreement.application?.influencer,
      })) as any;
    },
  });

  const stats = {
    total: agreements?.length || 0,
    active: agreements?.filter(a => a.status === 'active').length || 0,
    pending: agreements?.filter(a => ['pending', 'pending_host', 'pending_influencer'].includes(a.status)).length || 0,
    pendingHost: agreements?.filter(a => a.status === 'pending_host').length || 0,
    pendingInfluencer: agreements?.filter(a => a.status === 'pending_influencer').length || 0,
    completed: agreements?.filter(a => a.status === 'completed').length || 0,
    cancelled: agreements?.filter(a => a.status === 'cancelled').length || 0,
    totalValue: agreements?.reduce((sum, a) => sum + (a.agreed_rate || 0), 0) || 0,
  };

  const toggleAgreementStatus = async (id: string, newStatus: string) => {
    const { error } = await supabase
      .from("collaboration_agreements")
      .update({ status: newStatus })
      .eq("id", id);

    if (error) throw error;
    refetch();
  };

  // Real-time subscription for automatic updates
  useEffect(() => {
    const channel = supabase
      .channel('collaboration-agreements-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'collaboration_agreements'
        },
        () => {
          refetch();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [refetch]);

  return {
    agreements,
    isLoading,
    stats,
    toggleAgreementStatus,
    refetch,
  };
};
