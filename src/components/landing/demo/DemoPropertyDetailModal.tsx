import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { MapPin, Users, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export interface DemoProperty {
  title: string;
  location: string;
  slots: string;
  tags: string[];
  imageUrl?: string;
  accent?: string;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  property: DemoProperty;
  onApply: () => void;
}

export const DemoPropertyDetailModal = ({ isOpen, onClose, property, onApply }: Props) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-0">
        <div className={cn("relative h-56 bg-gradient-to-br overflow-hidden rounded-t-lg", property.accent)}>
          {property.imageUrl && (
            <img
              src={property.imageUrl}
              alt={property.title}
              className="absolute inset-0 w-full h-full object-cover"
            />
          )}
        </div>
        <div className="p-6 space-y-5">
          <DialogHeader>
            <DialogTitle className="text-2xl font-serif text-left">{property.title}</DialogTitle>
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground pt-1">
              <MapPin className="w-4 h-4" />
              <span>{property.location}</span>
            </div>
          </DialogHeader>

          <div className="flex items-center gap-1.5 text-sm text-brand-green font-medium">
            <Users className="w-4 h-4" />
            {property.slots}
          </div>

          <div>
            <p className="text-sm font-semibold mb-2">What this collab includes</p>
            <ul className="text-sm text-muted-foreground space-y-1.5">
              <li>• Complimentary stay in exchange for content</li>
              <li>• Direct chat with the host to align on dates and deliverables</li>
              <li>• Usage rights agreed up front in your application</li>
            </ul>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {property.tags.map((t) => (
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
              Apply for this stay
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
