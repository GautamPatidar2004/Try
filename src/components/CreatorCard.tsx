import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Star, MapPin, Instagram, Check, TrendingUp, MessageCircle, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { CreatorPortfolioModal } from "./marketplace/portfolio/CreatorPortfolioModal";
import { PortfolioCreator } from "./marketplace/portfolio/types";
import StartConversationModal from "./marketplace/StartConversationModal";
import MatchBadge from "./ai-matching/MatchBadge";
import SocialLinks from "./shared/SocialLinks";
import { formatFollowers, extractCity } from "@/utils/formatters";
import { VerificationBadge } from "@/components/badges/VerificationBadge";
import { supabase } from "@/integrations/supabase/client";
import { useProductAnalytics } from "@/hooks/useProductAnalytics";
import { motion } from "framer-motion";

interface CreatorCardProps {
  creator: {
    id: string;
    name: string;
    avatar?: string;
    location: string;
    followers: number;
    rating: number;
    specialties: string[];
    priceRange?: string;
    instagramUrl?: string;
    tiktokUrl?: string;
    youtubeUrl?: string;
    twitterUrl?: string;
    verified?: boolean;
    engagementRate?: number;
    accountTier?: string;
  };
  matchScore?: number;
  matchReasons?: string[];
  aiRecommendation?: string;
  showMatch?: boolean;
  propertyTitle?: string;
  isDemoMode?: boolean;
  autoOpenPortfolio?: boolean;
  hasVerifiedBadge?:boolean;
  onPortfolioClose?: () => void;
}

