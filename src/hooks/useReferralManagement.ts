import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ReferralCode {
  id: string;
  code: string;
  user_id: string;
  is_active: boolean;
  created_at: string;
  current_tier: string | null;
  profiles: {
    first_name: string;
    last_name: string;
    email?: string;
  } | null;
}

interface Referral {
  id: string;
  ambassador_id: string;
  referred_user_id: string;
  status: string;
  conversion_stage: string;
  referral_type: string;
  created_at: string;
  signup_date: string;
  total_earned: number;
  subscription_tier: string | null;
  ambassador: {
    referral_code: string;
    user_id: string;
    profiles: {
      first_name: string;
      last_name: string;
    } | null;
  } | null;
  referred_user: {
    first_name: string;
    last_name: string;
  } | null;
}

interface Commission {
  id: string;
  ambassador_id: string;
  referral_id: string;
  commission_amount: number;
  status: string;
  created_at: string;
  paid_at: string | null;
  subscription_period_start: string;
  subscription_period_end: string;
  admin_notes: string | null;
  referrer: {
    first_name: string;
    last_name: string;
  } | null;
}

interface ReferralStats {
  totalReferrals: number;
  activeReferrals: number;
  totalCommissionsPaid: number;
  pendingCommissions: number;
  conversionRate: number;
}

