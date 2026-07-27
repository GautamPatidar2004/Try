import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAmbassadorAdmin, AmbassadorWithProfile } from '@/hooks/useAmbassadorAdmin';
import { Loader2, Percent, RotateCcw } from 'lucide-react';

interface CommissionAdjusterProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ambassador: AmbassadorWithProfile | null;
}

export function CommissionAdjuster({ open, onOpenChange, ambassador }: CommissionAdjusterProps) {
  const { updateCommission, updateTier, tiers, isUpdating } = useAmbassadorAdmin();
  const [commissionRate, setCommissionRate] = useState(20);
  const [useOverride, setUseOverride] = useState(false);
  const [tierOverride, setTierOverride] = useState<string | null>(null);
  const [useTierOverride, setUseTierOverride] = useState(false);

  useEffect(() => {
    if (ambassador) {
      const currentRate = ambassador.commission_override !== null 
        ? ambassador.commission_override * 100 
        : 20;
      setCommissionRate(currentRate);
      setUseOverride(ambassador.commission_override !== null);
      setTierOverride(ambassador.tier_override);
      setUseTierOverride(ambassador.tier_override !== null);
    }
  }, [ambassador]);

  const handleSave = () => {
    if (!ambassador) return;

    // Update commission
    updateCommission({
      id: ambassador.id,
      commission_override: useOverride ? commissionRate / 100 : null,
    });

    // Update tier
    updateTier({
      id: ambassador.id,
      tier_override: useTierOverride ? tierOverride : null,
    });

    onOpenChange(false);
  };

  const handleResetCommission = () => {
    setUseOverride(false);
    setCommissionRate(20);
  };

  const handleResetTier = () => {
    setUseTierOverride(false);
    setTierOverride(null);
  };

  if (!ambassador) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Adjust Commission & Tier</DialogTitle>
          <DialogDescription>
            Override commission rate and tier for this ambassador
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Ambassador Info */}
          <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
            <Avatar className="w-10 h-10">
              <AvatarFallback>
                {ambassador.profile?.first_name?.[0]}
                {ambassador.profile?.last_name?.[0]}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">
                {ambassador.profile?.first_name} {ambassador.profile?.last_name}
              </p>
              <p className="text-sm text-muted-foreground">
                Current: {ambassador.current_tier || 'Standard'} tier • {((ambassador.commission_override ?? 0.2) * 100).toFixed(0)}% commission
              </p>
            </div>
          </div>

          {/* Commission Override */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="commission-override">Commission Override</Label>
              <div className="flex items-center gap-2">
                <Switch
                  id="commission-override"
                  checked={useOverride}
                  onCheckedChange={setUseOverride}
                />
                {useOverride && (
                  <Button variant="ghost" size="icon" onClick={handleResetCommission}>
                    <RotateCcw className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>

            {useOverride && (
              <div className="space-y-3">
                <div className="flex items-center gap-4">
                  <Slider
                    value={[commissionRate]}
                    onValueChange={([val]) => setCommissionRate(val)}
                    min={5}
                    max={50}
                    step={1}
                    className="flex-1"
                  />
                  <div className="flex items-center gap-1 min-w-[60px]">
                    <Input
                      type="number"
                      value={commissionRate}
                      onChange={(e) => setCommissionRate(Number(e.target.value))}
                      className="w-16 text-center"
                      min={5}
                      max={50}
                    />
                    <Percent className="w-4 h-4 text-muted-foreground" />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  Default commission is 20%. Setting an override will apply to all this ambassador's referrals.
                </p>
              </div>
            )}
          </div>

          {/* Tier Override */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="tier-override">Tier Override</Label>
              <div className="flex items-center gap-2">
                <Switch
                  id="tier-override"
                  checked={useTierOverride}
                  onCheckedChange={setUseTierOverride}
                />
                {useTierOverride && (
                  <Button variant="ghost" size="icon" onClick={handleResetTier}>
                    <RotateCcw className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>

            {useTierOverride && (
              <div className="grid grid-cols-2 gap-2">
                {(tiers || []).map((tier) => (
                  <Button
                    key={tier.id}
                    variant={tierOverride === tier.name ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setTierOverride(tier.name)}
                    className="justify-start"
                  >
                    {tier.icon && <span className="mr-2">{tier.icon}</span>}
                    {tier.name}
                  </Button>
                ))}
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isUpdating}>
            {isUpdating && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
