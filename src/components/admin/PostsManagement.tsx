
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import PostsHeader from "./posts/PostsHeader";
import PostsTable from "./posts/PostsTable";
import { usePostsData } from "./posts/usePostsData";
import { usePostsFilter } from "./posts/usePostsFilter";

const PostsManagement = () => {
  const { posts, loading, updateApprovalStatus } = usePostsData();
  const { 
    searchTerm, 
    setSearchTerm, 
    filterStatus, 
    setFilterStatus, 
    filteredPosts 
  } = usePostsFilter(posts);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <PostsHeader 
            postsCount={0}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            filterStatus={filterStatus}
            onFilterChange={setFilterStatus}
          />
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-12 bg-gray-200 rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-gray-900">Posts Management</h2>
      
      <Card>
        <CardHeader>
          <PostsHeader 
            postsCount={filteredPosts.length}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            filterStatus={filterStatus}
            onFilterChange={setFilterStatus}
          />
        </CardHeader>
        
        <CardContent>
          <PostsTable 
            posts={filteredPosts}
            onUpdateStatus={updateApprovalStatus}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default PostsManagement;
