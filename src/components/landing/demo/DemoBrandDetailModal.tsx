import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { MapPin, Users, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export interface DemoBrand {
  campaignTitle: string;
  brandName: string;
  location: string;
  slots: string;
  tags: string[];
  compensationLabel: string;
  imageUrl?: string;
  logoUrl?: string;
  accent?: string;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  brand: DemoBrand;
  onApply: () => void;
}

export const DemoBrandDetailModal = ({ isOpen, onClose, brand, onApply }: Props) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-0">
        <div className={cn("relative h-56 bg-gradient-to-br overflow-hidden rounded-t-lg", brand.accent)}>
          {brand.imageUrl ? (
            <img
              src={brand.imageUrl}
              alt={brand.campaignTitle}
              className="absolute inset-0 w-full h-full object-cover"
            />
          ) : brand.logoUrl ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <img src={brand.logoUrl} alt={brand.brandName} className="max-h-24 max-w-[60%] object-contain" />
            </div>
          ) : null}
        </div>
        <div className="p-6 space-y-5">
          <DialogHeader>
            <DialogTitle className="text-2xl font-serif text-left">{brand.campaignTitle}</DialogTitle>
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground pt-1">
              <MapPin className="w-4 h-4" />
              <span>
                {brand.brandName}
                {brand.location ? ` · ${brand.location}` : ""}
              </span>
            </div>
          </DialogHeader>

          <div className="flex items-center gap-1.5 text-sm text-brand-green font-medium">
            <Users className="w-4 h-4" />
            {brand.slots}
          </div>

          <div>
            <p className="text-sm font-semibold mb-2">What this campaign includes</p>
            <ul className="text-sm text-muted-foreground space-y-1.5">
              <li>• Compensation: {brand.compensationLabel}</li>
              <li>• Brief and deliverables shared after acceptance</li>
              <li>• Direct line with the brand throughout the campaign</li>
            </ul>
          </div>

          <div className="flex flex-wrap gap-1.5">
            <span className="px-2.5 py-1 rounded-full bg-brand-green/10 text-xs text-brand-green font-medium">
              {brand.compensationLabel}
            </span>
            {brand.tags.map((t) => (
              <span key={t} className="px-2.5 py-1 rounded-full bg-muted text-xs text-muted-foreground">
                {t}
              </span>
            ))}
          </div>

          <div className="flex gap-3 pt-2 border-t">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Close
            </Button>
            <Button onClick={onApply} className="flex-1 bg-brand-green hover:bg-brand-green/90 text-white">
              <Sparkles className="w-4 h-4 mr-1" />
              Apply to campaign
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
