import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Search } from "lucide-react";
import { format } from "date-fns";

interface ReferralCodesManagementProps {
  referralCodes: any[];
  onToggleStatus: (codeId: string, isActive: boolean) => void;
  loading: boolean;
}

export const ReferralCodesManagement = ({ 
  referralCodes, 
  onToggleStatus,
  loading 
}: ReferralCodesManagementProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterActive, setFilterActive] = useState<boolean | null>(null);

  const filteredCodes = referralCodes.filter(code => {
    const matchesSearch = code.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (code.profiles?.first_name + ' ' + code.profiles?.last_name).toLowerCase().includes(searchTerm.toLowerCase());
    const matchesActive = filterActive === null || code.is_active === filterActive;
    return matchesSearch && matchesActive;
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Referral Codes</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex gap-4 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by code or owner..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant={filterActive === null ? "default" : "outline"}
              onClick={() => setFilterActive(null)}
              size="sm"
            >
              All
            </Button>
            <Button
              variant={filterActive === true ? "default" : "outline"}
              onClick={() => setFilterActive(true)}
              size="sm"
            >
              Active
            </Button>
            <Button
              variant={filterActive === false ? "default" : "outline"}
              onClick={() => setFilterActive(false)}
              size="sm"
            >
              Inactive
            </Button>
          </div>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Owner</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Active</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCodes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground">
                    No referral codes found
                  </TableCell>
                </TableRow>
              ) : (
                filteredCodes.map((code) => (
                  <TableRow key={code.id}>
                    <TableCell className="font-mono font-semibold">{code.code}</TableCell>
                    <TableCell>
                      {code.profiles ? `${code.profiles.first_name} ${code.profiles.last_name}` : 'Unknown'}
                    </TableCell>
                    <TableCell>
                      <Badge variant={code.is_active ? "default" : "secondary"}>
                        {code.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell>{format(new Date(code.created_at), 'MMM d, yyyy')}</TableCell>
                    <TableCell>
                      <Switch
                        checked={code.is_active}
                        onCheckedChange={() => onToggleStatus(code.id, code.is_active)}
                        disabled={loading}
                      />
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};
