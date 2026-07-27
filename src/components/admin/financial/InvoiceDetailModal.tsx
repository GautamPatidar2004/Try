import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface InvoiceDetailModalProps {
  invoice: any;
  open: boolean;
  onClose: () => void;
}

export const InvoiceDetailModal = ({ invoice, open, onClose }: InvoiceDetailModalProps) => {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Invoice Details</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <p>Invoice detail view - To be implemented</p>
        </div>
      </DialogContent>
    </Dialog>
  );
};
