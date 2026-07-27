import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Eye, Heart, MessageCircle, MapPin, Calendar, Hash, AtSign, Image as ImageIcon, Video } from "lucide-react";
import { CreatorPost } from "@/hooks/useCreatorPosts";

interface PostDetailsModalProps {
  post: CreatorPost | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const PostDetailsModal = ({ post, open, onOpenChange }: PostDetailsModalProps) => {
  if (!post) return null;

  const getStatusColor = () => {
    if (post.delivery_status === 'published' && post.host_approval_status === 'approved') {
      return 'bg-success text-success-foreground';
    }
    if (post.host_approval_status === 'pending') {
      return 'bg-secondary text-secondary-foreground';
    }
    if (post.host_approval_status === 'rejected') {
      return 'bg-destructive text-destructive-foreground';
    }
    return 'bg-muted text-muted-foreground';
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Post Details</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Media Preview */}
          <div className="relative aspect-video bg-muted rounded-lg flex items-center justify-center">
            {post.media_type === 'video' ? (
            <video
            src={post.media_url}
            className="w-full h-full object-cover"
            muted
            playsInline
            preload="metadata"
          />
        ) : (
          <img
            src={post.media_url}
            alt={post.caption || "Post"}
            className="w-full h-full object-cover"
    />
        )}
          </div>

          {/* Status */}
          <div>
            <h3 className="text-sm font-medium mb-2">Status</h3>
            <div className="flex gap-2">
              <Badge className={getStatusColor()}>
                {post.host_approval_status}
              </Badge>
              <Badge variant="outline">
                {post.delivery_status}
              </Badge>
            </div>
          </div>

          <Separator />

          {/* Engagement Metrics */}
          <div>
            <h3 className="text-sm font-medium mb-3">Performance</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                <Heart className="w-5 h-5 text-destructive" />
                <div>
                  <p className="text-2xl font-bold">{post.likes_count || 0}</p>
                  <p className="text-xs text-muted-foreground">Likes</p>
                </div>
              </div>
              <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                <Eye className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-2xl font-bold">{post.views_count || 0}</p>
                  <p className="text-xs text-muted-foreground">Views</p>
                </div>
              </div>
              <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                <MessageCircle className="w-5 h-5 text-accent" />
                <div>
                  <p className="text-2xl font-bold">{post.comments_count || 0}</p>
                  <p className="text-xs text-muted-foreground">Comments</p>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Caption */}
          {post.caption && (
            <div>
              <h3 className="text-sm font-medium mb-2">Caption</h3>
              <p className="text-sm text-muted-foreground">{post.caption}</p>
            </div>
          )}

          {/* Hashtags */}
          {post.hashtags && post.hashtags.length > 0 && (
            <div>
              <h3 className="text-sm font-medium mb-2 flex items-center gap-2">
                <Hash className="w-4 h-4" />
                Hashtags
              </h3>
              <div className="flex flex-wrap gap-2">
                {post.hashtags.map((tag, idx) => (
                  <Badge key={idx} variant="outline">{tag}</Badge>
                ))}
              </div>
            </div>
          )}

          {/* Mentions */}
          {post.mentions && post.mentions.length > 0 && (
            <div>
              <h3 className="text-sm font-medium mb-2 flex items-center gap-2">
                <AtSign className="w-4 h-4" />
                Mentions
              </h3>
              <div className="flex flex-wrap gap-2">
                {post.mentions.map((mention, idx) => (
                  <Badge key={idx} variant="outline">{mention}</Badge>
                ))}
              </div>
            </div>
          )}

          <Separator />

          {/* Property Info */}
          {post.property_title && (
            <div>
              <h3 className="text-sm font-medium mb-2">Tagged Property</h3>
              <div className="flex items-start gap-3 p-3 bg-muted rounded-lg">
                {post.property_image && (
                   <img
                   src={post.property_image}
                   alt={post.property_title || "Property"}
                  className="w-16 h-16 rounded object-cover flex-shrink-0"
                />
                )}
                <div>
                  <p className="font-medium">{post.property_title}</p>
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {post.property_location}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground mb-1">Created</p>
              <p className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                {new Date(post.created_at).toLocaleString()}
              </p>
            </div>
            {post.posting_date && (
              <div>
                <p className="text-muted-foreground mb-1">Posted</p>
                <p className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  {new Date(post.posting_date).toLocaleString()}
                </p>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PostDetailsModal;
