import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { AdvancedFilters } from "@/components/admin/users/AdvancedFiltersPanel";

export const useUserManagement = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const bulkActivateUsers = async (userIds: string[]) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("bulk-user-operations", {
        body: { operation: "activate", userIds },
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: `Activated ${userIds.length} users successfully`,
      });

      return data;
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to activate users",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const bulkDeactivateUsers = async (userIds: string[]) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("bulk-user-operations", {
        body: { operation: "deactivate", userIds },
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: `Deactivated ${userIds.length} users successfully`,
      });

      return data;
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to deactivate users",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const bulkBanUsers = async (userIds: string[], reason: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("bulk-user-operations", {
        body: { operation: "ban", userIds, reason },
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: `Banned ${userIds.length} users successfully`,
      });

      return data;
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to ban users",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const bulkUnbanUsers = async (userIds: string[]) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("bulk-user-operations", {
        body: { operation: "unban", userIds },
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: `Unbanned ${userIds.length} users successfully`,
      });

      return data;
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to unban users",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const unbanUser = async (userId: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("admin-manage-user", {
        body: { action: "unban", userId },
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "User unbanned successfully",
      });

      return data;
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to unban user",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const resetUserPassword = async (userId: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("admin-manage-user", {
        body: { action: "reset_password", userId },
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Password reset email sent",
      });

      return data;
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to send password reset",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const updateUserSubscription = async (userId: string, planId: string, status?: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("admin-manage-user", {
        body: { action: "update_subscription", userId, data: { planId, status } },
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Subscription updated successfully",
      });

      return data;
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update subscription",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const cancelUserSubscription = async (userId: string, reason?: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("admin-manage-user", {
        body: { action: "cancel_subscription", userId, data: { reason } },
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Subscription cancelled",
      });

      return data;
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to cancel subscription",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const exportUsers = async (userIds: string[], filters?: AdvancedFilters) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("export-users", {
        body: { userIds, filters },
      });

      if (error) throw error;

      const blob = new Blob([data.csv], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `users-export-${Date.now()}.csv`;
      a.click();

      toast({
        title: "Success",
        description: "User data exported successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to export users",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const detectDuplicates = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("detect-duplicates");

      if (error) throw error;

      toast({
        title: "Success",
        description: `Found ${data.count} potential duplicate groups`,
      });

      return data.duplicates;
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to detect duplicates",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const mergeAccounts = async (primaryUserId: string, secondaryUserIds: string[]) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("merge-accounts", {
        body: { primaryUserId, secondaryUserIds },
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Accounts merged successfully",
      });

      return data;
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to merge accounts",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    bulkActivateUsers,
    bulkDeactivateUsers,
    bulkBanUsers,
    bulkUnbanUsers,
    unbanUser,
    resetUserPassword,
    updateUserSubscription,
    cancelUserSubscription,
    exportUsers,
    detectDuplicates,
    mergeAccounts,
  };
};
