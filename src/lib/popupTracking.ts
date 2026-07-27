import { supabase } from "@/integrations/supabase/client";

const SESSION_KEY = "hf_popup_session_id";
const SESSION_TYPE_KEY = "hf_popup_cta_user_type";
const SESSION_TS_KEY = "hf_popup_session_ts";
const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

export type PopupEventType =
  | "shown"
  | "dismissed"
  | "cta_clicked"
  | "auth_landed"
  | "signup_completed"
  | "onboarding_completed";

const uuid = () => {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `pop_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
};

export const getOrCreatePopupSession = (): string => {
  try {
    const existing = localStorage.getItem(SESSION_KEY);
    const ts = Number(localStorage.getItem(SESSION_TS_KEY) || 0);
    if (existing && Date.now() - ts < SESSION_TTL_MS) return existing;
    const id = uuid();
    localStorage.setItem(SESSION_KEY, id);
    localStorage.setItem(SESSION_TS_KEY, String(Date.now()));
    return id;
  } catch {
    return uuid();
  }
};

export const getPopupSession = (): string | null => {
  try {
    const id = localStorage.getItem(SESSION_KEY);
    const ts = Number(localStorage.getItem(SESSION_TS_KEY) || 0);
    if (!id || Date.now() - ts > SESSION_TTL_MS) return null;
    return id;
  } catch {
    return null;
  }
};

export const setPopupCtaUserType = (t: "creator" | "host") => {
  try {
    localStorage.setItem(SESSION_TYPE_KEY, t);
  } catch {
    /* ignore */
  }
};

export const getPopupCtaUserType = (): "creator" | "host" | null => {
  try {
    const v = localStorage.getItem(SESSION_TYPE_KEY);
    return v === "creator" || v === "host" ? v : null;
  } catch {
    return null;
  }
};

export const clearPopupSession = () => {
  try {
    localStorage.removeItem(SESSION_KEY);
    localStorage.removeItem(SESSION_TS_KEY);
    localStorage.removeItem(SESSION_TYPE_KEY);
  } catch {
    /* ignore */
  }
};

export const recordPopupEvent = async (
  event_type: PopupEventType,
  opts: {
    sessionId?: string;
    ctaUserType?: "creator" | "host" | null;
    userId?: string | null;
    metadata?: Record<string, unknown>;
  } = {}
) => {
  try {
    const session_id = opts.sessionId ?? getPopupSession();
    if (!session_id) return;
    await supabase.from("popup_events").insert([{
      event_type,
      popup_name: "scroll_signup",
      session_id,
      cta_user_type: opts.ctaUserType ?? getPopupCtaUserType() ?? undefined,
      user_id: opts.userId ?? undefined,
      path: typeof window !== "undefined" ? window.location.pathname : undefined,
      referrer: typeof document !== "undefined" ? document.referrer || undefined : undefined,
      user_agent: typeof navigator !== "undefined" ? navigator.userAgent : undefined,
      metadata: (opts.metadata ?? {}) as never,
    }]);
  } catch {
    /* swallow — analytics must never break UX */
  }
};