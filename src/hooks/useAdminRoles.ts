import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useAdminRoles = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const fetchAdmins = async () => {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select(`
          *,
          profiles:user_id (
            id,
            first_name,
            last_name
          ),
          granted_by_profile:granted_by (
            first_name,
            last_name
          )
        `)
        .eq('role', 'admin')
        .order('granted_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error: any) {
      console.error('Error fetching admins:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch admin list',
        variant: 'destructive',
      });
      return [];
    }
  };

  const grantAdminRole = async (userId: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('manage-admin-roles', {
        body: { action: 'grant', targetUserId: userId },
      });

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Admin role granted successfully',
      });

      return data;
    } catch (error: any) {
      console.error('Error granting admin role:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to grant admin role',
        variant: 'destructive',
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const revokeAdminRole = async (userId: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('manage-admin-roles', {
        body: { action: 'revoke', targetUserId: userId },
      });

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Admin role revoked successfully',
      });

      return data;
    } catch (error: any) {
      console.error('Error revoking admin role:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to revoke admin role',
        variant: 'destructive',
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const searchUsers = async (query: string) => {
    try {
      if (!query || query.trim().length < 2) {
        return [];
      }

      const searchTerm = `%${query.trim()}%`;
      
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          id,
          first_name,
          last_name,
          user_type
        `)
        .or(`first_name.ilike.${searchTerm},last_name.ilike.${searchTerm}`)
        .limit(10);

      if (error) throw error;

      // Get current admins to mark them
      const { data: adminRoles } = await supabase
        .from('user_roles')
        .select('user_id')
        .eq('role', 'admin');

      const adminIds = new Set(adminRoles?.map(r => r.user_id) || []);

      return (data || []).map(user => ({
        ...user,
        isAdmin: adminIds.has(user.id)
      }));
    } catch (error: any) {
      console.error('Error searching users:', error);
      toast({
        title: 'Error',
        description: 'Failed to search users',
        variant: 'destructive',
      });
      return [];
    }
  };

  const fetchAdminActivity = async () => {
    try {
      const { data, error } = await supabase
        .from('admin_activity_log')
        .select(`
          *,
          admin:admin_id (
            first_name,
            last_name
          )
        `)
        .in('action', ['grant_admin_role', 'revoke_admin_role'])
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      return data || [];
    } catch (error: any) {
      console.error('Error fetching admin activity:', error);
      return [];
    }
  };

  return {
    isLoading,
    fetchAdmins,
    grantAdminRole,
    revokeAdminRole,
    searchUsers,
    fetchAdminActivity,
  };
};