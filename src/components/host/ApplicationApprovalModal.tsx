import { useState, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Percent, TrendingUp, Crown, Info } from "lucide-react";
import { useProductAnalytics } from "@/hooks/useProductAnalytics";
 
interface ApplicationApprovalModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onApprove: (commissionRate: number) => void;
  creatorName: string;
  creatorId?: string;
  propertyTitle: string;
  isLoading?: boolean;
}
 
 const COMMISSION_OPTIONS = [
   {
     rate: 0.10,
     label: "10%",
     name: "Standard",
     description: "Default commission for most collaborations",
     icon: Percent,
   },
   {
     rate: 0.20,
     label: "20%",
     name: "Enhanced",
     description: "Higher commission for established creators",
     icon: TrendingUp,
   },
   {
     rate: 0.25,
     label: "25%",
     name: "Premium",
     description: "Maximum commission for top-tier creators",
     icon: Crown,
   },
 ];
 
export const ApplicationApprovalModal = ({
  open,
  onOpenChange,
  onApprove,
  creatorName,
  creatorId,
  propertyTitle,
  isLoading = false,
}: ApplicationApprovalModalProps) => {
  const [selectedRate, setSelectedRate] = useState<number>(0.10);
  const { trackInviteSent } = useProductAnalytics();
  const inviteTrackedRef = useRef(false);

  const handleApprove = () => {
    // Track invite sent only once
    if (creatorId && !inviteTrackedRef.current) {
      trackInviteSent({ creator_id: creatorId, offer_type: 'collaboration' });
      inviteTrackedRef.current = true;
    }
    onApprove(selectedRate);
  };
 
   return (
     <Dialog open={open} onOpenChange={onOpenChange}>
       <DialogContent className="max-w-lg">
         <DialogHeader>
           <DialogTitle className="text-xl">Approve Collaboration</DialogTitle>
           <DialogDescription className="text-base">
             You're about to approve <span className="font-semibold text-foreground">{creatorName}</span>'s 
             application for <span className="font-semibold text-foreground">{propertyTitle}</span>.
           </DialogDescription>
         </DialogHeader>
 
         <div className="space-y-4 py-4">
           <div className="space-y-3">
             <div className="flex items-center gap-2">
               <Percent className="h-5 w-5 text-primary" />
               <h3 className="font-semibold text-foreground">Affiliate Commission Rate</h3>
             </div>
             <p className="text-sm text-muted-foreground">
               Select the commission rate the creator will earn on bookings driven through their affiliate code:
             </p>
           </div>
 
           <RadioGroup
             value={selectedRate.toString()}
             onValueChange={(value) => setSelectedRate(parseFloat(value))}
             className="space-y-3"
           >
             {COMMISSION_OPTIONS.map((option) => (
               <Label
                 key={option.rate}
                 htmlFor={`rate-${option.rate}`}
                 className={`flex items-center gap-4 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                   selectedRate === option.rate
                     ? "border-primary bg-primary/5"
                     : "border-border hover:border-primary/50"
                 }`}
               >
                 <RadioGroupItem value={option.rate.toString()} id={`rate-${option.rate}`} />
                 <option.icon className={`h-5 w-5 ${selectedRate === option.rate ? "text-primary" : "text-muted-foreground"}`} />
                 <div className="flex-1">
                   <div className="flex items-center gap-2">
                     <span className="font-bold text-lg">{option.label}</span>
                     <span className="text-sm text-muted-foreground">({option.name})</span>
                   </div>
                   <p className="text-sm text-muted-foreground">{option.description}</p>
                 </div>
               </Label>
             ))}
           </RadioGroup>
 
           <div className="flex items-start gap-2 p-3 bg-muted/50 rounded-lg">
             <Info className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
             <p className="text-xs text-muted-foreground">
               This rate applies to all bookings made using the creator's unique promo code. 
               Both parties will need to agree to this rate in the collaboration contract.
             </p>
           </div>
         </div>
 
         <DialogFooter className="gap-2">
           <Button
             variant="outline"
             onClick={() => onOpenChange(false)}
             disabled={isLoading}
           >
             Cancel
           </Button>
           <Button
             onClick={handleApprove}
             disabled={isLoading}
             className="bg-brand-green hover:bg-brand-green/90"
           >
             {isLoading ? "Processing..." : "Approve & Continue"}
           </Button>
         </DialogFooter>
       </DialogContent>
     </Dialog>
   );
 };