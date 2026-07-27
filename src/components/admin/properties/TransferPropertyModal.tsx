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
import { useHostSearch, HostSearchResult } from "@/hooks/useHostSearch";
import { MapPin, User, Building2, Search, ArrowRightLeft, Loader2, AlertTriangle, Check } from "lucide-react";

interface Property {
  id: string;
  title: string;
  location: string;
  host_id: string;
  hosts: {
    id?: string;
    business_name?: string | null;
    profiles: {
      first_name: string | null;
      last_name: string | null;
      email?: string | null;
    } | null;
  } | null;
}

interface TransferPropertyModalProps {
  property: Property | null;
  isOpen: boolean;
  onClose: () => void;
  onTransferComplete: () => void;
}

const TransferPropertyModal = ({
  property,
  isOpen,
  onClose,
  onTransferComplete,
}: TransferPropertyModalProps) => {
  const { toast } = useToast();
  const { searchHosts, clearResults, results, loading: searchLoading } = useHostSearch();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedHost, setSelectedHost] = useState<HostSearchResult | null>(null);
  const [reason, setReason] = useState("");
  const [isTransferring, setIsTransferring] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);

  // Reset state when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setSearchQuery("");
      setSelectedHost(null);
      setReason("");
      setShowConfirmation(false);
      clearResults();
    }
  }, [isOpen, clearResults]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery.length >= 2) {
        searchHosts(searchQuery);
      } else {
        clearResults();
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, searchHosts, clearResults]);

  const getCurrentHostName = () => {
    if (!property?.hosts?.profiles) return "Unknown";
    const { first_name, last_name } = property.hosts.profiles;
    const fullName = `${first_name || ""} ${last_name || ""}`.trim();
    return fullName || "Unknown";
  };

  const getHostDisplayName = (host: HostSearchResult) => {
    const fullName = `${host.first_name || ""} ${host.last_name || ""}`.trim();
    return fullName || "Unknown";
  };

  const handleSelectHost = (host: HostSearchResult) => {
    // Don't allow selecting current host
    if (host.id === property?.host_id) {
      toast({
        title: "Invalid selection",
        description: "This is already the current owner of the property.",
        variant: "destructive",
      });
      return;
    }
    setSelectedHost(host);
    setSearchQuery("");
    clearResults();
  };

  const handleTransfer = async () => {
    if (!property || !selectedHost) return;

    setIsTransferring(true);

    try {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        throw new Error("Not authenticated");
      }

      const response = await supabase.functions.invoke("transfer-property-ownership", {
        body: {
          action: "transfer",
          propertyId: property.id,
          newHostId: selectedHost.id,
          reason: reason || undefined,
        },
      });

      if (response.error) {
        throw new Error(response.error.message || "Transfer failed");
      }

      const result = response.data;

      if (!result.success) {
        throw new Error(result.error || "Transfer failed");
      }

      toast({
        title: "Transfer successful",
        description: `"${property.title}" has been transferred to ${result.newHost.name}.`,
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

  if (!property) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ArrowRightLeft className="h-5 w-5" />
            Transfer Property Ownership
          </DialogTitle>
          <DialogDescription>
            Transfer this property to a different host account.
          </DialogDescription>
        </DialogHeader>

        {showConfirmation ? (
          <div className="space-y-4">
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>Confirm Transfer</strong>
                <p className="mt-2">
                  You are about to transfer <strong>"{property.title}"</strong> from{" "}
                  <strong>{getCurrentHostName()}</strong> to{" "}
                  <strong>{getHostDisplayName(selectedHost!)}</strong>.
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
            {/* Property Info */}
            <div className="rounded-lg border bg-muted/50 p-4">
              <h4 className="font-medium">{property.title}</h4>
              <div className="mt-1 flex items-center text-sm text-muted-foreground">
                <MapPin className="mr-1 h-3 w-3" />
                {property.location}
              </div>
            </div>

            {/* Current Host */}
            <div>
              <Label className="text-sm text-muted-foreground">Current Owner</Label>
              <div className="mt-1 flex items-center gap-3 rounded-lg border bg-background p-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                  <User className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="font-medium">{getCurrentHostName()}</p>
                  {property.hosts?.business_name && (
                    <p className="flex items-center text-sm text-muted-foreground">
                      <Building2 className="mr-1 h-3 w-3" />
                      {property.hosts.business_name}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Host Search */}
            <div>
              <Label htmlFor="host-search">Transfer To</Label>
              {selectedHost ? (
                <div className="mt-1 flex items-center justify-between rounded-lg border bg-primary/5 p-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                      <User className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{getHostDisplayName(selectedHost)}</p>
                      {selectedHost.business_name && (
                        <p className="flex items-center text-sm text-muted-foreground">
                          <Building2 className="mr-1 h-3 w-3" />
                          {selectedHost.business_name}
                        </p>
                      )}
                      {selectedHost.email && (
                        <p className="text-xs text-muted-foreground">{selectedHost.email}</p>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedHost(null)}
                  >
                    Change
                  </Button>
                </div>
              ) : (
                <div className="mt-1 space-y-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="host-search"
                      placeholder="Search by name, email, or business..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9"
                    />
                    {searchLoading && (
                      <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" />
                    )}
                  </div>

                  {results.length > 0 && (
                    <ScrollArea className="h-[200px] rounded-md border">
                      <div className="p-2">
                        {results.map((host) => (
                          <button
                            key={host.id}
                            className="flex w-full items-center gap-3 rounded-md p-2 text-left hover:bg-muted"
                            onClick={() => handleSelectHost(host)}
                            disabled={host.id === property.host_id}
                          >
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                              <User className="h-4 w-4 text-muted-foreground" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="truncate font-medium">
                                {getHostDisplayName(host)}
                                {host.id === property.host_id && (
                                  <Badge variant="secondary" className="ml-2">
                                    Current
                                  </Badge>
                                )}
                              </p>
                              <p className="truncate text-sm text-muted-foreground">
                                {host.email}
                                {host.business_name && ` • ${host.business_name}`}
                              </p>
                            </div>
                          </button>
                        ))}
                      </div>
                    </ScrollArea>
                  )}

                  {searchQuery.length >= 2 && !searchLoading && results.length === 0 && (
                    <p className="text-center text-sm text-muted-foreground py-4">
                      No hosts found matching "{searchQuery}"
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Reason */}
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
              <Button
                onClick={() => setShowConfirmation(true)}
                disabled={!selectedHost}
              >
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

export default TransferPropertyModal;
