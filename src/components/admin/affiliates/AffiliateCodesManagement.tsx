import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
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
import { Search, Copy, Check } from "lucide-react";
import { format } from "date-fns";
import { AffiliateCode } from "@/hooks/useAdminAffiliateManagement";
import { UseMutationResult } from "@tanstack/react-query";

interface AffiliateCodesManagementProps {
  codes: AffiliateCode[];
  toggleCodeStatus: UseMutationResult<void, Error, { codeId: string; isActive: boolean }>;
}

export const AffiliateCodesManagement = ({
  codes,
  toggleCodeStatus,
}: AffiliateCodesManagementProps) => {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const filteredCodes = codes.filter((code) => {
    const matchesSearch =
      code.code.toLowerCase().includes(search.toLowerCase()) ||
      `${code.creator?.profiles?.first_name || ""} ${code.creator?.profiles?.last_name || ""}`
        .toLowerCase()
        .includes(search.toLowerCase());

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && code.is_active) ||
      (statusFilter === "inactive" && !code.is_active);

    return matchesSearch && matchesStatus;
  });

  const handleCopyCode = async (code: string) => {
    await navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const getCreatorName = (code: AffiliateCode) => {
    if (!code.creator?.profiles) return "Unknown";
    const { first_name, last_name } = code.creator.profiles;
    return `${first_name || ""} ${last_name || ""}`.trim() || "Unknown";
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Affiliate Codes</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by code or creator..."
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
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Creator</TableHead>
                <TableHead>Property</TableHead>
                <TableHead>Commission</TableHead>
                <TableHead>Uses</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Active</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCodes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                    No affiliate codes found
                  </TableCell>
                </TableRow>
              ) : (
                filteredCodes.map((code) => (
                  <TableRow key={code.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <code className="text-sm font-mono bg-muted px-2 py-1 rounded">
                          {code.code}
                        </code>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => handleCopyCode(code.code)}
                        >
                          {copiedCode === code.code ? (
                            <Check className="h-3 w-3 text-green-500" />
                          ) : (
                            <Copy className="h-3 w-3" />
                          )}
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell>{getCreatorName(code)}</TableCell>
                    <TableCell>
                      <div className="max-w-[150px] truncate">
                        {code.property?.title || "N/A"}
                      </div>
                    </TableCell>
                    <TableCell>{code.commission_rate}%</TableCell>
                    <TableCell>
                      {code.current_uses}
                      {code.usage_limit ? ` / ${code.usage_limit}` : ""}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={code.is_active ? "default" : "secondary"}
                        className={code.is_active ? "bg-hostfluencer-green" : ""}
                      >
                        {code.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {format(new Date(code.created_at), "MMM d, yyyy")}
                    </TableCell>
                    <TableCell>
                      <Switch
                        checked={code.is_active}
                        onCheckedChange={(checked) =>
                          toggleCodeStatus.mutate({ codeId: code.id, isActive: checked })
                        }
                        disabled={toggleCodeStatus.isPending}
                      />
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        <p className="text-sm text-muted-foreground">
          Showing {filteredCodes.length} of {codes.length} codes
        </p>
      </CardContent>
    </Card>
  );
};
