import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface StayDeliverable {
  id: string;
  day_number: number;
  due_date: string | null;
  deliverable_type: string;
  status: string;
  content_post_id: string | null;
  host_feedback: string | null;
  submitted_at: string | null;
  approved_at: string | null;
}

export interface StayCheckIn {
  id: string;
  checked_in_at: string | null;
  check_in_photo_url: string | null;
  check_in_notes: string | null;
  checked_out_at: string | null;
  check_out_notes: string | null;
}

export const useStayDetail = (agreementId?: string) => {
  return useQuery({
    queryKey: ["stay-detail", agreementId],
    enabled: !!agreementId,
    queryFn: async () => {
      const { data: agreement, error: agErr } = await supabase
        .from("collaboration_agreements")
        .select(`
          id, status, agreed_rate, currency, deliverable_count, influencer_id,
          application:applications(
            proposed_dates_start, proposed_dates_end,
            property:properties(
              id, title, location,
              property_images(image_url, is_primary, display_order),
              host:hosts(
                id,
                profiles:profiles(id, first_name, last_name, profile_photo_url)
              )
            )
          )
        `)
        .eq("id", agreementId!)
        .maybeSingle();

      if (agErr) throw agErr;

      const { data: checkIn, error: ciErr } = await supabase
        .from("stay_check_ins")
        .select("*")
        .eq("agreement_id", agreementId!)
        .maybeSingle();
      if (ciErr) throw ciErr;

      const { data: deliverables, error: delErr } = await supabase
        .from("stay_deliverables")
        .select("*")
        .eq("agreement_id", agreementId!)
        .order("day_number", { ascending: true });
      if (delErr) throw delErr;

      return {
        agreement,
        checkIn: (checkIn as StayCheckIn | null) ?? null,
        deliverables: (deliverables || []) as StayDeliverable[],
      };
    },
  });
};

export const useStayCheckIn = (agreementId: string, creatorId?: string) => {
  const qc = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (input: { notes: string; photo: File | null }) => {
      let photoUrl: string | null = null;

      if (input.photo) {
        const ext = input.photo.name.split(".").pop() || "jpg";
        const path = `stays/${agreementId}/checkin-${Date.now()}.${ext}`;
        const { error: upErr } = await supabase.storage
          .from("collaboration-content")
          .upload(path, input.photo, { upsert: true, contentType: input.photo.type });
        if (upErr) throw upErr;
        const { data: pub } = supabase.storage.from("collaboration-content").getPublicUrl(path);
        photoUrl = pub.publicUrl;
      }

      const { data: existing } = await supabase
        .from("stay_check_ins")
        .select("id")
        .eq("agreement_id", agreementId)
        .maybeSingle();

      const payload: any = {
        agreement_id: agreementId,
        creator_id: creatorId,
        checked_in_at: new Date().toISOString(),
        check_in_notes: input.notes || null,
        ...(photoUrl ? { check_in_photo_url: photoUrl } : {}),
      };

      if (existing) {
        const { error } = await supabase
          .from("stay_check_ins")
          .update(payload)
          .eq("id", existing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("stay_check_ins").insert(payload);
        if (error) throw error;
      }

      // Ensure deliverable slots exist
      const { data: existingDeliverables } = await supabase
        .from("stay_deliverables")
        .select("id")
        .eq("agreement_id", agreementId)
        .limit(1);
      if (!existingDeliverables || existingDeliverables.length === 0) {
        await supabase.rpc("generate_stay_deliverables", { p_agreement_id: agreementId });
      }
    },
    onSuccess: () => {
      toast({ title: "Checked in", description: "Your stay is now active. Time to create!" });
      qc.invalidateQueries({ queryKey: ["stay-detail", agreementId] });
    },
    onError: (e: any) => {
      toast({ title: "Check-in failed", description: e.message, variant: "destructive" });
    },
  });
};