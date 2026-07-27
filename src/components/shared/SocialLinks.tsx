import { Button } from "@/components/ui/button";
import { Instagram, Youtube, Twitter } from "lucide-react";

interface SocialLinksProps {
  instagramUrl?: string;
  youtubeUrl?: string;
  twitterUrl?: string;
  tiktokUrl?: string;
  size?: "sm" | "default" | "lg";
  variant?: "ghost" | "outline" | "default";
  className?: string;
}
const TikTokIcon = () => (
  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
    <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.18 8.18 0 004.79 1.52V6.75a4.85 4.85 0 01-1.02-.06z" />
  </svg>
);
const SocialLinks = ({
  instagramUrl,
  youtubeUrl,
  twitterUrl,
  tiktokUrl,
  size = "sm",
  variant = "ghost",
  className = "",
}: SocialLinksProps) => {
  const hasAnySocial = instagramUrl || youtubeUrl || twitterUrl || tiktokUrl;

  if (!hasAnySocial) return null;

  return (
    <div className={`flex gap-2 ${className}`}>
      {instagramUrl && (
        <Button
          variant={variant}
          size={size}
          className="h-8 w-8 p-0"
          onClick={(e) => {
            e.stopPropagation();
            window.open(instagramUrl, "_blank");
          }}
        >
          <Instagram className="h-4 w-4" />
        </Button>
      )}
      {tiktokUrl && (
        <Button
          variant={variant}
          size={size}
          className="h-8 w-8 p-0"
          onClick={(e) => {
            e.stopPropagation();
            window.open(tiktokUrl, "_blank");
          }}
        >
          <TikTokIcon />
        </Button>
      )}
      {youtubeUrl && (
        <Button
          variant={variant}
          size={size}
          className="h-8 w-8 p-0"
          onClick={(e) => {
            e.stopPropagation();
            window.open(youtubeUrl, "_blank");
          }}
        >
          <Youtube className="h-4 w-4" />
        </Button>
      )}
      {twitterUrl && (
        <Button
          variant={variant}
          size={size}
          className="h-8 w-8 p-0"
          onClick={(e) => {
            e.stopPropagation();
            window.open(twitterUrl, "_blank");
          }}
        >
          <Twitter className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
};

export default SocialLinks;
