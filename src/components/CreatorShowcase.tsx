import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight, MapPin, Users } from "lucide-react";
import useEmblaCarousel from "embla-carousel-react";
import { useCallback } from "react";
import { motion } from "framer-motion";
import { useFeaturedCreators, formatFollowerCount } from "@/hooks/useFeaturedCreators";

const handleFromInstagram = (url: string | null, fallback: string): string => {
  if (!url) return `@${fallback.toLowerCase().replace(/\s+/g, "")}`;
  const match = url.match(/instagram\.com\/([^/?#]+)/i);
  return match ? `@${match[1]}` : `@${fallback.toLowerCase().replace(/\s+/g, "")}`;
};

const CreatorShowcase = () => {
  const navigate = useNavigate();
  const { creators, loading } = useFeaturedCreators();
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "start",
    loop: true,
    skipSnaps: false,
  });

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  if (!loading && creators.length === 0) return null;

  return (
    <section className="py-20 bg-gradient-to-br from-background via-muted/30 to-background">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center rounded-full border border-brand-green/20 bg-brand-green/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-brand-green mb-3">
            Inspiration
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-foreground">
            You could be one of <em className="text-brand-green not-italic md:italic">them</em>
          </h2>
        </motion.div>

        <div className="relative">
          <Button
            variant="outline"
            size="icon"
            onClick={scrollPrev}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 rounded-full h-12 w-12 bg-background/80 backdrop-blur-sm border-2 hover:bg-background hover:scale-110 transition-all"
            aria-label="Previous creators"
          >
            <ChevronLeft className="h-6 w-6" />
          </Button>

          <Button
            variant="outline"
            size="icon"
            onClick={scrollNext}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 rounded-full h-12 w-12 bg-background/80 backdrop-blur-sm border-2 hover:bg-background hover:scale-110 transition-all"
            aria-label="Next creators"
          >
            <ChevronRight className="h-6 w-6" />
          </Button>

          <div className="overflow-hidden" ref={emblaRef}>
            <div className="flex gap-6">
              {loading
                ? Array.from({ length: 3 }).map((_, i) => (
                    <div
                      key={i}
                      className="flex-[0_0_100%] md:flex-[0_0_calc(50%-12px)] lg:flex-[0_0_calc(33.333%-16px)] min-w-0"
                    >
                      <Card className="p-6 border-2 rounded-2xl h-full">
                        <Skeleton className="aspect-square w-full rounded-xl mb-4" />
                        <Skeleton className="h-6 w-2/3 mb-2" />
                        <Skeleton className="h-4 w-1/2 mb-4" />
                        <Skeleton className="h-8 w-24 mb-4" />
                        <Skeleton className="h-16 w-full" />
                      </Card>
                    </div>
                  ))
                : creators.map((creator, index) => {
                    const handle = handleFromInstagram(creator.instagramUrl, creator.name);
                    const onClick = () => {
                      if (creator.instagramUrl) {
                        window.open(creator.instagramUrl, "_blank", "noopener,noreferrer");
                      } else {
                        navigate("/marketplace");
                      }
                    };
                    return (
                      <motion.div
                        key={creator.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: Math.min(index, 5) * 0.08 }}
                        className="flex-[0_0_100%] md:flex-[0_0_calc(50%-12px)] lg:flex-[0_0_calc(33.333%-16px)] min-w-0"
                      >
                        <Card
                          onClick={onClick}
                          className="p-6 border-2 rounded-2xl hover:shadow-lg transition-all duration-300 hover:scale-[1.02] bg-card h-full cursor-pointer"
                        >
                          <div className="aspect-square rounded-xl overflow-hidden mb-4 bg-muted">
                            <img
                              src={creator.photo}
                              alt={creator.name}
                              loading="lazy"
                              className="w-full h-full object-cover"
                            />
                          </div>

                          <div className="mb-3">
                            <h3 className="text-xl font-bold text-foreground mb-1 truncate">
                              {creator.name}
                            </h3>
                            <p className="text-sm text-muted-foreground truncate">{handle}</p>
                            {creator.location && (
                              <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                                <MapPin className="h-3 w-3 shrink-0" />
                                <span className="truncate">{creator.location}</span>
                              </p>
                            )}
                          </div>

                          {creator.niches?.[0] && (
                            <Badge className="mb-4 bg-brand-green/10 text-brand-green border border-brand-green/20 hover:bg-brand-green/15">
                              {creator.niches[0]}
                            </Badge>
                          )}

                          <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                            <div className="text-center">
                              <p className="text-lg font-bold text-foreground flex items-center justify-center gap-1">
                                <Users className="h-4 w-4 text-brand-green" />
                                {formatFollowerCount(creator.followers)}
                              </p>
                              <p className="text-xs text-muted-foreground">Followers</p>
                            </div>
                            <div className="text-center border-l">
                              <p className="text-lg font-bold text-foreground">
                                {creator.niches?.length || 0}
                              </p>
                              <p className="text-xs text-muted-foreground">Niches</p>
                            </div>
                          </div>
                        </Card>
                      </motion.div>
                    );
                  })}
            </div>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="text-center mt-12"
        >
          <Button
            variant="outline"
            size="lg"
            onClick={() => navigate("/auth")}
            className="text-lg px-8 py-6 border-2 hover:bg-brand-green hover:text-white hover:border-brand-green transition-all duration-300"
          >
            I want to be like them
          </Button>
        </motion.div>
      </div>
    </section>
  );
};

export default CreatorShowcase;
