import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface AmbassadorWithProfile {
  id: string;
  user_id: string;
  referral_code: string;
  status: string;
  current_tier: string | null;
  tier_override: string | null;
  commission_override: number | null;
  tier_points: number | null;
  monthly_requirements_met: boolean | null;
  joined_at: string | null;
  created_at: string | null;
  admin_notes: string | null;
  profile?: {
    first_name: string | null;
    last_name: string | null;
  } | null;
  referrals_count?: number;
  total_earnings?: number;
}

export interface AmbassadorBonus {
  id: string;
  ambassador_id: string;
  amount: number;
  reason: string;
  awarded_by: string | null;
  status: string;
  paid_at: string | null;
  created_at: string;
}

export interface AmbassadorAnnouncement {
  id: string;
  title: string;
  content: string;
  priority: string;
  target_tiers: string[];
  scheduled_for: string | null;
  sent_at: string | null;
  created_by: string | null;
  is_active: boolean;
  created_at: string;
}

export interface AmbassadorFilters {
  status?: string;
  tier?: string;
  search?: string;
  requirementsMet?: boolean;
}

export function useAmbassadorAdmin() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);

  // Fetch all ambassadors with profiles
  const { data: ambassadors, isLoading: ambassadorsLoading, refetch: refetchAmbassadors } = useQuery({
    queryKey: ['admin-ambassadors'],
    queryFn: async () => {
      const { data: members, error } = await supabase
        .from('ambassador_members')
        .select(`
          *,
          profile:profiles!ambassador_members_user_id_fkey(
            first_name,
            last_name
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Fetch referrals count and earnings for each ambassador
      const enrichedMembers = await Promise.all(
        (members || []).map(async (member) => {
          const { count: referralsCount } = await supabase
            .from('ambassador_referrals')
            .select('*', { count: 'exact', head: true })
            .eq('ambassador_id', member.id);

          const { data: earnings } = await supabase
            .from('ambassador_earnings')
            .select('amount')
            .eq('ambassador_id', member.id)
            .eq('status', 'paid');

          const totalEarnings = earnings?.reduce((sum, e) => sum + Number(e.amount), 0) || 0;

          return {
            ...member,
            referrals_count: referralsCount || 0,
            total_earnings: totalEarnings,
          };
        })
      );

      return enrichedMembers as AmbassadorWithProfile[];
    },
  });

  // Fetch ambassador stats
  const { data: stats } = useQuery({
    queryKey: ['admin-ambassador-stats'],
    queryFn: async () => {
      const { count: total } = await supabase
        .from('ambassador_members')
        .select('*', { count: 'exact', head: true });

      const { count: active } = await supabase
        .from('ambassador_members')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active');

      const { count: pending } = await supabase
        .from('ambassador_members')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');

      const { data: earnings } = await supabase
        .from('ambassador_earnings')
        .select('amount')
        .eq('status', 'paid');

      const totalPaid = earnings?.reduce((sum, e) => sum + Number(e.amount), 0) || 0;

      return {
        total: total || 0,
        active: active || 0,
        pending: pending || 0,
        totalPaid,
      };
    },
  });

  // Update ambassador status
  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase
        .from('ambassador_members')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-ambassadors'] });
      queryClient.invalidateQueries({ queryKey: ['admin-ambassador-stats'] });
      toast({ title: 'Status updated successfully' });
    },
    onError: (error) => {
      toast({ title: 'Failed to update status', description: String(error), variant: 'destructive' });
    },
  });

  // Update commission override
  const updateCommissionMutation = useMutation({
    mutationFn: async ({ id, commission_override }: { id: string; commission_override: number | null }) => {
      const { error } = await supabase
        .from('ambassador_members')
        .update({ commission_override, updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-ambassadors'] });
      toast({ title: 'Commission rate updated' });
    },
    onError: (error) => {
      toast({ title: 'Failed to update commission', description: String(error), variant: 'destructive' });
    },
  });

  // Update tier override
  const updateTierMutation = useMutation({
    mutationFn: async ({ id, tier_override }: { id: string; tier_override: string | null }) => {
      const { error } = await supabase
        .from('ambassador_members')
        .update({ tier_override, updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-ambassadors'] });
      toast({ title: 'Tier updated successfully' });
    },
    onError: (error) => {
      toast({ title: 'Failed to update tier', description: String(error), variant: 'destructive' });
    },
  });

  // Update admin notes
  const updateNotesMutation = useMutation({
    mutationFn: async ({ id, admin_notes }: { id: string; admin_notes: string }) => {
      const { error } = await supabase
        .from('ambassador_members')
        .update({ admin_notes, updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-ambassadors'] });
      toast({ title: 'Notes updated' });
    },
  });

  // Award bonus
  const awardBonusMutation = useMutation({
    mutationFn: async ({ 
      ambassador_id, 
      amount, 
      reason 
    }: { 
      ambassador_id: string; 
      amount: number; 
      reason: string;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error } = await supabase
        .from('ambassador_bonuses')
        .insert({
          ambassador_id,
          amount,
          reason,
          awarded_by: user?.id,
          status: 'pending',
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-ambassador-bonuses'] });
      toast({ title: 'Bonus awarded successfully' });
    },
    onError: (error) => {
      toast({ title: 'Failed to award bonus', description: String(error), variant: 'destructive' });
    },
  });

  // Fetch bonuses
  const { data: bonuses, isLoading: bonusesLoading } = useQuery({
    queryKey: ['admin-ambassador-bonuses'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ambassador_bonuses')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as AmbassadorBonus[];
    },
  });

  // Update bonus status
  const updateBonusStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const updates: Record<string, unknown> = { status };
      if (status === 'paid') {
        updates.paid_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('ambassador_bonuses')
        .update(updates)
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-ambassador-bonuses'] });
      toast({ title: 'Bonus status updated' });
    },
  });

  // Create announcement
  const createAnnouncementMutation = useMutation({
    mutationFn: async ({
      title,
      content,
      priority = 'normal',
      target_tiers = [],
      scheduled_for,
    }: {
      title: string;
      content: string;
      priority?: string;
      target_tiers?: string[];
      scheduled_for?: string | null;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();

      const { error } = await supabase
        .from('ambassador_announcements')
        .insert({
          title,
          content,
          priority,
          target_tiers,
          scheduled_for,
          sent_at: scheduled_for ? null : new Date().toISOString(),
          created_by: user?.id,
          is_active: true,
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-ambassador-announcements'] });
      toast({ title: 'Announcement created' });
    },
    onError: (error) => {
      toast({ title: 'Failed to create announcement', description: String(error), variant: 'destructive' });
    },
  });

  // Fetch announcements
  const { data: announcements, isLoading: announcementsLoading } = useQuery({
    queryKey: ['admin-ambassador-announcements'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ambassador_announcements')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as AmbassadorAnnouncement[];
    },
  });

  // Update announcement
  const updateAnnouncementMutation = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase
        .from('ambassador_announcements')
        .update({ is_active, updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-ambassador-announcements'] });
      toast({ title: 'Announcement updated' });
    },
  });

  // Fetch referrals for an ambassador
  const fetchReferrals = async (ambassadorId: string) => {
    const { data, error } = await supabase
      .from('ambassador_referrals')
      .select(`
        *,
        referred_user:profiles!ambassador_referrals_referred_user_id_fkey(
          first_name,
          last_name
        )
      `)
      .eq('ambassador_id', ambassadorId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  };

  // Update referral
  const updateReferralMutation = useMutation({
    mutationFn: async ({ 
      id, 
      updates 
    }: { 
      id: string; 
      updates: { conversion_stage?: string; status?: string } 
    }) => {
      const { error } = await supabase
        .from('ambassador_referrals')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: 'Referral updated' });
    },
    onError: (error) => {
      toast({ title: 'Failed to update referral', description: String(error), variant: 'destructive' });
    },
  });

  // Add manual referral
  const addManualReferralMutation = useMutation({
    mutationFn: async ({
      ambassador_id,
      referred_user_id,
      conversion_stage,
      source_channel,
    }: {
      ambassador_id: string;
      referred_user_id: string;
      conversion_stage: string;
      source_channel?: string;
    }) => {
      const { error } = await supabase
        .from('ambassador_referrals')
        .insert({
          ambassador_id,
          referred_user_id,
          conversion_stage,
          source_channel: source_channel || 'manual_admin',
          status: 'active',
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-ambassadors'] });
      toast({ title: 'Manual referral added' });
    },
    onError: (error) => {
      toast({ title: 'Failed to add referral', description: String(error), variant: 'destructive' });
    },
  });

  // Fetch tiers
  const { data: tiers } = useQuery({
    queryKey: ['ambassador-tiers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ambassador_tiers')
        .select('*')
        .order('display_order', { ascending: true });

      if (error) throw error;
      return data;
    },
  });

  // Update tier thresholds
  const updateTierThresholdsMutation = useMutation({
    mutationFn: async ({
      id,
      updates,
    }: {
      id: string;
      updates: { min_referrals?: number; min_earnings?: number; commission_bonus?: number };
    }) => {
      const { error } = await supabase
        .from('ambassador_tiers')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ambassador-tiers'] });
      toast({ title: 'Tier thresholds updated' });
    },
    onError: (error) => {
      toast({ title: 'Failed to update tier', description: String(error), variant: 'destructive' });
    },
  });

  // Bulk update status
  const bulkUpdateStatusMutation = useMutation({
    mutationFn: async ({ ids, status }: { ids: string[]; status: string }) => {
      const { error } = await supabase
        .from('ambassador_members')
        .update({ status, updated_at: new Date().toISOString() })
        .in('id', ids);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-ambassadors'] });
      queryClient.invalidateQueries({ queryKey: ['admin-ambassador-stats'] });
      toast({ title: 'Bulk status update complete' });
    },
    onError: (error) => {
      toast({ title: 'Bulk update failed', description: String(error), variant: 'destructive' });
    },
  });

  return {
    // Data
    ambassadors,
    stats,
    bonuses,
    announcements,
    tiers,
    
    // Loading states
    isLoading: ambassadorsLoading || isLoading,
    bonusesLoading,
    announcementsLoading,
    
    // Refetch
    refetchAmbassadors,
    
    // Mutations
    updateStatus: updateStatusMutation.mutate,
    updateCommission: updateCommissionMutation.mutate,
    updateTier: updateTierMutation.mutate,
    updateNotes: updateNotesMutation.mutate,
    awardBonus: awardBonusMutation.mutate,
    updateBonusStatus: updateBonusStatusMutation.mutate,
    createAnnouncement: createAnnouncementMutation.mutate,
    updateAnnouncement: updateAnnouncementMutation.mutate,
    updateReferral: updateReferralMutation.mutate,
    addManualReferral: addManualReferralMutation.mutate,
    updateTierThresholds: updateTierThresholdsMutation.mutate,
    bulkUpdateStatus: bulkUpdateStatusMutation.mutate,
    
    // Async fetchers
    fetchReferrals,
    
    // Mutation states
    isUpdating: 
      updateStatusMutation.isPending ||
      updateCommissionMutation.isPending ||
      updateTierMutation.isPending ||
      awardBonusMutation.isPending ||
      createAnnouncementMutation.isPending ||
      bulkUpdateStatusMutation.isPending,
  };
}
