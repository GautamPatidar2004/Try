import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAmbassador } from "./useAmbassador";
import { toast } from "@/hooks/use-toast";

export type VideoCategory = 'getting-started' | 'advanced' | 'best-practices';

export interface TrainingVideo {
  id: string;
  title: string;
  description: string;
  category: VideoCategory;
  duration: string;
  thumbnailUrl: string;
  videoUrl: string;
}

export interface TrainingProgress {
  id: string;
  ambassador_id: string;
  video_id: string;
  video_title: string;
  video_category: string;
  watched_at: string;
  completion_percentage: number;
}

// Static training videos data (could be moved to database later)
export const TRAINING_VIDEOS: TrainingVideo[] = [
  {
    id: "welcome-intro",
    title: "Welcome to the Ambassador Program",
    description: "Learn what it means to be a Hostfluencer Ambassador and how to get started.",
    category: "getting-started",
    duration: "2:30",
    thumbnailUrl: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=225&fit=crop",
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ", // Placeholder
  },
  {
    id: "share-referral-link",
    title: "How to Share Your Referral Link",
    description: "Best practices for sharing your referral link across different platforms.",
    category: "getting-started",
    duration: "5:15",
    thumbnailUrl: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=400&h=225&fit=crop",
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
  },
  {
    id: "understand-dashboard",
    title: "Understanding Your Dashboard",
    description: "A complete walkthrough of your ambassador dashboard features.",
    category: "getting-started",
    duration: "3:45",
    thumbnailUrl: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=225&fit=crop",
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
  },
  {
    id: "monthly-requirements",
    title: "Meeting Monthly Requirements",
    description: "Learn what's required to stay active and maintain your ambassador status.",
    category: "advanced",
    duration: "4:00",
    thumbnailUrl: "https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=400&h=225&fit=crop",
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
  },
  {
    id: "maximize-earnings",
    title: "Maximizing Your Earnings",
    description: "Advanced strategies for increasing your referral conversions and earnings.",
    category: "advanced",
    duration: "6:30",
    thumbnailUrl: "https://images.unsplash.com/photo-1553729459-efe14ef6055d?w=400&h=225&fit=crop",
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
  },
  {
    id: "top-ambassador-tips",
    title: "Tips from Top Ambassadors",
    description: "Learn from the best - hear what successful ambassadors do differently.",
    category: "best-practices",
    duration: "8:00",
    thumbnailUrl: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=400&h=225&fit=crop",
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
  },
  {
    id: "content-creation-tips",
    title: "Content Creation Best Practices",
    description: "Create engaging content that converts followers into referrals.",
    category: "best-practices",
    duration: "7:15",
    thumbnailUrl: "https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?w=400&h=225&fit=crop",
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
  },
];

export const useTrainingProgress = () => {
  const queryClient = useQueryClient();
  const { ambassador } = useAmbassador();

  const progressQuery = useQuery({
    queryKey: ["training-progress", ambassador?.id],
    queryFn: async () => {
      if (!ambassador?.id) return [];
      
      const { data, error } = await supabase
        .from("ambassador_training_progress")
        .select("*")
        .eq("ambassador_id", ambassador.id);

      if (error) throw error;
      return data as TrainingProgress[];
    },
    enabled: !!ambassador?.id,
  });

  const markWatchedMutation = useMutation({
    mutationFn: async (video: TrainingVideo) => {
      if (!ambassador?.id) throw new Error("Not an ambassador");

      const { error } = await supabase
        .from("ambassador_training_progress")
        .upsert({
          ambassador_id: ambassador.id,
          video_id: video.id,
          video_title: video.title,
          video_category: video.category,
          completion_percentage: 100,
          watched_at: new Date().toISOString(),
        }, {
          onConflict: "ambassador_id,video_id",
        });

      if (error) throw error;
    },
    onSuccess: (_, video) => {
      queryClient.invalidateQueries({ queryKey: ["training-progress"] });
      toast({
        title: "Video completed!",
        description: `You've completed "${video.title}"`,
      });

      // Check if all videos are complete for certificate
      const currentProgress = progressQuery.data ?? [];
      if (currentProgress.length + 1 >= TRAINING_VIDEOS.length) {
        toast({
          title: "🎓 Training Complete!",
          description: "You've unlocked the Training Complete badge!",
        });
      }
    },
    onError: (error) => {
      console.error("Failed to mark video as watched:", error);
      toast({
        title: "Error",
        description: "Failed to save progress. Please try again.",
        variant: "destructive",
      });
    },
  });

  const watchedVideoIds = new Set(progressQuery.data?.map(p => p.video_id) ?? []);
  const completedCount = watchedVideoIds.size;
  const totalCount = TRAINING_VIDEOS.length;
  const progressPercentage = Math.round((completedCount / totalCount) * 100);
  const isTrainingComplete = completedCount >= totalCount;

  const isVideoWatched = (videoId: string) => watchedVideoIds.has(videoId);

  const getVideosByCategory = (category: VideoCategory) => 
    TRAINING_VIDEOS.filter(v => v.category === category);

  return {
    progress: progressQuery.data ?? [],
    isLoading: progressQuery.isLoading,
    markWatched: markWatchedMutation.mutate,
    isMarkingWatched: markWatchedMutation.isPending,
    isVideoWatched,
    getVideosByCategory,
    completedCount,
    totalCount,
    progressPercentage,
    isTrainingComplete,
    videos: TRAINING_VIDEOS,
  };
};
