import { useEffect, useState } from "react";
import { Camera } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { PillChip, SquircleIcon, LiveDot } from "@/components/landing/editorial/primitives";
import { formatFollowerCount, useFeaturedCreators } from "@/hooks/useFeaturedCreators";

const ROTATION_MS = 10_000;

// Hard-coded rotation order for the /for-creators hero.
const FEATURED_IDS = [
  "b6e9d432-2921-47f0-b38b-6c0df1f07946", // Azaria Mckinnon
  "1f84673c-f765-4136-9956-7c7e7c97ce5e", // Will & Joe Burns
  "f426e93e-a497-4dbd-9802-fa8c1ed27f24", // Jaden Versluis
  "e53747b8-73bb-4005-90b1-9734710b7d8b", // Nicole Botha
];

const useHeroFeaturedCreators = () => {
  const { creators: all, loading } = useFeaturedCreators();
  const ordered = FEATURED_IDS
    .map((id) => all.find((c) => c.id === id))
    .filter((c): c is NonNullable<typeof c> => Boolean(c));
  const creators = ordered.length > 0 ? ordered : all;
  return { creators, loading };
};

const FeaturedCreatorRotator = () => {
  const { creators, loading } = useHeroFeaturedCreators();
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused || creators.length <= 1) return;
    const id = setInterval(() => {
      setIndex((prev) => (prev + 1) % creators.length);
    }, ROTATION_MS);
    return () => clearInterval(id);
  }, [paused, creators.length]);

  // Fallback: empty / loading
  if (loading || creators.length === 0) {
    return (
      <div className="relative">
        <div className="aspect-square rounded-3xl border border-border bg-card flex items-center justify-center">
          <SquircleIcon size="lg">
            <Camera className="w-7 h-7" />
          </SquircleIcon>
        </div>
      </div>
    );
  }

  const current = creators[index];
  const handleClick = () => {
    if (current.instagramUrl) {
      window.open(current.instagramUrl, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <div
      className="relative"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <button
        type="button"
        onClick={handleClick}
        className="block w-full aspect-square rounded-3xl border border-border bg-card overflow-hidden relative group cursor-pointer"
        aria-label={`View creator ${current.name}`}
      >
        <AnimatePresence mode="wait">
          <motion.img
            key={current.id}
            src={current.photo}
            alt={current.name}
            initial={{ opacity: 0, scale: 1.02 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="absolute inset-0 w-full h-full object-cover"
            loading="eager"
          />
        </AnimatePresence>
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/30 via-transparent to-transparent pointer-events-none" />
      </button>

      {/* Floating Pills */}
      <div className="absolute -top-3 -right-3 pointer-events-none">
        <PillChip variant="white">
          <LiveDot />
          {formatFollowerCount(current.followers)} followers
        </PillChip>
      </div>

      <div className="absolute -bottom-3 -left-3 pointer-events-none max-w-[85%]">
        <PillChip variant="white">
          <Camera className="w-3.5 h-3.5 text-brand-green shrink-0" />
          <span className="truncate">
            {current.name}
            {current.location ? ` · ${current.location}` : ""}
          </span>
        </PillChip>
      </div>
    </div>
  );
};

export default FeaturedCreatorRotator;
