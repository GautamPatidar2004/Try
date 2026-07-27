import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface BrandFilters {
  search?: string;
  industry?: string;
  verified?: boolean;
  budgetRange?: string;
}

export const useAdminBrands = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const fetchBrands = async (filters?: BrandFilters) => {
    let query = supabase
      .from("brands")
      .select(`
        *,
        profiles:user_id (
          id,
          first_name,
          last_name
        )
      `)
      .order("created_at", { ascending: false });

    if (filters?.search) {
      query = query.or(`brand_name.ilike.%${filters.search}%,company_name.ilike.%${filters.search}%`);
    }
    if (filters?.industry) {
      query = query.eq("industry", filters.industry);
    }
    if (filters?.verified !== undefined) {
      query = query.eq("verified", filters.verified);
    }
    if (filters?.budgetRange) {
      query = query.eq("budget_range", filters.budgetRange);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  };

  const getBrandStats = async () => {
    const { data: brands, error } = await supabase
      .from("brands")
      .select("verified");
    
    if (error) throw error;

    const { data: campaigns } = await supabase
      .from("brand_campaigns")
      .select("status");

    return {
      total: brands.length,
      verified: brands.filter(b => b.verified).length,
      activeCampaigns: campaigns?.filter(c => c.status === "open").length || 0,
      pendingVerification: brands.filter(b => !b.verified).length,
    };
  };

  const getBrandById = async (id: string) => {
    const { data: brand, error } = await supabase
      .from("brands")
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw error;

    // Fetch owner profile separately
    if (brand.user_id) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("id, first_name, last_name, username")
        .eq("id", brand.user_id)
        .single();
      
      return { ...brand, profiles: profile };
    }

    return brand;
  };

  const getBrandCampaigns = async (brandUserId: string) => {
    const { data, error } = await supabase
      .from("brand_campaigns")
      .select("*")
      .eq("created_by", brandUserId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data;
  };

  const updateBrand = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: any }) => {
      const { data, error } = await supabase
        .from("brands")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-brands"] });
      toast({
        title: "Success",
        description: "Brand updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to update brand: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const verifyBrand = useMutation({
    mutationFn: async ({ id, verified }: { id: string; verified: boolean }) => {
      const { error } = await supabase
        .from("brands")
        .update({ verified })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-brands"] });
      toast({
        title: "Success",
        description: "Brand verification status updated",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to update verification: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const getBrandDocuments = async (brandId: string) => {
    const { data, error } = await supabase
      .from("brand_documents")
      .select("*")
      .eq("brand_id", brandId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data;
  };

  const updateDocument = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: any }) => {
      const { data, error } = await supabase
        .from("brand_documents")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["brand-documents"] });
      toast({
        title: "Success",
        description: "Document updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to update document: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const deleteCampaign = useMutation({
    mutationFn: async (campaignId: string) => {
      const { error } = await supabase
        .from("brand_campaigns")
        .delete()
        .eq("id", campaignId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-brand-campaigns"] });
      toast({
        title: "Success",
        description: "Campaign deleted successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to delete campaign: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const updateCampaign = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: any }) => {
      const { data, error } = await supabase
        .from("brand_campaigns")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-brand-campaigns"] });
      toast({
        title: "Success",
        description: "Campaign updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to update campaign: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  return {
    fetchBrands,
    getBrandStats,
    getBrandById,
    getBrandCampaigns,
    getBrandDocuments,
    updateBrand,
    verifyBrand,
    updateDocument,
    deleteCampaign,
    updateCampaign,
  };
};
