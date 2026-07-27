import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ReferralCode {
  id: string;
  code: string;
  is_active: boolean;
  created_at: string;
}

interface Referral {
  id: string;
  referred_user_id: string;
  status: string;
  created_at: string;
  profiles: {
    first_name: string;
    last_name: string;
  } | null;
  subscriptions: {
    status: string;
    plan_id: string;
    subscription_plans: {
      name: string;
      price_monthly: number;
    } | null;
  } | null;
}

interface Commission {
  id: string;
  commission_amount: number;
  subscription_period_start: string;
  subscription_period_end: string;
  status: string;
  paid_at: string | null;
}

export const useReferrals = () => {
  const [referralCode, setReferralCode] = useState<ReferralCode | null>(null);
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    totalReferrals: 0,
    activeReferrals: 0,
    totalCommissions: 0,
    pendingCommissions: 0,
    paidCommissions: 0
  });
  const { toast } = useToast();

  const fetchReferralCode = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('referral_codes')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .maybeSingle();

      if (error) {
        console.error('Error fetching referral code:', error);
        return;
      }

      setReferralCode(data);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const generateReferralCode = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Error",
          description: "You must be logged in to generate a referral code",
          variant: "destructive"
        });
        return;
      }

      // Generate code using database function
      const { data: codeData, error: codeError } = await supabase
        .rpc('generate_referral_code', { p_user_id: user.id });

      if (codeError) {
        toast({
          title: "Error",
          description: "Failed to generate referral code",
          variant: "destructive"
        });
        return;
      }

      // Insert the new code
      const { data, error } = await supabase
        .from('referral_codes')
        .insert({
          user_id: user.id,
          code: codeData,
          is_active: true
        })
        .select()
        .single();

      if (error) {
        toast({
          title: "Error", 
          description: "Failed to save referral code",
          variant: "destructive"
        });
        return;
      }

      setReferralCode(data);
      toast({
        title: "Success",
        description: "Referral code generated successfully!",
      });
    } catch (error) {
      console.error('Error generating referral code:', error);
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchReferrals = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('referrals')
        .select(`
          id,
          referred_user_id,
          status,
          created_at,
          profiles!referred_user_id(first_name, last_name),
          subscriptions!subscription_id(
            status,
            plan_id,
            subscription_plans!plan_id(name, price_monthly)
          )
        `)
        .eq('referrer_id', user.id);

      if (error) {
        console.error('Error fetching referrals:', error);
        return;
      }

      setReferrals(data || []);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const fetchCommissions = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('referral_commissions')
        .select('*')
        .eq('referrer_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching commissions:', error);
        return;
      }

      setCommissions(data || []);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const calculateStats = () => {
    const totalReferrals = referrals.length;
    const activeReferrals = referrals.filter(r => r.subscriptions?.status === 'active').length;
    const totalCommissions = commissions.reduce((sum, c) => sum + c.commission_amount, 0);
    const pendingCommissions = commissions.filter(c => c.status === 'pending').reduce((sum, c) => sum + c.commission_amount, 0);
    const paidCommissions = commissions.filter(c => c.status === 'paid').reduce((sum, c) => sum + c.commission_amount, 0);

    setStats({
      totalReferrals,
      activeReferrals,
      totalCommissions,
      pendingCommissions,
      paidCommissions
    });
  };

  useEffect(() => {
    fetchReferralCode();
    fetchReferrals();
    fetchCommissions();
  }, []);

  useEffect(() => {
    calculateStats();
  }, [referrals, commissions]);

  const refetch = () => {
    fetchReferralCode();
    fetchReferrals(); 
    fetchCommissions();
  };

  return {
    referralCode,
    referrals,
    commissions,
    stats,
    loading,
    generateReferralCode,
    refetch
  };
};