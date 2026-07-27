import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface SocialAccount {
  id: string;
  influencer_id: string;
  platform: string;
  username: string;
  profile_url: string;
  follower_count: number;
  is_verified: boolean;
  last_updated: string;
  created_at: string;
  influencer?: {
    id: string;
    profiles?: {
      first_name: string;
      last_name: string;
      profile_photo_url: string;
    };
  };
}

export interface SocialAccountStats {
  total: number;
  verified: number;
  pending: number;
  totalReach: number;
  platformBreakdown: { platform: string; count: number }[];
}

export const useSocialAccountsManagement = () => {
  const [accounts, setAccounts] = useState<SocialAccount[]>([]);
  const [filteredAccounts, setFilteredAccounts] = useState<SocialAccount[]>([]);
  const [stats, setStats] = useState<SocialAccountStats>({
    total: 0,
    verified: 0,
    pending: 0,
    totalReach: 0,
    platformBreakdown: [],
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [platformFilter, setPlatformFilter] = useState<string>('all');
  const [verificationFilter, setVerificationFilter] = useState<string>('all');

  const fetchAccounts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('social_accounts')
        .select(`
          *,
          influencer:influencers!influencer_id(
            id,
            profiles(first_name, last_name, profile_photo_url)
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setAccounts(data || []);
      calculateStats(data || []);
    } catch (error: any) {
      console.error('Error fetching social accounts:', error);
      toast.error('Failed to load social accounts');
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (data: SocialAccount[]) => {
    const verified = data.filter(a => a.is_verified).length;
    const totalReach = data.reduce((sum, a) => sum + (a.follower_count || 0), 0);
    
    const platformCounts = data.reduce((acc, account) => {
      acc[account.platform] = (acc[account.platform] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const platformBreakdown = Object.entries(platformCounts).map(([platform, count]) => ({
      platform,
      count,
    }));

    setStats({
      total: data.length,
      verified,
      pending: data.length - verified,
      totalReach,
      platformBreakdown,
    });
  };

  const applyFilters = () => {
    let filtered = [...accounts];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(account => 
        account.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        account.influencer?.profiles?.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        account.influencer?.profiles?.last_name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Platform filter
    if (platformFilter !== 'all') {
      filtered = filtered.filter(account => account.platform === platformFilter);
    }

    // Verification filter
    if (verificationFilter === 'verified') {
      filtered = filtered.filter(account => account.is_verified);
    } else if (verificationFilter === 'pending') {
      filtered = filtered.filter(account => !account.is_verified);
    }

    setFilteredAccounts(filtered);
  };

  const verifyAccount = async (accountId: string) => {
    try {
      const { error } = await supabase
        .from('social_accounts')
        .update({ is_verified: true, last_updated: new Date().toISOString() })
        .eq('id', accountId);

      if (error) throw error;

      toast.success('Account verified successfully');
      fetchAccounts();
    } catch (error: any) {
      console.error('Error verifying account:', error);
      toast.error('Failed to verify account');
    }
  };

  const unverifyAccount = async (accountId: string) => {
    try {
      const { error } = await supabase
        .from('social_accounts')
        .update({ is_verified: false, last_updated: new Date().toISOString() })
        .eq('id', accountId);

      if (error) throw error;

      toast.success('Account unverified');
      fetchAccounts();
    } catch (error: any) {
      console.error('Error unverifying account:', error);
      toast.error('Failed to unverify account');
    }
  };

  const updateFollowerCount = async (accountId: string, followerCount: number) => {
    try {
      const { error } = await supabase
        .from('social_accounts')
        .update({ follower_count: followerCount, last_updated: new Date().toISOString() })
        .eq('id', accountId);

      if (error) throw error;

      toast.success('Follower count updated');
      fetchAccounts();
    } catch (error: any) {
      console.error('Error updating follower count:', error);
      toast.error('Failed to update follower count');
    }
  };

  const deleteAccount = async (accountId: string) => {
    try {
      const { error } = await supabase
        .from('social_accounts')
        .delete()
        .eq('id', accountId);

      if (error) throw error;

      toast.success('Account deleted');
      fetchAccounts();
    } catch (error: any) {
      console.error('Error deleting account:', error);
      toast.error('Failed to delete account');
    }
  };

  const bulkVerify = async (accountIds: string[]) => {
    try {
      const { error } = await supabase
        .from('social_accounts')
        .update({ is_verified: true, last_updated: new Date().toISOString() })
        .in('id', accountIds);

      if (error) throw error;

      toast.success(`${accountIds.length} accounts verified`);
      fetchAccounts();
    } catch (error: any) {
      console.error('Error bulk verifying:', error);
      toast.error('Failed to verify accounts');
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [accounts, searchTerm, platformFilter, verificationFilter]);

  return {
    accounts: filteredAccounts,
    stats,
    loading,
    searchTerm,
    setSearchTerm,
    platformFilter,
    setPlatformFilter,
    verificationFilter,
    setVerificationFilter,
    verifyAccount,
    unverifyAccount,
    updateFollowerCount,
    deleteAccount,
    bulkVerify,
    refetch: fetchAccounts,
  };
};
