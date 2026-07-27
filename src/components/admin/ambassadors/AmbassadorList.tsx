import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Search, MoreHorizontal, CheckCircle, XCircle, Percent, Award, ArrowUpDown, Loader2 } from 'lucide-react';
import { useAmbassadorAdmin, AmbassadorWithProfile } from '@/hooks/useAmbassadorAdmin';
import { CommissionAdjuster } from './CommissionAdjuster';
import { ManualReferralEditor } from './ManualReferralEditor';
import { Checkbox } from '@/components/ui/checkbox';

export function AmbassadorList() {
  const { ambassadors, isLoading, updateStatus, bulkUpdateStatus, isUpdating } = useAmbassadorAdmin();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [tierFilter, setTierFilter] = useState<string>('all');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [commissionModalOpen, setCommissionModalOpen] = useState(false);
  const [referralModalOpen, setReferralModalOpen] = useState(false);
  const [selectedAmbassador, setSelectedAmbassador] = useState<AmbassadorWithProfile | null>(null);

  const filteredAmbassadors = useMemo(() => {
    if (!ambassadors) return [];

    return ambassadors.filter((amb) => {
      const searchLower = search.toLowerCase();
      const nameMatch =
        amb.profile?.first_name?.toLowerCase().includes(searchLower) ||
        amb.profile?.last_name?.toLowerCase().includes(searchLower) ||
        amb.referral_code.toLowerCase().includes(searchLower);

      const statusMatch = statusFilter === 'all' || amb.status === statusFilter;
      const tierMatch = tierFilter === 'all' || (amb.tier_override || amb.current_tier) === tierFilter;

      return nameMatch && statusMatch && tierMatch;
    });
  }, [ambassadors, search, statusFilter, tierFilter]);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(filteredAmbassadors.map((a) => a.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedIds((prev) => [...prev, id]);
    } else {
      setSelectedIds((prev) => prev.filter((i) => i !== id));
    }
  };

  const handleBulkAction = (status: string) => {
    if (selectedIds.length === 0) return;
    bulkUpdateStatus({ ids: selectedIds, status });
    setSelectedIds([]);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800">Active</Badge>;
      case 'pending':
        return <Badge className="bg-amber-100 text-amber-800">Pending</Badge>;
      case 'suspended':
        return <Badge className="bg-red-100 text-red-800">Suspended</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getTierBadge = (ambassador: AmbassadorWithProfile) => {
    const tier = ambassador.tier_override || ambassador.current_tier || 'Standard';
    const isOverridden = !!ambassador.tier_override;

    return (
      <Badge variant={isOverridden ? 'default' : 'outline'} className={isOverridden ? 'bg-purple-600' : ''}>
        {tier}
        {isOverridden && ' (Override)'}
      </Badge>
    );
  };

  const getCommissionDisplay = (ambassador: AmbassadorWithProfile) => {
    const rate = ambassador.commission_override ?? 0.2;
    const isOverridden = ambassador.commission_override !== null;

    return (
      <span className={isOverridden ? 'font-semibold text-purple-600' : ''}>
        {(rate * 100).toFixed(0)}%
        {isOverridden && ' *'}
      </span>
    );
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4 justify-between">
            <CardTitle>All Ambassadors</CardTitle>
            <div className="flex flex-wrap gap-2">
              {selectedIds.length > 0 && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      Bulk Actions ({selectedIds.length})
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => handleBulkAction('active')}>
                      <CheckCircle className="w-4 h-4 mr-2 text-green-600" />
                      Activate All
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleBulkAction('suspended')}>
                      <XCircle className="w-4 h-4 mr-2 text-red-600" />
                      Suspend All
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or referral code..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
              </SelectContent>
            </Select>
            <Select value={tierFilter} onValueChange={setTierFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Tier" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Tiers</SelectItem>
                <SelectItem value="Standard">Standard</SelectItem>
                <SelectItem value="Silver">Silver</SelectItem>
                <SelectItem value="Gold">Gold</SelectItem>
                <SelectItem value="Platinum">Platinum</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Table */}
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox
                      checked={selectedIds.length === filteredAmbassadors.length && filteredAmbassadors.length > 0}
                      onCheckedChange={handleSelectAll}
                    />
                  </TableHead>
                  <TableHead>Ambassador</TableHead>
                  <TableHead>Referral Code</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Tier</TableHead>
                  <TableHead className="text-center">Referrals</TableHead>
                  <TableHead className="text-right">Earnings</TableHead>
                  <TableHead className="text-center">Commission</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAmbassadors.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                      No ambassadors found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredAmbassadors.map((ambassador) => (
                    <TableRow key={ambassador.id}>
                      <TableCell>
                        <Checkbox
                          checked={selectedIds.includes(ambassador.id)}
                          onCheckedChange={(checked) => handleSelectOne(ambassador.id, !!checked)}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="w-8 h-8">
                            <AvatarFallback>
                              {ambassador.profile?.first_name?.[0]}
                              {ambassador.profile?.last_name?.[0]}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">
                              {ambassador.profile?.first_name} {ambassador.profile?.last_name}
                            </p>
                            {ambassador.admin_notes && (
                              <p className="text-xs text-muted-foreground truncate max-w-[150px]">
                                Note: {ambassador.admin_notes}
                              </p>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <code className="text-sm bg-muted px-2 py-1 rounded">
                          {ambassador.referral_code}
                        </code>
                      </TableCell>
                      <TableCell>{getStatusBadge(ambassador.status)}</TableCell>
                      <TableCell>{getTierBadge(ambassador)}</TableCell>
                      <TableCell className="text-center">{ambassador.referrals_count || 0}</TableCell>
                      <TableCell className="text-right">
                        ${(ambassador.total_earnings || 0).toLocaleString()}
                      </TableCell>
                      <TableCell className="text-center">{getCommissionDisplay(ambassador)}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" disabled={isUpdating}>
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {ambassador.status !== 'active' && (
                              <DropdownMenuItem
                                onClick={() => updateStatus({ id: ambassador.id, status: 'active' })}
                              >
                                <CheckCircle className="w-4 h-4 mr-2 text-green-600" />
                                Activate
                              </DropdownMenuItem>
                            )}
                            {ambassador.status !== 'suspended' && (
                              <DropdownMenuItem
                                onClick={() => updateStatus({ id: ambassador.id, status: 'suspended' })}
                              >
                                <XCircle className="w-4 h-4 mr-2 text-red-600" />
                                Suspend
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedAmbassador(ambassador);
                                setCommissionModalOpen(true);
                              }}
                            >
                              <Percent className="w-4 h-4 mr-2" />
                              Adjust Commission
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedAmbassador(ambassador);
                                setReferralModalOpen(true);
                              }}
                            >
                              <ArrowUpDown className="w-4 h-4 mr-2" />
                              Manage Referrals
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Modals */}
      <CommissionAdjuster
        open={commissionModalOpen}
        onOpenChange={setCommissionModalOpen}
        ambassador={selectedAmbassador}
      />
      <ManualReferralEditor
        open={referralModalOpen}
        onOpenChange={setReferralModalOpen}
        ambassador={selectedAmbassador}
      />
    </>
  );
}
