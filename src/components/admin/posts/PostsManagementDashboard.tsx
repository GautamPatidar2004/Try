import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, CheckCircle, Clock, Heart, Eye, TrendingUp } from "lucide-react";
import { usePostsData } from "./usePostsData";
import { usePostsFilter } from "./usePostsFilter";
import PostStatsCard from "./PostStatsCard";
import PostsTimelineChart from "./PostsTimelineChart";
import MediaTypeChart from "./MediaTypeChart";
import TopPostsCard from "./TopPostsCard";
import PostsTable from "./PostsTable";
import PostsHeader from "./PostsHeader";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

const PostsManagementDashboard = () => {
  const { posts, loading, updateApprovalStatus, bulkUpdateStatus, getStats } = usePostsData();
  const { 
    searchTerm, 
    setSearchTerm, 
    filterStatus, 
    setFilterStatus, 
    filteredPosts 
  } = usePostsFilter(posts);

  const stats = getStats();

  if (loading) {
    return (
      <div className="space-y-6">
        <h2 className="text-3xl font-bold">Posts Management</h2>
        <div className="animate-pulse space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-32 bg-muted rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold">Posts Management</h2>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <PostStatsCard
          title="Total Posts"
          value={stats.total}
          icon={FileText}
          description="All-time content"
        />
        <PostStatsCard
          title="Pending Approval"
          value={stats.pending}
          icon={Clock}
          description="Needs review"
        />
        <PostStatsCard
          title="Approved"
          value={stats.approved}
          icon={CheckCircle}
          description="Accepted content"
        />
        <PostStatsCard
          title="Total Likes"
          value={stats.totalLikes.toLocaleString()}
          icon={Heart}
          description="All-time engagement"
        />
        <PostStatsCard
          title="Total Views"
          value={stats.totalViews.toLocaleString()}
          icon={Eye}
          description="All-time reach"
        />
        <PostStatsCard
          title="Avg Engagement"
          value={`${stats.avgEngagement}%`}
          icon={TrendingUp}
          description="Likes per view"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PostsTimelineChart posts={posts} />
        <MediaTypeChart posts={posts} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Tabs defaultValue="all" className="w-full">
            <TabsList>
              <TabsTrigger value="all">All Posts</TabsTrigger>
              <TabsTrigger value="pending">Pending</TabsTrigger>
              <TabsTrigger value="approved">Approved</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="mt-6">
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
            </TabsContent>

            <TabsContent value="pending" className="mt-6">
              <Card>
                <CardHeader>
                  <PostsHeader 
                    postsCount={filteredPosts.filter(p => p.host_approval_status === 'pending').length}
                    searchTerm={searchTerm}
                    onSearchChange={setSearchTerm}
                    filterStatus="pending"
                    onFilterChange={setFilterStatus}
                  />
                </CardHeader>
                <CardContent>
                  <PostsTable 
                    posts={filteredPosts.filter(p => p.host_approval_status === 'pending')}
                    onUpdateStatus={updateApprovalStatus}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="approved" className="mt-6">
              <Card>
                <CardHeader>
                  <PostsHeader 
                    postsCount={filteredPosts.filter(p => p.host_approval_status === 'approved').length}
                    searchTerm={searchTerm}
                    onSearchChange={setSearchTerm}
                    filterStatus="approved"
                    onFilterChange={setFilterStatus}
                  />
                </CardHeader>
                <CardContent>
                  <PostsTable 
                    posts={filteredPosts.filter(p => p.host_approval_status === 'approved')}
                    onUpdateStatus={updateApprovalStatus}
                  />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        <div>
          <TopPostsCard posts={posts} />
        </div>
      </div>
    </div>
  );
};

export default PostsManagementDashboard;
