import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { format } from "date-fns";
import { CommissionDetailModal } from "./CommissionDetailModal";

interface CommissionsManagementProps {
  commissions: any[];
  onUpdateStatus: (commissionId: string, status: string, adminNotes?: string) => void;
  loading: boolean;
}

export const CommissionsManagement = ({ 
  commissions, 
  onUpdateStatus,
  loading 
}: CommissionsManagementProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string | null>(null);
  const [selectedCommission, setSelectedCommission] = useState<any>(null);

  const filteredCommissions = commissions.filter(commission => {
    const referrerName = commission.referrer 
      ? `${commission.referrer.first_name} ${commission.referrer.last_name}` 
      : '';
    
    const matchesSearch = referrerName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === null || commission.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount / 100);
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Commission Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by referrer..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant={filterStatus === null ? "default" : "outline"}
                onClick={() => setFilterStatus(null)}
                size="sm"
              >
                All
              </Button>
              <Button
                variant={filterStatus === 'pending' ? "default" : "outline"}
                onClick={() => setFilterStatus('pending')}
                size="sm"
              >
                Pending
              </Button>
              <Button
                variant={filterStatus === 'paid' ? "default" : "outline"}
                onClick={() => setFilterStatus('paid')}
                size="sm"
              >
                Paid
              </Button>
            </div>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Referrer</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Period</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Paid Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCommissions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground">
                      No commissions found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredCommissions.map((commission) => (
                    <TableRow key={commission.id}>
                      <TableCell>
                        {commission.referrer 
                          ? `${commission.referrer.first_name} ${commission.referrer.last_name}` 
                          : 'Unknown'}
                      </TableCell>
                      <TableCell className="font-semibold">
                        {formatCurrency(commission.commission_amount)}
                      </TableCell>
                      <TableCell className="text-sm">
                        {format(new Date(commission.subscription_period_start), 'MMM d')} - {format(new Date(commission.subscription_period_end), 'MMM d, yyyy')}
                      </TableCell>
                      <TableCell>
                        <Badge variant={commission.status === 'paid' ? 'default' : 'secondary'}>
                          {commission.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {commission.paid_at 
                          ? format(new Date(commission.paid_at), 'MMM d, yyyy') 
                          : '-'}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedCommission(commission)}
                        >
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {selectedCommission && (
        <CommissionDetailModal
          commission={selectedCommission}
          open={!!selectedCommission}
          onClose={() => setSelectedCommission(null)}
          onUpdateStatus={onUpdateStatus}
          loading={loading}
        />
      )}
    </>
  );
};
