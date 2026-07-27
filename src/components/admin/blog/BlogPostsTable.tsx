 import { useState } from "react";
 import { format } from "date-fns";
 import { Eye, Pencil, Trash2, ExternalLink, MoreHorizontal } from "lucide-react";
 import {
   Table,
   TableBody,
   TableCell,
   TableHead,
   TableHeader,
   TableRow,
 } from "@/components/ui/table";
 import { Button } from "@/components/ui/button";
 import { Badge } from "@/components/ui/badge";
 import { Input } from "@/components/ui/input";
 import {
   Select,
   SelectContent,
   SelectItem,
   SelectTrigger,
   SelectValue,
 } from "@/components/ui/select";
 import {
   DropdownMenu,
   DropdownMenuContent,
   DropdownMenuItem,
   DropdownMenuTrigger,
 } from "@/components/ui/dropdown-menu";
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
 import type { BlogPost } from "./useBlogData";
 
 interface BlogPostsTableProps {
   posts: BlogPost[];
   onEdit: (post: BlogPost) => void;
   onDelete: (id: string) => void;
   onTogglePublish: (id: string, currentStatus: string) => void;
 }
 
 export const BlogPostsTable = ({
   posts,
   onEdit,
   onDelete,
   onTogglePublish,
 }: BlogPostsTableProps) => {
   const [search, setSearch] = useState("");
   const [statusFilter, setStatusFilter] = useState<string>("all");
   const [deleteId, setDeleteId] = useState<string | null>(null);
 
   const filteredPosts = posts.filter((post) => {
     const matchesSearch =
       post.title.toLowerCase().includes(search.toLowerCase()) ||
       post.slug.toLowerCase().includes(search.toLowerCase());
     const matchesStatus = statusFilter === "all" || post.status === statusFilter;
     return matchesSearch && matchesStatus;
   });
 
   const getStatusBadge = (status: string) => {
     switch (status) {
       case "published":
         return <Badge className="bg-primary text-primary-foreground">Published</Badge>;
       case "draft":
         return <Badge variant="secondary">Draft</Badge>;
       case "archived":
         return <Badge variant="outline">Archived</Badge>;
       default:
         return <Badge>{status}</Badge>;
     }
   };
 
   return (
     <div className="space-y-4">
       <div className="flex flex-col sm:flex-row gap-4">
         <Input
           placeholder="Search posts..."
           value={search}
           onChange={(e) => setSearch(e.target.value)}
           className="sm:max-w-xs"
         />
         <Select value={statusFilter} onValueChange={setStatusFilter}>
           <SelectTrigger className="sm:w-40">
             <SelectValue placeholder="Filter by status" />
           </SelectTrigger>
           <SelectContent>
             <SelectItem value="all">All Status</SelectItem>
             <SelectItem value="published">Published</SelectItem>
             <SelectItem value="draft">Draft</SelectItem>
             <SelectItem value="archived">Archived</SelectItem>
           </SelectContent>
         </Select>
       </div>
 
       <div className="rounded-md border">
         <Table>
           <TableHeader>
             <TableRow>
               <TableHead>Title</TableHead>
               <TableHead>Status</TableHead>
               <TableHead>Category</TableHead>
               <TableHead>Views</TableHead>
               <TableHead>Date</TableHead>
               <TableHead className="w-12"></TableHead>
             </TableRow>
           </TableHeader>
           <TableBody>
             {filteredPosts.length === 0 ? (
               <TableRow>
                 <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                   No posts found
                 </TableCell>
               </TableRow>
             ) : (
               filteredPosts.map((post) => (
                 <TableRow key={post.id}>
                   <TableCell>
                     <div className="flex items-center gap-3">
                       {post.featured_image_url && (
                         <img
                           src={post.featured_image_url}
                           alt=""
                           className="h-10 w-14 rounded object-cover"
                         />
                       )}
                       <div>
                         <p className="font-medium line-clamp-1">{post.title}</p>
                         <p className="text-xs text-muted-foreground">/{post.slug}</p>
                       </div>
                     </div>
                   </TableCell>
                   <TableCell>{getStatusBadge(post.status)}</TableCell>
                   <TableCell>
                     {post.category ? (
                       <Badge variant="outline">{post.category}</Badge>
                     ) : (
                       <span className="text-muted-foreground">—</span>
                     )}
                   </TableCell>
                   <TableCell>
                     <div className="flex items-center gap-1">
                       <Eye className="h-3 w-3 text-muted-foreground" />
                       {post.views_count}
                     </div>
                   </TableCell>
                   <TableCell className="text-muted-foreground text-sm">
                     {format(new Date(post.created_at), "MMM d, yyyy")}
                   </TableCell>
                   <TableCell>
                     <DropdownMenu>
                       <DropdownMenuTrigger asChild>
                         <Button variant="ghost" size="icon">
                           <MoreHorizontal className="h-4 w-4" />
                         </Button>
                       </DropdownMenuTrigger>
                       <DropdownMenuContent align="end">
                         <DropdownMenuItem onClick={() => onEdit(post)}>
                           <Pencil className="h-4 w-4 mr-2" />
                           Edit
                         </DropdownMenuItem>
                         <DropdownMenuItem
                           onClick={() => onTogglePublish(post.id, post.status)}
                         >
                           <ExternalLink className="h-4 w-4 mr-2" />
                           {post.status === "published" ? "Unpublish" : "Publish"}
                         </DropdownMenuItem>
                         {post.status === "published" && (
                           <DropdownMenuItem asChild>
                             <a href={`/blog/${post.slug}`} target="_blank" rel="noopener noreferrer">
                               <Eye className="h-4 w-4 mr-2" />
                               View
                             </a>
                           </DropdownMenuItem>
                         )}
                         <DropdownMenuItem
                           className="text-destructive"
                           onClick={() => setDeleteId(post.id)}
                         >
                           <Trash2 className="h-4 w-4 mr-2" />
                           Delete
                         </DropdownMenuItem>
                       </DropdownMenuContent>
                     </DropdownMenu>
                   </TableCell>
                 </TableRow>
               ))
             )}
           </TableBody>
         </Table>
       </div>
 
       <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
         <AlertDialogContent>
           <AlertDialogHeader>
             <AlertDialogTitle>Delete Blog Post</AlertDialogTitle>
             <AlertDialogDescription>
               Are you sure you want to delete this post? This action cannot be undone.
             </AlertDialogDescription>
           </AlertDialogHeader>
           <AlertDialogFooter>
             <AlertDialogCancel>Cancel</AlertDialogCancel>
             <AlertDialogAction
               className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
               onClick={() => {
                 if (deleteId) onDelete(deleteId);
                 setDeleteId(null);
               }}
             >
               Delete
             </AlertDialogAction>
           </AlertDialogFooter>
         </AlertDialogContent>
       </AlertDialog>
     </div>
   );
 };