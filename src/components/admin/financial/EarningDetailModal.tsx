import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface EarningDetailModalProps {
  earning: any;
  open: boolean;
  onClose: () => void;
}

export const EarningDetailModal = ({ earning, open, onClose }: EarningDetailModalProps) => {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Earning Details</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <p>Earning detail view - To be implemented</p>
        </div>
      </DialogContent>
    </Dialog>
  );
};
