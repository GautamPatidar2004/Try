import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Image, Search, Filter, TrendingUp, Eye, Heart, FileText } from "lucide-react";
import { useCreatorPosts, CreatorPost } from "@/hooks/useCreatorPosts";
import PostCard from "./posts/PostCard";
import PostDetailsModal from "./posts/PostDetailsModal";
import EditPostModal from "./posts/EditPostModal";

interface CreatorPostsManagementProps {
  influencerId: string;
}

const CreatorPostsManagement = ({ influencerId }: CreatorPostsManagementProps) => {
  const { posts, stats, loading, applyFilters, updatePost, deletePost } = useCreatorPosts(influencerId);
  
  const [selectedPost, setSelectedPost] = useState<CreatorPost | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [postToDelete, setPostToDelete] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [approvalFilter, setApprovalFilter] = useState("all");
  const [deliveryFilter, setDeliveryFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");

  const handleFilterChange = () => {
    applyFilters(
      {
        approval_status: approvalFilter,
        delivery_status: deliveryFilter,
        search: searchQuery,
      },
      sortBy
    );
  };

  const handleViewPost = (post: CreatorPost) => {
    setSelectedPost(post);
    setDetailsOpen(true);
  };

  const handleEditPost = (post: CreatorPost) => {
    setSelectedPost(post);
    setEditOpen(true);
  };

  const handleDeleteClick = (postId: string) => {
    setPostToDelete(postId);
    setDeleteOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (postToDelete) {
      await deletePost(postToDelete);
      setDeleteOpen(false);
      setPostToDelete(null);
    }
  };

  const handleSaveEdit = async (postId: string, updates: Partial<CreatorPost>) => {
    await updatePost(postId, updates);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">My Posts</h2>
          <p className="text-muted-foreground">Manage and track all your content</p>
        </div>
        <Badge variant="outline" className="text-sm">
          <Image className="w-4 h-4 mr-1" />
          {stats.total_posts} Total Posts
        </Badge>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <FileText className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.total_posts}</p>
                <p className="text-xs text-muted-foreground">Total Posts</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-success/10 rounded-lg">
                <TrendingUp className="w-5 h-5 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.published_posts}</p>
                <p className="text-xs text-muted-foreground">Published</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-destructive/10 rounded-lg">
                <Heart className="w-5 h-5 text-destructive" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.total_likes}</p>
                <p className="text-xs text-muted-foreground">Total Likes</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-accent/10 rounded-lg">
                <Eye className="w-5 h-5 text-accent" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.total_views}</p>
                <p className="text-xs text-muted-foreground">Total Views</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search by caption, hashtags, or property..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setTimeout(handleFilterChange, 300);
                  }}
                  className="pl-10"
                />
              </div>
            </div>

            <Select value={approvalFilter} onValueChange={(value) => {
              setApprovalFilter(value);
              setTimeout(handleFilterChange, 0);
            }}>
              <SelectTrigger className="w-full md:w-[180px]">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Approval Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>

            <Select value={deliveryFilter} onValueChange={(value) => {
              setDeliveryFilter(value);
              setTimeout(handleFilterChange, 0);
            }}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Delivery Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Posts</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="submitted">Submitted</SelectItem>
                <SelectItem value="published">Published</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={(value) => {
              setSortBy(value);
              setTimeout(handleFilterChange, 0);
            }}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Sort By" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="oldest">Oldest First</SelectItem>
                <SelectItem value="most_likes">Most Likes</SelectItem>
                <SelectItem value="most_views">Most Views</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Posts Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <Card key={i} className="h-64 animate-pulse bg-muted" />
          ))}
        </div>
      ) : posts.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Image className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-medium mb-2">No Posts Found</h3>
            <p className="text-muted-foreground mb-4">
              {searchQuery || approvalFilter !== 'all' || deliveryFilter !== 'all'
                ? "No posts match your current filters"
                : "You haven't created any posts yet"}
            </p>
            {(searchQuery || approvalFilter !== 'all' || deliveryFilter !== 'all') && (
              <Button
                variant="outline"
                onClick={() => {
                  setSearchQuery("");
                  setApprovalFilter("all");
                  setDeliveryFilter("all");
                  setTimeout(handleFilterChange, 0);
                }}
              >
                Clear Filters
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              onView={() => handleViewPost(post)}
              onEdit={() => handleEditPost(post)}
              onDelete={() => handleDeleteClick(post.id)}
            />
          ))}
        </div>
      )}

      {/* Modals */}
      <PostDetailsModal
        post={selectedPost}
        open={detailsOpen}
        onOpenChange={setDetailsOpen}
      />

      <EditPostModal
        post={selectedPost}
        open={editOpen}
        onOpenChange={setEditOpen}
        onSave={handleSaveEdit}
      />

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Post</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this post? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default CreatorPostsManagement;