export const useReferralManagement = () => {
  const [referralCodes, setReferralCodes] = useState<ReferralCode[]>([]);
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [stats, setStats] = useState<ReferralStats>({
    totalReferrals: 0,
    activeReferrals: 0,
    totalCommissionsPaid: 0,
    pendingCommissions: 0,
    conversionRate: 0
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchReferralCodes = async () => {
    try {
      // Query ambassador_members for referral codes
      const { data, error } = await supabase
        .from('ambassador_members')
        .select(`
          id,
          referral_code,
          user_id,
          status,
          current_tier,
          created_at,
          profiles:user_id(first_name, last_name)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Transform to match expected interface
      const transformedData = (data || []).map(member => ({
        id: member.id,
        code: member.referral_code,
        user_id: member.user_id,
        is_active: member.status === 'active',
        created_at: member.created_at,
        current_tier: member.current_tier,
        profiles: member.profiles
      }));
      
      setReferralCodes(transformedData);
    } catch (error) {
      console.error('Error fetching referral codes:', error);
    }
  };

  const fetchReferrals = async () => {
    try {
      // Query ambassador_referrals for actual referral data
      const { data, error } = await supabase
        .from('ambassador_referrals')
        .select(`
          id,
          ambassador_id,
          referred_user_id,
          status,
          conversion_stage,
          referral_type,
          created_at,
          signup_date,
          total_earned,
          subscription_tier,
          ambassador:ambassador_id(
            referral_code,
            user_id,
            profiles:user_id(first_name, last_name)
          ),
          referred_user:referred_user_id(first_name, last_name)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setReferrals(data || []);
    } catch (error) {
      console.error('Error fetching referrals:', error);
    }
  };

  const fetchCommissions = async () => {
    try {
      // Query ambassador_earnings for commission data
      const { data, error } = await supabase
        .from('ambassador_earnings')
        .select(`
          id,
          ambassador_id,
          amount,
          earning_type,
          status,
          created_at,
          payment_date,
          ambassador:ambassador_id(
            user_id,
            profiles:user_id(first_name, last_name)
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Transform to match expected interface
      const transformedData = (data || []).map(earning => ({
        id: earning.id,
        ambassador_id: earning.ambassador_id,
        referral_id: earning.id, // Use same ID since there's no separate referral_id
        commission_amount: earning.amount * 100, // Convert to cents for display consistency
        status: earning.status || 'pending',
        created_at: earning.created_at,
        paid_at: earning.payment_date,
        subscription_period_start: earning.created_at,
        subscription_period_end: earning.created_at,
        admin_notes: null,
        referrer: earning.ambassador?.profiles || null
      }));
      
      setCommissions(transformedData);
    } catch (error) {
      console.error('Error fetching commissions:', error);
    }
  };

  const calculateStats = () => {
    const totalReferrals = referrals.length;
    const activeReferrals = referrals.filter(r => 
      r.conversion_stage === 'subscription' || r.conversion_stage === 'active'
    ).length;
    
    // Sum up total_earned from referrals
    const totalEarned = referrals.reduce((sum, r) => sum + (Number(r.total_earned) || 0), 0);
    
    // Get paid vs pending from commissions
    const totalCommissionsPaid = commissions
      .filter(c => c.status === 'paid')
      .reduce((sum, c) => sum + c.commission_amount, 0);
    const pendingCommissions = commissions
      .filter(c => c.status === 'pending')
      .reduce((sum, c) => sum + c.commission_amount, 0);
    
    const conversionRate = totalReferrals > 0 ? (activeReferrals / totalReferrals) * 100 : 0;

    setStats({
      totalReferrals,
      activeReferrals,
      totalCommissionsPaid: totalCommissionsPaid / 100, // Convert from cents
      pendingCommissions: pendingCommissions / 100,
      conversionRate
    });
  };

  const toggleCodeStatus = async (codeId: string, isActive: boolean) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('ambassador_members')
        .update({ status: isActive ? 'inactive' : 'active' })
        .eq('id', codeId);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Referral code ${isActive ? 'deactivated' : 'activated'} successfully`,
      });

      await fetchReferralCodes();
    } catch (error) {
      console.error('Error toggling code status:', error);
      toast({
        title: "Error",
        description: "Failed to update referral code status",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const updateCommissionStatus = async (commissionId: string, status: string, adminNotes?: string) => {
    setLoading(true);
    try {
      const updateData: any = { 
        status,
      };
      
      if (status === 'paid') {
        updateData.payment_date = new Date().toISOString();
      }

      const { error } = await supabase
        .from('ambassador_earnings')
        .update(updateData)
        .eq('id', commissionId);

      if (error) throw error;

      // Log admin activity
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from('admin_activity_log').insert({
          admin_id: user.id,
          action: 'update_commission',
          target_type: 'ambassador_earning',
          target_id: commissionId,
          details: { status, admin_notes: adminNotes }
        });
      }

      toast({
        title: "Success",
        description: `Commission ${status === 'paid' ? 'marked as paid' : 'updated'} successfully`,
      });

      await fetchCommissions();
    } catch (error) {
      console.error('Error updating commission:', error);
      toast({
        title: "Error",
        description: "Failed to update commission",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getTopReferrers = () => {
    const referrerStats = referrals.reduce((acc, referral) => {
      const ambassadorId = referral.ambassador_id;
      const ambassador = referral.ambassador;
      
      if (!acc[ambassadorId]) {
        acc[ambassadorId] = {
          id: ambassadorId,
          name: ambassador?.profiles 
            ? `${ambassador.profiles.first_name} ${ambassador.profiles.last_name}` 
            : 'Unknown',
          code: ambassador?.referral_code || 'N/A',
          totalReferrals: 0,
          activeReferrals: 0,
          earnings: 0
        };
      }
      acc[ambassadorId].totalReferrals++;
      
      if (referral.conversion_stage === 'subscription' || referral.conversion_stage === 'active') {
        acc[ambassadorId].activeReferrals++;
      }
      
      acc[ambassadorId].earnings += Number(referral.total_earned) || 0;
      
      return acc;
    }, {} as Record<string, any>);

    return Object.values(referrerStats)
      .sort((a, b) => b.totalReferrals - a.totalReferrals)
      .slice(0, 10);
  };

  useEffect(() => {
    fetchReferralCodes();
    fetchReferrals();
    fetchCommissions();
  }, []);

  useEffect(() => {
    calculateStats();
  }, [referrals, commissions]);

  const refetch = () => {
    fetchReferralCodes();
    fetchReferrals();
    fetchCommissions();
  };

  return {
    referralCodes,
    referrals,
    commissions,
    stats,
    loading,
    toggleCodeStatus,
    updateCommissionStatus,
    getTopReferrers,
    refetch
  };
};
