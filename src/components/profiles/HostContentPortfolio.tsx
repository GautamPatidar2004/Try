 import { useHostContent } from "@/hooks/useHostContent";
 import ContentCard from "./ContentCard";
 import EmptyState from "@/components/shared/EmptyState";
 import { Skeleton } from "@/components/ui/skeleton";
 import {
   Select,
   SelectContent,
   SelectItem,
   SelectTrigger,
   SelectValue,
 } from "@/components/ui/select";
 import { Image as ImageIcon, Clock, CheckCircle, AlertCircle } from "lucide-react";
 import { Badge } from "@/components/ui/badge";
 
 interface HostContentPortfolioProps {
   hostId: string;
 }
 
 const HostContentPortfolio = ({ hostId }: HostContentPortfolioProps) => {
   const {
     content,
     allContent,
     loading,
     filter,
     setFilter,
     approveContent,
     requestRevision,
     pendingCount,
   } = useHostContent(hostId);
 
   const stats = {
     total: allContent.length,
     pending: allContent.filter((c) => c.host_approval_status === "pending").length,
     approved: allContent.filter((c) => c.host_approval_status === "approved").length,
     revision: allContent.filter((c) => c.host_approval_status === "revision_requested").length,
   };
 
   if (loading) {
     return (
       <div className="space-y-6">
         <div className="flex justify-between items-center">
           <Skeleton className="h-8 w-48" />
           <Skeleton className="h-10 w-32" />
         </div>
         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
           {[1, 2, 3, 4].map((i) => (
             <div key={i} className="space-y-3">
               <Skeleton className="aspect-square w-full rounded-lg" />
               <Skeleton className="h-4 w-3/4" />
               <Skeleton className="h-4 w-1/2" />
             </div>
           ))}
         </div>
       </div>
     );
   }
 
   return (
     <div className="space-y-6">
       {/* Header with Stats */}
       <div className="flex flex-col sm:flex-row justify-between gap-4">
         <div className="flex items-center gap-4 flex-wrap">
           <h2 className="text-lg font-semibold">Content Portfolio</h2>
           <div className="flex gap-2">
             <Badge variant="outline" className="gap-1">
               <ImageIcon className="h-3 w-3" />
               {stats.total} Total
             </Badge>
             {stats.pending > 0 && (
               <Badge variant="outline" className="text-accent-foreground border-accent bg-accent/50 gap-1">
                 <Clock className="h-3 w-3" />
                 {stats.pending} Pending
               </Badge>
             )}
             {stats.approved > 0 && (
               <Badge variant="outline" className="text-primary border-primary/30 bg-primary/10 gap-1">
                 <CheckCircle className="h-3 w-3" />
                 {stats.approved} Approved
               </Badge>
             )}
           </div>
         </div>
 
         <Select
           value={filter}
           onValueChange={(value: "all" | "pending" | "approved" | "revision_requested") =>
             setFilter(value)
           }
         >
           <SelectTrigger className="w-[180px]">
             <SelectValue placeholder="Filter by status" />
           </SelectTrigger>
           <SelectContent>
             <SelectItem value="all">All Content</SelectItem>
             <SelectItem value="pending">Pending Approval</SelectItem>
             <SelectItem value="approved">Approved</SelectItem>
             <SelectItem value="revision_requested">Revision Requested</SelectItem>
           </SelectContent>
         </Select>
       </div>
 
       {/* Content Grid */}
       {content.length === 0 ? (
         <EmptyState
           icon={ImageIcon}
           title={filter === "all" ? "No content delivered yet" : `No ${filter.replace("_", " ")} content`}
           description={
             filter === "all"
               ? "Content from your creator collaborations will appear here once they complete their stays."
               : `There is no content with '${filter.replace("_", " ")}' status.`
           }
         />
       ) : (
         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
           {content.map((item) => (
             <ContentCard
               key={item.id}
               content={item}
               onApprove={approveContent}
               onRequestRevision={requestRevision}
             />
           ))}
         </div>
       )}
     </div>
   );
 };
 
 export default HostContentPortfolio;