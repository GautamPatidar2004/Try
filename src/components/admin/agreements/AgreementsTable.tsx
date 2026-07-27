import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";
import { format } from "date-fns";

interface AgreementsTableProps {
  agreements: any[];
  onViewAgreement: (agreement: any) => void;
}

export const AgreementsTable = ({ agreements, onViewAgreement }: AgreementsTableProps) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "default";
      case "pending": return "secondary";
      case "completed": return "outline";
      case "cancelled": return "destructive";
      default: return "secondary";
    }
  };

  const formatCurrency = (amount: number | null, currency: string = 'usd') => {
    if (!amount) return 'N/A';
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: currency.toUpperCase() }).format(amount / 100);
  };

  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Host</TableHead>
            <TableHead>Influencer</TableHead>
            <TableHead>Property</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Created</TableHead>
            <TableHead>Deadline</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {agreements.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                No agreements found
              </TableCell>
            </TableRow>
          ) : (
            agreements.map((agreement) => (
              <TableRow key={agreement.id}>
                <TableCell className="font-medium">
                  {agreement.host?.profiles?.first_name} {agreement.host?.profiles?.last_name}
                </TableCell>
                <TableCell>
                  {agreement.influencer?.profiles?.first_name} {agreement.influencer?.profiles?.last_name}
                </TableCell>
                <TableCell>{agreement.application?.property?.title || 'N/A'}</TableCell>
                <TableCell>{formatCurrency(agreement.agreed_rate, agreement.currency)}</TableCell>
                <TableCell>
                  <Badge variant={getStatusColor(agreement.status)}>
                    {agreement.status}
                  </Badge>
                </TableCell>
                <TableCell>{format(new Date(agreement.created_at), 'MMM dd, yyyy')}</TableCell>
                <TableCell>{agreement.deadline ? format(new Date(agreement.deadline), 'MMM dd, yyyy') : 'N/A'}</TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onViewAgreement(agreement)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};
