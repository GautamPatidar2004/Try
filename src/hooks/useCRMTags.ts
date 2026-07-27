import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useCRMTags = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const tagsQuery = useQuery({
    queryKey: ["crm-tags"],
    queryFn: async () => {
      const { data, error } = await supabase.from("crm_tags").select("*").order("name");
      if (error) throw error;
      return data;
    },
  });

  const createTag = useMutation({
    mutationFn: async ({ name, color }: { name: string; color: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      const { error } = await supabase.from("crm_tags").insert({ name, color, created_by: user?.id });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["crm-tags"] });
      toast({ title: "Tag created" });
    },
  });

  return { tags: tagsQuery.data || [], isLoading: tagsQuery.isLoading, createTag };
};

export const useCRMUserTags = (userId: string) => {
  const queryClient = useQueryClient();

  const userTagsQuery = useQuery({
    queryKey: ["crm-user-tags", userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("crm_user_tags")
        .select("*, tag:crm_tags(*)")
        .eq("user_id", userId);
      if (error) throw error;
      return data;
    },
    enabled: !!userId,
  });

  const assignTag = useMutation({
    mutationFn: async (tagId: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      const { error } = await supabase.from("crm_user_tags").insert({
        user_id: userId,
        tag_id: tagId,
        assigned_by: user?.id,
      });
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["crm-user-tags", userId] }),
  });

  const removeTag = useMutation({
    mutationFn: async (tagId: string) => {
      const { error } = await supabase.from("crm_user_tags").delete().eq("user_id", userId).eq("tag_id", tagId);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["crm-user-tags", userId] }),
  });

  return { userTags: userTagsQuery.data || [], isLoading: userTagsQuery.isLoading, assignTag, removeTag };
};
