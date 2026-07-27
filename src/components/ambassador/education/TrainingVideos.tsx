import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Play, Check, Clock, GraduationCap, ChevronRight } from "lucide-react";
import { useTrainingProgress, TrainingVideo, VideoCategory } from "@/hooks/useTrainingProgress";

const CATEGORY_CONFIG: Record<VideoCategory, { label: string; description: string }> = {
  "getting-started": { 
    label: "Getting Started", 
    description: "Essential videos for new ambassadors" 
  },
  "advanced": { 
    label: "Advanced Strategies", 
    description: "Level up your ambassador game" 
  },
  "best-practices": { 
    label: "Best Practices", 
    description: "Learn from top performers" 
  },
};

interface VideoCardProps {
  video: TrainingVideo;
  isWatched: boolean;
  onPlay: () => void;
}

const VideoCard = ({ video, isWatched, onPlay }: VideoCardProps) => {
  return (
    <Card 
      className={`border-border/50 overflow-hidden cursor-pointer hover:border-primary/30 transition-all group ${
        isWatched ? "bg-muted/30" : ""
      }`}
      onClick={onPlay}
    >
      <div className="relative aspect-video">
        <img
          src={video.thumbnailUrl}
          alt={video.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="h-12 w-12 rounded-full bg-card/90 flex items-center justify-center">
            <Play className="h-5 w-5 text-foreground ml-0.5" fill="currentColor" />
          </div>
        </div>
        {isWatched && (
          <div className="absolute top-2 right-2">
            <Badge className="bg-green-500 text-white gap-1">
              <Check className="h-3 w-3" />
              Watched
            </Badge>
          </div>
        )}
        <div className="absolute bottom-2 right-2">
          <Badge variant="secondary" className="bg-black/60 text-white border-0 gap-1">
            <Clock className="h-3 w-3" />
            {video.duration}
          </Badge>
        </div>
      </div>
      <CardContent className="p-3">
        <h4 className="font-medium text-sm line-clamp-1">{video.title}</h4>
        <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
          {video.description}
        </p>
      </CardContent>
    </Card>
  );
};

interface VideoCategorySection {
  category: VideoCategory;
  videos: TrainingVideo[];
  isVideoWatched: (videoId: string) => boolean;
  onPlayVideo: (video: TrainingVideo) => void;
}

const VideoCategorySection = ({ 
  category, 
  videos, 
  isVideoWatched, 
  onPlayVideo 
}: VideoCategorySection) => {
  const config = CATEGORY_CONFIG[category];
  const watchedCount = videos.filter(v => isVideoWatched(v.id)).length;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-medium flex items-center gap-2">
            {config.label}
            <Badge variant="outline" className="text-xs">
              {watchedCount}/{videos.length}
            </Badge>
          </h3>
          <p className="text-xs text-muted-foreground">{config.description}</p>
        </div>
        <ChevronRight className="h-4 w-4 text-muted-foreground" />
      </div>
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {videos.map((video) => (
          <VideoCard
            key={video.id}
            video={video}
            isWatched={isVideoWatched(video.id)}
            onPlay={() => onPlayVideo(video)}
          />
        ))}
      </div>
    </div>
  );
};

export const TrainingVideos = () => {
  const [selectedVideo, setSelectedVideo] = useState<TrainingVideo | null>(null);
  const {
    isVideoWatched,
    getVideosByCategory,
    markWatched,
    completedCount,
    totalCount,
    progressPercentage,
    isTrainingComplete,
  } = useTrainingProgress();

  const handleCloseVideo = () => {
    if (selectedVideo) {
      markWatched(selectedVideo);
    }
    setSelectedVideo(null);
  };

  return (
    <div className="space-y-6">
      {/* Progress Overview */}
      <Card className="border-border/50 bg-gradient-to-r from-primary/5 to-primary/10">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5 text-primary" />
              <span className="font-medium">Training Progress</span>
            </div>
            <span className="text-sm text-muted-foreground">
              {completedCount} of {totalCount} videos
            </span>
          </div>
          <Progress value={progressPercentage} className="h-2" />
          {isTrainingComplete && (
            <div className="mt-3 flex items-center gap-2 text-sm text-green-600">
              <Check className="h-4 w-4" />
              <span>Congratulations! You've completed all training videos.</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Video Categories */}
      <div className="space-y-8">
        {(["getting-started", "advanced", "best-practices"] as VideoCategory[]).map((category) => (
          <VideoCategorySection
            key={category}
            category={category}
            videos={getVideosByCategory(category)}
            isVideoWatched={isVideoWatched}
            onPlayVideo={setSelectedVideo}
          />
        ))}
      </div>

      {/* Video Player Dialog */}
      <Dialog open={!!selectedVideo} onOpenChange={() => handleCloseVideo()}>
        <DialogContent className="max-w-4xl p-0 overflow-hidden">
          <DialogHeader className="p-4 pb-0">
            <DialogTitle>{selectedVideo?.title}</DialogTitle>
          </DialogHeader>
          <div className="aspect-video">
            {selectedVideo && (
              <iframe
                src={selectedVideo.videoUrl}
                title={selectedVideo.title}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            )}
          </div>
          <div className="p-4 pt-0">
            <p className="text-sm text-muted-foreground">{selectedVideo?.description}</p>
            <Button 
              className="mt-4 w-full" 
              onClick={handleCloseVideo}
            >
              <Check className="h-4 w-4 mr-2" />
              Mark as Complete & Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
