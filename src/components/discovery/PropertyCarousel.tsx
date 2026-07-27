import { useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { PropertyCarouselCard } from './PropertyCarouselCard';
import PropertyCard from '../PropertyCard';

interface PropertyCarouselProps {
  properties: any[];
}

export const PropertyCarousel = ({ properties }: PropertyCarouselProps) => {
  const [selectedProperty, setSelectedProperty] = useState<any>(null);

  if (!properties || properties.length === 0) return null;

  return (
    <>
      <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
        {properties.map((property) => (
          <PropertyCarouselCard
            key={property.id}
            property={property}
            onClick={() => setSelectedProperty(property)}
          />
        ))}
      </div>

      <Dialog open={!!selectedProperty} onOpenChange={() => setSelectedProperty(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {selectedProperty && (
            <PropertyCard property={selectedProperty} />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};
