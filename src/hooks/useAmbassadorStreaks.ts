import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAmbassador } from "./useAmbassador";

export interface AmbassadorStreak {
  id: string;
  ambassador_id: string;
  streak_type: string;
  current_streak: number;
  longest_streak: number;
  last_activity_date: string | null;
  streak_started_at: string | null;
}

export const useAmbassadorStreaks = () => {
  const { ambassador } = useAmbassador();
  const queryClient = useQueryClient();

  const { data: streaks, isLoading } = useQuery({
    queryKey: ["ambassador-streaks", ambassador?.id],
    enabled: !!ambassador,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ambassador_streaks")
        .select("*")
        .eq("ambassador_id", ambassador!.id);

      if (error) throw error;
      return data as AmbassadorStreak[];
    },
  });

  const updateStreak = useMutation({
    mutationFn: async ({ streakType }: { streakType: string }) => {
      if (!ambassador) throw new Error("No ambassador found");

      const today = new Date().toISOString().split("T")[0];
      const existingStreak = streaks?.find(s => s.streak_type === streakType);

      if (existingStreak) {
        const lastDate = existingStreak.last_activity_date;
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split("T")[0];

        let newStreak = existingStreak.current_streak;
        let streakStartedAt = existingStreak.streak_started_at;

        if (lastDate === today) {
          // Already logged today
          return existingStreak;
        } else if (lastDate === yesterdayStr) {
          // Consecutive day
          newStreak += 1;
        } else {
          // Streak broken, start new
          newStreak = 1;
          streakStartedAt = new Date().toISOString();
        }

        const { data, error } = await supabase
          .from("ambassador_streaks")
          .update({
            current_streak: newStreak,
            longest_streak: Math.max(newStreak, existingStreak.longest_streak),
            last_activity_date: today,
            streak_started_at: streakStartedAt,
            updated_at: new Date().toISOString(),
          })
          .eq("id", existingStreak.id)
          .select()
          .single();

        if (error) throw error;
        return data;
      } else {
        // Create new streak record
        const { data, error } = await supabase
          .from("ambassador_streaks")
          .insert({
            ambassador_id: ambassador.id,
            streak_type: streakType,
            current_streak: 1,
            longest_streak: 1,
            last_activity_date: today,
            streak_started_at: new Date().toISOString(),
          })
          .select()
          .single();

        if (error) throw error;
        return data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ambassador-streaks"] });
    },
  });

  const getStreak = (type: string): AmbassadorStreak | undefined => {
    return streaks?.find(s => s.streak_type === type);
  };

  const getStreakIcon = (streakValue: number): string => {
    if (streakValue >= 30) return "🔥🔥🔥";
    if (streakValue >= 14) return "🔥🔥";
    if (streakValue >= 7) return "🔥";
    if (streakValue >= 3) return "✨";
    return "💪";
  };

  return {
    streaks: streaks || [],
    isLoading,
    updateStreak: updateStreak.mutate,
    getStreak,
    getStreakIcon,
    postingStreak: getStreak("posting"),
    referralStreak: getStreak("referral"),
    weeklyStreak: getStreak("weekly_active"),
  };
};
