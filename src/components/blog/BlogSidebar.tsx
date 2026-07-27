 import { Link } from "react-router-dom";
 import { Badge } from "@/components/ui/badge";
 import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
 import { BlogCard } from "./BlogCard";
 
 interface BlogPost {
   id: string;
   title: string;
   slug: string;
   excerpt: string | null;
   featured_image_url: string | null;
   category: string | null;
   reading_time_minutes: number | null;
   published_at: string | null;
   views_count: number;
 }
 
 interface BlogSidebarProps {
   categories: string[];
   activeCategory?: string;
   tags: string[];
   recentPosts: BlogPost[];
   onCategoryChange: (category: string | null) => void;
 }
 
 export const BlogSidebar = ({
   categories,
   activeCategory,
   tags,
   recentPosts,
   onCategoryChange,
 }: BlogSidebarProps) => {
   return (
     <aside className="space-y-6">
       {/* Categories */}
       <Card>
         <CardHeader className="pb-3">
           <CardTitle className="text-lg">Categories</CardTitle>
         </CardHeader>
         <CardContent className="space-y-2">
           <button
             onClick={() => onCategoryChange(null)}
             className={`block w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
               !activeCategory
                 ? "bg-primary text-primary-foreground"
                 : "hover:bg-muted"
             }`}
           >
             All Posts
           </button>
           {categories.map((category) => (
             <button
               key={category}
               onClick={() => onCategoryChange(category)}
               className={`block w-full text-left px-3 py-2 rounded-md text-sm capitalize transition-colors ${
                 activeCategory === category
                   ? "bg-primary text-primary-foreground"
                   : "hover:bg-muted"
               }`}
             >
               {category.replace("-", " ")}
             </button>
           ))}
         </CardContent>
       </Card>
 
       {/* Tags */}
       {tags.length > 0 && (
         <Card>
           <CardHeader className="pb-3">
             <CardTitle className="text-lg">Popular Tags</CardTitle>
           </CardHeader>
           <CardContent>
             <div className="flex flex-wrap gap-2">
               {tags.slice(0, 15).map((tag) => (
                 <Badge key={tag} variant="outline" className="cursor-pointer hover:bg-muted">
                   {tag}
                 </Badge>
               ))}
             </div>
           </CardContent>
         </Card>
       )}
 
       {/* Recent Posts */}
       {recentPosts.length > 0 && (
         <Card>
           <CardHeader className="pb-3">
             <CardTitle className="text-lg">Recent Posts</CardTitle>
           </CardHeader>
           <CardContent className="space-y-4">
             {recentPosts.map((post) => (
               <BlogCard key={post.id} post={post} variant="compact" />
             ))}
           </CardContent>
         </Card>
       )}
     </aside>
   );
 };