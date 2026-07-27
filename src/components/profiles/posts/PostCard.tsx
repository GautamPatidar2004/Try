import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Eye, Heart, MessageCircle, MoreVertical, Image as ImageIcon, Video, MapPin, Calendar } from "lucide-react";
import { CreatorPost } from "@/hooks/useCreatorPosts";

interface PostCardProps {
  post: CreatorPost;
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

const PostCard = ({ post, onView, onEdit, onDelete }: PostCardProps) => {
  const getStatusBadge = () => {
    if (post.delivery_status === 'published'||  post.delivery_status === 'submitted'
      && post.host_approval_status === 'approved') {
      return <Badge className="bg-success text-success-foreground">Published</Badge>;
    }
    if (post.host_approval_status === 'pending') {
      return <Badge variant="secondary">Pending Approval</Badge>;
    }
    if (post.host_approval_status === 'rejected') {
      return <Badge variant="destructive">Rejected</Badge>;
    }
    return <Badge variant="outline">Draft</Badge>;
  };

  const canEdit = post.delivery_status === 'draft' || post.host_approval_status === 'pending';

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow group">
      {/* Media Preview */}
      <div className="relative aspect-square bg-muted">
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
        
        {/* Metrics Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1">
                <Heart className="w-4 h-4" />
                <span>{post.likes_count || 0}</span>
              </div>
              <div className="flex items-center gap-1">
                <Eye className="w-4 h-4" />
                <span>{post.views_count || 0}</span>
              </div>
              <div className="flex items-center gap-1">
                <MessageCircle className="w-4 h-4" />
                <span>{post.comments_count || 0}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Status Badge */}
        <div className="absolute top-2 left-2">
          {getStatusBadge()}
        </div>

        {/* Actions Menu */}
        <div className="absolute top-2 right-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                size="sm" 
                variant="secondary" 
                className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onView}>
                View Details
              </DropdownMenuItem>
              {canEdit && (
                <DropdownMenuItem onClick={onEdit}>
                  Edit Post
                </DropdownMenuItem>
              )}
              <DropdownMenuItem onClick={onDelete} className="text-destructive">
                Delete Post
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Post Info */}
      <div className="p-4 space-y-2">
        {post.caption && (
          <p className="text-sm line-clamp-2 text-foreground">
            {post.caption}
          </p>
        )}
        
        {post.property_title && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <MapPin className="w-3 h-3" />
            <span className="truncate">{post.property_title}</span>
          </div>
        )}
        
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Calendar className="w-3 h-3" />
          <span>{new Date(post.created_at).toLocaleDateString()}</span>
        </div>

        {post.hashtags && post.hashtags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {post.hashtags.slice(0, 3).map((tag, idx) => (
              <Badge key={idx} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
            {post.hashtags.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{post.hashtags.length - 3}
              </Badge>
            )}
          </div>
        )}
      </div>
    </Card>
  );
};

export default PostCard;
