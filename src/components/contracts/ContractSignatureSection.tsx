import { useRef, forwardRef, useImperativeHandle } from "react";
import SignatureCanvas from "react-signature-canvas";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

interface AgreementTerms {
  readAgreement: boolean;
  contentLicensing: boolean;
  cancellationPolicy: boolean;
   affiliateCommission: boolean;
}

interface ContractSignatureSectionProps {
  legalName: string;
  onLegalNameChange: (name: string) => void;
  agreedTerms: AgreementTerms;
  onAgreedTermsChange: (terms: AgreementTerms) => void;
  partyType: "host" | "influencer"| "brand" | "creator";
   affiliateCommissionRate?: number;
}

export interface ContractSignatureSectionRef {
  getSignatureData: () => string | undefined;
  isEmpty: () => boolean;
  clear: () => void;
}

export const ContractSignatureSection = forwardRef<
  ContractSignatureSectionRef,
  ContractSignatureSectionProps
 >(({ legalName, onLegalNameChange, agreedTerms, onAgreedTermsChange, partyType, affiliateCommissionRate = 0.10 }, ref) => {
  const signatureRef = useRef<SignatureCanvas>(null);

  useImperativeHandle(ref, () => ({
    getSignatureData: () => signatureRef.current?.toDataURL(),
    isEmpty: () => signatureRef.current?.isEmpty() ?? true,
    clear: () => signatureRef.current?.clear(),
  }));

  const handleClearSignature = () => {
    signatureRef.current?.clear();
  };

  return (
    <div className="space-y-6">
      {/* Agreement Checkboxes */}
      <div className="space-y-4">
        <h3 className="font-semibold text-foreground">
          Please confirm the following:
        </h3>

        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <Checkbox
              id="read-agreement"
              checked={agreedTerms.readAgreement}
              onCheckedChange={(checked) =>
                onAgreedTermsChange({ ...agreedTerms, readAgreement: checked as boolean })
              }
            />
            <label
              htmlFor="read-agreement"
              className="text-sm leading-tight cursor-pointer"
            >
              I have read and understood the entire Collaboration Agreement
            </label>
          </div>

          <div className="flex items-start gap-3">
            <Checkbox
              id="content-licensing"
              checked={agreedTerms.contentLicensing}
              onCheckedChange={(checked) =>
                onAgreedTermsChange({ ...agreedTerms, contentLicensing: checked as boolean })
              }
            />
            <label
              htmlFor="content-licensing"
              className="text-sm leading-tight cursor-pointer"
            >
              {(partyType === "host" || partyType === "brand")
                ? "I understand I will receive full content licensing rights as outlined in Section 4"
                : "I acknowledge the content licensing terms in Section 4 and grant the Host the specified rights"}
            </label>
          </div>

          <div className="flex items-start gap-3">
            <Checkbox
              id="cancellation-policy"
              checked={agreedTerms.cancellationPolicy}
              onCheckedChange={(checked) =>
                onAgreedTermsChange({ ...agreedTerms, cancellationPolicy: checked as boolean })
              }
            />
            <label
              htmlFor="cancellation-policy"
              className="text-sm leading-tight cursor-pointer"
            >
              I understand and accept the cancellation policy and general terms
            </label>
          </div>

           <div className="flex items-start gap-3">
             <Checkbox
               id="affiliate-commission"
               checked={agreedTerms.affiliateCommission}
               onCheckedChange={(checked) =>
                 onAgreedTermsChange({ ...agreedTerms, affiliateCommission: checked as boolean })
               }
             />
             <label
               htmlFor="affiliate-commission"
               className="text-sm leading-tight cursor-pointer"
             >
        
{(partyType === "host")
  ? `I agree to pay ${(affiliateCommissionRate * 100).toFixed(0)}% commission on bookings made using the Creator's affiliate code`
  : partyType === "brand"
  ? "I agree to the compensation terms and content usage rights outlined in this agreement"
  : partyType === "creator"
  ? "I understand the compensation terms and content usage rights outlined in this agreement"
  : `I understand I will earn ${(affiliateCommissionRate * 100).toFixed(0)}% commission on bookings made using my affiliate code`}  </label>
           </div>
        </div>
      </div>

      {/* Legal Name Input */}
      <div className="space-y-2">
        <Label htmlFor="legal-name">Legal Full Name *</Label>
        <Input
          id="legal-name"
          placeholder="Enter your full legal name as it appears on official documents"
          value={legalName}
          onChange={(e) => onLegalNameChange(e.target.value)}
        />
        <p className="text-xs text-muted-foreground">
          This name will be used for the legally binding signature
        </p>
      </div>

      {/* Signature Pad */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label>Signature *</Label>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleClearSignature}
          >
            Clear Signature
          </Button>
        </div>
        <div className="border-2 border-input rounded-lg bg-card shadow-sm">
          <SignatureCanvas
            ref={signatureRef}
            canvasProps={{
              className: "w-full h-40 cursor-crosshair rounded-lg",
            }}
            backgroundColor="white"
            penColor="#000000"
          />
        </div>
        <p className="text-xs text-muted-foreground">
          Sign above using your mouse or touchscreen
        </p>
      </div>

      {/* Signing Date */}
      <div className="p-3 bg-muted/30 rounded-lg">
        <p className="text-sm text-muted-foreground">
          <span className="font-medium">Date of Signature:</span>{" "}
          {new Date().toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>
      </div>
    </div>
  );
});

ContractSignatureSection.displayName = "ContractSignatureSection";
