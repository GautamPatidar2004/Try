import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface PayoutDetailModalProps {
  payout: any;
  open: boolean;
  onClose: () => void;
}

export const PayoutDetailModal = ({ payout, open, onClose }: PayoutDetailModalProps) => {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Payout Details</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <p>Payout detail view - To be implemented</p>
        </div>
      </DialogContent>
    </Dialog>
  );
};
