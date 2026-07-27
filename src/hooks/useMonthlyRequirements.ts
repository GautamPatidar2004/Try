import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAmbassador } from "./useAmbassador";
import { useToast } from "@/hooks/use-toast";

export const useMonthlyRequirements = () => {
  const { ambassador } = useAmbassador();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();

  const { data: tracking, isLoading } = useQuery({
    queryKey: ["ambassador-content-tracking", ambassador?.id, currentMonth, currentYear],
    enabled: !!ambassador,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ambassador_content_tracking")
        .select("*")
        .eq("ambassador_id", ambassador!.id)
        .eq("month", currentMonth)
        .eq("year", currentYear)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') throw error;
      
      // If no tracking exists, create one
      if (!data) {
        const { data: newTracking, error: insertError } = await supabase
          .from("ambassador_content_tracking")
          .insert({
            ambassador_id: ambassador!.id,
            month: currentMonth,
            year: currentYear,
            stories_count: 0,
            feed_posts_count: 0,
          })
          .select()
          .single();

        if (insertError) throw insertError;
        return newTracking;
      }

      return data;
    },
  });

  const submitContent = useMutation({
    mutationFn: async ({ type, url }: { type: 'story' | 'post'; url: string }) => {
      if (!tracking) throw new Error("No tracking record");

      const currentUrls = Array.isArray(tracking.content_urls) ? tracking.content_urls : [];
      const updatedUrls = [...currentUrls, { type, url, submitted_at: new Date().toISOString() }];

      const updates: any = {
        content_urls: updatedUrls,
      };

      if (type === 'story') {
        updates.stories_count = (tracking.stories_count || 0) + 1;
      } else {
        updates.feed_posts_count = (tracking.feed_posts_count || 0) + 1;
      }

      const { error } = await supabase
        .from("ambassador_content_tracking")
        .update(updates)
        .eq("id", tracking.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: ["ambassador-content-tracking", ambassador?.id, currentMonth, currentYear] 
      });
      toast({
        title: "Content submitted",
        description: "Your content has been logged.",
      });
    },
  });

  const progress = {
    stories: tracking?.stories_count || 0,
    storiesTarget: 4,
    posts: tracking?.feed_posts_count || 0,
    postsTarget: 1,
    isComplete: (tracking?.stories_count || 0) >= 4 && (tracking?.feed_posts_count || 0) >= 1,
  };

  return {
    tracking,
    isLoading,
    progress,
    submitContent: submitContent.mutate,
    submitting: submitContent.isPending,
  };
};
