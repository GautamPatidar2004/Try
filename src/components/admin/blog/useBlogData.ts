 import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
 import { supabase } from "@/integrations/supabase/client";
 import { useToast } from "@/hooks/use-toast";
 
 export interface BlogPost {
   id: string;
   title: string;
   slug: string;
   excerpt: string | null;
   content: string;
   featured_image_url: string | null;
   author_id: string | null;
   category: string | null;
   tags: string[] | null;
   status: string;
   published_at: string | null;
   meta_title: string | null;
   meta_description: string | null;
   views_count: number;
   reading_time_minutes: number | null;
   featured: boolean;
   created_at: string;
   updated_at: string;
   author?: {
     first_name: string | null;
     last_name: string | null;
   } | null;
 }
 
 export interface BlogStats {
   total: number;
   published: number;
   drafts: number;
   totalViews: number;
 }
 
 export const useBlogData = () => {
   const { toast } = useToast();
   const queryClient = useQueryClient();
 
   const { data: posts = [], isLoading } = useQuery({
     queryKey: ["admin-blog-posts"],
     queryFn: async () => {
       const { data, error } = await supabase
         .from("blog_posts")
         .select(`
           *,
           author:profiles!blog_posts_author_id_fkey(first_name, last_name)
         `)
         .order("created_at", { ascending: false });
 
       if (error) throw error;
       return (data || []) as BlogPost[];
     },
   });
 
   const stats: BlogStats = {
     total: posts.length,
     published: posts.filter((p) => p.status === "published").length,
     drafts: posts.filter((p) => p.status === "draft").length,
     totalViews: posts.reduce((sum, p) => sum + (p.views_count || 0), 0),
   };
 
   const createPost = useMutation({
     mutationFn: async (post: Partial<BlogPost> & { title: string; slug: string; content: string }) => {
       const { data: user } = await supabase.auth.getUser();
       const { data, error } = await supabase
         .from("blog_posts")
         .insert([{
           title: post.title,
           slug: post.slug,
           content: post.content,
           excerpt: post.excerpt,
           featured_image_url: post.featured_image_url,
           category: post.category,
           tags: post.tags,
           status: post.status || 'draft',
           meta_title: post.meta_title,
           meta_description: post.meta_description,
           featured: post.featured || false,
           reading_time_minutes: post.reading_time_minutes,
           published_at: post.status === 'published' ? new Date().toISOString() : null,
           author_id: user.user?.id,
         }])
         .select()
         .single();
 
       if (error) throw error;
       return data;
     },
     onSuccess: () => {
       queryClient.invalidateQueries({ queryKey: ["admin-blog-posts"] });
       toast({ title: "Post created successfully" });
     },
     onError: (error: Error) => {
       toast({ title: "Failed to create post", description: error.message, variant: "destructive" });
     },
   });
 
   const updatePost = useMutation({
     mutationFn: async ({ id, ...updates }: Partial<BlogPost> & { id: string }) => {
       const { data, error } = await supabase
         .from("blog_posts")
         .update(updates)
         .eq("id", id)
         .select()
         .single();
 
       if (error) throw error;
       return data;
     },
     onSuccess: () => {
       queryClient.invalidateQueries({ queryKey: ["admin-blog-posts"] });
       toast({ title: "Post updated successfully" });
     },
     onError: (error: Error) => {
       toast({ title: "Failed to update post", description: error.message, variant: "destructive" });
     },
   });
 
   const deletePost = useMutation({
     mutationFn: async (id: string) => {
       const { error } = await supabase.from("blog_posts").delete().eq("id", id);
       if (error) throw error;
     },
     onSuccess: () => {
       queryClient.invalidateQueries({ queryKey: ["admin-blog-posts"] });
       toast({ title: "Post deleted successfully" });
     },
     onError: (error: Error) => {
       toast({ title: "Failed to delete post", description: error.message, variant: "destructive" });
     },
   });
 
   const togglePublish = useMutation({
     mutationFn: async ({ id, currentStatus }: { id: string; currentStatus: string }) => {
       const newStatus = currentStatus === "published" ? "draft" : "published";
       const { data, error } = await supabase
         .from("blog_posts")
         .update({
           status: newStatus,
           published_at: newStatus === "published" ? new Date().toISOString() : null,
         })
         .eq("id", id)
         .select()
         .single();
 
       if (error) throw error;
       return data;
     },
     onSuccess: (data) => {
       queryClient.invalidateQueries({ queryKey: ["admin-blog-posts"] });
       toast({ title: data.status === "published" ? "Post published" : "Post unpublished" });
     },
     onError: (error: Error) => {
       toast({ title: "Failed to update post", description: error.message, variant: "destructive" });
     },
   });
 
   return {
     posts,
     stats,
     isLoading,
     createPost,
     updatePost,
     deletePost,
     togglePublish,
   };
 };