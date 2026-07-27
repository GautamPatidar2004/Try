import { Badge } from "@/components/ui/badge";
import { useAmbassadorEarnings } from "@/hooks/useAmbassadorEarnings";
import { format } from "date-fns";
import { BrandCard } from "@/components/ui/brand-card";
import { MobileTable } from "@/components/ui/mobile-table";

export const CollaborationTracker = () => {
  const { collaborations } = useAmbassadorEarnings();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-brand-green/20 text-brand-green border-brand-green/30';
      case 'completed':
        return 'bg-blue-500/20 text-blue-700 border-blue-500/30';
      case 'pending':
        return 'bg-yellow-500/20 text-yellow-700 border-yellow-500/30';
      case 'disputed':
        return 'bg-red-500/20 text-red-700 border-red-500/30';
      default:
        return 'bg-gray-500/20 text-foreground/80 border-gray-500/30';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'property':
        return 'Property ($500)';
      case 'restaurant':
        return 'Restaurant ($100)';
      case 'experience':
        return 'Experience ($100)';
      default:
        return type;
    }
  };

  const columns = [
    {
      key: 'type',
      header: 'Type',
      mobileLabel: 'Type',
      render: (collab: typeof collaborations[0]) => (
        <span className="font-medium">{getTypeLabel(collab.type)}</span>
      ),
    },
    {
      key: 'flat_fee_amount',
      header: 'Amount',
      mobileLabel: 'Amount',
      render: (collab: typeof collaborations[0]) => (
        <span className="font-semibold text-brand-green">
          ${(typeof collab.flat_fee_amount === 'string' ? parseFloat(collab.flat_fee_amount) : collab.flat_fee_amount).toFixed(2)}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      mobileLabel: 'Status',
      render: (collab: typeof collaborations[0]) => (
        <Badge variant="outline" className={getStatusColor(collab.status)}>
          {collab.status}
        </Badge>
      ),
    },
    {
      key: 'payment_date',
      header: 'Payment Date',
      mobileLabel: 'Date',
      render: (collab: typeof collaborations[0]) => (
        <span className="text-sm text-muted-foreground">
          {collab.payment_date
            ? format(new Date(collab.payment_date), 'MMM d, yyyy')
            : collab.net30_due_date
            ? `Due ${format(new Date(collab.net30_due_date), 'MMM d')}`
            : '-'}
        </span>
      ),
    },
  ];

  return (
    <BrandCard variant="elevated" className="p-4 sm:p-6">
      <h3 className="text-lg font-semibold mb-4">Collaboration Tracker</h3>
      <MobileTable
        data={collaborations}
        columns={columns}
        keyExtractor={(collab) => collab.id}
        emptyMessage="No collaborations yet. Start connecting creators with properties!"
      />
    </BrandCard>
  );
};
