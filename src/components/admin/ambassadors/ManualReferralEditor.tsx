import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import { useAmbassadorAdmin, AmbassadorWithProfile } from '@/hooks/useAmbassadorAdmin';
import { Loader2, Plus, Save, UserPlus } from 'lucide-react';
import { format } from 'date-fns';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface ManualReferralEditorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ambassador: AmbassadorWithProfile | null;
}

interface Referral {
  id: string;
  referred_user_id: string;
  conversion_stage: string;
  status: string;
  created_at: string;
  referred_user?: {
    first_name: string | null;
    last_name: string | null;
  };
}

export function ManualReferralEditor({ open, onOpenChange, ambassador }: ManualReferralEditorProps) {
  const { fetchReferrals, updateReferral, addManualReferral, isUpdating } = useAmbassadorAdmin();
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('list');
  
  // New referral form
  const [newReferralUserId, setNewReferralUserId] = useState('');
  const [newReferralStage, setNewReferralStage] = useState('signup');
  const [newReferralSource, setNewReferralSource] = useState('manual_admin');

  useEffect(() => {
    if (open && ambassador) {
      loadReferrals();
    }
  }, [open, ambassador]);

  const loadReferrals = async () => {
    if (!ambassador) return;
    setLoading(true);
    try {
      const data = await fetchReferrals(ambassador.id);
      setReferrals(data || []);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateReferral = (id: string, updates: { conversion_stage?: string; status?: string }) => {
    updateReferral({ id, updates });
    setReferrals((prev) =>
      prev.map((r) => (r.id === id ? { ...r, ...updates } : r))
    );
  };

  const handleAddReferral = () => {
    if (!ambassador || !newReferralUserId) return;
    
    addManualReferral({
      ambassador_id: ambassador.id,
      referred_user_id: newReferralUserId,
      conversion_stage: newReferralStage,
      source_channel: newReferralSource,
    });

    // Reset form
    setNewReferralUserId('');
    setNewReferralStage('signup');
    setActiveTab('list');
    loadReferrals();
  };

  const getStageBadge = (stage: string) => {
    switch (stage) {
      case 'click':
        return <Badge variant="outline">Click</Badge>;
      case 'signup':
        return <Badge className="bg-blue-100 text-blue-800">Signup</Badge>;
      case 'subscribed':
        return <Badge className="bg-green-100 text-green-800">Subscribed</Badge>;
      case 'churned':
        return <Badge className="bg-red-100 text-red-800">Churned</Badge>;
      default:
        return <Badge variant="secondary">{stage}</Badge>;
    }
  };

  if (!ambassador) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Manage Referrals</DialogTitle>
          <DialogDescription>
            View and edit referrals for {ambassador.profile?.first_name} {ambassador.profile?.last_name}
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="list">Referral List</TabsTrigger>
            <TabsTrigger value="add">Add Manual Referral</TabsTrigger>
          </TabsList>

          <TabsContent value="list" className="mt-4">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin" />
              </div>
            ) : referrals.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No referrals found for this ambassador
              </div>
            ) : (
              <div className="rounded-md border overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Stage</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {referrals.map((referral) => (
                      <TableRow key={referral.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Avatar className="w-6 h-6">
                              <AvatarFallback className="text-xs">
                                {referral.referred_user?.first_name?.[0]}
                                {referral.referred_user?.last_name?.[0]}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-sm">
                              {referral.referred_user?.first_name} {referral.referred_user?.last_name}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>{getStageBadge(referral.conversion_stage)}</TableCell>
                        <TableCell>
                          <Select
                            value={referral.status}
                            onValueChange={(value) => handleUpdateReferral(referral.id, { status: value })}
                          >
                            <SelectTrigger className="w-24 h-8">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="active">Active</SelectItem>
                              <SelectItem value="inactive">Inactive</SelectItem>
                              <SelectItem value="disputed">Disputed</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {format(new Date(referral.created_at), 'MMM d, yyyy')}
                        </TableCell>
                        <TableCell>
                          <Select
                            value={referral.conversion_stage}
                            onValueChange={(value) => handleUpdateReferral(referral.id, { conversion_stage: value })}
                          >
                            <SelectTrigger className="w-28 h-8">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="click">Click</SelectItem>
                              <SelectItem value="signup">Signup</SelectItem>
                              <SelectItem value="subscribed">Subscribed</SelectItem>
                              <SelectItem value="churned">Churned</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </TabsContent>

          <TabsContent value="add" className="mt-4">
            <div className="space-y-4">
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800">
                <strong>Note:</strong> Manual referrals should only be added for legitimate cases where tracking failed.
                You'll need the user's UUID from the profiles table.
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="user-id">User ID (UUID)</Label>
                  <Input
                    id="user-id"
                    placeholder="e.g., 12345678-1234-1234-1234-123456789abc"
                    value={newReferralUserId}
                    onChange={(e) => setNewReferralUserId(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="stage">Conversion Stage</Label>
                  <Select value={newReferralStage} onValueChange={setNewReferralStage}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="click">Click</SelectItem>
                      <SelectItem value="signup">Signup</SelectItem>
                      <SelectItem value="subscribed">Subscribed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="source">Source Channel</Label>
                  <Input
                    id="source"
                    placeholder="e.g., manual_admin, support_ticket"
                    value={newReferralSource}
                    onChange={(e) => setNewReferralSource(e.target.value)}
                  />
                </div>

                <Button
                  onClick={handleAddReferral}
                  disabled={!newReferralUserId || isUpdating}
                  className="w-full"
                >
                  {isUpdating ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <UserPlus className="w-4 h-4 mr-2" />
                  )}
                  Add Manual Referral
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
