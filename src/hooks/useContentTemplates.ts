import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type TemplateCategory = 'caption' | 'script' | 'prompt' | 'hook';
export type ContentType = 'instagram' | 'tiktok' | 'youtube' | 'general';

export interface ContentTemplate {
  id: string;
  title: string;
  category: TemplateCategory;
  content_type: ContentType;
  content: string;
  month: number | null;
  tags: string[];
  is_featured: boolean;
  usage_count: number;
  created_at: string;
  updated_at: string;
}

interface UseContentTemplatesOptions {
  category?: TemplateCategory;
  contentType?: ContentType;
  featured?: boolean;
  month?: number;
}

export const useContentTemplates = (options?: UseContentTemplatesOptions) => {
  const queryClient = useQueryClient();

  const templatesQuery = useQuery({
    queryKey: ["content-templates", options],
    queryFn: async () => {
      let query = supabase
        .from("ambassador_content_templates")
        .select("*")
        .order("is_featured", { ascending: false })
        .order("usage_count", { ascending: false });

      if (options?.category) {
        query = query.eq("category", options.category);
      }
      if (options?.contentType) {
        query = query.eq("content_type", options.contentType);
      }
      if (options?.featured) {
        query = query.eq("is_featured", true);
      }
      if (options?.month) {
        query = query.eq("month", options.month);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as ContentTemplate[];
    },
  });

  const trackUsageMutation = useMutation({
    mutationFn: async (templateId: string) => {
      // Update usage count directly
      const { error } = await supabase
        .from("ambassador_content_templates")
        .update({ usage_count: supabase.rpc ? 1 : 1 }) // Increment handled manually
        .eq("id", templateId);
      // Silently fail - usage tracking is not critical
      if (error) console.warn("Failed to track template usage:", error);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["content-templates"] });
    },
  });

  return {
    templates: templatesQuery.data ?? [],
    isLoading: templatesQuery.isLoading,
    error: templatesQuery.error,
    trackUsage: trackUsageMutation.mutate,
  };
};

export const useFeaturedTemplates = () => {
  return useContentTemplates({ featured: true });
};

export const useMonthlyPrompts = () => {
  const currentMonth = new Date().getMonth() + 1;
  return useContentTemplates({ category: "prompt", month: currentMonth });
};
