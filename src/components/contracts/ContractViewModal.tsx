import { format } from "date-fns";
import { FileText, CheckCircle2, Clock } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { ContractContentPreview } from "./ContractContentPreview";

interface SignatureData {
  signed_at?: string;
  legal_name?: string;
  signature_image?: string;
}

interface ContractViewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contractData: {
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
  };
  status: string;
  hostSignature?: SignatureData | null;
  influencerSignature?: SignatureData | null;
  hostLegalName?: string | null;
  influencerLegalName?: string | null;
  hostSignedAt?: string | null;
  influencerSignedAt?: string | null;
  partyType?: "host" | "brand";
}

export const ContractViewModal = ({
  open,
  onOpenChange,
  contractData,
  status,
  hostSignature,
  influencerSignature,
  hostLegalName,
  influencerLegalName,
  hostSignedAt,
  influencerSignedAt,
  partyType = "host",
}: ContractViewModalProps) => {
  const formatDateTime = (dateStr?: string | null) => {
    if (!dateStr) return null;
    return format(new Date(dateStr), "MMMM d, yyyy 'at' h:mm a");
  };

  const getStatusBadge = () => {
    switch (status) {
      case "active":
        return <Badge className="bg-primary/20 text-primary">Active</Badge>;
      case "completed":
        return <Badge className="bg-secondary text-secondary-foreground">Completed</Badge>;
      case "pending_influencer":
        return <Badge className="bg-accent text-accent-foreground">Awaiting Creator</Badge>;
      case "pending_host":
        return <Badge className="bg-accent text-accent-foreground">Awaiting Host</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[90vh] p-0 gap-0 flex flex-col overflow-hidden">
        <DialogHeader className="p-6 pb-4 border-b border-border flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FileText className="h-6 w-6 text-primary" />
              <div>
                <DialogTitle className="text-xl">Collaboration Agreement</DialogTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  Contract for {contractData.propertyTitle}
                </p>
              </div>
            </div>
            {getStatusBadge()}
          </div>
        </DialogHeader>

        <ScrollArea className="flex-1">
          <div className="p-6 space-y-6">
            {/* Contract Content */}
            <div className="border border-border rounded-lg p-6">
              <ContractContentPreview data={contractData} />
            </div>

            {/* Signatures Section */}
            <div className="border-t border-border pt-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-primary" />
                Signatures
              </h3>

              <div className="grid md:grid-cols-2 gap-4">
                {/* Host Signature */}
                <div className="p-4 bg-muted/50 rounded-lg">
                  <p className="font-semibold mb-2">{partyType === "brand" ? "Brand" : "Host"}</p>
                  {hostSignature?.signature_image || hostSignedAt ? (
                    <div className="space-y-2">
                      {hostSignature?.signature_image && (
                        <div className="bg-background p-2 rounded border border-border">
                          <img
                            src={hostSignature.signature_image}
                            alt="Host signature"
                            className="max-h-16 object-contain"
                          />
                        </div>
                      )}
                      <p className="text-sm text-foreground">
                        {hostLegalName || hostSignature?.legal_name}
                      </p>
                      {(hostSignedAt || hostSignature?.signed_at) && (
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatDateTime(hostSignedAt || hostSignature?.signed_at)}
                        </p>
                      )}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground italic">
                      Not yet signed
                    </p>
                  )}
                </div>

                {/* Influencer Signature */}
                <div className="p-4 bg-muted/50 rounded-lg">
                  <p className="font-semibold mb-2">Creator</p>
                  {influencerSignature?.signature_image || influencerSignedAt ? (
                    <div className="space-y-2">
                      {influencerSignature?.signature_image && (
                        <div className="bg-background p-2 rounded border border-border">
                          <img
                            src={influencerSignature.signature_image}
                            alt="Creator signature"
                            className="max-h-16 object-contain"
                          />
                        </div>
                      )}
                      <p className="text-sm text-foreground">
                        {influencerLegalName || influencerSignature?.legal_name}
                      </p>
                      {(influencerSignedAt || influencerSignature?.signed_at) && (
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatDateTime(influencerSignedAt || influencerSignature?.signed_at)}
                        </p>
                      )}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground italic">
                      Not yet signed
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Agreement ID */}
            <div className="text-center text-xs text-muted-foreground pt-4 border-t border-border">
              <p>Agreement ID: {contractData.agreementId}</p>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