const CreatorCard = ({ 
  creator, 
  matchScore, 
  matchReasons, 
  aiRecommendation,
  showMatch = false,
  propertyTitle,
  isDemoMode = false,
  autoOpenPortfolio = false,
  hasVerifiedBadge,
  onPortfolioClose,
}: CreatorCardProps) => {
  const navigate = useNavigate();
  const [showPortfolioModal, setShowPortfolioModal] = useState(false);
  const [showMessageModal, setShowMessageModal] = useState(false);
  // const [hasVerifiedBadge, setHasVerifiedBadge] = useState(false);
  const { trackCreatorProfileView } = useProductAnalytics();
  const viewTrackedRef = useRef(false);
  
  const handleOpenPortfolio = useCallback(() => {
    if (isDemoMode) {
      navigate('/auth');
      return;
    }
    if (!viewTrackedRef.current) {
      trackCreatorProfileView({ creator_id: creator.id });
      viewTrackedRef.current = true;
    }
    setShowPortfolioModal(true);
  }, [creator.id, trackCreatorProfileView, isDemoMode, navigate]);

  // Deep-link: auto-open portfolio when arriving via /creator/:creatorId
  useEffect(() => {
    if (autoOpenPortfolio && !isDemoMode) {
      setShowPortfolioModal(true);
    }
  }, [autoOpenPortfolio, isDemoMode]);

  // useEffect(() => {
  //   if (isDemoMode) return;
  //   const checkCreatorSubscription = async () => {
  //     try {
  //       if (creator.verified) {
  //         setHasVerifiedBadge(true);
  //         return;
  //       }
  //       const { data: subscription } = await supabase
  //         .from('subscriptions')
  //         .select(`status, subscription_plans!inner (has_verified_badge)`)
  //         .eq('influencer_id', creator.id)
  //         .eq('status', 'active')
  //         .maybeSingle();
  //       if (subscription?.subscription_plans?.has_verified_badge) {
  //         setHasVerifiedBadge(true);
  //       }
  //     } catch {
  //       setHasVerifiedBadge(false);
  //     }
  //   };
  //   checkCreatorSubscription();
  // }, [creator.id, creator.verified, isDemoMode]);

  const portfolioCreator: PortfolioCreator = {
    id: creator.id,
    name: creator.name,
    handle: creator.name.toLowerCase().replace(/\s+/g, ''),
    avatar: creator.avatar || '',
    location: creator.location,
    bio: `Food and lifestyle creator based in ${creator.location}. Specializing in ${creator.specialties?.slice(0, 2).join(' & ')}.`,
    niches: creator.specialties || [],
    platforms: {
      instagram: creator.instagramUrl ? {
        username: creator.instagramUrl.split('/').pop() || '',
        followers: Math.floor(creator.followers * 0.6),
        verified: true
      } : undefined,
      tiktok: creator.tiktokUrl ? {
        username: creator.tiktokUrl.split('/').pop() || '',
        followers: Math.floor(creator.followers * 0.4),
        verified: true
      } : undefined
    }
  };

  const getEngagementColor = (rate?: number) => {
    if (!rate) return "text-muted-foreground bg-white/5 border-white/10";
    if (rate >= 5) return "text-emerald-300 bg-emerald-500/10 border-emerald-500/20 shadow-[0_0_12px_rgba(16,185,129,0.15)]";
    if (rate >= 2) return "text-amber-300 bg-amber-500/10 border-amber-500/20";
    return "text-muted-foreground bg-white/5 border-white/10";
  };

  const isPremium = creator.accountTier === 'premium' || creator.accountTier === 'enterprise';
  const engagementRate = creator.engagementRate || 0;
  const hasEngagementData = engagementRate > 0;

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.97 }}
        whileInView={{ opacity: 1, y: 0, scale: 1 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        whileHover={{ y: -6, transition: { duration: 0.25 } }}
        className={`group relative h-full flex flex-col rounded-2xl overflow-hidden
          backdrop-blur-xl bg-white/[0.08] dark:bg-white/[0.06]
          border border-white/[0.15] dark:border-white/[0.1]
          shadow-[0_8px_32px_rgba(0,0,0,0.12)]
          hover:shadow-[0_16px_48px_rgba(34,197,94,0.15)] hover:border-green-500/20
          transition-all duration-300
          ${showMatch && matchScore && matchScore >= 90 ? 'ring-2 ring-primary/60 shadow-[0_0_24px_rgba(var(--primary),0.15)]' : ''}
        `}
      >
        {/* Premium Glass Badge */}
        {isPremium && (
          <div className="absolute top-3 right-3 z-10">
            <div className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider
              bg-gradient-to-r from-primary/80 to-purple-500/80 text-white
              backdrop-blur-sm border border-white/20
              shadow-[0_0_16px_rgba(var(--primary),0.3)]
              animate-pulse">
              Premium
            </div>
          </div>
        )}

        <div className="p-6 pb-4 flex-1 flex flex-col">
          {/* Match Badge */}
          {showMatch && matchScore !== undefined && (
            <div className="mb-3">
              <MatchBadge score={matchScore} />
            </div>
          )}
          
          {/* Avatar + Info */}
          <div className="flex items-start gap-4 mb-4">
            <div className={`relative p-[2px] rounded-full
              bg-gradient-to-br from-primary via-purple-500 to-pink-500
              ${isPremium ? 'animate-[spin_4s_linear_infinite]' : ''}
            `}>
              <div className="p-[2px] rounded-full bg-background/80 backdrop-blur-sm">
                <Avatar className="h-[72px] w-[72px] shadow-lg">
                  <AvatarImage src={creator.avatar} alt={creator.name} />
                  <AvatarFallback className="bg-gradient-to-br from-primary/30 to-purple-500/20 text-primary text-lg font-bold backdrop-blur-sm">
                    {creator.name.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </div>
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 mb-1">
                <h3 className="font-bold text-lg truncate text-foreground">{creator.name}</h3>
                {hasVerifiedBadge && <VerificationBadge size="sm" />}
              </div>
              <p className="text-sm text-muted-foreground flex items-center gap-1 mb-2">
                <MapPin className="h-3.5 w-3.5" />
                {extractCity(creator.location)}
              </p>
              
              {/* Stats as glass pills */}
              <div className="flex items-center gap-2 text-sm">
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full
                  bg-white/10 backdrop-blur-sm border border-white/15 font-semibold text-foreground">
                  <Instagram className="h-3.5 w-3.5" />
                  {formatFollowers(creator.followers)}
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full
                  bg-white/10 backdrop-blur-sm border border-white/15 font-medium">
                  <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                  {creator.rating.toFixed(1)}
                </span>
              </div>
            </div>
          </div>

          {/* Engagement Rate */}
          <div className="flex items-center justify-between mb-3">
            <Badge 
              variant="outline" 
              className={`${getEngagementColor(hasEngagementData ? engagementRate : undefined)} 
                flex items-center gap-1.5 px-2.5 py-1 font-medium rounded-full
                backdrop-blur-sm border`}
            >
              <TrendingUp className="h-3.5 w-3.5" />
              <span>{hasEngagementData ? `${engagementRate.toFixed(1)}% engagement` : 'Engagement N/A'}</span>
            </Badge>
            {creator.priceRange && (
              <span className="text-sm font-semibold text-primary">{creator.priceRange}</span>
            )}
          </div>

          {/* Specialties as glass pills */}
          {creator.specialties && creator.specialties.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-4">
              {creator.specialties.slice(0, 3).map((specialty, index) => (
                <span 
                  key={index} 
                  className="text-xs font-medium px-2.5 py-1 rounded-full
                    bg-white/10 backdrop-blur-sm border border-white/20 text-foreground/80
                    hover:bg-white/20 hover:border-white/30 transition-colors cursor-default"
                >
                  {specialty}
                </span>
              ))}
              {creator.specialties.length > 3 && (
                <span className="text-xs px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-muted-foreground">
                  +{creator.specialties.length - 3} more
                </span>
              )}
            </div>
          )}

          {/* Match Reasons */}
          {showMatch && propertyTitle && matchReasons && (
            <div className="mt-auto p-3 rounded-xl
              bg-primary/[0.08] backdrop-blur-sm border border-primary/20
              shadow-[inset_0_0_16px_rgba(var(--primary),0.05)]">
              <p className="text-sm font-semibold text-primary mb-2">
                Perfect for: {propertyTitle}
              </p>
              <div className="space-y-1">
                {matchReasons.slice(0, 2).map((reason, index) => (
                  <div key={index} className="flex items-start gap-2 text-xs text-foreground/80">
                    <Check className="h-3.5 w-3.5 text-primary mt-0.5 flex-shrink-0" />
                    <span>{reason}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Social Links Footer */}
        <div className="px-6 py-3 mt-auto border-t border-white/10 bg-white/[0.03]">
          <SocialLinks
            instagramUrl={creator.instagramUrl}
            tiktokUrl={creator.tiktokUrl}
            youtubeUrl={creator.youtubeUrl}
            twitterUrl={creator.twitterUrl}
            size="sm"
            variant="ghost"
          />
        </div>

        {/* Hover Overlay — excludes the social footer so its links remain clickable */}
        <div className="absolute inset-x-0 top-0 bottom-[56px] flex items-center justify-center
          opacity-0 group-hover:opacity-100 transition-all duration-300
          bg-black/50 dark:bg-black/60
          pointer-events-none group-hover:pointer-events-auto rounded-t-2xl">
          <div className="flex gap-3">
            <Button
              onClick={handleOpenPortfolio}
              size="sm"
              className="shadow-xl backdrop-blur-sm bg-primary/90 hover:bg-primary border border-white/20
                hover:shadow-[0_0_20px_rgba(var(--primary),0.4)] transition-all"
            >
              Quick View
            </Button>
            <Button
              onClick={() => {
                if (isDemoMode) {
                  navigate('/auth');
                  return;
                }
                setShowMessageModal(true);
              }}
              variant="secondary"
              size="sm"
              className="shadow-xl backdrop-blur-sm bg-white/15 hover:bg-white/25 border border-white/20
                text-foreground transition-all"
            >
              <Heart className="h-4 w-4 mr-1" />
              Save
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Modals */}
      <CreatorPortfolioModal
        isOpen={showPortfolioModal}
        onClose={() => {
          setShowPortfolioModal(false);
          onPortfolioClose?.();
        }}
        creator={portfolioCreator}
        isDemoMode={isDemoMode}
      />

      <StartConversationModal
        isOpen={showMessageModal}
        onClose={() => setShowMessageModal(false)}
        creator={{
          ...creator,
          avatar: creator.avatar || '',
          recentWork: [],
          priceRange: creator.priceRange || '',
          userId: creator.id
        }}
      />
    </>
  );
};

export default CreatorCard;
