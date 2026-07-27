import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Sparkles, Camera, Home } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import {
  getOrCreatePopupSession,
  recordPopupEvent,
  setPopupCtaUserType,
} from "@/lib/popupTracking";

const STORAGE_KEY = "hf_signup_popup_dismissed_at";
const SUPPRESS_DAYS = 7;
const SCROLL_TRIGGER_PCT = 0.4;

const isSuppressed = () => {
  try {
    const ts = localStorage.getItem(STORAGE_KEY);
    if (!ts) return false;
    const ageMs = Date.now() - Number(ts);
    return ageMs < SUPPRESS_DAYS * 24 * 60 * 60 * 1000;
  } catch {
    return false;
  }
};

const markDismissed = () => {
  try {
    localStorage.setItem(STORAGE_KEY, String(Date.now()));
  } catch {
    /* ignore */
  }
};

const track = (event: string, params?: Record<string, unknown>) => {
  try {
    const w = window as unknown as { gtag?: (...args: unknown[]) => void };
    w.gtag?.("event", event, params ?? {});
  } catch {
    /* ignore */
  }
};

export const ScrollSignupPopup = () => {
  const { user, isReady } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [hasShown, setHasShown] = useState(false);
  const closingViaCtaRef = useRef(false);

  useEffect(() => {
    if (!isReady || user || hasShown || isSuppressed()) return;

    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const scrolled = window.scrollY + window.innerHeight;
        const total = document.documentElement.scrollHeight;
        if (total > 0 && scrolled / total >= SCROLL_TRIGGER_PCT) {
          setOpen(true);
          setHasShown(true);
          track("signup_popup_shown");
          getOrCreatePopupSession();
          recordPopupEvent("shown");
          window.removeEventListener("scroll", onScroll);
        }
        ticking = false;
      });
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [isReady, user, hasShown]);

  const handleOpenChange = (next: boolean) => {
    if (next === open) return;
    if (!next) {
      if (closingViaCtaRef.current) {
        closingViaCtaRef.current = false;
      } else {
        markDismissed();
        track("signup_popup_dismissed");
        recordPopupEvent("dismissed");
      }
    }
    setOpen(next);
  };

  const handleCTA = (userType: "creator" | "host") => {
    markDismissed();
    track("signup_popup_cta_clicked", { user_type: userType });
    setPopupCtaUserType(userType);
    recordPopupEvent("cta_clicked", { ctaUserType: userType });
    closingViaCtaRef.current = true;
    setOpen(false);
    navigate(`/auth?type=${userType === "creator" ? "influencer" : "host"}`);
  };

  if (!isReady || user) return null;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <Sparkles className="w-6 h-6 text-primary" />
          </div>
          <DialogTitle className="text-2xl text-center">
            Join 10,000+ creators &amp; hosts collaborating
          </DialogTitle>
          <DialogDescription className="text-center text-base pt-2">
            Free stays for creators. 50+ pieces of UGC content for hosts &amp; brands. Sign up free in under a minute.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          <Button
            size="lg"
            className="w-full bg-brand-green hover:bg-brand-green/90 text-white"
            onClick={() => handleCTA("creator")}
          >
            <Camera className="w-4 h-4" />
            I'm a Creator
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="w-full border-brand-green text-brand-green hover:bg-brand-green hover:text-white"
            onClick={() => handleCTA("host")}
          >
            <Home className="w-4 h-4" />
            I'm a Host / Brand
          </Button>
        </div>

        <Button
          variant="ghost"
          className="w-full"
          onClick={() => handleOpenChange(false)}
        >
          Maybe later
        </Button>

        <p className="text-xs text-center text-muted-foreground">
          ⭐ 4.9/5 creator rating · 100+ active creators
        </p>
      </DialogContent>
    </Dialog>
  );
};

export default ScrollSignupPopup;