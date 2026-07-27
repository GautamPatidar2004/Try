import { useState } from "react";
import { Copy, Share2, MapPin, Calendar, ToggleLeft, ToggleRight, QrCode } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BrandCard } from "@/components/ui/brand-card";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { QRCodeSVG } from "qrcode.react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CreatorAffiliateCode } from "@/hooks/useCreatorAffiliateCodes";

interface AffiliateCodeCardProps {
  code: CreatorAffiliateCode;
  onToggleStatus: (codeId: string, isActive: boolean) => void;
  isTogglingStatus: boolean;
}

const AffiliateCodeCard = ({ code, onToggleStatus, isTogglingStatus }: AffiliateCodeCardProps) => {
  const { toast } = useToast();
  const [showQR, setShowQR] = useState(false);

  const isExpired = code.valid_until && new Date(code.valid_until) < new Date();
  const isAtLimit = code.usage_limit !== null && code.current_uses >= code.usage_limit;

  const getStatusBadge = () => {
    if (isExpired) return <Badge variant="destructive">Expired</Badge>;
    if (isAtLimit) return <Badge variant="secondary">Limit Reached</Badge>;
    if (!code.is_active) return <Badge variant="secondary">Inactive</Badge>;
    return <Badge className="bg-primary/10 text-primary border-primary/20">Active</Badge>;
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code.code);
      toast({
        title: "Copied!",
        description: "Affiliate code copied to clipboard",
      });
    } catch {
      toast({
        title: "Failed to copy",
        description: "Please copy the code manually",
        variant: "destructive",
      });
    }
  };

  const handleShare = async () => {
    const shareText = `Use my code "${code.code}" for a special discount!`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: "My Affiliate Code",
          text: shareText,
        });
      } catch (err) {
        // User cancelled or share failed, fallback to copy
        handleCopy();
      }
    } else {
      handleCopy();
    }
  };

  const commissionDisplay = code.commission_type === "percentage"
    ? `${(code.commission_rate * 100).toFixed(0)}% commission`
    : `$${(code.flat_fee_amount / 100).toFixed(2)} per use`;

  return (
    <>
      <BrandCard variant="glow" className="space-y-4">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-xl font-mono font-bold tracking-wider">{code.code}</h3>
              {getStatusBadge()}
            </div>
            {code.property && (
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <MapPin className="h-3 w-3" />
                <span>{code.property.title}</span>
                {code.property.location && <span>• {code.property.location}</span>}
              </div>
            )}
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={handleCopy}
              className="h-9 w-9"
              aria-label="Copy code"
            >
              <Copy className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={handleShare}
              className="h-9 w-9"
              aria-label="Share code"
            >
              <Share2 className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setShowQR(true)}
              className="h-9 w-9"
              aria-label="Show QR code"
            >
              <QrCode className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">Commission</p>
            <p className="font-medium">{commissionDisplay}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Uses</p>
            <p className="font-medium">
              {code.current_uses}
              {code.usage_limit !== null && ` / ${code.usage_limit}`}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-border">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Calendar className="h-3 w-3" />
            <span>
              Valid from {format(new Date(code.valid_from), "MMM d, yyyy")}
              {code.valid_until && ` to ${format(new Date(code.valid_until), "MMM d, yyyy")}`}
            </span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onToggleStatus(code.id, !code.is_active)}
            disabled={isTogglingStatus || isExpired || isAtLimit}
            className="gap-2"
          >
            {code.is_active ? (
              <>
                <ToggleRight className="h-4 w-4 text-primary" />
                <span>Active</span>
              </>
            ) : (
              <>
                <ToggleLeft className="h-4 w-4" />
                <span>Inactive</span>
              </>
            )}
          </Button>
        </div>
      </BrandCard>

      {/* QR Code Dialog */}
      <Dialog open={showQR} onOpenChange={setShowQR}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>QR Code for {code.code}</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center gap-4 py-4">
            <div className="p-4 bg-card rounded-lg">
              <QRCodeSVG value={code.code} size={200} />
            </div>
            <p className="text-sm text-muted-foreground text-center">
              Share this QR code with your followers
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AffiliateCodeCard;
