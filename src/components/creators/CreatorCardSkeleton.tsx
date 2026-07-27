import { Skeleton } from "@/components/ui/skeleton";

/** Placeholder mirroring CreatorCard (avatar + name/location + stat pills + CTA). */
export const CreatorCardSkeleton = () => (
  <div className="h-full rounded-2xl overflow-hidden border border-border/40 bg-card/50 p-6">
    <div className="flex items-start gap-4 mb-4">
      <Skeleton className="h-[72px] w-[72px] rounded-full shrink-0" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-5 w-2/3" />
        <Skeleton className="h-4 w-1/2" />
        <div className="flex gap-2 pt-1">
          <Skeleton className="h-6 w-16 rounded-full" />
          <Skeleton className="h-6 w-16 rounded-full" />
        </div>
      </div>
    </div>
    <Skeleton className="h-4 w-full mb-2" />
    <Skeleton className="h-4 w-5/6 mb-4" />
    <Skeleton className="h-10 w-full rounded-xl" />
  </div>
);

export const CreatorGridSkeleton = ({ count = 9 }: { count?: number }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
    {Array.from({ length: count }).map((_, i) => (
      <CreatorCardSkeleton key={i} />
    ))}
  </div>
);

export default CreatorCardSkeleton;
