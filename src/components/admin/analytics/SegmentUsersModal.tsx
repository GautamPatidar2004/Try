 import { useState } from "react";
 import {
   Dialog,
   DialogContent,
   DialogHeader,
   DialogTitle,
 } from "@/components/ui/dialog";
 import { Button } from "@/components/ui/button";
 import { Input } from "@/components/ui/input";
 import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
 import { Badge } from "@/components/ui/badge";
 import { ScrollArea } from "@/components/ui/scroll-area";
 import {
   Table,
   TableBody,
   TableCell,
   TableHead,
   TableHeader,
   TableRow,
 } from "@/components/ui/table";
 import { useSegmentUsers, SegmentUser } from "@/hooks/useSegmentUsers";
 import { AudienceSegment } from "@/hooks/useAudienceSegments";
 import { format } from "date-fns";
 import {
   Search,
   Download,
   Mail,
   ChevronLeft,
   ChevronRight,
   Loader2,
   Users,
 } from "lucide-react";
 import { useToast } from "@/hooks/use-toast";
 
 interface SegmentUsersModalProps {
   open: boolean;
   onOpenChange: (open: boolean) => void;
   segment: AudienceSegment | null;
   onEmailAll: () => void;
 }
 
 export const SegmentUsersModal = ({
   open,
   onOpenChange,
   segment,
   onEmailAll,
 }: SegmentUsersModalProps) => {
   const [page, setPage] = useState(0);
   const [searchQuery, setSearchQuery] = useState("");
   const { toast } = useToast();
   const pageSize = 50;
 
   const { data, isLoading } = useSegmentUsers({
     segmentId: segment?.id || "",
     page,
     pageSize,
     searchQuery,
     enabled: open && !!segment,
   });
 
   const users = data?.users || [];
   const totalCount = data?.totalCount || 0;
   const totalPages = Math.ceil(totalCount / pageSize);
 
   const handleExportCSV = () => {
     if (!users.length) return;
 
     const headers = ["Name", "Email", "Type", "Location", "Joined", "Verified"];
     const rows = users.map((user) => [
       `${user.first_name || ""} ${user.last_name || ""}`.trim() || "Unknown",
       user.email || "",
       user.user_type || "",
       user.location || "",
       format(new Date(user.created_at), "yyyy-MM-dd"),
       user.verified ? "Yes" : "No",
     ]);
 
     const csvContent = [headers, ...rows]
       .map((row) => row.map((cell) => `"${cell}"`).join(","))
       .join("\n");
 
     const blob = new Blob([csvContent], { type: "text/csv" });
     const url = URL.createObjectURL(blob);
     const a = document.createElement("a");
     a.href = url;
     a.download = `${segment?.name.toLowerCase().replace(/\s+/g, "-")}-users.csv`;
     a.click();
     URL.revokeObjectURL(url);
 
     toast({
       title: "Export complete",
       description: `Exported ${users.length} users to CSV`,
     });
   };
 
   const getUserInitials = (user: SegmentUser) => {
     const first = user.first_name?.[0] || "";
     const last = user.last_name?.[0] || "";
     return (first + last).toUpperCase() || "?";
   };
 
   return (
     <Dialog open={open} onOpenChange={onOpenChange}>
       <DialogContent className="max-w-4xl max-h-[85vh] flex flex-col">
         <DialogHeader>
           <div className="flex items-center justify-between">
             <DialogTitle className="flex items-center gap-2">
               <Users className="h-5 w-5" />
               {segment?.name}
               <Badge variant="secondary">{totalCount} users</Badge>
             </DialogTitle>
           </div>
         </DialogHeader>
 
         <div className="flex items-center gap-2 py-2">
           <div className="relative flex-1">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
             <Input
               placeholder="Search by name..."
               value={searchQuery}
               onChange={(e) => {
                 setSearchQuery(e.target.value);
                 setPage(0);
               }}
               className="pl-9"
             />
           </div>
           <Button variant="outline" size="sm" onClick={handleExportCSV} disabled={!users.length}>
             <Download className="h-4 w-4 mr-2" />
             Export CSV
           </Button>
           <Button size="sm" onClick={onEmailAll} disabled={totalCount === 0}>
             <Mail className="h-4 w-4 mr-2" />
             Email All
           </Button>
         </div>
 
         <ScrollArea className="flex-1 min-h-0">
           {isLoading ? (
             <div className="flex items-center justify-center py-12">
               <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
             </div>
           ) : users.length === 0 ? (
             <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
               <Users className="h-12 w-12 mb-4" />
               <p>No users found in this segment</p>
             </div>
           ) : (
             <Table>
               <TableHeader>
                 <TableRow>
                   <TableHead>User</TableHead>
                   <TableHead>Type</TableHead>
                   <TableHead>Location</TableHead>
                   <TableHead>Joined</TableHead>
                   <TableHead>Status</TableHead>
                 </TableRow>
               </TableHeader>
               <TableBody>
                 {users.map((user) => (
                   <TableRow key={user.id}>
                     <TableCell>
                       <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                           <AvatarImage src={user.profile_photo_url || undefined} />
                           <AvatarFallback className="text-xs">
                             {getUserInitials(user)}
                           </AvatarFallback>
                         </Avatar>
                         <div>
                           <div className="font-medium">
                             {user.first_name || user.last_name
                               ? `${user.first_name || ""} ${user.last_name || ""}`.trim()
                               : "Unknown"}
                           </div>
                           <div className="text-xs text-muted-foreground">
                             {user.email || "No email"}
                           </div>
                         </div>
                       </div>
                     </TableCell>
                     <TableCell>
                       <Badge variant="outline" className="capitalize">
                         {user.user_type || "—"}
                       </Badge>
                     </TableCell>
                     <TableCell className="text-muted-foreground">
                       {user.location || "—"}
                     </TableCell>
                     <TableCell className="text-muted-foreground">
                       {format(new Date(user.created_at), "MMM d, yyyy")}
                     </TableCell>
                     <TableCell>
                     {user.verified ? (
                         <Badge className="bg-chart-2/20 text-chart-2">Verified</Badge>
                       ) : (
                         <Badge variant="secondary">Unverified</Badge>
                       )}
                     </TableCell>
                   </TableRow>
                 ))}
               </TableBody>
             </Table>
           )}
         </ScrollArea>
 
         {totalPages > 1 && (
           <div className="flex items-center justify-between pt-4 border-t">
             <p className="text-sm text-muted-foreground">
               Showing {page * pageSize + 1}-{Math.min((page + 1) * pageSize, totalCount)} of{" "}
               {totalCount}
             </p>
             <div className="flex items-center gap-2">
               <Button
                 variant="outline"
                 size="sm"
                 onClick={() => setPage((p) => Math.max(0, p - 1))}
                 disabled={page === 0}
               >
                 <ChevronLeft className="h-4 w-4" />
                 Previous
               </Button>
               <Button
                 variant="outline"
                 size="sm"
                 onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                 disabled={page >= totalPages - 1}
               >
                 Next
                 <ChevronRight className="h-4 w-4" />
               </Button>
             </div>
           </div>
         )}
       </DialogContent>
     </Dialog>
   );
 };