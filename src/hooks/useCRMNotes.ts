import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useCRMNotes = (userId?: string, leadId?: string) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const entityKey = userId || leadId || "";

  const notesQuery = useQuery({
    queryKey: ["crm-notes", entityKey],
    queryFn: async () => {
      let query = supabase
        .from("crm_notes")
        .select("*, author:profiles!crm_notes_author_id_fkey(first_name, last_name)")
        .order("is_pinned", { ascending: false })
        .order("created_at", { ascending: false });

      if (userId) {
        query = query.eq("user_id", userId);
      } else if (leadId) {
        query = query.eq("lead_id", leadId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    enabled: !!(userId || leadId),
  });

  const addNote = useMutation({
    mutationFn: async ({ content }: { content: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");
      const insertData: any = {
        content,
        author_id: user.id,
      };
      if (userId) insertData.user_id = userId;
      if (leadId) insertData.lead_id = leadId;

      const { error } = await supabase.from("crm_notes").insert(insertData);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["crm-notes", entityKey] });
      toast({ title: "Note added" });
    },
  });

  const togglePin = useMutation({
    mutationFn: async ({ noteId, isPinned }: { noteId: string; isPinned: boolean }) => {
      const { error } = await supabase.from("crm_notes").update({ is_pinned: isPinned }).eq("id", noteId);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["crm-notes", entityKey] }),
  });

  const deleteNote = useMutation({
    mutationFn: async (noteId: string) => {
      const { error } = await supabase.from("crm_notes").delete().eq("id", noteId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["crm-notes", entityKey] });
      toast({ title: "Note deleted" });
    },
  });

  return { notes: notesQuery.data || [], isLoading: notesQuery.isLoading, addNote, togglePin, deleteNote };
};
