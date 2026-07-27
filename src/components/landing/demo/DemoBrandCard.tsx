import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Building2 } from "lucide-react";

interface Brand {
  id: string;
  brand_name?: string;
  company_name?: string;
  industry?: string;
  logo_url?: string;
  budget_range?: string;
  verified?: boolean;
}

interface DemoBrandCardProps {
  brand: Brand;
  onInteraction: () => void;
}

export const DemoBrandCard = ({ brand, onInteraction }: DemoBrandCardProps) => {
  const name = brand.brand_name || brand.company_name || 'Brand';

  return (
    <Card 
      className="p-3 min-w-[180px] max-w-[180px] cursor-pointer hover:bg-accent/50 transition-colors border-border/50"
      onClick={onInteraction}
    >
      <div className="flex flex-col items-center gap-2">
        <Avatar className="h-14 w-14">
          <AvatarImage src={brand.logo_url || ''} alt={name} />
          <AvatarFallback className="bg-primary/10 text-primary">
            <Building2 className="h-6 w-6" />
          </AvatarFallback>
        </Avatar>
        
        <div className="text-center space-y-1">
          <p className="font-medium text-sm text-foreground truncate max-w-full">{name}</p>
          {brand.industry && (
            <p className="text-xs text-muted-foreground capitalize">{brand.industry}</p>
          )}
        </div>

        <div className="flex flex-wrap gap-1 justify-center">
          {brand.verified && (
            <Badge variant="default" className="text-[10px] px-1.5 py-0">
              Verified
            </Badge>
          )}
          {brand.budget_range && (
            <Badge variant="secondary" className="text-[10px] px-1.5 py-0 capitalize">
              {brand.budget_range}
            </Badge>
          )}
        </div>
      </div>
    </Card>
  );
};
