import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Building2, Search, ArrowRightLeft, Loader2, AlertTriangle, Check } from "lucide-react";

interface Brand {
  id: string;
  brand_name: string;
  contact_email?: string | null;
  logo_url?: string | null;
}

interface Campaign {
  id: string;
  campaign_title: string;
  brand_name: string;
  brand_id?: string | null;
}

interface TransferCampaignModalProps {
  campaign: Campaign | null;
  isOpen: boolean;
  onClose: () => void;
  onTransferComplete: () => void;
}

const TransferCampaignModal = ({
  campaign,
  isOpen,
  onClose,
  onTransferComplete,
}: TransferCampaignModalProps) => {
  const { toast } = useToast();

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Brand[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [selectedBrand, setSelectedBrand] = useState<Brand | null>(null);
  const [reason, setReason] = useState("");
  const [isTransferring, setIsTransferring] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);

  // Reset state when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setSearchQuery("");
      setSelectedBrand(null);
      setReason("");
      setShowConfirmation(false);
      setSearchResults([]);
    }
  }, [isOpen]);

  // Debounced brand search
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (searchQuery.length < 2) {
        setSearchResults([]);
        return;
      }
      setSearchLoading(true);
      try {
        const { data, error } = await supabase
          .from("brands")
          .select("id, brand_name,  logo_url")
          .or(
            `brand_name.ilike.%${searchQuery}%,contact_email.ilike.%${searchQuery}%`
          )
          .limit(10);

        if (error) throw error;
        setSearchResults(data ?? []);
      } catch (err) {
        console.error("Brand search error:", err);
        setSearchResults([]);
      } finally {
        setSearchLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSelectBrand = (brand: Brand) => {
    if (brand.id === campaign?.brand_id) {
      toast({
        title: "Invalid selection",
        description: "This campaign already belongs to that brand.",
        variant: "destructive",
      });
      return;
    }
    setSelectedBrand(brand);
    setSearchQuery("");
    setSearchResults([]);
  };

  const handleTransfer = async () => {
    if (!campaign || !selectedBrand) return;
    setIsTransferring(true);

    try {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) throw new Error("Not authenticated");

      // Call your Supabase edge function (mirror of transfer-property-ownership)
      const response = await supabase.functions.invoke("transfer-campaign-ownership", {
        body: {
          action: "transfer",
          campaignId: campaign.id,
          newBrandId: selectedBrand.id,
          reason: reason || undefined,
        },
      });

      if (response.error) throw new Error(response.error.message || "Transfer failed");
      const result = response.data;
      if (!result?.success) throw new Error(result?.error || "Transfer failed");

      toast({
        title: "Transfer successful",
        description: `"${campaign.campaign_title}" has been transferred to ${selectedBrand.brand_name}.`,
      });

      onTransferComplete();
     
      onClose();
    } catch (error: any) {
      console.error("Transfer error:", error);
      toast({
        title: "Transfer failed",
        description: error.message || "An error occurred during the transfer.",
        variant: "destructive",
      });
    } finally {
      setIsTransferring(false);
      setShowConfirmation(false);
    }
  };

  if (!campaign) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ArrowRightLeft className="h-5 w-5" />
            Transfer Campaign Ownership
          </DialogTitle>
          <DialogDescription>
            Reassign this campaign to a different brand on the platform.
          </DialogDescription>
        </DialogHeader>

        {showConfirmation ? (
          <div className="space-y-4">
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>Confirm Transfer</strong>
                <p className="mt-2">
                  You are about to transfer{" "}
                  <strong>"{campaign.campaign_title}"</strong> from{" "}
                  <strong>{campaign.brand_name}</strong> to{" "}
                  <strong>{selectedBrand!.brand_name}</strong>.
                </p>
                <p className="mt-2 text-sm">
                  This action will be logged and cannot be easily undone.
                </p>
              </AlertDescription>
            </Alert>

            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                variant="outline"
                onClick={() => setShowConfirmation(false)}
                disabled={isTransferring}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleTransfer}
                disabled={isTransferring}
              >
                {isTransferring ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Transferring...
                  </>
                ) : (
                  <>
                    <Check className="mr-2 h-4 w-4" />
                    Confirm Transfer
                  </>
                )}
              </Button>
            </DialogFooter>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Campaign info */}
            <div className="rounded-lg border bg-muted/50 p-4">
              <h4 className="font-medium">{campaign.campaign_title}</h4>
              <div className="mt-1 flex items-center text-sm text-muted-foreground">
                <Building2 className="mr-1 h-3 w-3" />
                Currently owned by: <span className="ml-1 font-medium">{campaign.brand_name}</span>
              </div>
            </div>

            {/* Brand search / selected brand */}
            <div>
              <Label htmlFor="brand-search">Transfer To</Label>
              {selectedBrand ? (
                <div className="mt-1 flex items-center justify-between rounded-lg border bg-primary/5 p-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                      <Building2 className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{selectedBrand.brand_name}</p>
                      {selectedBrand.contact_email && (
                        <p className="text-xs text-muted-foreground">{selectedBrand.contact_email}</p>
                      )}
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => setSelectedBrand(null)}>
                    Change
                  </Button>
                </div>
              ) : (
                <div className="mt-1 space-y-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="brand-search"
                      placeholder="Search by brand name or email..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9"
                    />
                    {searchLoading && (
                      <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" />
                    )}
                  </div>

                  {searchResults.length > 0 && (
                    <ScrollArea className="h-[200px] rounded-md border">
                      <div className="p-2">
                        {searchResults.map((brand) => (
                          <button
                            key={brand.id}
                            className="flex w-full items-center gap-3 rounded-md p-2 text-left hover:bg-muted disabled:opacity-50"
                            onClick={() => handleSelectBrand(brand)}
                            disabled={brand.id === campaign.brand_id}
                          >
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                              <Building2 className="h-4 w-4 text-muted-foreground" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="truncate font-medium">
                                {brand.brand_name}
                                {brand.id === campaign.brand_id && (
                                  <Badge variant="secondary" className="ml-2">
                                    Current
                                  </Badge>
                                )}
                              </p>
                              {brand.contact_email && (
                                <p className="truncate text-sm text-muted-foreground">
                                  {brand.contact_email}
                                </p>
                              )}
                            </div>
                          </button>
                        ))}
                      </div>
                    </ScrollArea>
                  )}

                  {searchQuery.length >= 2 && !searchLoading && searchResults.length === 0 && (
                    <p className="text-center text-sm text-muted-foreground py-4">
                      No brands found matching "{searchQuery}"
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Optional reason */}
            <div>
              <Label htmlFor="reason">Reason (Optional)</Label>
              <Textarea
                id="reason"
                placeholder="Enter the reason for this transfer..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="mt-1"
                rows={2}
              />
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button onClick={() => setShowConfirmation(true)} disabled={!selectedBrand}>
                <ArrowRightLeft className="mr-2 h-4 w-4" />
                Transfer Ownership
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default TransferCampaignModal;