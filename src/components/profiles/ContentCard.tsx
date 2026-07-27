 import { useState } from "react";
 import { Card, CardContent } from "@/components/ui/card";
 import { Button } from "@/components/ui/button";
 import { Badge } from "@/components/ui/badge";
 import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
 import {
   Dialog,
   DialogContent,
   DialogHeader,
   DialogTitle,
 } from "@/components/ui/dialog";
 import {
   Check,
   RotateCcw,
   Download,
   Play,
   Image as ImageIcon,
   ExternalLink,
   Clock,
   CheckCircle,
   AlertCircle,
   MessageCircle,
   Eye,
   Heart,
   Share2,
 } from "lucide-react";
 import { format } from "date-fns";
 import type { HostContent } from "@/hooks/useHostContent";
 
 interface ContentCardProps {
   content: HostContent;
   onApprove: (id: string) => void;
   onRequestRevision: (id: string) => void;
 }
 
 const ContentCard = ({ content, onApprove, onRequestRevision }: ContentCardProps) => {
   const [showPreview, setShowPreview] = useState(false);
 
   const getStatusBadge = () => {
     switch (content.host_approval_status) {
       case "approved":
         return (
           <Badge variant="outline" className="text-primary border-primary/30 bg-primary/10">
             <CheckCircle className="h-3 w-3 mr-1" />
             Approved
           </Badge>
         );
       case "revision_requested":
         return (
           <Badge variant="outline" className="text-destructive border-destructive/30 bg-destructive/10">
             <AlertCircle className="h-3 w-3 mr-1" />
             Revision Requested
           </Badge>
         );
       default:
         return (
           <Badge variant="outline" className="text-accent-foreground border-accent bg-accent/50">
             <Clock className="h-3 w-3 mr-1" />
             Pending
           </Badge>
         );
     }
   };
 
   const isVideo = content.media_type === "video";
 
   return (
     <>
       <Card className="overflow-hidden hover:shadow-lg transition-shadow">
         {/* Media Preview */}
         <div
           className="relative aspect-square bg-muted cursor-pointer group"
           onClick={() => setShowPreview(true)}
         >
           {isVideo ? (
             <div className="w-full h-full flex items-center justify-center bg-muted">
               <video
                 src={content.media_url}
                 className="w-full h-full object-cover"
                 muted
               />
               <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/40 transition-colors">
                 <Play className="h-12 w-12 text-white" />
               </div>
             </div>
           ) : (
             <img
               src={content.media_url}
               alt={content.caption || "Content"}
               className="w-full h-full object-cover group-hover:scale-105 transition-transform"
             />
           )}

                   {/* Metrics Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1">
                <Heart className="w-4 h-4" />
                <span>{content.likes_count || 0}</span>
              </div>
              <div className="flex items-center gap-1">
                <Eye className="w-4 h-4" />
                <span>{content.views_count || 0}</span>
              </div>
              <div className="flex items-center gap-1">
                <MessageCircle className="w-4 h-4" />
                <span>{content.comments_count || 0}</span>
              </div>
              <div className="flex items-center gap-1">
             <Share2 className="w-4 h-4" />
            <span>{content.shares_count || 0}</span>
            </div>
            </div>
          </div>
        </div>

           <div className="absolute top-2 right-2">
             {isVideo ? (
               <Badge variant="secondary" className="bg-background/80">
                 <Play className="h-3 w-3 mr-1" />
                 Video
               </Badge>
             ) : (
               <Badge variant="secondary" className="bg-background/80">
                 <ImageIcon className="h-3 w-3 mr-1" />
                 Image
               </Badge>
             )}
           </div>
         </div>
 
         <CardContent className="p-4 space-y-3">
           {/* Property */}
           <p className="font-medium text-sm truncate">{content.property_title}</p>
 
           {/* Creator */}
           <div className="flex items-center gap-2">
             <Avatar className="h-6 w-6">
               <AvatarImage src={content.creator_avatar || undefined} />
               <AvatarFallback className="text-xs">
                 {content.creator_name.charAt(0)}
               </AvatarFallback>
             </Avatar>
             <span className="text-xs text-muted-foreground">
               By: {content.creator_name}
             </span>
           </div>
 
           {/* Status & Date */}
           <div className="flex items-center justify-between">
             {getStatusBadge()}
             <span className="text-xs text-muted-foreground">
               {format(new Date(content.created_at), "MMM d, yyyy")}
             </span>
           </div>
 
           {/* Actions */}
           <div className="flex gap-2 pt-2">
             {content.host_approval_status !== "approved" && (
               <Button
                 size="sm"
                 className="flex-1"
                 onClick={(e) => {
                   e.stopPropagation();
                   onApprove(content.id);
                 }}
               >
                 <Check className="h-4 w-4 mr-1" />
                 Approve
               </Button>
             )}
             {content.host_approval_status !== "revision_requested" && content.host_approval_status !== "approved" && (
               <Button
                 size="sm"
                 variant="outline"
                 onClick={(e) => {
                   e.stopPropagation();
                   onRequestRevision(content.id);
                 }}
               >
                 <RotateCcw className="h-4 w-4" />
               </Button>
             )}
             <Button
               size="sm"
               variant="outline"
               onClick={(e) => {
                 e.stopPropagation();
                 window.open(content.media_url, "_blank");
               }}
             >
               <Download className="h-4 w-4" />
             </Button>
           </div>
         </CardContent>
       </Card>
 
       {/* Preview Dialog */}
       <Dialog open={showPreview} onOpenChange={setShowPreview}>
         <DialogContent className="max-w-3xl">
           <DialogHeader>
             <DialogTitle className="flex items-center gap-2">
               {content.property_title}
               <span className="text-muted-foreground font-normal">
                 by {content.creator_name}
               </span>
             </DialogTitle>
           </DialogHeader>
 
           <div className="space-y-4">
             {/* Media */}
             <div className="rounded-lg overflow-hidden bg-muted">
               {isVideo ? (
                 <video
                   src={content.media_url}
                   controls
                   className="w-full max-h-[60vh] object-contain"
                 />
               ) : (
                 <img
                   src={content.media_url}
                   alt={content.caption || "Content"}
                   className="w-full max-h-[60vh] object-contain"
                 />
               )}
             </div>
 
             {/* Caption */}
             {content.caption && (
               <div>
                 <p className="text-sm font-medium mb-1">Caption</p>
                 <p className="text-sm text-muted-foreground">{content.caption}</p>
               </div>
             )}
 
             {/* Hashtags */}
             {content.hashtags && content.hashtags.length > 0 && (
               <div className="flex flex-wrap gap-1">
                 {content.hashtags.map((tag, i) => (
                   <Badge key={i} variant="secondary" className="text-xs">
                     #{tag}
                   </Badge>
                 ))}
               </div>
             )}
 
             {/* Actions */}
             <div className="flex gap-2 pt-2">
               {content.host_approval_status !== "approved" && (
                 <Button onClick={() => onApprove(content.id)}>
                   <Check className="h-4 w-4 mr-2" />
                   Approve Content
                 </Button>
               )}
               {content.host_approval_status !== "revision_requested" && content.host_approval_status !== "approved" && (
                 <Button
                   variant="outline"
                   onClick={() => onRequestRevision(content.id)}
                 >
                   <RotateCcw className="h-4 w-4 mr-2" />
                   Request Revision
                 </Button>
               )}
               <Button
                 variant="outline"
                 onClick={() => window.open(content.media_url, "_blank")}
               >
                 <ExternalLink className="h-4 w-4 mr-2" />
                 Open Original
               </Button>
             </div>
           </div>
         </DialogContent>
       </Dialog>
     </>
   );
 };
 
 export default ContentCard;