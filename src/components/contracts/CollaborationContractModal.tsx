import { useState, useRef } from "react";
import { FileText, CheckCircle2, ArrowLeft } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { ContractContentPreview } from "./ContractContentPreview";
import { ContractSignatureSection, ContractSignatureSectionRef } from "./ContractSignatureSection";

interface ContractData {
  agreementId: string;
  propertyTitle: string;
  propertyLocation: string;
  propertyType: string;
  hostName: string;
  hostId: string;
  influencerName: string;
  influencerId: string;
  influencerFollowers?: number;
  influencerInstagram?: string;
  checkInDate?: string;
  checkOutDate?: string;
  deliverables: string[];
  deadline?: string;
  collaborationType: string;
  agreedRate?: number;
  currency?: string;
   affiliateCommissionRate?: number;
}

interface CollaborationContractModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onContractSigned: (data: {
    signatureData: string;
    legalName: string;
  }) => void;
  contractData: ContractData;
  partyType: "host" | "influencer" | "brand" | "creator";
  isSubmitting?: boolean;
}

export const CollaborationContractModal = ({
  open,
  onOpenChange,
  onContractSigned,
  contractData,
  partyType,
  isSubmitting = false,
}: CollaborationContractModalProps) => {
  const { toast } = useToast();
  const signatureRef = useRef<ContractSignatureSectionRef>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  
  const [currentView, setCurrentView] = useState<"review" | "sign">("review");
  const [legalName, setLegalName] = useState("");
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);
  const [agreedTerms, setAgreedTerms] = useState({
    readAgreement: false,
    contentLicensing: false,
    cancellationPolicy: false,
     affiliateCommission: false,
  });

  const isFormValid =
    legalName.trim().length > 0 &&
    hasScrolledToBottom &&
    agreedTerms.readAgreement &&
    agreedTerms.contentLicensing &&
    agreedTerms.cancellationPolicy &&
     agreedTerms.affiliateCommission &&
    signatureRef.current &&
    !signatureRef.current.isEmpty();

  const handleScroll = (event: React.UIEvent<HTMLDivElement>) => {
    const target = event.currentTarget;
    const scrolledToBottom = 
      target.scrollTop + target.clientHeight >= target.scrollHeight - 20;
    
    if (scrolledToBottom && !hasScrolledToBottom) {
      setHasScrolledToBottom(true);
    }
  };

  const handleContinueToSign = () => {
    if (!hasScrolledToBottom) {
      toast({
        title: "Please Review Contract",
        description: "Scroll through the entire contract before continuing.",
        variant: "destructive",
      });
      return;
    }
    setCurrentView("sign");
  };

  const handleSubmit = () => {
    if (!signatureRef.current) return;

    if (signatureRef.current.isEmpty()) {
      toast({
        title: "Signature Required",
        description: "Please provide your signature before submitting.",
        variant: "destructive",
      });
      return;
    }

    const signatureData = signatureRef.current.getSignatureData();
    if (!signatureData) {
      toast({
        title: "Signature Error",
        description: "Failed to capture signature. Please try again.",
        variant: "destructive",
      });
      return;
    }

    if (!legalName.trim()) {
      toast({
        title: "Name Required",
        description: "Please enter your legal name.",
        variant: "destructive",
      });
      return;
    }

    onContractSigned({
      signatureData,
      legalName: legalName.trim(),
    });
  };

  const handleClose = () => {
    // Reset state when closing
    setCurrentView("review");
    setLegalName("");
    setHasScrolledToBottom(false);
    setAgreedTerms({
      readAgreement: false,
      contentLicensing: false,
      cancellationPolicy: false,
       affiliateCommission: false,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl h-[90vh] p-0 gap-0 flex flex-col overflow-hidden">
        <DialogHeader className="p-6 pb-4 border-b border-border flex-shrink-0">
          <div className="flex items-center gap-3">
            <FileText className="h-6 w-6 text-primary" />
            <div>
              <DialogTitle className="text-xl">Collaboration Agreement</DialogTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {currentView === "review"
                  ? "Please review the contract carefully before signing"
                  : "Complete your signature to finalize the agreement"}
              </p>
            </div>
          </div>
        </DialogHeader>

        <div className="flex flex-col flex-1 min-h-0 overflow-hidden">
          {/* Step 1: Contract Review */}
          {currentView === "review" && (
            <div className="flex flex-col flex-1 min-h-0 p-6 gap-4">
              <ScrollArea 
                className="flex-1 border border-border rounded-lg"
                onScrollCapture={handleScroll}
              >
                <div className="p-6">
                  <ContractContentPreview data={contractData} />
                </div>
              </ScrollArea>

              {!hasScrolledToBottom && (
                <div className="p-4 bg-muted rounded-lg flex-shrink-0">
                  <p className="text-sm text-muted-foreground">
                    📜 Please scroll to the bottom of the contract to continue
                  </p>
                </div>
              )}

              {hasScrolledToBottom && (
                <div className="p-4 bg-primary/10 rounded-lg border border-primary/20 flex-shrink-0">
                  <div className="flex items-center gap-2 text-primary mb-1">
                    <CheckCircle2 className="h-5 w-5" />
                    <p className="font-medium">Ready to Sign</p>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    You can now proceed to sign the agreement
                  </p>
                </div>
              )}

              <div className="flex gap-3 flex-shrink-0">
                <Button
                  variant="outline"
                  onClick={handleClose}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleContinueToSign}
                  disabled={!hasScrolledToBottom}
                  className="flex-1"
                >
                  I've Read It - Continue to Sign
                </Button>
              </div>
            </div>
          )}

          {/* Step 2: Signature Form */}
          {currentView === "sign" && (
            <ScrollArea className="flex-1">
              <div className="p-6 space-y-6">
                <Button
                  variant="ghost"
                  onClick={() => setCurrentView("review")}
                  className="gap-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to Review Contract
                </Button>

                <div className="p-4 bg-muted rounded-lg">
                  <h3 className="font-semibold mb-2">Agreement Summary</h3>
                  <p className="text-sm text-muted-foreground">
                  {(partyType === "host") && (
  <>You are signing as the <strong>Host</strong> for a collaboration with{" "}
  <strong>{contractData.influencerName}</strong> at <strong>{contractData.propertyTitle}</strong>.</>
)}
{(partyType === "brand") && (
  <>You are signing as the <strong>Brand</strong> for the campaign{" "}
  <strong>{contractData.propertyTitle}</strong> with creator <strong>{contractData.influencerName}</strong>.</>
)}
{(partyType === "influencer" || partyType === "creator") && (
  <>You are signing as the <strong>Creator</strong> for{" "}
  {contractData.collaborationType === "brand_campaign"
    ? <><strong>{contractData.propertyTitle}</strong> by <strong>{contractData.hostName}</strong>.</>
    : <>a collaboration at <strong>{contractData.propertyTitle}</strong> hosted by <strong>{contractData.hostName}</strong>.</>
  }</>
)}
                  </p>
                </div>

                <ContractSignatureSection
                  ref={signatureRef}
                  legalName={legalName}
                  onLegalNameChange={setLegalName}
                  agreedTerms={agreedTerms}
                  onAgreedTermsChange={setAgreedTerms}
                  partyType={partyType}
                   affiliateCommissionRate={contractData.affiliateCommissionRate}
                />

                <div className="flex gap-3 pt-4">
                  <Button
                    variant="outline"
                    onClick={handleClose}
                    disabled={isSubmitting}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSubmit}
                    disabled={!isFormValid || isSubmitting}
                    className="flex-1"
                  >
                    {isSubmitting ? "Processing..." : "Sign & Submit Agreement"}
                  </Button>
                </div>
              </div>
            </ScrollArea>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
