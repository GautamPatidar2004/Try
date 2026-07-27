import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface CRMTask {
  id: string;
  title: string;
  description: string | null;
  user_id: string | null;
  assigned_to: string | null;
  due_date: string | null;
  priority: string;
  status: string;
  completed_at: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  related_user?: { first_name: string | null; last_name: string | null } | null;
  assignee?: { first_name: string | null; last_name: string | null } | null;
}

export const useCRMTasks = (filters?: { status?: string; priority?: string }) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const tasksQuery = useQuery({
    queryKey: ["crm-tasks", filters],
    queryFn: async () => {
      let query = supabase
        .from("crm_tasks")
        .select("*, related_user:profiles!crm_tasks_user_id_fkey(first_name, last_name), assignee:profiles!crm_tasks_assigned_to_fkey(first_name, last_name)")
        .order("due_date", { ascending: true, nullsFirst: false })
        .limit(200);

      if (filters?.status && filters.status !== "all") {
        query = query.eq("status", filters.status);
      }
      if (filters?.priority && filters.priority !== "all") {
        query = query.eq("priority", filters.priority);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as CRMTask[];
    },
  });

  const createTask = useMutation({
    mutationFn: async (task: { title: string; description?: string; user_id?: string; assigned_to?: string; due_date?: string; priority?: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      const { error } = await supabase.from("crm_tasks").insert({
        ...task,
        created_by: user?.id,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["crm-tasks"] });
      toast({ title: "Task created" });
    },
  });

  const updateTask = useMutation({
    mutationFn: async ({ id, ...updates }: { id: string; status?: string; priority?: string; completed_at?: string | null }) => {
      const { error } = await supabase.from("crm_tasks").update(updates).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["crm-tasks"] }),
  });

  const deleteTask = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("crm_tasks").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["crm-tasks"] });
      toast({ title: "Task deleted" });
    },
  });

  return {
    tasks: tasksQuery.data || [],
    isLoading: tasksQuery.isLoading,
    createTask,
    updateTask,
    deleteTask,
  };
};
