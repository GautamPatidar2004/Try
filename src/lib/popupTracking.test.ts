import { describe, it, expect, beforeEach, vi } from "vitest";

// popupTracking imports the Supabase client at module load; stub it so the
// module loads in jsdom without real env / network. We only test the
// localStorage-backed session helpers here.
vi.mock("@/integrations/supabase/client", () => ({ supabase: {} }));

import {
  getOrCreatePopupSession,
  getPopupSession,
  setPopupCtaUserType,
  getPopupCtaUserType,
  clearPopupSession,
} from "./popupTracking";

const SESSION_TS_KEY = "hf_popup_session_ts";
const SESSION_KEY = "hf_popup_session_id";

beforeEach(() => {
  localStorage.clear();
});

describe("getOrCreatePopupSession", () => {
  it("creates a session id on first call and reuses it within the TTL", () => {
    const a = getOrCreatePopupSession();
    expect(a).toBeTruthy();
    const b = getOrCreatePopupSession();
    expect(b).toBe(a);
  });

  it("creates a fresh id once the stored session has expired (TTL > 30 days)", () => {
    const a = getOrCreatePopupSession();
    // backdate the stored timestamp beyond the 30-day TTL
    localStorage.setItem(
      SESSION_TS_KEY,
      String(Date.now() - 31 * 24 * 60 * 60 * 1000),
    );
    const b = getOrCreatePopupSession();
    expect(b).not.toBe(a);
    expect(localStorage.getItem(SESSION_KEY)).toBe(b);
  });
});

describe("getPopupSession", () => {
  it("returns null when there is no session", () => {
    expect(getPopupSession()).toBeNull();
  });

  it("returns the active session id", () => {
    const id = getOrCreatePopupSession();
    expect(getPopupSession()).toBe(id);
  });

  it("returns null for an expired session", () => {
    getOrCreatePopupSession();
    localStorage.setItem(
      SESSION_TS_KEY,
      String(Date.now() - 31 * 24 * 60 * 60 * 1000),
    );
    expect(getPopupSession()).toBeNull();
  });
});

describe("CTA user type", () => {
  it("stores and reads back a valid type", () => {
    setPopupCtaUserType("creator");
    expect(getPopupCtaUserType()).toBe("creator");
    setPopupCtaUserType("host");
    expect(getPopupCtaUserType()).toBe("host");
  });

  it("returns null when nothing (or something invalid) is stored", () => {
    expect(getPopupCtaUserType()).toBeNull();
    localStorage.setItem("hf_popup_cta_user_type", "garbage");
    expect(getPopupCtaUserType()).toBeNull();
  });
});

describe("clearPopupSession", () => {
  it("removes the session id, timestamp and CTA type", () => {
    getOrCreatePopupSession();
    setPopupCtaUserType("creator");
    clearPopupSession();
    expect(getPopupSession()).toBeNull();
    expect(getPopupCtaUserType()).toBeNull();
  });
});
