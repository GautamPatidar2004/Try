import { MapPin, CheckCircle2, Building2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface BrandCarouselCardProps {
  brand: any;
  onClick: () => void;
}

export const BrandCarouselCard = ({ brand, onClick }: BrandCarouselCardProps) => {
  const getBudgetLabel = (budget: string) => {
    const labels: Record<string, string> = {
      micro: '$',
      small: '$$',
      medium: '$$$',
      large: '$$$$',
      enterprise: '$$$$$'
    };
    return labels[budget] || budget;
  };

  return (
    <div 
      onClick={onClick}
      className="flex-shrink-0 w-[280px] bg-card rounded-xl overflow-hidden border border-border hover:border-primary/50 transition-all cursor-pointer group"
    >
      <div className="relative h-32 overflow-hidden bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center">
        {brand.logo_url ? (
          <img 
            src={brand.logo_url} 
            alt={brand.brand_name}
            className="max-w-[80%] max-h-[80%] object-contain"
          />
        ) : (
          <Building2 className="h-12 w-12 text-muted-foreground" />
        )}
        {brand.verified && (
          <div className="absolute top-3 right-3">
            <Badge variant="default" className="shadow-lg gap-1">
              <CheckCircle2 className="h-3 w-3" />
              Verified
            </Badge>
          </div>
        )}
      </div>
      
      <div className="p-4">
        <h3 className="font-semibold text-foreground line-clamp-1 mb-1">{brand.brand_name}</h3>
        <p className="text-sm text-muted-foreground line-clamp-1 mb-3">{brand.company_name}</p>
        
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          <Badge variant="secondary" className="text-xs">
            {brand.industry}
          </Badge>
          <Badge variant="outline" className="text-xs">
            {getBudgetLabel(brand.budget_range)}
          </Badge>
        </div>
        
        {brand.contact?.location && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground mb-2">
            <MapPin className="h-3 w-3" />
            <span className="line-clamp-1">{brand.contact.location}</span>
          </div>
        )}
        
        {brand.description && (
          <p className="text-xs text-muted-foreground line-clamp-2">
            {brand.description}
          </p>
        )}
      </div>
    </div>
  );
};
