import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * Placeholder that mirrors AirbnbPropertyCard / MobilePropertyCard layout
 * (4:3 image + title/meta/price lines) so the loading state matches the real
 * grid instead of a lonely full-screen spinner.
 */
export const PropertyCardSkeleton = () => (
  <Card className="overflow-hidden border-border/50">
    <Skeleton className="aspect-[4/3] w-full rounded-none" />
    <div className="p-4 space-y-3">
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-4 w-10" />
      </div>
      <Skeleton className="h-3 w-1/2" />
      <div className="flex gap-4">
        <Skeleton className="h-3 w-12" />
        <Skeleton className="h-3 w-12" />
        <Skeleton className="h-3 w-12" />
      </div>
      <Skeleton className="h-5 w-24" />
    </div>
  </Card>
);

/** A responsive grid of skeleton cards, matching the real results grid. */
export const PropertyGridSkeleton = ({ count = 9 }: { count?: number }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
    {Array.from({ length: count }).map((_, i) => (
      <PropertyCardSkeleton key={i} />
    ))}
  </div>
);

export default PropertyCardSkeleton;
