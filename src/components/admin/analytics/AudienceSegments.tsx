 import { useState } from "react";
 import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
 import { Button } from "@/components/ui/button";
 import { Badge } from "@/components/ui/badge";
 import { useAudienceSegments, AudienceSegment } from "@/hooks/useAudienceSegments";
 import { SegmentUsersModal } from "./SegmentUsersModal";
 import { SegmentEmailModal } from "./SegmentEmailModal";
 import { 
   UserPlus, Star, Clock, Handshake, Plane, AlertCircle, Crown, Home,
   Users, Mail, Eye
 } from "lucide-react";
 
 const iconMap: Record<string, any> = {
   UserPlus,
   Star,
   Clock,
   Handshake,
   Plane,
   AlertCircle,
   Crown,
   Home
 };
 
 export const AudienceSegments = () => {
   const { data: segments, isLoading } = useAudienceSegments();
 
   const [viewModalSegment, setViewModalSegment] = useState<AudienceSegment | null>(null);
   const [emailModalSegment, setEmailModalSegment] = useState<AudienceSegment | null>(null);
 
   const handleViewClick = (segment: AudienceSegment) => {
     setViewModalSegment(segment);
   };
 
   const handleEmailClick = (segment: AudienceSegment) => {
     setEmailModalSegment(segment);
   };
 
   const handleEmailAllFromView = () => {
     if (viewModalSegment) {
       setViewModalSegment(null);
       setEmailModalSegment(viewModalSegment);
     }
   };
 
   if (isLoading) {
     return (
       <div className="space-y-4">
         <div className="flex justify-between items-center">
           <h3 className="text-lg font-semibold">Audience Segments</h3>
         </div>
         <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
           {[1, 2, 3, 4, 5, 6].map((i) => (
             <Card key={i} className="animate-pulse">
               <CardHeader className="pb-2">
                 <div className="h-5 bg-muted rounded w-32"></div>
               </CardHeader>
               <CardContent>
                 <div className="h-8 bg-muted rounded w-20 mb-2"></div>
                 <div className="h-4 bg-muted rounded w-full"></div>
               </CardContent>
             </Card>
           ))}
         </div>
       </div>
     );
   }
 
   return (
     <div className="space-y-6">
       <div className="flex justify-between items-center">
         <div>
           <h3 className="text-lg font-semibold">Audience Segments</h3>
           <p className="text-sm text-muted-foreground">
             Pre-built user segments for targeted actions
           </p>
         </div>
         <div className="flex items-center gap-2">
           <Badge variant="outline" className="gap-1">
             <Users className="h-3 w-3" />
             {segments?.length || 0} segments
           </Badge>
         </div>
       </div>
 
       <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
         {segments?.map((segment) => {
           const IconComponent = iconMap[segment.icon] || Users;
           
           return (
             <Card key={segment.id} className="hover:shadow-md transition-shadow">
               <CardHeader className="pb-2">
                 <div className="flex items-start justify-between">
                   <div className="flex items-center gap-2">
                     <div className={`p-2 rounded-lg ${segment.color}`}>
                       <IconComponent className="h-4 w-4" />
                     </div>
                     <CardTitle className="text-sm font-medium">{segment.name}</CardTitle>
                   </div>
                 </div>
               </CardHeader>
               <CardContent>
                 <div className="text-3xl font-bold mb-1">
                   {segment.count.toLocaleString()}
                 </div>
                 <p className="text-xs text-muted-foreground mb-4">
                   {segment.description}
                 </p>
                 <div className="flex gap-2">
                   <Button 
                     variant="outline" 
                     size="sm" 
                     className="flex-1 gap-1"
                     onClick={() => handleViewClick(segment)}
                     disabled={segment.count === 0}
                   >
                     <Eye className="h-3 w-3" />
                     View
                   </Button>
                   <Button 
                     variant="outline" 
                     size="sm" 
                     className="flex-1 gap-1"
                     onClick={() => handleEmailClick(segment)}
                     disabled={segment.count === 0}
                   >
                     <Mail className="h-3 w-3" />
                     Email
                   </Button>
                 </div>
               </CardContent>
             </Card>
           );
         })}
       </div>
 
       {/* Quick Stats */}
       <Card>
         <CardHeader>
           <CardTitle className="text-sm font-medium">Segment Overview</CardTitle>
         </CardHeader>
         <CardContent>
           <div className="grid gap-4 md:grid-cols-4">
             <div className="text-center p-4 bg-muted rounded-lg">
               <div className="text-2xl font-bold text-primary">
                 {segments?.find(s => s.id === 'new-users')?.count || 0}
               </div>
               <p className="text-xs text-muted-foreground">New this month</p>
             </div>
             <div className="text-center p-4 bg-muted rounded-lg">
               <div className="text-2xl font-bold text-chart-1">
                 {segments?.find(s => s.id === 'high-value')?.count || 0}
               </div>
               <p className="text-xs text-muted-foreground">High-value creators</p>
             </div>
             <div className="text-center p-4 bg-muted rounded-lg">
               <div className="text-2xl font-bold text-destructive">
                 {segments?.find(s => s.id === 'inactive')?.count || 0}
               </div>
               <p className="text-xs text-muted-foreground">Need re-engagement</p>
             </div>
             <div className="text-center p-4 bg-muted rounded-lg">
               <div className="text-2xl font-bold text-chart-2">
                 {segments?.find(s => s.id === 'active-collaborators')?.count || 0}
               </div>
               <p className="text-xs text-muted-foreground">Active collaborators</p>
             </div>
           </div>
         </CardContent>
       </Card>
 
       {/* View Segment Modal */}
       <SegmentUsersModal
         open={!!viewModalSegment}
         onOpenChange={(open) => !open && setViewModalSegment(null)}
         segment={viewModalSegment}
         onEmailAll={handleEmailAllFromView}
       />
 
       {/* Email Segment Modal */}
       <SegmentEmailModal
         open={!!emailModalSegment}
         onOpenChange={(open) => !open && setEmailModalSegment(null)}
         segment={emailModalSegment}
       />
     </div>
   );
 };