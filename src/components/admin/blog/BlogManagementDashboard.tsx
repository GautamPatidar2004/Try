 import { useState } from "react";
 import { Plus, RefreshCw } from "lucide-react";
 import { Button } from "@/components/ui/button";
 import { BlogStatsCards } from "./BlogStatsCards";
 import { BlogPostsTable } from "./BlogPostsTable";
 import { BlogPostEditor } from "./BlogPostEditor";
 import { useBlogData, BlogPost } from "./useBlogData";
 
 export const BlogManagementDashboard = () => {
   const { posts, stats, isLoading, createPost, updatePost, deletePost, togglePublish } = useBlogData();
   const [editorOpen, setEditorOpen] = useState(false);
   const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
 
   const handleEdit = (post: BlogPost) => {
     setEditingPost(post);
     setEditorOpen(true);
   };
 
   const handleCreate = () => {
     setEditingPost(null);
     setEditorOpen(true);
   };
 
   const handleSave = async (postData: Partial<BlogPost> & { title: string; slug: string; content: string }) => {
     if (editingPost) {
       await updatePost.mutateAsync({ id: editingPost.id, ...postData });
     } else {
       await createPost.mutateAsync(postData);
     }
     setEditorOpen(false);
     setEditingPost(null);
   };
 
   const handleDelete = (id: string) => {
     deletePost.mutate(id);
   };
 
   const handleTogglePublish = (id: string, currentStatus: string) => {
     togglePublish.mutate({ id, currentStatus });
   };
 
   return (
     <div className="space-y-6">
       <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
         <div>
           <h1 className="text-2xl font-bold">Blog Management</h1>
           <p className="text-muted-foreground">Create and manage blog posts for organic SEO</p>
         </div>
         <div className="flex gap-2">
           <Button variant="outline" size="icon" disabled={isLoading}>
             <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
           </Button>
           <Button onClick={handleCreate} className="gap-2">
             <Plus className="h-4 w-4" />
             New Post
           </Button>
         </div>
       </div>
 
       <BlogStatsCards stats={stats} />
 
       <BlogPostsTable
         posts={posts}
         onEdit={handleEdit}
         onDelete={handleDelete}
         onTogglePublish={handleTogglePublish}
       />
 
       <BlogPostEditor
         post={editingPost}
         open={editorOpen}
         onClose={() => {
           setEditorOpen(false);
           setEditingPost(null);
         }}
         onSave={handleSave}
         isSaving={createPost.isPending || updatePost.isPending}
       />
     </div>
   );
 };