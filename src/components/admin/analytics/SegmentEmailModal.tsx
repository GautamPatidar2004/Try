 import { useState } from "react";
 import {
   Dialog,
   DialogContent,
   DialogHeader,
   DialogTitle,
 } from "@/components/ui/dialog";
 import { Button } from "@/components/ui/button";
 import { Input } from "@/components/ui/input";
 import { Label } from "@/components/ui/label";
 import { Checkbox } from "@/components/ui/checkbox";
 import { Badge } from "@/components/ui/badge";
 import { RichEmailEditor } from "@/components/admin/communications/RichEmailEditor";
 import { EmailPreviewModal } from "@/components/admin/communications/EmailPreviewModal";
 import { useCommunications } from "@/hooks/useCommunications";
 import { AudienceSegment } from "@/hooks/useAudienceSegments";
 import { Mail, Send, Eye, Loader2 } from "lucide-react";
 
 interface SegmentEmailModalProps {
   open: boolean;
   onOpenChange: (open: boolean) => void;
   segment: AudienceSegment | null;
 }
 
 export const SegmentEmailModal = ({
   open,
   onOpenChange,
   segment,
 }: SegmentEmailModalProps) => {
   const { sendEmailCampaign, sendBroadcastNotification } = useCommunications();
   const [name, setName] = useState("");
   const [subject, setSubject] = useState("");
   const [content, setContent] = useState("");
   const [sendInAppToo, setSendInAppToo] = useState(false);
   const [showPreview, setShowPreview] = useState(false);
 
   // Reset form when modal opens with new segment
   const handleOpenChange = (isOpen: boolean) => {
     if (isOpen && segment) {
       setName(`${segment.name} Campaign`);
       setSubject("");
       setContent("");
       setSendInAppToo(false);
     }
     onOpenChange(isOpen);
   };
 
   const buildTargetSegment = () => {
     if (!segment) return {};
     
     // Map segment criteria to targetSegment format for edge function
     const criteria = segment.criteria;
     const target: Record<string, any> = {
       segmentId: segment.id,
       ...criteria,
     };
     
     return target;
   };
 
   const handleSend = async () => {
     if (!name.trim() || !subject.trim() || !content.trim() || !segment) return;
 
     const targetSegment = buildTargetSegment();
 
     sendEmailCampaign.mutate(
       {
         name,
         subject,
         content,
         targetSegment,
       },
       {
         onSuccess: () => {
           onOpenChange(false);
         },
       }
     );
 
     if (sendInAppToo) {
       sendBroadcastNotification.mutate({
         name: `${name} (In-App)`,
         content: subject,
         targetSegment,
       });
     }
   };
 
   return (
     <>
       <Dialog open={open} onOpenChange={handleOpenChange}>
         <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
           <DialogHeader>
             <DialogTitle className="flex items-center gap-2">
               <Mail className="h-5 w-5" />
               Email: {segment?.name}
               <Badge variant="secondary">{segment?.count || 0} recipients</Badge>
             </DialogTitle>
           </DialogHeader>
 
           <div className="space-y-4 pt-4">
             <div className="grid gap-4 md:grid-cols-2">
               <div className="space-y-2">
                 <Label htmlFor="campaign-name">Campaign Name</Label>
                 <Input
                   id="campaign-name"
                   placeholder="e.g., High-Value Creators Outreach"
                   value={name}
                   onChange={(e) => setName(e.target.value)}
                 />
               </div>
               <div className="space-y-2">
                 <Label htmlFor="email-subject">Email Subject</Label>
                 <Input
                   id="email-subject"
                   placeholder="Enter email subject..."
                   value={subject}
                   onChange={(e) => setSubject(e.target.value)}
                 />
               </div>
             </div>
 
             <div className="space-y-2">
               <Label>Email Content</Label>
               <RichEmailEditor
                 value={content}
                 onChange={setContent}
                 placeholder="Compose your email..."
               />
               <p className="text-xs text-muted-foreground">
                 Use variables: {"{firstName}"}, {"{lastName}"}, {"{email}"}, {"{userType}"}
               </p>
             </div>
 
             <div className="flex items-center space-x-2">
               <Checkbox
                 id="send-inapp"
                 checked={sendInAppToo}
                 onCheckedChange={(checked) => setSendInAppToo(checked as boolean)}
               />
               <Label htmlFor="send-inapp" className="text-sm font-normal cursor-pointer">
                 Also send as in-app notification
               </Label>
             </div>
 
             <div className="flex justify-end gap-2 pt-4 border-t">
               <Button
                 variant="outline"
                 onClick={() => setShowPreview(true)}
                 disabled={!content.trim()}
               >
                 <Eye className="h-4 w-4 mr-2" />
                 Preview
               </Button>
               <Button
                 onClick={handleSend}
                 disabled={
                   !name.trim() ||
                   !subject.trim() ||
                   !content.trim() ||
                   sendEmailCampaign.isPending ||
                   (segment?.count || 0) === 0
                 }
               >
                 {sendEmailCampaign.isPending ? (
                   <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                 ) : (
                   <Send className="h-4 w-4 mr-2" />
                 )}
                 {sendEmailCampaign.isPending ? "Sending..." : "Send Campaign"}
               </Button>
             </div>
           </div>
         </DialogContent>
       </Dialog>
 
       <EmailPreviewModal
         open={showPreview}
         onOpenChange={setShowPreview}
         subject={subject}
         content={content}
       />
     </>
   );
 };