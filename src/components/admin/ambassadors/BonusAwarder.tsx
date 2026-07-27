import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAmbassadorAdmin } from '@/hooks/useAmbassadorAdmin';
import { Loader2, Award, DollarSign, CheckCircle, Clock, XCircle } from 'lucide-react';
import { format } from 'date-fns';

export function BonusAwarder() {
  const { ambassadors, bonuses, awardBonus, updateBonusStatus, isUpdating, bonusesLoading } = useAmbassadorAdmin();
  const [selectedAmbassadorId, setSelectedAmbassadorId] = useState('');
  const [amount, setAmount] = useState('');
  const [reason, setReason] = useState('');

  const handleAwardBonus = () => {
    if (!selectedAmbassadorId || !amount || !reason) return;

    awardBonus({
      ambassador_id: selectedAmbassadorId,
      amount: parseFloat(amount),
      reason,
    });

    // Reset form
    setSelectedAmbassadorId('');
    setAmount('');
    setReason('');
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return (
          <Badge className="bg-green-100 text-green-800">
            <CheckCircle className="w-3 h-3 mr-1" />
            Paid
          </Badge>
        );
      case 'pending':
        return (
          <Badge className="bg-amber-100 text-amber-800">
            <Clock className="w-3 h-3 mr-1" />
            Pending
          </Badge>
        );
      case 'cancelled':
        return (
          <Badge className="bg-red-100 text-red-800">
            <XCircle className="w-3 h-3 mr-1" />
            Cancelled
          </Badge>
        );
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getAmbassadorName = (ambassadorId: string) => {
    const amb = ambassadors?.find((a) => a.id === ambassadorId);
    if (!amb) return 'Unknown';
    return `${amb.profile?.first_name || ''} ${amb.profile?.last_name || ''}`.trim() || 'Unknown';
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Award Bonus Form */}
      <Card className="lg:col-span-1">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="w-5 h-5 text-brand-green" />
            Award Bonus
          </CardTitle>
          <CardDescription>
            Give a one-time bonus to an ambassador
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="ambassador">Select Ambassador</Label>
            <Select value={selectedAmbassadorId} onValueChange={setSelectedAmbassadorId}>
              <SelectTrigger>
                <SelectValue placeholder="Choose an ambassador..." />
              </SelectTrigger>
              <SelectContent>
                {ambassadors
                  ?.filter((a) => a.status === 'active')
                  .map((amb) => (
                    <SelectItem key={amb.id} value={amb.id}>
                        <div className="flex items-center gap-2">
                          <Avatar className="w-6 h-6">
                            <AvatarFallback className="text-xs">
                              {amb.profile?.first_name?.[0]}
                              {amb.profile?.last_name?.[0]}
                            </AvatarFallback>
                          </Avatar>
                        {amb.profile?.first_name} {amb.profile?.last_name}
                      </div>
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Amount ($)</Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="amount"
                type="number"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="pl-8"
                min="0"
                step="0.01"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="reason">Reason</Label>
            <Textarea
              id="reason"
              placeholder="e.g., Exceptional performance in Q4, milestone achievement..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
            />
          </div>

          <Button
            onClick={handleAwardBonus}
            disabled={!selectedAmbassadorId || !amount || !reason || isUpdating}
            className="w-full"
          >
            {isUpdating ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Award className="w-4 h-4 mr-2" />
            )}
            Award Bonus
          </Button>
        </CardContent>
      </Card>

      {/* Bonus History */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Bonus History</CardTitle>
          <CardDescription>Recent bonus awards and their status</CardDescription>
        </CardHeader>
        <CardContent>
          {bonusesLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin" />
            </div>
          ) : !bonuses || bonuses.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No bonuses awarded yet
            </div>
          ) : (
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Ambassador</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bonuses.map((bonus) => (
                    <TableRow key={bonus.id}>
                      <TableCell className="font-medium">
                        {getAmbassadorName(bonus.ambassador_id)}
                      </TableCell>
                      <TableCell className="text-right font-semibold text-brand-green">
                        ${Number(bonus.amount).toLocaleString()}
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate">
                        {bonus.reason}
                      </TableCell>
                      <TableCell>{getStatusBadge(bonus.status)}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {format(new Date(bonus.created_at), 'MMM d, yyyy')}
                      </TableCell>
                      <TableCell>
                        {bonus.status === 'pending' && (
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => updateBonusStatus({ id: bonus.id, status: 'paid' })}
                              className="text-green-600 hover:text-green-700"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => updateBonusStatus({ id: bonus.id, status: 'cancelled' })}
                              className="text-red-600 hover:text-red-700"
                            >
                              <XCircle className="w-4 h-4" />
                            </Button>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
