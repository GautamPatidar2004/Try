import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Download, RefreshCw, CheckCircle } from "lucide-react";
import { useEarnings } from "@/hooks/useEarnings";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { Checkbox } from "@/components/ui/checkbox";

export const EarningsManagement = () => {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sourceFilter, setSourceFilter] = useState("all");
  const [selectedEarnings, setSelectedEarnings] = useState<string[]>([]);

  const { earnings, isLoading, refetch, approveForPayout, isApproving } = useEarnings({
    status: statusFilter,
    sourceType: sourceFilter,
  });

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      available: "default",
      pending: "secondary",
      paid: "outline",
    };
    return <Badge variant={variants[status] || "outline"}>{status}</Badge>;
  };

  const handleSelectAll = () => {
    if (selectedEarnings.length === earnings.length) {
      setSelectedEarnings([]);
    } else {
      setSelectedEarnings(earnings.filter(e => e.status === 'available').map(e => e.id));
    }
  };

  const handleApproveSelected = () => {
    if (selectedEarnings.length > 0) {
      approveForPayout(selectedEarnings);
      setSelectedEarnings([]);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Earnings Management</CardTitle>
        <div className="flex flex-col md:flex-row gap-4 mt-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by influencer..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="available">Available</SelectItem>
              <SelectItem value="paid">Paid</SelectItem>
            </SelectContent>
          </Select>
          <Select value={sourceFilter} onValueChange={setSourceFilter}>
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="Source" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Sources</SelectItem>
              <SelectItem value="collaboration">Collaboration</SelectItem>
              <SelectItem value="brand_partnership">Brand Partnership</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={() => refetch()} variant="outline" size="icon">
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
        {selectedEarnings.length > 0 && (
          <div className="flex gap-2 mt-4">
            <Button
              onClick={handleApproveSelected}
              disabled={isApproving}
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Approve {selectedEarnings.length} for Payout
            </Button>
          </div>
        )}
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox
                    checked={selectedEarnings.length === earnings.filter(e => e.status === 'available').length}
                    onCheckedChange={handleSelectAll}
                  />
                </TableHead>
                <TableHead>Influencer</TableHead>
                <TableHead>Source</TableHead>
                <TableHead>Gross Amount</TableHead>
                <TableHead>Platform Fee</TableHead>
                <TableHead>Net Amount</TableHead>
                <TableHead>Earned Date</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {earnings.map((earning) => (
                <TableRow key={earning.id}>
                  <TableCell>
                    <Checkbox
                      checked={selectedEarnings.includes(earning.id)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedEarnings([...selectedEarnings, earning.id]);
                        } else {
                          setSelectedEarnings(selectedEarnings.filter(id => id !== earning.id));
                        }
                      }}
                      disabled={earning.status !== 'available'}
                    />
                  </TableCell>
                  <TableCell>Influencer</TableCell>
                  <TableCell className="capitalize">{earning.source_type?.replace('_', ' ')}</TableCell>
                  <TableCell>${(earning.gross_amount / 100).toFixed(2)}</TableCell>
                  <TableCell>${((earning.platform_fee || 0) / 100).toFixed(2)}</TableCell>
                  <TableCell className="font-semibold">${(earning.net_amount / 100).toFixed(2)}</TableCell>
                  <TableCell>{format(new Date(earning.earned_at), 'MMM dd, yyyy')}</TableCell>
                  <TableCell>{getStatusBadge(earning.status)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};
