import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useAmbassadorAdmin } from '@/hooks/useAmbassadorAdmin';
import { Loader2, Edit, Star, Trophy, Crown, Gem, Users, DollarSign, Percent } from 'lucide-react';

const TIER_ICONS: Record<string, React.ReactNode> = {
  Standard: <Star className="w-5 h-5 text-gray-500" />,
  Silver: <Trophy className="w-5 h-5 text-gray-400" />,
  Gold: <Crown className="w-5 h-5 text-amber-500" />,
  Platinum: <Gem className="w-5 h-5 text-purple-500" />,
};

const TIER_COLORS: Record<string, string> = {
  Standard: 'bg-gray-100 text-gray-800',
  Silver: 'bg-gray-200 text-gray-800',
  Gold: 'bg-amber-100 text-amber-800',
  Platinum: 'bg-purple-100 text-purple-800',
};

export function TierManager() {
  const { tiers, ambassadors, updateTierThresholds, isUpdating } = useAmbassadorAdmin();
  const [editingTier, setEditingTier] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({
    min_referrals: 0,
    min_earnings: 0,
    commission_bonus: 0,
  });

  const handleEdit = (tier: {
    id: string;
    min_referrals: number;
    min_earnings: number;
    commission_bonus: number;
  }) => {
    setEditingTier(tier.id);
    setEditForm({
      min_referrals: tier.min_referrals,
      min_earnings: tier.min_earnings,
      commission_bonus: tier.commission_bonus * 100, // Convert to percentage
    });
  };

  const handleSave = () => {
    if (!editingTier) return;

    updateTierThresholds({
      id: editingTier,
      updates: {
        min_referrals: editForm.min_referrals,
        min_earnings: editForm.min_earnings,
        commission_bonus: editForm.commission_bonus / 100, // Convert back to decimal
      },
    });

    setEditingTier(null);
  };

  const getAmbassadorCountByTier = (tierName: string) => {
    return ambassadors?.filter((a) => (a.tier_override || a.current_tier) === tierName).length || 0;
  };

  return (
    <div className="space-y-6">
      {/* Tier Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {(tiers || []).map((tier) => (
          <Card key={tier.id} className="relative overflow-hidden">
            <div
              className="absolute top-0 left-0 right-0 h-1"
              style={{ backgroundColor: tier.color }}
            />
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {TIER_ICONS[tier.name] || <Star className="w-5 h-5" />}
                  <CardTitle className="text-lg">{tier.name}</CardTitle>
                </div>
                <Button variant="ghost" size="icon" onClick={() => handleEdit(tier)}>
                  <Edit className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    Min Referrals
                  </span>
                  <span className="font-medium">{tier.min_referrals}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground flex items-center gap-1">
                    <DollarSign className="w-4 h-4" />
                    Min Earnings
                  </span>
                  <span className="font-medium">${tier.min_earnings}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground flex items-center gap-1">
                    <Percent className="w-4 h-4" />
                    Commission Bonus
                  </span>
                  <span className="font-medium text-brand-green">
                    +{(tier.commission_bonus * 100).toFixed(0)}%
                  </span>
                </div>
                <div className="pt-2 border-t">
                  <Badge className={TIER_COLORS[tier.name] || 'bg-gray-100'}>
                    {getAmbassadorCountByTier(tier.name)} ambassadors
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Ambassadors by Tier Table */}
      <Card>
        <CardHeader>
          <CardTitle>Ambassadors by Tier</CardTitle>
          <CardDescription>
            Overview of ambassador distribution across tiers
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tier</TableHead>
                  <TableHead className="text-center">Count</TableHead>
                  <TableHead className="text-center">Min Referrals</TableHead>
                  <TableHead className="text-center">Min Earnings</TableHead>
                  <TableHead className="text-center">Bonus Rate</TableHead>
                  <TableHead className="text-right">Effective Commission</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(tiers || []).map((tier) => (
                  <TableRow key={tier.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {TIER_ICONS[tier.name]}
                        <Badge className={TIER_COLORS[tier.name]}>{tier.name}</Badge>
                      </div>
                    </TableCell>
                    <TableCell className="text-center font-medium">
                      {getAmbassadorCountByTier(tier.name)}
                    </TableCell>
                    <TableCell className="text-center">{tier.min_referrals}</TableCell>
                    <TableCell className="text-center">${tier.min_earnings}</TableCell>
                    <TableCell className="text-center text-brand-green">
                      +{(tier.commission_bonus * 100).toFixed(0)}%
                    </TableCell>
                    <TableCell className="text-right font-semibold">
                      {(20 + tier.commission_bonus * 100).toFixed(0)}%
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Edit Tier Dialog */}
      <Dialog open={!!editingTier} onOpenChange={() => setEditingTier(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Tier Thresholds</DialogTitle>
            <DialogDescription>
              Adjust the requirements and bonuses for this tier
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="min_referrals">Minimum Referrals</Label>
              <Input
                id="min_referrals"
                type="number"
                value={editForm.min_referrals}
                onChange={(e) =>
                  setEditForm((prev) => ({ ...prev, min_referrals: parseInt(e.target.value) || 0 }))
                }
                min="0"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="min_earnings">Minimum Earnings ($)</Label>
              <Input
                id="min_earnings"
                type="number"
                value={editForm.min_earnings}
                onChange={(e) =>
                  setEditForm((prev) => ({ ...prev, min_earnings: parseInt(e.target.value) || 0 }))
                }
                min="0"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="commission_bonus">Commission Bonus (%)</Label>
              <Input
                id="commission_bonus"
                type="number"
                value={editForm.commission_bonus}
                onChange={(e) =>
                  setEditForm((prev) => ({
                    ...prev,
                    commission_bonus: parseFloat(e.target.value) || 0,
                  }))
                }
                min="0"
                max="50"
                step="0.5"
              />
              <p className="text-xs text-muted-foreground">
                Added on top of the base 20% commission rate
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingTier(null)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isUpdating}>
              {isUpdating && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
