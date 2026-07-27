import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { format } from "date-fns";

interface CommissionDetailModalProps {
  commission: any;
  open: boolean;
  onClose: () => void;
  onUpdateStatus: (commissionId: string, status: string, adminNotes?: string) => void;
  loading: boolean;
}

export const CommissionDetailModal = ({ 
  commission, 
  open, 
  onClose, 
  onUpdateStatus,
  loading 
}: CommissionDetailModalProps) => {
  const [adminNotes, setAdminNotes] = useState(commission.admin_notes || '');

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount / 100);
  };

  const handleMarkAsPaid = () => {
    onUpdateStatus(commission.id, 'paid', adminNotes);
    onClose();
  };

  const handleSaveNotes = () => {
    onUpdateStatus(commission.id, commission.status, adminNotes);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Commission Details</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-muted-foreground">Referrer</Label>
              <p className="font-semibold">
                {commission.referrer 
                  ? `${commission.referrer.first_name} ${commission.referrer.last_name}` 
                  : 'Unknown'}
              </p>
            </div>
            <div>
              <Label className="text-muted-foreground">Status</Label>
              <div className="mt-1">
                <Badge variant={commission.status === 'paid' ? 'default' : 'secondary'}>
                  {commission.status}
                </Badge>
              </div>
            </div>
            <div>
              <Label className="text-muted-foreground">Commission Amount</Label>
              <p className="text-2xl font-bold">{formatCurrency(commission.commission_amount)}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">Commission Rate</Label>
              <p className="font-semibold">{commission.commission_percentage}%</p>
            </div>
            <div>
              <Label className="text-muted-foreground">Period Start</Label>
              <p>{format(new Date(commission.subscription_period_start), 'MMM d, yyyy')}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">Period End</Label>
              <p>{format(new Date(commission.subscription_period_end), 'MMM d, yyyy')}</p>
            </div>
            {commission.paid_at && (
              <div>
                <Label className="text-muted-foreground">Paid Date</Label>
                <p>{format(new Date(commission.paid_at), 'MMM d, yyyy')}</p>
              </div>
            )}
            <div>
              <Label className="text-muted-foreground">Created</Label>
              <p>{format(new Date(commission.created_at), 'MMM d, yyyy')}</p>
            </div>
          </div>

          <div>
            <Label htmlFor="admin-notes">Admin Notes</Label>
            <Textarea
              id="admin-notes"
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              placeholder="Add internal notes about this commission..."
              rows={4}
              className="mt-2"
            />
          </div>

          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            {commission.status === 'pending' && (
              <Button 
                onClick={handleMarkAsPaid}
                disabled={loading}
              >
                Mark as Paid
              </Button>
            )}
            <Button 
              variant="secondary"
              onClick={handleSaveNotes}
              disabled={loading}
            >
              Save Notes
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
