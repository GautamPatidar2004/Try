import { useState, useRef } from "react";
import SignatureCanvas from "react-signature-canvas";
import { Document, Page, pdfjs } from 'react-pdf';
import { FileText, CheckCircle2, Download, ExternalLink, ArrowLeft } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';

// Configure PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface AmbassadorContractModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onContractSigned: (data: {
    signatureData: string;
    legalName: string;
  }) => void;
  isSubmitting?: boolean;
}

export const AmbassadorContractModal = ({
  open,
  onOpenChange,
  onContractSigned,
  isSubmitting = false,
}: AmbassadorContractModalProps) => {
  const { toast } = useToast();
  const signatureRef = useRef<SignatureCanvas>(null);
  const pdfContainerRef = useRef<HTMLDivElement>(null);
  const [currentView, setCurrentView] = useState<'review' | 'sign'>('review');
  const [legalName, setLegalName] = useState("");
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);
  const [numPages, setNumPages] = useState<number>(0);
  const [agreedTerms, setAgreedTerms] = useState({
    readAgreement: false,
    monthlyRequirements: false,
    commissionStructure: false,
  });

  const contractUrl = "/contracts/HOSTFLUENCER_AMBASSADOR_AGREEMENT_v1.0.pdf";

  const isFormValid =
    legalName.trim().length > 0 &&
    hasScrolledToBottom &&
    agreedTerms.readAgreement &&
    agreedTerms.monthlyRequirements &&
    agreedTerms.commissionStructure &&
    signatureRef.current &&
    !signatureRef.current.isEmpty();

  const handleOpenInNewTab = () => {
    window.open(contractUrl, '_blank');
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = contractUrl;
    link.download = 'HOSTFLUENCER_AMBASSADOR_AGREEMENT_v1.0.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleScroll = () => {
    if (!pdfContainerRef.current) return;
    
    const { scrollTop, scrollHeight, clientHeight } = pdfContainerRef.current;
    const scrolledToBottom = scrollTop + clientHeight >= scrollHeight - 20;
    
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
    setCurrentView('sign');
  };

  const handleClearSignature = () => {
    signatureRef.current?.clear();
  };

  const handleSubmit = () => {
    if (!isFormValid) {
      toast({
        title: "Incomplete Form",
        description: "Please complete all required fields and sign the agreement.",
        variant: "destructive",
      });
      return;
    }

    const signatureData = signatureRef.current?.toDataURL();
    if (!signatureData) {
      toast({
        title: "Signature Required",
        description: "Please provide your signature before submitting.",
        variant: "destructive",
      });
      return;
    }

    onContractSigned({
      signatureData,
      legalName: legalName.trim(),
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[90vh] p-0 gap-0 flex flex-col overflow-hidden">
        <DialogHeader className="p-6 pb-4 border-b border-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FileText className="h-6 w-6 text-primary" />
              <div>
                <DialogTitle className="text-xl">Ambassador Agreement</DialogTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  {currentView === 'review' 
                    ? 'Version 1.0 - Please review carefully before signing'
                    : 'Version 1.0 - Complete your signature'}
                </p>
              </div>
            </div>
          </div>
        </DialogHeader>

        <div className="flex flex-col flex-1 min-h-0">
          {/* Step 1: Contract Review */}
          {currentView === 'review' && (
            <div className="flex flex-col flex-1 min-h-0 p-6 gap-4">
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleOpenInNewTab}
                  className="gap-2"
                >
                  <ExternalLink className="h-4 w-4" />
                  Open in New Tab
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDownload}
                  className="gap-2"
                >
                  <Download className="h-4 w-4" />
                  Download PDF
                </Button>
              </div>

              <div 
                ref={pdfContainerRef}
                onScroll={handleScroll}
                className="flex-1 min-h-0 border border-border rounded-lg overflow-y-auto bg-muted/20"
              >
                <Document
                  file={contractUrl}
                  onLoadSuccess={({ numPages }) => setNumPages(numPages)}
                  loading={
                    <div className="h-full flex items-center justify-center p-8">
                      <div className="text-center space-y-2">
                        <FileText className="w-12 h-12 mx-auto text-muted-foreground animate-pulse" />
                        <p className="text-sm text-muted-foreground">Loading contract...</p>
                      </div>
                    </div>
                  }
                  error={
                    <div className="h-full flex items-center justify-center p-8">
                      <div className="text-center space-y-4">
                        <FileText className="w-12 h-12 mx-auto text-destructive" />
                        <div className="space-y-2">
                          <p className="text-sm font-medium text-destructive">Failed to load PDF</p>
                          <p className="text-xs text-muted-foreground">Please use the "Open in New Tab" or "Download PDF" button above</p>
                        </div>
                      </div>
                    </div>
                  }
                  className="flex flex-col items-center gap-4 p-4"
                >
                  {Array.from(new Array(numPages), (el, index) => (
                    <Page
                      key={`page_${index + 1}`}
                      pageNumber={index + 1}
                      width={Math.min(window.innerWidth * 0.65, 750)}
                      renderTextLayer={true}
                      renderAnnotationLayer={true}
                      className="shadow-lg"
                    />
                  ))}
                </Document>
              </div>

              {!hasScrolledToBottom && numPages > 0 && (
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    📜 Please scroll to the bottom of the contract to continue
                  </p>
                </div>
              )}

              {hasScrolledToBottom && (
                <div className="p-4 bg-primary/10 rounded-lg border border-primary/20">
                  <div className="flex items-center gap-2 text-primary mb-2">
                    <CheckCircle2 className="h-5 w-5" />
                    <p className="font-medium">Ready to Sign</p>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    You can now proceed to sign the agreement
                  </p>
                </div>
              )}

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => onOpenChange(false)}
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
          {currentView === 'sign' && (
            <div className="flex flex-col flex-1 min-h-0 overflow-y-auto p-6 space-y-6">
              <Button
                variant="ghost"
                onClick={() => setCurrentView('review')}
                className="self-start gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Review Contract
              </Button>

              <div className="p-4 bg-muted rounded-lg">
                <h3 className="font-semibold mb-2">Agreement Summary</h3>
                <p className="text-sm text-muted-foreground">
                  HOSTFLUENCER Ambassador Agreement v1.0 - By signing, you agree to the monthly content requirements, commission structure, and all terms outlined in the agreement.
                </p>
              </div>

              {/* Agreement Checkboxes */}
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <Checkbox
                    id="read-agreement"
                    checked={agreedTerms.readAgreement}
                    onCheckedChange={(checked) =>
                      setAgreedTerms((prev) => ({ ...prev, readAgreement: checked as boolean }))
                    }
                  />
                  <label
                    htmlFor="read-agreement"
                    className="text-sm leading-tight cursor-pointer"
                  >
                    I have read and understood the entire Ambassador Agreement
                  </label>
                </div>

                <div className="flex items-start gap-3">
                  <Checkbox
                    id="monthly-requirements"
                    checked={agreedTerms.monthlyRequirements}
                    onCheckedChange={(checked) =>
                      setAgreedTerms((prev) => ({
                        ...prev,
                        monthlyRequirements: checked as boolean,
                      }))
                    }
                  />
                  <label
                    htmlFor="monthly-requirements"
                    className="text-sm leading-tight cursor-pointer"
                  >
                    I acknowledge the monthly content requirements (4 Instagram stories + 1 feed post)
                  </label>
                </div>

                <div className="flex items-start gap-3">
                  <Checkbox
                    id="commission-structure"
                    checked={agreedTerms.commissionStructure}
                    onCheckedChange={(checked) =>
                      setAgreedTerms((prev) => ({
                        ...prev,
                        commissionStructure: checked as boolean,
                      }))
                    }
                  />
                  <label
                    htmlFor="commission-structure"
                    className="text-sm leading-tight cursor-pointer"
                  >
                    I understand the commission structure and payment terms via Stripe
                  </label>
                </div>
              </div>

              {/* Legal Name */}
              <div className="space-y-2">
                <Label htmlFor="legal-name">Legal Name *</Label>
                <Input
                  id="legal-name"
                  placeholder="Enter your full legal name"
                  value={legalName}
                  onChange={(e) => setLegalName(e.target.value)}
                />
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
                    Clear
                  </Button>
                </div>
                <div className="border-2 border-input rounded-lg bg-card shadow-sm">
                  <SignatureCanvas
                    ref={signatureRef}
                    canvasProps={{
                      className: "w-full h-48 cursor-crosshair rounded-lg",
                    }}
                    backgroundColor="white"
                    penColor="#000000"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Sign above using your mouse or touchscreen
                </p>
              </div>

              {/* Date Display */}
              <div className="text-sm text-muted-foreground">
                Date: {new Date().toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-2">
                <Button
                  variant="outline"
                  onClick={() => onOpenChange(false)}
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
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
