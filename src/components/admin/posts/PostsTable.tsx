import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Eye, Heart, Eye as ViewIcon, Play, Image } from "lucide-react";
import PostDetailModal from "./PostDetailModal";

interface ContentPost {
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
  influencer_id: string;
  influencers: {
    profiles: {
      first_name: string;
      last_name: string;
    } | null;
  } | null;
}

interface PostsTableProps {
  posts: ContentPost[];
  onUpdateStatus: (postId: string, newStatus: string) => void;
}

const PostsTable = ({ posts, onUpdateStatus }: PostsTableProps) => {
  const [selectedPost, setSelectedPost] = useState<ContentPost | null>(null);
  
  const getApprovalStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'default';
      case 'rejected':
        return 'destructive';
      case 'pending':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const getDeliveryStatusColor = (status: string) => {
    switch (status) {
      case 'delivered':
      case 'published':
        return 'default';
      case 'draft':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const getMediaIcon = (mediaType: string) => {
    switch (mediaType) {
      case 'video':
        return <Play className="w-4 h-4" />;
      case 'image':
        return <Image className="w-4 h-4" />;
      default:
        return <Image className="w-4 h-4" />;
    }
  };

  if (posts.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No posts found matching your criteria.</p>
      </div>
    );
  }

  return (
    <>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Content</TableHead>
              <TableHead>Creator</TableHead>
              <TableHead>Engagement</TableHead>
              <TableHead>Approval</TableHead>
              <TableHead>Delivery</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {posts.map((post) => (
              <TableRow key={post.id}>
                <TableCell>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      {getMediaIcon(post.media_type)}
                      <span className="text-sm font-medium capitalize">
                        {post.media_type}
                      </span>
                    </div>
                    {post.caption && (
                      <p className="text-sm text-muted-foreground truncate max-w-xs">
                        {post.caption}
                      </p>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <p className="font-medium">
                    {post.influencers?.profiles?.first_name} {post.influencers?.profiles?.last_name}
                  </p>
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <div className="flex items-center gap-1 text-sm">
                      <Heart className="w-3 h-3 text-red-500" />
                      {post.likes_count || 0}
                    </div>
                    <div className="flex items-center gap-1 text-sm">
                      <ViewIcon className="w-3 h-3 text-blue-500" />
                      {post.views_count || 0}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={getApprovalStatusColor(post.host_approval_status)}>
                    {post.host_approval_status || 'pending'}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={getDeliveryStatusColor(post.delivery_status)}>
                    {post.delivery_status || 'draft'}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex space-x-1">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setSelectedPost(post)}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    {post.host_approval_status === 'pending' && (
                      <>
                        <Button 
                          variant="default" 
                          size="sm"
                          onClick={() => onUpdateStatus(post.id, 'approved')}
                        >
                          Approve
                        </Button>
                        <Button 
                          variant="destructive" 
                          size="sm"
                          onClick={() => onUpdateStatus(post.id, 'rejected')}
                        >
                          Reject
                        </Button>
                      </>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <PostDetailModal 
        post={selectedPost}
        isOpen={!!selectedPost}
        onClose={() => setSelectedPost(null)}
      />
    </>
  );
};

export default PostsTable;
