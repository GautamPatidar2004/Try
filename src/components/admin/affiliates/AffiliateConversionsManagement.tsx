import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Search, MoreHorizontal, CheckCircle, XCircle, DollarSign, Bed, ShoppingBag, UtensilsCrossed } from "lucide-react";
import { format } from "date-fns";
import { AffiliateConversion } from "@/hooks/useAdminAffiliateManagement";
import { UseMutationResult } from "@tanstack/react-query";

interface AffiliateConversionsManagementProps {
  conversions: AffiliateConversion[];
  updateConversionStatus: UseMutationResult<void, Error, { conversionId: string; status: string; notes?: string }>;
}

const formatCurrency = (cents: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(cents / 100);

const getStatusBadge = (status: string) => {
  switch (status) {
    case "pending":
      return <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800">Pending</Badge>;
    case "confirmed":
      return <Badge variant="outline" className="bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950 dark:text-sky-300 dark:border-sky-800">Confirmed</Badge>;
    case "paid":
      return <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800">Paid</Badge>;
    case "cancelled":
      return <Badge variant="outline" className="bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950 dark:text-rose-300 dark:border-rose-800">Cancelled</Badge>;
    default:
      return <Badge variant="secondary">{status}</Badge>;
  }
};

const getConversionTypeIcon = (type: string) => {
  switch (type) {
    case "booking":
      return <Bed className="h-4 w-4" />;
    case "product":
      return <ShoppingBag className="h-4 w-4" />;
    case "restaurant":
      return <UtensilsCrossed className="h-4 w-4" />;
    default:
      return <DollarSign className="h-4 w-4" />;
  }
};

export const AffiliateConversionsManagement = ({
  conversions,
  updateConversionStatus,
}: AffiliateConversionsManagementProps) => {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");

  const filteredConversions = conversions.filter((conv) => {
    const creatorName = `${conv.creator?.profiles?.first_name || ""} ${conv.creator?.profiles?.last_name || ""}`.toLowerCase();
    const propertyName = conv.affiliate_code?.property?.title?.toLowerCase() || "";
    
    const matchesSearch =
      creatorName.includes(search.toLowerCase()) ||
      propertyName.includes(search.toLowerCase()) ||
      conv.affiliate_code?.code.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = statusFilter === "all" || conv.status === statusFilter;
    const matchesType = typeFilter === "all" || conv.conversion_type === typeFilter;

    return matchesSearch && matchesStatus && matchesType;
  });

  const getCreatorName = (conv: AffiliateConversion) => {
    if (!conv.creator?.profiles) return "Unknown";
    const { first_name, last_name } = conv.creator.profiles;
    return `${first_name || ""} ${last_name || ""}`.trim() || "Unknown";
  };

  const conversionTypes = [...new Set(conversions.map((c) => c.conversion_type))];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Affiliate Conversions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by creator, property, or code..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="confirmed">Confirmed</SelectItem>
              <SelectItem value="paid">Paid</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              {conversionTypes.map((type) => (
                <SelectItem key={type} value={type}>
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead>Creator</TableHead>
                <TableHead>Property/Code</TableHead>
                <TableHead>Order</TableHead>
                <TableHead>Commission</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredConversions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                    No conversions found
                  </TableCell>
                </TableRow>
              ) : (
                filteredConversions.map((conv) => (
                  <TableRow key={conv.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getConversionTypeIcon(conv.conversion_type)}
                        <span className="capitalize text-sm">{conv.conversion_type}</span>
                      </div>
                    </TableCell>
                    <TableCell>{getCreatorName(conv)}</TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div className="truncate max-w-[120px]">
                          {conv.affiliate_code?.property?.title || "N/A"}
                        </div>
                        <code className="text-xs text-muted-foreground">
                          {conv.affiliate_code?.code}
                        </code>
                      </div>
                    </TableCell>
                    <TableCell>{formatCurrency(conv.order_amount)}</TableCell>
                    <TableCell className="font-medium text-green-600">
                      {formatCurrency(conv.commission_amount)}
                    </TableCell>
                    <TableCell>{getStatusBadge(conv.status)}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {format(new Date(conv.converted_at), "MMM d, yyyy")}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {conv.status === "pending" && (
                            <>
                              <DropdownMenuItem
                                onClick={() =>
                                  updateConversionStatus.mutate({
                                    conversionId: conv.id,
                                    status: "confirmed",
                                  })
                                }
                              >
                                <CheckCircle className="h-4 w-4 mr-2 text-blue-500" />
                                Confirm
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() =>
                                  updateConversionStatus.mutate({
                                    conversionId: conv.id,
                                    status: "cancelled",
                                  })
                                }
                                className="text-red-600"
                              >
                                <XCircle className="h-4 w-4 mr-2" />
                                Cancel
                              </DropdownMenuItem>
                            </>
                          )}
                          {conv.status === "confirmed" && (
                            <DropdownMenuItem
                              onClick={() =>
                                updateConversionStatus.mutate({
                                  conversionId: conv.id,
                                  status: "paid",
                                })
                              }
                            >
                              <DollarSign className="h-4 w-4 mr-2 text-green-500" />
                              Mark as Paid
                            </DropdownMenuItem>
                          )}
                          {(conv.status === "paid" || conv.status === "cancelled") && (
                            <DropdownMenuItem disabled className="text-muted-foreground">
                              No actions available
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        <p className="text-sm text-muted-foreground">
          Showing {filteredConversions.length} of {conversions.length} conversions
        </p>
      </CardContent>
    </Card>
  );
};
