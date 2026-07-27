import { useState, useMemo } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Slider } from "@/components/ui/slider";
import { useRevenueProjections } from "@/hooks/useRevenueProjections";
import { Users, Building2, UtensilsCrossed, Briefcase, TrendingUp } from "lucide-react";

interface RevenueSimulatorSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const RevenueSimulatorSheet = ({ open, onOpenChange }: RevenueSimulatorSheetProps) => {
  const { calculateProjection, scenarios } = useRevenueProjections();
  
  const [creatorReferrals, setCreatorReferrals] = useState(3);
  const [propertyMatches, setPropertyMatches] = useState(1);
  const [restaurantMatches, setRestaurantMatches] = useState(2);
  const [brandDeals, setBrandDeals] = useState(0);

  const projection = useMemo(() => 
    calculateProjection(creatorReferrals, propertyMatches, restaurantMatches, brandDeals),
    [creatorReferrals, propertyMatches, restaurantMatches, brandDeals, calculateProjection]
  );

  const applyScenario = (scenario: typeof scenarios[0]) => {
    setCreatorReferrals(scenario.creatorReferrals);
    setPropertyMatches(scenario.propertyMatches);
    setRestaurantMatches(scenario.restaurantMatches);
    setBrandDeals(scenario.brandDeals);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader className="mb-6">
          <SheetTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Earnings Simulator
          </SheetTitle>
          <SheetDescription>
            See how much you could earn with different activity levels
          </SheetDescription>
        </SheetHeader>

        {/* Quick Scenarios */}
        <div className="mb-6">
          <p className="text-sm font-medium mb-3">Quick scenarios:</p>
          <div className="flex flex-wrap gap-2">
            {scenarios.map((scenario) => (
              <button
                key={scenario.name}
                onClick={() => applyScenario(scenario)}
                className="px-3 py-1.5 text-sm rounded-full bg-secondary hover:bg-secondary/80 transition-colors"
              >
                {scenario.name}
              </button>
            ))}
          </div>
        </div>

        {/* Sliders */}
        <div className="space-y-6 mb-8">
          <SliderControl
            icon={Users}
            label="Creator Referrals"
            value={creatorReferrals}
            onChange={setCreatorReferrals}
            max={20}
            earning={projection.monthlyRecurring}
          />
          <SliderControl
            icon={Building2}
            label="Property Matches"
            value={propertyMatches}
            onChange={setPropertyMatches}
            max={10}
            earning={propertyMatches * 500}
          />
          <SliderControl
            icon={UtensilsCrossed}
            label="Restaurant Matches"
            value={restaurantMatches}
            onChange={setRestaurantMatches}
            max={15}
            earning={restaurantMatches * 100}
          />
          <SliderControl
            icon={Briefcase}
            label="Brand Deals"
            value={brandDeals}
            onChange={setBrandDeals}
            max={5}
            earning={brandDeals * 250}
          />
        </div>

        {/* Results */}
        <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl p-6 space-y-4">
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-1">Projected Monthly</p>
            <p className="text-4xl font-bold text-primary">${projection.grandTotal.toLocaleString()}</p>
          </div>
          
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="bg-background/50 rounded-lg p-3 text-center">
              <p className="text-muted-foreground text-xs">Recurring</p>
              <p className="font-semibold">${projection.monthlyRecurring}/mo</p>
            </div>
            <div className="bg-background/50 rounded-lg p-3 text-center">
              <p className="text-muted-foreground text-xs">One-time</p>
              <p className="font-semibold">${projection.oneTimeEarnings}</p>
            </div>
          </div>

          {projection.tierBonus > 0 && (
            <div className="text-center text-sm text-green-600">
              +${projection.tierBonus} tier bonus included
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};

interface SliderControlProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number;
  onChange: (value: number) => void;
  max: number;
  earning: number;
}

const SliderControl = ({ icon: Icon, label, value, onChange, max, earning }: SliderControlProps) => (
  <div className="space-y-3">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Icon className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-medium">{label}</span>
      </div>
      <div className="text-right">
        <span className="font-bold">{value}</span>
        <span className="text-xs text-muted-foreground ml-2">≈ ${earning}/mo</span>
      </div>
    </div>
    <Slider
      value={[value]}
      onValueChange={(v) => onChange(v[0])}
      max={max}
      step={1}
      className="w-full"
    />
  </div>
);
