import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useStayDeliverable = (agreementId?: string, dayNumber?: number) => {
  return useQuery({
    queryKey: ["stay-deliverable", agreementId, dayNumber],
    enabled: !!agreementId && !!dayNumber,
    queryFn: async () => {
      const { data: deliverable, error } = await supabase
        .from("stay_deliverables")
        .select("*")
        .eq("agreement_id", agreementId!)
        .eq("day_number", dayNumber!)
        .maybeSingle();
      if (error) throw error;

      const { data: agreement, error: agErr } = await supabase
        .from("collaboration_agreements")
        .select(`
          id, influencer_id, application_id,
          application:applications(
            property_id,
            property:properties(id, title)
          )
        `)
        .eq("id", agreementId!)
        .maybeSingle();
      if (agErr) throw agErr;

      let post = null;
      if (deliverable?.content_post_id) {
        const { data: p } = await supabase
          .from("content_posts")
          .select("*")
          .eq("id", deliverable.content_post_id)
          .maybeSingle();
        post = p;
      }

      return { deliverable, agreement, post };
    },
  });
};

export interface DeliverableUploadInput {
  file: File;
  caption: string;
  hashtags: string;
  mentions: string;
}

export const useUploadStayDeliverable = (
  agreementId: string,
  dayNumber: number,
) => {
  const qc = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (input: DeliverableUploadInput) => {
      // 1. Get deliverable + agreement context
      const { data: deliverable, error: dErr } = await supabase
        .from("stay_deliverables")
        .select("id, creator_id, content_post_id")
        .eq("agreement_id", agreementId)
        .eq("day_number", dayNumber)
        .maybeSingle();
      if (dErr) throw dErr;
      if (!deliverable) throw new Error("Deliverable slot not found");

      const { data: agreement, error: aErr } = await supabase
        .from("collaboration_agreements")
        .select("application_id, application:applications(property_id)")
        .eq("id", agreementId)
        .maybeSingle();
      if (aErr) throw aErr;

      // 2. Upload file
      const ext = input.file.name.split(".").pop() || "bin";
      const path = `stays/${agreementId}/day-${dayNumber}-${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage
        .from("collaboration-content")
        .upload(path, input.file, { upsert: true, contentType: input.file.type });
      if (upErr) throw upErr;
      const { data: pub } = supabase.storage.from("collaboration-content").getPublicUrl(path);
      const mediaUrl = pub.publicUrl;
      const mediaType = input.file.type.startsWith("video") ? "video" : "image";

      // 3. Create or update content_posts row
      const hashtags = input.hashtags
        .split(/[,\s]+/)
        .map((h) => h.replace(/^#/, "").trim())
        .filter(Boolean);
      const mentions = input.mentions
        .split(/[,\s]+/)
        .map((m) => m.replace(/^@/, "").trim())
        .filter(Boolean);

      const postPayload = {
        influencer_id: deliverable.creator_id,
        media_url: mediaUrl,
        media_type: mediaType,
        caption: input.caption || null,
        hashtags,
        mentions,
        application_id: (agreement as any)?.application_id ?? null,
        property_id: (agreement as any)?.application?.property_id ?? null,
        stay_deliverable_id: deliverable.id,
        host_approval_status: "pending",
        delivery_status: "submitted",
      };

      let postId = deliverable.content_post_id;
      if (postId) {
        const { error } = await supabase
          .from("content_posts")
          .update(postPayload)
          .eq("id", postId);
        if (error) throw error;
      } else {
        const { data: created, error } = await supabase
          .from("content_posts")
          .insert(postPayload)
          .select("id")
          .single();
        if (error) throw error;
        postId = created.id;
      }

      // 4. Update deliverable status
      const { error: updErr } = await supabase
        .from("stay_deliverables")
        .update({
          status: "submitted",
          content_post_id: postId,
          submitted_at: new Date().toISOString(),
        })
        .eq("id", deliverable.id);
      if (updErr) throw updErr;
    },
    onSuccess: () => {
      toast({ title: "Submitted", description: "Your deliverable was sent to the host for review." });
      qc.invalidateQueries({ queryKey: ["stay-deliverable", agreementId, dayNumber] });
      qc.invalidateQueries({ queryKey: ["stay-detail", agreementId] });
    },
    onError: (e: any) => {
      toast({ title: "Upload failed", description: e.message, variant: "destructive" });
    },
  });
};