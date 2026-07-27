import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Heart, Eye, MapPin, Hash, AtSign, Image as ImageIcon, Video, FileText } from "lucide-react";
import { format } from "date-fns";

interface Post {
  id: string;
  media_type: string;
  media_url: string;
  caption: string;
  hashtags: string[] | null;
  mentions: string[] | null;
  location: string | null;
  likes_count: number;
  views_count: number;
  host_approval_status: string;
  delivery_status: string;
  created_at: string;
  posting_date: string | null;
  influencers: {
    profiles: {
      first_name: string;
      last_name: string;
    } | null;
  } | null;
}

interface PostDetailModalProps {
  post: Post | null;
  isOpen: boolean;
  onClose: () => void;
}

const PostDetailModal = ({ post, isOpen, onClose }: PostDetailModalProps) => {
  if (!post) return null;

  const getMediaIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'photo': return <ImageIcon className="w-4 h-4" />;
      case 'video': return <Video className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Post Details</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="content" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="content">Content</TabsTrigger>
            <TabsTrigger value="engagement">Engagement</TabsTrigger>
            <TabsTrigger value="moderation">Moderation</TabsTrigger>
          </TabsList>

          <TabsContent value="content" className="space-y-4">
            <div className="aspect-video bg-muted rounded-lg overflow-hidden">
              {post.media_type === 'video' ? (
                <video src={post.media_url} controls className="w-full h-full object-cover" />
              ) : (
                <img src={post.media_url} alt="Post content" className="w-full h-full object-cover" />
              )}
            </div>

            <div className="space-y-3">
              <div>
                <h4 className="text-sm font-medium mb-1">Creator</h4>
                <p className="text-sm text-muted-foreground">
                  {post.influencers?.profiles?.first_name} {post.influencers?.profiles?.last_name}
                </p>
              </div>

              <div>
                <h4 className="text-sm font-medium mb-1">Media Type</h4>
                <Badge variant="outline" className="gap-1">
                  {getMediaIcon(post.media_type)}
                  {post.media_type}
                </Badge>
              </div>

              {post.caption && (
                <div>
                  <h4 className="text-sm font-medium mb-1">Caption</h4>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">{post.caption}</p>
                </div>
              )}

              {post.hashtags && post.hashtags.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium mb-2 flex items-center gap-1">
                    <Hash className="w-4 h-4" />
                    Hashtags
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {post.hashtags.map((tag, index) => (
                      <Badge key={index} variant="secondary">#{tag}</Badge>
                    ))}
                  </div>
                </div>
              )}

              {post.mentions && post.mentions.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium mb-2 flex items-center gap-1">
                    <AtSign className="w-4 h-4" />
                    Mentions
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {post.mentions.map((mention, index) => (
                      <Badge key={index} variant="secondary">@{mention}</Badge>
                    ))}
                  </div>
                </div>
              )}

              {post.location && (
                <div>
                  <h4 className="text-sm font-medium mb-1 flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    Location
                  </h4>
                  <p className="text-sm text-muted-foreground">{post.location}</p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="engagement" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 border rounded-lg">
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <Heart className="w-4 h-4" />
                  <span className="text-sm">Likes</span>
                </div>
                <p className="text-2xl font-bold">{post.likes_count.toLocaleString()}</p>
              </div>
              <div className="p-4 border rounded-lg">
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <Eye className="w-4 h-4" />
                  <span className="text-sm">Views</span>
                </div>
                <p className="text-2xl font-bold">{post.views_count.toLocaleString()}</p>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-sm text-muted-foreground">Engagement Rate</span>
                <span className="text-sm font-medium">
                  {post.views_count > 0 
                    ? ((post.likes_count / post.views_count) * 100).toFixed(2) 
                    : '0'}%
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-sm text-muted-foreground">Created</span>
                <span className="text-sm font-medium">
                  {format(new Date(post.created_at), 'MMM dd, yyyy HH:mm')}
                </span>
              </div>
              {post.posting_date && (
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-sm text-muted-foreground">Posted</span>
                  <span className="text-sm font-medium">
                    {format(new Date(post.posting_date), 'MMM dd, yyyy HH:mm')}
                  </span>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="moderation" className="space-y-4">
            <div className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-sm text-muted-foreground">Approval Status</span>
                <Badge variant={
                  post.host_approval_status === 'approved' ? 'default' :
                  post.host_approval_status === 'rejected' ? 'destructive' : 'secondary'
                }>
                  {post.host_approval_status}
                </Badge>
              </div>
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-sm text-muted-foreground">Delivery Status</span>
                <Badge variant={post.delivery_status === 'published' ? 'default' : 'secondary'}>
                  {post.delivery_status}
                </Badge>
              </div>
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-sm text-muted-foreground">Created Date</span>
                <span className="text-sm">
                  {format(new Date(post.created_at), 'MMM dd, yyyy')}
                </span>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={onClose}>Close</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PostDetailModal;
